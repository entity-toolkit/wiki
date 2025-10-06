import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { STLExporter } from "three/addons/exporters/STLExporter.js";

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const MAX_BUFF = 100000;
    const X = new THREE.Vector3(1, 0, 0);
    const Y = new THREE.Vector3(0, 1, 0);
    const XYZ = new THREE.Vector3(1, 1, 1).normalize();

    const interpretHSLA = (hslStr) => {
      const [h, s, l, _] = hslStr.match(/\d+/g).map(Number);
      return [h / 360, s / 100, l / 100];
    };
    const getBGColor = () => {
      const bg = getComputedStyle(document.body).backgroundColor;
      if (bg.startsWith("#")) {
        return new THREE.Color(bg);
      } else if (bg.startsWith("hsla")) {
        return new THREE.Color().setHSL(...interpretHSLA(bg));
      } else if (bg.startsWith("rgb")) {
        return new THREE.Color(bg);
      }
    };

    const interpolate = (v1, v2, t) => {
      if (v1 instanceof THREE.Vector3 && v2 instanceof THREE.Vector3) {
        return new THREE.Vector3(
          interpolate(v1.x, v2.x, t),
          interpolate(v1.y, v2.y, t),
          interpolate(v1.z, v2.z, t),
        );
      } else {
        return v1 + t * (v2 - v1);
      }
    };
    const transform = (f, v, r, t) =>
      v.copy(interpolate(f(v), v.clone().normalize().multiplyScalar(r), t));

    const faceVertices = (sph, face, should_inset, nXY, nZ, rout, rin) => {
      const vertices = [];
      const indices = [];
      const wireframe = [];
      const drout = (2 * rout) / nXY;
      const drin = (2 * rin) / nXY;
      for (let i = 0; i < nXY; i++) {
        for (let j = 0; j < nXY; j++) {
          const is_inset = i >= nXY / 2 && j >= nXY / 2 && should_inset;
          const r = is_inset ? rin : rout;
          const dr = is_inset ? drin : drout;
          const counter = vertices.length / 3;
          let first_vertex = undefined;
          [
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1],
          ].forEach((d, di) => {
            const vi = new THREE.Vector3(
              -r + dr * (i + 0.5) + 0.5 * dr * d[0],
              -r + dr * (j + 0.5) + 0.5 * dr * d[1],
              r,
            );
            transform(face, vi, r, sph);
            vertices.push(vi.x, vi.y, vi.z);
            wireframe.push(vi.x, vi.y, vi.z);
            if (di != 0) {
              wireframe.push(vi.x, vi.y, vi.z);
              if (di === 3) {
                wireframe.push(first_vertex.x, first_vertex.y, first_vertex.z);
              }
            } else {
              first_vertex = vi;
            }
          });
          indices.push(
            counter,
            counter + 2,
            counter + 3,
            counter,
            counter + 1,
            counter + 2,
          );
        }
      }
      if (should_inset) {
        const coord = (s, r, dr, idx) =>
          s === 0 ? -r + dr * (nXY / 2) : -r + dr * (idx + 1);
        const pt = (s, r, dr, idx) =>
          new THREE.Vector3(coord(s, r, dr, idx), coord(1 - s, r, dr, idx), r);
        const diff = (pout, pin, k) =>
          pin.clone().addScaledVector(pout.clone().sub(pin), k / nZ);
        const points = (s, j) =>
          [
            [rin, drin, j],
            [rin, drin, j + 1],
            [rout, drout, j],
            [rout, drout, j + 1],
          ].map(([r, dr, idx]) => {
            const p = pt(s, r, dr, idx);
            transform(face, p, r, sph);
            return p;
          });
        for (let side = 0; side < 2; side++) {
          for (let j = nXY / 2 - 1; j < nXY - 1; j++) {
            const pts = points(side, j);
            for (let k = 0; k < nZ; k++) {
              const counter = vertices.length / 3;
              [
                diff(pts[2], pts[0], k),
                diff(pts[2], pts[0], k + 1),
                diff(pts[3], pts[1], k + 1),
                diff(pts[3], pts[1], k),
              ].forEach((p, pi) => {
                vertices.push(p.x, p.y, p.z);
                wireframe.push(p.x, p.y, p.z);
                if (pi != 0 && pi != 3) {
                  wireframe.push(p.x, p.y, p.z);
                }
              });
              const pts1 = [counter, counter + 2, counter + 1];
              const pts2 = [counter, counter + 3, counter + 2];
              if (side == 0) {
                indices.push(...pts1, ...pts2);
              } else {
                indices.push(...pts2.reverse(), ...pts1.reverse());
              }
            }
          }
        }
      }
      return { vertices, indices, wireframe };
    };

    const allocateNewGeometry = () => {
      return new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.Float32BufferAttribute(new Float32Array(MAX_BUFF * 3), 3),
      );
    };

    const updateMeshGeometry = ({ vertices, indices }, geometry) => {
      geometry.getAttribute("position").set(vertices, 0).needsUpdate = true;
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      geometry.setDrawRange(0, indices.length);
      return geometry;
    };

    const updateWireframeGeometry = (vertices, geometry) => {
      geometry.getAttribute("position").set(vertices, 0).needsUpdate = true;
      geometry.setDrawRange(0, vertices.length / 3);
      return geometry;
    };

    class CubedSphere {
      static face_transforms = {
        FRONT: (v) => v.applyAxisAngle(X, 0),
        BACK: (v) => v.applyAxisAngle(X, Math.PI),
        BOTTOM: (v) => v.applyAxisAngle(X, 0.5 * Math.PI),
        TOP: (v) => v.applyAxisAngle(XYZ, (-2 * Math.PI) / 3),
        RIGHT: (v) => v.applyAxisAngle(XYZ, (2 * Math.PI) / 3),
        LEFT: (v) => v.applyAxisAngle(Y, -0.5 * Math.PI),
      };

      constructor(rmax, rmin2rmax, resolution) {
        this._resolution = resolution;
        this._rmax = rmax;
        this._rmin2rmax = rmin2rmax;
        this._sphericity = 1.0;

        this._mesh = undefined;
        this._wireframe = undefined;

        const vert = this.rebuildVertices();
        this._mesh = new THREE.Mesh(
          updateMeshGeometry(vert.mesh, allocateNewGeometry()),
          new THREE.MeshStandardMaterial({
            color: 0x0057e6,
          }),
        );

        this._wireframe = new THREE.LineSegments(
          updateWireframeGeometry(vert.wireframe, allocateNewGeometry()),
          new THREE.LineBasicMaterial({
            color: 0xffffff,
          }),
        );
      }

      // setters
      set rmin2rmax(r) {
        this._rmin2rmax = r;
      }

      set azimuthal_res(res) {
        this._resolution["azimuthal"] = res;
      }

      set radial_res(res) {
        this._resolution["radial"] = res;
      }

      set sphericity(sph) {
        this._sphericity = sph;
      }

      rebuildVertices() {
        return Object.keys(CubedSphere.face_transforms)
          .map((f) =>
            faceVertices(
              this.sphericity,
              CubedSphere.face_transforms[f],
              f === "FRONT" || f === "TOP" || f === "RIGHT",
              2 * this.resolution["azimuthal"],
              this.resolution["radial"],
              this.rmax,
              this.rmax * this.rmin2rmax,
            ),
          )
          .reduce(
            (acc, fc) => {
              acc.agg.mesh.vertices.push(...fc.vertices);
              acc.agg.wireframe.push(...fc.wireframe);
              fc.indices.forEach((i) =>
                acc.agg.mesh.indices.push(i + acc.offset),
              );
              acc.offset += fc.vertices.length / 3;
              return acc;
            },
            {
              agg: { mesh: { vertices: [], indices: [] }, wireframe: [] },
              offset: 0,
            },
          ).agg;
      }

      rebuildGeometries(vertices) {
        updateMeshGeometry(vertices.mesh, this._mesh.geometry);
        updateWireframeGeometry(vertices.wireframe, this._wireframe.geometry);
      }

      rebuild() {
        this.rebuildGeometries(this.rebuildVertices());
      }

      // getters
      get resolution() {
        return this._resolution;
      }

      get rmax() {
        return this._rmax;
      }

      get rmin2rmax() {
        return this._rmin2rmax;
      }

      get azimuthal_res() {
        return this.resolution["azimuthal"];
      }

      get radial_res() {
        return this.resolution["radial"];
      }

      get sphericity() {
        return this._sphericity;
      }

      get mesh() {
        return this._mesh;
      }

      get wireframe() {
        return this._wireframe;
      }
    }

    // renderer
    const container = document.getElementById("three-cubed-sphere");
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    const exporter = new STLExporter();

    // stats
    const stats = Stats();

    // scene
    const scene = new THREE.Scene();
    let fog = new THREE.Fog(getBGColor().getHex(), 5, 35);
    scene.fog = fog;

    // camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      2000,
    );
    camera.position.x = 1.2 * 15;
    camera.position.z = 1.2 * 10;
    camera.position.y = 1.2 * 8;

    // resize
    const onWindowResize = () => {
      const width = document.getElementsByTagName("article")[0].offsetWidth;
      const height = width;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.render(scene, camera);
    };
    onWindowResize();

    // orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // lights
    scene.add(new THREE.AmbientLight(0x000000));

    const addLight = (color, intensity, position) => {
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(...position);
      scene.add(light);
    };

    addLight(0xffffff, 3, [0, 200, 0]);
    addLight(0xffffff, 3, [100, 200, 100]);
    addLight(0xffffff, 3, [-100, -200, -100]);

    // adding geometries
    const cubed_sphere = new CubedSphere(10.0, 0.5, {
      azimuthal: 5,
      radial: 5,
    });
    scene.add(cubed_sphere.mesh);
    scene.add(cubed_sphere.wireframe);

    // UI
    const set = {
      fog: true,
      stats: false,
      screenshot: {
        take: false,
        trigger: () => {
          set.screenshot.take = true;
        },
        callback: () => {
          camera.updateProjectionMatrix();
          renderer.setSize(
            2 * container.clientWidth,
            2 * container.clientHeight,
          );
          renderer.render(scene, camera, null, false);
          const DataURI = renderer.domElement.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = DataURI;
          a.download = "cubed_sphere.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          onWindowResize();
        },
      },
    };
    cubed_sphere.mesh.visible = false;

    const gui = new GUI({ autoPlace: false, container });
    gui.domElement.classList.add("align-top", "align-right");

    gui.add(controls, "autoRotate").name("Auto rotate");
    gui
      .add(set, "fog")
      .name("Fog")
      .onChange((v) => {
        scene.fog = v ? fog : null;
      });
    gui
      .add(set, "stats")
      .name("Stats")
      .onChange((v) => {
        v
          ? document.body.appendChild(stats.dom)
          : document.body.removeChild(stats.dom);
      });
    gui.add(set.screenshot, "trigger").name("Save as png");
    gui
      .add(
        {
          exportSTL: () => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(
              new Blob([exporter.parse(cubed_sphere.mesh, { binary: true })], {
                type: "application/octet-stream",
              }),
            );
            a.download = "cubed_sphere.stl";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          },
        },
        "exportSTL",
      )
      .name("Export STL");

    const cs_ctrl = gui.addFolder("Cubed Sphere");
    cs_ctrl
      .add(cubed_sphere.mesh, "visible")
      .name("Mesh")
      .onChange((v) => {
        cubed_sphere.mesh.visible = v;
        mesh_col_ctr.show(v);
      });
    const mesh_col_ctr = cs_ctrl
      .addColor(cubed_sphere.mesh.material, "color")
      .name("Mesh color")
      .show(cubed_sphere.mesh.visible);

    cs_ctrl
      .add(cubed_sphere.wireframe, "visible")
      .name("Wireframe")
      .onChange((v) => {
        cubed_sphere.wireframe.visible = v;
        wire_col_ctr.show(v);
      });
    const wire_col_ctr = cs_ctrl
      .addColor(cubed_sphere.wireframe.material, "color")
      .name("Wireframe color")
      .show(cubed_sphere.wireframe.visible);

    cs_ctrl
      .add(cubed_sphere, "rmin2rmax", 0.1, 1.25)
      .step(0.01)
      .name("R_min / R_max")
      .onChange((v) => {
        cubed_sphere.rmin2rmax = v;
        cubed_sphere.rebuild();
      });
    cs_ctrl
      .add(cubed_sphere, "azimuthal_res", 1, 20)
      .step(1)
      .name("nX1, nX2 (x0.5)")
      .onChange((v) => {
        cubed_sphere.azimuthal_res = v;
        cubed_sphere.rebuild();
      });
    cs_ctrl
      .add(cubed_sphere, "radial_res", 1, 20)
      .step(1)
      .name("nX3")
      .onChange((v) => {
        cubed_sphere.radial_res = v;
        cubed_sphere.rebuild();
      });
    cs_ctrl
      .add(cubed_sphere, "sphericity", 0, 1)
      .step(0.01)
      .name("Inflation")
      .onChange((v) => {
        cubed_sphere.sphericity = v;
        cubed_sphere.rebuild();
      });
    gui.close();

    // theme update
    const onThemeUpdate = () => {
      const is_dark =
        document.body.getAttribute("data-md-color-scheme") === "ntt-dark";
      if (is_dark) {
        cubed_sphere.wireframe.material.color = new THREE.Color(0xffffff);
      } else {
        cubed_sphere.wireframe.material.color = new THREE.Color(0x000000);
      }
      fog = new THREE.Fog(getBGColor().getHex(), 5, 35);
      if (set.fog) {
        scene.fog = fog;
      }
    };
    onThemeUpdate();

    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          onThemeUpdate();
        }
      });
    }).observe(document.body, { attributes: true });

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      stats.update();
      requestAnimationFrame(animate);
      if (set.screenshot.take) {
        set.screenshot.callback();
        set.screenshot.take = false;
      }
    };

    window.addEventListener("resize", onWindowResize, false);
    animate();
  },
  false,
);
