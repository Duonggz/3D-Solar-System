import * as THREE from 'three';

// Texture Loader với fallback (không log, chỉ đếm loadedTextures)
const loader = new THREE.TextureLoader();
let loadedTextures = 0;
let totalTextures = 11; // Galaxy + Sun + Glow + 8 Planets + Rings

function loadTextureWithLog(path, fallbackColor = null) {
    return new Promise((resolve, reject) => {
        loader.load(
            path,
            (texture) => {
                loadedTextures++;
                resolve(texture);
            },
            undefined,
            (error) => {
                loadedTextures++;
                reject({ path, error, fallbackColor });
            }
        );
    });
}

// Planet data - ĐIỀU CHỈNH VỊ TRÍ NGẪU NHIÊN VÀ TỐC ĐỘ
const planetsData = [
    { name: "Mercury", radius: 8, distance: 120, speed: 0.0008, rotationSpeed: 0.008, texture: "mercury.jpg", fallbackColor: 0x8c7853 },
    { name: "Venus", radius: 15, distance: 180, speed: 0.0006, rotationSpeed: 0.004, texture: "venus.jpg", fallbackColor: 0xffc649 },
    { name: "Earth", radius: 16, distance: 250, speed: 0.0005, rotationSpeed: 0.01, texture: "earth.jpg", fallbackColor: 0x6b93d6 },
    { name: "Mars", radius: 12, distance: 350, speed: 0.0004, rotationSpeed: 0.009, texture: "mars.jpg", fallbackColor: 0xcd5c5c },
    { name: "Jupiter", radius: 35, distance: 500, speed: 0.0003, rotationSpeed: 0.02, texture: "jupiter.jpg", fallbackColor: 0xd8ca9d },
    { name: "Saturn", radius: 30, distance: 700, speed: 0.00025, rotationSpeed: 0.015, texture: "saturn.jpg", fallbackColor: 0xfad5a5 },
    { name: "Uranus", radius: 20, distance: 900, speed: 0.0002, rotationSpeed: 0.012, texture: "uranus.jpg", fallbackColor: 0x4fd0e7 },
    { name: "Neptune", radius: 19, distance: 1100, speed: 0.00015, rotationSpeed: 0.011, texture: "neptune.jpg", fallbackColor: 0x4b70dd }
];

// Độ lệch quỹ đạo elip (eccentricity)
const eccentricity = {
    Mercury: 0.206,
    Venus: 0.007,
    Earth: 0.017,
    Mars: 0.093,
    Jupiter: 0.049,
    Saturn: 0.056,
    Uranus: 0.046,
    Neptune: 0.010
};

// Độ nghiêng trục ngẫu nhiên cho các hành tinh (tính bằng radian)
const axialTilts = {
    Mercury: 0.034,
    Venus: 0.471, // Venus quay ngược
    Earth: 0.409,
    Mars: 0.439,
    Jupiter: 0.054,
    Saturn: 0.466, // Sao Thổ có độ nghiêng trục
    Uranus: 1.706, // Uranus nằm ngang
    Neptune: 0.494
};

let planetOrbits = [];
let orbitLines = [];
let sun;

// Helper functions - SỬA LẠI HOÀN TOÀN HÀM TẠO VÀNH ĐAI
function addSaturnRings(planet, data) {
    if (data.name === "Saturn") {
        loadTextureWithLog('../textures/P6.png', 0xaaaaaa)
            .then((ringTexture) => {
                const ringGeometry = new THREE.RingGeometry(data.radius * 1.3, data.radius * 1.9, 512);
                const ringMaterial = new THREE.MeshBasicMaterial({ 
                    map: ringTexture, 
                    side: THREE.DoubleSide, 
                    transparent: true,
                    opacity: 0.7
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                
                // Đặt vành đai nằm ngang hoàn toàn
                ring.rotation.x = Math.PI / 2; // 90 độ để nằm ngang
                
                // THAY ĐỔI QUAN TRỌNG: Thêm vành đai trực tiếp vào scene thay vì vào planet
                // Điều này giúp vành đai hoàn toàn độc lập với rotation của hành tinh
                
                // Lưu thông tin vành đai để cập nhật vị trí
                const saturnOrbit = planetOrbits.find(p => p.planet && p.planet.userData.name === 'Saturn');
                if (saturnOrbit) {
                    saturnOrbit.ring = ring;
                    saturnOrbit.ring.visible = true;
                }
            })
            .catch((err) => {
                const ringGeometry = new THREE.RingGeometry(data.radius * 1.3, data.radius * 1.9, 512);
                const ringMaterial = new THREE.MeshBasicMaterial({ 
                    color: err.fallbackColor, 
                    side: THREE.DoubleSide, 
                    transparent: true,
                    opacity: 0.6
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                
                ring.rotation.x = Math.PI / 2; // 90 độ để nằm ngang
                
                // Lưu thông tin vành đai
                const saturnOrbit = planetOrbits.find(p => p.planet && p.planet.userData.name === 'Saturn');
                if (saturnOrbit) {
                    saturnOrbit.ring = ring;
                    saturnOrbit.ring.visible = true;
                }
            });
    }
}

function addOrbitLine(a, b, name) {
    const curve = new THREE.EllipseCurve(0, 0, a, b, 0, 2 * Math.PI);
    const points = curve.getPoints(400);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
    const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0x88aaff, 
        opacity: 0.1, 
        transparent: true
    });
    const ellipse = new THREE.Line(orbitGeometry, orbitMaterial);
    
    // Xoay đường quỹ đạo ngẫu nhiên
    const randomRotationX = (Math.random() - 0.5) * 0.3; // -15° đến +15°
    const randomRotationZ = (Math.random() - 0.5) * 0.3;
    ellipse.rotation.x = randomRotationX;
    ellipse.rotation.z = randomRotationZ;
    
    return ellipse;
}

function addMoonIfEarth(planet, data) {
    if (data.name === "Earth") {
        const moonOrbit = new THREE.Group();
        planet.add(moonOrbit);

        const moonGeometry = new THREE.SphereGeometry(4, 24, 24);
        const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(25, 0, 0);
        moonOrbit.add(moon);

        setTimeout(() => {
            const earthOrbit = planetOrbits.find(p => p.planet && p.planet.userData.name === 'Earth');
            if (earthOrbit) {
                earthOrbit.moonOrbit = moonOrbit;
                earthOrbit.moonSpeed = 0.005; // Tăng tốc độ mặt trăng
            }
        }, 100);
    }
}

// Hàm tạo vị trí ngẫu nhiên trên quỹ đạo
function getRandomOrbitPosition(distance, eccentricity) {
    const a = distance;
    const e = eccentricity || 0;
    const b = a * Math.sqrt(1 - e * e);
    
    // Góc ngẫu nhiên trên quỹ đạo
    const randomAngle = Math.random() * Math.PI * 2;
    
    // Tính vị trí trên elip
    const x = a * Math.cos(randomAngle);
    const z = b * Math.sin(randomAngle);
    
    return new THREE.Vector3(x, 0, z);
}

// Function init space environment
export function initSpace() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Lights
    const ambient = new THREE.AmbientLight(0x808080, 1.2);
    scene.add(ambient);

    // Background
    loadTextureWithLog('../textures/galaxy.jpg', 0x000011)
        .then((texture) => { scene.background = texture; })
        .catch((err) => { scene.background = new THREE.Color(err.fallbackColor); });

    // Sun setup
    loadTextureWithLog('../textures/sun.jpg', 0xffff00)
        .then((sunTexture) => {
            const sunGeometry = new THREE.SphereGeometry(40, 32, 32);
            const sunMaterial = new THREE.MeshPhongMaterial({ 
                map: sunTexture, 
                emissive: 0xffa500, 
                emissiveIntensity: 1.5 
            });
            sun = new THREE.Mesh(sunGeometry, sunMaterial);
            sun.position.set(0, 0, 0);
            scene.add(sun);

            const sunLight = new THREE.PointLight(0xffdd88, 3, 10000);
            sun.add(sunLight);

            loadTextureWithLog('../textures/glow.jpg', 0xffffff)
                .then((glowTexture) => {
                    const glowGeometry = new THREE.SphereGeometry(55, 32, 32);
                    const glowMaterial = new THREE.MeshBasicMaterial({ 
                        map: glowTexture, 
                        blending: THREE.AdditiveBlending, 
                        transparent: true, 
                        opacity: 0.5 
                    });
                    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                    sun.add(glow);
                })
                .catch((err) => {
                    const glowGeometry = new THREE.SphereGeometry(50, 32, 32);
                    const glowMaterial = new THREE.MeshBasicMaterial({ 
                        color: err.fallbackColor, 
                        blending: THREE.AdditiveBlending, 
                        transparent: true, 
                        opacity: 0.4 
                    });
                    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                    sun.add(glow);
                });
        })
        .catch((err) => {
            const sunGeometry = new THREE.SphereGeometry(40, 32, 32);
            const sunMaterial = new THREE.MeshPhongMaterial({ 
                color: err.fallbackColor, 
                emissive: 0xffa500, 
                emissiveIntensity: 1.5 
            });
            sun = new THREE.Mesh(sunGeometry, sunMaterial);
            sun.position.set(0, 0, 0);
            scene.add(sun);

            const sunLight = new THREE.PointLight(0xffdd88, 3, 8000);
            sun.add(sunLight);
        });

    // Planets setup với vị trí ngẫu nhiên
    planetsData.forEach((data) => {
        const orbit = new THREE.Group();
        
        // Thêm độ nghiêng ngẫu nhiên cho mặt phẳng quỹ đạo
        const orbitTiltX = (Math.random() - 0.5) * 0.4; // -20° đến +20°
        const orbitTiltZ = (Math.random() - 0.5) * 0.4;
        orbit.rotation.x = orbitTiltX;
        orbit.rotation.z = orbitTiltZ;
        
        scene.add(orbit);

        loadTextureWithLog(`../textures/${data.texture}`, data.fallbackColor)
            .then((texture) => {
                const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
                const material = new THREE.MeshStandardMaterial({ map: texture });
                const planet = new THREE.Mesh(geometry, material);
                planet.userData = { name: data.name };

                const a = data.distance;
                const e = eccentricity[data.name] || 0;
                const b = a * Math.sqrt(1 - e * e);
                
                // Vị trí ngẫu nhiên trên quỹ đạo
                const randomPosition = getRandomOrbitPosition(data.distance, e);
                planet.position.copy(randomPosition);
                
                // Thêm độ nghiêng trục cho hành tinh
                const axialTilt = axialTilts[data.name] || 0;
                planet.rotation.z = axialTilt;
                
                orbit.add(planet);

                // Tạo vành đai (chỉ cho Sao Thổ)
                if (data.name === "Saturn") {
                    addSaturnRings(planet, data);
                }
                
                // Đường quỹ đạo
                const line = addOrbitLine(a, b, data.name);
                // Đồng bộ độ nghiêng đường quỹ đạo với orbit group
                line.rotation.x = orbitTiltX;
                line.rotation.z = orbitTiltZ;
                scene.add(line);
                orbitLines.push(line);
                
                addMoonIfEarth(planet, data);

                planetOrbits.push({ 
                    orbit, 
                    speed: data.speed, 
                    planet, 
                    radius: data.radius, 
                    moonOrbit: null, 
                    moonSpeed: null,
                    rotationSpeed: data.rotationSpeed,
                    axialTilt: axialTilt,
                    ring: null // Khởi tạo ring
                });
            })
            .catch((err) => {
                const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
                const material = new THREE.MeshStandardMaterial({ color: err.fallbackColor });
                const planet = new THREE.Mesh(geometry, material);
                planet.userData = { name: data.name };

                const a = data.distance;
                const e = eccentricity[data.name] || 0;
                const b = a * Math.sqrt(1 - e * e);
                
                // Vị trí ngẫu nhiên trên quỹ đạo
                const randomPosition = getRandomOrbitPosition(data.distance, e);
                planet.position.copy(randomPosition);
                
                // Thêm độ nghiêng trục cho hành tinh
                const axialTilt = axialTilts[data.name] || 0;
                planet.rotation.z = axialTilt;
                
                orbit.add(planet);

                // Tạo vành đai (chỉ cho Sao Thổ)
                if (data.name === "Saturn") {
                    addSaturnRings(planet, data);
                }
                
                // Đường quỹ đạo
                const line = addOrbitLine(a, b, data.name);
                // Đồng bộ độ nghiêng đường quỹ đạo với orbit group
                line.rotation.x = orbitTiltX;
                line.rotation.z = orbitTiltZ;
                scene.add(line);
                orbitLines.push(line);
                
                addMoonIfEarth(planet, data);

                planetOrbits.push({ 
                    orbit, 
                    speed: data.speed, 
                    planet, 
                    radius: data.radius, 
                    moonOrbit: null, 
                    moonSpeed: null,
                    rotationSpeed: data.rotationSpeed,
                    axialTilt: axialTilt,
                    ring: null
                });
            });
    });

    // THÊM VÀNH ĐAI VÀO SCENE SAU KHI TẤT CẢ HÀNH TINH ĐƯỢC TẠO
    setTimeout(() => {
        planetOrbits.forEach(p => {
            if (p.planet.userData.name === "Saturn" && p.ring) {
                scene.add(p.ring);
            }
        });
    }, 200);

    return { scene, camera, renderer, planetOrbits, sun, orbitLines };
}

// Function update environment với tự quay và quỹ đạo - SỬA LẠI CHO VÀNH ĐAI
export function animateEnvironment() {
    planetOrbits.forEach(p => {
        if (p.orbit) {
            // Quay quanh mặt trời
            p.orbit.rotation.y += p.speed;
        }
        if (p.planet) {
            // Tự quay quanh trục với tốc độ riêng
            p.planet.rotation.y += p.rotationSpeed;
            
            // Đặc biệt xử lý cho Sao Thổ: cập nhật vị trí vành đai
            if (p.planet.userData.name === "Saturn" && p.ring) {
                // Lấy vị trí thế giới của hành tinh
                const worldPosition = new THREE.Vector3();
                p.planet.getWorldPosition(worldPosition);
                
                // Cập nhật vị trí vành đai theo hành tinh
                p.ring.position.copy(worldPosition);
                
                // QUAN TRỌNG: Vành đai hoàn toàn không quay
                // Giữ nguyên rotation cố định
                p.ring.rotation.x = Math.PI / 2; // Luôn nằm ngang
                p.ring.rotation.y = 0; // Không quay
                p.ring.rotation.z = 0; // Không nghiêng
            }
        }
        if (p.moonOrbit) {
            // Mặt trăng quay quanh hành tinh
            p.moonOrbit.rotation.y += p.moonSpeed;
        }
    });
    
    // Mặt trời tự quay
    if (sun) sun.rotation.y += 0.002;
}