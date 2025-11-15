import React from 'react';
import { Box, useTheme } from 'components/ui';

// Helper simples para substituir styled do @mui/system
export const styled = (component) => {
  return (styles) => {
    // Se styles é uma string (template literal), converter para objeto
    let styleObject = styles;
    if (typeof styles === 'string') {
      // Converter CSS string para objeto básico (implementação simplificada)
      // Para casos complexos, pode ser necessário usar uma biblioteca de parsing
      styleObject = {};
    } else if (typeof styles === 'function') {
      // Se for uma função (como styled('div')(({ theme }) => ({ ... }))), 
      // criar um componente que usa o hook useTheme
      const StyledComponent = React.forwardRef(({ children, sx = {}, ...props }, ref) => {
        const theme = useTheme();
        const computedStyles = styles({ ...props, theme });
        const mergedStyles = {
          ...computedStyles,
          ...sx,
        };

        if (typeof component === 'string') {
          return (
            <Box component={component} sx={mergedStyles} ref={ref} {...props}>
              {children}
            </Box>
          );
        }

        return (
          <Box component={component} sx={mergedStyles} ref={ref} {...props}>
            {children}
          </Box>
        );
      });

      StyledComponent.displayName = `Styled(${typeof component === 'string' ? component : component.displayName || 'Component'})`;

      return StyledComponent;
    }

    const StyledComponent = React.forwardRef(({ children, sx = {}, ...props }, ref) => {
      const mergedStyles = {
        ...styleObject,
        ...sx,
      };

      if (typeof component === 'string') {
        return (
          <Box component={component} sx={mergedStyles} ref={ref} {...props}>
            {children}
          </Box>
        );
      }

      return (
        <Box component={component} sx={mergedStyles} ref={ref} {...props}>
          {children}
        </Box>
      );
    });

    StyledComponent.displayName = `Styled(${typeof component === 'string' ? component : component.displayName || 'Component'})`;

    return StyledComponent;
  };
};
