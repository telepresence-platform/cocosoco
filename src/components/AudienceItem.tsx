import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { selectPeer } from "../actions";
import { Member } from "../types";

import AudienceStream from "./AudienceStream";

import "./AudienceItem.css";

interface IProps {
  audience: Member;
  isMine: boolean;
  isSelected: boolean;
  selectPeer: any;
}

class AudienceItem extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);

    this._onClick = this._onClick.bind(this);
  }

  _onClick() {
    const { audience, selectPeer } = this.props;
    selectPeer(audience.peerId);
  }

  render() {
    const { isSelected, isMine, audience } = this.props;
    return (
      <li
        className={
          "audience-item" +
          (isMine ? " audience-item--mine" : "") +
          (isSelected
            ? " audience-item--selected"
            : " audience-item--notselected")
        }
        onClick={isMine ? this._onClick : undefined}
      >
        <img
          src={audience.dataURL}
          className={
            "audience-item__icon" + (isMine ? " audience-item__icon--mine" : "")
          }
        ></img>
        <span
          className={
            (isMine ? " audience-item__inner--mine" : " audience-item__inner") +
            (audience.isSpeaking ? " audience-item__inner--speaking" : "")
          }
        ></span>
        <AudienceStream stream={audience.stream} isMine={isMine} />
      </li>
    );
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  selectPeer: (peerId: string) => {
    dispatch(selectPeer(peerId));
  },
});

export default connect(null, mapDispatchToProps)(AudienceItem);
