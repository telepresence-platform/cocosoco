import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { reducer, IState } from "./reducer";

export type TStore = {
  state: IState;
};

export const store = createStore(
  combineReducers<TStore>({
    state: reducer,
  }),
  {},
  applyMiddleware(thunk)
);
