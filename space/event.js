import * as THREE from 'three';

class SpaceEvents {
    constructor() {
        this.planetsData = [];
        this.spaceshipPos = new THREE.Vector3(0, 0, 0);
        this.spaceshipGroup = null;
        this.spaceshipSphere = null;
        this.planetSpheres = new Map();
        this.sunSphere = null;
        
        this.spaceshipSphereRadius = 15;
        this.planetSphereRadiusMultiplier = 2.5;
        this.sunSphereRadius = 80;
        
        this.landingDistanceThreshold = 5;
        this.collisionPreventionDistance = 0.05;
        
        this.nearestPlanet = null;
        this.currentDistance = Infinity;
        this.isInLandingZone = false;
        
        // THÊM: Biến để làm mượt chuyển động
        this.lastSpaceshipPos = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.smoothFactor = 0.1; // Hệ số làm mượt
        this.collisionResponseSpeed = 0.005; // Tốc độ phản hồi va chạm
        
        // THÊM: Biến quản lý trạng thái
        this.isColliding = false;
        this.collisionCooldown = 0;
        this.maxCollisionCooldown = 10; // Số frame cooldown
        
        this.initUI();
        this.setupEventListeners();
    }

    initUI() {
        // Tạo button hạ cánh
        this.landingButton = document.createElement('button');
        this.landingButton.innerHTML = '🚀 LAND';
        this.landingButton.style.position = 'fixed';
        this.landingButton.style.bottom = '100px';
        this.landingButton.style.left = '50%';
        this.landingButton.style.transform = 'translateX(-50%)';
        this.landingButton.style.background = 'linear-gradient(45deg, #008800, #00FF00)';
        this.landingButton.style.color = 'white';
        this.landingButton.style.border = 'none';
        this.landingButton.style.padding = '15px 40px';
        this.landingButton.style.borderRadius = '25px';
        this.landingButton.style.fontSize = '18px';
        this.landingButton.style.fontWeight = 'bold';
        this.landingButton.style.cursor = 'pointer';
        this.landingButton.style.zIndex = '1000';
        this.landingButton.style.display = 'none';
        this.landingButton.style.transition = 'all 0.3s ease';
        this.landingButton.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)';
        this.landingButton.title = 'Click to land on the nearest planet';
        
        this.landingButton.addEventListener('mouseenter', () => {
            this.landingButton.style.transform = 'translateX(-50%) scale(1.05)';
            this.landingButton.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.8)';
        });
        
        this.landingButton.addEventListener('mouseleave', () => {
            this.landingButton.style.transform = 'translateX(-50%) scale(1)';
            this.landingButton.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)';
        });
        
        this.landingButton.addEventListener('click', () => {
            this.handleLanding();
        });
        
        document.body.appendChild(this.landingButton);

        // Tạo UI xác nhận hạ cánh
        this.landingUI = document.createElement('div');
        this.landingUI.style.position = 'fixed';
        this.landingUI.style.top = '50%';
        this.landingUI.style.left = '50%';
        this.landingUI.style.transform = 'translate(-50%, -50%)';
        this.landingUI.style.background = 'rgba(0, 20, 40, 0.98)';
        this.landingUI.style.color = 'white';
        this.landingUI.style.padding = '30px';
        this.landingUI.style.borderRadius = '15px';
        this.landingUI.style.border = '3px solid #00FF00';
        this.landingUI.style.fontFamily = 'Arial, sans-serif';
        this.landingUI.style.fontSize = '18px';
        this.landingUI.style.zIndex = '10000';
        this.landingUI.style.display = 'none';
        this.landingUI.style.textAlign = 'center';
        this.landingUI.style.minWidth = '350px';
        this.landingUI.style.backdropFilter = 'blur(10px)';
        this.landingUI.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.5)';
        this.landingUI.innerHTML = `
            <div style="color: #00FF00; font-size: 28px; margin-bottom: 20px; font-weight: bold;">
                🚀 LANDING CONFIRMATION
            </div>
            <div style="margin-bottom: 15px; font-size: 20px;">
                Ready to land on <span id="landingPlanetName" style="color: #00FFFF; font-weight: bold;">PLANET</span>?
            </div>
            <div style="margin-bottom: 25px; font-size: 16px; color: #CCCCCC;">
                Distance: <span id="landingDistance" style="color: #FFFF00; font-weight: bold;">0</span> units
            </div>
            <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 15px;">
                <button id="confirmLanding" style="
                    background: linear-gradient(45deg, #008800, #00FF00);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 120px;
                ">✅ CONFIRM</button>
                <button id="cancelLanding" style="
                    background: linear-gradient(45deg, #880000, #FF0000);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 120px;
                ">❌ CANCEL</button>
            </div>
            <div style="margin-top: 20px; font-size: 12px; color: #888;">
                Press ESC to close
            </div>
        `;
        document.body.appendChild(this.landingUI);
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'confirmLanding') {
                this.handleLandingConfirmation();
            } else if (e.target.id === 'cancelLanding') {
                this.hideLandingUI();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.landingUI.style.display === 'block') {
                this.hideLandingUI();
            }
        });
    }

    setSpaceshipGroup(spaceshipGroup) {
        this.spaceshipGroup = spaceshipGroup;
        this.createSpaceshipSphere();
    }

    createSpaceshipSphere() {
        this.spaceshipSphere = new THREE.Sphere(this.spaceshipPos, this.spaceshipSphereRadius);
    }

    updatePlanetsData(planetOrbits) {
        if (!planetOrbits || !Array.isArray(planetOrbits)) {
            return;
        }

        this.planetsData = [];
        this.planetSpheres.clear();
        
        planetOrbits.forEach((planetData) => {
            if (planetData && planetData.planet) {
                const worldPosition = new THREE.Vector3();
                planetData.planet.getWorldPosition(worldPosition);
                
                const planetInfo = {
                    name: planetData.planet.userData?.name || 'Unknown',
                    position: worldPosition.clone(),
                    radius: planetData.radius || 15,
                    orbit: planetData.orbit,
                    planetObject: planetData.planet,
                    originalData: planetData
                };
                
                this.planetsData.push(planetInfo);
                
                const planetSphereRadius = planetData.radius * this.planetSphereRadiusMultiplier;
                const planetSphere = new THREE.Sphere(worldPosition, planetSphereRadius);
                this.planetSpheres.set(planetInfo.name, {
                    sphere: planetSphere,
                    radius: planetSphereRadius,
                    originalData: planetData
                });
            }
        });
    }

    setSunData(sun) {
        if (sun) {
            const sunPosition = new THREE.Vector3(0, 0, 0);
            this.sunSphere = new THREE.Sphere(sunPosition, this.sunSphereRadius);
            this.sunObject = sun;
        }
    }

    updateSpaceshipPosition(position) {
        if (position && position instanceof THREE.Vector3) {
            // THÊM: Tính toán vận tốc để dự đoán chuyển động
            this.velocity.subVectors(position, this.lastSpaceshipPos);
            this.lastSpaceshipPos.copy(position);
            
            this.spaceshipPos.copy(position);
            
            if (this.spaceshipSphere) {
                this.spaceshipSphere.center.copy(position);
            }
        }
    }

    // CẢI THIỆN: Tối ưu hóa cập nhật vị trí hành tinh
    updatePlanetSpheresPositions() {
        for (let i = 0; i < this.planetsData.length; i++) {
            const planetInfo = this.planetsData[i];
            const planetSphereData = this.planetSpheres.get(planetInfo.name);
            
            if (planetSphereData && planetInfo.planetObject) {
                const currentWorldPosition = new THREE.Vector3();
                planetInfo.planetObject.getWorldPosition(currentWorldPosition);
                
                planetSphereData.sphere.center.copy(currentWorldPosition);
                planetInfo.position.copy(currentWorldPosition);
            }
        }
    }

    checkEvents() {
        if (this.planetsData.length === 0 || !this.spaceshipSphere) {
            this.hideLandingButton();
            this.isInLandingZone = false;
            return;
        }

        // CẬP NHẬT VỊ TRÍ KHỐI CẦU CÁC HÀNH TINH
        this.updatePlanetSpheresPositions();

        // THÊM: Xử lý cooldown va chạm
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
        }

        let nearestPlanet = null;
        let minDistance = Infinity;
        let isColliding = false;

        // Kiểm tra va chạm với mặt trời
        if (this.sunSphere && this.spaceshipSphere.intersectsSphere(this.sunSphere)) {
            this.handleSunCollision();
            isColliding = true;
        }

        // Kiểm tra va chạm với các hành tinh
        for (let i = 0; i < this.planetsData.length; i++) {
            const planet = this.planetsData[i];
            const planetSphereData = this.planetSpheres.get(planet.name);
            
            if (planetSphereData) {
                const planetSphere = planetSphereData.sphere;
                
                const centerDistance = this.spaceshipSphere.center.distanceTo(planetSphere.center);
                const totalRadius = this.spaceshipSphere.radius + planetSphere.radius;
                const actualDistance = centerDistance - totalRadius;
                
                // THÊM: Dự đoán va chạm sớm hơn
                const predictedDistance = actualDistance - this.velocity.length();
                
                if (this.spaceshipSphere.intersectsSphere(planetSphere) && this.collisionCooldown === 0) {
                    this.handlePlanetCollision(planet, actualDistance);
                    isColliding = true;
                    this.collisionCooldown = this.maxCollisionCooldown;
                }
                
                if (actualDistance < minDistance) {
                    minDistance = actualDistance;
                    nearestPlanet = planet;
                }
            }
        }

        this.nearestPlanet = nearestPlanet;
        this.currentDistance = minDistance;

        // Kiểm tra điều kiện hiển thị button hạ cánh
        if (!isColliding && nearestPlanet && minDistance <= this.landingDistanceThreshold) {
            this.isInLandingZone = true;
            this.showLandingButton(nearestPlanet, minDistance);
        } else {
            this.isInLandingZone = false;
            this.hideLandingButton();
        }
    }

    // CẢI THIỆN: Làm mượt xử lý va chạm mặt trời
    handleSunCollision() {
        const directionAwayFromSun = new THREE.Vector3()
            .subVectors(this.spaceshipPos, new THREE.Vector3(0, 0, 0))
            .normalize();
        
        const safeDistance = this.sunSphereRadius + this.spaceshipSphereRadius + this.collisionPreventionDistance;
        const targetPosition = directionAwayFromSun.multiplyScalar(safeDistance);
        
        // THÊM: Di chuyển mượt mà thay vì nhảy ngay lập tức
        this.spaceshipPos.lerp(targetPosition, this.collisionResponseSpeed);
        
        if (this.spaceshipGroup) {
            this.spaceshipGroup.position.copy(this.spaceshipPos);
        }
        
        if (this.spaceshipSphere) {
            this.spaceshipSphere.center.copy(this.spaceshipPos);
        }
    }

    // CẢI THIỆN: Làm mượt xử lý va chạm hành tinh
    handlePlanetCollision(planet, distance) {
        const planetSphereData = this.planetSpheres.get(planet.name);
        if (!planetSphereData) return;

        const collisionDirection = new THREE.Vector3()
            .subVectors(this.spaceshipPos, planet.position)
            .normalize();
        
        const safeDistance = planetSphereData.sphere.radius + this.spaceshipSphere.radius + this.collisionPreventionDistance;
        const targetPosition = collisionDirection.multiplyScalar(safeDistance).add(planet.position);
        
        // THÊM: Sử dụng linear interpolation để di chuyển mượt mà
        this.spaceshipPos.lerp(targetPosition, this.collisionResponseSpeed);
        this.velocity.multiplyScalar(0.25);
        if (this.spaceshipGroup) {
            this.spaceshipGroup.position.copy(this.spaceshipPos);
        }
        
        if (this.spaceshipSphere) {
            this.spaceshipSphere.center.copy(this.spaceshipPos);
        }
    }

    showLandingButton(planet, distance) {
        if (!this.landingButton) return;

        this.landingButton.innerHTML = `🚀 LAND ON ${planet.name.toUpperCase()}`;
        this.landingButton.style.display = 'block';
        this.landingButton.style.animation = 'pulseGreen 2s infinite';
    }

    hideLandingButton() {
        if (this.landingButton) {
            this.landingButton.style.display = 'none';
            this.landingButton.style.animation = 'none';
        }
    }

    showLandingUI() {
        if (!this.landingUI || !this.nearestPlanet) return;

        const planetNameElement = this.landingUI.querySelector('#landingPlanetName');
        const distanceElement = this.landingUI.querySelector('#landingDistance');

        if (planetNameElement) planetNameElement.textContent = this.nearestPlanet.name.toUpperCase();
        if (distanceElement) distanceElement.textContent = this.currentDistance.toFixed(1);

        this.landingUI.style.display = 'block';
        this.hideLandingButton();
    }

    hideLandingUI() {
        if (this.landingUI) {
            this.landingUI.style.display = 'none';
        }
        if (this.isInLandingZone) {
            this.showLandingButton(this.nearestPlanet, this.currentDistance);
        }
    }

    handleLanding() {
        this.showLandingUI();
    }

    handleLandingConfirmation() {
        if (!this.nearestPlanet) return;

        const planetName = this.nearestPlanet.name.toLowerCase();
        const planetPage = `../Star/html/${planetName}.html`;
        
        // Bỏ comment dòng dưới để thực sự chuyển trang:
        window.open(planetPage, '_blank');
        
        this.hideLandingUI();
    }
}

// Thêm CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulseGreen {
        0% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.5); }
        50% { box-shadow: 0 0 30px rgba(0, 255, 0, 0.8); }
        100% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.5); }
    }

    #confirmLanding:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px #00FF00;
    }

    #cancelLanding:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px #FF0000;
    }
`;
document.head.appendChild(style);

// Tạo và export instance
const spaceEvents = new SpaceEvents();
export { spaceEvents };