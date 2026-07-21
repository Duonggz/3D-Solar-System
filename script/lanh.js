// ==========================
// 3D Panorama System (Template) - Travel Integration
// Author: You 💫
// ==========================

import * as THREE from '../three.module.js';
import { OrbitControls } from '../OrbitControls.js';

let scene, camera, renderer, controls;
let panoramas = {};
let currentPanorama, nextPanorama;
let transitionProgress = 0;
let targetPanorama = null;

let video, videoTexture, videoMesh;

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const videoControls = document.getElementById("videoControls");
const label = document.getElementById("label");
const loading = document.getElementById("loading");

let config = null;
let isInitialized = false;

// ← THÊM: Parse query params cho Travel Mode
const urlParams = new URLSearchParams(window.location.search);
const setId = urlParams.get('set') || 'default';
const jsonParam = urlParams.get('json') || `../json/lanh.json`;

async function init() {
  if (loading) loading.style.display = "block";

  try {
    // Load config từ JSON param hoặc fallback
    let response = await fetch(jsonParam);
    if (!response.ok) {
      // Fallback dựa trên setId
      const defaultJson = setId === 'eiffel' ? '../json/lanh.json' : `../json/lanh${setId}.json`;
      response = await fetch(defaultJson);
      if (!response.ok) throw new Error(`Không load được config: ${jsonParam} hoặc ${defaultJson}`);
    }
    config = await response.json();

    // Set title
    document.title = (config.title || setId.charAt(0).toUpperCase() + setId.slice(1)) + ' 360° Experience';

    // === Scene setup ===
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 0.1);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.4;

    // Load textures
    const loader = new THREE.TextureLoader();
    const sphereGeo = new THREE.SphereGeometry(500, 64, 64);
    const panoData = config.panoramas;

    for (const key in panoData) {
      const tex = loader.load(panoData[key].file, undefined, undefined, (error) => {
        console.error(`Lỗi load texture ${panoData[key].file}:`, error);
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.BackSide,
        transparent: true,
        opacity: key === "pano_1" ? 1 : 0
      });
      panoramas[key] = new THREE.Mesh(sphereGeo, mat);
      panoramas[key].userData.label = panoData[key].label;
      scene.add(panoramas[key]);
    }

    currentPanorama = panoramas["pano_1"];
    createArrows("pano_1");
    createVideoScreen();

    window.addEventListener('resize', onWindowResize);
    playBtn.addEventListener("click", () => { if (video) video.play(); });
    pauseBtn.addEventListener("click", () => { if (video) video.pause(); });

    showLabel(currentPanorama.userData.label);

    if (loading) loading.style.display = "none";

    isInitialized = true;
    animate();

    // ← THÊM: ESC listener để thoát panorama (gửi message về parent Earth)
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        // Fade out và gửi message để parent ẩn container
        const container = window.parent.document.getElementById('panorama-container');
        if (container) {
          container.style.opacity = '0';
          setTimeout(() => {
            container.style.display = 'none';
            container.src = '';  // Clear
            window.parent.postMessage({ type: 'exitPanorama' }, '*');  // Notify parent
          }, 1000);
        }
      }
    });

    const exitBtn = document.getElementById("exitBtn");
if (exitBtn) {
  exitBtn.addEventListener('click', () => {
    // Same as ESC: Fade out và gửi message
    const container = window.parent.document.getElementById('panorama-container');
    if (container) {
      container.style.opacity = '0';
      setTimeout(() => {
        container.style.display = 'none';
        container.src = '';
        window.parent.postMessage({ type: 'exitPanorama' }, '*');
      }, 1000);
    }
    console.log('🔙 Exited panorama via button');
  });
}
    console.log(`🌍 Loaded panorama for set: ${setId}`);

  } catch (error) {
    console.error('Lỗi init:', error);
    if (loading) loading.innerHTML = `Lỗi: ${error.message}`;
  }
}

// Các function khác giữ nguyên từ fixed version trước (createArrows, startTransition, createVideoScreen, animate, onWindowResize, showLabel)
function createArrows(panoramaName) {
  const container = document.getElementById("arrowContainer");
  if (!container) return;
  container.innerHTML = "";

  if (!config || !config.navigation || !config.navigation[panoramaName]) {
    console.warn(`Không có navigation cho ${panoramaName}`);
    return;
  }

  config.navigation[panoramaName].forEach(arrowConfig => {
    createArrow(arrowConfig.symbol, arrowConfig.target);
  });
}

function createArrow(symbol, target) {
  const container = document.getElementById("arrowContainer");
  if (!container) return;
  const arrow = document.createElement("div");
  arrow.className = "arrow";
  arrow.textContent = symbol;
  arrow.dataset.target = target;

  arrow.addEventListener("click", () => {
    startTransition(target);
  });

  container.appendChild(arrow);
}

function startTransition(targetName) {
  if (!panoramas[targetName] || targetName === currentPanorama) return;

  nextPanorama = panoramas[targetName];
  targetPanorama = targetName;
  transitionProgress = 0.001;

  showLabel(nextPanorama.userData.label);
}

function createVideoScreen() {
  if (!config || !config.video) {
    console.warn('Không có video config');
    return;
  }

  video = document.createElement('video');
  video.src = config.video;
  video.crossOrigin = 'anonymous';
  video.loop = true;
  video.muted = false;
  video.preload = 'auto';
  video.load();

  video.addEventListener('error', (e) => {
    console.error('Lỗi load video:', e);
  });

  videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;

  const videoMat = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.FrontSide });
  const videoGeo = new THREE.PlaneGeometry(80, 45);
  videoMesh = new THREE.Mesh(videoGeo, videoMat);
  videoMesh.position.set(0, 0, -100);
  videoMesh.visible = false;
  scene.add(videoMesh);
}

function animate() {
  if (!isInitialized || !controls || !renderer || !scene || !camera) {
    requestAnimationFrame(animate);
    return;
  }

  requestAnimationFrame(animate);
  controls.update();

  if (transitionProgress > 0 && transitionProgress < 1) {
    transitionProgress += 0.02;
    currentPanorama.material.opacity = 1.0 - transitionProgress;
    nextPanorama.material.opacity = transitionProgress;

    if (transitionProgress >= 1) {
      currentPanorama = nextPanorama;
      transitionProgress = 0;
      createArrows(targetPanorama);

      const inVideoScene = targetPanorama === "pano_3";
      if (videoMesh) videoMesh.visible = inVideoScene;
      if (videoControls) videoControls.style.display = inVideoScene ? "block" : "none";
    }
  }

  if (video && videoMesh && videoMesh.visible && !video.paused) {
    videoTexture.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function showLabel(text) {
  if (!label) return;
  label.style.opacity = 0;
  setTimeout(() => {
    label.textContent = text;
    label.style.opacity = 1;
  }, 300);
}

init();
