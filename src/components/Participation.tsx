import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { participate } from "../actions";
import { InitializeMap } from "../actions";

import "./Participation.css";

interface IProps {
  participate: any;
  InitializeMap: any;
}

interface IState {
  key: string | null;
  mapkey: string | null;
  network: string | null;
  room: string | null;
  error: string | null;
  isParticipating?: boolean;
}

class Participation extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this._onClick = this._onClick.bind(this);

    const url = new URL(document.URL);
    const key = url.searchParams.get("key");
    const mapkey = url.searchParams.get("mapkey");
    const network = url.searchParams.get("network");
    const room = url.searchParams.get("room");

    let error = null;
    if (!key || !network || !room) {
      error = "No specific key, network or room";
    } else if (network !== "sfu" && network !== "mesh") {
      error = "Network should be 'sfu' or 'mesh'";
    } else if (!mapkey) {
      error = "No specific GoogleMapAPIkey";
    }

    this.state = { key, mapkey, network, room, error };
  }

  _onClick() {
    const { participate, InitializeMap } = this.props;
    const { key, mapkey, network, room } = this.state;
    this.setState({ isParticipating: true });
    participate(key, network, room);
    InitializeMap(mapkey);
  }

  render() {
    const { room, error, isParticipating } = this.state;

    return (
      <section className="participation">
        {error ? (
          <label className="participation__error">{error}</label>
        ) : (
          <button
            className="participation__button"
            onClick={this._onClick}
            disabled={isParticipating}
          >
            <label>participate to </label>
            <label className="participation__room">{room}</label>
          </button>
        )}
      </section>
    );
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  participate: (key: string, network: "mesh" | "sfu", room: string) => {
    dispatch(participate(key, network, room));
  },
  InitializeMap: (mapkey: string) => {
    dispatch(InitializeMap(mapkey));
  },
});

export default connect(null, mapDispatchToProps)(Participation);
