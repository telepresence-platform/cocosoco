import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { toggleMapMuting } from "../actions"

import "./MapPanel.css";

interface IProps {
  isMapEnabled: boolean,
  toggleMapMuting: any,
}

class MapPanel extends React.PureComponent<IProps> {
  render() {
    const { isMapEnabled } = this.props;
    const className = isMapEnabled ? "mappanel" : "mappanel--disabled";

    return (
      <div className={className}>
        MAP
      </div>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    isMapEnabled: store.state.isMapEnabled,
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<TStore, void, AnyAction>) => ({
  toggleMapMuting: () => {
    dispatch(toggleMapMuting());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MapPanel);
