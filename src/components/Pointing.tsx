import React from "react";

import logo from './Pointing.png';
import "./Pointing.css";

interface IProps {
  peerId: string,
  x: number,
  y: number,
}

class Pointing extends React.PureComponent<IProps> {
  render() {
    const { peerId, x, y } = this.props;

    const styles = {
      left: `${ x }px`,
      top: `${ y }px`
    };

    return (
      <mark className="pointing" style={styles}>
        <img src={logo} alt={peerId} className="pointing__image" />
      </mark>
    );
  }
}

export default Pointing;
