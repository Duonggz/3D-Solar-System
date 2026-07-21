// abc.js
import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { initHehe, updateHehe } from './hehe.js';

// ==========================
// 🌞 1. SCENE, CAMERA, RENDERER
// ==========================
const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000010, 0.00015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 120, 280);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// --- modern Three.js properties (fix warnings) ---
if ('outputColorSpace' in renderer) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
} else if ('outputEncoding' in renderer) {
  // fallback (older versions)
  renderer.outputEncoding = THREE.sRGBEncoding;
}
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.9; // Tăng nhẹ cho tươi sáng hơn
renderer.setClearColor(0x000000, 1);

document.body.appendChild(renderer.domElement);

// ==========================
// 🌟 STARFIELD BACKGROUND - ĐÃ SỬA ĐỂ TỐNG HỢP VỚI GALAXY ZOOM
// ==========================
function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 50000; // Số lượng ngôi sao
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        
        // Vị trí ngẫu nhiên trong không gian
        positions[i3] = (Math.random() - 0.5) * 2000;
        positions[i3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i3 + 2] = (Math.random() - 0.5) * 2000;
        
        // Màu sắc ngẫu nhiên (từ trắng đến xanh nhạt)
        const colorVariation = Math.random();
        let color;
        if (colorVariation > 0.8) {
            color = new THREE.Color(0.9, 0.9, 1.0); // Xanh trắng
        } else if (colorVariation > 0.6) {
            color = new THREE.Color(1.0, 1.0, 0.9); // Trắng vàng
        } else {
            color = new THREE.Color(1.0, 0.9, 0.8); // Vàng nhạt
        }
        
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        // Kích thước ngẫu nhiên
        sizes[i] = Math.random() * 1.5 + 0.5;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
        size: 1.2,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    return stars;
}

const starfieldToggle = document.getElementById("starfieldToggle");

// ⭐ Starfield toggle - ĐÃ SỬA ĐỂ TỐNG HỢP VỚI GALAXY
let stars = null;
let isStarfieldEnabled = false; // Flag để theo dõi trạng thái toggle

if (starfieldToggle && starfieldToggle.checked) {
  stars = createStarfield();
  stars.visible = true;
  isStarfieldEnabled = true;
}

if (starfieldToggle) {
  starfieldToggle.addEventListener("change", (e) => {
    isStarfieldEnabled = e.target.checked;
    if (isStarfieldEnabled && !stars) {
      stars = createStarfield();
      scene.add(stars);
      stars.visible = !isInGalaxyView; // Chỉ hiện nếu không ở galaxy view
    } else if (!isStarfieldEnabled && stars) {
      scene.remove(stars);
      stars.geometry.dispose();
      stars.material.dispose();
      stars = null;
    } else if (stars && !isInGalaxyView) {
      // Nếu không ở galaxy view, cập nhật visible ngay
      stars.visible = isStarfieldEnabled;
    }
    // Nếu đang ở galaxy view, chỉ cập nhật flag (sẽ áp dụng khi zoom in)
  });
}


// Lấy các phần tử từ HTML
const bgm = document.getElementById("bgm");
const soundRange = document.getElementById("soundRange");
const speedRange = document.getElementById("speedRange");
const orbitToggle = document.getElementById("orbitToggle");


// ==========================
// 🎧 2. AUDIO LISTENER
// ==========================
if (bgm) {
  bgm.volume = 0.5;
  bgm.play().catch(() => {}); // tránh lỗi autoplay
}

if (soundRange && bgm) {
  soundRange.addEventListener("input", e => {
    bgm.volume = parseFloat(e.target.value);
  });
}

// 2️⃣ Điều chỉnh tốc độ toàn cầu
window.globalSpeed = 1;
if (speedRange) {
  speedRange.addEventListener("input", e => {
    window.globalSpeed = parseFloat(e.target.value);
  });
}

// 3️⃣ Ẩn/hiện quỹ đạo
if (orbitToggle) {
  orbitToggle.addEventListener("change", e => {
    const show = e.target.checked;
    // Nếu bạn có mảng orbitLines, thì bật/tắt nó ở đây:
    if (window.orbitLines) {
      window.orbitLines.forEach(line => (line.visible = show));
    }
  });
}
// ==========================
// 🌀 3. CONTROLS
// ==========================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.maxDistance = 400;
controls.minDistance = 60;

// ==========================
// 🧭 4. UI ELEMENTS
// ==========================
const speedSlider = document.createElement('input');
speedSlider.type = 'range';
speedSlider.min = '0.1';
speedSlider.max = '5';
speedSlider.step = '0.1';
speedSlider.value = '1';
Object.assign(speedSlider.style, { position: 'absolute', top: '10px', left: '10px', zIndex: 10 });
document.body.appendChild(speedSlider);

const toggleOrbit = document.createElement('input');
toggleOrbit.type = 'checkbox';
toggleOrbit.checked = true;
Object.assign(toggleOrbit.style, { position: 'absolute', top: '40px', left: '10px', zIndex: 10 });
document.body.appendChild(toggleOrbit);

let globalSpeed = 1;
speedSlider.addEventListener('input', e => (globalSpeed = parseFloat(e.target.value)));

// Ẩn hai phần tử tạo ra bằng JS
speedSlider.style.display = "none";
toggleOrbit.style.display = "none";

// Nếu có slider và checkbox trong HTML thật — kết nối lại
if (speedRange) {
  speedRange.addEventListener("input", e => {
    globalSpeed = parseFloat(e.target.value);
    if (window.speedValue) window.speedValue.textContent = globalSpeed.toFixed(1) + 'x';
  });
}

if (orbitToggle) {
  orbitToggle.addEventListener("change", e => {
    const show = e.target.checked;
    orbitLines.forEach(line => (line.visible = show));
    if (window.toggleOrbit) window.toggleOrbit.checked = show;
  });
}

// ==========================
// 💡 5. LIGHTS (dễ nhìn hơn)
// ==========================
scene.add(new THREE.AmbientLight(0x888888, 1.2)); // sáng nền mạnh hơn

const sunLight = new THREE.PointLight(0xfff3c8, 2.8, 2500, 2);
sunLight.castShadow = true;
scene.add(sunLight);

// ==========================
// 🌌 6. BACKGROUND + TEXTURE LOADER
// ==========================
const loader = new THREE.TextureLoader();
loader.load('textures/galaxy.jpg', texture => {
    // modern: texture.colorSpace
    if ('colorSpace' in texture) texture.colorSpace = THREE.SRGBColorSpace;
    else texture.encoding = THREE.sRGBEncoding;
    // VẪN giữ galaxy background nếu bạn muốn, hoặc comment dòng dưới để chỉ dùng starfield
    scene.background = texture;
});

// ==========================
// ☀️ 7. SUN (dùng StandardMaterial để support emissive)
// ==========================
const sunGeometry = new THREE.SphereGeometry(25, 64, 64);
const sunTexture = loader.load('textures/sun.jpg');
if ('colorSpace' in sunTexture) sunTexture.colorSpace = THREE.SRGBColorSpace;

const sunMaterial = new THREE.MeshStandardMaterial({
    map: sunTexture,
    emissive: new THREE.Color(0xff0000),
    emissiveIntensity: 1.6,
    roughness: 1.0,
    metalness: 0.0
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sunLight.position.set(0, 0, 0);
sun.add(sunLight);
scene.add(sun);

// ==========================
// 🪐 8. PLANETS DATA
// ==========================
const planetsData = [
    { name: "Mercury", radius: 3.6, distance: 10, texture: "mercury.jpg", speed: 0.0118, inclination: 7.0 },
    { name: "Venus", radius: 5.4, distance: 15, texture: "venus.jpg", speed: 0.007, inclination: 3.4 },
    { name: "Earth", radius: 6, distance: 20, texture: "earth.jpg", speed: 0.00596, inclination: 0 },
    { name: "Mars", radius: 4.8, distance: 25, texture: "mars.jpg", speed: 0.0048, inclination: 1.85 },
    { name: "Jupiter", radius: 12, distance: 35, texture: "jupiter.jpg", speed: 0.0026, inclination: 1.3 },
    { name: "Saturn", radius: 10.2, distance: 45, texture: "saturn.jpg", speed: 0.00192, inclination: 2.5 },
    { name: "Uranus", radius: 7.2, distance: 55, texture: "uranus.jpg", speed: 0.00136, inclination: 0.77 },
    { name: "Neptune", radius: 7.2, distance: 65, texture: "neptune.jpg", speed: 0.00108, inclination: 1.77 },
    { name: "Pluto", radius: 3.6, distance: 70, texture: "pluto.jpg", speed: 0.00112, inclination: 17.2 },
];

const eccentricity = {
    Mercury: 0.206, Venus: 0.007, Earth: 0.017, Mars: 0.093,
    Jupiter: 0.049, Saturn: 0.056, Uranus: 0.046, Neptune: 0.010, Pluto: 0.244
};

const orbitScale = 3.9;
const planetOrbits = [];
const orbitLines = [];

// ==========================
// 🌍 9. CREATE PLANETS
// ==========================
planetsData.forEach(data => {
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.z = THREE.MathUtils.degToRad(data.inclination || 0);
    scene.add(orbitGroup);

    const a = data.distance * orbitScale;
    const e = eccentricity[data.name] || 0;
    const b = a * Math.sqrt(1 - e * e);

    const planetTexture = loader.load(`textures/${data.texture}`);
    if ('colorSpace' in planetTexture) planetTexture.colorSpace = THREE.SRGBColorSpace;
    else planetTexture.encoding = THREE.sRGBEncoding;

    const planetMaterial = new THREE.MeshStandardMaterial({
        map: planetTexture,
        metalness: 0.2,
        roughness: 0.7 // giảm để sáng hơn
    });
    const planetGeometry = new THREE.SphereGeometry(data.radius, 64, 64);
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(a, 0, 0);
    planet.castShadow = true;
    planet.receiveShadow = true;
    orbitGroup.add(planet);

    // 🪐 Saturn Ring
    if (data.name === "Saturn") {
        const ringGeometry = new THREE.RingGeometry(data.radius + 3.2, data.radius + 9.6, 512);
        const ringTexture = loader.load('textures/P6.png');
        if ('colorSpace' in ringTexture) ringTexture.colorSpace = THREE.SRGBColorSpace;
        else ringTexture.encoding = THREE.sRGBEncoding;
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.92
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
    }

    // 🌍 Label (To và rõ nét)
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8;
    ctx.font = 'bold 180px Arial';
    ctx.strokeText(data.name, 70, 260);
    ctx.fillText(data.name, 70, 260);

    const nameTexture = new THREE.CanvasTexture(canvas);
    // use renderer's max anisotropy for better clarity
    if (renderer.capabilities && renderer.capabilities.getMaxAnisotropy) {
        nameTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }
    const spriteMaterial = new THREE.SpriteMaterial({ map: nameTexture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(a, data.radius + 5, 0);
    orbitGroup.add(sprite);

    // 🌀 Orbit Line (xanh dương)
    const curve = new THREE.EllipseCurve(0, 0, a, b, 0, 2 * Math.PI);
    const points = curve.getPoints(400);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x3399ff, opacity: 0.5, transparent: true });
    const ellipse = new THREE.Line(orbitGeometry, orbitMaterial);
    ellipse.visible = toggleOrbit.checked;
    orbitGroup.add(ellipse);
    orbitLines.push(ellipse);

    // 🌕 Moon (Earth)
    if (data.name === "Earth") {
        const moonOrbit = new THREE.Object3D();
        planet.add(moonOrbit);
        const moonGeometry = new THREE.SphereGeometry(3, 32, 32);
        const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(12, 0, 0);
        moonOrbit.add(moon);
        planetOrbits.push({ orbit: orbitGroup, planet, moonOrbit, moonSpeed: 0.01, speed: data.speed, sprite });
    } else {
                planetOrbits.push({ orbit: orbitGroup, planet, moonOrbit: null, moonSpeed: null, speed: data.speed, sprite });
    }
});

// ==========================
// ☄️ 10. ASTEROID BELTS
// ==========================
function createAsteroidBelt(innerRadius, outerRadius, count, color = 0x888888) {
    const group = new THREE.Group();
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = THREE.MathUtils.lerp(innerRadius, outerRadius, Math.random());
        const height = (Math.random() - 0.5) * 10;
        const size = Math.random() * 0.8 + 0.2;
        const geometry = new THREE.IcosahedronGeometry(size, 1);
        const pos = geometry.attributes.position;
        for (let j = 0; j < pos.count; j++) {
            const x = pos.getX(j), y = pos.getY(j), z = pos.getZ(j);
            const noise = (Math.random() - 0.5) * 0.4;
            pos.setXYZ(j, x + x * noise, y + y * noise, z + z * noise);
        }
        pos.needsUpdate = true;
        geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({
            color, roughness: 1, metalness: 0.2, flatShading: true
        });
        const asteroid = new THREE.Mesh(geometry, material);
        asteroid.position.set(Math.cos(angle) * distance, height, Math.sin(angle) * distance);
        asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        group.add(asteroid);
    }
    return group;
}

const asteroidBelt = createAsteroidBelt(25 * orbitScale, 33 * orbitScale, 1500);
scene.add(asteroidBelt);

const kuiperBelt = createAsteroidBelt(70 * orbitScale, 90 * orbitScale, 2000, 0xaaaaaa);
scene.add(kuiperBelt);

// ==========================
// 🔄 11. ANIMATION + HEHE
// ==========================
toggleOrbit.addEventListener('change', e => orbitLines.forEach(line => (line.visible = e.target.checked)));

// Initialize hehe system (pass scene + camera so hehe.js can use them)
initHehe(scene, camera);

// ==========================
// 🌌 GALAXY ZOOM EFFECT - FIXED VỚI STARFIELD
// ==========================

let galaxy = null;
let isInGalaxyView = false;
const GALAXY_TRANSITION_START = 400; // Giảm xuống để dễ test
const GALAXY_TRANSITION_END = 600;   // Giảm xuống để dễ test

// Tạo thiên hà - SỬA LẠI
function createGalaxy() {
    const galaxyGeometry = new THREE.CircleGeometry(1500, 64); // Hình tròn phẳng cho đĩa thiên hà
    
    const loader = new THREE.TextureLoader();
    const galaxyTexture = loader.load(
        'textures/galaxy_texture.png', // THAY ĐƯỜNG DẪN NÀY BẰNG FILE PNG CỦA BẠN (ví dụ: 'assets/my-galaxy.png')
        function onLoad(texture) {
            // Callback khi texture load thành công
            if ('colorSpace' in texture) texture.colorSpace = THREE.SRGBColorSpace;
            console.log('✅ Galaxy texture loaded');
        },
        function onProgress(progress) {
            // Optional: Theo dõi tiến độ load (nếu cần)
            console.log('Loading galaxy texture: ' + (progress.loaded / progress.total * 100) + '%');
        },
        function onError(error) {
            // Xử lý lỗi load (ví dụ: file không tồn tại)
            console.error('❌ Error loading galaxy texture:', error);
        }
    );
    
    const galaxyMaterial = new THREE.MeshBasicMaterial({
        map: galaxyTexture,
        side: THREE.DoubleSide, // Xem từ cả hai mặt cho đĩa phẳng
        transparent: true,
        opacity: 0
    });
    
    galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
    galaxy.rotation.x = -Math.PI; // Xoay để đĩa nằm ngang (như thiên hà thực tế)
    galaxy.visible = false;
    scene.add(galaxy);
    
    console.log('✅ Galaxy created (with PNG texture)');
    return galaxy;
}

// Cập nhật hiệu ứng zoom thiên hà - ĐÃ SỬA ĐỂ TỐNG HỢP STARFIELD
function updateGalaxyZoom() {
    if (!galaxy) return;
    
    const distance = camera.position.distanceTo(controls.target);
    // console.log('Camera distance:', distance); // Bỏ comment để debug
    
    if (distance > GALAXY_TRANSITION_START && !isInGalaxyView) {
        // Bắt đầu chuyển sang view thiên hà
        const progress = Math.min((distance - GALAXY_TRANSITION_START) / 
                                (GALAXY_TRANSITION_END - GALAXY_TRANSITION_START), 1);
        
        if (!galaxy.visible) {
            galaxy.visible = true;
            // Đặt thiên hà tại vị trí camera, với offset nhẹ để tránh chồng lấp
            galaxy.position.copy(camera.position).add(new THREE.Vector3(0, 0, -1000));
        }
        
        // Mờ dần hệ mặt trời
        sun.visible = progress < 0.5; // Ẩn mặt trời khi progress > 0.5
        planetOrbits.forEach(p => {
            p.orbit.visible = progress < 0.5;
            if (p.sprite) p.sprite.visible = progress < 0.3;
        });
        asteroidBelt.visible = progress < 0.5;
        kuiperBelt.visible = progress < 0.5;
        
        // ẨN STARFIELD KHI VÀO GALAXY VIEW
        if (stars) {
            stars.visible = false;
        }
        
        // Hiện dần thiên hà (opacity từ 0 đến 0.9)
        galaxy.material.opacity = progress * 0.9;
        
        if (progress >= 0.95) {
            isInGalaxyView = true;
            console.log('🌌 Entered galaxy view (PNG texture, starfield hidden)');
        }
        
    } else if (distance <= GALAXY_TRANSITION_START && isInGalaxyView) {
        // Quay lại hệ mặt trời
        const progress = 1 - (distance / GALAXY_TRANSITION_START);
        
        // Hiện lại hệ mặt trời dần dần
        sun.visible = true;
        planetOrbits.forEach(p => {
            p.orbit.visible = true;
            if (p.sprite) p.sprite.visible = progress > 0.7;
        });
        asteroidBelt.visible = true;
        kuiperBelt.visible = true;
        
        // HIỆN LẠI STARFIELD KHI RA KHỎI GALAXY VIEW (nếu toggle enabled)
        if (stars) {
            stars.visible = isStarfieldEnabled;
        }
        
        // Ẩn dần thiên hà
        galaxy.material.opacity = progress * 0.9;
        
        if (progress <= 0.05) {
            isInGalaxyView = false;
            galaxy.visible = false;
            galaxy.material.opacity = 0; // Đảm bảo opacity về 0
            console.log('☀️ Returned to solar system (starfield restored if enabled)');
        }
    } else if (distance < GALAXY_TRANSITION_START && galaxy.visible) {
        // Đảm bảo thiên hà ẩn khi ở gần
        galaxy.visible = false;
        galaxy.material.opacity = 0;
        
        // Đảm bảo starfield hiện nếu enabled (trường hợp edge case)
        if (stars && !isInGalaxyView) {
            stars.visible = isStarfieldEnabled;
        }
    }
}


// Khởi tạo thiên hà - GỌI SAU KHI TẠO SCENE
createGalaxy();

// CẬP NHẬT CONTROLS - SỬA LẠI
controls.maxDistance = 2000; // Cho phép zoom ra xa hơn
controls.minDistance = 5;   // Và zoom vào gần hơn

// Sự kiện controls - SỬA LẠI
controls.addEventListener('change', function() {
    // Luôn cập nhật khi controls thay đổi
    updateGalaxyZoom();
});

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    updateHehe(delta); // cập nhật hệ thống bắn ảnh

    // 🆕 Cập nhật hiệu ứng zoom thiên hà - LUÔN GỌI
    updateGalaxyZoom();
    
    // Xoay thiên hà nhẹ nếu đang visible
    if (galaxy && galaxy.visible) {
        galaxy.rotation.y += 0.0001 * globalSpeed;
    }

    planetOrbits.forEach(p => {
        p.orbit.rotation.y += p.speed * globalSpeed;
        if (p.moonOrbit) p.moonOrbit.rotation.y += p.moonSpeed * globalSpeed;
        if (p.planet) p.planet.rotation.y += 0.01;

        // Dynamic label scaling
        if (p.sprite) {
            const dist = camera.position.distanceTo(p.sprite.position);
            const scale = dist * 0.08; // to hơn một chút
            p.sprite.scale.set(scale, scale * 0.3, 1);
        }
    });

    asteroidBelt.rotation.y += 0.0003 * globalSpeed;
    kuiperBelt.rotation.y += 0.0001 * globalSpeed;
    sun.rotation.y += 0.005 * globalSpeed;

    // 🌟 XOAY STARFIELD NHẸ (chỉ nếu visible - tối ưu)
    if (stars && stars.visible) {
        stars.rotation.y += 0.0001 * globalSpeed;
    }

    controls.update();
    renderer.render(scene, camera);
}

// Thêm vào cuối file abc.js, trước dòng "animate();"

// 🚀 Hàm zoom vào hệ mặt trời
window.startSolarSystemJourney = function() {
  // Hiệu ứng zoom camera vào hệ mặt trời
  const startPosition = camera.position.clone();
  const targetPosition = new THREE.Vector3(0, 50, 120); // Vị trí gần hệ mặt trời hơn
  
  const startTime = Date.now();
  const duration = 2000; // 2 giây
  
  function zoomAnimation() {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function để mượt mà
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    // Di chuyển camera
    camera.position.lerpVectors(startPosition, targetPosition, easeOut);
    controls.target.set(0, 0, 0);
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(zoomAnimation);
    }
  }
  
  zoomAnimation();
};

// 🎯 Đảm bảo camera controls được cập nhật
controls.addEventListener('change', function() {
  renderer.render(scene, camera);
});


animate();

// ==========================
// ↔️  Handle resize
// ==========================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================
// 🎮 12. EXPORT GLOBAL VARIABLES FOR UI
// ==========================
window.globalSpeed = globalSpeed;
window.toggleOrbitLines = function(show) {
    orbitLines.forEach(line => (line.visible = show));
};

// Update global speed when UI slider changes
window.updateGlobalSpeed = function(speed) {
    globalSpeed = speed;
};

// Connect UI speed slider to our global speed
speedSlider.addEventListener('input', e => {
    globalSpeed = parseFloat(e.target.value);
    if (window.speedValue) {
        window.speedValue.textContent = globalSpeed.toFixed(1) + 'x';
    }
});

// Connect UI orbit toggle
toggleOrbit.addEventListener('change', e => {
    orbitLines.forEach(line => (line.visible = e.target.checked));
    if (window.toggleOrbit) {
        window.toggleOrbit.checked = e.target.checked;
    }
});

// ==========================
// 🎛️ ẨN/HIỆN GIAO DIỆN SLIDER & CHECKBOX
// ==========================

// Gói 2 phần tử vào một container cho dễ xử lý
const uiContainer = document.createElement('div');
uiContainer.style.position = 'absolute';
uiContainer.style.top = '10px';
uiContainer.style.left = '10px';
uiContainer.style.zIndex = '100';
uiContainer.appendChild(speedSlider);
uiContainer.appendChild(toggleOrbit);
document.body.appendChild(uiContainer);

// Ẩn mặc định
uiContainer.style.display = 'none';

// Khi nhấn phím "U" → bật/tắt giao diện
window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'u') {
    uiContainer.style.display = uiContainer.style.display === 'none' ? 'block' : 'none';
  }
});

// Khi click ra ngoài (không phải trong container) thì ẩn đi
window.addEventListener('click', e => {
  if (uiContainer.style.display === 'block' && !uiContainer.contains(e.target)) {
    uiContainer.style.display = 'none';
  }
});

// Tooltip nhỏ báo người dùng cách mở lại
const tip = document.createElement('div');
tip.textContent = 'Đây là bản Demo giao diện';
Object.assign(tip.style, {
  position: 'absolute',
  bottom: '10px',
  left: '10px',
  color: '#aaa',
  fontSize: '12px',
  fontFamily: 'Arial',
  opacity: 0.6
});
document.body.appendChild(tip);
