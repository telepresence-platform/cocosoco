import React from "react";
import GoogleMapReact from "google-map-react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { toggleMapMuting } from "../actions";
import { InitializeMap } from "../actions";
import { Map } from "../types";

import "./MapPanel.css";

interface IProps {
  map?: Map;
  isMapEnabled: boolean;
}

class MapPanel extends React.PureComponent<IProps> {
  render() {
    const { isMapEnabled, map } = this.props;
    const className = isMapEnabled ? "mappanel" : "mappanel--disabled";

    if (!map) {
      return null;
    }

    return (
      <div className={className}>
        <GoogleMapReact
          bootstrapURLKeys={{
            key: map.key,
          }}
          defaultCenter={{
            lat: map.lat,
            lng: map.lng,
          }}
          defaultZoom={map.defaultZoom}
        />
      </div>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    isMapEnabled: store.state.isMapEnabled,
    map: store.state.map,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  InitializeMap: (
    key: string,
    lat: number,
    lng: number,
    defaultZoom: number
  ) => {
    dispatch(InitializeMap(key, lat, lng, defaultZoom));
  },
  toggleMapMuting: () => {
    dispatch(toggleMapMuting());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MapPanel);
