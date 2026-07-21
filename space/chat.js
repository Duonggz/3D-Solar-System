class SpaceChat {
    constructor() {
        this.messages = [];
        this.visibleMessages = [];
        this.maxVisibleMessages = 2;
        this.messageContainer = null;
        this.messageInterval = null;
        
        this.initializeMessages();
        this.createChatUI();
        this.startMessageCycle();
    }

    // Danh sách 20 tin nhắn về kiến thức hệ mặt trời
    initializeMessages() {
        this.messages = [
            "🌞 Mặt Trời chiếm 99.86% khối lượng toàn hệ Mặt Trời",
            "🪐 Sao Mộc là hành tinh lớn nhất với đường kính 142.984 km",
            "🌍 Trái Đất là hành tinh duy nhất có sự sống được biết đến",
            "🚀 Voyager 1 là vật thể nhân tạo xa nhất từ Trái Đất",
            "🪐 Vành đai tiểu hành tinh nằm giữa Sao Hỏa và Sao Mộc",
            "🌙 Mặt Trăng cách Trái Đất khoảng 384.400 km",
            "🪐 Sao Thổ có mật độ nhỏ hơn nước - có thể nổi trên đại dương!",
            "☄️ Sao Chổi là những 'quả cầu tuyết bẩn' từ rìa hệ Mặt Trời",
            "🪐 Sao Thiên Vương quay nghiêng 98 độ so với mặt phẳng quỹ đạo",
            "🌌 Hệ Mặt Trời khoảng 4.6 tỷ năm tuổi",
            "🪐 Sao Kim là hành tinh nóng nhất với nhiệt độ bề mặt 462°C",
            "🚀 Mất khoảng 8 phút để ánh sáng Mặt Trời đến Trái Đất",
            "🪐 Sao Hải Vương mất 165 năm Trái Đất để quay quanh Mặt Trời",
            "🌠 Cực quang xuất hiện khi hạt Mặt Trời tương tác với từ trường",
            "🪐 Sao Thủy không có khí quyển đáng kể",
            "🛰️ Vệ tinh tự nhiên lớn nhất là Ganymede của Sao Mộc",
            "🪐 Vành đai Kuiper chứa hàng ngàn thiên thể băng giá",
            "🌍 Trục Trái Đất nghiêng 23.5 độ tạo ra các mùa",
            "🪐 Sao Hỏa có núi lửa lớn nhất hệ Mặt Trời - Olympus Mons",
            "🚀 New Horizons là tàu vũ trụ đầu tiên thám hiểm Sao Diêm Vương"
        ];
    }

    createChatUI() {
        // Tạo container chính
        this.messageContainer = document.createElement('div');
        this.messageContainer.style.cssText = `
            position: fixed;
            top: 29px;
            left: 30px;
            width: 350px;
            z-index: 1000;
            font-family: 'Arial', sans-serif;
            pointer-events: none;
        `;
        document.body.appendChild(this.messageContainer);
    }

    startMessageCycle() {
        // Hiển thị tin nhắn đầu tiên ngay lập tức
        this.showRandomMessage();
        
        // Thiết lập interval để hiển thị tin nhắn mới mỗi 5-8 giây
        this.messageInterval = setInterval(() => {
            this.showRandomMessage();
        }, this.getRandomInterval(5000, 8000));
    }

    getRandomInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    showRandomMessage() {
        if (this.messages.length === 0) return;

        // Chọn ngẫu nhiên một tin nhắn
        const randomIndex = Math.floor(Math.random() * this.messages.length);
        const messageText = this.messages[randomIndex];
        
        // Tạo element tin nhắn mới
        const messageElement = this.createMessageElement(messageText);
        
        // Thêm vào đầu container (tin nhắn mới ở trên)
        this.messageContainer.insertBefore(messageElement, this.messageContainer.firstChild);
        
        // Thêm vào danh sách tin nhắn đang hiển thị
        this.visibleMessages.unshift({
            element: messageElement,
            text: messageText
        });

        // Giới hạn số tin nhắn hiển thị
        if (this.visibleMessages.length > this.maxVisibleMessages) {
            this.removeOldestMessage();
        }

        // Cập nhật hiệu ứng cho tất cả tin nhắn
        this.updateMessagesAppearance();
        
        // Tự động xóa tin nhắn sau 15 giây
        setTimeout(() => {
            this.removeMessage(messageElement);
        }, 15000);
    }

    createMessageElement(text) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            background: linear-gradient(135deg, rgba(0, 20, 40, 0.9), rgba(0, 40, 80, 0.8));
            color: #e0f7ff;
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 12px;
            border-left: 4px solid #00ffff;
            font-size: 14px;
            line-height: 1.4;
            box-shadow: 0 4px 15px rgba(0, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            transform: translateX(-20px);
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            max-height: 100px;
            overflow: hidden;
            word-wrap: break-word;
        `;
        messageDiv.textContent = text;

        // Animation xuất hiện
        requestAnimationFrame(() => {
            messageDiv.style.transform = 'translateX(0)';
            messageDiv.style.opacity = '1';
        });

        return messageDiv;
    }

    updateMessagesAppearance() {
        this.visibleMessages.forEach((message, index) => {
            const element = message.element;
            
            if (index === 0) {
                // Tin nhắn mới nhất - kích thước và độ rõ bình thường
                element.style.transform = 'scale(1) translateX(0)';
                element.style.opacity = '1';
                element.style.fontSize = '14px';
                element.style.background = 'linear-gradient(135deg, rgba(0, 20, 40, 0.9), rgba(0, 40, 80, 0.8))';
                element.style.borderLeft = '4px solid #00ffff';
            } else if (index === 1) {
                // Tin nhắn thứ hai - nhỏ hơn và mờ hơn
                element.style.transform = 'scale(0.9) translateX(0)';
                element.style.opacity = '0.7';
                element.style.fontSize = '13px';
                element.style.background = 'linear-gradient(135deg, rgba(0, 20, 40, 0.7), rgba(0, 40, 80, 0.6))';
                element.style.borderLeft = '3px solid #00aaff';
            }
            
            // Thêm hiệu ứng cho các tin nhắn cũ hơn (nếu có)
            if (index >= 2) {
                element.style.transform = 'scale(0.8) translateX(0)';
                element.style.opacity = '0.4';
                element.style.fontSize = '12px';
            }
        });
    }

    removeOldestMessage() {
        if (this.visibleMessages.length > this.maxVisibleMessages) {
            const oldestMessage = this.visibleMessages.pop();
            this.removeMessage(oldestMessage.element);
        }
    }

    removeMessage(messageElement) {
        // Animation biến mất
        messageElement.style.transform = 'translateX(-20px)';
        messageElement.style.opacity = '0';
        messageElement.style.maxHeight = '0';
        messageElement.style.marginBottom = '0';
        messageElement.style.paddingTop = '0';
        messageElement.style.paddingBottom = '0';

        // Xóa khỏi DOM sau khi animation kết thúc
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
            
            // Xóa khỏi danh sách visibleMessages
            const index = this.visibleMessages.findIndex(msg => msg.element === messageElement);
            if (index > -1) {
                this.visibleMessages.splice(index, 1);
            }
        }, 500);
    }

    // Phương thức để thêm tin nhắn tùy chỉnh từ bên ngoài
    addCustomMessage(text) {
        const messageElement = this.createMessageElement(text);
        
        this.messageContainer.insertBefore(messageElement, this.messageContainer.firstChild);
        this.visibleMessages.unshift({
            element: messageElement,
            text: text
        });

        if (this.visibleMessages.length > this.maxVisibleMessages) {
            this.removeOldestMessage();
        }

        this.updateMessagesAppearance();

        setTimeout(() => {
            this.removeMessage(messageElement);
        }, 15000);
    }

    // Dọn dẹp khi không cần thiết
    destroy() {
        if (this.messageInterval) {
            clearInterval(this.messageInterval);
        }
        if (this.messageContainer && this.messageContainer.parentNode) {
            this.messageContainer.parentNode.removeChild(this.messageContainer);
        }
    }
}

// Tạo và export instance
const spaceChat = new SpaceChat();
export { spaceChat };