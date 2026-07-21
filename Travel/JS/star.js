// ==========================
// 3D Panorama Eiffel System
// Author: You 💫
// ==========================

import * as THREE from '../../three.module.js';
import { OrbitControls } from '../../OrbitControls.js';

let scene, camera, renderer, controls;
let panoramas = {};           // Danh sách các panorama
let currentPanorama, nextPanorama;
let transitionProgress = 0;
let targetPanorama = null;

// Video màn hình ảo
let video, videoTexture, videoMesh;

// UI elements
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const videoControls = document.getElementById("videoControls");
const label = document.getElementById("label");

init();
animate();

function init() {
  // === Scene setup ===
  scene = new THREE.Scene();

  // === Camera ===
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 0.1);

  // === Renderer ===
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 1);
  document.body.appendChild(renderer.domElement);

  // === OrbitControls ===
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.rotateSpeed = 0.4;

  // === Load textures ===
  const loader = new THREE.TextureLoader();
  const sphereGeo = new THREE.SphereGeometry(500, 64, 64);

  const panoData = {
    eiffel_1: { file: '../../textures1/star_1.jpg', label: 'United States - View 1' },
    eiffel_2: { file: '../../textures1/star_2.jpg', label: 'Cornell University - View 2' },
    eiffel_3: { file: '../../textures1/star_3.jpg', label: 'Golf Skukuza - View 3 (Video Area)' }
  };

  for (const key in panoData) {
    const tex = loader.load(panoData[key].file);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide,
      transparent: true,
      opacity: key === "eiffel_1" ? 1 : 0
    });
    panoramas[key] = new THREE.Mesh(sphereGeo, mat);
    panoramas[key].userData.label = panoData[key].label;
    scene.add(panoramas[key]);
  }

  currentPanorama = panoramas["eiffel_1"];
  createArrows("eiffel_1");
  createVideoScreen();

  // === Events ===
  window.addEventListener('resize', onWindowResize);

  playBtn.addEventListener("click", () => { if (video) video.play(); });
  pauseBtn.addEventListener("click", () => { if (video) video.pause(); });

  showLabel(currentPanorama.userData.label);
}

// =================================
// Create arrows with HTML/CSS
// =================================
function createArrows(panoramaName) {
  const container = document.getElementById("arrowContainer");
  container.innerHTML = ""; // Xoá mũi tên cũ

  if (panoramaName === "eiffel_1") {
    createArrow("➡", "eiffel_2");
  } else if (panoramaName === "eiffel_2") {
    createArrow("⬅", "eiffel_1");
    createArrow("➡", "eiffel_3");
  } else if (panoramaName === "eiffel_3") {
    createArrow("⬅", "eiffel_2");
  }
}

function createArrow(symbol, target) {
  const container = document.getElementById("arrowContainer");
  const arrow = document.createElement("div");
  arrow.className = "arrow";
  arrow.textContent = symbol;
  arrow.dataset.target = target;

  arrow.addEventListener("click", () => {
    startTransition(target);
  });

  container.appendChild(arrow);
}

// =================================
// Start smooth transition
// =================================
function startTransition(targetName) {
  if (!panoramas[targetName] || targetName === currentPanorama) return;

  nextPanorama = panoramas[targetName];
  targetPanorama = targetName;
  transitionProgress = 0.001;

  showLabel(nextPanorama.userData.label);
}

// =================================
// Video screen (visible in eiffel_3)
// =================================
function createVideoScreen() {
  video = document.createElement('video');
  video.src = '../../Video/star.mp4';
  video.crossOrigin = 'anonymous';
  video.loop = true;
  video.muted = false;
  video.preload = 'auto';

  videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;

  const videoMat = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.FrontSide });
  const videoGeo = new THREE.PlaneGeometry(80, 45);
  videoMesh = new THREE.Mesh(videoGeo, videoMat);
  videoMesh.position.set(0, 0, -100);
  videoMesh.visible = false;
  scene.add(videoMesh);
}

// =================================
// Animation loop
// =================================
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Fade chuyển cảnh
  if (transitionProgress > 0 && transitionProgress < 1) {
    transitionProgress += 0.02;
    currentPanorama.material.opacity = 1.0 - transitionProgress;
    nextPanorama.material.opacity = transitionProgress;

    if (transitionProgress >= 1) {
      currentPanorama = nextPanorama;
      transitionProgress = 0;
      createArrows(targetPanorama);

      // Hiển thị video screen nếu đang ở eiffel_3
      const inVideoScene = targetPanorama === "eiffel_3";
      videoMesh.visible = inVideoScene;
      videoControls.style.display = inVideoScene ? "block" : "none";
    }
  }

  renderer.render(scene, camera);
}

// =================================
// Responsive resize
// =================================
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// =================================
// Hiển thị tên địa điểm (label fade)
// =================================
function showLabel(text) {
  label.style.opacity = 0;
  setTimeout(() => {
    label.textContent = text;
    label.style.opacity = 1;
  }, 300);
}
