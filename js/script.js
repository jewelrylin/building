/**
 * 全局腳本文件
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    initApp();
});

/**
 * 初始化應用
 */
function initApp() {
    // 檢查用戶登入狀態
    checkAndDisplayUserInfo();
    
    // 初始化數據 (如果尚未初始化)
    initializeData();
    
    // 添加波西米亞風格特效
    applyBohemianEffects();
    
    // 顯示公告 (如果在公告頁面)
    const announcementsContainer = document.querySelector('.announcements');
    if (announcementsContainer) {
        displayAnnouncements();
    }
    
    // 處理留言板功能
    const submitButton = document.getElementById('submitMessage');
    const messageContent = document.getElementById('messageContent');
    const messagesContainer = document.querySelector('.messages');
    const loginRequiredMessage = document.getElementById('loginRequiredMessage');
    
    // 如果在留言板頁面
    if (submitButton && messageContent) {
        // 檢查用戶是否已登入
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser && currentUser.isLoggedIn) {
            // 已登入用戶可以發布留言
            submitButton.style.display = 'block';
            if (loginRequiredMessage) loginRequiredMessage.style.display = 'none';
            
            // 顯示留言
            displayMessages();
            
            // 發布新留言
            submitButton.addEventListener('click', function() {
                const content = messageContent.value.trim();
                
                if (!content) {
                    showNotification('請填寫留言內容', 'error');
                    return;
                }
                
                addNewMessage(content, currentUser.account);
                
                // 清空輸入欄位
                messageContent.value = '';
            });
        } else {
            // 未登入用戶無法發布留言
            submitButton.style.display = 'none';
            if (loginRequiredMessage) loginRequiredMessage.style.display = 'block';
            
            // 仍然顯示留言，但不能發布
            displayMessages();
        }
    }
    
    // 添加管理員入口連結
    addAdminLink();
}

/**
 * 檢查並顯示用戶登入資訊
 */
function checkAndDisplayUserInfo() {
    // 檢查是否有登入中的用戶
    const sessionUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const localUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const currentUser = sessionUser || localUser;
    
    // 獲取登入區域元素
    const loginArea = document.getElementById('loginArea');
    
    if (currentUser && currentUser.isLoggedIn) {
        // 顯示用戶資訊
        createUserInfoArea(currentUser);
        
        // 隱藏登入按鈕
        if (loginArea) {
            loginArea.style.display = 'none';
        }
    } else {
        // 顯示登入按鈕
        if (loginArea) {
            loginArea.style.display = 'block';
        }
    }
}

/**
 * 創建用戶資訊區域
 * @param {Object} user - 用戶資料
 */
function createUserInfoArea(user) {
    // 檢查是否已存在用戶資訊區域
    if (document.querySelector('.user-info-area')) {
        return;
    }
    
    // 創建用戶資訊區域
    const userInfoArea = document.createElement('div');
    userInfoArea.className = 'user-info-area';
    
    // 用戶資訊
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    
    // 用戶頭像
    const userAvatar = document.createElement('div');
    userAvatar.className = 'user-avatar';
    userAvatar.textContent = user.account.charAt(0).toUpperCase();
    
    // 用戶名稱
    const userName = document.createElement('div');
    userName.className = 'user-name';
    userName.textContent = user.account;
    
    // 登出按鈕
    const logoutButton = document.createElement('button');
    logoutButton.className = 'logout-button';
    logoutButton.textContent = '登出';
    logoutButton.addEventListener('click', handleLogout);
    
    // 組合元素
    userInfo.appendChild(userAvatar);
    userInfo.appendChild(userName);
    userInfoArea.appendChild(userInfo);
    userInfoArea.appendChild(logoutButton);
    
    // 添加到頁面
    document.body.appendChild(userInfoArea);
}

/**
 * 處理登出
 */
function handleLogout() {
    // 清除登入狀態
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    
    // 移除用戶資訊區域
    const userInfoArea = document.querySelector('.user-info-area');
    if (userInfoArea) {
        userInfoArea.remove();
    }
    
    // 顯示登入按鈕
    const loginArea = document.getElementById('loginArea');
    if (loginArea) {
        loginArea.style.display = 'block';
    }
    
    // 顯示通知
    showNotification('已成功登出', 'success');
    
    // 重新載入頁面或跳轉
    setTimeout(() => {
        window.location.href = './index.html';
    }, 1000);
}

/**
 * 顯示通知
 * @param {string} message - 通知訊息
 * @param {string} type - 通知類型 (success, error, info)
 */
function showNotification(message, type = 'info') {
    let container = document.getElementById('notificationContainer');
    
    // 如果容器不存在，創建一個
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
        </div>
        <div class="notification-message">${message}</div>
    `;
    
    container.appendChild(notification);
    
    // 淡入效果
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 幾秒後淡出
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 3000);
}

// 應用波西米亞風格特效
function applyBohemianEffects() {
    // 添加頁面載入動畫
    document.body.classList.add('fade-in');
    
    // 添加隨機裝飾元素
    addDecorativeElements();
    
    // 為主要元素添加滾動顯示動畫
    addScrollAnimations();
    
    // 創建波浪效果
    createWaveEffect();
    
    // 添加漸變背景效果
    createGradientAnimation();
}

// 添加裝飾元素
function addDecorativeElements() {
    // 只在主頁添加裝飾
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        const mainElement = document.querySelector('main');
        if (!mainElement) return;
        
        // 創建波西米亞風格裝飾
        const decorCount = 3;
        
        for (let i = 0; i < decorCount; i++) {
            const decorElement = document.createElement('div');
            decorElement.className = 'boho-decor';
            decorElement.style.top = `${10 + Math.random() * 80}%`;
            decorElement.style.left = `${Math.random() * 85}%`;
            decorElement.style.opacity = '0.15';
            decorElement.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            // 添加不同的裝飾圖案
            switch (i % 3) {
                case 0:
                    decorElement.innerHTML = '<svg viewBox="0 0 24 24" width="70" height="70"><path fill="#8d6e63" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"></path></svg>';
                    break;
                case 1:
                    decorElement.innerHTML = '<svg viewBox="0 0 24 24" width="60" height="60"><path fill="#a1887f" d="M12,20L7,22L4,20V9L1,12V4H9L12,1L15,4H23V12L20,9V20L17,22L12,20M14.2,14L13,13.2L11.8,14L12,12.7L11,11.8L12.3,11.8L12.7,10.5L13.1,11.8L14.4,11.8L13.4,12.7L14.2,14M17.8,15.7L16.9,15L16,15.7L16.2,14.7L15.4,14L16.4,14L16.8,13L17.2,14L18.2,14L17.4,14.7L17.8,15.7M10,15.7L9.1,15L8.2,15.7L8.4,14.7L7.6,14L8.6,14L9,13L9.4,14L10.4,14L9.6,14.7L10,15.7Z"></path></svg>';
                    break;
                case 2:
                    decorElement.innerHTML = '<svg viewBox="0 0 24 24" width="50" height="50"><path fill="#795548" d="M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M15.1,7.07C15.24,7.07 15.38,7.12 15.5,7.21C15.74,7.39 15.79,7.74 15.61,7.97L14.25,9.83C14.29,9.89 14.31,9.94 14.34,10C14.67,10.04 15.85,10.27 16.41,10.28L16.88,8.68C16.96,8.4 17.25,8.24 17.54,8.32C17.83,8.4 17.97,8.7 17.89,8.98L17.41,10.6C17.97,10.77 18.34,10.97 18.34,10.97C18.34,10.97 18.1,11.36 17.75,11.74C17.4,12.13 16.94,12.43 16.94,12.43C16.94,12.43 16.79,13.03 16.44,13.57C16.09,14.11 15.57,14.63 15.57,14.63L16.5,17.22C16.58,17.5 16.44,17.81 16.15,17.89C15.87,17.97 15.56,17.81 15.5,17.54L14.57,14.93C14.57,14.93 14.05,15.17 13.31,15.25C12.57,15.34 11.72,15.25 11.72,15.25L10.79,17.86C10.71,18.14 10.4,18.28 10.11,18.2C9.82,18.12 9.68,17.81 9.76,17.54L10.69,14.95C10.69,14.95 10.21,14.67 9.73,14.25C9.25,13.82 8.83,13.22 8.83,13.22C8.83,13.22 8.43,13.16 8.21,13.11C7.22,14.31 5.5,14.87 5.5,14.87C5.5,14.87 5.26,14.39 5.16,13.83C5.06,13.27 5.1,12.63 5.1,12.63C5.1,12.63 4.4,12.11 3.97,11.39C3.53,10.67 3.36,9.75 3.36,9.75C3.36,9.75 4.57,9.62 5.37,9.79C6.17,9.97 6.91,10.42 6.91,10.42L7.04,10.14C7.4,9.58 7.58,8.67 7.58,8.67L6.16,7.26C5.97,7.03 6.03,6.68 6.26,6.5C6.5,6.32 6.85,6.38 7.03,6.61L8.46,8.02C8.46,8.02 9.17,7.45 9.96,7.21C10.75,6.97 11.68,7.07 11.68,7.07C11.68,7.07 12.29,6.95 12.89,7C13.5,7.04 14.07,7.21 14.07,7.21L15.1,7.07M14.5,11.28C14.5,11.28 14.5,11.29 14.46,11.32C14.13,11.33 13.7,11.27 13.7,11.27C13.7,11.27 13.5,11.31 13.13,11.28C12.76,11.24 12.16,11.12 12.16,11.12C12.16,11.12 11.47,11.24 11.1,11.4C10.73,11.56 10.43,11.89 10.43,11.89C10.43,11.89 10.37,12.4 10.5,12.79C10.63,13.19 10.96,13.55 10.96,13.55C10.96,13.55 11.33,13.95 11.79,14.13C12.24,14.31 12.89,14.31 12.89,14.31C12.89,14.31 13.39,14.16 13.7,14C14.01,13.84 14.23,13.64 14.23,13.64C14.23,13.64 14.5,13.32 14.61,13C14.72,12.67 14.69,12.25 14.69,12.25C14.69,12.25 14.73,11.94 14.67,11.71C14.61,11.5 14.5,11.28 14.5,11.28Z"></path></svg>';
                    break;
            }
            
            mainElement.appendChild(decorElement);
        }
    }
    
    // 添加波西米亞風格的CSS樣式
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
        @keyframes float {
            0% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-10px) rotate(5deg); }
            100% { transform: translateY(0) rotate(0); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        @keyframes pulsate {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 0.7; }
        }
        
        .boho-decor {
            position: absolute;
            z-index: -1;
            animation: float 8s ease-in-out infinite;
            pointer-events: none;
        }
        
        .message-decor {
            position: absolute;
            z-index: 0;
            pointer-events: none;
        }
        
        .fade-in {
            animation: fadeIn 1.2s ease-out forwards;
        }
        
        .gradient-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, #d7ccc8, #a1887f, #795548, #8d6e63, #d7ccc8);
            background-size: 500% 500%;
            animation: gradientAnimation 15s ease infinite;
            z-index: 1000;
        }
        
        .wave {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, #d7ccc8, #a1887f, #795548, #8d6e63, #d7ccc8);
            background-size: 500% 500%;
            animation: gradientAnimation 15s ease infinite;
            z-index: 1000;
            opacity: 0.5;
        }
        
        .scroll-reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.8s ease;
        }
        
        .scroll-reveal.revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        .message {
            position: relative;
            overflow: hidden;
        }
        
        /* 波西米亞風格按鈕效果 */
        button:active {
            transform: translateY(1px);
        }
    `;
    document.head.appendChild(styleElement);
}

// 為元素添加滾動顯示動畫
function addScrollAnimations() {
    // 獲取需要動畫的元素
    const elements = document.querySelectorAll('.menu-item, .announcement, .message');
    
    elements.forEach((element, index) => {
        // 添加動畫類
        element.classList.add('scroll-reveal');
        // 設置延遲
        element.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // 檢查元素是否在可視區域內
    function checkVisibility() {
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = 
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0;
                
            if (isVisible) {
                element.classList.add('revealed');
            }
        });
    }
    
    // 頁面載入時檢查
    checkVisibility();
    // 滾動時檢查
    window.addEventListener('scroll', checkVisibility);
}

// 創建波浪效果
function createWaveEffect() {
    const wave = document.createElement('div');
    wave.className = 'wave';
    document.body.appendChild(wave);
}

// 創建漸變背景動畫
function createGradientAnimation() {
    const gradient = document.createElement('div');
    gradient.className = 'gradient-bg';
    document.body.appendChild(gradient);
}

// 初始化數據 (如果不存在)
function initializeData() {
    // 初始化公告數據
    if (!localStorage.getItem('announcements')) {
        const defaultAnnouncements = [
            {
                id: '1',
                title: '大樓年度消防檢查通知',
                content: '預計於本月15日進行年度消防設備檢查，請各住戶配合。',
                author: '管理委員會',
                date: '2024/03/10',
                important: true
            },
            {
                id: '2',
                title: '電梯保養通知',
                content: '本週六上午9:00-12:00進行例行電梯保養，期間電梯將暫停使用。',
                author: '管理處',
                date: '2024/03/08',
                important: false
            }
        ];
        localStorage.setItem('announcements', JSON.stringify(defaultAnnouncements));
    }
    
    // 初始化留言數據
    if (!localStorage.getItem('messages')) {
        const defaultMessages = [
            {
                id: '1',
                content: '有人知道附近有推薦的清潔公司嗎？',
                author: '1001室',
                date: '2024/03/10',
                replies: [
                    {
                        id: '1-1',
                        content: '我上次用過XX清潔公司，服務不錯，價格合理',
                        author: '1503室',
                        date: '2024/03/10'
                    }
                ]
            },
            {
                id: '2',
                content: '提醒大家記得繳交本月的管理費',
                author: '管理員',
                date: '2024/03/08',
                replies: []
            }
        ];
        localStorage.setItem('messages', JSON.stringify(defaultMessages));
    }
}

// 顯示公告
function displayAnnouncements() {
    const announcementsContainer = document.querySelector('.announcements');
    if (!announcementsContainer) return;
    
    // 清空現有內容
    announcementsContainer.innerHTML = '';
    
    // 從 localStorage 獲取公告
    const announcements = JSON.parse(localStorage.getItem('announcements'));
    
    // 顯示每個公告
    announcements.forEach((announcement, index) => {
        const announcementElement = document.createElement('div');
        announcementElement.className = announcement.important ? 'announcement important' : 'announcement';
        // 添加滾動顯示動畫延遲
        announcementElement.style.transitionDelay = `${index * 0.15}s`;
        announcementElement.innerHTML = `
            <div class="announcement-header">
                <h3>${announcement.title}</h3>
                ${announcement.important ? '<span class="tag">重要</span>' : ''}
            </div>
            <p class="announcement-content">${announcement.content}</p>
            <div class="announcement-footer">
                <span>發布者: ${announcement.author}</span>
                <span>發布時間: ${announcement.date}</span>
            </div>
        `;
        
        announcementsContainer.appendChild(announcementElement);
    });
}

// 顯示留言
function displayMessages() {
    const messagesContainer = document.querySelector('.messages');
    if (!messagesContainer) return;
    
    // 清空現有內容
    messagesContainer.innerHTML = '';
    
    // 從 localStorage 獲取留言
    const messages = JSON.parse(localStorage.getItem('messages'));
    
    // 顯示每個留言
    messages.forEach(message => {
        displaySingleMessage(message, messagesContainer);
    });
    
    // 為所有回覆、編輯和刪除按鈕添加事件監聽器
    addMessageListeners();
}

// 顯示單個留言及其回覆
function displaySingleMessage(message, container) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.dataset.id = message.id;
    
    // 檢查當前用戶是否是該消息的作者或管理員
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));
    const isAuthor = currentUser && message.author === currentUser.account;
    const isAdmin = currentUser && currentUser.isAdmin === true;
    const canEditDelete = isAuthor || isAdmin;
    
    let repliesHTML = '';
    if (message.replies && message.replies.length > 0) {
        repliesHTML = '<div class="replies">';
        message.replies.forEach((reply, index) => {
            repliesHTML += `
                <div class="message reply">
                    <div class="message-header">
                        <span class="author">${reply.author}</span>
                        <span class="date">${reply.date}</span>
                    </div>
                    <p class="message-content">${reply.content}</p>
                </div>
            `;
        });
        repliesHTML += '</div>';
    }
    
    // 添加編輯和刪除按鈕（只對發布者和管理員顯示）
    let actionsHTML = '';
    if (canEditDelete) {
        actionsHTML = `
            <div class="message-actions">
                <button class="edit-button" data-id="${message.id}">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path></svg>
                    編輯
                </button>
                <button class="delete-button" data-id="${message.id}">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path></svg>
                    刪除
                </button>
            </div>
        `;
    }
    
    // 添加一些波西米亞風格的隨機圖案作為裝飾
    const decorPattern = Math.floor(Math.random() * 3);
    let decorHTML = '';
    
    if (decorPattern === 0) {
        decorHTML = '<div class="message-decor" style="top: 10px; right: 10px; opacity: 0.07;"><svg width="30" height="30" viewBox="0 0 24 24"><path fill="#8d6e63" d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"></path></svg></div>';
    } else if (decorPattern === 1) {
        decorHTML = '<div class="message-decor" style="bottom: 10px; left: 10px; opacity: 0.07;"><svg width="35" height="35" viewBox="0 0 24 24"><path fill="#a1887f" d="M12,20L7,22L4,20V9L1,12V4H9L12,1L15,4H23V12L20,9V20L17,22L12,20Z"></path></svg></div>';
    }
    
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="author">${message.author}</span>
            <span class="date">${message.date}</span>
        </div>
        <p class="message-content">${message.content}</p>
        ${actionsHTML}
        <button class="reply-button">回覆</button>
        ${repliesHTML}
        ${decorHTML}
    `;
    
    container.appendChild(messageElement);
}

// 添加新留言
function addNewMessage(content, author) {
    // 檢查用戶是否已登入
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || !currentUser.isLoggedIn) {
        showNotification('請先登入後再發布留言', 'error');
        return;
    }
    
    // 從 localStorage 獲取現有留言
    const messages = JSON.parse(localStorage.getItem('messages'));
    
    // 創建新留言
    const newMessage = {
        id: Date.now().toString(),
        content: content,
        author: author,
        date: new Date().toLocaleDateString('zh-TW'),
        replies: []
    };
    
    // 添加到留言列表
    messages.unshift(newMessage);
    
    // 保存到 localStorage
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // 重新顯示留言
    displayMessages();
    
    showNotification('留言已發布', 'success');
}

// 添加編輯和刪除功能
function addMessageListeners() {
    // 添加回覆按鈕監聽器
    addReplyListeners();
    
    // 添加編輯和刪除按鈕監聽器
    const editButtons = document.querySelectorAll('.edit-button');
    const deleteButtons = document.querySelectorAll('.delete-button');
    
    editButtons.forEach(button => {
        if (!button.hasListener) {
            button.addEventListener('click', function() {
                const messageId = this.dataset.id;
                editMessage(messageId);
            });
            button.hasListener = true;
        }
    });
    
    deleteButtons.forEach(button => {
        if (!button.hasListener) {
            button.addEventListener('click', function() {
                const messageId = this.dataset.id;
                deleteMessage(messageId);
            });
            button.hasListener = true;
        }
    });
}

// 編輯留言
function editMessage(messageId) {
    const messages = JSON.parse(localStorage.getItem('messages'));
    const message = messages.find(m => m.id === messageId);
    
    if (!message) {
        showNotification('找不到該留言', 'error');
        return;
    }
    
    // 創建編輯表單
    const messageElement = document.querySelector(`.message[data-id="${messageId}"]`);
    const messageContent = messageElement.querySelector('.message-content');
    const originalContent = messageContent.textContent;
    
    // 如果已經處於編輯狀態，不再創建新的編輯框
    if (messageElement.querySelector('.edit-form')) {
        return;
    }
    
    // 隱藏原內容
    messageContent.style.display = 'none';
    
    // 創建編輯表單
    const editForm = document.createElement('div');
    editForm.className = 'edit-form';
    editForm.innerHTML = `
        <textarea class="edit-textarea">${originalContent}</textarea>
        <div class="form-group">
            <button class="save-edit">保存</button>
            <button class="cancel-edit">取消</button>
        </div>
    `;
    
    // 插入編輯表單
    messageContent.insertAdjacentElement('afterend', editForm);
    
    // 保存編輯
    editForm.querySelector('.save-edit').addEventListener('click', function() {
        const newContent = editForm.querySelector('.edit-textarea').value.trim();
        
        if (!newContent) {
            showNotification('留言內容不能為空', 'error');
            return;
        }
        
        // 更新留言內容
        message.content = newContent;
        localStorage.setItem('messages', JSON.stringify(messages));
        
        // 更新顯示
        messageContent.textContent = newContent;
        messageContent.style.display = 'block';
        
        // 移除編輯表單
        editForm.remove();
        
        showNotification('留言已更新', 'success');
    });
    
    // 取消編輯
    editForm.querySelector('.cancel-edit').addEventListener('click', function() {
        messageContent.style.display = 'block';
        editForm.remove();
    });
}

// 刪除留言
function deleteMessage(messageId) {
    if (!confirm('確定要刪除這條留言嗎？此操作不可撤銷。')) {
        return;
    }
    
    const messages = JSON.parse(localStorage.getItem('messages'));
    const messageIndex = messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) {
        showNotification('找不到該留言', 'error');
        return;
    }
    
    // 刪除留言
    messages.splice(messageIndex, 1);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // 重新顯示留言
    displayMessages();
    
    showNotification('留言已刪除', 'success');
}

// 添加回覆功能
function addReplyListeners() {
    const replyButtons = document.querySelectorAll('.reply-button');
    
    replyButtons.forEach(button => {
        // 避免重複添加事件監聽器
        if (!button.hasListener) {
            button.addEventListener('click', function() {
                // 檢查用戶是否已登入
                const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));
                
                if (!currentUser || !currentUser.isLoggedIn) {
                    showNotification('請先登入後再回覆', 'error');
                    return;
                }
                
                const message = this.closest('.message');
                const replies = message.querySelector('.replies') || createRepliesContainer(message);
                
                // 如果已經有回覆表單，則不重複添加
                if (message.querySelector('.reply-form')) {
                    return;
                }
                
                // 創建回覆表單
                const replyForm = document.createElement('div');
                replyForm.className = 'message-form reply-form';
                replyForm.innerHTML = `
                    <textarea placeholder="在這裡輸入您的回覆..."></textarea>
                    <div class="form-group">
                        <button class="submit-reply">發布回覆</button>
                    </div>
                `;
                
                // 插入回覆表單
                replies.appendChild(replyForm);
                
                // 添加回覆提交事件
                const submitReply = replyForm.querySelector('.submit-reply');
                submitReply.addEventListener('click', function() {
                    const replyContent = replyForm.querySelector('textarea').value.trim();
                    
                    if (!replyContent) {
                        showNotification('請填寫回覆內容', 'error');
                        return;
                    }
                    
                    // 添加回覆，使用當前用戶的帳號作為作者
                    addReplyToMessage(message.dataset.id, replyContent, currentUser.account);
                    
                    // 移除回覆表單
                    replyForm.remove();
                });
            });
            
            // 標記已添加事件監聽器
            button.hasListener = true;
        }
    });
}

// 創建回覆容器
function createRepliesContainer(messageElement) {
    const repliesContainer = document.createElement('div');
    repliesContainer.className = 'replies';
    messageElement.appendChild(repliesContainer);
    return repliesContainer;
}

// 添加回覆到留言
function addReplyToMessage(messageId, content, author) {
    // 從 localStorage 獲取留言
    const messages = JSON.parse(localStorage.getItem('messages'));
    
    // 找到對應的留言
    const message = messages.find(m => m.id === messageId);
    
    if (message) {
        // 確保 replies 數組存在
        if (!message.replies) {
            message.replies = [];
        }
        
        // 創建新回覆
        const newReply = {
            id: messageId + '-' + (message.replies.length + 1),
            content: content,
            author: author,
            date: new Date().toLocaleDateString('zh-TW')
        };
        
        // 添加回覆
        message.replies.push(newReply);
        
        // 保存更新
        localStorage.setItem('messages', JSON.stringify(messages));
        
        // 重新顯示留言
        displayMessages();
    }
}

// 添加管理員入口連結
function addAdminLink() {
    const footers = document.querySelectorAll('footer');
    
    footers.forEach(footer => {
        // 檢查是否已經有管理員連結
        if (!footer.querySelector('.admin-link')) {
            const adminLink = document.createElement('a');
            adminLink.href = './admin-login.html';
            adminLink.className = 'admin-link';
            adminLink.style.marginLeft = '20px';
            adminLink.style.color = '#aaa';
            adminLink.style.fontSize = '12px';
            adminLink.textContent = '管理員入口';
            
            const copyright = footer.querySelector('p');
            if (copyright) {
                copyright.appendChild(adminLink);
            }
        }
    });
} 