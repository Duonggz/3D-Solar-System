class YouTubePlaylistPlayer {
    constructor() {
        this.currentVideoIndex = 0;
        this.videos = [
            {
                id: 'lv_tXu3cb-w',
                title: 'Video 1 - Bài hát hay',
                thumbnail: 'https://img.youtube.com/vi/lv_tXu3cb-w/mqdefault.jpg'
            },
            {
                id: 'dQw4w9WgXcQ',
                title: 'Video 2 - Nhạc trẻ',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
            },
            {
                id: '9bZkp7q19f0',
                title: 'Video 3 - Giai điệu vui',
                thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg'
            }
            // Thêm video khác vào đây
        ];

        this.initializeElements();
        this.setupEventListeners();
        this.renderPlaylist();
        this.updateControls();
    }

    initializeElements() {
        // Main player elements
        this.youtubeIframe = document.getElementById('youtubeIframe');
        this.fullscreenIframe = document.getElementById('fullscreenIframe');
        this.currentVideoTitle = document.getElementById('currentVideoTitle');
        this.playlistContainer = document.getElementById('playlistContainer');
        
        // Control buttons
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        
        // Fullscreen elements
        this.fullscreenMode = document.getElementById('fullscreenMode');
        this.closeFullscreen = document.getElementById('closeFullscreen');
        this.fsPrevBtn = document.getElementById('fsPrevBtn');
        this.fsNextBtn = document.getElementById('fsNextBtn');
    }

    setupEventListeners() {
        // Main controls
        this.prevBtn.addEventListener('click', () => this.previousVideo());
        this.nextBtn.addEventListener('click', () => this.nextVideo());
        this.fullscreenBtn.addEventListener('click', () => this.enterFullscreen());

        // Fullscreen controls
        this.closeFullscreen.addEventListener('click', () => this.exitFullscreen());
        this.fsPrevBtn.addEventListener('click', () => this.previousVideo());
        this.fsNextBtn.addEventListener('click', () => this.nextVideo());

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Fullscreen change event
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    }

    renderPlaylist() {
        this.playlistContainer.innerHTML = '';
        
        this.videos.forEach((video, index) => {
            const item = document.createElement('div');
            item.className = `playlist-item ${index === this.currentVideoIndex ? 'active' : ''}`;
            item.innerHTML = `
                <img src="${video.thumbnail}" alt="${video.title}" class="playlist-thumbnail">
                <div class="playlist-info">
                    <div class="playlist-title">${video.title}</div>
                    <div class="playlist-duration">Video ${index + 1}</div>
                </div>
            `;
            
            item.addEventListener('click', () => this.playVideo(index));
            this.playlistContainer.appendChild(item);
        });
    }

    playVideo(index) {
        if (index < 0 || index >= this.videos.length) return;
        
        this.currentVideoIndex = index;
        const video = this.videos[index];
        
        // Update main iframe
        this.youtubeIframe.src = `https://www.youtube.com/embed/${video.id}?autoplay=1`;
        
        // Update fullscreen iframe
        this.fullscreenIframe.src = `https://www.youtube.com/embed/${video.id}?autoplay=1`;
        
        // Update UI
        this.currentVideoTitle.textContent = video.title;
        this.renderPlaylist();
        this.updateControls();
    }

    nextVideo() {
        if (this.currentVideoIndex < this.videos.length - 1) {
            this.playVideo(this.currentVideoIndex + 1);
        }
    }

    previousVideo() {
        if (this.currentVideoIndex > 0) {
            this.playVideo(this.currentVideoIndex - 1);
        }
    }

    enterFullscreen() {
        this.fullscreenMode.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Đảm bảo video hiện tại được phát trong fullscreen
        const currentVideo = this.videos[this.currentVideoIndex];
        this.fullscreenIframe.src = `https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`;
    }

    exitFullscreen() {
        this.fullscreenMode.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    handleFullscreenChange() {
        if (!document.fullscreenElement) {
            this.exitFullscreen();
        }
    }

    handleKeyboard(event) {
        // Chỉ xử lý khi đang ở chế độ fullscreen
        if (!this.fullscreenMode.classList.contains('active')) return;

        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousVideo();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextVideo();
                break;
            case 'Escape':
                event.preventDefault();
                this.exitFullscreen();
                break;
        }
    }

    updateControls() {
        // Update main controls
        this.prevBtn.disabled = this.currentVideoIndex === 0;
        this.nextBtn.disabled = this.currentVideoIndex === this.videos.length - 1;
        
        // Update fullscreen controls
        this.fsPrevBtn.disabled = this.currentVideoIndex === 0;
        this.fsNextBtn.disabled = this.currentVideoIndex === this.videos.length - 1;
    }

    // Phương thức để thêm video mới vào playlist
    addVideo(videoId, title) {
        this.videos.push({
            id: videoId,
            title: title,
            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        });
        this.renderPlaylist();
        this.updateControls();
    }
}

// Khởi tạo player khi trang load
document.addEventListener('DOMContentLoaded', () => {
    new YouTubePlaylistPlayer();
});

// Ví dụ thêm video mới (bạn có thể sử dụng sau)
function addNewVideo() {
    const player = new YouTubePlaylistPlayer();
    player.addVideo('VIDEO_ID_HERE', 'Tên video mới');
}