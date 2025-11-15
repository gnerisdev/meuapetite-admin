import Header from 'components/Header';
import Settings_OpeningHours from 'pages/Settings/Settings_OpeningHours';
import * as S from './style';

const OpeningHours = () => {
  return (
    <S.Container>
      <Header title="Horário de Funcionamento" back={-1} />
      <Settings_OpeningHours />
    </S.Container>
  );
};

export default OpeningHours;

