import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { TStore } from "../store";
import { Like, Member, Pointing, Transform } from "../types";
import { setLike, setPointing, setTransform } from "../actions";
import LikeComponent from "./Like";
import PointingComponent from "./Pointing";

import "./Presenter.css";

interface IProps {
  likes: Like[];
  localPeer?: Peer;
  pointings: Pointing[];
  presenter?: Member;
  transform: Transform;
  setLike: any;
  setPointing: any;
  setTransform: any;
}

class Presenter extends React.PureComponent<IProps> {
  // As video.playsInline is not defined in HTMLVideoElement, add "any" as well.
  private _videoRef = React.createRef<HTMLVideoElement | any>();

  private _isLikeAction = false;
  private _panStopTimer = 0;
  private _pointingTimer = 0;

  constructor(props: IProps) {
    super(props);

    this._onPanningStop = this._onPanningStop.bind(this);
    this._onPointingDown = this._onPointingDown.bind(this);
    this._onPointingUp = this._onPointingUp.bind(this);
    this._onZoomChange = this._onZoomChange.bind(this);
  }

  _amIPresenter() {
    const { localPeer, presenter } = this.props;

    if (!localPeer || !presenter) {
      return false;
    }

    return localPeer.id === presenter.peerId;
  }

  _getVideoArea() {
    const video = this._videoRef.current;
    return video?.closest(".react-transform-component");
  }

  _isMobile() {
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      navigator.userAgent.toLowerCase()
    );
  }

  /**
   * NOTE: This function is for following issue.
   * After fixing following issue, need to address for it.
   * https://github.com/prc5/react-zoom-pan-pinch/issues/89
   */
  _onPanningStop() {
    this._panStopTimer = window.setTimeout(() => {
      const video = this._videoRef.current;
      if (!video) {
        return;
      }

      const transformElement = video.closest(".react-transform-element");
      const transform = transformElement.style.transform.match(
        /translate\((.*)\) scale\((.*)\)/
      );
      const translate = transform[1];
      const translateMatch = translate.match(/(.*), (.*)/);
      const positionX = parseFloat(
        translateMatch ? translateMatch[1] : translate
      );
      const positionY = parseFloat(
        translateMatch && translateMatch.length === 3 ? translateMatch[2] : 0
      );
      const scale = parseFloat(transform[2]);
      this._onZoomChange({ positionX, positionY, scale });
    }, 500);
  }

  _getPositionOnLayer(e: any) {
    if (e.type.startsWith("mouse")) {
      return { layerX: e.layerX, layerY: e.layerY };
    }

    // Touch event.
    const touch = e.changedTouches[0];
    let element = touch.target;
    let layerX = 0;
    let layerY = 0;

    while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
      layerX += element.offsetLeft - element.scrollLeft;
      layerY += element.offsetTop - element.scrollTop;
      element = element.offsetParent;
    }

    layerX = touch.clientX - layerX;
    layerY = touch.clientY - layerY;

    return { layerX, layerY };
  }

  _onPointingAction(e: any, actionFunction: Function) {
    const { layerX, layerY } = this._getPositionOnLayer(e);
    const { clientWidth, clientHeight } = e.target;
    const x = layerX / clientWidth;
    const y = layerY / clientHeight;
    actionFunction(x, y);
  }

  _onPointingDown(e: any) {
    window.clearTimeout(this._pointingTimer);

    this._pointingTimer = window.setTimeout(() => {
      this._isLikeAction = true;

      if (e.type === "mousedown") {
        // In desktop, as we can see the LIKE animation behind the cursor, accept here.
        this._onPointingAction(e, this.props.setLike);
      }
    }, 500);
  }

  _onPointingUp(e: any) {
    window.clearTimeout(this._pointingTimer);

    if (!this._isLikeAction) {
      this._onPointingAction(e, this.props.setPointing);
    } else if (e.type === "touchend") {
      // In mobile, as the LIKE animation will be hidden behind our finger, accept here.
      this._onPointingAction(e, this.props.setLike);
    }

    this._isLikeAction = false;
  }

  _onZoomChange(e: any) {
    window.clearTimeout(this._panStopTimer);

    const area = this._getVideoArea();
    const { positionX, positionY, scale } = e;
    const { clientWidth, clientHeight } = area;
    const x = positionX / clientWidth;
    const y = positionY / clientHeight;
    this.props.setTransform(x, y, scale);
  }

  _renderLikes() {
    const area = this._getVideoArea();
    if (!area) {
      return null;
    }

    const { likes } = this.props;
    return likes.map(p => {
      const id = p.id;
      const x = area.offsetLeft + area.clientWidth * p.x;
      const y = area.offsetTop + area.clientHeight * p.y;

      return <LikeComponent key={id} x={x} y={y} />;
    });
  }

  _renderPointings() {
    const area = this._getVideoArea();
    if (!area) {
      return null;
    }

    const { pointings } = this.props;
    return pointings.map(p => {
      const audience = p.audience;
      const x = area.offsetLeft + area.clientWidth * p.x;
      const y = area.offsetTop + area.clientHeight * p.y;
      const radian = Math.atan2(p.x - 0.5, -(p.y - 0.5));

      return (
        <PointingComponent
          key={audience.peerId}
          audience={audience}
          x={x}
          y={y}
          radian={radian}
        />
      );
    });
  }

  componentDidMount() {
    const area = this._getVideoArea();
    if (!area) {
      return null;
    }

    // We can't get layerX/layerY from React mouse event.
    area.addEventListener("mousedown", this._onPointingDown);
    area.addEventListener("mouseup", this._onPointingUp);
    area.addEventListener("touchstart", this._onPointingDown);
    area.addEventListener("touchend", this._onPointingUp);
  }

  componentDidUpdate(prevProps: IProps) {
    const video = this._videoRef.current;
    if (!video) {
      return;
    }

    const { presenter } = this.props;
    if (prevProps.presenter === presenter) {
      return;
    }

    if (presenter) {
      video.muted = this._amIPresenter();
      video.srcObject = presenter.stream;
      video.playsInline = true;
      video.play();
    } else {
      video.srcObject = null;
    }
  }

  render() {
    const area = this._getVideoArea();

    const settings =
      this._amIPresenter() && this._isMobile()
        ? {
            onPanningStop: this._onPanningStop,
            onZoomChange: this._onZoomChange,
            pan: {
              disabled: false,
            },
          }
        : {
            positionX: area?.clientWidth * this.props.transform.x,
            positionY: area?.clientHeight * this.props.transform.y,
            scale: this.props.transform.scale,
            pan: {
              disabled: true,
            },
          };

    return (
      <section className="presenter">
        <TransformWrapper
          onPanning={settings.onZoomChange}
          onPanningStop={settings.onPanningStop}
          onZoomChange={settings.onZoomChange}
          positionX={settings.positionX}
          positionY={settings.positionY}
          scale={settings.scale}
          pan={settings.pan}
          doubleClick={{ disabled: true }}
        >
          <TransformComponent>
            <video className="presenter__video" ref={this._videoRef}></video>
          </TransformComponent>
        </TransformWrapper>
        {this._renderLikes()}
        {this._renderPointings()}
      </section>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    likes: store.state.likes,
    localPeer: store.state.localPeer,
    pointings: store.state.pointings,
    presenter: store.state.presenter,
    transform: store.state.transform,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  setLike: (x: number, y: number) => {
    dispatch(setLike(x, y));
  },
  setPointing: (x: number, y: number) => {
    dispatch(setPointing(x, y));
  },
  setTransform: (x: number, y: number, scale: number) => {
    dispatch(setTransform(x, y, scale));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Presenter);
