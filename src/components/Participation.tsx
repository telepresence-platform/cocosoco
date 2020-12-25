import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { nextVideoStream } from "../lib/video";
import { TStore } from "../store";
import { participate } from "../actions";

import logo from "./Pointing.png";
import "./Participation.css";

interface IProps {
  participate: any;
}

interface IState {
  key: string | null;
  mapkey: string | null;
  network: string | null;
  room: string | null;
  error: string | null;
  isParticipating?: boolean;
  localStream?: MediaStream;
}

const ICON_SIZE = 110;

class Participation extends React.PureComponent<IProps, IState> {
  private _videoRef = React.createRef<HTMLVideoElement | any>();
  private _canvasRef = React.createRef<HTMLCanvasElement | any>();

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

  _updateVideo() {
    const video = this._videoRef.current;
    if (!video) {
      return;
    }

    video.srcObject = this.state.localStream;
    video.playsInline = true;
    video.play();
  }

  _onClick() {
    const { participate } = this.props;
    const { key, mapkey, network, room, localStream } = this.state;

    const video = this._videoRef.current;
    const canvas = this._canvasRef.current;

    const context = canvas.getContext("2d");

    let sWidth;
    let sHeight;
    let sX;
    let sY;

    if (video.videoWidth <= video.videoHeight) {
      sX = 0;
      sY = (video.videoHeight - video.videoWidth) / 2;
      sWidth = video.videoWidth;
      sHeight = video.videoWidth;
    } else {
      sX = (video.videoWidth - video.videoHeight) / 2;
      sY = 0;
      sWidth = video.videoHeight;
      sHeight = video.videoHeight;
    }

    context?.drawImage(
      video,
      sX,
      sY,
      sWidth,
      sHeight,
      0,
      0,
      ICON_SIZE,
      ICON_SIZE
    );
    const dataURL = canvas.toDataURL();

    this.setState({ isParticipating: true });
    participate(key, mapkey, network, room, dataURL, localStream);
  }

  async componentDidMount(): Promise<void> {
    const localStream = await nextVideoStream();
    this.setState({ localStream });
  }

  componentDidUpdate() {
    this._updateVideo();
  }

  render() {
    const { room, error, isParticipating } = this.state;

    return (
      <section className="participation">
        <img className="participation__pointing-image" src={logo} />
        <div className="participation__capture">
          <video
            className="participation__video"
            muted={true}
            ref={this._videoRef}
          />
          <canvas
            ref={this._canvasRef}
            width={ICON_SIZE}
            height={ICON_SIZE}
          ></canvas>
        </div>
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
  participate: (
    key: string,
    mapkey: string,
    network: "mesh" | "sfu",
    room: string,
    dataURL: string,
    localStream: MediaStream
  ) => {
    dispatch(participate(key, mapkey, network, room, dataURL, localStream));
  },
});

export default connect(null, mapDispatchToProps)(Participation);
