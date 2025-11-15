import * as S from './style';

const CustomError = (props) => {
  return (
    <S.FoundContainer>
      <S.FoundContent>
        <S.Found404>
          <h1>{props.error.code}</h1>
        </S.Found404>
        <S.FoundTitle>{props.error.title}</S.FoundTitle>
        <S.FoundText>{props.error.text}</S.FoundText>
        <S.FoundLink onClick={() => props.error.buttonAction()}>{props.error.buttonText}</S.FoundLink>
      </S.FoundContent>
    </S.FoundContainer>
  );
};

export default CustomError;
