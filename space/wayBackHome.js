import * as THREE from 'three';

class WayBackHomeSystem {
    constructor() {
        this.isActive = false;
        this.isReturning = false;
        this.earthPosition = new THREE.Vector3();
        this.earthObject = null; // THÊM: Lưu object Trái Đất
        this.earthFound = false;
        this.arrivalThreshold = 80; // TĂNG ngưỡng lên để dễ dàng đến đích
        this.backgroundMusic = null;
        this.returnMusic = null;
        this.spaceshipGroup = null;
        this.spaceData = null;
        
        // BIẾN CHO CHUYỂN ĐỘNG ĐIỆN ẢNH
        this.journeyStartTime = 0;
        this.minJourneyDuration = 26500; // 36 giây
        this.currentSpeed = 0;
        this.maxSpeed = 2.87; // TĂNG tốc độ một chút
        
        // Camera và chuyển động
        this.camera = null;
        this.originalCameraPosition = new THREE.Vector3();
        
        // Chuyển động đường cong
        this.curvePath = null;
        this.curveProgress = 0;
        this.curvePoints = [];
        
        // Hiệu ứng hình ảnh tinh tế
        this.starField = null;
        this.lightBeam = null;
        this.particles = [];
        
        this.setupEventListeners();
        this.loadReturnMusic();
    }

    setupEventListeners() {
        let vPressed = false;
        let ePressed = false;

        document.addEventListener('keydown', (event) => {
            if (event.code === 'KeyV') vPressed = true;
            if (event.code === 'KeyE') ePressed = true;

            if (vPressed && ePressed && !this.isActive) {
                this.activateReturnSequence();
                vPressed = false;
                ePressed = false;
            }
        });

        document.addEventListener('keyup', (event) => {
            if (event.code === 'KeyV') vPressed = false;
            if (event.code === 'KeyE') ePressed = false;
        });
    }

    loadReturnMusic() {
        this.returnMusic = new Audio('../sounds/backHome.mp3');
        this.returnMusic.loop = true;
        this.returnMusic.volume = 0.3;
        this.returnMusic.load();
    }

    playReturnMusic() {
        if (this.returnMusic) {
            this.returnMusic.play().catch(error => {
                console.log('Lỗi phát nhạc trở về:', error);
            });
        }
    }

    setSpaceshipData(spaceshipGroup, spaceData) {
        this.spaceshipGroup = spaceshipGroup;
        this.spaceData = spaceData;
    }

    setBackgroundMusic(music) {
        this.backgroundMusic = music;
    }

    setCamera(camera) {
        this.camera = camera;
        this.originalCameraPosition.copy(camera.position);
    }

    activateReturnSequence() {
        if (this.isActive || !this.spaceshipGroup) return;

        console.log('🎬 Kích hoạt chế độ trở về - Phiên bản điện ảnh');
        this.isActive = true;
        this.isReturning = false;
        this.journeyStartTime = Date.now();
        this.curveProgress = 0;

        // Lưu vị trí ban đầu
        this.originalPosition = this.spaceshipGroup.position.clone();
        this.originalRotation = this.spaceshipGroup.rotation.clone();

        // Tắt nhạc nền
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }

        // Phát nhạc trở về
        this.playReturnMusic();

        // Tìm Trái Đất - CẬP NHẬT: Gọi lại mỗi lần để lấy vị trí mới nhất
        this.findEarthPosition();

        // Tạo đường bay nghệ thuật
        this.createArtisticPath();

        // Tạo hiệu ứng hình ảnh tinh tế
        this.createCinematicEffects();

        // Bắt đầu hành trình
        setTimeout(() => {
            this.startCinematicJourney();
        }, 1500);
    }

    findEarthPosition() {
        if (!this.spaceData || !this.spaceData.planetOrbits) {
            console.error('Không tìm thấy dữ liệu hành tinh!');
            return;
        }

        const earthOrbit = this.spaceData.planetOrbits.find(planet => 
            planet.planet && planet.planet.userData && 
            planet.planet.userData.name === 'Earth'
        );

        if (earthOrbit && earthOrbit.planet) {
            this.earthObject = earthOrbit.planet; // LƯU object Trái Đất
            // CẬP NHẬT: Lấy vị trí thế giới mới nhất
            this.earthObject.getWorldPosition(this.earthPosition);
            this.earthFound = true;
            console.log('📍 Đã xác định vị trí Trái Đất:', this.earthPosition);
        } else {
            console.error('Không tìm thấy Trái Đất trong hệ thống!');
            this.earthFound = false;
        }
    }

    createArtisticPath() {
        if (!this.earthFound) {
            console.error('Không thể tạo đường bay: Chưa tìm thấy Trái Đất');
            return;
        }

        // CẬP NHẬT: Lấy vị trí mới nhất của Trái Đất
        this.earthObject.getWorldPosition(this.earthPosition);
        
        const startPos = this.spaceshipGroup.position.clone();
        
        console.log('🚀 Vị trí bắt đầu:', startPos);
        console.log('🌍 Vị trí Trái Đất:', this.earthPosition);

        // Tạo đường cong Catmull-Rom với các điểm điều khiển thông minh hơn
        const direction = new THREE.Vector3()
            .subVectors(this.earthPosition, startPos)
            .normalize();
        
        const distance = startPos.distanceTo(this.earthPosition);
        const midPoint = new THREE.Vector3()
            .addVectors(startPos, this.earthPosition)
            .multiplyScalar(0.5);
        
        // Thêm độ cao và độ lệch để tạo đường cong đẹp
        const perpendicular = new THREE.Vector3(-direction.z, direction.y, direction.x);
        const curveHeight = distance * 0.3;
        
        this.curvePoints = [
            startPos.clone(),
            new THREE.Vector3(
                startPos.x + direction.x * distance * 0.3 + perpendicular.x * curveHeight * 0.5,
                startPos.y + direction.y * distance * 0.3 + curveHeight,
                startPos.z + direction.z * distance * 0.3 + perpendicular.z * curveHeight * 0.5
            ),
            new THREE.Vector3(
                this.earthPosition.x - direction.x * distance * 0.3 - perpendicular.x * curveHeight * 0.3,
                this.earthPosition.y - direction.y * distance * 0.3 + curveHeight * 0.5,
                this.earthPosition.z - direction.z * distance * 0.3 - perpendicular.z * curveHeight * 0.3
            ),
            this.earthPosition.clone()
        ];

        this.curvePath = new THREE.CatmullRomCurve3(this.curvePoints);
        
        console.log('🛣️ Đã tạo đường bay với', this.curvePoints.length, 'điểm điều khiển');
    }

    createCinematicEffects() {
        // Tạo trường sao di chuyển (star field)
        this.createStarField();
        
        // Tạo các hạt bụi vũ trụ
        this.createSpaceDust();
    }

    createStarField() {
        if (this.starField && this.starField.parent) {
            this.starField.parent.remove(this.starField);
        }

        const starGeometry = new THREE.BufferGeometry();
        const starCount = 200;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 5000;
            positions[i + 1] = (Math.random() - 0.5) * 5000;
            positions[i + 2] = (Math.random() - 0.5) * 5000;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            transparent: true,
            opacity: 0.4
        });
        
        this.starField = new THREE.Points(starGeometry, starMaterial);
        this.spaceData.scene.add(this.starField);
    }

    createSpaceDust() {
        // Xóa particles cũ nếu có
        this.particles.forEach(particle => {
            if (particle.parent) {
                particle.parent.remove(particle);
            }
        });
        this.particles = [];

        // Tạo các hạt bụi vũ trụ
        const dustGeometry = new THREE.BufferGeometry();
        const dustCount = 100;
        const positions = new Float32Array(dustCount * 3);
        const colors = new Float32Array(dustCount * 3);
        
        for (let i = 0; i < dustCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 1000;
            positions[i + 1] = (Math.random() - 0.5) * 1000;
            positions[i + 2] = (Math.random() - 0.5) * 1000;
            
            // Màu sắc ngẫu nhiên nhẹ nhàng
            colors[i] = Math.random() * 0.3 + 0.7;
            colors[i + 1] = Math.random() * 0.5 + 0.5;
            colors[i + 2] = Math.random() * 0.8 + 0.2;
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        dustGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const dustMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        const dust = new THREE.Points(dustGeometry, dustMaterial);
        this.spaceData.scene.add(dust);
        this.particles.push(dust);
    }

    startCinematicJourney() {
        if (!this.earthFound || !this.spaceshipGroup) {
            console.error('Không thể bắt đầu hành trình trở về!');
            return;
        }

        this.isReturning = true;
        console.log('🎭 Bắt đầu hành trình điện ảnh về Trái Đất...');

        this.createCinematicNotification();
    }

    update() {
        if (!this.isReturning || !this.spaceshipGroup || !this.earthFound) return;

        const currentTime = Date.now();
        const journeyTime = currentTime - this.journeyStartTime;
        const journeyProgress = Math.min(journeyTime / this.minJourneyDuration, 1);
        
        // QUAN TRỌNG: Cập nhật vị trí Trái Đất mỗi frame
        this.updateEarthPosition();
        
        // Cập nhật tốc độ với easing mượt mà
        this.updateSpeedWithEasing(journeyProgress);
        
        // Cập nhật chuyển động đường cong
        this.updateCurveMovement(journeyProgress);
        
        // Cập nhật camera điện ảnh
        this.updateCinematicCamera(journeyProgress);
        
        // Cập nhật hiệu ứng hình ảnh
        this.updateCinematicEffects(journeyProgress);
        
        // Kiểm tra đến đích
        this.checkArrival(journeyProgress);
    }

    // THÊM: Cập nhật vị trí Trái Đất real-time
    updateEarthPosition() {
        if (this.earthObject) {
            this.earthObject.getWorldPosition(this.earthPosition);
        }
    }

    updateSpeedWithEasing(journeyProgress) {
        // Easing function cho chuyển động mượt mà
        const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
        
        if (journeyProgress < 0.2) {
            // Tăng tốc mượt mà
            this.currentSpeed = easeInOutCubic(journeyProgress / 0.2) * this.maxSpeed;
        } else if (journeyProgress < 0.7) {
            // Duy trì tốc độ
            this.currentSpeed = this.maxSpeed;
        } else {
            // Giảm tốc mượt mà
            this.currentSpeed = easeOutQuart(1 - ((journeyProgress - 0.7) / 0.3)) * this.maxSpeed;
        }
    }

    updateCurveMovement(journeyProgress) {
        if (!this.curvePath) return;

        // Tính progress trên đường cong với easing
        const easedProgress = this.easeInOutQuad(journeyProgress);
        this.curveProgress = easedProgress;
        
        try {
            // Lấy vị trí trên đường cong
            const curvePoint = this.curvePath.getPoint(easedProgress);
            const curveTangent = this.curvePath.getTangent(easedProgress);
            
            // Cập nhật vị trí tàu
            this.spaceshipGroup.position.copy(curvePoint);
            
            // Hướng tàu theo tiếp tuyến của đường cong
            this.orientAlongCurve(curveTangent);
            
            // Thêm chuyển động nhẹ nhàng
            this.addSubtleMovement(journeyProgress);
            
        } catch (error) {
            console.error('Lỗi khi cập nhật chuyển động đường cong:', error);
            // Fallback: di chuyển thẳng về Trái Đất
            this.fallbackMovement();
        }
    }

    orientAlongCurve(tangent) {
        if (!tangent || tangent.length() === 0) return;

        try {
            // Tạo rotation matrix từ tangent
            const up = new THREE.Vector3(0, 1, 0);
            const axis = new THREE.Vector3();
            axis.crossVectors(up, tangent).normalize();
            
            const radians = Math.acos(Math.max(-1, Math.min(1, up.dot(tangent))));
            const quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(axis, radians);
            
            // Áp dụng rotation mượt mà
            this.spaceshipGroup.quaternion.slerp(quaternion, 0.1);
        } catch (error) {
            console.warn('Lỗi khi định hướng tàu:', error);
        }
    }

    // THÊM: Fallback movement nếu đường cong có vấn đề
    fallbackMovement() {
        const direction = new THREE.Vector3()
            .subVectors(this.earthPosition, this.spaceshipGroup.position)
            .normalize();
        
        const moveVector = direction.multiplyScalar(this.currentSpeed);
        this.spaceshipGroup.position.add(moveVector);
        
        // Hướng về Trái Đất
        this.spaceshipGroup.lookAt(this.earthPosition);
    }

    addSubtleMovement(journeyProgress) {
        const time = Date.now() * 0.001;
        
        // Rung lắc rất nhẹ - chỉ áp dụng khi đang bay
        if (this.currentSpeed > 0.1) {
            const microWobble = Math.sin(time * 3) * 0.01 * (this.currentSpeed / this.maxSpeed);
            const microRoll = Math.sin(time * 2) * 0.005 * (this.currentSpeed / this.maxSpeed);
            
            // Áp dụng chuyển động vi mô
            this.spaceshipGroup.rotation.x += microWobble;
            this.spaceshipGroup.rotation.z += microRoll;
            
            // Reset rotation nhẹ nhàng
            this.spaceshipGroup.rotation.x *= 0.98;
            this.spaceshipGroup.rotation.z *= 0.98;
        }
    }

    updateCinematicCamera(journeyProgress) {
        if (!this.camera) return;

        const time = Date.now() * 0.001;
        
        if (journeyProgress < 0.3) {
            // Cảnh mở đầu: Camera từ phía sau tàu
            const offset = new THREE.Vector3(0, 3, 15);
            offset.applyQuaternion(this.spaceshipGroup.quaternion);
            const targetPosition = this.spaceshipGroup.position.clone().add(offset);
            this.camera.position.lerp(targetPosition, 0.1);
            this.camera.lookAt(this.spaceshipGroup.position);
            
        } else if (journeyProgress < 0.6) {
            // Cảnh lia ngang: Camera di chuyển quanh tàu
            const angle = time * 0.3 + journeyProgress * Math.PI * 2;
            const radius = 20;
            const cameraX = Math.cos(angle) * radius;
            const cameraZ = Math.sin(angle) * radius;
            
            const cameraOffset = new THREE.Vector3(cameraX, 8, cameraZ);
            const targetPosition = this.spaceshipGroup.position.clone().add(cameraOffset);
            
            this.camera.position.lerp(targetPosition, 0.05);
            this.camera.lookAt(this.spaceshipGroup.position);
            
        } else {
            // Cảnh kết thúc: Camera từ phía trước nhìn thấy Trái Đất
            const directionToEarth = new THREE.Vector3()
                .subVectors(this.earthPosition, this.spaceshipGroup.position)
                .normalize();
            
            const cameraOffset = directionToEarth.multiplyScalar(-25);
            cameraOffset.y += 10;
            const targetPosition = this.spaceshipGroup.position.clone().add(cameraOffset);
            
            this.camera.position.lerp(targetPosition, 0.08);
            
            // Nhìn vào điểm giữa tàu và Trái Đất
            const lookAtPoint = new THREE.Vector3()
                .addVectors(this.spaceshipGroup.position, this.earthPosition)
                .multiplyScalar(0.5);
            this.camera.lookAt(lookAtPoint);
        }
    }

    updateCinematicEffects(journeyProgress) {
        // Cập nhật trường sao
        if (this.starField) {
            this.starField.rotation.x += 0.0002;
            this.starField.rotation.y += 0.0001;
            
            // Làm mờ dần khi đến gần Trái Đất
            const starOpacity = 0.4 * (1 - journeyProgress);
            this.starField.material.opacity = Math.max(0.1, starOpacity);
        }
        
        // Cập nhật các hạt bụi
        this.particles.forEach(particle => {
            particle.rotation.x += 0.001;
            particle.rotation.y += 0.0005;
            
            // Di chuyển particles ngược hướng bay để tạo hiệu ứng tốc độ
            particle.position.x -= this.currentSpeed * 0.1;
            particle.position.z -= this.currentSpeed * 0.1;
        });
    }

    checkArrival(journeyProgress) {
        if (!this.earthFound) return;

        // Cập nhật vị trí Trái Đất trước khi tính khoảng cách
        this.updateEarthPosition();
        
        const distanceToEarth = this.spaceshipGroup.position.distanceTo(this.earthPosition);
        const journeyTime = Date.now() - this.journeyStartTime;
        
        // Hiển thị thông tin debug
        if (Math.floor(journeyTime / 1000) % 5 === 0) {
            console.log(`📏 Khoảng cách đến Trái Đất: ${Math.floor(distanceToEarth)} units | ⏱️ ${Math.floor(journeyTime/1000)}s`);
        }
        
        // Đến đích khi: đủ thời gian HOẶC đủ gần Trái Đất
        const shouldArrive = (journeyTime >= this.minJourneyDuration) || 
                           (distanceToEarth <= this.arrivalThreshold && journeyProgress > 0.5);
        
        if (shouldArrive) {
            console.log(`🎯 Đã đến đích! Khoảng cách: ${Math.floor(distanceToEarth)}, Thời gian: ${Math.floor(journeyTime/1000)}s`);
            this.arriveAtEarth();
        }
    }

    // Hàm easing cho chuyển động mượt mà
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    createCinematicNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 20, 40, 0.95);
                color: #88ffff;
                padding: 40px 60px;
                border-radius: 20px;
                border: 1px solid rgba(136, 255, 255, 0.3);
                font-family: 'Arial', sans-serif;
                font-size: 28px;
                font-weight: 300;
                text-align: center;
                z-index: 10000;
                backdrop-filter: blur(15px);
                box-shadow: 0 0 50px rgba(136, 255, 255, 0.2);
                animation: fadeInOut 3s ease-in-out;
            ">
                🌌 HÀNH TRÌNH VỀ TRÁI ĐẤT<br>
                <span style="font-size: 18px; color: #aaffff; font-weight: 300; margin-top: 10px; display: block;">
                    Thời gian ước tính: 36 giây
                </span>
            </div>
        `;
        
        document.body.appendChild(notification);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    arriveAtEarth() {
        console.log('🎬 Kết thúc hành trình điện ảnh');
        this.isReturning = false;
        this.isActive = false;

        this.cleanupEffects();
        this.createArtisticTransition();

        setTimeout(() => {
            if (this.returnMusic) {
                this.returnMusic.pause();
                this.returnMusic.currentTime = 0;
            }
            window.location.href = 'WayBackHome.html';
        }, 3000);
    }

    cleanupEffects() {
        if (this.starField && this.starField.parent) {
            this.starField.parent.remove(this.starField);
        }
        this.particles.forEach(particle => {
            if (particle.parent) {
                particle.parent.remove(particle);
            }
        });
        this.particles = [];
    }

    createArtisticTransition() {
        const transition = document.createElement('div');
        transition.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, #001122 0%, #000000 100%);
            z-index: 99999;
            opacity: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #88ffff;
            font-family: 'Arial', sans-serif;
            font-size: 36px;
            font-weight: 300;
            transition: opacity 2s ease-in-out;
        `;
        transition.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 64px; margin-bottom: 20px; animation: float 3s ease-in-out infinite;">🌍</div>
                <div>TRÁI ĐẤT - NGÔI NHÀ CỦA CHÚNG TA</div>
                <div style="font-size: 18px; margin-top: 20px; color: #aaffff;">Chào mừng trở về, nhà thám hiểm</div>
            </div>
        `;

        document.body.appendChild(transition);

        // Thêm animation float
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);

        requestAnimationFrame(() => {
            transition.style.opacity = '1';
        });
    }

    cancelReturn() {
        if (this.isActive) {
            this.isActive = false;
            this.isReturning = false;
            this.cleanupEffects();
            
            if (this.returnMusic) {
                this.returnMusic.pause();
                this.returnMusic.currentTime = 0;
            }
            
            if (this.backgroundMusic) {
                this.backgroundMusic.play().catch(console.error);
            }
            
            console.log('❌ Hủy bỏ hành trình trở về Trái Đất');
        }
    }
}

// Export singleton instance
export const wayBackHome = new WayBackHomeSystem();