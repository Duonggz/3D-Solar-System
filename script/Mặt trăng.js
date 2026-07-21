import * as THREE from 'three';  // Bare specifier (dùng importmap)
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';  // Bare specifier

let scene, camera, renderer, controls, video, videoTexture, sphere;
let fade = document.getElementById('fade');
let toggleBtn = document.getElementById('togglePlay');
let fullscreenBtn = document.getElementById('fullscreen-btn');

init();
animate();  // Chỉ gọi 1 lần

function init() {
  console.log('Mặt trăng.js initialized');  // Debug

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 0.1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.rotateSpeed = 0.3;

  // Video panorama (MUTED để dễ autoplay trong iframe)
  video = document.createElement('video');
  video.src = '../Videos/MOON.mp4';  // Kiểm tra path; thay URL online nếu lỗi
  video.loop = true;
  video.crossOrigin = 'anonymous';
  video.muted = true;  // Muted để tránh policy (unmute sau interact)
  video.playsInline = true;
  video.load();

  // Event video (debug + auto-play)
  video.addEventListener('loadeddata', () => {
    console.log('✅ Moon video loaded successfully');
    video.play().then(() => {
      console.log('▶️ Moon auto-play success (muted)');
      toggleBtn.textContent = "⏸️ Dừng";
      document.body.classList.add('playing');
      fade.classList.add('hidden');
    }).catch(e => {
      console.log('Moon auto-play blocked, click ▶️ to start');
    });
  });
  video.addEventListener('error', (e) => {
    console.error('❌ Moon video load error:', e);
  });

  videoTexture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.BackSide
  });

  const geometry = new THREE.SphereGeometry(500, 64, 64);
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Nút phát/dừng
  toggleBtn.onclick = () => {
    if (video.paused) {
      video.play().then(() => {
        toggleBtn.textContent = "⏸️ Dừng";
        document.body.classList.add('playing');
        fade.classList.add('hidden');
        backBtn.style.opacity = '0';
        console.log('▶️ Moon video playing (manual)');
        video.muted = false;  // Unmute sau interact
      }).catch(e => {
        console.error('Moon play failed:', e);
      });
    } else {
      video.pause();
      toggleBtn.textContent = "▶️ Phát";
      document.body.classList.remove('playing');
      backBtn.style.opacity = '1';
      console.log('⏸️ Moon video paused');
    }
  };

  // Nút fullscreen
  fullscreenBtn.onclick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      fullscreenBtn.textContent = "❎ Thoát";
    } else {
      document.exitFullscreen();
      fullscreenBtn.textContent = "🔳 Toàn màn hình";
    }
  };

  // Back và ESC (gửi message về parent)
  let backBtn = document.getElementById('Back-btn');
  if (backBtn) {
    backBtn.onclick = () => {
      window.parent.postMessage({ type: 'exitPanorama' }, '*');
      console.log('🔙 Moon Back clicked - sending exit message');
    };
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.parent.postMessage({ type: 'exitPanorama' }, '*');
      console.log('🔙 Moon ESC pressed - sending exit message');
    }
  });

  // Hiện controls khi di chuột
  let hideTimer;
  document.addEventListener('mousemove', () => {
    document.body.classList.remove('playing');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!video.paused) document.body.classList.add('playing');
    }, 2500);
  });

  // Resize
  window.addEventListener('resize', onWindowResize);

  // Hiệu ứng mở đầu
  setTimeout(() => fade.classList.add('hidden'), 1000);

  console.log('✅ Mặt trăng.js: Scene and video ready');
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  if (videoTexture) videoTexture.needsUpdate = true;
  if (renderer && scene && camera) renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
