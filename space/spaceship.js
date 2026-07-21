import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { initSpace, animateEnvironment } from './space.js'; // Import environment

let spaceship, cockpit, spaceshipGroup;
let keys = {};
let isBoost = false;
let boostTimer = 0;
let currentSpeed = 0.3;
let viewMode = 'TPS';
let glbLoaded = false;
let spaceData = null; // Lưu data từ initSpace nếu dùng default

// Function tạo buồng lái (giữ nguyên từ trước)
function createCockpit(scaleFactor, group) {
    cockpit = new THREE.Group();
    cockpit.visible = false;
    group.add(cockpit);

    const domeGeometry = new THREE.SphereGeometry(3 * scaleFactor, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x4040ff,
        transmission: 1,
        opacity: 0.3,
        metalness: 0,
        roughness: 0,
        side: THREE.DoubleSide
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.set(0, 0, -2 * scaleFactor);
    cockpit.add(dome);

    const hudMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
    const hudPoints = [
        new THREE.Vector3(0, 0, -3 * scaleFactor), new THREE.Vector3(0, 0, -1 * scaleFactor),
        new THREE.Vector3(-1 * scaleFactor, 0, -2 * scaleFactor), new THREE.Vector3(1 * scaleFactor, 0, -2 * scaleFactor),
        new THREE.Vector3(0, -1 * scaleFactor, -2 * scaleFactor), new THREE.Vector3(0, 1 * scaleFactor, -2 * scaleFactor)
    ];
    const hudGeometry = new THREE.BufferGeometry().setFromPoints(hudPoints);
    const hud = new THREE.LineSegments(hudGeometry, hudMaterial);
    cockpit.add(hud);

    const dashboardGeometry = new THREE.PlaneGeometry(4 * scaleFactor, 1 * scaleFactor);
    const dashboardMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0x00ffff,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.9
    });
    const dashboard = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
    dashboard.position.set(0, -2 * scaleFactor, -1.5 * scaleFactor);
    dashboard.rotation.x = Math.PI / 6;
    cockpit.add(dashboard);

    const speedBars = [];
    for (let i = 0; i < 4; i++) {
        const barGeometry = new THREE.PlaneGeometry(0.2 * scaleFactor, 0.8 * scaleFactor);
        const barMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 1 });
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.position.set(-1.5 * scaleFactor + i * 1 * scaleFactor, -1.8 * scaleFactor, -1.4 * scaleFactor);
        cockpit.add(bar);
        speedBars.push(bar);
    }
    cockpit.userData.speedBars = speedBars;

    const radarGeometry = new THREE.PlaneGeometry(1.5 * scaleFactor, 1.5 * scaleFactor);
    const radarMaterial = new THREE.MeshStandardMaterial({
        color: 0x001100,
        emissive: 0x004400,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
    });
    const radar = new THREE.Mesh(radarGeometry, radarMaterial);
    radar.position.set(-2 * scaleFactor, 0, -1 * scaleFactor);
    cockpit.add(radar);

    const radarSweepGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.5 * scaleFactor, 0, 0)
    ]);
    const radarSweepMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.7 });
    const radarSweep = new THREE.Line(radarSweepGeometry, radarSweepMaterial);
    radar.add(radarSweep);
    cockpit.userData.radarSweep = radarSweep;
    cockpit.userData.radarRotation = 0;

    const mapGeometry = new THREE.PlaneGeometry(1.5 * scaleFactor, 1.5 * scaleFactor);
    const mapMaterial = new THREE.MeshStandardMaterial({
        color: 0x000011,
        emissive: 0x000044,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.8
    });
    const mapScreen = new THREE.Mesh(mapGeometry, mapMaterial);
    mapScreen.position.set(2 * scaleFactor, 0, -1 * scaleFactor);
    cockpit.add(mapScreen);

    const mapLinesGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) { // 8 hành tinh
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.75 * scaleFactor, 0, i * 0.2 * scaleFactor - 0.75 * scaleFactor),
            new THREE.Vector3(0.75 * scaleFactor, 0, i * 0.2 * scaleFactor - 0.75 * scaleFactor)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x4444ff, opacity: 0.5, transparent: true });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        mapLinesGroup.add(line);
    }
    mapScreen.add(mapLinesGroup); // Add vào map để static
}

// Controls setup (global cho module)
function setupControls() {
    keys = {}; // Reset nếu cần
    document.addEventListener('keydown', (event) => {
        keys[event.code] = true;
        if (event.code === 'KeyV') {
            viewMode = viewMode === 'TPS' ? 'FPS' : 'TPS';
        }
        if (event.code === 'KeyL') {
            isBoost = true;
            boostTimer = 60;
        }
    });

    document.addEventListener('keyup', (event) => {
        keys[event.code] = false;
        if (event.code === 'KeyL') {
            isBoost = false;
        }
    });
}

// Function load spaceship (GLTF hoặc fallback)
function loadSpaceship(scene, scaleFactor = 1) {
    spaceshipGroup = new THREE.Group();
    scene.add(spaceshipGroup);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
        '../models/spaceship.glb',
        (gltf) => {
            spaceship = gltf.scene;
            spaceship.position.set(0, 0, 0);
            spaceship.rotation.y = Math.PI;
            spaceship.visible = true;
            spaceshipGroup.add(spaceship);

            const box = new THREE.Box3().setFromObject(spaceship);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const desiredSize = 8;
            scaleFactor = (maxDim > 0) ? desiredSize / maxDim : 0.2;
            spaceship.scale.set(scaleFactor, scaleFactor, scaleFactor);

            spaceship.traverse((child) => {
                if (child.isMesh) {
                    child.material.emissive = new THREE.Color(0x0000ff);
                    child.material.emissiveIntensity = 0.8;
                    if (child.material.map) child.material.needsUpdate = true;
                }
            });

            createCockpit(scaleFactor, spaceshipGroup);
            spaceshipGroup.position.set(0, 0, 110);
            glbLoaded = true;
        },
        undefined,
        (error) => {
            // Fallback sphere
            const fallbackGeometry = new THREE.SphereGeometry(2, 16, 16);
            const fallbackMaterial = new THREE.MeshStandardMaterial({
                color: 0x0000ff,
                emissive: 0x0000ff,
                emissiveIntensity: 0.8
            });
            spaceship = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
            spaceship.rotation.y = Math.PI;
            spaceship.visible = true;
            spaceshipGroup.add(spaceship);

            createCockpit(scaleFactor, spaceshipGroup);
            spaceshipGroup.position.set(0, 50, 100);
            glbLoaded = true;
        }
    );
}

// Function init spaceship (tái sử dụng: optional scene/camera/renderer từ ngoài, hoặc dùng default từ space.js)
export function initSpaceship(externalScene = null, externalCamera = null, externalRenderer = null) {
    // Nếu không truyền external, dùng default từ space.js
    if (!externalScene || !externalCamera || !externalRenderer) {
        spaceData = initSpace(); // Import và gọi initSpace nếu cần default
        externalScene = spaceData.scene;
        externalCamera = spaceData.camera;
        externalRenderer = spaceData.renderer;
    }

    setupControls();
    loadSpaceship(externalScene, 1); // Scale mặc định, sẽ override nếu GLTF load

    // Append renderer nếu chưa (chỉ nếu dùng default)
    if (!externalRenderer.domElement.parentNode) {
        document.body.appendChild(externalRenderer.domElement);
    }

    // Setup resize nếu dùng default camera/renderer
    if (!externalCamera || !externalRenderer) {
        window.addEventListener('resize', () => {
            externalCamera.aspect = window.innerWidth / window.innerHeight;
            externalCamera.updateProjectionMatrix();
            externalRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    return { spaceship, cockpit, spaceshipGroup, viewMode, spaceData }; // Export objects để access ngoài nếu cần
}

// Function update spaceship (movement, screens, camera) + environment
export function animateSpaceship(camera, renderer, spaceshipGroup) {
    // Update boost
    if (boostTimer > 0) {
        boostTimer--;
        if (boostTimer === 0) isBoost = false;
    }
    const speedMultiplier = isBoost ? 2 : 1;
    const finalSpeed = currentSpeed * speedMultiplier;

    // Update spaceship movement
    if (spaceship && spaceshipGroup) {
        const rotationSpeed = 0.02;
        if (keys['ArrowLeft']) spaceshipGroup.rotation.y += rotationSpeed;
        if (keys['ArrowRight']) spaceshipGroup.rotation.y -= rotationSpeed;
        if (keys['ArrowUp']) spaceshipGroup.rotation.x -= rotationSpeed;
        if (keys['ArrowDown']) spaceshipGroup.rotation.x += rotationSpeed;

        spaceshipGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, spaceshipGroup.rotation.x));

        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);
        const up = new THREE.Vector3(0, 1, 0);
        forward.applyQuaternion(spaceshipGroup.quaternion);
        right.applyQuaternion(spaceshipGroup.quaternion);
        up.applyQuaternion(spaceshipGroup.quaternion);

        const velocity = new THREE.Vector3(0, 0, 0);
        if (keys['KeyW']) velocity.add(forward.clone().multiplyScalar(finalSpeed));
        if (keys['KeyS']) velocity.add(forward.clone().multiplyScalar(-finalSpeed));
        if (keys['KeyA']) velocity.add(right.clone().multiplyScalar(-finalSpeed));
        if (keys['KeyD']) velocity.add(right.clone().multiplyScalar(finalSpeed));
        if (keys['KeyJ']) velocity.add(up.clone().multiplyScalar(finalSpeed));
        if (keys['KeyK']) velocity.add(up.clone().multiplyScalar(-finalSpeed));

        if (!keys['KeyW'] && !keys['KeyS'] && !keys['KeyA'] && !keys['KeyD'] && !keys['KeyJ'] && !keys['KeyK']) {
            velocity.multiplyScalar(0.95);
        }

        spaceshipGroup.position.add(velocity);

        if (spaceshipGroup.position.length() > 5000) {
            spaceshipGroup.position.normalize().multiplyScalar(100);
        }
    }

    // Toggle visibility
    if (spaceship) spaceship.visible = (viewMode === 'TPS');
    if (cockpit) cockpit.visible = (viewMode === 'FPS');

    // Animate screens (FPS only)
    if (viewMode === 'FPS' && cockpit && cockpit.userData.speedBars && cockpit.userData.radarSweep) {
        const speedScale = (currentSpeed + (isBoost ? 0.3 : 0)) * 10;
        cockpit.userData.speedBars.forEach((bar, i) => {
            bar.scale.y = Math.min(1, (speedScale / 4) + (i * 0.2));
            bar.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.005 + i) * 0.5;
        });

        cockpit.userData.radarRotation += 0.05;
        cockpit.userData.radarSweep.rotation.z = cockpit.userData.radarRotation;
        cockpit.userData.radarSweep.material.opacity = 0.7 + Math.sin(cockpit.userData.radarRotation) * 0.3;
    }

    // Update camera
    if (spaceshipGroup) {
        if (viewMode === 'FPS') {
            const offset = new THREE.Vector3(0, 2, 0);
            offset.applyQuaternion(spaceshipGroup.quaternion);
            const idealPosition = spaceshipGroup.position.clone().add(offset);
            camera.position.lerp(idealPosition, 0.1);
            camera.quaternion.slerp(spaceshipGroup.quaternion, 0.1);
        } else {
            const idealOffset = new THREE.Vector3(0, 4, 12);
            idealOffset.applyQuaternion(spaceshipGroup.quaternion);
            const idealPosition = new THREE.Vector3().addVectors(spaceshipGroup.position, idealOffset);
            camera.position.lerp(idealPosition, 0.05);
            camera.lookAt(spaceshipGroup.position);
        }
    } else {
        camera.position.set(0, 0, 110);
        camera.lookAt(0, 0, 0);
    }

    // Update environment (planets + sun)
    animateEnvironment();

    // Render
    renderer.render(spaceData ? spaceData.scene : null, camera); // Dùng spaceData.scene nếu default
}