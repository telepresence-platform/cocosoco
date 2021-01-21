import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { selectPeer } from "../actions";
import { Member } from "../types";

import "./AudienceItem.css";

interface IProps {
  audience: Member;
  isMuted: boolean;
  isSelected: boolean;
  selectPeer: any;
}

class AudienceItem extends React.PureComponent<IProps> {
  // As video.playsInline is not defined in HTMLVideoElement, add "any" as well.
  private _videoRef = React.createRef<HTMLVideoElement | any>();

  constructor(props: IProps) {
    super(props);

    this._onClick = this._onClick.bind(this);
  }

  _onClick() {
    const { audience, selectPeer } = this.props;
    selectPeer(audience.peerId);
  }

  _updateVideo() {
    const video = this._videoRef.current;
    if (!video) {
      return;
    }

    const { audience } = this.props;
    video.srcObject = audience.stream;
    video.playsInline = true;
    video.play();
  }

  componentDidMount() {
    this._updateVideo();
  }

  componentDidUpdate() {
    this._updateVideo();
  }

  render() {
    const { isSelected, isMuted, audience } = this.props;
    return (
      <li
        className={
          "audience-item" +
          (isSelected ? " audience-item--selected" : "") +
          (isMuted ? " audience-item--mine" : "")
        }
        onClick={this._onClick}
      >
        <img
          src={audience.dataURL}
          className={
            "audience-item__icon" +
            (isMuted ? " audience-item__icon--mine" : "")
          }
        ></img>
        <video
          className="audience-item__video"
          muted={isMuted}
          ref={this._videoRef}
        />
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
