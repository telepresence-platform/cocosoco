import React from "react";
import GoogleMapReact from 'google-map-react';
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { toggleMapMuting } from "../actions"
import { InitializeMap } from "../actions"

import "./MapPanel.css";

interface IProps {
  mapkey: string,
  lat: number,
  lng: number,
  defaultZoom: number,
  isMapEnabled: boolean,
}

class MapPanel extends React.PureComponent<IProps> {
  render() {
    const { isMapEnabled, mapkey, lat, lng, defaultZoom } = this.props;
    const className = isMapEnabled ? "mappanel" : "mappanel--disabled";

    return (
      <div className={className}>
        <GoogleMapReact
          bootstrapURLKeys={{
            key: mapkey
          }}
          defaultCenter={{
            lat: lat,
            lng: lng
          }}
          defaultZoom={defaultZoom}>
        </GoogleMapReact>
      </div>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    isMapEnabled: store.state.isMapEnabled,
    mapkey: store.state.mapkey,
    lat: store.state.lat,
    lng: store.state.lng,
    defaultZoom: store.state.defaultZoom,
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<TStore, void, AnyAction>) => ({
  InitializeMap: (mapkey: string, lat: number, lng: number, defaultZoom: number) => {
    dispatch(InitializeMap(mapkey,lat, lng, defaultZoom));
  },
  toggleMapMuting: () => {
    dispatch(toggleMapMuting());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MapPanel);
