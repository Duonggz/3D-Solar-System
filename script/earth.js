  import * as THREE from 'three';  // Bare specifier, ok với importmap
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  // SỬA: Bare cho CDN
  

// Export variables để main.js dùng
export let scene, camera, renderer, controls, earth, clouds, moon, moonOrbit, sun, stars, sunFlare, atmosphere, rotationSpeed;

// Internal functions
let loader;  // Texture loader

export function initEarth() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
    camera.position.set(0, 0, 10);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 50;

    // Textures
    loader = new THREE.TextureLoader();
    const earthDay = loader.load("../2k/8k_earth_daymap.jpg");
    const earthNight = loader.load("../2k/8k_earth_nightmap.jpg");
    const earthClouds = loader.load("../2k/2k_earth_clouds.jpg");
    const earthNormal = loader.load("../2k/2k_earth_normal_map.tif");
    const earthSpec = loader.load("../2k/2k_earth_specular_map.tif");

    // Earth
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthDay,
        normalMap: earthNormal,
        specularMap: earthSpec,
        specular: new THREE.Color(0x333333),
        shininess: 15,
        emissiveMap: earthNight,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 1.0
    });
    const earthGeometry = new THREE.SphereGeometry(2, 128, 128);
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Clouds
    const cloudTex = loader.load("../2k/2k_earth_clouds.jpg");
    const cloudAlpha = loader.load("../2k/2k_earth_clouds.jpg");

    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: cloudTex,
        alphaMap: cloudAlpha,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        side: THREE.DoubleSide,
        bumpMap: cloudTex,
        bumpScale: 0.02,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.5
    });

    const cloudGeometry = new THREE.SphereGeometry(2.05, 128, 128);
    clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earth.rotation.y = Math.PI; 
    earth.add(clouds);

    // Atmosphere Glow Shader
    const atmosphereShader = {
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0) * intensity;
            }
        `
    };

    const atmosphereMat = new THREE.ShaderMaterial({
        vertexShader: atmosphereShader.vertexShader,
        fragmentShader: atmosphereShader.fragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });

    atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2.2, 128, 128), atmosphereMat);
    scene.add(atmosphere);

    // Moon
    const moonTexture = loader.load("../2k/2k_moon.jpg");
    const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
    const moonGeometry = new THREE.SphereGeometry(0.5, 64, 64);
    moon = new THREE.Mesh(moonGeometry, moonMaterial);

    moonOrbit = new THREE.Object3D();
    scene.add(moonOrbit);
    moon.position.set(10, 0, 0);
    moonOrbit.add(moon);

    // Moon Label
    const moonLabelCanvas = document.createElement('canvas');
    const ctx = moonLabelCanvas.getContext('2d');
    moonLabelCanvas.width = 256;
    moonLabelCanvas.height = 64;
    ctx.fillStyle = 'white';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('The Moon', moonLabelCanvas.width / 2, 40);

    const moonLabelTexture = new THREE.CanvasTexture(moonLabelCanvas);
    const moonLabelMaterial = new THREE.SpriteMaterial({ map: moonLabelTexture, transparent: true });
    const moonLabel = new THREE.Sprite(moonLabelMaterial);
    moonLabel.scale.set(5, 2, 1);
    moonLabel.position.set(0, 1.5, 0);
    moon.add(moonLabel);

    // Sun
    const sunTexture = loader.load("../2k/2k_sun.jpg");
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(50, 0, -200);
    scene.add(sun);

    // Sun Light
    const sunLight = new THREE.PointLight(0xffffff, 2, 2000);
    sunLight.position.copy(sun.position);
    scene.add(sunLight);

    // Lens Flare
    const flareTexture = loader.load("../2k/lensflare0.png");
    const flareMaterial = new THREE.SpriteMaterial({
        map: flareTexture,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    sunFlare = new THREE.Sprite(flareMaterial);
    sunFlare.scale.set(20, 20, 1);
    sun.add(sunFlare);

    const flareTexture2 = loader.load("../2k/lensflare3.png");
    const flareMaterial2 = new THREE.SpriteMaterial({
        map: flareTexture2,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    const flare2 = new THREE.Sprite(flareMaterial2);
    flare2.scale.set(5, 5, 1);
    flare2.position.set(-8, -4, 0);
    sun.add(flare2);

    // Stars
    const starsTexture = loader.load("../2k/8k_stars.jpg");
    const starsMaterial = new THREE.MeshBasicMaterial({ map: starsTexture, side: THREE.BackSide });
    const starsGeometry = new THREE.SphereGeometry(5000, 64, 64);
    stars = new THREE.Mesh(starsGeometry, starsMaterial);
    scene.add(stars);

    // Ambient Light
    const ambient = new THREE.AmbientLight(0x222222);
    scene.add(ambient);

    // Slider tốc độ (ảnh hưởng Earth, moon, và sau này ISS)
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = "0.1";
    slider.max = "10";
    slider.step = "0.1";
    slider.value = "1.0";
    slider.style.position = 'absolute';
    slider.style.bottom = '20px';
    slider.style.left = '50%';
    slider.style.transform = 'translateX(-50%)';
    slider.style.width = '300px';
    document.body.appendChild(slider);

    slider.addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
    });

    window.addEventListener('resize', onWindowResize);
    rotationSpeed = 1.0;  // Default
}

export function animateEarth(time) {
    // Earth rotation
    earth.rotation.y = time * 0.1 * rotationSpeed;

    // Clouds rotation
    if (clouds) clouds.rotation.y = earth.rotation.y * 1.05;

    // Moon orbit
    if (moonOrbit) moonOrbit.rotation.y = time * 0.05 * rotationSpeed;

    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}