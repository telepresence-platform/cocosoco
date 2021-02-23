import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { setPreferencesVisibility } from "../actions";

import logo from "./PreferencesVisibility.svg";
import "./PreferencesVisibility.css";

interface IProps {
  setPreferencesVisibility: any;
}

class PreferencesVisibility extends React.PureComponent<IProps> {
  render() {
    return (
      <button
        onClick={this.props.setPreferencesVisibility}
        className="preferences-visibility"
      >
        <img
          src={logo}
          alt="preferences"
          className="preferences-visibility__image"
        />
      </button>
    );
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  setPreferencesVisibility: () => {
    dispatch(setPreferencesVisibility(true));
  },
});

export default connect(null, mapDispatchToProps)(PreferencesVisibility);
