import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

document.addEventListener("DOMContentLoaded", () => {
  const width = document.getElementsByTagName("article")[0].offsetWidth;
  const factor = width / 600;
  const h = 400 * factor;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, width / h, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, precision: "highp" });
  renderer.setSize(width, h);
  document.getElementById("three-metadomain").appendChild(renderer.domElement);

  const add_plane = (scene, sizeX, sizeY, cornerX, cornerY, cornerZ, color, opacity = 1) => {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshPhysicalMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: opacity });
    const plane = new THREE.Mesh(geometry, material);
    plane.scale.set(sizeX, sizeY, 1);
    plane.position.set(cornerX + sizeX / 2, cornerY + sizeY / 2, cornerZ);
    scene.add(plane);
  }

  const add_tube = (scene, start_pt, end_pt, r1, r2, color) => {
    const start = new THREE.Vector3().fromArray(start_pt);
    const end = new THREE.Vector3().fromArray(end_pt);
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const geometry = new THREE.CylinderGeometry(r1, r2, length, 8, 1, false);
    const material = new THREE.MeshPhysicalMaterial({ color: color });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(start.x + direction.x / 2, start.y + direction.y / 2, start.z + direction.z / 2);
    cylinder.lookAt(end);
    cylinder.rotateX(Math.PI / 2);
    scene.add(cylinder);
  }

  const add_grid = (scene, sizeX, sizeY, cornerX, cornerY, cornerZ, nx, ny, color = 0x000000) => {
    for (let i = 0; i <= nx; i++) {
      const x = sizeX * i / nx;
      add_tube(scene, [x + cornerX, cornerY, cornerZ], [x + cornerX, cornerY + sizeY, cornerZ], 0.0025, 0.0025, color);
    }
    for (let i = 0; i <= ny; i++) {
      const y = sizeY * i / ny;
      add_tube(scene, [cornerX, y + cornerY, cornerZ], [cornerX + sizeX, y + cornerY, cornerZ], 0.0025, 0.0025, color);
    }
  }

  const add_text = (scene, message, x, y, z, h, fontsize, color) => {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/droid/droid_sans_mono_regular.typeface.json', function (font) {
      const geometry = new TextGeometry(message, {
        font: font,
        size: fontsize,
        height: h,
      });
      geometry.computeBoundingBox();
      const size = geometry.boundingBox.getSize(new THREE.Vector3());
      const material = new THREE.MeshPhysicalMaterial({ color: color });
      const text = new THREE.Mesh(geometry, material);
      text.rotateZ(Math.PI);
      text.position.set(x + size.x / 2, y + size.y / 2, z);
      scene.add(text);
    });
  }

  const metadomain_sx = 5, metadomain_sy = 5;
  const ndomains_x = 6, ndomains_y = 4;
  const domain_offset_z = 1;
  const flds_offset_z = 0.5;
  const prtl_offset_z = 0.25;
  const ncells = 10;
  const scale = 2;

  const dom_sx0 = metadomain_sx / ndomains_x, dom_sy0 = metadomain_sy / ndomains_y;
  const dom_sx1 = dom_sx0 * scale, dom_sy1 = dom_sy0 * scale;
  const xc = -dom_sx0 / 2, yc = dom_sy0 / 2;
  const ncellsx = ncells, ncellsy = Math.floor(ncells * dom_sy1 / dom_sx1);
  const dx = dom_sx1 / ncellsx, dy = dom_sy1 / ncellsy;

  add_plane(scene, metadomain_sx, metadomain_sy, -metadomain_sx / 2, -metadomain_sy / 2, 0, 0x2f2f2f);
  add_grid(scene, metadomain_sx, metadomain_sy, -metadomain_sx / 2, -metadomain_sy / 2, 0, ndomains_x, ndomains_y);

  add_plane(scene, dom_sx1, dom_sy1, xc - dom_sx1 / 2, yc - dom_sy1 / 2, domain_offset_z, 0x1B78D7);
  add_grid(scene, dom_sx1, dom_sy1, xc - dom_sx1 / 2, yc - dom_sy1 / 2, domain_offset_z, ncellsx, ncellsy, 0x1B78D7);

  add_plane(scene, dom_sx1, dom_sy1, xc - dom_sx1 / 2, yc - dom_sy1 / 2, domain_offset_z + flds_offset_z, 0x8B322C, 0.75);
  add_grid(scene, dom_sx1 + 4 * dx, dom_sy1 + 4 * dy, xc - dom_sx1 / 2 - 2 * dx, yc - dom_sy1 / 2 - 2 * dx, domain_offset_z + flds_offset_z, ncellsx + 4, ncellsy + 4, 0x8B322C);

  add_text(scene, "Metadomain<S,M>", 0, metadomain_sy / 2.5, 0, 0.01, 0.3, 0xffffff);
  add_text(scene, "Domain<S,M>", xc, yc + dom_sy0 * 1.15, domain_offset_z, 0.01, 0.15, 0xffffff);
  add_text(scene, "Domain<S,M>::Mesh<M>", xc, yc + dom_sy0 / 1.15, domain_offset_z, 0.005, 0.08, 0xffffff);
  add_text(scene, "Domain<S,M>::Fields<D,S>", xc, yc + dom_sy0 / 1.15, domain_offset_z + flds_offset_z, 0.005, 0.08, 0xffffff);
  add_text(scene, "Domain<S,M>::Particles<D,C>", xc, yc - dom_sy0 / 1.15, domain_offset_z + flds_offset_z + prtl_offset_z, 0.005, 0.08, 0xffffff);

  const del_x = metadomain_sx / ndomains_x, del_y = metadomain_sy / ndomains_y;
  for (let i = 0; i < ndomains_x; i++) {
    for (let j = 0; j < ndomains_y; j++) {
      const n = (ndomains_y - 1 - j) * ndomains_x + (ndomains_x - i - 1);
      const xc = -metadomain_sx / 2 + del_x * i + del_x / 1.2;
      const yc = -metadomain_sy / 2 + del_y * j + del_y / 10;
      add_text(scene, `${n}`, xc, yc, 0, 0.01, 0.15, 0x0f0f0f);
    }
  }

  {
    const xlows = [0, -dom_sx0, -dom_sx0, 0];
    const ylows = [0, 0, dom_sy0, dom_sy0];
    const xhighs = [xc + dom_sx1 / 2, xc - dom_sx1 / 2, xc - dom_sx1 / 2, xc + dom_sx1 / 2];
    const yhighs = [yc - dom_sy1 / 2, yc - dom_sy1 / 2, yc + dom_sy1 / 2, yc + dom_sy1 / 2];

    for (let i = 0; i < xlows.length; i++) {
      add_tube(scene, [xlows[i], ylows[i], 0], [xhighs[i], yhighs[i], 1], 0, 0.01, 0x0f0f0f);
    }

    let vertices = [];
    for (let i = 0; i < xlows.length; i++) {
      vertices.push(xlows[i], ylows[i], 0);
    }
    for (let i = 0; i < xhighs.length; i++) {
      vertices.push(xhighs[i], yhighs[i], domain_offset_z);
    }
    let verticesArray = new Float32Array(vertices);
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
    let indices = [
      0, 1, 4,
      1, 5, 4,
      1, 2, 5,
      2, 6, 5,
      2, 3, 6,
      3, 7, 6,
      3, 0, 7,
      0, 4, 7,
    ];
    let indicesArray = new Uint16Array(indices);
    geometry.setIndex(new THREE.BufferAttribute(indicesArray, 1));
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x1B78D7,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const trapezoid = new THREE.Mesh(geometry, material);
    scene.add(trapezoid);
  }

  const spheres = [];
  const velx = [];
  const vely = [];
  const xmin = xc - dom_sx1 / 2, xmax = xc + dom_sx1 / 2;
  const ymin = yc - dom_sy1 / 2, ymax = yc + dom_sy1 / 2;

  {
    const geometry = new THREE.SphereGeometry(0.01, 8, 8);
    const material1 = new THREE.MeshPhysicalMaterial({ color: 0xDD49A0 });
    const material2 = new THREE.MeshPhysicalMaterial({ color: 0x2BDFEF });

    for (let i = 0; i < 200; i++) {
      const x = Math.random() * dom_sx1 - dom_sx1 / 2 + xc;
      const y = Math.random() * dom_sy1 - dom_sy1 / 2 + yc;
      const z = domain_offset_z + flds_offset_z + prtl_offset_z + 0.05 * Math.random();
      let mat;
      if (Math.random() < 0.5) {
        mat = material1;
      } else {
        mat = material2;
      }
      velx.push(0.01 * Math.random() - 0.005);
      vely.push(0.01 * Math.random() - 0.005);
      const sphere = new THREE.Mesh(geometry, mat);
      sphere.position.set(x, y, z);
      scene.add(sphere);
      spheres.push(sphere);
    }
  }

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 100);
  pointLight.position.set(0, 0, 5);
  scene.add(pointLight);

  camera.position.x = -2;
  camera.position.y = 10;
  camera.position.z = 6;
  camera.up.set(0, 0, 1);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  function animate() {
    for (let i = 0; i < spheres.length; i++) {
      spheres[i].position.x += velx[i];
      spheres[i].position.y += vely[i];
      if (spheres[i].position.x < xmin || spheres[i].position.x > xmax) {
        velx[i] *= -1;
      }
      if (spheres[i].position.y < ymin || spheres[i].position.y > ymax) {
        vely[i] *= -1;
      }
    }
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
});
