import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { toggleMapMuting } from "../actions";

import logoEnabled from "./MapMuting.svg";
import logoDisabled from "./MapMutingDisabled.svg";
import "./MapMuting.css";

interface IProps {
  isMapEnabled: boolean;
  toggleMapMuting: any;
}

class MapMuting extends React.PureComponent<IProps> {
  render() {
    const { isMapEnabled } = this.props;
    const logo = isMapEnabled ? logoEnabled : logoDisabled;

    return (
      <button onClick={this.props.toggleMapMuting} className="map-muting">
        <img src={logo} alt="mute/unmute map" className="map-muting__image" />
      </button>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    isMapEnabled: store.state.isMapEnabled,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  toggleMapMuting: () => {
    dispatch(toggleMapMuting());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MapMuting);
