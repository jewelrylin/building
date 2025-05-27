// 檢查是否已登入
document.addEventListener('DOMContentLoaded', function() {
    // 初始化管理員設置
    initializeAdminSettings();
    
    // 檢查管理員登入狀態
    const adminData = JSON.parse(localStorage.getItem('adminData'));
    if (!adminData || !adminData.isLoggedIn) {
        // 未登入，重定向到登入頁面
        window.location.href = 'admin-login.html';
        return;
    }
    
    // 檢查權限
    const isLevel1Admin = adminData.level === 1; // 超級管理員
    
    // 根據權限顯示/隱藏功能
    if (!isLevel1Admin) {
        // 二級管理員無法訪問用戶管理和管理員設置
        document.querySelector('[data-tab="users"]').style.display = 'none';
        document.querySelector('[data-tab="admins"]').style.display = 'none';
    }
    
    // 處理登出
    document.getElementById('logoutButton').addEventListener('click', function() {
        const adminData = JSON.parse(localStorage.getItem('adminData'));
        adminData.isLoggedIn = false;
        localStorage.setItem('adminData', JSON.stringify(adminData));
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
    
    // 如果是超級管理員，載入用戶和管理員數據
    if (isLevel1Admin) {
        loadUsers();
        loadAdmins();
        
        // 設置用戶管理按鈕的事件監聽
        document.getElementById('saveUser').addEventListener('click', saveUser);
        document.getElementById('cancelEdit').addEventListener('click', cancelUserEdit);
        
        // 設置管理員設置按鈕的事件監聽
        document.getElementById('saveAdmin').addEventListener('click', saveAdminSettings);
    }
    
    // 設置新增公告按鈕的事件監聽
    document.getElementById('addAnnouncement').addEventListener('click', addNewAnnouncement);
});

// 初始化管理員設置
function initializeAdminSettings() {
    if (!localStorage.getItem('adminData')) {
        const defaultAdminData = {
            username: 'admin',
            password: 'admin123',
            level: 1, // 1: 超級管理員, 2: 二級管理員
            isLoggedIn: false
        };
        localStorage.setItem('adminData', JSON.stringify(defaultAdminData));
    }
}

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
    let messages = JSON.parse(localStorage.getItem('messages'));
    if (!messages) {
        const defaultMessages = [
            {
                id: '1',
                content: '有人知道附近有推薦的清潔公司嗎？',
                author: '12-34-5',
                date: '2024/03/10',
                replies: [
                    {
                        id: '1-1',
                        content: '我上次用過XX清潔公司，服務不錯，價格合理',
                        author: '67-89-0',
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
    
    // 初始化住戶數據
    if (!localStorage.getItem('residents')) {
        const defaultResidents = [
            {
                id: 'r_1',
                fullName: '王小明',
                account: '12-34-5',
                phone: '0912345678',
                unit: 'A-1001',
                password: hashPassword('password123'),
                registeredAt: new Date().toISOString(),
                lastLogin: null,
                isAdmin: false
            },
            {
                id: 'r_2',
                fullName: '李小華',
                account: '67-89-0',
                phone: '0987654321',
                unit: 'B-1503',
                password: hashPassword('password456'),
                registeredAt: new Date().toISOString(),
                lastLogin: null,
                isAdmin: true // 二級管理員
            }
        ];
        localStorage.setItem('residents', JSON.stringify(defaultResidents));
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
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    
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

// 載入住戶數據
function loadUsers() {
    initializeData();
    
    const usersList = document.getElementById('usersList');
    const residents = JSON.parse(localStorage.getItem('residents')) || [];
    
    // 清空現有內容
    usersList.innerHTML = '';
    
    // 創建表格
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>帳號</th>
                <th>姓名</th>
                <th>單位</th>
                <th>電話</th>
                <th>註冊時間</th>
                <th>管理員</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    // 添加每個住戶
    residents.forEach(resident => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${resident.account}</td>
            <td>${resident.fullName}</td>
            <td>${resident.unit}</td>
            <td>${resident.phone}</td>
            <td>${new Date(resident.registeredAt).toLocaleDateString('zh-TW')}</td>
            <td>${resident.isAdmin ? '是' : '否'}</td>
            <td>
                <button class="edit-user-button" data-id="${resident.id}">編輯</button>
                <button class="delete-user-button" data-id="${resident.id}">刪除</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    usersList.appendChild(table);
    
    // 添加編輯和刪除事件監聽器
    document.querySelectorAll('.edit-user-button').forEach(button => {
        button.addEventListener('click', function() {
            editUser(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.delete-user-button').forEach(button => {
        button.addEventListener('click', function() {
            deleteUser(this.getAttribute('data-id'));
        });
    });
}

// 載入管理員數據
function loadAdmins() {
    const adminsList = document.getElementById('adminsList');
    const residents = JSON.parse(localStorage.getItem('residents')) || [];
    const adminData = JSON.parse(localStorage.getItem('adminData'));
    
    // 清空現有內容
    adminsList.innerHTML = '';
    
    // 創建表格
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>類型</th>
                <th>帳號</th>
                <th>姓名</th>
                <th>權限</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>超級管理員</td>
                <td>${adminData.username}</td>
                <td>系統管理員</td>
                <td>全功能</td>
            </tr>
        </tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    // 添加每個二級管理員
    residents.filter(r => r.isAdmin).forEach(admin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>二級管理員</td>
            <td>${admin.account}</td>
            <td>${admin.fullName}</td>
            <td>公告和留言管理</td>
        `;
        
        tbody.appendChild(row);
    });
    
    adminsList.appendChild(table);
    
    // 設置當前管理員帳號密碼
    document.getElementById('adminUsername').value = adminData.username;
    document.getElementById('adminPassword').value = '';
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
    
    // 填充表單
    document.getElementById('announcementTitle').value = announcement.title;
    document.getElementById('announcementContent').value = announcement.content;
    document.getElementById('announcementImportant').checked = announcement.important;
    
    // 刪除原公告
    const index = announcements.findIndex(a => a.id === id);
    announcements.splice(index, 1);
    
    // 更新 localStorage
    localStorage.setItem('announcements', JSON.stringify(announcements));
    
    // 重新載入公告列表
    loadAnnouncements();
    
    alert('請編輯公告內容，然後點擊「新增公告」按鈕保存');
}

// 刪除公告
function deleteAnnouncement(id) {
    if (!confirm('確定要刪除這條公告嗎？')) {
        return;
    }
    
    const announcements = JSON.parse(localStorage.getItem('announcements'));
    const index = announcements.findIndex(a => a.id === id);
    
    if (index !== -1) {
        announcements.splice(index, 1);
        localStorage.setItem('announcements', JSON.stringify(announcements));
        loadAnnouncements();
        alert('公告已刪除');
    }
}

// 刪除留言
function deleteMessage(id) {
    if (!confirm('確定要刪除這條留言嗎？')) {
        return;
    }
    
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    const index = messages.findIndex(m => m.id === id);
    
    if (index !== -1) {
        messages.splice(index, 1);
        localStorage.setItem('messages', JSON.stringify(messages));
        loadMessages();
        alert('留言已刪除');
    }
}

// 刪除回覆
function deleteReply(messageId, replyId) {
    if (!confirm('確定要刪除這條回覆嗎？')) {
        return;
    }
    
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    const message = messages.find(m => m.id === messageId);
    
    if (message && message.replies) {
        const replyIndex = message.replies.findIndex(r => r.id === replyId);
        
        if (replyIndex !== -1) {
            message.replies.splice(replyIndex, 1);
            localStorage.setItem('messages', JSON.stringify(messages));
            loadMessages();
            alert('回覆已刪除');
        }
    }
}

// 編輯住戶
function editUser(id) {
    const residents = JSON.parse(localStorage.getItem('residents')) || [];
    const resident = residents.find(r => r.id === id);
    
    if (!resident) {
        alert('找不到該住戶');
        return;
    }
    
    // 填充表單
    document.getElementById('userAccount').value = resident.account;
    document.getElementById('userName').value = resident.fullName;
    document.getElementById('userUnit').value = resident.unit;
    document.getElementById('userPhone').value = resident.phone;
    document.getElementById('userPassword').value = ''; // 不顯示密碼
    document.getElementById('userIsAdmin').checked = resident.isAdmin;
    document.getElementById('editingUserId').value = resident.id;
    
    // 顯示取消按鈕
    document.getElementById('cancelEdit').style.display = 'inline-block';
    
    // 禁用帳號欄位 (不允許修改帳號)
    document.getElementById('userAccount').disabled = true;
}

// 取消編輯住戶
function cancelUserEdit() {
    // 清空表單
    document.getElementById('userAccount').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('userUnit').value = '';
    document.getElementById('userPhone').value = '';
    document.getElementById('userPassword').value = '';
    document.getElementById('userIsAdmin').checked = false;
    document.getElementById('editingUserId').value = '';
    
    // 隱藏取消按鈕
    document.getElementById('cancelEdit').style.display = 'none';
    
    // 啟用帳號欄位
    document.getElementById('userAccount').disabled = false;
}

// 儲存住戶
function saveUser() {
    const account = document.getElementById('userAccount').value.trim();
    const fullName = document.getElementById('userName').value.trim();
    const unit = document.getElementById('userUnit').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const password = document.getElementById('userPassword').value;
    const isAdmin = document.getElementById('userIsAdmin').checked;
    const editingId = document.getElementById('editingUserId').value;
    
    // 基本驗證
    if (!account || !fullName || !unit || !phone) {
        alert('請填寫所有必填欄位');
        return;
    }
    
    // 帳號格式驗證
    if (!validateAccount(account)) {
        alert('帳號格式不正確，請使用 數字-數字-數字 格式（例如：12-34-5）');
        return;
    }
    
    const residents = JSON.parse(localStorage.getItem('residents')) || [];
    
    if (editingId) {
        // 編輯現有住戶
        const index = residents.findIndex(r => r.id === editingId);
        
        if (index !== -1) {
            // 更新住戶資料
            residents[index].fullName = fullName;
            residents[index].unit = unit;
            residents[index].phone = phone;
            residents[index].isAdmin = isAdmin;
            
            // 如果有輸入新密碼，則更新密碼
            if (password) {
                residents[index].password = hashPassword(password);
            }
            
            alert('住戶資料已更新');
        }
    } else {
        // 檢查帳號是否已存在
        if (residents.some(r => r.account === account)) {
            alert('此帳號已被註冊');
            return;
        }
        
        // 密碼驗證
        if (!password) {
            alert('請設置密碼');
            return;
        }
        
        // 創建新住戶
        const newResident = {
            id: 'r_' + Date.now(),
            fullName,
            account,
            phone,
            unit,
            password: hashPassword(password),
            registeredAt: new Date().toISOString(),
            lastLogin: null,
            isAdmin
        };
        
        // 添加到住戶列表
        residents.push(newResident);
        alert('新住戶已添加');
    }
    
    // 更新 localStorage
    localStorage.setItem('residents', JSON.stringify(residents));
    
    // 清空表單
    cancelUserEdit();
    
    // 重新載入住戶列表
    loadUsers();
    loadAdmins(); // 同時更新管理員列表
}

// 刪除住戶
function deleteUser(id) {
    if (!confirm('確定要刪除這個住戶嗎？此操作不可撤銷。')) {
        return;
    }
    
    const residents = JSON.parse(localStorage.getItem('residents')) || [];
    const index = residents.findIndex(r => r.id === id);
    
    if (index !== -1) {
        residents.splice(index, 1);
        localStorage.setItem('residents', JSON.stringify(residents));
        loadUsers();
        loadAdmins(); // 同時更新管理員列表
        alert('住戶已刪除');
    }
}

// 儲存管理員設置
function saveAdminSettings() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    if (!username) {
        alert('請輸入管理員帳號');
        return;
    }
    
    const adminData = JSON.parse(localStorage.getItem('adminData'));
    
    // 更新帳號
    adminData.username = username;
    
    // 如果有輸入新密碼，則更新密碼
    if (password) {
        adminData.password = password;
    }
    
    // 更新 localStorage
    localStorage.setItem('adminData', JSON.stringify(adminData));
    
    // 清空密碼欄位
    document.getElementById('adminPassword').value = '';
    
    // 重新載入管理員列表
    loadAdmins();
    
    alert('管理員設置已更新');
}

// 驗證帳號格式
function validateAccount(account) {
    const re = /^[0-9]{2}-[0-9]{2}-[0-9]{1}$/;
    return re.test(account);
}

// 密碼加密（模擬）
function hashPassword(password) {
    // 這只是一個簡單的 hash 函數，實際應用中不應使用
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
} 