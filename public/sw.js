const CACHE_NAME = 'meu-apetite-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/logo-meuapetite.svg',
  '/success-fanfare-trumpets-6185.mp3'
];

// Instalar Service Worker e cachear recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Erro ao cachear recursos:', error);
      })
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceptar requisições e servir do cache quando offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Lidar com notificações push
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Novo pedido!',
    body: 'Você tem um novo pedido',
    image: 'https://fastly.picsum.photos/id/481/200/300.jpg?hmac=mlbIyGYg8TMyId9tAwMZz1VppVzNObkpL0cVVxnjTVo',
    icon: '/logo-meuapetite.svg',
    badge: '/logo-meuapetite.svg',
    sound: '/success-fanfare-trumpets-6185.mp3',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    tag: 'new-order',
    data: {
      url: '/orders'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
        sound: data.sound || '/success-fanfare-trumpets-6185.mp3'
      };
    } catch (e) {
      console.error('Erro ao parsear dados da notificação:', e);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    image: notificationData.image,
    badge: notificationData.badge,
    requireInteraction: notificationData.requireInteraction,
    vibrate: notificationData.vibrate,
    tag: notificationData.tag,
    data: notificationData.data,
    actions: [
      {
        action: 'view',
        title: 'Ver pedido'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
      .then(() => {
        // Enviar mensagem para tocar o som
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ 
              action: 'playAudio',
              sound: notificationData.sound
            });
          });
        });
      })
  );
});

// Lidar com cliques nas notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já existe uma janela aberta, focar nela
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
