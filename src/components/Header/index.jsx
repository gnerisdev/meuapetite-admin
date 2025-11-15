import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { NavigateBeforeIcon } from 'components/icons';
import * as S from './style';

const Header = (props) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof props.back === 'function') {
      props.back();
    } else if (props.back !== undefined) {
      navigate(props.back);
    }
  };

  return (
    <S.Header>
      {!props.children ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {props.back && <S.BtnBack className="fa-solid fa-angle-left" onClick={handleBack} />}
            <Typography variant="h1">{props.title}</Typography>
          </Box>

          {props?.buttonText && (
            <Button
              variant="contained"
              onClick={props.buttonClick}
              disabled={props.buttonDisabled || false}
            >
              {props.buttonText}
            </Button>
          )}
        </>
      ) : (
        props.children
      )}
    </S.Header>
  );
};

export default Header;
