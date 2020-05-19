import React from "react";

import logo from './Pointing.png';
import "./Pointing.css";

interface IProps {
  peerId: string,
  x: number,
  y: number,
  radian: number,
}

class Pointing extends React.PureComponent<IProps> {
  render() {
    const { peerId, x, y, radian } = this.props;

    const angle = radian * 180 / Math.PI;
    const styles = {
      left: `${ x }px`,
      top: `${ y }px`,
      transform: `translate(-60%, 0%) rotate(${angle}deg) scale(${angle > 0 ? -1 : 1}, 1)`,
      transformOrigin: "60% 0%",
    };

    return (
      <mark className="pointing" style={styles}>
        <img src={logo} alt={peerId} className="pointing__image" />
      </mark>
    );
  }
}

export default Pointing;
