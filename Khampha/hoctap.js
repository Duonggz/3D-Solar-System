// hoctap.js

// ---------- Dữ liệu hành tinh ----------
const planetsData = {
    mercury: {
        name: "Sao Thủy",
        type: "Đá đất",
        diameter: "4,879 km",
        orbit: "88 ngày",
        temperature: "-173°C đến 427°C",
        moons: "0",
        fact: "Hành tinh nhỏ nhất và gần Mặt Trời nhất",
        detail: "Một năm trên Sao Thủy chỉ dài 88 ngày Trái Đất! Nó là hành tinh có tốc độ quay quanh Mặt Trời nhanh nhất.",
        color: "#8c8c8c",
        size: "4,879 km",
        discovery: "Thời cổ đại",
        atmosphere: "Rất mỏng, chủ yếu là oxy, natri, hydro"
    },
    venus: {
        name: "Sao Kim",
        type: "Đá đất",
        diameter: "12,104 km",
        orbit: "225 ngày",
        temperature: "462°C",
        moons: "0",
        fact: "Hành tinh nóng nhất với nhiệt độ 470°C",
        detail: "Một ngày trên Sao Kim (243 ngày) dài hơn một năm của nó (225 ngày)! Khí quyển dày đặc tạo hiệu ứng nhà kính cực mạnh.",
        color: "#e6b87e",
        size: "12,104 km",
        discovery: "Thời cổ đại",
        atmosphere: "Dày, 96% CO₂, áp suất gấp 92 lần Trái Đất"
    },
    earth: {
        name: "Trái Đất",
        type: "Đá đất",
        diameter: "12,742 km",
        orbit: "365.25 ngày",
        temperature: "-88°C đến 58°C",
        moons: "1",
        fact: "Hành tinh duy nhất có sự sống",
        detail: "71% bề mặt là nước - hành tinh xanh của chúng ta! Có từ trường bảo vệ khỏi bức xạ vũ trụ.",
        color: "#6b93d6",
        size: "12,742 km",
        discovery: "Nhà của chúng ta!",
        atmosphere: "78% nitơ, 21% oxy, 1% khí khác"
    },
    mars: {
        name: "Sao Hỏa",
        type: "Đá đất",
        diameter: "6,779 km",
        orbit: "687 ngày",
        temperature: "-153°C đến 20°C",
        moons: "2 (Phobos & Deimos)",
        fact: "Hành tinh Đỏ với bụi oxit sắt",
        detail: "Có núi lửa Olympus Mons cao gấp 3 lần Everest! Từng có nước lỏng trên bề mặt.",
        color: "#c1440e",
        size: "6,779 km",
        discovery: "Thời cổ đại",
        atmosphere: "95% CO₂, rất mỏng"
    },
    jupiter: {
        name: "Sao Mộc",
        type: "Khí khổng lồ",
        diameter: "139,820 km",
        orbit: "11.9 năm",
        temperature: "-108°C",
        moons: "95+",
        fact: "Hành tinh lớn nhất hệ Mặt Trời",
        detail: "Có Vết Đỏ Lớn - một cơn bão lớn gấp 2-3 lần Trái Đất và đã tồn tại ít nhất 400 năm!",
        color: "#c19a6b",
        size: "139,820 km",
        discovery: "Thời cổ đại",
        atmosphere: "90% hydro, 10% heli"
    },
    saturn: {
        name: "Sao Thổ",
        type: "Khí khổng lồ",
        diameter: "116,460 km",
        orbit: "29.5 năm",
        temperature: "-138°C",
        moons: "146+",
        fact: "Nổi tiếng với vành đai kỳ vĩ",
        detail: "Là hành tinh ít đặc nhất - có thể nổi trên nước! Vành đai làm từ băng, đá và bụi.",
        color: "#e3c08d",
        size: "116,460 km",
        discovery: "Thời cổ đại",
        atmosphere: "96% hydro, 3% heli"
    },
    uranus: {
        name: "Sao Thiên Vương",
        type: "Băng khổng lồ",
        diameter: "50,724 km",
        orbit: "84 năm",
        temperature: "-195°C",
        moons: "27",
        fact: "Hành tinh 'nằm ngang' khi quay",
        detail: "Trục nghiêng 98 độ - trông như đang lăn quanh Mặt Trời! Được phát hiện bằng kính viễn vọng.",
        color: "#4fd0e7",
        size: "50,724 km",
        discovery: "William Herschel, 1781",
        atmosphere: "83% hydro, 15% heli, 2% methane"
    },
    neptune: {
        name: "Sao Hải Vương",
        type: "Băng khổng lồ",
        diameter: "49,244 km",
        orbit: "165 năm",
        temperature: "-201°C",
        moons: "14",
        fact: "Hành tinh xa nhất, có gió mạnh nhất",
        detail: "Gió thổi với tốc độ lên tới 2,000 km/h! Được phát hiện bằng tính toán toán học.",
        color: "#4b70dd",
        size: "49,244 km",
        discovery: "Urbain Le Verrier & Johann Galle, 1846",
        atmosphere: "80% hydro, 19% heli, 1% methane"
    }
};

// ---------- Dữ liệu cung hoàng đạo ----------
const zodiacData = {
    aries: {
        name: "Bạch Dương",
        dates: "21/3 - 19/4",
        myth: "Con cừu vàng trong thần thoại Hy Lạp đã cứu Phrixus và Helle",
        stars: "Khá mờ, hình dạng như chiếc boomerang hoặc số 2",
        bestView: "Tháng 12",
        brightestStar: "Hamal",
        mythology: "Con cừu có bộ lông vàng thần kỳ trong thần thoại Jason và Argonauts"
    },
    taurus: {
        name: "Kim Ngưu",
        dates: "20/4 - 20/5",
        myth: "Thần Zeus hóa thành bò trắng để bắt cóc công chúa Europa",
        stars: "Dễ nhận ra với cụm Pleiades (Thất Nữ/Tua Rua) và sao Aldebaran đỏ rực",
        bestView: "Tháng 1",
        brightestStar: "Aldebaran",
        mythology: "Đại diện cho con bò trắng mà thần Zeus biến thành"
    },
    gemini: {
        name: "Song Tử",
        dates: "21/5 - 20/6",
        myth: "Hai anh em Castor và Pollux với tình anh em keo sơn",
        stars: "Hai sao sáng Castor và Pollux nằm gần nhau",
        bestView: "Tháng 2",
        brightestStar: "Pollux",
        mythology: "Câu chuyện về tình anh em bất diệt giữa Castor (mortal) và Pollux (immortal)"
    },
    cancer: {
        name: "Cự Giải",
        dates: "21/6 - 22/7",
        myth: "Con cua do nữ thần Hera phái đến tấn công Hercules",
        stars: "Mờ nhất trong 12 cung, có cụm sao Tổ Ong (Beehive Cluster)",
        bestView: "Tháng 3",
        brightestStar: "Al Tarf",
        mythology: "Con cua trong 12 kỳ công của Hercules"
    },
    leo: {
        name: "Sư Tử",
        dates: "23/7 - 22/8",
        myth: "Con sư tử Nemea bị Hercules giết chết",
        stars: "Dễ nhận ra với nhóm sao 'Lưỡi Liềm' và sao Regulus sáng",
        bestView: "Tháng 4",
        brightestStar: "Regulus",
        mythology: "Con sư tử không thể bị thương bởi vũ khí thông thường"
    },
    virgo: {
        name: "Xử Nữ",
        dates: "23/8 - 22/9",
        myth: "Nữ thần công lý Astraea, vị thần cuối cùng rời bỏ loài người",
        stars: "Lớn thứ hai, có sao Spica rất sáng",
        bestView: "Tháng 5",
        brightestStar: "Spica",
        mythology: "Đại diện cho sự thuần khiết và công lý"
    },
    libra: {
        name: "Thiên Bình",
        dates: "23/9 - 22/10",
        myth: "Cán cân công lý của nữ thần Astraea (Xử Nữ)",
        stars: "Duy nhất không phải người/động vật, hình tứ giác",
        bestView: "Tháng 6",
        brightestStar: "Zubeneschamali",
        mythology: "Biểu tượng của sự cân bằng và công lý"
    },
    scorpio: {
        name: "Hổ Cáp",
        dates: "23/10 - 21/11",
        myth: "Con bọ cạp do Hera phái đi giết thợ săn Orion",
        stars: "Dễ nhận ra nhất, hình con bọ cạp với sao Antares đỏ rực",
        bestView: "Tháng 7",
        brightestStar: "Antares",
        mythology: "Con bọ cạp chết chóc trong thần thoại Orion"
    },
    sagittarius: {
        name: "Nhân Mã",
        dates: "22/11 - 21/12",
        myth: "Chiron, nhân mã thông thái, thầy của các anh hùng",
        stars: "Nằm ở trung tâm Ngân Hà, hình ấm trà",
        bestView: "Tháng 8",
        brightestStar: "Kaus Australis",
        mythology: "Chiron - vị thầy khôn ngoan trong thần thoại Hy Lạp"
    },
    capricorn: {
        name: "Ma Kết",
        dates: "22/12 - 19/1",
        myth: "Thần Pan nhảy xuống sông, nửa dưới biến thành đuôi cá",
        stars: "Hình tam giác mờ, như 'mũi tên lái máy bay'",
        bestView: "Tháng 9",
        brightestStar: "Deneb Algedi",
        mythology: "Vị thần nửa dê nửa cá"
    },
    aquarius: {
        name: "Bảo Bình",
        dates: "20/1 - 18/2",
        myth: "Ganymede, chàng trai đẹp nhất được đưa lên Olympus làm người rót rượu",
        stars: "Lớn nhưng mờ, hình người đổ nước",
        bestView: "Tháng 10",
        brightestStar: "Sadalsuud",
        mythology: "Người mang nước của các vị thần"
    },
    pisces: {
        name: "Song Ngư",
        dates: "19/2 - 20/3",
        myth: "Hai mẹ con thần Vệ Nữ và Cupid biến thành cá để trốn quái vật",
        stars: "Hình chữ V lớn, hai sợi dây nối đuôi cá",
        bestView: "Tháng 11",
        brightestStar: "Alpherg",
        mythology: "Câu chuyện tình yêu và sự bảo vệ"
    }
};

// ---------- Khởi tạo khi DOM sẵn sàng ----------
document.addEventListener('DOMContentLoaded', function() {
    initializeCounters();
    initializePlanetSelector();
    initializeZodiac();
    initializeModal();
    initializeQuiz();
    initializeSearch();
    initializeSeasonalMaps();
    initializeCalendar && initializeCalendar(); // nếu có trong HTML
    initializeNavigation();
});

// ---------- Counters ----------
function initializeCounters() {
    const counters = document.querySelectorAll('.counter-number');
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target')) || 0;
        const increment = target / 100;
        let current = 0;
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                if (current > target) current = target;
                if (counter.getAttribute('data-target') === '13.8') {
                    counter.innerText = current.toFixed(1);
                } else {
                    counter.innerText = Math.floor(current);
                }
                setTimeout(updateCounter, 20);
            }
        };
        updateCounter();
    });
}

// ---------- Planet selector ----------
function initializePlanetSelector() {
    const planetSelect = document.getElementById('planetSelect');
    const planetInfo = document.getElementById('planetInfo');

    if (planetSelect && planetInfo) {
        planetSelect.addEventListener('change', function() {
            const selectedPlanet = this.value;
            if (selectedPlanet && planetsData[selectedPlanet]) {
                displayPlanetInfo(planetsData[selectedPlanet]);
            } else {
                planetInfo.innerHTML = '<p>Chọn một hành tinh để xem thông tin chi tiết...</p>';
            }
        });
    }

    const sizeSlider = document.getElementById('sizeSlider');
    if (sizeSlider) {
        sizeSlider.addEventListener('input', updateSizeComparison);
        updateSizeComparison();
    }
}

function displayPlanetInfo(planet) {
    const planetInfo = document.getElementById('planetInfo');
    if (!planetInfo) return;
    planetInfo.innerHTML = `
        <div class="planet-detail">
            <h3>${planet.name}</h3>
            <div class="planet-stats">
                <div class="stat-row"><strong>Loại hành tinh:</strong> ${planet.type}</div>
                <div class="stat-row"><strong>Đường kính:</strong> ${planet.diameter}</div>
                <div class="stat-row"><strong>Chu kỳ quỹ đạo:</strong> ${planet.orbit}</div>
                <div class="stat-row"><strong>Nhiệt độ:</strong> ${planet.temperature}</div>
                <div class="stat-row"><strong>Số vệ tinh:</strong> ${planet.moons}</div>
                <div class="stat-row"><strong>Khí quyển:</strong> ${planet.atmosphere}</div>
                <div class="stat-row"><strong>Phát hiện:</strong> ${planet.discovery}</div>
            </div>
            <div class="planet-fun-fact">
                <h4>💡 Điều thú vị:</h4>
                <p>${planet.detail}</p>
            </div>
            <div class="planet-color" style="background: ${planet.color}; width: 50px; height: 50px; border-radius: 50%; margin: 1rem 0;"></div>
        </div>
    `;
}

// Hàm mẫu cho thanh trượt so sánh kích thước
function updateSizeComparison() {
    const slider = document.getElementById('sizeSlider');
    const left = document.getElementById('sizeLeft');
    const right = document.getElementById('sizeRight');
    if (!slider || !left || !right) return;
    const val = parseFloat(slider.value) || 1;
    left.style.transform = `scale(${val})`;
    right.style.transform = `scale(${Math.max(0.2, 1 / val)})`;
}

// ---------- Zodiac ----------
function initializeZodiac() {
    const zodiacBtns = document.querySelectorAll('.zodiac-btn');
    const zodiacInfo = document.getElementById('zodiacInfo');

    zodiacBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const sign = this.dataset.sign;
            if (zodiacData[sign]) {
                displayZodiacInfo(zodiacData[sign]);
            }
        });
    });

    const ophiuchusBtn = document.getElementById('learnOphiuchus');
    if (ophiuchusBtn) {
        ophiuchusBtn.addEventListener('click', showOphiuchusInfo);
    }
}

function displayZodiacInfo(zodiac) {
    const zodiacInfo = document.getElementById('zodiacInfo');
    if (!zodiacInfo) return;
    zodiacInfo.innerHTML = `
        <div class="zodiac-detail">
            <h3>${zodiac.name}</h3>
            <div class="zodiac-stats">
                <div class="stat-row"><strong>Thời gian:</strong> ${zodiac.dates}</div>
                <div class="stat-row"><strong>Ngôi sao sáng nhất:</strong> ${zodiac.brightestStar}</div>
                <div class="stat-row"><strong>Thời gian quan sát tốt nhất:</strong> ${zodiac.bestView}</div>
            </div>
            <div class="zodiac-mythology">
                <h4>📖 Truyền thuyết:</h4>
                <p>${zodiac.mythology}</p>
            </div>
            <div class="zodiac-stars">
                <h4>⭐ Đặc điểm sao:</h4>
                <p>${zodiac.stars}</p>
            </div>
        </div>
    `;
}

function showOphiuchusInfo() {
    const zodiacInfo = document.getElementById('zodiacInfo');
    if (!zodiacInfo) return;
    zodiacInfo.innerHTML = `
        <div class="zodiac-detail">
            <h3>⛎ Xà Phu (Ophiuchus) - Cung Bị Lãng Quên</h3>
            <div class="zodiac-stats">
                <div class="stat-row"><strong>Thời gian:</strong> 29/11 - 17/12</div>
                <div class="stat-row"><strong>Ngôi sao sáng nhất:</strong> Rasalhague</div>
                <div class="stat-row"><strong>Vị trí:</strong> Giữa Hổ Cáp và Nhân Mã</div>
            </div>
            <div class="zodiac-mythology">
                <h4>📖 Truyền thuyết:</h4>
                <p>Đại diện cho Asclepius, thần y học trong thần thoại Hy Lạp, người có khả năng hồi sinh người chết.</p>
            </div>
            <div class="zodiac-stars">
                <h4>⭐ Đặc điểm sao:</h4>
                <p>Chòm sao lớn, hình người giữ rắn. Có nhiều cụm sao cầu và nằm gần trung tâm Ngân Hà.</p>
            </div>
            <div class="ophiuchus-fact">
                <p><strong>🤫 Bí mật:</strong> Xà Phu thực sự nằm trên đường Hoàng Đạo, nhưng bị bỏ qua trong chiêm tinh học truyền thống!</p>
            </div>
        </div>
    `;
}

// ---------- Modal hiện tượng thiên văn ----------
function initializeModal() {
    const modal = document.getElementById('phenomenonModal');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    const detailBtns = document.querySelectorAll('.detail-btn');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (modal && e.target === modal) {
            modal.style.display = 'none';
        }
    });

    detailBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.dataset.target;
            showPhenomenonDetail(target);
        });
    });
}

function showPhenomenonDetail(phenomenon) {
    const modal = document.getElementById('phenomenonModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;

    const phenomenaDetails = {
        'meteor-shower': {
            title: 'Mưa Sao Băng',
            content: `
                <h3>🌠 Mưa Sao Băng - Trận pháo hoa của tự nhiên</h3>
                <p><strong>Nó là gì?</strong> Không phải sao rơi! Đó là khi Trái Đất đi qua đám bụi đá do sao chổi để lại. Những hạt bụi này lao vào khí quyển, cháy sáng và tạo ra những vệt sáng tuyệt đẹp.</p>
                <h4>📅 Các trận mưa sao băng nổi tiếng:</h4>
                <ul>
                    <li><strong>Quadrantids (Tháng 1):</strong> 40-100 sao/giờ</li>
                    <li><strong>Lyrids (Tháng 4):</strong> 10-20 sao/giờ</li>
                    <li><strong>Eta Aquariids (Tháng 5):</strong> Tàn dư sao chổi Halley</li>
                    <li><strong>Perseids (Tháng 8):</strong> 50-100 sao/giờ, rất nổi tiếng</li>
                    <li><strong>Orionids (Tháng 10):</strong> Cũng từ sao chổi Halley</li>
                    <li><strong>Leonids (Tháng 11):</strong> Nổi tiếng với bão sao băng</li>
                    <li><strong>Geminids (Tháng 12):</strong> 120-160 sao/giờ, đẹp nhất năm</li>
                </ul>
                <h4>🔍 Mẹo quan sát:</h4>
                <ul>
                    <li>Ra ngoài trời tối, cách xa ánh đèn thành phố</li>
                    <li>Nằm xuống và kiên nhẫn chờ đợi 20-30 phút</li>
                    <li>Không cần kính thiên văn, mắt thường là tốt nhất</li>
                    <li>Quan sát sau nửa đêm khi số lượng sao băng tăng</li>
                </ul>
            `
        },
        'lunar-eclipse': {
            title: 'Nguyệt Thực',
            content: `
                <h3>🌕 Nguyệt Thực - Mặt Trăng "ngậm" bóng Trái Đất</h3>
                <p><strong>Hiện tượng:</strong> Trái Đất đi qua giữa Mặt Trời và Mặt Trăng, che khuất ánh sáng Mặt Trời chiếu tới Mặt Trăng.</p>
                <h4>🔴 Tại sao Mặt Trăng đỏ?</h4>
                <p>Ánh sáng Mặt Trời khúc xạ qua khí quyển Trái Đất, chỉ có ánh sáng đỏ (bước sóng dài) đến được Mặt Trăng. Hiệu ứng tương tự như hoàng hôn!</p>
                <h4>📊 Các loại nguyệt thực:</h4>
                <ul>
                    <li><strong>Nguyệt thực toàn phần:</strong> Mặt Trăng hoàn toàn trong bóng Trái Đất</li>
                    <li><strong>Nguyệt thực một phần:</strong> Chỉ một phần Mặt Trăng trong bóng</li>
                    <li><strong>Nguyệt thực nửa tối:</strong> Mặt Trăng trong vùng nửa tối, khó quan sát</li>
                </ul>
                <h4>👀 Mẹo quan sát:</h4>
                <ul>
                    <li>An toàn tuyệt đối, có thể quan sát trực tiếp</li>
                    <li>Quan sát được từ bất kỳ đâu trên Trái Đất nếu là đêm</li>
                    <li>Dùng ống nhòm hoặc kính thiên văn để thấy rõ hơn</li>
                    <li>Chụp ảnh với tripod và exposure dài</li>
                </ul>
            `
        },
        'aurora': {
            title: 'Cực Quang',
            content: `
                <h3>🎇 Cực Quang - Bức rèm ánh sáng nhảy múa</h3>
                <p><strong>Nguyên nhân:</strong> Gió Mặt Trời (các hạt tích điện) tương tác với từ trường Trái Đất, đi vào khí quyển ở hai cực và va chạm với các phân tử khí.</p>
                <h4>🎨 Màu sắc cực quang:</h4>
                <ul>
                    <li><strong style="color: #00ff00">Xanh lá cây:</strong> Ôxy ở độ cao 100-300 km</li>
                    <li><strong style="color: #ff0000">Đỏ:</strong> Ôxy ở độ cao >300 km</li>
                    <li><strong style="color: #800080">Tím/Xanh dương:</strong> Nitơ ở độ cao thấp</li>
                    <li><strong style="color: #ff69b4">Hồng:</strong> Nitơ ở rìa dải cực quang</li>
                </ul>
                <h4>🌍 Nơi quan sát tốt nhất:</h4>
                <ul>
                    <li><strong>Bắc Cực:</strong> Alaska, Canada, Iceland, Na Uy, Phần Lan, Thụy Điển</li>
                    <li><strong>Nam Cực:</strong> Tasmania, New Zealand, Nam cực</li>
                    <li><strong>Thời điểm:</strong> Đêm đông (tháng 9 đến tháng 4), trời quang</li>
                </ul>
                <h4>📸 Mẹo chụp ảnh:</h4>
                <ul>
                    <li>Máy ảnh có chế độ manual</li>
                    <li>ISO 800-1600, khẩu độ f/2.8 hoặc rộng hơn</li>
                    <li>Thời gian phơi sáng 5-25 giây</li>
                    <li>Chân máy và dây bấm mềm</li>
                </ul>
            `
        },
        'solar-eclipse': {
            title: 'Nhật Thực',
            content: `
                <h3>☀️ Nhật Thực - Mặt Trăng che Mặt Trời</h3>
                <p><strong>Hiện tượng:</strong> Mặt Trăng đi qua giữa Trái Đất và Mặt Trời, che khuất một phần hoặc toàn bộ Mặt Trời.</p>
                <h4>⚠️ CẢNH BÁO AN TOÀN:</h4>
                <p><strong>KHÔNG BAO GIỜ nhìn trực tiếp vào Mặt Trời!</strong> Có thể gây mù vĩnh viễn.</p>
                <h4>👁️ Cách quan sát an toàn:</h4>
                <ul>
                    <li>Kính quan sát nhật thực chuyên dụng</li>
                    <li>Projection method (chiếu qua lỗ nhỏ)</li>
                    <li>Welder's glass số 14</li>
                    <li>Camera với filter mặt trời</li>
                </ul>
                <h4>📊 Các loại nhật thực:</h4>
                <ul>
                    <li><strong>Toàn phần:</strong> Mặt Trăng che hoàn toàn Mặt Trời</li>
                    <li><strong>Một phần:</strong> Mặt Trăng chỉ che một phần</li>
                    <li><strong>Hình khuyên:</strong> Mặt Trăng nhỏ hơn, để lại vòng sáng</li>
                    <li><strong>Lai:</strong> Chuyển từ hình khuyên sang toàn phần</li>
                </ul>
            `
        },
        'comet': {
            title: 'Sao Chổi',
            content: `
                <h3>💫 Sao Chổi - Những quả cầu tuyết bẩn</h3>
                <p><strong>Là gì?</strong> Những thiên thể băng giá từ rìa hệ Mặt Trời (Đám mây Oort, Vành đai Kuiper).</p>
                <h4>🌠 Cấu tạo sao chổi:</h4>
                <ul>
                    <li><strong>Nhân:</strong> Băng, bụi, đá (1-10 km)</li>
                    <li><strong>Coma:</strong> Đám mây khí bụi bao quanh nhân</li>
                    <li><strong>Đuôi khí:</strong> Luôn hướng ra xa Mặt Trời</li>
                    <li><strong>Đuôi bụi:</strong> Cong hơn, hạt bụi phản xạ ánh sáng</li>
                </ul>
                <h4>📜 Sao chổi nổi tiếng:</h4>
                <ul>
                    <li><strong>Halley:</strong> Chu kỳ 76 năm, xuất hiện 1986, tiếp theo 2061</li>
                    <li><strong>Hale-Bopp (1997):</strong> Rất sáng, quan sát được 18 tháng</li>
                    <li><strong>NEOWISE (2020):</strong> Sao chổi sáng nhất thập kỷ</li>
                </ul>
                <h4>🔍 Cách tìm sao chổi:</h4>
                <ul>
                    <li>Theo dõi tin tức thiên văn</li>
                    <li>Dùng ứng dụng thiên văn (Stellarium)</li>
                    <li>Quan sát gần chân trời vào sáng sớm hoặc chiều tối</li>
                </ul>
            `
        },
        'supermoon': {
            title: 'Siêu Mặt Trăng',
            content: `
                <h3>🌑 Siêu Mặt Trăng - Trăng tròn khổng lồ</h3>
                <p><strong>Hiện tượng:</strong> Trăng tròn trùng với thời điểm Mặt Trăng ở gần Trái Đất nhất (perigee).</p>
                <h4>📏 So sánh kích thước:</h4>
                <ul>
                    <li>Lớn hơn 14% so với trăng tròn thông thường</li>
                    <li>Sáng hơn 30% so với trăng tròn thông thường</li>
                    <li>Khoảng cách gần hơn ~50,000 km so với điểm xa nhất</li>
                </ul>
                <h4>📅 Siêu Mặt Trăng 2024:</h4>
                <ul>
                    <li>Tháng 8: Sturgeon Moon</li>
                    <li>Tháng 9: Harvest Moon</li>
                    <li>Tháng 10: Hunter's Moon</li>
                </ul>
                <h4>📸 Mẹo chụp ảnh:</h4>
                <ul>
                    <li>Telephoto lens (200mm+)</li>
                    <li>ISO 100-400, khẩu độ f/8-f/11</li>
                    <li>Chân máy vững chắc</li>
                    <li>Chụp khi trăng gần chân trời để có tỷ lệ so sánh</li>
                </ul>
            `
        }
    };

    if (phenomenaDetails[phenomenon]) {
        modalBody.innerHTML = phenomenaDetails[phenomenon].content;
        modal.style.display = 'flex';
    } else {
        modalBody.innerHTML = `<p>Không có dữ liệu cho hiện tượng: ${phenomenon}</p>`;
        modal.style.display = 'flex';
    }
}

// ---------- Quiz ----------
function initializeQuiz() {
    const checkBtn = document.getElementById('checkAnswers');
    const options = document.querySelectorAll('.quiz-option');

    options.forEach(option => {
        option.addEventListener('click', function() {
            const parent = this.parentElement;
            if (!parent) return;
            parent.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    if (checkBtn) checkBtn.addEventListener('click', checkQuizAnswers);
}

function checkQuizAnswers() {
    const questions = document.querySelectorAll('.quiz-question');
    let correctAnswers = 0;
    let totalQuestions = questions.length;

    questions.forEach(question => {
        const selectedOption = question.querySelector('.quiz-option.selected');
        if (selectedOption) {
            const isCorrect = selectedOption.getAttribute('data-correct') === 'true';
            if (isCorrect) {
                selectedOption.classList.add('correct');
                correctAnswers++;
            } else {
                selectedOption.classList.add('incorrect');
                const correct = question.querySelector('.quiz-option[data-correct="true"]');
                if (correct) correct.classList.add('correct');
            }
        } else {
            // nếu không chọn, highlight đáp án đúng
            const correct = question.querySelector('.quiz-option[data-correct="true"]');
            if (correct) correct.classList.add('correct');
        }
    });

    const resultDiv = document.getElementById('quizResult');
    if (!resultDiv) return;
    const percentage = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    let message = '';
    if (percentage === 100) message = '🎉 Xuất sắc! Bạn thực sự hiểu biết về thiên văn học!';
    else if (percentage >= 70) message = '👍 Rất tốt! Kiến thức của bạn khá vững!';
    else if (percentage >= 50) message = '😊 Khá ổn! Hãy ôn lại một chút nhé!';
    else message = '📚 Đừng nản! Hãy đọc lại các phần trên và thử lại!';

    resultDiv.innerHTML = `
        <div class="quiz-result">
            <h3>Kết quả: ${correctAnswers}/${totalQuestions} (${percentage}%)</h3>
            <p>${message}</p>
            <button class="demo-btn" onclick="resetQuiz()">Làm Lại</button>
        </div>
    `;
}

function resetQuiz() {
    document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected', 'correct', 'incorrect'));
    const resultDiv = document.getElementById('quizResult');
    if (resultDiv) resultDiv.innerHTML = '';
}

// ---------- Search ----------
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    searchInput.addEventListener('input', function() {
        performSearch.call(this);
    });
}

function performSearch() {
    const searchTerm = this.value.toLowerCase();
    if (searchTerm.length < 2) return;
    const allElements = document.querySelectorAll('.card, .phenomenon-card, .constellation-card, .timeline-content');
    allElements.forEach(element => {
        const text = (element.textContent || '').toLowerCase();
        if (text.includes(searchTerm)) {
            element.style.backgroundColor = 'rgba(233, 69, 96, 0.12)';
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            element.style.backgroundColor = '';
        }
    });
}

// ---------- Seasonal star maps ----------
function initializeSeasonalMaps() {
    const seasonBtns = document.querySelectorAll('.demo-btn[data-season]');
    seasonBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showSeasonalStarMap(this.dataset.season);
        });
    });
}

function showSeasonalStarMap(season) {
    const starMap = document.getElementById('seasonalStarMap');
    if (!starMap) return;
    const seasonData = {
        spring: {
            title: '🌸 Bầu Trời Mùa Xuân',
            constellations: ['Đại Hùng', 'Tiểu Hùng', 'Sư Tử', 'Xử Nữ', 'Mục Phu'],
            planets: 'Sao Mộc, Sao Thổ sáng rõ',
            events: 'Mưa sao băng Lyrids (tháng 4)'
        },
        summer: {
            title: '☀️ Bầu Trời Mùa Hè',
            constellations: ['Thiên Nga', 'Thiên Cầm', 'Thiên Ưng', 'Nhân Mã', 'Hổ Cáp'],
            planets: 'Sao Mộc, Sao Thổ, đôi khi Sao Hỏa',
            events: 'Mưa sao băng Perseids (tháng 8)'
        },
        autumn: {
            title: '🍂 Bầu Trời Mùa Thu',
            constellations: ['Tiên Hậu', 'Anh Tiên', 'Song Ngư', 'Bảo Bình'],
            planets: 'Sao Thổ, Sao Thiên Vương',
            events: 'Mưa sao băng Orionids (tháng 10)'
        },
        winter: {
            title: '❄️ Bầu Trời Mùa Đông',
            constellations: ['Lạp Hộ', 'Kim Ngưu', 'Ngự Phu', 'Thiên Cẩu', 'Thiên Thố'],
            planets: 'Sao Kim sáng rực, Sao Mộc',
            events: 'Mưa sao băng Geminids (tháng 12)'
        }
    };

    const data = seasonData[season];
    if (!data) return;
    starMap.innerHTML = `
        <div class="seasonal-map">
            <h4>${data.title}</h4>
            <div class="season-info">
                <p><strong>Chòm sao nổi bật:</strong> ${data.constellations.join(', ')}</p>
                <p><strong>Hành tinh dễ quan sát:</strong> ${data.planets}</p>
                <p><strong>Sự kiện đặc biệt:</strong> ${data.events}</p>
            </div>
            <div class="observing-tips">
                <h5>🔍 Mẹo quan sát:</h5>
                <ul>
                    <li>Quan sát sau 9h tối</li>
                    <li>Tìm nơi tối, ít ánh đèn</li>
                    <li>Dùng ứng dụng để xác định vị trí</li>
                    <li>Kiên nhẫn để mắt làm quen bóng tối</li>
                </ul>
            </div>
        </div>
    `;
}

// ---------- Navigation smooth scroll ----------
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
}