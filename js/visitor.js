/**
 * 訪客訪問相關功能
 */

// 訪客數據（模擬數據庫）
let visitors = JSON.parse(localStorage.getItem('visitors')) || [];

// DOM 元素獲取
document.addEventListener('DOMContentLoaded', function() {
    // 獲取訪客表單
    const visitorForm = document.getElementById('visitorForm');
    if (visitorForm) {
        visitorForm.addEventListener('submit', handleVisitorRegistration);
    }
    
    // 目的下拉菜單變更事件
    const purposeSelect = document.getElementById('visitPurpose');
    if (purposeSelect) {
        purposeSelect.addEventListener('change', function() {
            const otherPurposeGroup = document.getElementById('otherPurposeGroup');
            if (this.value === 'other') {
                otherPurposeGroup.style.display = 'block';
                document.getElementById('otherPurpose').required = true;
            } else {
                otherPurposeGroup.style.display = 'none';
                document.getElementById('otherPurpose').required = false;
            }
        });
    }
    
    // 模態窗關閉按鈕
    const closeModalButtons = document.querySelectorAll('.close-modal, #closeModal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // 下載二維碼按鈕
    const downloadQRButton = document.getElementById('downloadQRCode');
    if (downloadQRButton) {
        downloadQRButton.addEventListener('click', downloadQRCode);
    }
});

/**
 * 處理訪客登記表單提交
 * @param {Event} e - 表單提交事件
 */
function handleVisitorRegistration(e) {
    e.preventDefault();
    
    // 獲取表單數據
    const visitorName = document.getElementById('visitorName').value.trim();
    const visitorPhone = document.getElementById('visitorPhone').value.trim();
    const visitPurpose = document.getElementById('visitPurpose').value;
    const otherPurpose = document.getElementById('otherPurpose').value.trim();
    const targetUnit = document.getElementById('targetUnit').value.trim();
    const targetResident = document.getElementById('targetResident').value.trim();
    const visitDate = document.getElementById('visitDate').value;
    const visitTime = document.getElementById('visitTime').value;
    const termsAgree = document.getElementById('termsAgree').checked;
    
    // 基本驗證
    if (!visitorName || !visitorPhone || !visitPurpose || !targetUnit || !targetResident || !visitDate || !visitTime) {
        showNotification('請填寫所有必填欄位', 'error');
        return;
    }
    
    // 其他目的驗證
    if (visitPurpose === 'other' && !otherPurpose) {
        showNotification('請填寫其他目的說明', 'error');
        return;
    }
    
    // 服務條款驗證
    if (!termsAgree) {
        showNotification('請同意訪客管理規範與隱私政策', 'error');
        return;
    }
    
    // 驗證訪問日期和時間
    const visitDateTime = new Date(`${visitDate}T${visitTime}`);
    const now = new Date();
    
    if (visitDateTime < now) {
        showNotification('訪問時間不能早於當前時間', 'error');
        return;
    }
    
    // 創建訪問記錄
    const visitId = generateVisitId();
    const newVisit = {
        id: visitId,
        visitorName,
        visitorPhone,
        visitPurpose: visitPurpose === 'other' ? otherPurpose : visitPurpose,
        targetUnit,
        targetResident,
        visitDateTime: visitDateTime.toISOString(),
        status: 'pending', // pending, approved, completed, cancelled
        createdAt: new Date().toISOString()
    };
    
    // 存儲訪問記錄
    visitors.push(newVisit);
    localStorage.setItem('visitors', JSON.stringify(visitors));
    
    // 顯示成功通知
    showNotification('訪問登記成功！', 'success');
    
    // 生成並顯示二維碼
    generateQRCode(newVisit);
}

/**
 * 生成訪問二維碼
 * @param {Object} visit - 訪問記錄
 */
function generateQRCode(visit) {
    // 設置模態窗內容
    document.getElementById('modalVisitorName').textContent = visit.visitorName;
    document.getElementById('modalTargetUnit').textContent = visit.targetUnit;
    
    // 格式化訪問時間
    const visitDateTime = new Date(visit.visitDateTime);
    const formattedDateTime = `${visitDateTime.getFullYear()}/${(visitDateTime.getMonth() + 1).toString().padStart(2, '0')}/${visitDateTime.getDate().toString().padStart(2, '0')} ${visitDateTime.getHours().toString().padStart(2, '0')}:${visitDateTime.getMinutes().toString().padStart(2, '0')}`;
    document.getElementById('modalVisitDateTime').textContent = formattedDateTime;
    
    document.getElementById('modalVisitId').textContent = visit.id;
    
    // 創建二維碼內容（實際應用中可能需要更複雜的加密方式）
    const qrData = {
        id: visit.id,
        name: visit.visitorName,
        unit: visit.targetUnit,
        time: visit.visitDateTime,
        verification: generateVerificationCode(visit.id)
    };
    
    const qrCodeString = JSON.stringify(qrData);
    
    // 在實際應用中，這裡應該調用二維碼生成庫
    // 這裡我們使用一個假的二維碼圖示作為替代
    const qrCodeDisplay = document.getElementById('qrCodeDisplay');
    qrCodeDisplay.innerHTML = `
        <div class="mock-qr-code">
            <svg viewBox="0 0 100 100" width="200" height="200">
                <rect x="10" y="10" width="80" height="80" fill="white" stroke="#8d6e63" stroke-width="2"></rect>
                <rect x="20" y="20" width="60" height="60" fill="white" stroke="#8d6e63" stroke-width="1.5"></rect>
                <rect x="30" y="30" width="40" height="40" fill="white" stroke="#8d6e63" stroke-width="1"></rect>
                <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" font-size="8" fill="#8d6e63">${visit.id}</text>
                <circle cx="75" cy="75" r="5" fill="#8d6e63"></circle>
                <circle cx="25" cy="25" r="5" fill="#8d6e63"></circle>
                <circle cx="75" cy="25" r="5" fill="#8d6e63"></circle>
                <circle cx="25" cy="75" r="5" fill="#8d6e63"></circle>
            </svg>
            <p class="qr-note">訪問編號: ${visit.id}</p>
        </div>
    `;
    
    // 顯示模態窗
    showModal();
}

/**
 * 顯示模態窗
 */
function showModal() {
    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) {
        modalContainer.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滾動
    }
}

/**
 * 關閉模態窗
 */
function closeModal() {
    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) {
        modalContainer.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * 下載二維碼
 * 注意：此功能在實際應用中需要使用 HTML5 Canvas 或者其他庫來實現
 */
function downloadQRCode() {
    // 這裡模擬下載行為
    showNotification('二維碼下載功能尚未實現', 'info');
    
    // 實際實現應該是這樣的（需要 html2canvas 或類似庫）：
    /*
    html2canvas(document.getElementById('qrCodeDisplay')).then(canvas => {
        const link = document.createElement('a');
        link.download = '訪問二維碼.png';
        link.href = canvas.toDataURL();
        link.click();
    });
    */
}

/**
 * 生成訪問 ID
 * @returns {string} 訪問 ID
 */
function generateVisitId() {
    // 格式：V + 年月日 + 隨機數
    const now = new Date();
    const dateString = now.getFullYear().toString().substr(-2) +
                      (now.getMonth() + 1).toString().padStart(2, '0') +
                      now.getDate().toString().padStart(2, '0');
    
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `V${dateString}${randomPart}`;
}

/**
 * 生成驗證碼
 * @param {string} visitId - 訪問 ID
 * @returns {string} 驗證碼
 */
function generateVerificationCode(visitId) {
    // 這裡簡單地對訪問 ID 進行處理，實際應用中可能需要更複雜的算法
    let code = '';
    for (let i = 0; i < visitId.length; i++) {
        code += visitId.charCodeAt(i) % 10;
    }
    return code.substring(0, 6);
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