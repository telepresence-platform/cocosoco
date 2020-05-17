import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { participate } from "../actions"

import "./Participation.css";

interface IProps {
  participate: any
}

interface IState {
  key: string | null,
  network: string | null,
  room: string | null,
  error: string | null,
  isParticipating?: boolean,
}

class Participation extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this._onClick = this._onClick.bind(this);

    const url = new URL(document.URL);
    const key = url.searchParams.get("key");
    const network = url.searchParams.get("network");
    const room = url.searchParams.get("room");

    let error = null;
    if (!key || !network || !room) {
      error = "No specific key, network or room"
    } else if (network !== "sfu" && network !== "mesh") {
      error = "Network should be 'sfu' or 'mesh'";
    }

    this.state = { key, network, room, error };
  }

  _onClick(e: React.MouseEvent) {
    const { participate } = this.props;
    const { key, network, room } = this.state;
    this.setState({ isParticipating: true });
    participate(key, network, room);
  }

  render() {
    const { room, error, isParticipating } = this.state;

    return (
      <section className="participation">
        {
          error
            ? <label className="participation__error">{ error }</label>
            : <button
                className="participation__button"
                onClick={this._onClick}
                disabled={isParticipating}
              >
                <label>participate to </label>
                <label className="participation__room">{ room }</label>
              </button>
        }
      </section>
    );
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<TStore, void, AnyAction>) => ({
  participate: (key: string, network: "mesh" | "sfu", room: string) => {
    dispatch(participate(key, network, room));
  },
});

export default connect(null, mapDispatchToProps)(Participation);
