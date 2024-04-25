---
hide:
  - footer
---

# Input parameters

Entity reads almost all the information (except for the problem generator) about the simulation at runtime from an input file provided in the `.toml` format. The most up-to-date full version of the input file with all the possible input parameters with their descriptions can be found in the root directory of the main repository in the `input.example.toml`.

```toml
[simulation]
  # Name of the simulation:
  #   @required
  #   @type: string
  #   @example: "MySim"
  #   @note: The name is used for the output files.
  name = ""
  # Simulation engine to use
  #   @required
  #   @type: string
  #   @valid: "SRPIC", "GRPIC"
  engine = ""
  # Max runtime in physical (code) units:
  #   @required
  #   @type: float: > 0
  #   @example: 1e5
  runtime = ""

  [simulation.domain]
    # Number of domains
    #   @type int
    #   @default: 1 (no MPI)
    #   @default: MPI_SIZE (MPI)
    number = ""
    # Decomposition of the domain (e.g., for MPI) in each of the directions
    #   @type array of int of size 1, 2 or 3
    #   @example: [2, 2, 2] (for a total of 8 domains)
    #   @default: [-1, -1, -1]
    #   @note: -1 means the code will determine the decomposition in the specific direction automatically
    #   @note: automatic detection is either done by inference from # of MPI tasks, or by balancing the grid size on each domain
    decomposition = ""

[grid]
  # Spatial resolution of the grid:
  #   @required
  #   @type: array of uint of size 1, 2 or 3
  #   @example: [1024, 1024, 1024]
  #   @note: Dimensionality is inferred from the size of this array
  resolution = ""
  # Physical extent of the grid:
  #   @required
  #   @type: 1/2/3-size array of float tuples, each of size 2
  #   @example: [[0.0, 1.0], [-1.0, 1.0]]
  #   @note: For spherical geometry, only specify [[rmin, rmax]], other values are set automatically
  #   @note: For cartesian geometry, cell aspect ratio has to be 1, i.e., dx=dy=dz
  extent = ""

  # @inferred:
  # - dim
  #     @brief: Dimensionality of the grid
  #     @type: short (1, 2, 3)
  #     @from: `grid.resolution`

  [grid.metric]
    # Metric on the grid
    #   @required
    #   @type: string
    #   @valid: "Minkowski", "Spherical", "QSpherical", "Kerr_Schild", "QKerr_Schild", "Kerr_Schild_0"
    metric = ""
    # r0 paramter for the QSpherical metric, x1 = log(r-r0):
    #   @type: float: -inf < ... < rmin
    #   @default: 0.0 (e.g., x1 = log(r))
    #   @note: negative values produce almost uniform grid in r
    qsph_r0 = ""
    # h paramter for the QSpherical metric, th = x2 + 2*h x2 (pi-2*x2)*(pi-x2)/pi^2:
    #   @type: float: -1 < ... < 1
    #   @default: 0.0 (e.g., x2 = th)
    qsph_h = ""
    # Spin parameter for the Kerr Schild metric:
    #   @type: float: 0 < ... < 1
    #   @default: 0.0
    ks_a = ""

    # @inferred:
    # - coord
    #     @brief: Coordinate system on the grid
    #     @type: string
    #     @valid: "cartesian", "spherical", "qspherical"
    #     @from: `grid.metric.metric`
    # - ks_rh
    #     @brief: Size of the horizon for GR Kerr Schild
    #     @type: float
    #     @from: `grid.metric.ks_a`
    # - params
    #     @brief: A map of all metric-specific parameters together (for easy access)
    #     @type: map<string, float>
    #     @from: `grid.metric`

  [grid.boundaries]
    # Boundary conditions for fields:
    #   @required
    #   @type: 1/2/3-size array of string tuples, each of size 1 or 2
    #   @valid: "PERIODIC", "ABSORB", "ATMOSPHERE", "CUSTOM", "HORIZON"
    #   @example: [["CUSTOM", "ABSORB"]] (for 2D spherical [[rmin, rmax]])
    #   @note: When periodic in any of the directions, you should only set one value [..., ["PERIODIC"], ...]
    #   @note: In spherical, bondaries in theta/phi are set automatically (only specify bc @ [rmin, rmax]) [["ATMOSPHERE", "ABSORB"]]
    #   @note: In GR, the horizon boundary is set automatically (only specify bc @ rmax): [["ABSORB"]]
    fields = ""
    # Boundary conditions for fields:
    #   @required
    #   @type: 1/2/3-size array of string tuples, each of size 1 or 2
    #   @valid: "PERIODIC", "ABSORB", "ATMOSPHERE", "CUSTOM", "REFLECT", "HORIZON"
    #   @example: [["PERIODIC"], ["PERIODIC"]]
    #   @note: When periodic in any of the directions, you should only set one value [..., ["PERIODIC"], ...]
    #   @note: In spherical, bondaries in theta/phi are set automatically (only specify bc @ [rmin, rmax]) [["ATMOSPHERE", "ABSORB"]]
    #   @note: In GR, the horizon boundary is set automatically (only specify bc @ rmax): [["ABSORB"]]
    particles = ""
    # Size of the absorption layer in physical (code) units:
    #   @type: float
    #   @default: 1% of the domain size (in shortest dimension)
    #   @note: In spherical, this is the size of the layer in r from the outer wall
    #   @note: In cartesian, this is the same for all dimensions where applicable
    absorb_d = ""
    # Absorption coefficient for fields:
    #   @type: float: -inf < ... < inf, != 0
    #   @default: 1.0
    absorb_coeff = ""

[scales]
  # Fiducial larmor radius:
  #   @required
  #   @type: float: > 0.0
  larmor0 = ""
  # Fiducial plasma skin depth:
  #   @required
  #   @type: float: > 0.0
  skindepth0 = ""

  # @inferred:
  # - dx0
  #     @brief: fiducial minimum size of the cell
  #     @type: float
  #     @from: `grid`
  # - V0
  #     @brief: fiducial elementary volume
  #     @type: float
  #     @from: `grid`
  # - n0 [= ppc0 / V0]
  #     @brief: Fiducial number density
  #     @type: float
  #     @from: `particles.ppc0`, `grid`
  # - q0 [= 1 / (n0 * skindepth0^2)]
  #     @brief: Fiducial elementary charge
  #     @type: float
  #     @from: `scales.skindepth0`, `scales.n0`
  # - sigma0 [= (skindepth0 / larmor0)^2]
  #     @brief: Fiducial magnetization parameter
  #     @type: float
  #     @from: `scales.larmor0`, `scales.skindepth0`
  # - B0 [= 1 / larmor0]
  #     @brief: Fiducial magnetic field
  #     @type: float
  #     @from: `scales.larmor0`
  # - omegaB0 [= 1 / larmor0]
  #     @brief: Fiducial cyclotron frequency
  #     @type: float
  #     @from: `scales.larmor0`

[algorithms]
  # Number of current smoothing passes:
  #   @type: unsigned short: >= 0
  #   @default: 0
  current_filters = ""

  [algorithms.toggles]
    # Toggle for the field solver:
    #   @type bool
    #   @default: true
    fieldsolver = ""
    # Toggle for the current deposition:
    #   @type bool
    #   @default: true
    deposit = ""

  [algorithms.timestep]
    # Courant-Friedrichs-Lewy number:
    #   @type: float: 0.0 < ... < 1.0
    #   @default: 0.95
    #   @note: CFL number determines the timestep duration.
    CFL = ""
    # Correction factor for the speed of light used in field solver:
    #   @type: float: ~1
    #   @default: 1.0
    correction = ""
    
    # @inferred:
    # - dt [= CFL * dx0]
    #     @brief: timestep duration
    #     @type: float

  [algorithms.gr]
    # Stepsize for numerical differentiation in GR pusher:
    #   @type: float: > 0
    #   @default: 1e-6
    pusher_eps = ""
    # Number of iterations for the Newton-Raphson method in GR pusher:
    #   @type: unsigned short: > 0
    #   @default: 10
    pusher_niter = ""

  [algorithms.gca]
    # Maximum value for E/B allowed for GCA particles:
    #   @type: float: 0.0 < ... < 1.0
    #   @default: 0.9
    e_ovr_b_max = ""
    # Maximum Larmor radius allowed for GCA particles (in physical units):
    #   @type: float: > 0
    #   @default: 0.0
    #   @note: When `larmor_max` == 0, the limit is disabled
    larmor_max = ""

  [algorithms.synchrotron]
    # Radiation reaction limit gamma-factor for synchrotron:
    #   @required [if one of the species has `cooling = "synchrotron"`]
    #   @type: float: > 0
    gamma_rad = ""

[particles]
  # Fiducial number of particles per cell:
  #   @required
  #   @type: float: > 0
  ppc0 = ""
  # Toggle for using particle weights:
  #   @type: bool
  #   @default: false
  use_weights = ""
  # Timesteps between particle re-sorting:
  #   @type: unsigned int: >= 0
  #   @default: 100
  #   @note: When MPI is enable, particles are sorted every step.
  #   @note: When `sort_interval` == 0, the sorting is disabled.
  sort_interval = ""

  # @inferred:
  # - nspec
  #     @brief: Number of particle species
  #     @type: unsigned int
  #     @from: `particles.species`
  # - species
  #     @brief: An object containing information about all the species
  #     @type: vector of ParticleSpecies
  #     @from: `particles.species`

  [[particles.species]]
    # Label of the species:
    #   @type: string
    #   @default: "s*" (where "*" is the species index starting at 1)
    #   @example: "e-"
    label = ""
    # Mass of the species (in units of fiducial mass):
    #   @required
    #   @type: float
    mass = ""
    # Charge of the species (in units of fiducial charge):
    #   @required
    #   @type: float
    charge = ""
    # Maximum number of particles per task:
    #   @required
    #   @type: unsigned int: > 0
    maxnpart = ""
    # Pusher algorithm for the species:
    #   @type: string
    #   @default: "Boris" for massive and "Photon" for massless
    #   @valid: "Boris", "Vay", "Boris,GCA", "Vay,GCA", "Photon", "None"
    pusher = ""
    # Number of additional (payload) variables for each particle of the given species:
    #   @type: unsigned short: >= 0
    #   @default: 0
    n_payloads = ""
    # Radiation reaction to use for the species:
    #   @type: string
    #   @default: "None"
    #   @valid: "None", "Synchrotron"
    cooling = ""

# Parameters for specific problem generators and setups:
[setup]


[output]
  # Field quantities to output:
  #   @type: array of strings
  #   @valid: fields: "E", "B", "J", "divE"
  #   @valid: moments: "Rho", "Charge", "N", "Nppc", "T0i", "Tij"
  #   @valid: for GR: "D", "H", "divD", "A"
  #   @default: []
  #   @note: For T, you can use unspecified indices, e.g., Tij, T0i, or specific ones, e.g., Ttt, T00, T02, T23
  #   @note: For T, in cartesian can also use "x" "y" "z" instead of "1" "2" "3"
  #   @note: By default, we accumulate moments from all massive species, one can specify only specific species: e.g., Ttt_1_2, Rho_1, Rho_3_4
  fields = ""
  # Particle species indices to output:
  #   @type: array of ints
  #   @default: [] = all species
  particles = ""
  # Output format:
  #   @type: string
  #   @valid: "disabled", "hdf5", "BPFile"
  #   @default: "hdf5"
  format = ""
  # Smoothing window for the output of moments (e.g., "Rho", "Charge", "T", etc.):
  #   @type: unsigned short: >= 0
  #   @default: 0
  mom_smooth = ""
  # @NOT_IMPLEMENTED: Stride for the output of fields:
  #   @type: unsigned short: > 1
  #   @default: 1
  fields_stride = ""
  # Stride for the output of particles:
  #   @type: unsigned int: > 1
  #   @default: 100
  prtl_stride = ""
  # Number of timesteps between outputs:
  #   @type: unsigned int: > 0
  #   @default: 1
  interval = ""
  # Physical (code) time interval between outputs:
  #   @type: float: > 0
  #   @default: -1.0 (disabled)
  #   @note: When `interval_time` < 0, the output is controlled by `interval`, otherwise by `interval_time`
  interval_time = ""

  [output.debug]
    # Output fields "as is" without conversions:
    #   @type: bool
    #   @default: false
    as_is = ""
    # Output fields with values in ghost cells:
    #   @type: bool
    #   @default: false
    ghosts = ""

[diagnostics]
  # Number of timesteps between diagnostic logs:
  #   @type: int: > 0
  #   @default: 1
  interval = ""
  # Blocking timers between successive algorithms:
  #   @type: bool
  #   @default: false
  blocking_timers = ""
  # Enable colored stdout
  #   @type: bool
  #   @default: true
  colored_stdout = ""
```

<!-- 
<style>
ul.tree, ul.tree ul {
list-style: none;
  margin: 0;
  padding: 0;
} 
ul.tree ul {
  margin-left: 10px;
}
ul.tree li {
  margin: 0;
  padding: 0 7px;
  line-height: 20px;
XS  font-weight: bold;
  border-left:1px solid rgb(100,100,100);

}
ul.tree li:last-child {
    border-left:none;
}
ul.tree li:before {
  position:relative;
  top:-0.3em;
  height:1em;
  width:12px;
  color:white;
  border-bottom:1px solid rgb(100,100,100);
  content:"";
  display:inline-block;
  left:-7px;
}
ul.tree li:last-child:before {
  border-left:1px solid rgb(100,100,100);   
} 
</style>

<ul class="tree">
    <li>Animals
     <ul>
      <li>Birds</li>
      <li>Mammals
       <ul>
        <li>Elephant</li>
        <li class="last">Mouse</li>
       </ul>
      </li>
      <li class="last">Reptiles</li>
     </ul>
    </li>
    <li class="last">Plants
     <ul>
      <li>Flowers
       <ul>
        <li>Rose</li>
        <li class="last">Tulip</li>
       </ul>
      </li>
      <li class="last">Trees</li>
     </ul>
    </li>
   </ul> -->