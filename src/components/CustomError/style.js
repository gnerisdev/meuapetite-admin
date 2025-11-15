import { styled } from '@mui/system';

export const FoundContainer = styled('div')`
  position: fixed;
  top: 0;
  height: 100vh;
  width: 100vw;
  background: #fff;
`;

export const FoundContent = styled('div')`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  max-width: 520px;
  width: 100%;
  text-align: center;
  line-height: 1.4;
`;

export const Found404 = styled('div')`
  height: 190px;

  h1 {
    font-family: "Montserrat", sans-serif;
    font-size: 146px;
    font-weight: 700;
    margin: 0px;
    color: #232323;

    > span {
      display: inline-block;
      width: 120px;
      height: 120px;
      background-image: url("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/mozilla/36/pensive-face_1f614.png");
      background-size: cover;
      transform: scale(1.4);
      z-index: -1;
      animation: floating 4s infinite ease-in-out;
    }
  }
`;

export const FoundTitle = styled('h2')`
  font-family: "Montserrat", sans-serif;
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  color: #232323;
`;

export const FoundText = styled('p')`
  font-family: "Montserrat", sans-serif;
  color: #787878;
  font-weight: 300;
`;

export const FoundLink = styled('a')`
  font-family: "Montserrat", sans-serif;
  display: inline-block;
  padding: 12px 30px;
  font-weight: 700;
  background-color: #f99827;
  color: #fff;
  border-radius: 40px;
  text-decoration: none;
  transition: 0.2s all;

  &:hover {
    opacity: 0.8;
  }
`;