import * as THREE from 'three';
import { initSpaceship, animateSpaceship } from './spaceship.js';
import { miniMap } from './minimap.js';
import { spaceEvents } from './event.js';
import { wayBackHome } from './wayBackHome.js';
import { spaceChat } from './chat.js';

// Loading System
class LoadingSystem {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = document.getElementById('loading-text');
        this.totalAssets = 10; // Adjust based on your assets
        this.loadedAssets = 0;
    }

    updateProgress(assetName) {
        this.loadedAssets++;
        const progress = (this.loadedAssets / this.totalAssets) * 100;
        this.loadingBar.style.width = `${progress}%`;
        this.loadingText.textContent = `Loading ${assetName}... (${Math.round(progress)}%)`;
        
        if (this.loadedAssets >= this.totalAssets) {
            this.hide();
        }
    }

    hide() {
        setTimeout(() => {
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 1000);
        }, 500);
    }
}

const loadingSystem = new LoadingSystem();

// HUD System (đã được đơn giản hóa)
class HUDSystem {
    constructor() {
        // Không còn các phần tử hiển thị tốc độ và tọa độ
    }

    update(spaceshipGroup, isBoost) {
        // Không cập nhật gì cả vì đã bỏ hiển thị tốc độ và tọa độ
    }
}

const hudSystem = new HUDSystem();

// Khởi tạo spaceship
const spaceshipData = initSpaceship();
const { spaceData } = spaceshipData;
const { scene, camera, renderer } = spaceData;

// Audio - DI CHUYỂN PHẦN NÀY LÊN TRƯỚC
const backgroundMusic = new Audio('../sounds/space5.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

// THIẾT LẬP wayBackHome system SAU KHI backgroundMusic ĐÃ ĐƯỢC KHỞI TẠO
wayBackHome.setSpaceshipData(spaceshipData.spaceshipGroup, spaceData);
wayBackHome.setBackgroundMusic(backgroundMusic);
wayBackHome.setCamera(camera);

// Simulate loading progress
const loadingSteps = [
    'Space Environment',
    'Solar System',
    'Spaceship Model',
    'Textures',
    'Lighting System',
    'Navigation Systems',
    'Communication Array',
    'Life Support',
    'Propulsion Systems',
    'Final Checks'
];

loadingSteps.forEach((step, index) => {
    setTimeout(() => {
        loadingSystem.updateProgress(step);
    }, index * 300);
});

// Khởi tạo mini map với space data
miniMap.updateSpaceData(spaceData);

setTimeout(() => {
    if (spaceData.planetOrbits) {
        spaceEvents.updatePlanetsData(spaceData.planetOrbits);
    }
    
    if (spaceData.sun) {
        spaceEvents.setSunData(spaceData.sun);
    }
    
    if (spaceshipData.spaceshipGroup) {
        spaceEvents.setSpaceshipGroup(spaceshipData.spaceshipGroup);
    }
}, 1000);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update spaceship data for mini map
    if (spaceshipData.spaceshipGroup) {
        const worldPosition = new THREE.Vector3();
        spaceshipData.spaceshipGroup.getWorldPosition(worldPosition);
        
        // Update mini map
        miniMap.updateSpaceshipData(worldPosition, spaceshipData.spaceshipGroup.rotation.y);
        
        // Update HUD (không còn hiển thị gì)
        hudSystem.update(spaceshipData.spaceshipGroup, spaceshipData.isBoost);
        
        // Update events system với vị trí tàu vũ trụ
        spaceEvents.updateSpaceshipPosition(worldPosition);
        
        // Kiểm tra các sự kiện (hạ cánh, va chạm, etc.)
        spaceEvents.checkEvents();
        
        // THÊM: Update wayBackHome system
        wayBackHome.update();
    }
    
    // Update mini map
    miniMap.update();
    
    // Animate spaceship and environment
    animateSpaceship(camera, renderer, spaceshipData.spaceshipGroup);
}

// Start animation after loading
setTimeout(() => {
    animate();
    // CHỈ PHÁT NHẠC SAU KHI ĐÃ LOAD XONG
    backgroundMusic.play().catch(error => {
        console.log('Lỗi phát nhạc nền:', error);
    });
}, 3500);

// Navigation Button với thiết kế mới
const fly = document.createElement('button');
fly.innerHTML = '🌌 EXIT';
fly.style.position = 'absolute';
fly.style.top = '30px';
fly.style.right = '30px';
fly.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a24)';
fly.style.color = 'white';
fly.style.border = 'none';
fly.style.borderRadius = '25px';
fly.style.padding = '12px 24px';
fly.style.cursor = 'pointer';
fly.style.fontSize = '14px';
fly.style.fontWeight = 'bold';
fly.style.zIndex = '100';
fly.style.display = 'flex';
fly.style.alignItems = 'center';
fly.style.justifyContent = 'center';
fly.style.gap = '8px';
fly.style.transition = 'all 0.3s ease';
fly.style.boxShadow = '0 4px 15px rgba(238, 90, 36, 0.4)';
fly.title = 'Return to Main Menu';
document.body.appendChild(fly);

fly.addEventListener('mouseenter', () => {
    fly.style.transform = 'translateY(-2px)';
    fly.style.boxShadow = '0 6px 20px rgba(238, 90, 36, 0.6)';
});

fly.addEventListener('mouseleave', () => {
    fly.style.transform = 'translateY(0)';
    fly.style.boxShadow = '0 4px 15px rgba(238, 90, 36, 0.4)';
});

fly.addEventListener('click', () => {
    // Add exit animation
    fly.style.background = 'linear-gradient(45deg, #ff3838, #c23616)';
    fly.innerHTML = '🛸 EXITING...';
    
    // Dừng nhạc khi thoát
    backgroundMusic.pause();
    if (wayBackHome.returnMusic) {
        wayBackHome.returnMusic.pause();
    }
    
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1000);
});