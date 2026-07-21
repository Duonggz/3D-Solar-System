import * as THREE from './three.module.js';

let scene, camera;
let flyingImages = [];
const imageSpeed = 0.5;
const textureLoader = new THREE.TextureLoader();

const keyState = { space: false, letter: null };

export function initHehe(_scene, _camera) {
    scene = _scene;
    camera = _camera;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

function onKeyDown(e) {
    if (e.code === 'Space') keyState.space = true;
    else if (keyState.space && /^[VMACD]$/.test(e.key.toUpperCase())) {
        keyState.letter = e.key.toUpperCase();
        shootImage(keyState.letter);
    }
}

function onKeyUp(e) {
    if (e.code === 'Space') keyState.space = false;
    if (/^[VMACD]$/.test(e.key.toUpperCase())) keyState.letter = null;
}

function shootImage(letter) {
    if (!camera || !scene) return;

    const texture = textureLoader.load(`./textures/${letter}.png`);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 1.0
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(10, 10, 1);

    sprite.position.copy(camera.position);

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const velocity = dir.multiplyScalar(imageSpeed);

    scene.add(sprite);
    flyingImages.push({ sprite, velocity, life: 0, trail: null });
}

function createMeteorTrail(position, direction) {
    const trailGeom = new THREE.BufferGeometry();
    const trailMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        transparent: true,
        opacity: 0.9
    });

    const trailPositions = new Float32Array(20 * 3);
    for (let i = 0; i < 20; i++) {
        const offset = i * 3;
        trailPositions[offset] = position.x - direction.x * i * 2;
        trailPositions[offset + 1] = position.y - direction.y * i * 2;
        trailPositions[offset + 2] = position.z - direction.z * i * 2;
    }

    trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

    const trail = new THREE.Points(trailGeom, trailMat);
    scene.add(trail);
    return { mesh: trail, life: 0 };
}

export function updateHehe(deltaTime) {
    for (let i = flyingImages.length - 1; i >= 0; i--) {
        const obj = flyingImages[i];
        const sprite = obj.sprite;

        sprite.position.addScaledVector(obj.velocity, deltaTime * 60);
        obj.life += deltaTime;

        // Giai đoạn 1: ảnh mờ dần
        if (obj.life > 1.0 && obj.life <= 1.5) {
            sprite.material.opacity = 1.5 - obj.life;
        }

        // Giai đoạn 2: chuyển sang vệt sáng
        if (obj.life > 1.5 && !obj.trail) {
            // Tạo vệt sáng tại vị trí hiện tại
            obj.trail = createMeteorTrail(sprite.position.clone(), obj.velocity.clone().normalize());
            scene.remove(sprite);
        }

        // Giai đoạn 3: cập nhật vệt sáng
        if (obj.trail) {
            obj.trail.life += deltaTime;
            obj.trail.mesh.material.opacity = Math.max(0, 1.0 - obj.trail.life * 1.2);
            obj.trail.mesh.scale.multiplyScalar(0.98);

            if (obj.trail.life > 1.2) {
                scene.remove(obj.trail.mesh);
                flyingImages.splice(i, 1);
            }
        }
    }
}
