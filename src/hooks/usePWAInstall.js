import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = window.navigator.standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    // Capturar o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      // Prevenir o prompt automático
      e.preventDefault();
      // Guardar o evento para usar depois
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Escutar o evento
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verificar se já foi instalado (após o prompt)
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      // Limpar preferência de fechar banner quando instalar
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      // Mostrar o prompt de instalação
      deferredPrompt.prompt();

      // Aguardar a resposta do usuário
      const { outcome } = await deferredPrompt.userChoice;

      // Limpar o prompt
      setDeferredPrompt(null);
      setIsInstallable(false);

      if (outcome === 'accepted') {
        setIsInstalled(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    installPWA
  };
};

