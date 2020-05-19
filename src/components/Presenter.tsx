import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { Member, Pointing } from "../types";
import { setPointing } from "../actions"
import PointingComponent from "./Pointing";

import "./Presenter.css";

interface IProps {
  localPeer?: Peer,
  pointings: Pointing[],
  presenter?: Member,
  setPointing: any,
}

class Presenter extends React.PureComponent<IProps> {
  // As video.playsInline is not defined in HTMLVideoElement, add "any" as well.
  private _videoRef = React.createRef<HTMLVideoElement | any>();

  constructor(props: IProps) {
    super(props);

    this._onClick = this._onClick.bind(this);
  }

  _onClick(e: any) {
    const { target, layerX, layerY } = e;
    const { clientWidth, clientHeight } = target;
    const x = layerX / clientWidth;
    const y = layerY / clientHeight;
    this.props.setPointing(x, y);
  }

  _renderPointings() {
    const video = this._videoRef.current;
    if (!video) {
      return null;
    }

    const { pointings } = this.props;
    return pointings.map(p => {
      const peerId = p.peerId;
      const x = video.offsetLeft + video.clientWidth * p.x;
      const y = video.offsetTop + video.clientHeight * p.y;
      const radian = Math.atan2(p.x - 0.5, -(p.y - 0.5));

      return <PointingComponent key={peerId} peerId={peerId} x={x} y={y} radian={radian}/>;
    });
  }

  componentDidMount() {
    const video = this._videoRef.current;
    if (!video) {
      return;
    }

    // We can't get layerX/layerY from React mouse event.
    video.addEventListener("click", this._onClick);
  }

  componentDidUpdate(prevProps: IProps) {
    const video = this._videoRef.current;
    if (!video) {
      return;
    }

    const { localPeer, presenter } = this.props;
    if (prevProps.presenter === presenter) {
      return;
    }

    if (presenter) {
      video.muted = localPeer?.id === presenter.peerId;
      video.srcObject = presenter.stream;
      video.playsInline = true;
      video.play();
    } else {
      video.srcObject = null;
    }
  }

  render() {
    return (
      <section className="presenter">
        <video className="presenter__video" ref={this._videoRef}></video>
        { this._renderPointings() }
      </section>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    localPeer: store.state.localPeer,
    pointings: store.state.pointings,
    presenter: store.state.presenter,
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<TStore, void, AnyAction>) => ({
  setPointing: (x: number, y: number) => {
    dispatch(setPointing(x, y));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Presenter);
