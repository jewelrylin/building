/**
 * 住戶管理相關功能
 */

// 住戶數據（模擬數據庫）
let residents = JSON.parse(localStorage.getItem('residents')) || [];

// DOM 元素獲取
document.addEventListener('DOMContentLoaded', function() {
    // 檢查當前頁面
    const isRegisterPage = window.location.pathname.includes('resident-register.html');
    const isLoginPage = window.location.pathname.includes('resident-login.html');
    
    // 註冊頁面邏輯
    if (isRegisterPage) {
        const registerForm = document.getElementById('residentForm');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
    }
    
    // 登入頁面邏輯
    if (isLoginPage) {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    }

    // 檢查已登入狀態
    checkLoginStatus();
});

/**
 * 處理註冊表單提交
 * @param {Event} e - 表單提交事件
 */
function handleRegister(e) {
    e.preventDefault();
    
    // 獲取表單數據
    const fullName = document.getElementById('fullName').value.trim();
    const account = document.getElementById('account').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const unit = document.getElementById('unit').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAgree = document.getElementById('termsAgree').checked;
    
    // 基本驗證
    if (!fullName || !account || !phone || !unit || !password) {
        showNotification('請填寫所有必填欄位', 'error');
        return;
    }
    
    // 密碼匹配驗證
    if (password !== confirmPassword) {
        showNotification('兩次輸入的密碼不一致', 'error');
        return;
    }
    
    // 服務條款驗證
    if (!termsAgree) {
        showNotification('請同意服務條款與隱私政策', 'error');
        return;
    }
    
    // 帳號格式驗證
    if (!validateAccount(account)) {
        showNotification('帳號格式不正確，請使用 數字-數字-數字 格式（例如：12-34-5）', 'error');
        return;
    }
    
    // 檢查帳號是否已註冊
    if (residents.some(resident => resident.account === account)) {
        showNotification('此帳號已被註冊', 'error');
        return;
    }
    
    // 創建新住戶對象
    const newResident = {
        id: generateUniqueId(),
        fullName,
        account,
        phone,
        unit,
        password: hashPassword(password), // 實際應用中應使用更安全的加密方法
        registeredAt: new Date().toISOString(),
        lastLogin: null
    };
    
    // 存儲住戶數據
    residents.push(newResident);
    localStorage.setItem('residents', JSON.stringify(residents));
    
    // 設置登入狀態
    setLoggedIn(newResident);
    
    showNotification('註冊成功！正在跳轉到首頁...', 'success');
    
    // 跳轉到首頁
    setTimeout(() => {
        window.location.href = './index.html';
    }, 2000);
}

/**
 * 處理登入表單提交
 * @param {Event} e - 表單提交事件
 */
function handleLogin(e) {
    e.preventDefault();
    
    const account = document.getElementById('account').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // 基本驗證
    if (!account || !password) {
        showNotification('請輸入帳號和密碼', 'error');
        return;
    }
    
    // 查找住戶
    const resident = residents.find(r => r.account === account);
    
    if (!resident || resident.password !== hashPassword(password)) {
        showNotification('帳號或密碼不正確', 'error');
        return;
    }
    
    // 更新最後登入時間
    resident.lastLogin = new Date().toISOString();
    localStorage.setItem('residents', JSON.stringify(residents));
    
    // 設置登入狀態
    setLoggedIn(resident, rememberMe);
    
    showNotification('登入成功！正在跳轉到首頁...', 'success');
    
    // 跳轉到首頁
    setTimeout(() => {
        window.location.href = './index.html';
    }, 2000);
}

/**
 * 設置登入狀態
 * @param {Object} resident - 住戶資料
 * @param {boolean} rememberMe - 是否記住登入狀態
 */
function setLoggedIn(resident, rememberMe = false) {
    const userData = {
        id: resident.id,
        fullName: resident.fullName,
        account: resident.account,
        unit: resident.unit,
        isLoggedIn: true,
        loginTime: new Date().toISOString()
    };
    
    // 移除敏感資訊
    delete userData.password;
    
    // 存儲登入資訊
    if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
    }
}

/**
 * 檢查登入狀態
 * @returns {Object|null} 當前登入的住戶資料，若未登入則返回 null
 */
function checkLoginStatus() {
    // 優先檢查 sessionStorage，然後檢查 localStorage
    const sessionUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const localUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const currentUser = sessionUser || localUser;
    
    if (currentUser && currentUser.isLoggedIn) {
        // 更新 UI 顯示已登入狀態（如果有相關元素）
        updateUIForLoggedInUser(currentUser);
        return currentUser;
    }
    
    return null;
}

/**
 * 更新 UI 顯示已登入狀態
 * @param {Object} user - 登入的用戶資料
 */
function updateUIForLoggedInUser(user) {
    // 如果頁面上有顯示用戶信息的元素，可以在這裡更新它們
    const userDisplayElements = document.querySelectorAll('.user-display-name');
    if (userDisplayElements.length > 0) {
        userDisplayElements.forEach(el => {
            el.textContent = user.fullName;
        });
    }
    
    // 可以添加更多 UI 更新邏輯，例如顯示/隱藏某些元素
}

/**
 * 登出功能
 */
function logout() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    showNotification('已成功登出', 'success');
    
    // 跳轉到首頁
    window.location.href = './index.html';
}

/**
 * 顯示通知消息
 * @param {string} message - 要顯示的消息
 * @param {string} type - 消息類型 ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
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

/**
 * 驗證帳號格式
 * @param {string} account - 要驗證的帳號
 * @returns {boolean} 是否為有效的帳號格式
 */
function validateAccount(account) {
    const re = /^[0-9]{2}-[0-9]{2}-[0-9]{1}$/;
    return re.test(account);
}

/**
 * 生成唯一 ID
 * @returns {string} 唯一 ID
 */
function generateUniqueId() {
    return 'r_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 密碼加密（模擬）
 * 注意：在實際應用中，應使用更安全的加密方法，例如 bcrypt 或 PBKDF2
 * @param {string} password - 原始密碼
 * @returns {string} 加密後的密碼
 */
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