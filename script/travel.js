// ==========================
// Travel Mode: Mixed Labels (Panorama + Google Maps Links) - FULL UPDATE
// Author: You 💫
// ==========================

import * as THREE from 'three';

let travelLabels = [];
let travelLines = [];
let isTravelMode = false;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let globalScene, globalEarth, globalCamera;

const EARTH_RADIUS = 2;
const OFFSET_DISTANCE = 1.2;  // Giữ gần

const destinations = [
  // ← CŨ: Panorama labels (type: 'panorama' default)
  { name: 'Eiffel Tower (Paris)', lat: 48.8584, lng: 2.2945, setId: 'eiffel', type: 'panorama' },
  { name: 'Hamburg (Germany)', lat: 53.5511, lng: 9.9937, setId: 'hamburg', type: 'panorama' },
  { name: 'Boreal Forest (Finland)', lat: 64.0, lng: 26.0, setId: 'finland', type: 'panorama' },
  { name: 'Kharkiv (Ukraine)', lat: 49.9935, lng: 36.2304, setId: 'kharkiv', type: 'panorama' },
  { name: 'Colosseum (Rome)', lat: 41.8902, lng: 12.4922, setId: 'kharkiv', type: 'panorama' },
  { name: 'Dublin (Ireland)', lat: 53.3498, lng: -6.2603, setId: 'dublin', type: 'panorama' },
  { name: 'Cape Town (South Africa)', lat: -33.9249, lng: 18.4241, setId: 'dublin', type: 'panorama' },

  // ← MỚI: Map labels (type: 'map', url: link)
  { name: 'Vạn lý trường thành', lat: 40.3592, lng: 116.0056, type: 'map', url: 'https://maps.app.goo.gl/XLmPwVzj5e6jXUeg6' },
  { name: 'Petra', lat: 30.3285, lng: 35.4444, type: 'map', url: 'https://maps.app.goo.gl/mNUETvtrMdBySbPg8' },
  { name: 'Tượng Cristo Redentor', lat: -22.9519, lng: -43.2105, type: 'map', url: 'https://maps.app.goo.gl/uxzyc6YnWrjwFuX1A' },
  { name: 'Taj Mahal ở Agra', lat: 27.1751, lng: 78.0421, type: 'map', url: 'https://maps.app.goo.gl/rsG5unrRqUYARPsT8' },
  { name: 'Machu Picchu', lat: -13.1631, lng: -72.5450, type: 'map', url: 'https://maps.app.goo.gl/GoaWv2NnJSJE9EL58' },
  { name: 'Đại kim tự tháp Giza', lat: 29.9792, lng: 31.1342, type: 'map', url: 'https://maps.app.goo.gl/Z5342Atu4H7mQLCw5' },
  { name: 'Chichen Itza', lat: 20.6829, lng: -88.5686, type: 'map', url: 'https://maps.app.goo.gl/Q18tLtJbbqW1DE9HA' },
  { name: 'Đấu trường La Mã', lat: 41.8902, lng: 12.4922, type: 'map', url: 'https://maps.app.goo.gl/KtRftBMJxvQg2WWJ9' },  // Colosseum, link mới
  { name: 'Tháp nghiêng Pisa', lat: 43.7233, lng: 10.3966, type: 'map', url: 'https://maps.app.goo.gl/sz3Tqun2iZdvLYn36' },
  { name: 'Vịnh Hạ Long', lat: 20.9101, lng: 107.1839, type: 'map', url: 'https://maps.app.goo.gl/6dYx94AxyHuXyCbh7' },
  { name: 'Hồ Hoàn Kiếm', lat: 21.0285, lng: 105.8522, type: 'map', url: 'https://maps.app.goo.gl/FTgozLY3f4eUrtDr9' },
  { name: 'Nhà Việt', lat: 21.0285, lng: 105.8342, type: 'map', url: 'https://maps.app.goo.gl/M5SdojXwS3rYzJpe7' }  // Giả định Nhà hát Lớn Hà Nội
];

function latLongToVector3(lat, lng, radius = EARTH_RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createLabelSprite(text, type = 'panorama') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 200;
  canvas.height = 50;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, 200, 50);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, 100, 35);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ 
    map: texture, 
    transparent: true,
    alphaTest: 0.1
  });
  // ← MỚI: Color theo type (panorama: green, map: blue)
  material.color = new THREE.Color(type === 'map' ? 0x00aaff : 0x00ff00);
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.2, 0.3, 1);
  return sprite;
}

export function initTravel(scene, earth, camera) {
  if (isTravelMode) return;

  globalScene = scene;
  globalEarth = earth;
  globalCamera = camera;

  destinations.forEach((dest, index) => {
    const localSurfacePos = latLongToVector3(dest.lat, dest.lng, EARTH_RADIUS);

    const label = createLabelSprite(dest.name, dest.type || 'panorama');
    label.userData = { 
      dest: dest, 
      localSurfacePos: localSurfacePos.clone(), 
      index: index 
    };
    label.position.copy(localSurfacePos.clone().normalize().multiplyScalar(EARTH_RADIUS + OFFSET_DISTANCE));
    globalScene.add(label);
    travelLabels.push(label);

    // Glow (color theo type)
    try {
      const glowColor = dest.type === 'map' ? 0x00aaff : 0x00ff00;
      const glowLight = new THREE.PointLight(glowColor, 0.5, 3);
      glowLight.position.copy(label.position);
      globalScene.add(glowLight);
      label.userData.glow = glowLight;
    } catch (e) {
      console.warn('Glow creation failed:', e);
    }

    // Line (color theo type)
    const lineColor = dest.type === 'map' ? 0x00aaff : 0x00ff00;
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: lineColor, 
      transparent: true, 
      opacity: 0.6,
      linewidth: 2
    });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    line.userData = { label: label };
    globalScene.add(line);
    travelLines.push(line);
  });

  // Event functions
  function getTravelObjects() {
    return [...travelLabels, ...travelLines];
  }

  function onTravelClick(event) {
    if (!isTravelMode || !globalCamera) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, globalCamera);

    const travelObjects = getTravelObjects();
    const intersects = raycaster.intersectObjects(travelObjects, true);
    let hitObject = intersects[0]?.object;

    if (travelLines.includes(hitObject)) {
      hitObject = hitObject.userData.label;
    }
    if (travelLabels.includes(hitObject)) {
      const label = hitObject;
      const dest = label.userData.dest;

      // ← MỚI: Check type để action khác nhau
      if (dest.type === 'map' && dest.url) {
        // Mở Google Maps tab mới
        window.open(dest.url, '_blank');
        console.log(`🗺️ Opened Google Maps for ${dest.name}`);
      } else {
        // Panorama cũ
        loadPanorama(dest.setId, dest.name);
      }
    }
  }

  function onTravelMouseMove(event) {
    if (!isTravelMode || !globalCamera) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, globalCamera);

    const travelObjects = getTravelObjects();
    const intersects = raycaster.intersectObjects(travelObjects, true);
    let hitObject = intersects[0]?.object;

    if (travelLines.includes(hitObject)) {
      hitObject = hitObject.userData.label;
    }

    // Reset
    travelLabels.forEach(label => {
      label.scale.set(1.2, 0.3, 1);
      if (label.userData.glow) label.userData.glow.intensity = 0.5;
    });
    travelLines.forEach(line => {
      line.material.opacity = 0.6;
    });

    // Hover
    if (travelLabels.includes(hitObject)) {
      const label = hitObject;
      label.scale.set(1.6, 0.4, 1);
      if (label.userData.glow) label.userData.glow.intensity = 1.2;
      const connectedLine = travelLines.find(l => l.userData.label === label);
      if (connectedLine) connectedLine.material.opacity = 1.0;
    }
  }

  window.addEventListener('click', onTravelClick);
  window.addEventListener('mousemove', onTravelMouseMove);
  window.travelClickListener = onTravelClick;
  window.travelMouseListener = onTravelMouseMove;

  isTravelMode = true;
  console.log('🌍 Travel Mode ON – Added Map labels (blue) + Panorama (green). Total:', destinations.length);
}

export function updateTravel(earth, camera) {
  if (!isTravelMode || travelLabels.length === 0) return;

  travelLabels.forEach((label, index) => {
    const localSurfacePos = label.userData.localSurfacePos.clone();
    const surfaceWorldPos = localSurfacePos.clone().applyMatrix4(earth.matrixWorld);

    const outwardDir = surfaceWorldPos.clone().normalize();
    const labelWorldPos = surfaceWorldPos.clone().add(outwardDir.multiplyScalar(OFFSET_DISTANCE));

    label.position.copy(labelWorldPos);
    label.lookAt(camera.position);

    if (label.userData.glow) {
      label.userData.glow.position.copy(labelWorldPos);
      label.userData.glow.intensity = 0.5 + Math.sin(Date.now() * 0.005 + index) * 0.3;
    }

    const line = travelLines[index];
    if (line) {
      const points = [surfaceWorldPos, labelWorldPos];
      line.geometry.setFromPoints(points);
      line.geometry.attributes.position.needsUpdate = true;
    }
  });
}

// loadPanorama giữ nguyên (chỉ dùng cho type 'panorama')
function loadPanorama(setId, name) {
  const container = document.getElementById('panorama-container');
  if (!container) {
    console.error('Panorama container not found! Fallback to new tab.');
    window.open(`lanh.html?set=${setId}`, '_blank');
    return;
  }

  let jsonPath = '../json/lanh.json';
  const setMap = {
    'eiffel': '../json/lanh.json',
    'hamburg': '../json/lanh1.json',
    'finland': '../json/lanh2.json',
    'kharkiv': '../json/lanh3.json',
    'dublin': '../json/lanh4.json'
  };
  jsonPath = setMap[setId] || jsonPath;

  container.src = `lanh.html?set=${setId}&json=${encodeURIComponent(jsonPath)}`;
  container.style.display = 'block';
  container.style.opacity = '0';
  container.style.transition = 'opacity 1s';
  setTimeout(() => { container.style.opacity = '1'; }, 100);

  console.log(`✈️ Traveling to ${name} – Loading set: ${setId}`);
}

export function exitTravel(scene, earth) {
  if (!isTravelMode) return;

  travelLabels.forEach(label => {
    globalScene.remove(label);
    if (label.material.map) label.material.map.dispose();
    label.material.dispose();
    if (label.userData.glow) {
      globalScene.remove(label.userData.glow);
      label.userData.glow.dispose();
    }
  });

  travelLines.forEach(line => {
    globalScene.remove(line);
    if (line.material) line.material.dispose();
    if (line.geometry) line.geometry.dispose();
  });

  travelLabels = [];
  travelLines = [];

  if (window.travelClickListener) {
    window.removeEventListener('click', window.travelClickListener);
    delete window.travelClickListener;
  }
  if (window.travelMouseListener) {
    window.removeEventListener('mousemove', window.travelMouseListener);
    delete window.travelMouseListener;
  }

  const container = document.getElementById('panorama-container');
  if (container) {
    container.style.opacity = '0';
    setTimeout(() => {
      container.style.display = 'none';
      container.src = '';
    }, 1000);
  }

  globalScene = null;
  globalEarth = null;
  globalCamera = null;

  isTravelMode = false;
  console.log('🌍 Travel Mode OFF');
}

export { isTravelMode };
