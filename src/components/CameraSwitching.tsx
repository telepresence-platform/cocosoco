import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { switchCamera } from "../actions";

import logo from "./CameraSwitching.svg";
import "./CameraSwitching.css";

interface IProps {
  switchCamera: any;
}

class CameraSwitching extends React.PureComponent<IProps> {
  render() {
    return (
      <button onClick={this.props.switchCamera} className="camera-switching">
        <img
          src={logo}
          alt="switch camera"
          className="camera-switching__image"
        />
      </button>
    );
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  switchCamera: () => {
    dispatch(switchCamera());
  },
});

export default connect(null, mapDispatchToProps)(CameraSwitching);
