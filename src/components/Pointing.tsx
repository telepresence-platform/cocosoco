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
    const iconStyles = {
      transform: `scale(${angle > 0 ? -1 : 1}, 1) rotate(${-angle}deg)`,
      transformOrigin: "50%",
    };

    return (
      <mark className="pointing" style={styles}>
        <img className="pointing__image" src={logo} alt={audience.peerId} />
        <div className="pointing__audience">
          <img
            className="pointing__audience__icon"
            style={iconStyles}
            src={audience.dataURL}
          />
        </div>
      </mark>
    );
  }
}

export default Pointing;
