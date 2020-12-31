import React from "react";
import { connect } from "react-redux";

import { TStore } from "../store";
import { Member } from "../types";

import "./GalleryItem.css";

interface IProps {
  audience: Member;
  className: string;
  localPeer?: Peer;
}

class GalleryItem extends React.PureComponent<IProps> {
  private _videoRef = React.createRef<HTMLVideoElement | any>();

  _isPresenter() {
    const { localPeer, audience } = this.props;

    if (!localPeer || !audience) {
      return false;
    }

    return localPeer.id === audience.peerId;
  }

  componentDidMount() {
    const video = this._videoRef.current;
    if (!video) {
      return;
    }

    const { audience } = this.props;

    video.srcObject = audience.stream;
    video.muted = this._isPresenter();
    video.playsInline = true;
    video.play();
  }

  render() {
    const { className } = this.props;

    return (
      <li className={`${className} gellery-item`}>
        <video className="gellery-item__video" ref={this._videoRef} />
      </li>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    localPeer: store.state.localPeer,
  };
};

export default connect(mapStateToProps)(GalleryItem);
