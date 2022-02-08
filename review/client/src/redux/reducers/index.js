import { combineReducers } from "redux";

import UserReducer from "./UserReducer";
import ThemeReducer from "./ThemeReducer";

const rootReducer = combineReducers({
  UserReducer,
  ThemeReducer,
});

export default rootReducer;
