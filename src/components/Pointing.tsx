import React from "react";

import logo from "./Pointing.png";
import "./Pointing.css";
import { Member } from "../types";

interface IProps {
  audience: Member;
  x: number;
  y: number;
  radian: number;
}

class Pointing extends React.PureComponent<IProps> {
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
    const { audience, x, y, radian } = this.props;

    const angle = (radian * 180) / Math.PI;
    const scale = angle > 0 ? -1 : 1;
    const styles = {
      left: `${x}px`,
      top: `${y}px`,
      transform: `translate(-60%, 0%) rotate(${angle}deg) scale(${scale}, 1)`,
      transformOrigin: "60% 0%",
    };

    const videoStyles = {
      transform: `scale(${angle > 0 ? -1 : 1}, 1) rotate(${-angle}deg)`,
      transformOrigin: "50%",
    };

    return (
      <mark className="pointing" style={styles}>
        <img className="pointing__image" src={logo} alt={audience.peerId} />
        <div className="pointing__audience">
          <video
            className="pointing__audience__video"
            style={videoStyles}
            muted={true}
            ref={this._videoRef}
          ></video>
        </div>
      </mark>
    );
  }
}

export default Pointing;
