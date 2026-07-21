import * as THREE from 'three';

// Constants
const MINI_MAP_SIZE_SMALL = 250;
const MINI_MAP_SIZE_LARGE = 600;
const MIN_ZOOM = 1;
const MAX_ZOOM = 30;
const ZOOM_SPEED = 0.1;
const PAN_SPEED = 2;

class MiniMap {
    constructor() {
        this.isFullscreen = false;
        this.currentSize = MINI_MAP_SIZE_SMALL;
        this.zoomLevel = 1;
        this.offset = new THREE.Vector2(0, 0);
        this.targetZoom = 1;
        this.targetOffset = new THREE.Vector2(0, 0);
        this.isDragging = false;
        this.lastMousePos = new THREE.Vector2(0, 0);
        this.planetIcons = {};
        this.spaceshipIcon = null;
        this.spaceData = null;
        this.spaceshipPos = new THREE.Vector3(0, 0, 0);
        this.spaceshipRotation = 0;
        
        this.init();
        this.loadPlanetIcons();
        this.setupEventListeners();
    }

    init() {
        // Create mini map container
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.bottom = '20px';
        this.container.style.right = '20px';
        this.container.style.width = `${MINI_MAP_SIZE_SMALL}px`;
        this.container.style.height = `${MINI_MAP_SIZE_SMALL}px`;
        this.container.style.border = '2px solid rgba(0, 255, 255, 0.8)';
        this.container.style.borderRadius = '10px';
        this.container.style.background = 'rgba(0, 0, 0, 0.7)';
        this.container.style.overflow = 'hidden';
        this.container.style.cursor = 'pointer';
        this.container.style.zIndex = '1000';
        this.container.style.transition = 'all 0.3s ease';
        document.body.appendChild(this.container);

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = MINI_MAP_SIZE_SMALL;
        this.canvas.height = MINI_MAP_SIZE_SMALL;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');

        // Create close button for fullscreen mode
        this.closeButton = document.createElement('button');
        this.closeButton.innerHTML = '×';
        this.closeButton.style.position = 'absolute';
        this.closeButton.style.top = '10px';
        this.closeButton.style.right = '10px';
        this.closeButton.style.background = 'rgba(255, 0, 0, 0.7)';
        this.closeButton.style.color = 'white';
        this.closeButton.style.border = 'none';
        this.closeButton.style.borderRadius = '50%';
        this.closeButton.style.width = '30px';
        this.closeButton.style.height = '30px';
        this.closeButton.style.cursor = 'pointer';
        this.closeButton.style.fontSize = '20px';
        this.closeButton.style.fontWeight = 'bold';
        this.closeButton.style.display = 'none';
        this.closeButton.style.zIndex = '1001';
        this.closeButton.title = 'Close (C)';
        this.container.appendChild(this.closeButton);

        // Create zoom info display
        this.zoomInfo = document.createElement('div');
        this.zoomInfo.style.position = 'absolute';
        this.zoomInfo.style.bottom = '10px';
        this.zoomInfo.style.left = '10px';
        this.zoomInfo.style.color = 'white';
        this.zoomInfo.style.fontSize = '12px';
        this.zoomInfo.style.background = 'rgba(0, 0, 0, 0.5)';
        this.zoomInfo.style.padding = '2px 6px';
        this.zoomInfo.style.borderRadius = '3px';
        this.zoomInfo.style.display = 'none';
        this.container.appendChild(this.zoomInfo);

        // Create controls info
        this.controlsInfo = document.createElement('div');
        this.controlsInfo.style.position = 'absolute';
        this.controlsInfo.style.top = '10px';
        this.controlsInfo.style.left = '10px';
        this.controlsInfo.style.color = 'white';
        this.controlsInfo.style.fontSize = '12px';
        this.controlsInfo.style.background = 'rgba(0, 0, 0, 0.5)';
        this.controlsInfo.style.padding = '5px';
        this.controlsInfo.style.borderRadius = '3px';
        this.controlsInfo.style.display = 'none';
        this.controlsInfo.innerHTML = 'Wheel: Zoom | Drag: Move | C: Close';
        this.container.appendChild(this.controlsInfo);

        // Create center info
        this.centerInfo = document.createElement('div');
        this.centerInfo.style.position = 'absolute';
        this.centerInfo.style.bottom = '30px';
        this.centerInfo.style.left = '10px';
        this.centerInfo.style.color = 'white';
        this.centerInfo.style.fontSize = '10px';
        this.centerInfo.style.background = 'rgba(0, 0, 0, 0.5)';
        this.centerInfo.style.padding = '2px 6px';
        this.centerInfo.style.borderRadius = '3px';
        this.centerInfo.style.display = 'none';
        this.centerInfo.innerHTML = 'Center: Sun';
        this.container.appendChild(this.centerInfo);
    }

    async loadPlanetIcons() {
        const planets = [
            'sun', 'mercury', 'venus', 'earth', 'mars', 
            'jupiter', 'saturn', 'uranus', 'neptune', 'spaceship'
        ];

        for (const planet of planets) {
            await this.loadIcon(planet);
        }
    }

    loadIcon(planetName) {
        return new Promise((resolve) => {
            // Using simple colored circles as fallback
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            
            // Create colored circles for planets
            const colors = {
                sun: '#FFD700',
                mercury: '#8C7853',
                venus: '#FFC649',
                earth: '#6B93D6',
                mars: '#CD5C5C',
                jupiter: '#D8CA9D',
                saturn: '#FAD5A5',
                uranus: '#4FD0E7',
                neptune: '#4B70DD',
                spaceship: '#00FFFF'
            };

            if (planetName === 'spaceship') {
                // Draw spaceship as triangle pointing UP (corrected direction)
                ctx.beginPath();
                ctx.moveTo(16, 8);    // Top center - nose of spaceship
                ctx.lineTo(24, 24);   // Bottom right
                ctx.lineTo(8, 24);    // Bottom left
                ctx.closePath();
                ctx.fillStyle = colors[planetName];
                ctx.fill();
                
                // Add outline
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Add cockpit window
                ctx.fillStyle = '#00AAFF';
                ctx.beginPath();
                ctx.arc(16, 14, 3, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(16, 16, 15, 0, 2 * Math.PI);
                ctx.fillStyle = colors[planetName];
                ctx.fill();
                
                if (planetName === 'sun') {
                    ctx.strokeStyle = '#FF4500';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            this.planetIcons[planetName] = canvas;
            resolve();
        });
    }

    setupEventListeners() {
        // Toggle fullscreen on click
        this.container.addEventListener('click', (e) => {
            if (!this.isFullscreen) {
                this.toggleMiniMapFullscreen();
            }
        });

        // Close button
        this.closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMiniMapFullscreen();
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.isFullscreen) {
                if (e.code === 'KeyC') {
                    this.toggleMiniMapFullscreen();
                } else if (e.code === 'Equal' || e.code === 'NumpadAdd') {
                    this.zoomIn();
                } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
                    this.zoomOut();
                }
            }
        });

        // Mouse wheel for zoom
        this.container.addEventListener('wheel', (e) => {
            if (this.isFullscreen) {
                e.preventDefault();
                e.stopPropagation();
                const zoomFactor = e.deltaY > 0 ? 1 - ZOOM_SPEED : 1 + ZOOM_SPEED;
                this.setZoom(this.zoomLevel * zoomFactor);
            }
        }, { passive: false });

        // Mouse drag for panning
        this.container.addEventListener('mousedown', (e) => {
            if (this.isFullscreen && e.button === 0) {
                this.isDragging = true;
                this.lastMousePos.set(e.clientX, e.clientY);
                this.container.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isFullscreen && this.isDragging) {
                const deltaX = e.clientX - this.lastMousePos.x;
                const deltaY = e.clientY - this.lastMousePos.y;
                
                this.targetOffset.x -= deltaX * PAN_SPEED / this.zoomLevel;
                this.targetOffset.y -= deltaY * PAN_SPEED / this.zoomLevel;
                
                // Clamp offset to reasonable values
                const maxOffset = 1000 * this.zoomLevel;
                this.targetOffset.x = THREE.MathUtils.clamp(this.targetOffset.x, -maxOffset, maxOffset);
                this.targetOffset.y = THREE.MathUtils.clamp(this.targetOffset.y, -maxOffset, maxOffset);
                
                this.lastMousePos.set(e.clientX, e.clientY);
                e.preventDefault();
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.container.style.cursor = 'grab';
            }
        });

        // Prevent context menu on right click
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    toggleMiniMapFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        
        if (this.isFullscreen) {
            // Mini map lớn: Mặt Trời ở trung tâm
            this.currentSize = MINI_MAP_SIZE_LARGE;
            this.container.style.width = `${this.currentSize}px`;
            this.container.style.height = `${this.currentSize}px`;
            this.container.style.bottom = '50%';
            this.container.style.right = '50%';
            this.container.style.transform = 'translate(50%, 50%)';
            this.container.style.cursor = 'grab';
            this.container.style.zIndex = '10000';
            
            this.closeButton.style.display = 'block';
            this.zoomInfo.style.display = 'block';
            this.controlsInfo.style.display = 'block';
            this.centerInfo.style.display = 'block';
            this.centerInfo.innerHTML = 'Center: Sun';
            
            // Reset về Mặt Trời trung tâm
            this.targetOffset.set(0, 0);
            this.offset.set(0, 0);
            
            this.canvas.width = MINI_MAP_SIZE_LARGE;
            this.canvas.height = MINI_MAP_SIZE_LARGE;
        } else {
            // Mini map nhỏ: Tàu vũ trụ ở trung tâm
            this.currentSize = MINI_MAP_SIZE_SMALL;
            this.container.style.width = `${this.currentSize}px`;
            this.container.style.height = `${this.currentSize}px`;
            this.container.style.bottom = '20px';
            this.container.style.right = '20px';
            this.container.style.transform = 'none';
            this.container.style.cursor = 'pointer';
            this.container.style.zIndex = '1000';
            
            this.closeButton.style.display = 'none';
            this.zoomInfo.style.display = 'none';
            this.controlsInfo.style.display = 'none';
            this.centerInfo.style.display = 'none';
            
            // Reset zoom khi đóng
            this.targetZoom = 1;
            this.targetOffset.set(0, 0);
            this.offset.set(0, 0);
            
            this.canvas.width = MINI_MAP_SIZE_SMALL;
            this.canvas.height = MINI_MAP_SIZE_SMALL;
        }
        
        this.drawHTMLMiniMap();
    }

    setZoom(level) {
        this.targetZoom = THREE.MathUtils.clamp(level, MIN_ZOOM, MAX_ZOOM);
    }

    zoomIn() {
        this.setZoom(this.zoomLevel * (1 + ZOOM_SPEED));
    }

    zoomOut() {
        this.setZoom(this.zoomLevel * (1 - ZOOM_SPEED));
    }

    updateSpaceshipData(position, rotation) {
        this.spaceshipPos.copy(position);
        this.spaceshipRotation = rotation;
    }

    updateSpaceData(spaceData) {
        this.spaceData = spaceData;
    }

    drawHTMLMiniMap() {
        if (!this.ctx) return;

        const ctx = this.ctx;
        const size = this.currentSize;
        const centerX = size / 2;
        const centerY = size / 2;

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, size, size);

        // Smooth zoom and pan
        this.zoomLevel = THREE.MathUtils.lerp(this.zoomLevel, this.targetZoom, 0.1);
        this.offset.lerp(this.targetOffset, 0.1);

        // Update zoom info
        if (this.isFullscreen) {
            this.zoomInfo.textContent = `Zoom: ${this.zoomLevel.toFixed(1)}x`;
        }

        // Draw elements only if we have space data
        if (this.spaceData) {
            // Tính toán offset dựa trên chế độ
            let drawOffsetX = 0;
            let drawOffsetY = 0;

            if (!this.isFullscreen) {
                // Mini map nhỏ: Tàu vũ trụ ở trung tâm
                drawOffsetX = -this.spaceshipPos.x * this.calculateScale();
                drawOffsetY = -this.spaceshipPos.z * this.calculateScale();
            } else {
                // Mini map lớn: Mặt Trời ở trung tâm + cho phép kéo
                drawOffsetX = this.offset.x;
                drawOffsetY = this.offset.y;
            }

            // Draw orbits
            this.drawOrbits(ctx, centerX, centerY, size, drawOffsetX, drawOffsetY);

            // Draw planets
            this.drawPlanets(ctx, centerX, centerY, size, drawOffsetX, drawOffsetY);

            // Draw spaceship
            this.drawSpaceship(ctx, centerX, centerY, size, drawOffsetX, drawOffsetY);
        } else {
            // Draw loading message
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Loading...', centerX, centerY);
        }

        // Draw border
        ctx.strokeStyle = this.isFullscreen ? '#00FFFF' : '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, size, size);

        // Draw title và center info
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        if (this.isFullscreen) {
            ctx.fillText('SOLAR SYSTEM MAP - SUN CENTERED', centerX, 20);
        } else {
            ctx.fillText('SHIP RADAR - SHIP CENTERED', centerX, 20);
        }

        // Draw center crosshair for small map
        if (!this.isFullscreen) {
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            
            // Crosshair tại trung tâm (vị trí tàu)
            ctx.beginPath();
            ctx.moveTo(centerX - 10, centerY);
            ctx.lineTo(centerX + 10, centerY);
            ctx.moveTo(centerX, centerY - 10);
            ctx.lineTo(centerX, centerY + 10);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    drawOrbits(ctx, centerX, centerY, size, offsetX, offsetY) {
        if (!this.spaceData.orbitLines) return;

        const scale = this.calculateScale();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;

        // Draw orbit lines
        this.spaceData.orbitLines.forEach(orbitLine => {
            const positions = orbitLine.geometry.attributes.position;
            if (positions && positions.count > 0) {
                ctx.beginPath();
                
                let firstPoint = true;
                for (let i = 0; i < positions.count; i++) {
                    const x = positions.getX(i) * scale + centerX + offsetX;
                    const y = positions.getZ(i) * scale + centerY + offsetY;
                    
                    // Only draw if point is within reasonable bounds
                    if (x > -100 && x < size + 100 && y > -100 && y < size + 100) {
                        if (firstPoint) {
                            ctx.moveTo(x, y);
                            firstPoint = false;
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                }
                
                ctx.stroke();
            }
        });
    }

    drawPlanets(ctx, centerX, centerY, size, offsetX, offsetY) {
        if (!this.spaceData.planetOrbits) return;

        const scale = this.calculateScale();
        
        // Draw sun first
        const sunX = 0 * scale + centerX + offsetX;
        const sunY = 0 * scale + centerY + offsetY;
        if (this.isPointInView(sunX, sunY, size)) {
            this.drawPlanetIcon(ctx, 'sun', 0, 0, centerX, centerY, scale, 10, offsetX, offsetY);
        }

        // Draw planets
        this.spaceData.planetOrbits.forEach(planetData => {
            if (planetData.planet) {
                const worldPosition = new THREE.Vector3();
                planetData.planet.getWorldPosition(worldPosition);
                
                const planetName = planetData.planet.userData?.name?.toLowerCase();
                if (planetName) {
                    const planetX = worldPosition.x * scale + centerX + offsetX;
                    const planetY = worldPosition.z * scale + centerY + offsetY;
                    
                    if (this.isPointInView(planetX, planetY, size)) {
                        const sizeMultiplier = this.getPlanetSizeMultiplier(planetName);
                        this.drawPlanetIcon(ctx, planetName, worldPosition.x, worldPosition.z, centerX, centerY, scale, sizeMultiplier, offsetX, offsetY);
                    }
                }
            }
        });
    }

    drawSpaceship(ctx, centerX, centerY, size, offsetX, offsetY) {
        const scale = this.calculateScale();
        
        // Tính vị trí tàu vũ trụ
        let x, y;
        if (!this.isFullscreen) {
            // Mini map nhỏ: Tàu luôn ở trung tâm
            x = centerX;
            y = centerY;
        } else {
            // Mini map lớn: Tàu di chuyển theo vị trí thực
            x = this.spaceshipPos.x * scale + centerX + offsetX;
            y = this.spaceshipPos.z * scale + centerY + offsetY;
        }

        // Only draw if within bounds
        if (!this.isPointInView(x, y, size)) {
            return;
        }

        // Draw spaceship icon
        if (this.planetIcons.spaceship) {
            const iconSize = this.isFullscreen ? 20 : 16;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-this.spaceshipRotation);
            ctx.drawImage(this.planetIcons.spaceship, -iconSize/2, -iconSize/2, iconSize, iconSize);
            ctx.restore();
        } else {
            // Fallback: draw triangle
            ctx.fillStyle = '#00FFFF';
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-this.spaceshipRotation);
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(6, 8);
            ctx.lineTo(-6, 8);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }

        // Draw direction arrow
        const arrowLength = this.isFullscreen ? 25 : 18;
        const lineWidth = this.isFullscreen ? 2 : 1;
        
        ctx.strokeStyle = this.isFullscreen ? '#00FF00' : '#00FF00';
        ctx.lineWidth = lineWidth;
        
        if (!this.isFullscreen) {
            ctx.setLineDash([3, 3]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        const endX = x + Math.sin(-this.spaceshipRotation) * arrowLength;
        const endY = y + Math.cos(-this.spaceshipRotation) * arrowLength;
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawPlanetIcon(ctx, planetName, worldX, worldZ, centerX, centerY, scale, sizeMultiplier = 4, offsetX, offsetY) {
        const x = worldX * scale + centerX + offsetX;
        const y = worldZ * scale + centerY + offsetY;
        const iconSize = sizeMultiplier * (this.isFullscreen ? 1.5 : 1);

        if (this.planetIcons[planetName]) {
            ctx.drawImage(this.planetIcons[planetName], x - iconSize/2, y - iconSize/2, iconSize, iconSize);
        } else {
            // Fallback: colored circle
            ctx.fillStyle = this.getPlanetColor(planetName);
            ctx.beginPath();
            ctx.arc(x, y, iconSize/2, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw planet name in fullscreen mode
        if (this.isFullscreen && planetName !== 'sun' && iconSize > 8) {
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(planetName.charAt(0).toUpperCase() + planetName.slice(1), x, y + iconSize + 12);
        }
    }

    isPointInView(x, y, size) {
        const margin = 50;
        return x > -margin && x < size + margin && y > -margin && y < size + margin;
    }

    calculateScale() {
        const baseScale = this.isFullscreen ? 0.15 : 0.25; // Scale khác nhau cho 2 chế độ
        return baseScale * this.zoomLevel;
    }

    getPlanetSizeMultiplier(planetName) {
        const sizes = {
            sun: 12,
            jupiter: 8,
            saturn: 7,
            uranus: 5,
            neptune: 5,
            earth: 4,
            venus: 4,
            mars: 3,
            mercury: 2.5
        };
        return sizes[planetName] || 3;
    }

    getPlanetColor(planetName) {
        const colors = {
            sun: '#FFD700',
            mercury: '#8C7853',
            venus: '#FFC649',
            earth: '#6B93D6',
            mars: '#CD5C5C',
            jupiter: '#D8CA9D',
            saturn: '#FAD5A5',
            uranus: '#4FD0E7',
            neptune: '#4B70DD'
        };
        return colors[planetName] || '#FFFFFF';
    }

    update() {
        this.drawHTMLMiniMap();
    }
}

// Export singleton instance
export const miniMap = new MiniMap();