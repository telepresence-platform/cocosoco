import React from "react";

import { Member } from "../types";

import "./AudienceItem.css";

interface IProps {
  audience: Member;
  isMuted: boolean;
  isSelected: boolean;
}

class AudienceItem extends React.PureComponent<IProps> {
  // As video.playsInline is not defined in HTMLVideoElement, add "any" as well.
  private _videoRef = React.createRef<HTMLVideoElement | any>();

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
          "audience-item " + (isSelected ? "audience-item--selected" : "")
        }
      >
        <img src={audience.dataURL} className="audience-item__icon"></img>
        <video
          className="audience-item__video"
          muted={isMuted}
          ref={this._videoRef}
        />
      </li>
    );
  }
}

export default AudienceItem;
