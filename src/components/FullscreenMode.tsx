import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { toggleFullscreenMode } from "../actions";

import logoActivate from "./FullscreenModeActivate.svg";
import logoDeactivate from "./FullscreenModeDeactivate.svg";
import "./FullscreenMode.css";

interface IProps {
  isFullscreenActive: boolean;
  toggleFullscreenMode: any;
}

class FullscreenMode extends React.PureComponent<IProps> {
  render() {
    const { isFullscreenActive } = this.props;
    const logo = isFullscreenActive ? logoDeactivate : logoActivate;

    return (
      <button
        onClick={this.props.toggleFullscreenMode}
        className="fullscreen-mode"
      >
        <img
          src={logo}
          alt="toggle fullscreen mode"
          className="fullscreen-mode__image"
        />
      </button>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    isFullscreenActive: store.state.isFullscreenActive,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  toggleFullscreenMode: () => {
    dispatch(toggleFullscreenMode());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(FullscreenMode);
