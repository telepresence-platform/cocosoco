import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { selectPeer } from "../actions";

import PresenterButton from "./PresenterSelecting.svg";
import "./PresenterSelecting.css";

interface IProps {
  selectPeer: any;
  localPeer?: Peer;
}

class PresenterSelecting extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);

    this._onClick = this._onClick.bind(this);
  }

  _onClick() {
    const { localPeer, selectPeer } = this.props;
    if (!localPeer) {
      return;
    }
    selectPeer(localPeer.id);
  }
  render() {
    return (
      <button onClick={this._onClick} className="presenter-selecting">
        <img
          src={PresenterButton}
          alt="Be the presenter"
          className="presenter-selecting__image"
        />
      </button>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    localPeer: store.state.localPeer,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  selectPeer: (peerId: string) => {
    dispatch(selectPeer(peerId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PresenterSelecting);
