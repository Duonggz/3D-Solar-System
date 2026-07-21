import * as THREE from "../three.module.js";
import { 
    scene, camera, renderer, controls, loader, sun, 
    planetsData, planetOrbits, orbitLines, createPlanets, 
    animatePlanets, setGlobalSpeed, toggleOrbits,
    globalSpeed
} from './abc.js';

import {
    createMenu, createUIElements, createDimOverlay,
    setupUIEventListeners, showPlanetInfo, hidePlanetInfo,
    updateDimOverlay
} from './ui.js';

// Biến toàn cục
let isZoomed = false;
let originalCameraPos = camera.position.clone();
let originalTarget = controls.target.clone();
let lockedPlanet = null;
let clickableObjects = [];
const meteors = [];
const meteorSpeed = 1;

// Raycaster và mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Audio
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('../sounds/collision.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setVolume(0.5);
});

const backgroundMusic = new Audio('../sounds/space6.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

// Data cho thông tin hành tinh (GIỮ NGUYÊN TRONG action.js)
const planetDetails = {
    Sun: {
        name: "Mặt Trời",
        type: "Sao lùn vàng",
        diameter: "1,391,000 km",
        mass: "1.989 × 10^30 kg",
        orbitPeriod: "N/A",
        temperature: "~5,500°C",
        description: "Nguồn sáng và năng lượng chính cho sự sống trên Trái Đất và các hành tinh khác trong hệ Mặt Trời."
    },
    Mercury: {
        name: "Sao Thủy",
        type: "Hành tinh đá nhỏ nhất",
        diameter: "4,879 km",
        mass: "3.30 × 10^23 kg",
        orbitPeriod: "88 ngày",
        temperature: "167°C (ban ngày) / -173°C (ban đêm)",
        description: "Là hành tinh gần Mặt Trời nhất và không có khí quyển dày."
    },
    Venus: {
        name: "Sao Kim",
        type: "Hành tinh đất đá nóng bỏng",
        diameter: "12,104 km",
        mass: "4.87 × 10^24 kg",
        orbitPeriod: "225 ngày",
        temperature: "462°C",
        description: "Có bầu khí quyển dày chứa CO₂, gây hiệu ứng nhà kính cực mạnh."
    },
    Earth: {
        name: "Trái Đất",
        type: "Hành tinh đất đá có sự sống",
        diameter: "12,742 km",
        mass: "5.97 × 10^24 kg",
        orbitPeriod: "365 ngày",
        temperature: "15°C trung bình",
        description: "Là hành tinh duy nhất hiện biết có sự sống và nước lỏng trên bề mặt."
    },
    Mars: {
        name: "Sao Hỏa",
        type: "Hành tinh đất đá đỏ",
        diameter: "6,779 km",
        mass: "6.42 × 10^23 kg",
        orbitPeriod: "687 ngày",
        temperature: "-63°C",
        description: "Có bề mặt chứa nhiều oxit sắt khiến hành tinh có màu đỏ đặc trưng."
    },
    Jupiter: {
        name: "Sao Mộc",
        type: "Hành tinh khí khổng lồ",
        diameter: "139,820 km",
        mass: "1.90 × 10^27 kg",
        orbitPeriod: "12 năm",
        temperature: "-145°C",
        description: "Là hành tinh lớn nhất Hệ Mặt Trời, chứa Vết Đỏ Lớn – cơn bão khổng lồ tồn tại hàng trăm năm."
    },
    Saturn: {
        name: "Sao Thổ",
        type: "Hành tinh khí khổng lồ có vành đai",
        diameter: "116,460 km",
        mass: "5.68 × 10^26 kg",
        orbitPeriod: "29 năm",
        temperature: "-178°C",
        description: "Nổi tiếng với hệ thống vành đai rộng lớn được cấu tạo từ băng và đá."
    },
    Uranus: {
        name: "Sao Thiên Vương",
        type: "Hành tinh băng khổng lồ",
        diameter: "50,724 km",
        mass: "8.68 × 10^25 kg",
        orbitPeriod: "84 năm",
        temperature: "-224°C",
        description: "Hành tinh nghiêng 98 độ so với mặt phẳng quỹ đạo, quay gần như nằm ngang."
    },
    Neptune: {
        name: "Sao Hải Vương",
        type: "Hành tinh băng khổng lồ",
        diameter: "49,244 km",
        mass: "1.02 × 10^26 kg",
        orbitPeriod: "165 năm",
        temperature: "-214°C",
        description: "Hành tinh xa nhất trong Hệ Mặt Trời, có gió mạnh nhất trong số các hành tinh."
    },
    Pluto: {
        name: "Sao Diêm Vương",
        type: "Hành tinh lùn",
        diameter: "2,377 km",
        mass: "1.31 × 10^22 kg",
        orbitPeriod: "248 năm",
        temperature: "-229°C",
        description: "Từng được xem là hành tinh thứ 9 nhưng nay được xếp vào loại hành tinh lùn."
    }
};

const planetCores = {
    Sun: [
        { name: "Lõi trong", desc: "Nhiệt độ ~15 triệu °C, áp suất cực cao.", color: "#988c21ff", radius: "10 đơn vị" },
        { name: "Vùng bức xạ", desc: "Năng lượng từ lõi truyền ra ngoài qua bức xạ.", color: "#906f0dff", radius: "15 đơn vị" },
        { name: "Vùng đối lưu", desc: "Năng lượng truyền qua đối lưu, tạo bề mặt sôi động.", color: "#855206ff", radius: "20 đơn vị" }
    ],
    Mercury: [
        { name: "Lớp vỏ", desc: "Chủ yếu là silicat và khoáng chất sắt.", color: "#ac7e37ff", radius: "2.5 đơn vị" },
        { name: "Lõi sắt", desc: "Chiếm phần lớn thể tích, rất đặc, tạo từ trường yếu.", color: "#ff4500", radius: "1.1 đơn vị" }
    ],
    Venus: [
        { name: "Vỏ đá", desc: "Chứa nhiều bazan nóng chảy, nhiệt độ bề mặt cực cao.", color: "#8d5b16ff", radius: "3 đơn vị" },
        { name: "Manti", desc: "Silicat nóng chảy dưới áp suất lớn.", color: "#aa6806ff", radius: "3.5 đơn vị" },
        { name: "Lõi kim loại", desc: "Sắt và niken đặc, tương tự Trái Đất nhưng không có từ trường mạnh.", color: "#ff5733", radius: "1.5 đơn vị" }
    ],
    Earth: [
        { name: "Vỏ Trái Đất", desc: "Lớp ngoài cùng chứa đại dương và lục địa.", color: "#2c7da2ff", radius: "3 đơn vị" },
        { name: "Manti", desc: "Silicat nóng chảy, chiếm phần lớn thể tích.", color: "#9b5f05ff", radius: "5 đơn vị" },
        { name: "Lõi ngoài", desc: "Sắt lỏng tạo ra từ trường Trái Đất.", color: "#af4b2cff", radius: "2 đơn vị" },
        { name: "Lõi trong", desc: "Sắt đặc, nhiệt độ khoảng 6000°C.", color: "#af2c04ff", radius: "1 đơn vị" }
    ],
    Mars: [
        { name: "Vỏ đỏ", desc: "Phủ bụi giàu oxit sắt, tạo nên màu đỏ đặc trưng.", color: "#a42e25ff", radius: "2.5 đơn vị" },
        { name: "Manti", desc: "Silicat nguội hơn Trái Đất, hoạt động kiến tạo yếu.", color: "#9f4c33ff", radius: "2 đơn vị" },
        { name: "Lõi sắt-niken", desc: "Đang nguội dần, từ trường rất yếu.", color: "#b71c1c", radius: "1 đơn vị" }
    ],
    Jupiter: [
        { name: "Khí quyển", desc: "Hydro và heli chiếm ưu thế, có các cơn bão khổng lồ.", color: "#a88c2eff", radius: "15 đơn vị" },
        { name: "Hydro kim loại", desc: "Hydro chuyển sang dạng kim loại lỏng, dẫn điện tốt.", color: "#af6a04ff", radius: "10 đơn vị" },
        { name: "Lõi đá băng", desc: "Rất nhỏ, chứa vật chất nặng, có thể là đá và băng.", color: "#9b3414ff", radius: "5 đơn vị" }
    ],
    Saturn: [
        { name: "Khí quyển", desc: "Hydro và heli, có vành đai khổng lồ tuyệt đẹp.", color: "#928a3fff", radius: "13 đơn vị" },
        { name: "Hydro kim loại", desc: "Lớp hydro ở áp suất cao biến thành dạng kim loại.", color: "#ac7a05ff", radius: "9 đơn vị" },
        { name: "Lõi đá-băng", desc: "Hỗn hợp đá, băng và kim loại nặng.", color: "#975806ff", radius: "4 đơn vị" }
    ],
    Uranus: [
        { name: "Khí quyển", desc: "Chủ yếu là hydro, heli và methane, tạo màu xanh ngọc.", color: "#437379ff", radius: "9 đơn vị" },
        { name: "Lớp băng", desc: "Gồm nước, ammonia, methane dạng băng.", color: "#317d87ff", radius: "6 đơn vị" },
        { name: "Lõi đá-băng", desc: "Rắn chắc, áp suất cực cao.", color: "#187885ff", radius: "3 đơn vị" }
    ],
    Neptune: [
        { name: "Khí quyển", desc: "Hydro, heli, methane tạo màu xanh đậm đặc trưng.", color: "#4077a3ff", radius: "9 đơn vị" },
        { name: "Lớp băng", desc: "Gồm nước, methane, ammonia siêu nén.", color: "#286494ff", radius: "6 đơn vị" },
        { name: "Lõi đá-băng", desc: "Rất nóng, áp suất hàng triệu atm.", color: "#125792ff", radius: "3 đơn vị" }
    ],
    Pluto: [
        { name: "Lớp băng", desc: "Băng nitrogen và methane phủ bề mặt.", color: "#7493a1ff", radius: "1.5 đơn vị" },
        { name: "Manti băng-nước", desc: "Có thể chứa đại dương ngầm bên dưới lớp băng.", color: "#547895ff", radius: "1 đơn vị" },
        { name: "Lõi đá", desc: "Đá silicat lạnh, đặc và cứng.", color: "#376992ff", radius: "0.8 đơn vị" }
    ]
};

const infoPlanets = [
    { name: "Sun", temperature: "~5.500°C", description: "Nguồn sáng và năng lượng chính cho sự sống trên Trái Đất và các hành tinh khác trong hệ Mặt Trời, quyết định lực hấp dẫn giữ toàn bộ các hành tinh, tiểu hành tinh, sao chổi trong quỹ đạo", Image: "sun1.jpg" },
    { name: "Mercury", temperature: "-173 đến 427°C", description: "Hành tinh nhỏ nhất và gần Mặt Trời nhất trong hệ Mặt Trời, có bề mặt đầy các hố va chạm và nhiệt độ biến đổi cực đoan.", Image: "mercury1.jpg" },
    { name: "Venus", temperature: "462°C", description: "Hành tinh thứ hai từ Mặt Trời, có bề mặt nóng bỏng và khí quyển dày đặc chủ yếu là carbon dioxide, với hiệu ứng nhà kính mạnh mẽ.", Image: "venus1.jpg" },
    { name: "Earth", temperature: "-88 đến 58°C", description: "Hành tinh duy nhất được biết đến có sự sống, với bề mặt chủ yếu là nước và khí quyển giàu oxy.", Image: "earth1.jpg" },
    { name: "Mars", temperature: "-125 đến 20°C", description: "Hành tinh đỏ, có bề mặt đáy cát và băng, có dấu hiệu của nước trong quá khứ và tiềm năng cho sự sống vi sinh.", Image: "mars1.jpg" },
    { name: "Jupiter", temperature: "-145°C", description: "Hành tinh lớn nhất trong hệ Mặt Trời, một hành tinh khí khổng lồ với nhiều mặt trăng và hệ thống vành đai.", Image: "jupiter1.jpg" },
    { name: "Saturn", temperature: "-178°C", description: "Nổi tiếng với hệ thống vành đai rộng lớn và phức tạp, là hành tinh khí khổng lồ thứ hai trong hệ Mặt Trời.", Image: "saturn1.jpg" },
    { name: "Uranus", temperature: "-224°C", description: "Hành tinh băng khổng lồ với màu xanh lam đặc trưng do khí metan trong khí quyển, quay quanh Mặt Trời theo phương ngang.", Image: "uranus1.jpg" },
    { name: "Neptune", temperature: "-218°C", description: "Hành tinh xa nhất trong hệ Mặt Trời, có màu xanh đậm và gió mạnh nhất trong số các hành tinh.", Image: "neptune1.jpg" },
    { name: "Pluto", temperature: "-229°C", description: "Trước đây được coi là hành tinh thứ chín, nay được phân loại là tiểu hành tinh băng, nằm ở rìa ngoài của hệ Mặt Trời.", Image: "pluto1.jpg" }
];

// Khởi tạo
function init() {
    createPlanets();
    createMenu();
    createUIElements();
    createDimOverlay();
    refreshClickableObjects();
    
    // Thiết lập event listeners cho UI
    setupUIEventListeners(backgroundMusic, setGlobalSpeed, toggleOrbits);
    
    // Thiết lập event listener cho zoom từ menu
    window.addEventListener('zoomToPlanet', (event) => {
        zoomToPlanet(event.detail);
    });
    
    // Bắt đầu animation loop
    animate();
}

// ========== TƯƠNG TÁC CHUỘT VÀ RAYCASTING ==========

function getAllMeshes(object) {
    let meshes = [];
    object.traverse(child => {
        if (child.isMesh) meshes.push(child);
    });
    return meshes;
}

function refreshClickableObjects() {
    clickableObjects = getAllMeshes(scene);
}

function getPlanetNameFromObject(obj) {
    let o = obj;
    while (o) {
        if (o.name && o.name.trim()) return o.name;
        if (o.userData && o.userData.name) return o.userData.name;
        if (o.userData && o.userData.planetName) return o.userData.planetName;
        o = o.parent;
    }
    return null;
}

function onClick(event) {
    // Nếu click phát sinh từ trong panel UI thì bỏ qua
    if (event.target && event.target.closest && 
        (event.target.closest('#infoPanel') || event.target.closest('#corePanel') || event.target.closest('#side-menu'))) {
        return;
    }

    const canvasBounds = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        const picked = intersects[0].object;
        const planetName = getPlanetNameFromObject(picked) || "Unknown";
        
        // Zoom vào hành tinh được click
        zoomToClickedPlanet(picked, planetName);
    } else {
        // Click vào vùng trống - zoom ra
        dezoomFromPlanet();
    }
}

function zoomToClickedPlanet(picked, planetName) {
    const planetInfo = infoPlanets.find(i => i.name === planetName) || null;

    // Hiển thị panel thông tin - TRUYỀN ĐẦY ĐỦ DỮ LIỆU
    showPlanetInfo(planetName, planetInfo, planetDetails, planetCores, infoPlanets);

    if (!isZoomed) {
        originalCameraPos = camera.position.clone();
        originalTarget = controls.target.clone();
    }

    const planetWorldPos = new THREE.Vector3();
    picked.getWorldPosition(planetWorldPos);

    const bbox = new THREE.Box3().setFromObject(picked);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 1e-3);

    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fitHeightDistance = maxDim / (2 * Math.tan(fov / 2));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const offset = Math.max(fitHeightDistance, fitWidthDistance) * 2.0;

    const direction = new THREE.Vector3().subVectors(camera.position, planetWorldPos).normalize();
    const newCamPos = planetWorldPos.clone().add(direction.multiplyScalar(offset));

    // Animation zoom mượt mà với GSAP
    gsap.to(camera.position, {
        duration: 1.5,
        x: newCamPos.x,
        y: newCamPos.y,
        z: newCamPos.z,
        onUpdate: () => controls.update()
    });

    gsap.to(controls.target, {
        duration: 1.5,
        x: planetWorldPos.x,
        y: planetWorldPos.y,
        z: planetWorldPos.z
    });

    // Áp dụng lớp phủ mờ
    updateDimOverlay('0.5');
    isZoomed = true;
    lockedPlanet = picked;
}

function dezoomFromPlanet() {
    if (!isZoomed) return;

    // Animation zoom ra mượt mà với GSAP
    gsap.to(camera.position, {
        duration: 1.5,
        x: originalCameraPos.x,
        y: originalCameraPos.y,
        z: originalCameraPos.z,
        onUpdate: () => controls.update()
    });

    gsap.to(controls.target, {
        duration: 1.5,
        x: originalTarget.x,
        y: originalTarget.y,
        z: originalTarget.z
    });

    // Loại bỏ lớp phủ mờ
    updateDimOverlay('0');
    isZoomed = false;
    lockedPlanet = null;

    // Ẩn các panel thông tin
    hidePlanetInfo();
}

// ========== CÁC HÀM KHÁC ==========

function shootMeteor() {
    const geometry = new THREE.SphereGeometry(5, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xb7b7b7 });
    const meteor = new THREE.Mesh(geometry, material);

    meteor.position.copy(camera.position);
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const velocity = direction.clone().normalize().multiplyScalar(meteorSpeed);

    scene.add(meteor);
    meteors.push({ mesh: meteor, velocity });
}

function zoomToPlanet(planetName) {
    const planet = planetOrbits.find(p => p.planet.name === planetName)?.planet || 
                  (planetName === 'Sun' ? sun : null);
    
    if (!planet) return;

    if (isZoomed) {
        dezoomFromPlanet();
        // Đợi một chút trước khi zoom mới
        setTimeout(() => zoomToClickedPlanet(planet, planetName), 100);
    } else {
        zoomToClickedPlanet(planet, planetName);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Gọi hàm animatePlanets và truyền lockedPlanet
    animatePlanets(lockedPlanet);
    
    controls.update();
    renderer.render(scene, camera);
    
    // Xử lý thiên thạch
    for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.mesh.position.add(m.velocity.clone().multiplyScalar(globalSpeed));

        planetOrbits.forEach(p => {
            if (!p.planet) return;
            const planetPos = new THREE.Vector3();
            p.planet.getWorldPosition(planetPos);
            const distance = m.mesh.position.distanceTo(planetPos);
            const minDist = p.radius + 2;

            if (distance < minDist) {
                try { if (sound.isPlaying) sound.stop(); } catch (e) {}
                try { sound.play(); } catch (e) {}
                scene.remove(m.mesh);
                meteors.splice(i, 1);
            }
        });

        if (m.mesh.position.length() > 2000) {
            scene.remove(m.mesh);
            meteors.splice(i, 1);
        }
    }
}

// Bắn thiên thạch với phím Space
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') shootMeteor();
});

// Click để zoom (Raycasting)
window.addEventListener('click', onClick);

// Khởi chạy
init();