import * as THREE from '../../three.module.js';
import { OrbitControls } from '../../OrbitControls.js';

let scene, camera, renderer, controls, video, videoTexture, sphere;
let fade = document.getElementById('fade');
let toggleBtn = document.getElementById('togglePlay');
let fullscreenBtn = document.getElementById('fullscreen-btn');

init();
animate();

function init() {
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

  // === Video panorama ===
  video = document.createElement('video');
  video.src = '../Video/Nguyệt thực.mp4';
  video.loop = true;
  video.crossOrigin = 'anonymous';
  video.muted = false;
  video.playsInline = true;
  video.load();

  videoTexture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.BackSide
  });

  const geometry = new THREE.SphereGeometry(500, 64, 64);
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // === Nút phát/dừng ===
  toggleBtn.onclick = () => {
    if (video.paused) {
      video.play();
      toggleBtn.textContent = "⏸️ Dừng";
      document.body.classList.add('playing');
      fade.classList.add('hidden');
    } else {
      video.pause();
      toggleBtn.textContent = "▶️ Phát";
      document.body.classList.remove('playing');
    }
  };

  // === Nút fullscreen ===
  fullscreenBtn.onclick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      fullscreenBtn.textContent = "❎ Thoát";
    } else {
      document.exitFullscreen();
      fullscreenBtn.textContent = "🔳 Toàn màn hình";
    }
  };

  // === Hiện lại khi di chuột ===
  let hideTimer;
  document.addEventListener('mousemove', () => {
    document.body.classList.remove('playing');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!video.paused) document.body.classList.add('playing');
    }, 2500);
  });

  // === Resize ===
  window.addEventListener('resize', onWindowResize);

  // === Hiệu ứng mở đầu ===
  setTimeout(() => fade.classList.add('hidden'), 1000);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
