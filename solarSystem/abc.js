import * as THREE from "../three.module.js";
import { OrbitControls } from "../OrbitControls.js";

// Scene, Camera, Renderer
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 100, 200);
camera.lookAt(0, 0, 0);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Controls
export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Ánh sáng
export const light = new THREE.PointLight(0xffffff, 0, 1000);
light.position.set(50, 50, 50);
scene.add(light);
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// Background
export const loader = new THREE.TextureLoader();
loader.load('../textures/galaxy.jpg', function(texture) {
    scene.background = texture;
});

// Sun
export const sunGeometry = new THREE.SphereGeometry(25, 32, 32);
export const sunTexture = loader.load('../textures/sun.jpg');
export const sunMaterial = new THREE.MeshPhongMaterial({
    map: sunTexture,
    emissive: 0xff5000,
    emissiveIntensity: 1
});
export const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.castShadow = true;
sun.name = 'Sun';
scene.add(sun);

const sunLight = new THREE.PointLight(0xffdd88, 5, 5000);
sun.add(sunLight);

// Data và biến toàn cục
export const planetsData = [
    { name: "Mercury", radius: 3.6, distance: 10, texture: "mercury.jpg", speed: 0.0118 },
    { name: "Venus", radius: 5.4, distance: 15, texture: "venus.jpg", speed: 0.007 },
    { name: "Earth", radius: 6, distance: 20, texture: "earth.jpg", speed: 0.00596 },
    { name: "Mars", radius: 4.8, distance: 25, texture: "mars.jpg", speed: 0.0048 },
    { name: "Jupiter", radius: 12, distance: 35, texture: "jupiter.jpg", speed: 0.0026 },
    { name: "Saturn", radius: 10.2, distance: 45, texture: "saturn.jpg", speed: 0.00192 },
    { name: "Uranus", radius: 7.2, distance: 55, texture: "uranus.jpg", speed: 0.00136 },
    { name: "Neptune", radius: 7.2, distance: 65, texture: "neptune.jpg", speed: 0.00108 },
    { name: "Pluto", radius: 3.6, distance: 70, texture: "pluto.jpg", speed: 0.00112 }
];

export const eccentricity = {
    Mercury: 0.206,
    Venus: 0.007,
    Earth: 0.017,
    Mars: 0.093,
    Jupiter: 0.049,
    Saturn: 0.056,
    Uranus: 0.046,
    Neptune: 0.01,
    Pluto: 0.244
};

export const orbitScale = 3.9;
export const planetOrbits = [];
export const orbitLines = [];
export let globalSpeed = 1;

// Tạo hành tinh và quỹ đạo
export function createPlanets() {
    planetsData.forEach(data => {
        const orbit = new THREE.Object3D();
        scene.add(orbit);

        const texture = loader.load(`../textures/${data.texture}`);
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            metalness: 0.4,
            roughness: 0.7,
            emissive: new THREE.Color(0x222222),
            emissiveIntensity: 0.1
        });

        const a = data.distance * orbitScale;
        const e = eccentricity[data.name] || 0;
        const b = a * Math.sqrt(1 - e * e);

        const planet = new THREE.Mesh(geometry, material);
        planet.name = data.name;
        planet.position.set(a, 0, 0);
        orbit.add(planet);

        // Vành đai sao Thổ
        if (data.name === 'Saturn') {
            const ringGeometry = new THREE.RingGeometry(data.radius + 3.2, data.radius + 9.6, 512);
            const ringTexture = loader.load('../textures/P6.png');
            const ringMaterial = new THREE.MeshBasicMaterial({ 
                map: ringTexture, 
                side: THREE.DoubleSide, 
                transparent: true 
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planet.add(ring);
        }

        // Tạo sprite tên hành tinh
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 216;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.font = '128px Arial';
        ctx.fillText(data.name, 60, 140);
        const nameTexture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: nameTexture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(a, data.radius + 4, 0);
        orbit.add(sprite);

        // Tạo đường quỹ đạo
        const curve = new THREE.EllipseCurve(0, 0, a, b, 0, 2 * Math.PI);
        const points = curve.getPoints(400);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
        const orbitMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffffff, 
            opacity: 0.4, 
            transparent: true 
        });
        const ellipse = new THREE.Line(orbitGeometry, orbitMaterial);
        ellipse.visible = true;
        scene.add(ellipse);
        orbitLines.push(ellipse);

        // Mặt trăng của Trái Đất
        if (data.name === 'Earth') {
            const moonOrbit = new THREE.Object3D();
            planet.add(moonOrbit);
            const moonGeometry = new THREE.SphereGeometry(3, 32, 32);
            const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
            moon.position.set(12, 0, 0);
            moonOrbit.add(moon);

            planetOrbits.push({
                orbit,
                speed: data.speed,
                moonOrbit,
                moonSpeed: 0.01,
                planet,
                sprite,
                radius: data.radius,
                collided: false
            });
        } else {
            planetOrbits.push({
                orbit,
                speed: data.speed,
                moonOrbit: null,
                moonSpeed: null,
                planet,
                sprite,
                radius: data.radius,
                collided: false
            });
        }
    });
}

// Animation loop - SỬA HÀM NÀY
export function animatePlanets(lockedPlanet = null) {
    planetOrbits.forEach(p => {
        // Chỉ animate các hành tinh không bị khóa
        if (p.planet !== lockedPlanet) {
            p.orbit.rotation.y += p.speed * globalSpeed;
        }

        if (p.planet) p.planet.rotation.y += 0.01;
        
        if (p.moonOrbit && p.planet !== lockedPlanet) {
            p.moonOrbit.rotation.y += p.moonSpeed * globalSpeed;
        }

        if (p.sprite) {
            const distance = camera.position.distanceTo(p.sprite.position);
            const scale = distance * 0.03;
            p.sprite.scale.set(scale, scale * 0.25, 1);
        }
    });

    sun.rotation.y += 0.005 * globalSpeed;
}

// Cập nhật tốc độ toàn cục
export function setGlobalSpeed(speed) {
    globalSpeed = speed;
}

// Bật/tắt hiển thị quỹ đạo
export function toggleOrbits(visible) {
    orbitLines.forEach(line => line.visible = visible);
}