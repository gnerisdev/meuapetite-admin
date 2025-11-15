import { useState, useEffect, useRef } from 'react';
import { Backdrop, Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

// Animação de barras pulsantes
const barAnimation = keyframes`
  0%, 40%, 100% {
    transform: scaleY(0.4);
    opacity: 0.5;
  }
  20% {
    transform: scaleY(1);
    opacity: 1;
  }
`;

// Animação suave de fade in
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const BackdropLoading = (props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const startTimeRef = useRef(null);
  const startTimestampRef = useRef(null);
  const timeoutRef = useRef(null);
  const minDisplayTime = 2000; // 2 segundos mínimo

  const isLoading = typeof props.loading === 'string' ? true : props.loading;
  const message = typeof props.loading === 'string' ? props.loading : (props.loading ? 'Carregando...' : null);

  useEffect(() => {
    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isLoading) {
      // Salvar posição atual do scroll
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Desabilitar scroll e movimento em todas as direções
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = `-${scrollX}px`;
      document.body.style.width = '100%';
      document.body.style.touchAction = 'none';
      document.body.style.userSelect = 'none';
      
      // Prevenir eventos de toque e scroll
      const preventDefault = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      // Adicionar event listeners para prevenir movimento
      document.addEventListener('touchmove', preventDefault, { passive: false });
      document.addEventListener('touchstart', preventDefault, { passive: false });
      document.addEventListener('scroll', preventDefault, { passive: false });
      document.addEventListener('wheel', preventDefault, { passive: false });
      
      // Guardar referência para remover depois
      startTimeRef.current = {
        scrollY,
        scrollX,
        preventDefault
      };
      startTimestampRef.current = Date.now();
      
      // Iniciar loading
      setIsVisible(true);
      setShowContent(true);
    } else {
      // Calcular tempo decorrido
      const elapsed = startTimestampRef.current ? Date.now() - startTimestampRef.current : 0;
      const remainingTime = Math.max(0, minDisplayTime - elapsed);

      // Aguardar o tempo mínimo antes de esconder
      timeoutRef.current = setTimeout(() => {
        setShowContent(false);
        // Aguardar transição antes de esconder completamente
        setTimeout(() => {
          setIsVisible(false);
          
          // Restaurar scroll e movimento
          const savedState = startTimeRef.current;
          if (savedState && typeof savedState === 'object') {
            const scrollY = savedState.scrollY || 0;
            const scrollX = savedState.scrollX || 0;
            
            // Remover event listeners
            if (savedState.preventDefault) {
              document.removeEventListener('touchmove', savedState.preventDefault);
              document.removeEventListener('touchstart', savedState.preventDefault);
              document.removeEventListener('scroll', savedState.preventDefault);
              document.removeEventListener('wheel', savedState.preventDefault);
            }
            
            // Restaurar estilos do body
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.width = '';
            document.body.style.touchAction = '';
            document.body.style.userSelect = '';
            
            // Restaurar posição do scroll
            window.scrollTo(scrollX, scrollY);
          }
          
          // Limpar referências
          startTimeRef.current = null;
          startTimestampRef.current = null;
        }, 300);
      }, remainingTime);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Garantir que tudo seja restaurado ao desmontar
      const savedState = startTimeRef.current;
      if (savedState && typeof savedState === 'object' && savedState.preventDefault) {
        document.removeEventListener('touchmove', savedState.preventDefault);
        document.removeEventListener('touchstart', savedState.preventDefault);
        document.removeEventListener('scroll', savedState.preventDefault);
        document.removeEventListener('wheel', savedState.preventDefault);
      }
      
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.touchAction = '';
      document.body.style.userSelect = '';
      
      // Limpar referências
      startTimeRef.current = null;
      startTimestampRef.current = null;
    };
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <Backdrop
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 100,
        backgroundColor: props?.bgColor ?? 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(2px)',
        transition: 'opacity 0.3s ease-in-out',
        opacity: showContent ? 1 : 0,
      }}
      open={true}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          animation: `${fadeIn} 0.3s ease-in`,
        }}
      >
        {/* Barras animadas */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            height: 50,
          }}
        >
          {[0, 1, 2, 3, 4].map((index) => (
            <Box
              key={index}
              sx={{
                width: 4,
                height: 40,
                backgroundColor: 'primary.main',
                borderRadius: '2px',
                animation: `${barAnimation} 1.2s ease-in-out infinite`,
                animationDelay: `${index * 0.1}s`,
                transformOrigin: 'center',
              }}
            />
          ))}
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: '#fff',
            fontWeight: 400,
            fontSize: '0.95rem',
            letterSpacing: '0.3px',
            opacity: 0.9,
          }}
        >
          {message || 'Carregando...'}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default BackdropLoading;
