import { combineReducers } from "redux";
import { user } from "./user";
import { users } from "./users";

// To combine multiple reducers.
const Reducers = combineReducers({
  userState: user,
  usersState: users,
});

export default Reducers;
