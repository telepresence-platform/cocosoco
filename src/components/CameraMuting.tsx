import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { toggleCameraMuting } from "../actions";

import logoEnabled from "./CameraMuting.svg";
import logoDisabled from "./CameraMutingDisabled.svg";
import "./CameraMuting.css";

interface IProps {
  isCameraEnabled: boolean;
  toggleCameraMuting: any;
}

class CameraMuting extends React.PureComponent<IProps> {
  render() {
    const { isCameraEnabled } = this.props;
    const logo = isCameraEnabled ? logoEnabled : logoDisabled;

    return (
      <button onClick={this.props.toggleCameraMuting} className="camera-muting">
        <img
          src={logo}
          alt="mute/unmute camera"
          className="camera-muting__image"
        />
      </button>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    isCameraEnabled: store.state.isCameraEnabled,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  toggleCameraMuting: () => {
    dispatch(toggleCameraMuting());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(CameraMuting);
