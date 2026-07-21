import * as THREE from "../three.module.js";

// Biến toàn cục cho UI
let isAudioPlaying = false;
let isMenuOpen = false;

// Tạo menu bên phải với chức năng ẩn/hiện
export function createMenu() {
    // Tạo nút toggle menu
    const menuToggle = document.createElement('button');
    menuToggle.id = 'menu-toggle';
    menuToggle.innerHTML = '⚙️';
    menuToggle.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, rgba(0, 100, 200, 0.9), rgba(0, 150, 255, 0.7));
        border: 2px solid rgba(0, 229, 255, 0.8);
        border-radius: 50%;
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 1001;
        backdrop-filter: blur(15px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 32px rgba(0, 100, 255, 0.3);
    `;

    menuToggle.addEventListener('mouseenter', () => {
        menuToggle.style.background = 'linear-gradient(135deg, rgba(0, 150, 255, 0.9), rgba(0, 200, 255, 0.7))';
        menuToggle.style.transform = 'scale(1.1) rotate(90deg)';
        menuToggle.style.boxShadow = '0 12px 40px rgba(0, 229, 255, 0.5)';
    });

    menuToggle.addEventListener('mouseleave', () => {
        if (!isMenuOpen) {
            menuToggle.style.background = 'linear-gradient(135deg, rgba(0, 100, 200, 0.9), rgba(0, 150, 255, 0.7))';
            menuToggle.style.transform = 'scale(1) rotate(0deg)';
            menuToggle.style.boxShadow = '0 8px 32px rgba(0, 100, 255, 0.3)';
        }
    });

    // Tạo menu chính
    const menu = document.createElement('div');
    menu.id = 'side-menu';
    menu.style.cssText = `
        position: fixed;
        top: 20px;
        right: 90px;
        background: rgba(10, 15, 30, 0.98);
        border: 2px solid rgba(0, 229, 255, 0.6);
        border-radius: 20px;
        padding: 25px;
        color: white;
        font-family: 'Orbitron', sans-serif;
        z-index: 1000;
        min-width: 320px;
        backdrop-filter: blur(20px);
        box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
        transform: translateX(100%) scale(0.95);
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        max-height: 85vh;
        overflow-y: auto;
        overflow-x: hidden;
        border: 1px solid rgba(0, 229, 255, 0.3);
        background: linear-gradient(135deg, rgba(10, 15, 30, 0.95), rgba(20, 25, 50, 0.9));
    `;

    menu.innerHTML = `
        <div class="menu-header">
            <div class="header-icon">🌌</div>
            <h3 class="header-title">HỆ MẶT TRỜI 3D</h3>
            <div class="header-subtitle">Khám phá vũ trụ</div>
        </div>
        
        <!-- Trang chủ -->
        <div class="menu-item">
            <button id="homeBtn" class="menu-btn">
                <span class="btn-icon">🏠</span>
                <span class="btn-text">Trang chủ</span>
                <span class="btn-arrow">→</span>
            </button>
        </div>
        
        <!-- Âm thanh -->
        <div class="menu-item">
            <div class="audio-control">
                <span class="control-label">
                    <span class="control-icon">🎵</span>
                    Âm thanh nền
                </span>
                <button id="audioToggleBtn" class="icon-btn">🔇</button>
            </div>
            <div class="slider-container">
                <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="0.3" class="slider">
                <div class="slider-labels">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                </div>
            </div>
        </div>
        
        <!-- Tốc độ -->
        <div class="menu-item">
            <div class="speed-control">
                <span class="control-label">
                    <span class="control-icon">⚡</span>
                    Tốc độ mô phỏng
                </span>
                <span id="speedValue" class="speed-value">1.0x</span>
            </div>
            <div class="slider-container">
                <input type="range" id="speedSlider" min="0.1" max="5" step="0.1" value="1" class="slider">
                <div class="slider-labels">
                    <span>0.1x</span>
                    <span>2.5x</span>
                    <span>5.0x</span>
                </div>
            </div>
        </div>
        
        <!-- Quỹ đạo -->
        <div class="menu-item">
            <label class="toggle-label">
                <input type="checkbox" id="toggleOrbit" checked>
                <span class="toggle-slider"></span>
                <span class="toggle-text">
                    <span class="control-icon">🛰️</span>
                    Hiển thị quỹ đạo
                </span>
            </label>
        </div>
        
        <!-- Zoom đến hành tinh -->
        <div class="menu-item">
            <div class="planet-section">
                <div class="section-header">
                    <span class="control-icon">🔭</span>
                    <span class="section-label">Khám phá hành tinh</span>
                </div>
                <div id="planetButtons" class="planet-grid"></div>
            </div>
        </div>

        <div class="menu-footer">
            <div class="footer-text">Solar System Explorer v1.0</div>
        </div>
    `;

    document.body.appendChild(menuToggle);
    document.body.appendChild(menu);

    // Thêm CSS cho menu với scrollbar ẩn
    const style = document.createElement('style');
    style.textContent = `
        .menu-header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(0, 229, 255, 0.3);
            background: linear-gradient(135deg, rgba(0, 100, 200, 0.2), transparent);
            border-radius: 12px;
            padding: 20px;
        }
        
        .header-icon {
            font-size: 2.5em;
            margin-bottom: 10px;
            display: block;
        }
        
        .header-title {
            margin: 0;
            color: #00e5ff;
            font-size: 1.4em;
            text-shadow: 0 0 20px rgba(0, 229, 255, 0.7);
            background: linear-gradient(45deg, #00e5ff, #0066ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header-subtitle {
            color: #88ffff;
            font-size: 0.9em;
            margin-top: 5px;
            opacity: 0.8;
        }
        
        .menu-item {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .menu-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .menu-btn {
            width: 100%;
            padding: 15px 20px;
            background: linear-gradient(135deg, rgba(0, 100, 200, 0.4), rgba(0, 150, 255, 0.2));
            border: 1px solid rgba(0, 229, 255, 0.4);
            border-radius: 12px;
            color: white;
            cursor: pointer;
            font-family: 'Orbitron', sans-serif;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
            overflow: hidden;
        }
        
        .menu-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.2), transparent);
            transition: left 0.5s ease;
        }
        
        .menu-btn:hover::before {
            left: 100%;
        }
        
        .menu-btn:hover {
            background: linear-gradient(135deg, rgba(0, 150, 255, 0.6), rgba(0, 200, 255, 0.4));
            border-color: rgba(0, 229, 255, 0.8);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 229, 255, 0.3);
        }
        
        .btn-icon {
            font-size: 1.3em;
            filter: drop-shadow(0 0 5px rgba(0, 229, 255, 0.5));
        }
        
        .btn-text {
            flex: 1;
            text-align: left;
            font-weight: 500;
        }
        
        .btn-arrow {
            opacity: 0;
            transform: translateX(-10px);
            transition: all 0.3s ease;
            color: #00e5ff;
        }
        
        .menu-btn:hover .btn-arrow {
            opacity: 1;
            transform: translateX(0);
        }
        
        .audio-control, .speed-control {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .control-label {
            font-size: 0.95em;
            color: #e0f7ff;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
        }
        
        .control-icon {
            font-size: 1.1em;
            filter: drop-shadow(0 0 3px rgba(0, 229, 255, 0.5));
        }
        
        .speed-value {
            background: linear-gradient(135deg, rgba(0, 229, 255, 0.3), rgba(0, 150, 255, 0.2));
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 0.85em;
            color: #00e5ff;
            border: 1px solid rgba(0, 229, 255, 0.3);
            font-weight: bold;
        }
        
        .icon-btn {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(0, 229, 255, 0.5);
            border-radius: 50%;
            width: 36px;
            height: 36px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .icon-btn:hover {
            border-color: #00e5ff;
            transform: scale(1.1);
            box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);
            background: rgba(0, 229, 255, 0.1);
        }
        
        .slider-container {
            margin-top: 10px;
        }
        
        .slider {
            width: 100%;
            height: 8px;
            border-radius: 4px;
            background: linear-gradient(to right, #00e5ff, #0066ff);
            outline: none;
            -webkit-appearance: none;
            margin-bottom: 5px;
        }
        
        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #00e5ff;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 0 10px rgba(0, 229, 255, 0.8);
            transition: all 0.3s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 0 15px rgba(0, 229, 255, 1);
        }
        
        .slider-labels {
            display: flex;
            justify-content: space-between;
            font-size: 0.75em;
            color: #88ffff;
            margin-top: 5px;
        }
        
        .toggle-label {
            display: flex;
            align-items: center;
            cursor: pointer;
            gap: 15px;
            padding: 10px;
            border-radius: 10px;
            transition: background 0.3s ease;
        }
        
        .toggle-label:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .toggle-label input {
            display: none;
        }
        
        .toggle-slider {
            width: 50px;
            height: 26px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 13px;
            position: relative;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .toggle-slider:before {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #888;
            top: 2px;
            left: 3px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .toggle-label input:checked + .toggle-slider {
            background: rgba(0, 229, 255, 0.4);
            border-color: rgba(0, 229, 255, 0.6);
        }
        
        .toggle-label input:checked + .toggle-slider:before {
            transform: translateX(24px);
            background: #00e5ff;
            box-shadow: 0 0 10px rgba(0, 229, 255, 0.8);
        }
        
        .toggle-text {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
        }
        
        .planet-section {
            margin-top: 10px;
        }
        
        .section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 15px;
            color: #e0f7ff;
            font-weight: 500;
        }
        
        .section-label {
            font-size: 0.95em;
        }
        
        .planet-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .planet-btn {
            padding: 12px 8px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            color: white;
            cursor: pointer;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.8em;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            position: relative;
            overflow: hidden;
        }
        
        .planet-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.1), transparent);
            transition: left 0.5s ease;
        }
        
        .planet-btn:hover::before {
            left: 100%;
        }
        
        .planet-btn:hover {
            background: rgba(0, 229, 255, 0.15);
            border-color: rgba(0, 229, 255, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 229, 255, 0.2);
        }
        
        .planet-btn img {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            filter: drop-shadow(0 0 3px rgba(0, 229, 255, 0.5));
        }
        
        .menu-footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
        }
        
        .footer-text {
            color: #88ffff;
            font-size: 0.8em;
            opacity: 0.6;
        }
        
        /* Ẩn scrollbar nhưng vẫn cho phép scroll */
        #side-menu {
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        
        #side-menu::-webkit-scrollbar {
            display: none;
        }
        
        /* Hiệu ứng khi scroll */
        #side-menu {
            mask-image: linear-gradient(
                to bottom,
                transparent 0%,
                black 5%,
                black 95%,
                transparent 100%
            );
        }
    `;
    document.head.appendChild(style);

    // Thêm nút hành tinh
    const planetButtons = document.getElementById('planetButtons');
    ['Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].forEach(planetName => {
        const btn = document.createElement('button');
        btn.className = 'planet-btn';
        btn.innerHTML = `
            <img src="../icon/${planetName.toLowerCase()}.png" onerror="this.style.display='none'">
            ${planetName}
        `;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const event = new CustomEvent('zoomToPlanet', { detail: planetName });
            window.dispatchEvent(event);
        });
        planetButtons.appendChild(btn);
    });

    // Toggle menu functionality
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            menu.style.transform = 'translateX(0) scale(1)';
            menu.style.opacity = '1';
            menuToggle.style.background = 'linear-gradient(135deg, rgba(0, 150, 255, 0.9), rgba(0, 200, 255, 0.7))';
            menuToggle.style.transform = 'scale(1.1) rotate(90deg)';
            menuToggle.style.boxShadow = '0 12px 40px rgba(0, 229, 255, 0.5)';
            menuToggle.innerHTML = '✕';
        } else {
            menu.style.transform = 'translateX(100%) scale(0.95)';
            menu.style.opacity = '0';
            menuToggle.style.background = 'linear-gradient(135deg, rgba(0, 100, 200, 0.9), rgba(0, 150, 255, 0.7))';
            menuToggle.style.transform = 'scale(1) rotate(0deg)';
            menuToggle.style.boxShadow = '0 8px 32px rgba(0, 100, 255, 0.3)';
            menuToggle.innerHTML = '⚙️';
        }
    });

    // Ngăn sự kiện click trong menu
    menu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Đóng menu khi click bên ngoài
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !menu.contains(e.target) && !menuToggle.contains(e.target)) {
            isMenuOpen = false;
            menu.style.transform = 'translateX(100%) scale(0.95)';
            menu.style.opacity = '0';
            menuToggle.style.background = 'linear-gradient(135deg, rgba(0, 100, 200, 0.9), rgba(0, 150, 255, 0.7))';
            menuToggle.style.transform = 'scale(1) rotate(0deg)';
            menuToggle.style.boxShadow = '0 8px 32px rgba(0, 100, 255, 0.3)';
            menuToggle.innerHTML = '⚙️';
        }
    });

    // Ngăn sự kiện click trên các phần tử input trong menu
    const menuInputs = menu.querySelectorAll('input, button, .toggle-label');
    menuInputs.forEach(element => {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

// Tạo các UI elements khác
export function createUIElements() {
    // Nút bay
    const fly = document.createElement('button');
    fly.innerHTML = '🚀';
    fly.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.8), rgba(255, 165, 0, 0.6));
        color: white;
        border: 2px solid rgba(255, 215, 0, 0.8);
        border-radius: 50%;
        width: 60px;
        height: 60px;
        cursor: pointer;
        font-size: 24px;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(15px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
    `;

    fly.addEventListener('mouseenter', () => {
        fly.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(255, 165, 0, 0.7))';
        fly.style.borderColor = 'rgba(255, 255, 255, 0.9)';
        fly.style.transform = 'scale(1.1) rotate(15deg)';
        fly.style.boxShadow = '0 12px 40px rgba(255, 215, 0, 0.5)';
    });

    fly.addEventListener('mouseleave', () => {
        fly.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.8), rgba(255, 165, 0, 0.6))';
        fly.style.borderColor = 'rgba(255, 215, 0, 0.8)';
        fly.style.transform = 'scale(1) rotate(0deg)';
        fly.style.boxShadow = '0 8px 32px rgba(255, 215, 0, 0.3)';
    });

    fly.title = '🚀 Chế độ bay - Khám phá tự do';
    document.body.appendChild(fly);

    fly.addEventListener('click', () => {
        window.location.href = '../space/bay.html';
    });

    // Tạo unified info panel ở bên trái
    createUnifiedInfoPanel();
}

// Tạo unified info panel với tabs ở bên trái
function createUnifiedInfoPanel() {
    const infoPanel = document.createElement('div');
    infoPanel.id = 'unified-info-panel';
    infoPanel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 20px;
        transform: translateY(-50%);
        width: 380px;
        background: linear-gradient(135deg, rgba(10, 15, 30, 0.95), rgba(20, 25, 50, 0.9));
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 20px;
        color: white;
        font-family: 'Orbitron', sans-serif;
        z-index: 999;
        backdrop-filter: blur(20px);
        box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6);
        display: none;
        overflow: hidden;
        border: 2px solid rgba(0, 229, 255, 0.4);
    `;

    infoPanel.innerHTML = `
        <div class="panel-header">
            <div class="planet-icon" id="planetIcon">
                <img src="" alt="Planet" class="planet-icon-img" onerror="this.style.display='none'">
                <div class="planet-icon-fallback">🌌</div>
            </div>
            <div class="panel-title-container">
                <h3 id="panelTitle" class="panel-title">Hành Tinh</h3>
                <div class="panel-subtitle" id="panelSubtitle">Chọn một hành tinh để khám phá</div>
            </div>
            <button id="closePanel" class="close-btn">✕</button>
        </div>
        
        <div class="tab-container">
            <div class="tab-buttons">
                <button class="tab-btn active" data-tab="info">
                    <span class="tab-icon">📊</span>
                    <span class="tab-text">Thông Tin</span>
                </button>
                <button class="tab-btn" data-tab="core">
                    <span class="tab-icon">🔍</span>
                    <span class="tab-text">Mặt Cắt</span>
                </button>
            </div>
            
            <div class="tab-content">
                <div id="info-tab" class="tab-pane active">
                    <div class="info-content" id="info-content">
                        <div class="no-data">
                            <div class="no-data-icon">🌌</div>
                            <div class="no-data-text">Chọn một hành tinh để xem thông tin chi tiết</div>
                        </div>
                    </div>
                </div>
                
                <div id="core-tab" class="tab-pane">
                    <div class="core-content" id="core-content">
                        <div class="no-data">
                            <div class="no-data-icon">🔭</div>
                            <div class="no-data-text">Chọn một hành tinh để xem cấu trúc bên trong</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(infoPanel);

    // Thêm CSS cho unified panel
    const style = document.createElement('style');
    style.textContent += `
        #unified-info-panel {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .panel-header {
            display: flex;
            align-items: center;
            padding: 25px;
            background: linear-gradient(135deg, rgba(0, 100, 200, 0.3), rgba(0, 150, 255, 0.1));
            border-bottom: 1px solid rgba(0, 229, 255, 0.3);
            gap: 15px;
        }
        
        .planet-icon {
            position: relative;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .planet-icon-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            filter: drop-shadow(0 0 15px rgba(0, 229, 255, 0.6));
            transition: all 0.3s ease;
        }
        
        .planet-icon-fallback {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
            opacity: 0.7;
        }
        
        .planet-icon-img:hover {
            transform: scale(1.1);
            filter: drop-shadow(0 0 20px rgba(0, 229, 255, 0.8));
        }
        
        .panel-title-container {
            flex: 1;
        }
        
        .panel-title {
            margin: 0;
            color: #00e5ff;
            font-size: 1.4em;
            text-shadow: 0 0 20px rgba(0, 229, 255, 0.7);
            background: linear-gradient(45deg, #00e5ff, #0066ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .panel-subtitle {
            color: #88ffff;
            font-size: 0.9em;
            margin-top: 5px;
            opacity: 0.8;
        }
        
        .close-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 35px;
            height: 35px;
            color: white;
            cursor: pointer;
            font-size: 1.1em;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
            border-color: rgba(0, 229, 255, 0.5);
        }
        
        .tab-container {
            display: flex;
            flex-direction: column;
            height: 450px;
        }
        
        .tab-buttons {
            display: flex;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(0, 229, 255, 0.2);
        }
        
        .tab-btn {
            flex: 1;
            padding: 18px;
            background: none;
            border: none;
            color: #ccc;
            cursor: pointer;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.95em;
            transition: all 0.3s ease;
            border-bottom: 3px solid transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .tab-btn.active {
            color: #00e5ff;
            border-bottom-color: #00e5ff;
            background: rgba(0, 229, 255, 0.1);
        }
        
        .tab-btn:hover:not(.active) {
            color: white;
            background: rgba(255, 255, 255, 0.05);
        }
        
        .tab-icon {
            font-size: 1.2em;
        }
        
        .tab-text {
            font-weight: 500;
        }
        
        .tab-content {
            flex: 1;
            overflow-y: auto;
            padding: 0;
        }
        
        .tab-pane {
            display: none;
            height: 100%;
            padding: 25px;
        }
        
        .tab-pane.active {
            display: block;
        }
        
        .info-content, .core-content {
            height: 100%;
        }
        
        .no-data {
            text-align: center;
            color: #666;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        
        .no-data-icon {
            font-size: 3em;
            opacity: 0.5;
        }
        
        .no-data-text {
            font-style: italic;
            color: #88ffff;
            max-width: 200px;
            line-height: 1.4;
        }
        
        .info-item {
            margin-bottom: 20px;
            padding-bottom: 18px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
        }
        
        .info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .info-item::before {
            content: '';
            position: absolute;
            left: -10px;
            top: 0;
            height: 100%;
            width: 3px;
            background: linear-gradient(to bottom, #00e5ff, #0066ff);
            border-radius: 2px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .info-item:hover::before {
            opacity: 1;
        }
        
        .info-label {
            font-weight: bold;
            color: #00e5ff;
            display: block;
            margin-bottom: 8px;
            font-size: 0.95em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            color: #fff;
            line-height: 1.5;
            font-size: 0.9em;
        }
        
        .core-image {
            width: 100%;
            border-radius: 12px;
            margin-bottom: 20px;
            border: 2px solid rgba(0, 229, 255, 0.3);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .layer-item {
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid;
            background: rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .layer-item:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateX(5px);
        }
        
        .layer-name {
            font-weight: bold;
            margin-bottom: 6px;
            color: white;
            font-size: 1em;
        }
        
        .layer-desc {
            color: #ccc;
            font-size: 0.85em;
            line-height: 1.4;
            margin-bottom: 6px;
        }
        
        .layer-radius {
            color: #88ffff;
            font-size: 0.8em;
            font-style: italic;
        }

        /* Ẩn scrollbar trong panel */
        .tab-content {
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        
        .tab-content::-webkit-scrollbar {
            display: none;
        }
    `;
    document.head.appendChild(style);

    // Tab functionality
    const tabBtns = infoPanel.querySelectorAll('.tab-btn');
    const tabPanes = infoPanel.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tabId = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Close panel functionality
    const closeBtn = infoPanel.querySelector('#closePanel');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        infoPanel.style.display = 'none';
    });

    // Ngăn sự kiện click trong panel
    infoPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Tạo overlay dim
export function createDimOverlay() {
    const dimOverlay = document.createElement('div');
    dimOverlay.id = 'dim-overlay';
    dimOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.5s ease;
        z-index: 2;
        background: radial-gradient(
            circle at center,
            transparent 30%,
            rgba(0, 0, 0, 0.7) 70%,
            rgba(0, 0, 0, 0.9) 100%
        );
    `;
    document.body.appendChild(dimOverlay);
}

// Thiết lập event listeners cho UI
export function setupUIEventListeners(backgroundMusic, setGlobalSpeed, toggleOrbits) {
    // Trang chủ
    document.getElementById('homeBtn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    // Âm thanh
    const audioToggleBtn = document.getElementById('audioToggleBtn');
    const volumeSlider = document.getElementById('volumeSlider');

    audioToggleBtn.addEventListener('click', () => {
        if (isAudioPlaying) {
            backgroundMusic.pause();
            isAudioPlaying = false;
            audioToggleBtn.innerHTML = '🔇';
        } else {
            backgroundMusic.play().then(() => {
                isAudioPlaying = true;
                audioToggleBtn.innerHTML = '🔊';
            }).catch((err) => {
                console.log('Autoplay blocked:', err);
                alert('Trình duyệt chặn tự động phát nhạc. Vui lòng tương tác với trang.');
            });
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        backgroundMusic.volume = parseFloat(e.target.value);
    });

    // Tốc độ
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    
    speedSlider.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        setGlobalSpeed(speed);
        speedValue.textContent = speed.toFixed(1) + 'x';
    });

    // Quỹ đạo
    const toggleOrbit = document.getElementById('toggleOrbit');
    toggleOrbit.addEventListener('change', (e) => {
        toggleOrbits(e.target.checked);
    });
}

// Hàm helper để lấy fallback icon
function getPlanetFallbackIcon(planetName) {
    const fallbackIcons = {
        'Sun': '🌞',
        'Mercury': '🌑',
        'Venus': '🟤',
        'Earth': '🌍',
        'Mars': '🔴',
        'Jupiter': '🟠',
        'Saturn': '🪐',
        'Uranus': '🔵',
        'Neptune': '🔷',
        'Pluto': '⚫'
    };
    return fallbackIcons[planetName] || '🌌';
}

// Hiển thị thông tin hành tinh trong unified panel
export function showPlanetInfo(planetName, planetInfo, planetDetails, planetCores, infoPlanets) {
    const unifiedPanel = document.getElementById('unified-info-panel');
    const panelTitle = document.getElementById('panelTitle');
    const panelSubtitle = document.getElementById('panelSubtitle');
    const planetIcon = document.getElementById('planetIcon');
    const planetIconImg = planetIcon.querySelector('.planet-icon-img');
    const planetIconFallback = planetIcon.querySelector('.planet-icon-fallback');
    const infoContent = document.getElementById('info-content');
    const coreContent = document.getElementById('core-content');

    // Hiển thị panel
    unifiedPanel.style.display = 'block';
    
    // Cập nhật icon hành tinh từ thư mục ../icon/
    planetIconImg.src = `../icon/${planetName.toLowerCase()}.png`;
    planetIconImg.alt = planetName;
    planetIconImg.style.display = 'block';
    planetIconFallback.textContent = getPlanetFallbackIcon(planetName);
    planetIconFallback.style.display = 'none';
    
    panelTitle.textContent = planetInfo ? planetInfo.name : planetName;
    panelSubtitle.textContent = planetDetails[planetName]?.type || 'Hành tinh trong hệ Mặt Trời';

    // Cập nhật tab thông tin
    let pd = planetDetails[planetName];
    if (!pd && planetInfo) {
        pd = {
            type: planetInfo.type || 'N/A',
            diameter: planetInfo.diameter || 'N/A', 
            mass: planetInfo.mass || 'N/A',
            orbitPeriod: planetInfo.orbitPeriod || 'N/A',
            temperature: planetInfo.temperature || 'N/A',
            description: planetInfo.description || 'Không có mô tả.'
        };
    }
    
    if (pd) {
        infoContent.innerHTML = `
            <div class="info-item">
                <span class="info-label">Loại hành tinh</span>
                <span class="info-value">${pd.type || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Đường kính</span>
                <span class="info-value">${pd.diameter || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Khối lượng</span>
                <span class="info-value">${pd.mass || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Chu kỳ quỹ đạo</span>
                <span class="info-value">${pd.orbitPeriod || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Nhiệt độ</span>
                <span class="info-value">${pd.temperature || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Mô tả</span>
                <span class="info-value">${pd.description || 'Không có mô tả.'}</span>
            </div>
        `;
    } else {
        infoContent.innerHTML = `
            <div class="no-data">
                <div class="no-data-icon">❓</div>
                <div class="no-data-text">Không có dữ liệu chi tiết cho hành tinh này</div>
            </div>
        `;
    }

    // Cập nhật tab mặt cắt
    const pdCore = planetCores[planetName];
    let imgName = 'default.jpg';
    
    if (infoPlanets) {
        const planetData = infoPlanets.find(p => p.name === planetName);
        if (planetData && planetData.Image) {
            imgName = planetData.Image;
        }
    }
    
    if (!imgName || imgName === 'default.jpg') {
        imgName = planetName.toLowerCase() + '1.jpg';
    }

    if (pdCore) {
        let coreHtml = `<img src="../core/${imgName}" alt="${planetName}" class="core-image" onerror="this.style.display='none'">`;
        coreHtml += '<div class="layers-container">';
        pdCore.forEach(layer => {
            coreHtml += `
                <div class="layer-item" style="border-left-color: ${layer.color}">
                    <div class="layer-name">${layer.name}</div>
                    <div class="layer-desc">${layer.desc}</div>
                    <div class="layer-radius">Bán kính: ${layer.radius}</div>
                </div>
            `;
        });
        coreHtml += '</div>';
        coreContent.innerHTML = coreHtml;
    } else {
        coreContent.innerHTML = `
            <div class="no-data">
                <div class="no-data-icon">🔍</div>
                <div class="no-data-text">Không có dữ liệu mặt cắt cho hành tinh này</div>
            </div>
        `;
    }

    // Đảm bảo tab thông tin được active khi mới mở
    const tabBtns = unifiedPanel.querySelectorAll('.tab-btn');
    const tabPanes = unifiedPanel.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    document.querySelector('.tab-btn[data-tab="info"]').classList.add('active');
    document.getElementById('info-tab').classList.add('active');
}

// Ẩn thông tin hành tinh
export function hidePlanetInfo() {
    const unifiedPanel = document.getElementById('unified-info-panel');
    if (unifiedPanel) {
        unifiedPanel.style.display = 'none';
    }
}

// Cập nhật overlay dim
export function updateDimOverlay(opacity) {
    const dimOverlay = document.getElementById('dim-overlay');
    if (dimOverlay) {
        dimOverlay.style.opacity = opacity;
    }
}