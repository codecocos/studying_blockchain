import { SET_MODE, SET_COLOR, GET_THEME } from "../actions/ThemeAction";

export default function (state = {}, action) {
  switch (action.type) {
    case SET_MODE:
      return {
        ...state,
        mode: action.payload,
      };
    case SET_COLOR:
      return {
        ...state,
        color: action.payload,
      };
    case GET_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    default:
      return state;
  }
};


