// 檢查是否已登入
document.addEventListener('DOMContentLoaded', function() {
    // 檢查管理員登入狀態
    if (!localStorage.getItem('adminLoggedIn')) {
        // 未登入，重定向到登入頁面
        window.location.href = 'admin-login.html';
        return;
    }
    
    // 處理登出
    document.getElementById('logoutButton').addEventListener('click', function() {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'admin-login.html';
    });
    
    // 處理頁籤切換
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 切換頁籤高亮
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 切換內容區域
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
    
    // 載入公告和留言數據
    loadAnnouncements();
    loadMessages();
    
    // 設置新增公告按鈕的事件監聽
    document.getElementById('addAnnouncement').addEventListener('click', addNewAnnouncement);
});

// 初始化公告和留言數據 (如果不存在)
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

// 載入公告數據
function loadAnnouncements() {
    initializeData();
    
    const announcementsList = document.getElementById('announcementsList');
    const announcements = JSON.parse(localStorage.getItem('announcements'));
    
    // 清空現有內容
    announcementsList.innerHTML = '';
    
    // 添加每個公告
    announcements.forEach(announcement => {
        const announcementElement = document.createElement('div');
        announcementElement.className = announcement.important ? 'announcement important' : 'announcement';
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
            <div class="action-buttons">
                <button class="edit-button" data-id="${announcement.id}">編輯</button>
                <button class="delete-button" data-id="${announcement.id}">刪除</button>
            </div>
        `;
        
        announcementsList.appendChild(announcementElement);
    });
    
    // 添加編輯和刪除事件監聽器
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', function() {
            editAnnouncement(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function() {
            deleteAnnouncement(this.getAttribute('data-id'));
        });
    });
}

// 載入留言數據
function loadMessages() {
    initializeData();
    
    const messagesList = document.getElementById('messagesList');
    const messages = JSON.parse(localStorage.getItem('messages'));
    
    // 清空現有內容
    messagesList.innerHTML = '';
    
    // 添加每個留言
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        let repliesHTML = '';
        if (message.replies && message.replies.length > 0) {
            repliesHTML = '<div class="replies">';
            message.replies.forEach(reply => {
                repliesHTML += `
                    <div class="message reply">
                        <div class="message-header">
                            <span class="author">${reply.author}</span>
                            <span class="date">${reply.date}</span>
                        </div>
                        <p class="message-content">${reply.content}</p>
                        <div class="action-buttons">
                            <button class="delete-button" data-message-id="${message.id}" data-reply-id="${reply.id}">刪除回覆</button>
                        </div>
                    </div>
                `;
            });
            repliesHTML += '</div>';
        }
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="author">${message.author}</span>
                <span class="date">${message.date}</span>
            </div>
            <p class="message-content">${message.content}</p>
            <div class="action-buttons">
                <button class="delete-button" data-id="${message.id}">刪除留言</button>
            </div>
            ${repliesHTML}
        `;
        
        messagesList.appendChild(messageElement);
    });
    
    // 添加刪除留言事件監聽器
    document.querySelectorAll('#messagesList .delete-button').forEach(button => {
        if (button.hasAttribute('data-reply-id')) {
            // 刪除回覆
            button.addEventListener('click', function() {
                deleteReply(
                    this.getAttribute('data-message-id'),
                    this.getAttribute('data-reply-id')
                );
            });
        } else {
            // 刪除留言
            button.addEventListener('click', function() {
                deleteMessage(this.getAttribute('data-id'));
            });
        }
    });
}

// 添加新公告
function addNewAnnouncement() {
    const title = document.getElementById('announcementTitle').value.trim();
    const content = document.getElementById('announcementContent').value.trim();
    const important = document.getElementById('announcementImportant').checked;
    
    if (!title || !content) {
        alert('請填寫公告標題和內容');
        return;
    }
    
    // 獲取現有公告
    const announcements = JSON.parse(localStorage.getItem('announcements'));
    
    // 生成新 ID (簡單方法)
    const newId = Date.now().toString();
    
    // 創建新公告
    const newAnnouncement = {
        id: newId,
        title: title,
        content: content,
        author: '管理員',
        date: new Date().toLocaleDateString('zh-TW'),
        important: important
    };
    
    // 添加到公告列表
    announcements.unshift(newAnnouncement);
    localStorage.setItem('announcements', JSON.stringify(announcements));
    
    // 清空表單
    document.getElementById('announcementTitle').value = '';
    document.getElementById('announcementContent').value = '';
    document.getElementById('announcementImportant').checked = false;
    
    // 重新載入公告列表
    loadAnnouncements();
    
    alert('新公告已添加');
}

// 編輯公告
function editAnnouncement(id) {
    const announcements = JSON.parse(localStorage.getItem('announcements'));
    const announcement = announcements.find(a => a.id === id);
    
    if (!announcement) {
        alert('找不到該公告');
        return;
    }
    
    // 獲取新標題和內容
    const newTitle = prompt('編輯公告標題', announcement.title);
    if (newTitle === null) return; // 用戶取消
    
    const newContent = prompt('編輯公告內容', announcement.content);
    if (newContent === null) return; // 用戶取消
    
    const newImportant = confirm('是否標記為重要公告？');
    
    // 更新公告
    announcement.title = newTitle.trim();
    announcement.content = newContent.trim();
    announcement.important = newImportant;
    
    // 保存更新
    localStorage.setItem('announcements', JSON.stringify(announcements));
    
    // 重新載入公告列表
    loadAnnouncements();
    
    alert('公告已更新');
}

// 刪除公告
function deleteAnnouncement(id) {
    if (!confirm('確定要刪除此公告嗎？')) {
        return;
    }
    
    const announcements = JSON.parse(localStorage.getItem('announcements'));
    const updatedAnnouncements = announcements.filter(a => a.id !== id);
    
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    
    // 重新載入公告列表
    loadAnnouncements();
    
    alert('公告已刪除');
}

// 刪除留言
function deleteMessage(id) {
    if (!confirm('確定要刪除此留言嗎？')) {
        return;
    }
    
    const messages = JSON.parse(localStorage.getItem('messages'));
    const updatedMessages = messages.filter(m => m.id !== id);
    
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    
    // 重新載入留言列表
    loadMessages();
    
    alert('留言已刪除');
}

// 刪除回覆
function deleteReply(messageId, replyId) {
    if (!confirm('確定要刪除此回覆嗎？')) {
        return;
    }
    
    const messages = JSON.parse(localStorage.getItem('messages'));
    const message = messages.find(m => m.id === messageId);
    
    if (message && message.replies) {
        message.replies = message.replies.filter(r => r.id !== replyId);
        
        localStorage.setItem('messages', JSON.stringify(messages));
        
        // 重新載入留言列表
        loadMessages();
        
        alert('回覆已刪除');
    }
} 