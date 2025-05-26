// 緩存版本號，需要更新時只需更改此版本號
const CACHE_VERSION = 'v1';
const CACHE_NAME = `building-management-${CACHE_VERSION}`;

// 需要緩存的資源列表
const urlsToCache = [
  './',
  './index.html',
  './announcements.html',
  './messages.html',
  './404.html',
  './css/style.css',
  './js/script.js',
  './img/icon-192.png',
  './img/icon-512.png'
];

// 安裝 Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 攔截網絡請求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在緩存中找到了對應的資源，則返回
        if (response) {
          return response;
        }
        
        // 否則嘗試從網絡獲取
        return fetch(event.request)
          .then(response => {
            // 檢查響應是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 複製響應（因為響應流只能使用一次）
            const responseToCache = response.clone();
            
            // 將獲取的資源添加到緩存中
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            // 如果獲取失敗且請求是圖片，返回默認圖片
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('./img/fallback-image.png');
            }
            
            // 如果獲取失敗且請求是 HTML 頁面，返回離線頁面
            if (event.request.url.match(/\.html$/) || 
                event.request.mode === 'navigate') {
              return caches.match('./404.html');
            }
            
            // 其他情況，返回默認的離線響應
            return new Response('網絡連接失敗，請檢查您的網絡連接。', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// 清理舊版本緩存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 