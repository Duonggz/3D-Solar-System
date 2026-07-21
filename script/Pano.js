import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, video, videoTexture, sphere;
let fade = document.getElementById('fade');
let toggleBtn = document.getElementById('togglePlay');
let fullscreenBtn = document.getElementById('fullscreen-btn');

init();
animate();  // Chỉ gọi 1 lần

function init() {
  console.log('Pano.js initialized');  // Debug: Confirm load

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
  video.src = '../Videos/sample.mp4';  // Kiểm tra path; thay bằng URL online nếu lỗi: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  video.loop = true;
  video.crossOrigin = 'anonymous';
  video.muted = true;  // ← THÊM: Muted để tránh autoplay policy block (có thể unmute sau nếu cần sound)
  video.playsInline = true;
  video.load();

  // Event video (debug + auto-play attempt)
  video.addEventListener('loadeddata', () => {
    console.log('✅ Video loaded successfully');
    // Thử auto-play ngay (với muted=true, dễ thành công hơn)
    video.play().then(() => {
      console.log('▶️ Auto-play success (muted)');
      toggleBtn.textContent = "⏸️ Dừng";  // Update UI nếu auto-play OK
      document.body.classList.add('playing');
      fade.classList.add('hidden');
    }).catch(e => {
      console.log('Auto-play blocked (normal), click ▶️ to start');
    });
  });
  video.addEventListener('error', (e) => {
    console.error('❌ Video load error:', e);
    // Fallback: Render sphere đen nếu video lỗi
    const fallbackMaterial = new THREE.MeshBasicMaterial({ color: 0x000011, side: THREE.BackSide });
    sphere.material = fallbackMaterial;
  });

  videoTexture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.BackSide
  });

  const geometry = new THREE.SphereGeometry(500, 64, 64);
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Nút phát/dừng (handle manual play nếu auto fail)
  toggleBtn.onclick = () => {
    if (video.paused) {
      video.play().then(() => {
        toggleBtn.textContent = "⏸️ Dừng";
        document.body.classList.add('playing');
        fade.classList.add('hidden');
        backBtn.style.opacity = '0';  // Ẩn Back khi playing
        console.log('▶️ Video playing (manual)');
        // Optional: Unmute nếu user interact
        video.muted = false;
      }).catch(e => {
        console.error('Play failed:', e);
        alert('Cannot play video. Check console or browser policy.');
      });
    } else {
      video.pause();
      toggleBtn.textContent = "▶️ Phát";
      document.body.classList.remove('playing');
      backBtn.style.opacity = '1';  // Hiện Back khi paused
      console.log('⏸️ Video paused');
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

  // Xử lý nút Back và ESC (gửi message về parent)
  let backBtn = document.getElementById('Back-btn');
  if (backBtn) {
    backBtn.onclick = () => {
      window.parent.postMessage({ type: 'exitPanorama' }, '*');
      console.log('🔙 Back button clicked - sending exit message');
    };
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.parent.postMessage({ type: 'exitPanorama' }, '*');
      console.log('🔙 ESC pressed - sending exit message');
    }
  });

  // Hiện lại controls khi di chuột
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

  // Hiệu ứng mở đầu (fade nội bộ)
  setTimeout(() => fade.classList.add('hidden'), 1000);

  // Confirm scene ready
  console.log('✅ Pano.js: Scene and video ready');
}

// Animation loop (chỉ 1 lần, update videoTexture mỗi frame)
function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  if (videoTexture) videoTexture.needsUpdate = true;  // Update video frame
  if (renderer && scene && camera) renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
