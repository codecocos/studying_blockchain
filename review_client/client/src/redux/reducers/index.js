import { combineReducers } from "redux"

import ThemeReducer from "./ThemeReducer"
import UserReducer from "./UserReducer";

const rootReducer = combineReducers({
  ThemeReducer,
  UserReducer,
})

export default rootReducer