import { useEffect, useRef, useState } from 'react';
import { ApiService } from 'services/api.service';

// Função para detectar dispositivo
const detectDevice = () => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Função para detectar navegador
const detectBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
  return 'Unknown';
};

// Função para detectar sistema operacional
const detectOS = () => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Windows') > -1) return 'Windows';
  if (ua.indexOf('Mac') > -1) return 'MacOS';
  if (ua.indexOf('Linux') > -1) return 'Linux';
  if (ua.indexOf('Android') > -1) return 'Android';
  if (ua.indexOf('iOS') > -1 || /iPad|iPhone|iPod/.test(ua)) return 'iOS';
  return 'Unknown';
};

// Gerar sessionId único
const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useVisitorTracking = (companyId) => {
  const apiService = new ApiService(false);
  const [sessionId] = useState(() => {
    // Tentar recuperar sessionId do sessionStorage ou criar novo
    const stored = sessionStorage.getItem('visitor_session_id');
    if (stored) return stored;
    const newId = generateSessionId();
    sessionStorage.setItem('visitor_session_id', newId);
    return newId;
  });
  
  const [location, setLocation] = useState(null);
  const visitStartTime = useRef(Date.now());
  const timeOnPageInterval = useRef(null);
  const lastActivityTime = useRef(Date.now());
  const cartAbandonTimer = useRef(null);

  // Coletar localização GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        // Silenciosamente falha se o usuário negar
        console.log('Localização não disponível:', error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // 5 minutos
      }
    );
  }, []);

  // Iniciar rastreamento da visita
  useEffect(() => {
    if (!companyId) return;

    const trackVisit = async () => {
      try {
        const deviceInfo = {
          companyId,
          sessionId,
          userAgent: navigator.userAgent,
          device: detectDevice(),
          browser: detectBrowser(),
          os: detectOS(),
          location
        };

        await apiService.post('/menu/track/visit', deviceInfo);
      } catch (error) {
        console.error('Erro ao rastrear visita:', error);
      }
    };

    trackVisit();

    // Atualizar localização se mudar
    if (location) {
      trackVisit();
    }
  }, [companyId, sessionId, location]);

  // Rastrear tempo na página
  useEffect(() => {
    const updateTimeOnPage = async () => {
      const timeSpent = Math.floor((Date.now() - visitStartTime.current) / 1000);
      
      try {
        await apiService.put(`/menu/track/visit/${sessionId}`, {
          timeOnPage: timeSpent
        });
      } catch (error) {
        console.error('Erro ao atualizar tempo na página:', error);
      }
    };

    // Atualizar a cada 30 segundos
    timeOnPageInterval.current = setInterval(updateTimeOnPage, 30000);

    // Atualizar ao sair da página
    const handleBeforeUnload = () => {
      const timeSpent = Math.floor((Date.now() - visitStartTime.current) / 1000);
      // Usar fetch com keepalive para garantir que a requisição seja enviada
      const baseUrl = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || 
        (typeof window !== 'undefined' 
          ? `${window.location.protocol}//${window.location.hostname}:3000/api`
          : 'http://localhost:3000/api');
      
      fetch(`${baseUrl}/menu/track/visit/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeOnPage: timeSpent,
          visitEnd: new Date().toISOString()
        }),
        keepalive: true
      }).catch(() => {}); // Ignorar erros ao sair da página
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (timeOnPageInterval.current) {
        clearInterval(timeOnPageInterval.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Finalizar visita ao desmontar
      const timeSpent = Math.floor((Date.now() - visitStartTime.current) / 1000);
      apiService.put(`/menu/track/visit/${sessionId}`, {
        timeOnPage: timeSpent,
        visitEnd: new Date().toISOString()
      }).catch(() => {});
    };
  }, [sessionId]);

  // Rastrear visualização de página/produto
  const trackPageView = async (page, productId = null, productName = null) => {
    if (!companyId) return;

    try {
      await apiService.post('/menu/track/pageview', {
        sessionId,
        companyId,
        page,
        productId,
        productName
      });
    } catch (error) {
      console.error('Erro ao rastrear visualização:', error);
    }
  };

  // Rastrear evento do carrinho
  const trackCartEvent = async (type, productId = null, productName = null, variations = null, cartItems = null) => {
    if (!companyId) return;

    try {
      await apiService.post('/menu/track/cart', {
        sessionId,
        companyId,
        type,
        productId,
        productName,
        variations,
        cartItems
      });

      // Resetar timer de abandono se adicionar produto
      if (type === 'add') {
        lastActivityTime.current = Date.now();
        if (cartAbandonTimer.current) {
          clearTimeout(cartAbandonTimer.current);
        }
        
        // Configurar timer de abandono (30 minutos)
        cartAbandonTimer.current = setTimeout(() => {
          trackCartEvent('abandon', null, null, null, cartItems);
        }, 30 * 60 * 1000); // 30 minutos
      }
    } catch (error) {
      console.error('Erro ao rastrear evento do carrinho:', error);
    }
  };

  return {
    sessionId,
    trackPageView,
    trackCartEvent
  };
};

