
# 3D Solar System

An interactive, browser-based 3D simulation of the Solar System built on **Three.js** and the WebGL rendering pipeline. Beyond a single orbital scene, the project is structured as a small suite of linked WebGL experiences — a clickable planetary inspector, an Earth/ISS exploration mode with multiple camera perspectives, a free-flight spaceship simulator, and a gallery of panoramic astronomical phenomena — unified behind a common landing page and navigation shell.

<img width="1917" height="1078" alt="Screenshot 2026-07-21 203546" src="https://github.com/user-attachments/assets/d5efff57-7d35-4075-892e-a36657e35da1" />


**Live demo:** [solar-system-3d-alb.vercel.app](https://solar-system-3d-alb.vercel.app/)

---

## Table of Contents

- [Overview](#overview)
- [Feature Highlights](#feature-highlights)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Controls Reference](#controls-reference)
- [Implementation Notes](#implementation-notes)
- [Known Limitations & Suggested Improvements](#known-limitations--suggested-improvements)
- [License](#license)
- [Author](#author)

---

## Overview

The application renders a stylized, physically-inspired model of the Solar System entirely client-side, with no backend or build step. The core scene combines a procedural starfield, elliptical planetary orbits parameterized by real eccentricity and axial-inclination values, a PBR-shaded emissive Sun, procedurally generated asteroid/Kuiper belt fields, and a camera-distance-driven transition into a galactic-scale backdrop. From this landing scene, users branch into several purpose-built sub-experiences: an interactive planet inspector with raycasting-based selection, an Earth/ISS orbital viewer, a free-flight spaceship cockpit simulator, panoramic astronomical-phenomena playback, video-based Earth travel tours, and an educational planetary reference module.

## Feature Highlights

###  Core Solar System Scene (`index.html`, `abc.js`, `hehe.js`)
- Procedural starfield of 50,000 vertex-colored point sprites (`THREE.Points` / `BufferGeometry`)
- Elliptical orbit paths (`THREE.EllipseCurve`) driven by per-planet eccentricity and orbital-inclination values
- PBR shading (`MeshStandardMaterial`) with ACES Filmic tone mapping and an sRGB-correct texture/color-space pipeline
- Emissive Sun mesh with a dynamic, shadow-casting `PointLight`
- Procedurally perturbed asteroid belt and Kuiper belt (icosahedral geometry with per-vertex noise displacement)
- Billboarded, canvas-texture sprite labels with distance-based dynamic scaling
- Camera-distance-driven galaxy background transition (opacity interpolation between the local starfield and a galactic-scale skybox)
- Runtime controls: global simulation-speed multiplier, orbit-path visibility toggle, starfield toggle, background-music volume
- Damped `OrbitControls` camera navigation
- Hidden "shooting star" easter egg: holding <kbd>Space</kbd> + a letter key spawns a billboard sprite that decays into a particle-based meteor trail

###  Interactive Solar System Explorer (`solarSystem/`)
- Raycasting-based object picking for planet selection
- GSAP-driven camera interpolation (fly-to / fly-from transitions with easing) on selection and deselection
- Dynamic info panel bound to a per-body astronomical dataset (diameter, mass, orbital period, surface temperature, description)
- Positional audio feedback via Three.js's `AudioListener` / `Audio` API
- Ambient trivia ticker cycling through Solar System facts

###  Earth & ISS Exploration Module (`public/earth_iss.html`, `script/`)
- glTF 2.0 ISS model (`GLTFLoader`) orbiting a textured Earth mesh (day map, night map, animated cloud layer with alpha blending, normal map, specular map)
- Multiple camera/view modes — default orbit, first-person (FPS), ISS-relative, and rear/back view — with Tween.js-driven transitions
- Earth-based virtual travel mode and a 360° panorama viewer (`Pano.js`) using an equirectangular video texture mapped onto an inverted sphere (`THREE.BackSide`)

###  Free-Flight Spaceship Simulator (`space/`)
- WASD + vertical (J/K) + arrow-key flight controls with a boost modifier
- glTF spaceship model with a modeled cockpit interior, HUD overlay, and a custom mini-map (`minimap.js`)
- Cinematic "Way Back Home" auto-navigation sequence with eased speed ramping and a dedicated music cue
- Ambient trivia/chat overlay (`chat.js`)

###  Astronomical Phenomena Gallery (`Hien_Tuong/`)
- Seven panoramic/video-based experiences: aurora borealis, aurora australis, lunar eclipse, solar eclipse, meteor shower, meteoroid impact, and night sky
- Shared `Pano.js` panorama playback engine with Tween.js-driven fade and transition control

###  Earth Travel Tours (`Travel/`)
- Video-based virtual tours of real-world landmarks and locations, each with a dedicated HTML/JS pair

###  Learn & Discover Module (`Khampha/`)
- Structured planetary reference dataset (diameter, orbital period, surface temperature, moon count, atmospheric composition, discovery era) surfaced as an interactive study reference

###  Per-Planet Media Pages (`Star/`)
- Fullscreen, autoplay curated video-playlist viewer scoped to each celestial body

## Tech Stack

| Category | Technology |
|---|---|
| Rendering engine | Three.js r152 (vendored `three.module.js`, with CDN delivery + import maps on select sub-pages) |
| 3D asset format | glTF 2.0 (`.glb`) via `GLTFLoader` |
| Camera navigation | `OrbitControls` |
| Animation / tweening | GSAP 3.12, Tween.js |
| Audio | HTML5 `<audio>`, Three.js `AudioListener` / `Audio` |
| Iconography | Font Awesome 6.4 |
| Markup & styling | Vanilla HTML5, CSS3 (no CSS framework) |
| Scripting | Vanilla JavaScript, ES2015+ modules |
| Hosting | Vercel (static hosting, no build pipeline) |

## Project Structure

```
3D-Solar-System/
├── index.html / index.js / abc.js / hehe.js   # Landing page shell + core solar-system scene
├── solarSystem/                                # Interactive planet-inspector module
├── public/                                     # Earth/ISS + panorama entry pages
├── script/                                     # Earth/ISS/travel/panorama scene logic
├── space/                                       # Free-flight spaceship simulator
├── Star/                                        # Per-planet media pages
├── Travel/                                       # Earth landmark video tours
├── Hien_Tuong/                                   # Astronomical phenomena panoramas
├── Khampha/                                      # Educational planetary reference module
├── core/ textures/ textures1/ 2k/ icon/          # Texture and image assets
├── models/                                       # glTF binary models (ISS, spaceship)
├── sounds/ Video/ Videos/                        # Audio and video assets
└── OrbitControls.js / three.module.js            # Vendored Three.js dependencies
```

## Getting Started

### Prerequisites
- A modern browser with WebGL2 support
- A local static HTTP server — **required**, since the project relies on native ES modules and texture/model fetches that most browsers block under the `file://` protocol due to CORS restrictions

### Run locally

```bash
git clone https://github.com/Duonggz/3D-Solar-System.git
cd 3D-Solar-System

# any static file server works, for example:
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:<port>/index.html` in the browser.

> No package manager, bundler, or build step is required. Dependencies are either vendored locally (the core Three.js build) or loaded via `<script>` tags and import maps pointing at public CDNs (GSAP, Tween.js, Font Awesome, and Three.js `examples/jsm` addons on select sub-pages).

## Controls Reference

| Key / Action | Effect | Context |
|---|---|---|
| `M` | Toggle main menu | Landing page |
| `Esc` | Close all open menus/panels | Landing page |
| `U` | Toggle debug speed/orbit UI | Landing page |
| Mouse drag / scroll | Orbit / zoom camera | All 3D scenes |
| Click on a planet | Open info panel + fly-to camera transition | Solar System Explorer |
| `W` `A` `S` `D` | Forward / left / back / right | Spaceship Simulator |
| `J` / `K` | Descend / ascend | Spaceship Simulator |
| Arrow keys | Pitch / yaw rotation | Spaceship Simulator |
| `V` | Toggle cockpit / exterior view | Spaceship Simulator |
| `L` | Boost | Spaceship Simulator |
| `Space` + `V/M/A/C/D` | Spawn a shooting-star sprite | Landing page (easter egg) |

## Implementation Notes

- **Illustrative, not physically-accurate, scale.** Orbital radii, planet sizes, and rotational speeds are dramatized for visual clarity and legibility rather than scaled to real astronomical units.
- **Dual Three.js delivery strategy.** The landing page and Solar System Explorer vendor a local copy of Three.js r152, while several sub-experiences (Earth/ISS, spaceship, panorama viewers) load Three.js and its `examples/jsm` addons from a CDN via `<script type="importmap">`. Standardizing on a single delivery method and pinned version would simplify long-term maintenance.
- **Mixed shading models.** The core scene uses PBR (`MeshStandardMaterial`) throughout, while the dedicated Earth/ISS module uses a Blinn-Phong material (`specularMap` + `specular` color) with a separate translucent cloud mesh — a deliberate trade-off favoring day/night terminator blending over physically-based shading for that view.
- **Localization.** Primary UI copy (menus, panels, in-scene data) is authored in Vietnamese; this document and the underlying source use English/technical terminology throughout.

## Known Limitations & Suggested Improvements

- No `package.json` or dependency manifest — CDN-delivered libraries are pinned informally, and some import-map URLs are not version-locked
- No automated tests, linting, or CI pipeline
- No license file is currently included in the repository
- The repository bundles a large volume of high-resolution textures, video, and audio directly in version control; migrating these to a CDN or Git LFS would substantially reduce clone size
- Several subsystems (ISS view-mode switching, the panorama engine, the spaceship's return-navigation sequence) carry non-trivial internal state and would benefit from a shared state-management abstraction as the codebase grows

## License

No license has been specified for this repository yet. Consider adding one (e.g., MIT) to clarify usage and contribution terms.

## Author

Developed by [Duonggz](https://github.com/Duonggz).
