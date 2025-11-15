import { createTheme } from '@mui/material';

export class ApplicationUtils {
  static getStatusColor(status) {
    switch (status) {
      case 'OrderReceived':
        return '#2196F3';
      case 'Processing':
        return '#00BCD4';
      case 'WaitingForPaymentConfirmation':
        return '#FFC107';
      case 'Shipped':
        return '#4CAF50';
      case 'Concluded':
        return '#4CAF50';
      case 'Cancelled':
        return '#FF3D00';
      case 'WaitingForPickup':
        return '#00BCD4';
      default:
        return '#808080';
    }
  }

  static formatPrice(price) {
    if (!price) return;

    return (
      price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ||
      'R$ 0,00'
    );
  }

  static formatDate(dateString, includeTime = true, includeYear = true) {
    const date = new Date(dateString);
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hour = '',
      minutes = '',
      seconds = '';

    if (includeTime) {
      hour = String(date.getHours()).padStart(2, '0');
      minutes = String(date.getMinutes()).padStart(2, '0');
      seconds = String(date.getSeconds()).padStart(2, '0');
    }

    const formattedDate =
      `${day}/${month}${includeYear ? '/' + year : ''}` +
      (includeTime ? ` ${hour}:${minutes}:${seconds}` : '');
    return formattedDate;
  }

  static createCustomTheme(primary, secondary, mode) {
    return createTheme({
      palette: {
        mode: mode,
        primary: { main: primary|| '#800080' },
        secondary: { main: secondary || '#CD5C5C' },
      },
      typography: { fontFamily: 'Roboto, sans-serif' },
      spacing: (factor) => `${0.5 * factor}rem`,
    });
  }

  static convertHexToRgba(hex, alpha) {
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const clampedAlpha = Math.min(1, Math.max(0, alpha));
    const rgba = `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
    return rgba;
  }
}
