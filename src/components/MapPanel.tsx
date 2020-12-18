import React from "react";
import GoogleMapReact from "google-map-react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { toggleMapMuting } from "../actions";
import { InitializeMap } from "../actions";
import { Map } from "../types";

import pinImage from "./pin_leg.png";
import "./MapPanel.css";

interface IProps {
  map?: Map;
  isMapEnabled: boolean;
  isPresenterMapEnabled: boolean;
}
const AnyReactComponent = ({ pinImage }: any) => {
  return <img src={pinImage} alt="current position" />;
};
class MapPanel extends React.PureComponent<IProps> {
  render() {
    const { isPresenterMapEnabled, map } = this.props;
    const className = isPresenterMapEnabled ? "mappanel" : "mappanel--disabled";

    if (!map) {
      return null;
    }

    return (
      <div className={className}>
        <GoogleMapReact
          bootstrapURLKeys={{
            key: map.key,
          }}
          center={{
            lat: map.lat,
            lng: map.lng,
          }}
          defaultZoom={map.defaultZoom}
        >
          <AnyReactComponent lat={map.lat} lng={map.lng} pinImage={pinImage} />
        </GoogleMapReact>
      </div>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    isMapEnabled: store.state.isMapEnabled,
    isPresenterMapEnabled: store.state.isPresenterMapEnabled,
    map: store.state.map,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  InitializeMap: (key: string) => {
    dispatch(InitializeMap(key));
  },
  toggleMapMuting: () => {
    dispatch(toggleMapMuting());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MapPanel);
