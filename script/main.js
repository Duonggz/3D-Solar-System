import * as THREE from 'three';
import { initEarth, animateEarth, scene, camera, renderer, controls, earth, rotationSpeed } from './earth.js';
import { addISS, updateISS, toggleFPS, issOrbit, isFPSMode } from './ISS.js';
import { addISSView, updateISSView, toggleView, stationaryISSGroup, isViewMode, toggleBackView, isBackViewMode } from './ISS_View.js';
import { initTravel, updateTravel, exitTravel, isTravelMode } from './travel.js';
import TWEEN from 'three/addons/libs/tween.module.js';

let clock = new THREE.Clock();
let panoramaVisible = false;
let moonVisible = false;
let isPanoramaActive = false;

// Biến theo dõi mode hiện tại
let currentMode = 'default';

initEarth();
addISS(scene, earth, camera, controls);
addISSView(scene, earth, camera, controls);

// 🎯 Hàm cập nhật active state
function updateActiveMode(mode) {
    currentMode = mode;
    
    // Gọi hàm từ HTML để cập nhật giao diện
    if (typeof window.setActiveMode === 'function') {
        window.setActiveMode(mode);
    }
    
    console.log(`🎮 Active mode: ${mode}`);
}

// 🧩 Hàm reset toàn bộ trước khi chuyển mode
function resetAllModes() {
  if (panoramaVisible || moonVisible || isPanoramaActive) exitPanorama();
  if (isTravelMode) exitTravel(scene, earth);
  if (isFPSMode) toggleFPS(camera, controls, earth);
  if (isBackViewMode) toggleBackView(camera, controls, earth);
  if (isViewMode) toggleView(camera, controls, earth, issOrbit);

  panoramaVisible = false;
  moonVisible = false;
  isPanoramaActive = false;

  // Reset về mode default
  updateActiveMode('default');

  console.log('🔄 Reset all modes → trở về trạng thái mặc định');
}

// 🌌 Exit panorama/moon
function exitPanorama() {
  const container = document.getElementById('panorama-container');
  if (container) {
    container.style.opacity = '0';
    setTimeout(() => {
      container.style.display = 'none';
      container.src = '';
      document.body.classList.remove('paused');
    }, 500);
  }
  panoramaVisible = false;
  moonVisible = false;
  isPanoramaActive = false;
  
  // Khi thoát panorama/moon, quay về mode trước đó hoặc default
  if (currentMode === 'astronaut' || currentMode === 'moon-view') {
    updateActiveMode('default');
  }
}
window.exitPanorama = exitPanorama;

// --- KEY EVENTS ---

// V - FPS mode
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'v') {
    e.preventDefault();
    
    // Nếu đang ở chế độ này rồi thì tắt đi
    if (currentMode === 'iss-inside') {
      resetAllModes();
      return;
    }
    
    resetAllModes();
    toggleFPS(camera, controls, earth);
    updateActiveMode('iss-inside');
  }
});

// C - ISS View mode
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'c') {
    e.preventDefault();
    
    // Nếu đang ở chế độ này rồi thì tắt đi
    if (currentMode === 'iss-outside1') {
      resetAllModes();
      return;
    }
    
    resetAllModes();
    toggleView(camera, controls, earth, issOrbit);
    updateActiveMode('iss-outside1');
  }
});

// B - Back view (chỉ kích hoạt nếu đang trong C)
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'b') {
    e.preventDefault();
    if (isViewMode) {
      toggleBackView(camera, controls, earth);
      // Cập nhật mode dựa trên trạng thái hiện tại của back view
      if (isBackViewMode) {
        updateActiveMode('iss-outside2');
      } else {
        updateActiveMode('iss-outside1');
      }
    }
  }
});

// N - Panorama
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'n') {
    e.preventDefault();
    
    // Nếu đang ở chế độ này rồi thì tắt đi
    if (currentMode === 'astronaut') {
      resetAllModes();
      return;
    }
    
    resetAllModes();

    const container = document.getElementById('panorama-container');
    if (!container) return;

    container.src = '../public/Pano.html';
    container.style.display = 'block';
    container.style.opacity = '0';
    container.style.transition = 'opacity 1s';
    document.body.classList.add('paused');
    setTimeout(() => (container.style.opacity = '1'), 300);

    panoramaVisible = true;
    isPanoramaActive = true;
    updateActiveMode('astronaut');
    console.log('🌌 Panorama mode activated');
  }
});

// F - Moon
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'f') {
    e.preventDefault();
    
    // Nếu đang ở chế độ này rồi thì tắt đi
    if (currentMode === 'moon-view') {
      resetAllModes();
      return;
    }
    
    resetAllModes();

    const container = document.getElementById('panorama-container');
    if (!container) return;

    container.src = '../public/Mặt trăng.html';
    container.style.display = 'block';
    container.style.opacity = '0';
    container.style.transition = 'opacity 1s';
    document.body.classList.add('paused');
    setTimeout(() => (container.style.opacity = '1'), 300);

    moonVisible = true;
    isPanoramaActive = true;
    updateActiveMode('moon-view');
    console.log('🌕 Moon mode activated');
  }
});

// R - Travel mode
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'r') {
    e.preventDefault();
    
    // Nếu đang ở chế độ này rồi thì tắt đi
    if (currentMode === 'travel') {
      resetAllModes();
      return;
    }
    
    resetAllModes();
    initTravel(scene, earth, camera);
    new TWEEN.Tween(camera.position)
      .to({ x: 0, y: 0, z: 4 }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
    
    updateActiveMode('travel');
    console.log('🚀 Travel mode activated');
  }
});

// ESC - Thoát mọi chế độ
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (currentMode !== 'default') {
      resetAllModes();
    }
  }
});

// 🎯 Export hàm để HTML có thể gọi
window.updateActiveMode = updateActiveMode;
window.getCurrentMode = () => currentMode;
window.resetAllModes = resetAllModes;

// --- ANIMATION LOOP ---
function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  if (!isPanoramaActive) {
    animateEarth(time);
    updateISS(time, rotationSpeed, camera, earth);
    updateISSView(time, rotationSpeed, camera, earth);
    updateTravel(earth, camera);
    TWEEN.update();
    renderer.render(scene, camera);
  } else {
    TWEEN.update();
  }
}

animate();