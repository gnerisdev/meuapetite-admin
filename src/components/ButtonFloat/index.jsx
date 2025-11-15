import * as S from './style'

const ButtonFloat = (props) => {
  return (
  <S.ButtonCustom 
    variant="contained" 
    onClick={props.onClick}
    id="button-float"
    type={props.type || 'button'}
  >
    {props.text}
  </S.ButtonCustom>
  )
}

export default ButtonFloat
