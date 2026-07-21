import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import TWEEN from 'three/addons/libs/tween.module.js';

let iss, issOrbit, issLabel;
let issSpeed, issRadius, issInclination;
let orbitPrecessionSpeed = 0.002;

// Tham chiếu ánh sáng & trái đất (để hiệu ứng)
let sunLight = null;
let earthMaterial = null;

// ============================
// 🛰️ Thêm ISS vào scene
// ============================
export function addISS(scene, earth, sun = null) {
    sunLight = sun;
    if (earth && earth.material) earthMaterial = earth.material;

    issRadius = 2 + Math.random();
    issInclination = (Math.random() * 30 - 15) * Math.PI / 180;
    issSpeed = 1 + Math.random() * 0.05;

    issOrbit = new THREE.Group();
    issOrbit.position.copy(earth.position);
    issOrbit.rotation.z = issInclination;
    scene.add(issOrbit);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
        '../models/iss.glb',
        (gltf) => {
            iss = gltf.scene;
            iss.position.set(issRadius, 0, 0);
            iss.scale.set(0.01, 0.01, 0.01);

            iss.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        emissive: new THREE.Color(0x88ccff),
                        roughness: 0.3,
                        metalness: 0.8,
                        transparent: true,
                        opacity: 1
                    });
                }
            });

            iss.rotation.z = 3 * Math.PI / 2;
            issOrbit.add(iss);

            // Label
            const labelCanvas = document.createElement('canvas');
            const ctx = labelCanvas.getContext('2d');
            labelCanvas.width = 256;
            labelCanvas.height = 64;
            ctx.fillStyle = 'white';
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ISS', labelCanvas.width / 2, 40);

            const labelTexture = new THREE.CanvasTexture(labelCanvas);
            const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture, transparent: true });
            issLabel = new THREE.Sprite(labelMaterial);
            issLabel.scale.set(1.5, 0.5, 1);
            issLabel.position.set(0, 1, 0);
            iss.add(issLabel);
        },
        undefined,
        () => {
            const fallbackGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
            const fallbackMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x44aaff, 
                emissive: 0x2299ff, 
                emissiveIntensity: 1.5 
            });
            iss = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
            iss.rotation.z = Math.PI;
            iss.position.set(issRadius, 0, 0);
            issOrbit.add(iss);
        }
    );
}

// ============================
// 🔁 Update ISS
// ============================
export function updateISS(time, rotationSpeed, camera) {
    if (issOrbit && iss) {
        issOrbit.rotation.y += issSpeed * rotationSpeed * 0.05;
        issOrbit.rotation.z += orbitPrecessionSpeed * rotationSpeed * 0.02;
        if (issLabel) issLabel.lookAt(camera.position);
    }
}

// ============================
// 🎧 Chill / ISS View Mode
// ============================
let isFPSMode = false;
let chillImage = null;
let chillMusic = null;

let previousCamPos = new THREE.Vector3();
let previousCamLook = new THREE.Vector3();

export function toggleFPS(camera, controls, earth) {
    if (!iss) return;
     isFPSMode = !isFPSMode;

    if (isFPSMode) {
        // Lưu lại vị trí hiện tại của camera
        previousCamPos.copy(camera.position);
        controls.enabled = false;

        // Xác định vị trí ISS trong thế giới
        const issWorldPos = new THREE.Vector3();
        iss.getWorldPosition(issWorldPos);

        // Hiệu ứng zoom đến ISS
        new TWEEN.Tween(camera.position)
            .to({
                x: issWorldPos.x + 0.4,
                y: issWorldPos.y + 0.2,
                z: issWorldPos.z + 2.25
            }, 2500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => camera.lookAt(issWorldPos))
            .onComplete(() => enterFPSMode(camera, earth))
            .start();

    } else {
        exitFPSMode(camera, controls);
    }
}

// ============================
// ✨ Hiệu ứng Chill Mode
// ============================
function enterFPSMode(camera, earth) {
    // ISS fade-out dần
    const fadeOut = { opacity: 1 };
    new TWEEN.Tween(fadeOut)
        .to({ opacity: 0 }, 1500)
        .onUpdate(() => {
            if (iss) iss.traverse(c => { if (c.material) { c.material.opacity = fadeOut.opacity; c.material.transparent = true; } });
            if (issLabel) issLabel.material.opacity = fadeOut.opacity;
            if (earthMaterial) earthMaterial.emissiveIntensity = 0.5 + (1 - fadeOut.opacity) * 0.5;
        })
        .onComplete(() => {
            if (iss) iss.visible = false;
            if (issLabel) issLabel.visible = false;
        })
        .start();

    // Hiện overlay sau khi fade-out xong
    setTimeout(() => {
        if (!chillImage) {
            chillImage = document.createElement('img');
            chillImage.src = '../textures/iss_view.png';
            Object.assign(chillImage.style, {
                position: 'fixed',
                top: '0', left: '0',
                width: '100%', height: '100%',
                objectFit: 'cover',
                opacity: '0',
                transition: 'opacity 2s ease',
                pointerEvents: 'none'
            });
            document.body.appendChild(chillImage);
        }
        chillImage.style.opacity = '1';
    }, 1200);

    // Nhạc chill
    if (!chillMusic) {
        chillMusic = new Audio('../sounds/space.mp3');
        chillMusic.loop = true;
    }
    chillMusic.volume = 0.6;
    chillMusic.play();
}

function exitFPSMode(camera, controls) {
    controls.enabled = true;

    // Hiện lại ISS
    if (iss) {
        iss.visible = true;
        iss.traverse(c => { if (c.material) { c.material.transparent = true; c.material.opacity = 0; } });
    }
    if (issLabel) {
        issLabel.visible = true;
        issLabel.material.transparent = true;
        issLabel.material.opacity = 0;
    }

    // Fade-in ISS trở lại
    const fadeIn = { opacity: 0 };
    new TWEEN.Tween(fadeIn)
        .to({ opacity: 1 }, 1500)
        .onUpdate(() => {
            if (iss) iss.traverse(c => { if (c.material) c.material.opacity = fadeIn.opacity; });
            if (issLabel) issLabel.material.opacity = fadeIn.opacity;
        })
        .start();

    // Camera bay về vị trí cũ
    new TWEEN.Tween(camera.position)
        .to({ x: previousCamPos.x, y: previousCamPos.y, z: previousCamPos.z }, 2000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => camera.lookAt(0, 0, 0))
        .start();

    // Ẩn overlay + tắt nhạc
    if (chillImage) chillImage.style.opacity = '0';
    setTimeout(() => {
        if (chillImage && !isFPSMode) {
            chillImage.remove();
            chillImage = null;
        }
    }, 2000);

    if (chillMusic) chillMusic.pause();
}

export { issOrbit };
export { isFPSMode };
