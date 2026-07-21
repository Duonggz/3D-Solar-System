// Xử lý panel trải nghiệm không gian
const settingsBtn = document.getElementById('settings-button'); // Đổi ID ở đây
const panelSpaceExp = document.getElementById('panel-space-exp');
const closeBtn = panelSpaceExp.querySelector('.close-btn');
const panelFullscreenBtn = document.getElementById('panel-fullscreen-btn');

// Mở/đóng panel
settingsBtn.addEventListener('click', () => {
    panelSpaceExp.classList.toggle('active');
});

closeBtn.addEventListener('click', () => {
    panelSpaceExp.classList.remove('active');
});

// Xử lý chuyển hướng khi click vào các hành tinh
const panelItems = document.querySelectorAll('.panel-item');
panelItems.forEach(item => {
    item.addEventListener('click', () => {
        const link = item.getAttribute('data-link');
        if (link) {
            window.location.href = link;
        }
    });
});

// Xử lý toàn màn hình từ panel
panelFullscreenBtn.addEventListener('click', toggleFullscreen);

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
    if (!document.fullscreenElement) {
        panelFullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Toàn màn hình';
    }
});

// Đóng panel khi click bên ngoài
document.addEventListener('click', (e) => {
    if (!panelSpaceExp.contains(e.target) && !settingsBtn.contains(e.target)) {
        panelSpaceExp.classList.remove('active');
    }
});