import { useEffect, useState } from 'react';

export const useServiceWorker = () => {
  const [registration, setRegistration] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar se o navegador suporta Service Workers e Push Notifications
    if (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    ) {
      setIsSupported(true);
      registerServiceWorker();
    } else {
      console.warn('Service Workers ou Push Notifications não são suportados neste navegador');
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      // Registrar Service Worker
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setRegistration(reg);

      // Aguardar o service worker estar pronto
      await navigator.serviceWorker.ready;

      // Solicitar permissão de notificação
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Obter subscription existente ou criar nova
      const sub = await reg.pushManager.getSubscription();
      
      if (sub) {
        setSubscription(sub);
      } else {
        // Criar nova subscription se necessário
        await subscribeToPush(reg);
      }

      // Escutar mensagens do service worker
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      console.log('Service Worker registrado com sucesso');
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  };

  const subscribeToPush = async (reg) => {
    try {
      const publicKey = 'BIKAYUcYP8q6CbBFRfBJsOz9zJcl8siDpqr7vAu5I1Y8q5M0bW2UGpimc4lwzEVD4VlpUzeZ7HRyNjh6J7xOOQI';
      
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      setSubscription(sub);
      
      // Enviar subscription para o backend (se necessário)
      // await sendSubscriptionToServer(sub);
      
      return sub;
    } catch (error) {
      console.error('Erro ao criar subscription:', error);
    }
  };

  const handleServiceWorkerMessage = (event) => {
    if (event.data && event.data.action === 'playAudio') {
      playNotificationSound(event.data.sound);
    }
  };

  const playNotificationSound = (soundPath = '/success-fanfare-trumpets-6185.mp3') => {
    try {
      const audio = new Audio(soundPath);
      audio.volume = 0.7;
      audio.play().catch((error) => {
        console.error('Erro ao tocar som da notificação:', error);
      });
    } catch (error) {
      console.error('Erro ao criar elemento de áudio:', error);
    }
  };

  // Converter chave pública VAPID de base64 URL para Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return {
    registration,
    subscription,
    isSupported,
    playNotificationSound
  };
};

