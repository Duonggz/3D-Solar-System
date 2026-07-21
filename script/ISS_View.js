import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import TWEEN from 'three/addons/libs/tween.module.js';

let stationaryISS;
let isViewMode = false;
let originalCameraPosition;
let originalControlsEnabled;
let issModel;
let issAngle = 0; // Góc quay quanh Trái Đất
const orbitSpeed = 0.002; // Tốc độ bay quanh
const orbitRadius = 3; // Khoảng cách tới tâm Trái Đất

// ============================
// 🛰️ Thêm ISS vào scene
// ============================
export function addISSView(scene, earth, camera, controls) {
    stationaryISS = new THREE.Group();
    stationaryISS.position.copy(earth.position);
    scene.add(stationaryISS);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
        '../models/iss.glb',
        (gltf) => {
            issModel = gltf.scene;
            issModel.scale.set(0.1, 0.1, 0.1);
            stationaryISS.add(issModel);

            // Cho vật liệu chuẩn (tránh bị tối đen)
            issModel.traverse((child) => {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity = 1;
                    child.material.side = THREE.DoubleSide;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Đặt vị trí khởi đầu
            const x = orbitRadius;
            const y = 0;
            const z = 0;
            issModel.position.set(x, y, z);

            console.log('✅ Stationary ISS loaded (orbit mode active)');
        },
        undefined,
        (error) => {
            console.warn('⚠️ ISS model load failed, using fallback.');
            const fallbackGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
            const fallbackMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 100 });
            const fallbackISS = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
            fallbackISS.rotation.z = Math.PI;
            fallbackISS.scale.set(0.01, 0.01, 0.01);
            issModel = fallbackISS;
            stationaryISS.add(issModel);
        }
    );

    stationaryISS.visible = false;
}

// ============================
// 🔄 Update ISS orbit quanh Trái Đất
// ============================
export function updateISSView(time, rotationSpeed, camera, earth) {
    if (!stationaryISS || !issModel) return;

    // Tăng góc quay quanh Trái Đất
    issAngle += orbitSpeed;

    // Tính vị trí ISS quanh Trái Đất (trên quỹ đạo nghiêng nhẹ)
    const inclination = 0.3; // Độ nghiêng quỹ đạo (radians)
    const x = earth.position.x + orbitRadius * Math.cos(issAngle);
    const y = earth.position.y + orbitRadius * Math.sin(issAngle) * Math.sin(inclination);
    const z = earth.position.z + orbitRadius * Math.sin(issAngle) * Math.cos(inclination);

    issModel.position.set(x, y, z);

    // ISS luôn hướng vuông góc với hướng bay (tự quay mượt)
    issModel.lookAt(earth.position);

    // Nếu đang ở view mode: cập nhật camera theo ISS
    if (isViewMode) {
        const cameraOffset = new THREE.Vector3(0, 0.05, 0.15);
        const issWorldPos = issModel.getWorldPosition(new THREE.Vector3());
        const newCamPos = issWorldPos.clone().add(cameraOffset);
        camera.position.lerp(newCamPos, 0.05);
        camera.lookAt(issWorldPos);
    }
}

// ============================
// 👁️ Toggle View Mode ('C')
// ============================
export function toggleView(camera, controls, earth, orbitISS) {
    if (!stationaryISS) return;
    isViewMode = !isViewMode;

    if (isViewMode) {
        originalCameraPosition = camera.position.clone();
        originalControlsEnabled = controls.enabled;

        stationaryISS.visible = true;
        if (orbitISS) orbitISS.visible = false;

        const issWorldPos = new THREE.Vector3();
        issModel.getWorldPosition(issWorldPos);

        const cameraOffset = new THREE.Vector3(0, 0.05, 0.15);
        const newCamPos = issWorldPos.clone().add(cameraOffset);

        new TWEEN.Tween(camera.position)
            .to({ x: newCamPos.x, y: newCamPos.y, z: newCamPos.z }, 2000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                camera.lookAt(issWorldPos);
                controls.target.copy(issWorldPos);
                controls.update();
            })
            .start();

        controls.enabled = true;
        controls.target.copy(issWorldPos);
        controls.update();

        console.log('🎥 View Mode ON – camera following orbiting ISS');
    } else {
        stationaryISS.visible = false;
        if (orbitISS) orbitISS.visible = true;

        const backPos = originalCameraPosition || new THREE.Vector3(0, 0, 5);
        const backTarget = earth.position.clone();

        new TWEEN.Tween(camera.position)
            .to({ x: backPos.x, y: backPos.y, z: backPos.z }, 1500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                camera.lookAt(backTarget);
                controls.target.copy(backTarget);
                controls.update();
            })
            .start();

        controls.enabled = originalControlsEnabled;
        console.log('🔁 View Mode OFF – camera back to orbit view');
    }
}

let isBackViewMode = false;
let backViewCameraPos;
let backViewControlsEnabled;

export function toggleBackView(camera, controls, earth) {
    if (!stationaryISS || !issModel) return;
    isBackViewMode = !isBackViewMode;

    if (isBackViewMode) {
        backViewCameraPos = camera.position.clone();
        backViewControlsEnabled = controls.enabled;

        stationaryISS.visible = true;

        // Lấy vị trí ISS trong không gian
        const issWorldPos = new THREE.Vector3();
        issModel.getWorldPosition(issWorldPos);

        // 🔹 Đặt camera sau ISS (xa hơn một chút)
        const offset = new THREE.Vector3(0, 0.05, 0.3); // xa hơn chế độ C
        const newCamPos = issWorldPos.clone().add(offset);

        // 🔹 Bay mượt đến vị trí mới
        new TWEEN.Tween(camera.position)
            .to({ x: newCamPos.x, y: newCamPos.y, z: newCamPos.z }, 2000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                camera.lookAt(earth.position);
                controls.target.copy(earth.position);
                controls.update();
            })
            .start();

        controls.enabled = true;
        controls.target.copy(earth.position);
        controls.update();

        console.log('🎥 Back View ON – camera behind ISS looking at Earth');
    } else {
        // 🔹 Quay về vị trí cũ
        const backPos = backViewCameraPos || new THREE.Vector3(0, 0, 5);
        const backTarget = earth.position.clone();

        new TWEEN.Tween(camera.position)
            .to({ x: backPos.x, y: backPos.y, z: backPos.z }, 1500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                camera.lookAt(backTarget);
                controls.target.copy(backTarget);
                controls.update();
            })
            .start();

        controls.enabled = backViewControlsEnabled;
        console.log('🔁 Back View OFF – return to normal camera');
    }
}

export { isBackViewMode };
export { isViewMode };
export { stationaryISS as stationaryISSGroup };
