// ============================
// 🎮 KHỞI TẠO VÀ LOADING
// ============================
const loadingScreen = document.getElementById("loading-screen");
const loadingBar = document.getElementById("loadingBar");
const loadingText = document.getElementById("loadingText");
const startScreen = document.getElementById("start-screen");
const btnStartJourney = document.getElementById("btnStartJourney");
const menuButton = document.getElementById("menu-button");
const menuOverlay = document.getElementById("menu-overlay");
const settingsButton = document.getElementById("settings-button");
const settingsOverlay = document.getElementById("settings-overlay");
const panelOverlay = document.getElementById("panelOverlay");

const panels = {
    "astronomy": document.getElementById("panel-astronomy"),
    "travel-earth": document.getElementById("panel-travel-earth"),
    "space-exp": document.getElementById("panel-space-exp")
};

// 🌟 Mô phỏng loading process
function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
    progress += Math.random() * 25;
    if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        loadingText.textContent = "Hoàn tất!";
        setTimeout(() => {
        loadingScreen.style.opacity = "0";
        setTimeout(() => {
            loadingScreen.style.display = "none";
            startScreen.classList.remove("hidden");
        }, 200);
        }, 500);
    }
    
    loadingBar.style.width = progress + "%";
    
    // Cập nhật text loading
    if (progress < 30) {
        loadingText.textContent = "Đang khởi tạo vũ trụ...";
    } else if (progress < 60) {
        loadingText.textContent = "Đang tải các hành tinh...";
    } else if (progress < 90) {
        loadingText.textContent = "Đang chuẩn bị trải nghiệm...";
    }
    }, 100);
}

// 🚀 Bắt đầu hành trình - Zoom vào hệ mặt trời
btnStartJourney.addEventListener("click", () => {
    startScreen.style.animation = "zoomIn 2s forwards";
    startScreen.style.opacity = "0";
    
    // Hiển thị nút menu sau khi bắt đầu hành trình
    setTimeout(() => {
    menuButton.classList.add("show");
    startScreen.style.display = "none";
    }, 1500);
    
    // Phát nhạc
    const bgm = document.getElementById("bgm");
    if (bgm) {
    bgm.play().catch(e => console.log("Autoplay prevented:", e));
    }
    
    // Gọi hàm zoom camera trong Three.js
    if (window.startSolarSystemJourney) {
    window.startSolarSystemJourney();
    }
});

// 📋 Mở menu từ nút menu mới
menuButton.addEventListener("click", () => {
    menuOverlay.classList.add("active");
});

// 🖱️ Click ra ngoài menu để đóng
menuOverlay.addEventListener("click", e => {
    if (e.target.id === "menu-overlay") {
    menuOverlay.classList.remove("active");
    }
});

// ⚙️ Toggle cài đặt
settingsButton.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsOverlay.classList.toggle("active");
});

// 🖱️ Click ra ngoài settings -> tắt
document.addEventListener("click", e => {
    if (!settingsOverlay.contains(e.target) && !settingsButton.contains(e.target)) {
    settingsOverlay.classList.remove("active");
    }
});

// ============================
// 🧭 HỆ THỐNG MỞ PANEL BÊN TRÁI VỚI OVERLAY
// ============================
document.querySelectorAll(".side-btn").forEach(btn => {
    btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    const panel = document.getElementById(target);

    if (panel.classList.contains("active")) {
        panel.classList.remove("active");
        panelOverlay.classList.remove("active");
        return;
    }

    // Đóng tất cả panel khác
    document.querySelectorAll(".side-panel").forEach(p => {
        p.classList.remove("active");
    });
    
    // Mở panel mới và hiển thị overlay
    panel.classList.add("active");
    panelOverlay.classList.add("active");
    });
});

// 🖱️ Click vào overlay để đóng panel
panelOverlay.addEventListener("click", () => {
    document.querySelectorAll(".side-panel").forEach(p => {
    p.classList.remove("active");
    });
    panelOverlay.classList.remove("active");
});

// 🪐 Mở panel qua menu-box
document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", e => {
    const link = e.currentTarget.getAttribute("data-link");
    const action = e.currentTarget.getAttribute("data-action");

    if (link && link !== "#") {
        window.location.href = link;
    } else if (action && panels[action]) {
        // Đóng menu overlay
        menuOverlay.classList.remove("active");
        
        // Đóng panel cũ và mở panel mới
        document.querySelectorAll(".side-panel").forEach(p => {
        p.classList.remove("active");
        });
        panels[action].classList.add("active");
        panelOverlay.classList.add("active");
    }
    });
});

// 🔙 Đóng panel khi nhấn ✖
document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => {
    btn.closest(".side-panel").classList.remove("active");
    panelOverlay.classList.remove("active");
    });
});

// 🎯 Active panel items
document.querySelectorAll(".panel-item").forEach(item => {
    item.addEventListener("click", () => {
    document.querySelectorAll(".panel-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    
    item.style.transform = "scale(0.95)";
    setTimeout(() => {
        window.location.href = item.getAttribute("data-link");
    }, 200);
    });
});

// ⚡ Điều chỉnh tốc độ & quỹ đạo
const speedRange = document.getElementById("speedRange");
const orbitToggle = document.getElementById("orbitToggle");
const starfieldToggle = document.getElementById("starfieldToggle");

if (speedRange) {
    speedRange.addEventListener("input", e => {
    window.globalSpeed = parseFloat(e.target.value);
    });
}

if (orbitToggle) {
    orbitToggle.addEventListener("change", e => {
    const event = new CustomEvent("toggleOrbit", { detail: e.target.checked });
    window.dispatchEvent(event);
    });
}

// 🎵 Điều chỉnh âm thanh
const soundRange = document.getElementById("soundRange");
const bgm = document.getElementById("bgm");

if (soundRange && bgm) {
    soundRange.addEventListener("input", e => {
    bgm.volume = parseFloat(e.target.value);
    });
}

// 🔧 Khởi tạo
window.addEventListener("DOMContentLoaded", () => {
    simulateLoading();
    menuOverlay.classList.remove("active");
    settingsOverlay.classList.remove("active");
    Object.values(panels).forEach(p => p.classList.remove("active"));
    panelOverlay.classList.remove("active");
});

// ⌨️ Phím tắt
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
    menuOverlay.classList.remove("active");
    settingsOverlay.classList.remove("active");
    document.querySelectorAll(".side-panel").forEach(p => p.classList.remove("active"));
    panelOverlay.classList.remove("active");
    }
    if (e.key === "m" || e.key === "M") {
    menuOverlay.classList.toggle("active");
    }
});
