import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { toggleAudioMuting } from "../actions";

import logoEnabled from "./AudioMuting.svg";
import logoDisabled from "./AudioMutingDisabled.svg";
import "./AudioMuting.css";

interface IProps {
  isAudioEnabled: boolean;
  toggleAudioMuting: any;
}

class AudioMuting extends React.PureComponent<IProps> {
  render() {
    const { isAudioEnabled } = this.props;
    const logo = isAudioEnabled ? logoEnabled : logoDisabled;

    return (
      <button onClick={this.props.toggleAudioMuting} className="audio-muting">
        <img
          src={logo}
          alt="mute/unmute audio"
          className="audio-muting__image"
        />
      </button>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    isAudioEnabled: store.state.isAudioEnabled,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  toggleAudioMuting: () => {
    dispatch(toggleAudioMuting());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AudioMuting);
