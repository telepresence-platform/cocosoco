import React from "react";

import "./AudienceStream.css";

interface IProps {
  stream?: any;
  isMine: boolean;
}

class AudienceStream extends React.PureComponent<IProps> {
  // As video.playsInline is not defined in HTMLVideoElement, add "any" as well.
  private _videoRef = React.createRef<HTMLVideoElement | any>();

  _updateVideo() {
    const video = this._videoRef.current;
    if (!video) {
      return;
    }

    const { stream } = this.props;
    video.srcObject = stream;
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
    const { isMine } = this.props;
    return (
      <video className="audience-stream" muted={isMine} ref={this._videoRef} />
    );
  }
}

export default AudienceStream;
