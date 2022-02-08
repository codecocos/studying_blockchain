// 액션 타입 정의 및 액션함수

export const SET_MODE = "SET_MODE";
export const SET_COLOR = "SET_COLOR";
export const GET_THEME = "GET_THEME";

const setMode = (mode) => {
  return {
    type: SET_MODE,
    payload: mode,
  };
};

const setColor = (color) => {
  return {
    type: SET_COLOR,
    payload: color,
  };
};

const getTheme = () => {
  return {
    type: GET_THEME,
  };
};

const exportDefault = {
  setColor,
  setMode,
  getTheme,
};

export default exportDefault;

