import { LOGIN_USER, LOGOUT_USER, AUTH_USER } from "../actions/UserAction";

const initialState = {
  isAuth: false,
  address: "",
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGIN_USER:
      return {
        ...initialState,
        isAuth: action.payload.isAuth,
        address: action.payload.address,
      };
    case LOGOUT_USER:
      return {
        ...initialState,
        isAuth: action.payload.isAuth,
        address: action.payload.address,
      };
    case AUTH_USER:
      return {
        ...initialState,
        isAuth: action.payload.isAuth,
        address: action.payload.address,
      };
    default:
      return state;
  }
}
