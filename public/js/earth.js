
    // ============================
    // 🎮 XỬ LÝ GIAO DIỆN MENU - ĐƠN GIẢN
    // ============================
    const menuOverlay = document.getElementById('menu-overlay');
    const settingsOverlay = document.getElementById('settings-overlay');
    const notesOverlay = document.getElementById('notes-overlay');
    const overlayBackdrop = document.getElementById('overlayBackdrop');
    const mainMenuButton = document.getElementById('main-menu-button');
    const settingsButton = document.getElementById('settings-button');
    const notesButton = document.getElementById('notes-button');
    const soundRange = document.getElementById('soundRange');
    const rotationSpeedRange = document.getElementById('rotationSpeedRange');
    const bgm = document.getElementById('bgm');

    // Biến theo dõi trạng thái menu
    let isMenuOpen = false;
    let currentActiveMode = 'default';

    // 🎛️ Mở/đóng menu chính
    mainMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // ⚙️ Mở settings
    settingsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsOverlay.classList.add('active');
        overlayBackdrop.classList.add('active');
        closeMenu();
        notesOverlay.classList.remove('active');
    });

    // 📝 Mở ghi chú
    notesButton.addEventListener('click', (e) => {
        e.stopPropagation();
        notesOverlay.classList.add('active');
        overlayBackdrop.classList.add('active');
        closeMenu();
        settingsOverlay.classList.remove('active');
    });

    // 🖱️ Đóng tất cả overlay khi click backdrop
    overlayBackdrop.addEventListener('click', () => {
        closeAllOverlays();
    });

    // 🏠 Trang chủ
    document.getElementById('menu-home').addEventListener('click', () => {
        setActiveMode('home');
        window.location.href = '../index.html';
    });

    // 🎮 Các chức năng chính - KHÔNG CÓ ÂM THANH
    document.getElementById('menu-travel').addEventListener('click', () => {
        setActiveMode('travel');
        simulateKeyPress('r');
        closeAllOverlays();
    });

    document.getElementById('menu-iss-inside').addEventListener('click', () => {
        setActiveMode('iss-inside');
        simulateKeyPress('v');
        closeAllOverlays();
    });

    document.getElementById('menu-iss-outside1').addEventListener('click', () => {
        setActiveMode('iss-outside1');
        simulateKeyPress('c');
        closeAllOverlays();
    });

    document.getElementById('menu-iss-outside2').addEventListener('click', () => {
        setActiveMode('iss-outside2');
        simulateKeyPress('b');
        closeAllOverlays();
    });

    document.getElementById('menu-astronaut').addEventListener('click', () => {
        setActiveMode('astronaut');
        simulateKeyPress('n');
        closeAllOverlays();
    });

    document.getElementById('menu-moon-view').addEventListener('click', () => {
        setActiveMode('moon-view');
        simulateKeyPress('f');
        closeAllOverlays();
    });

    // 🎵 Điều chỉnh âm thanh nền
    if (soundRange && bgm) {
        soundRange.addEventListener('input', e => {
            const volume = parseFloat(e.target.value);
            bgm.volume = volume;
        });
    }

    // 🔄 Điều chỉnh tốc độ quay
    if (rotationSpeedRange) {
        rotationSpeedRange.addEventListener('input', e => {
            if (window.rotationSpeed !== undefined) {
                window.rotationSpeed = parseFloat(e.target.value);
            }
        });
    }

    // 🎯 Set active mode và highlight
    function setActiveMode(mode) {
        // Xóa active class cũ
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Thêm active class mới
        const activeItem = document.getElementById(`menu-${mode}`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        // Cập nhật nút menu chính
        updateMainButton(mode);
        
        currentActiveMode = mode;
    }

    // 🔄 Cập nhật nút menu chính
    function updateMainButton(mode) {
        if (mode !== 'default' && mode !== 'home') {
            mainMenuButton.classList.add('active');
            mainMenuButton.innerHTML = `<i class="fas fa-check"></i> Đang hoạt động`;
        } else {
            mainMenuButton.classList.remove('active');
            mainMenuButton.innerHTML = `<i class="fas fa-bars"></i> Menu Chức Năng`;
        }
    }

    // ⌨️ Mô phỏng nhấn phím
    function simulateKeyPress(key) {
        const event = new KeyboardEvent('keydown', {
            key: key,
            code: `Key${key.toUpperCase()}`,
            keyCode: key.toUpperCase().charCodeAt(0),
            which: key.toUpperCase().charCodeAt(0),
            bubbles: true,
            cancelable: true
        });
        window.dispatchEvent(event);
    }

    // 🔓 Mở menu
    function openMenu() {
        menuOverlay.classList.add('active');
        overlayBackdrop.classList.add('active');
        isMenuOpen = true;
        
        settingsOverlay.classList.remove('active');
        notesOverlay.classList.remove('active');
    }

    // 🔒 Đóng menu
    function closeMenu() {
        menuOverlay.classList.remove('active');
        isMenuOpen = false;
        
        if (!settingsOverlay.classList.contains('active') && !notesOverlay.classList.contains('active')) {
            overlayBackdrop.classList.remove('active');
        }
    }

    // 🔒 Đóng tất cả overlay
    function closeAllOverlays() {
        menuOverlay.classList.remove('active');
        settingsOverlay.classList.remove('active');
        notesOverlay.classList.remove('active');
        overlayBackdrop.classList.remove('active');
        isMenuOpen = false;
    }

    // Message listener cho panorama
    window.addEventListener('message', (event) => {
        if (event.data.type === 'exitPanorama') {
            if (typeof window.exitPanorama === 'function') {
                window.exitPanorama();
            }
            // Reset về mode default khi thoát panorama
            setActiveMode('default');
            console.log('🔙 Returned from Panorama (message)');
        }
    });

    // Ẩn instructions sau 5s
    setTimeout(() => {
        document.getElementById('instructions').style.display = 'none';
    }, 5000);

    // ESC để đóng tất cả overlay
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllOverlays();
        }
    });

    // Tự động play nhạc nền khi trang load
    window.addEventListener('load', () => {
        if (bgm) {
            bgm.play().catch(e => {
                console.log('Autoplay prevented, user interaction required');
            });
        }
    });
