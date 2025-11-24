import { useState, useEffect, useRef } from 'react';
import { Backdrop, Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const barAnimation = keyframes`
  0%, 40%, 100% { transform: scaleY(0.4); opacity: 0.5; }
  20% { transform: scaleY(1); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const BackdropLoading = (props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const stateRef = useRef(null);
  const timeoutRef = useRef(null);
  const minDisplayTime = 2000;
  
  const isLoading = typeof props.loading === 'string' ? true : props.loading;
  const message = typeof props.loading === 'string' ? props.loading : (props.loading ? 'Carregando...' : null);

  const restoreScroll = () => {
    const saved = stateRef.current;
    if (!saved) return;

    if (saved.preventDefault) {
      ['touchmove', 'touchstart', 'scroll', 'wheel'].forEach(event => 
        document.removeEventListener(event, saved.preventDefault)
      );
    }

    document.documentElement.style.removeProperty('overflow');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    document.body.style.touchAction = '';
    document.body.style.userSelect = '';
    
    if (saved.scrollY !== undefined && saved.scrollX !== undefined) {
      window.scrollTo(saved.scrollX, saved.scrollY);
    }

    stateRef.current = null;
  };

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isLoading) {
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const preventDefault = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = `-${scrollX}px`;
      document.body.style.width = '100%';
      document.body.style.touchAction = 'none';
      document.body.style.userSelect = 'none';

      ['touchmove', 'touchstart', 'scroll', 'wheel'].forEach(event =>
        document.addEventListener(event, preventDefault, { passive: false })
      );

      stateRef.current = { scrollY, scrollX, preventDefault, startTime: Date.now() };
      setIsVisible(true);
      setShowContent(true);
    } else {
      const elapsed = stateRef.current?.startTime ? Date.now() - stateRef.current.startTime : 0;
      const remainingTime = Math.max(0, minDisplayTime - elapsed);

      timeoutRef.current = setTimeout(() => {
        setShowContent(false);
        setTimeout(() => {
          setIsVisible(false);
          restoreScroll();
        }, 300);
      }, remainingTime);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      restoreScroll();
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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, animation: `${fadeIn} 0.3s ease-in` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, height: 50 }}>
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
        <Typography variant="body1" sx={{ color: '#fff', fontWeight: 400, fontSize: '0.95rem', letterSpacing: '0.3px', opacity: 0.9 }}>
          {message || 'Carregando...'}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default BackdropLoading;
