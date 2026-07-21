import * as THREE from '../../three.module.js';
import { OrbitControls } from '../../OrbitControls.js';

let scene, camera, renderer, controls;
let video, videoTexture, sphere;
let isPlaying = false;
let currentVideoIndex = 0;

const videoSources = [
  '../videos/saturn2.mp4',
  '../videos/saturn1.mp4',
  '../videos/saturn_moon.mp4'
];

// Đợi DOM load xong rồi mới chạy
document.addEventListener('DOMContentLoaded', function() {
  init();
  initSettingsPanel(); // Khởi tạo panel settings
  animate();
});

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 0.1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.rotateSpeed = 0.3;

  // === Video setup ===
  video = document.createElement('video');
  video.src = videoSources[currentVideoIndex];
  video.crossOrigin = 'anonymous';
  video.loop = true;
  video.muted = false;
  video.setAttribute('playsinline', '');
  video.load();

  videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(500, 64, 64);
  geometry.scale(-1, 1, 1); // Lật mặt cầu
  const material = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.FrontSide
  });

  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // 🎬 Nút phát/dừng
  const playPauseBtn = document.getElementById('playPauseBtn');
  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      video.pause();
      playPauseBtn.textContent = '▶️ Phát';
    } else {
      video.play().catch(err => {
        console.log('Lỗi phát video:', err);
      });
      playPauseBtn.textContent = '⏸️ Dừng';
    }
    isPlaying = !isPlaying;
  });

  // 🔊 Thanh chỉnh âm lượng
  const volumeSlider = document.getElementById('volumeSlider');
  volumeSlider.addEventListener('input', (e) => {
    video.volume = parseFloat(e.target.value);
  });

  // ⏭️ Nút Next
  document.getElementById('next-btn').addEventListener('click', switchVideo);

  // 🔙 Nút Quay lại
  document.getElementById('back-btn').addEventListener('click', () => {
    document.body.style.transition = "opacity 0.5s";
    document.body.style.opacity = "0";
    setTimeout(() => {
      window.history.back();
    }, 500);
  });

  window.addEventListener('resize', onWindowResize);
}

// Hàm khởi tạo panel settings
function initSettingsPanel() {
  const settingsBtn = document.getElementById('settings-button');
  const panelSpaceExp = document.getElementById('panel-space-exp');
  const closeBtn = panelSpaceExp.querySelector('.close-btn');
  const panelFullscreenBtn = document.getElementById('panel-fullscreen-btn');

  console.log('Settings button:', settingsBtn);
  console.log('Panel:', panelSpaceExp);
  console.log('Close button:', closeBtn);

  // Mở/đóng panel
  if (settingsBtn) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Settings button clicked');
      panelSpaceExp.classList.toggle('active');
    });
  }

  // Đóng panel khi click nút X
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panelSpaceExp.classList.remove('active');
    });
  }

  // Xử lý chuyển hướng khi click vào các hành tinh
  const panelItems = document.querySelectorAll('.panel-item');
  panelItems.forEach(item => {
    item.addEventListener('click', () => {
      const link = item.getAttribute('data-link');
      if (link) {
        document.body.style.transition = "opacity 0.5s";
        document.body.style.opacity = "0";
        setTimeout(() => {
          window.location.href = link;
        }, 500);
      }
    });
  });

  // Xử lý toàn màn hình từ panel
  if (panelFullscreenBtn) {
    panelFullscreenBtn.addEventListener('click', toggleFullscreen);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Lỗi khi vào chế độ toàn màn hình: ${err.message}`);
      });
      panelFullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Thoát toàn màn hình';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        panelFullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Toàn màn hình';
      }
    }
  }

  // Theo dõi sự thay đổi chế độ fullscreen
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && panelFullscreenBtn) {
      panelFullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Toàn màn hình';
    }
  });

  // Đóng panel khi click bên ngoài
  document.addEventListener('click', (e) => {
    if (panelSpaceExp.classList.contains('active') && 
        !panelSpaceExp.contains(e.target) && 
        !settingsBtn.contains(e.target)) {
      panelSpaceExp.classList.remove('active');
    }
  });

  // Ngăn click inside panel đóng panel
  panelSpaceExp.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

function switchVideo() {
  video.pause();
  isPlaying = false;
  document.getElementById('playPauseBtn').textContent = '▶️ Phát';
  currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
  video.src = videoSources[currentVideoIndex];
  video.load();
  video.play().then(() => {
    isPlaying = true;
    document.getElementById('playPauseBtn').textContent = '⏸️ Dừng';
  }).catch(err => {
    console.log('Lỗi khi chuyển video:', err);
  });
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) {
    controls.update();
  }
  if (scene && camera) {
    renderer.render(scene, camera);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}