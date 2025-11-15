import React, { useState, useEffect, useRef } from 'react';
import { TextField, MenuItem, Box, InputAdornment } from '@mui/material';

const COUNTRY_CODES = [
  { code: '55', country: 'Brasil', flag: '🇧🇷' },
  { code: '1', country: 'EUA/Canadá', flag: '🇺🇸' },
  { code: '52', country: 'México', flag: '🇲🇽' },
  { code: '54', country: 'Argentina', flag: '🇦🇷' },
  { code: '56', country: 'Chile', flag: '🇨🇱' },
  { code: '57', country: 'Colômbia', flag: '🇨🇴' },
  { code: '51', country: 'Peru', flag: '🇵🇪' },
  { code: '351', country: 'Portugal', flag: '🇵🇹' },
  { code: '34', country: 'Espanha', flag: '🇪🇸' },
  { code: '39', country: 'Itália', flag: '🇮🇹' },
  { code: '33', country: 'França', flag: '🇫🇷' },
  { code: '49', country: 'Alemanha', flag: '🇩🇪' },
  { code: '44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '7', country: 'Rússia', flag: '🇷🇺' },
  { code: '86', country: 'China', flag: '🇨🇳' },
  { code: '81', country: 'Japão', flag: '🇯🇵' },
  { code: '91', country: 'Índia', flag: '🇮🇳' },
  { code: '61', country: 'Austrália', flag: '🇦🇺' },
];

const PhoneInput = ({ value, onChange, label, required, fullWidth = true, margin = 'dense' }) => {
  const [countryCode, setCountryCode] = useState('55');
  const [phoneNumber, setPhoneNumber] = useState('');
  const isInternalUpdate = useRef(false);
  const lastValue = useRef('');

  // Parsear o valor inicial se vier com código do país
  useEffect(() => {
    if (value !== lastValue.current) {
      lastValue.current = value || '';
      isInternalUpdate.current = true;
      
      if (value) {
        // Tentar encontrar o código do país no início do número
        let found = false;
        // Ordenar por tamanho do código (maior primeiro) para pegar códigos compostos como 351
        const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
        
        for (const country of sortedCodes) {
          if (value.startsWith(country.code)) {
            setCountryCode(country.code);
            setPhoneNumber(value.substring(country.code.length));
            found = true;
            break;
          }
        }
        if (!found) {
          // Se não encontrar, assumir que é só o número (formato antigo) e usar 55 como padrão
          setCountryCode('55');
          setPhoneNumber(value);
        }
      } else {
        // Se não houver valor, usar 55 como padrão
        setCountryCode('55');
        setPhoneNumber('');
      }
      
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    }
  }, [value]);

  // Atualizar o valor completo quando countryCode ou phoneNumber mudarem
  useEffect(() => {
    if (!isInternalUpdate.current) {
      const fullNumber = countryCode + phoneNumber;
      if (onChange && fullNumber !== lastValue.current) {
        lastValue.current = fullNumber;
        onChange({ target: { value: fullNumber } });
      }
    }
  }, [countryCode, phoneNumber, onChange]);

  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value);
  };

  const handlePhoneNumberChange = (e) => {
    // Remover caracteres não numéricos
    const numericValue = e.target.value.replace(/\D/g, '');
    setPhoneNumber(numericValue);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <TextField
        select
        value={countryCode}
        onChange={handleCountryCodeChange}
        sx={{ 
          width: { xs: '120px', sm: '140px' },
          minWidth: '120px'
        }}
        margin={margin}
        SelectProps={{
          renderValue: (value) => {
            const country = COUNTRY_CODES.find(c => c.code === value);
            return country ? `${country.flag} +${country.code}` : `+${value}`;
          }
        }}
      >
        {COUNTRY_CODES.map((country) => (
          <MenuItem key={country.code} value={country.code}>
            {country.flag} +{country.code} {country.country}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label={label || "Número do WhatsApp"}
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder="11987654321"
        InputLabelProps={{ shrink: !!phoneNumber }}
        margin={margin}
        fullWidth={fullWidth}
        required={required}
        inputProps={{
          maxLength: 15,
        }}
        helperText={`Formato: +${countryCode} ${phoneNumber || 'XXXXXXXXXXX'}`}
      />
    </Box>
  );
};

export default PhoneInput;

