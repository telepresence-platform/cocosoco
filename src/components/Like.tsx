import React from "react";

import logo from "./Like.svg";
import "./Like.css";

interface IProps {
  x: number;
  y: number;
}

class Pointing extends React.PureComponent<IProps> {
  render() {
    const { x, y } = this.props;

    const styles = {
      left: `${x}px`,
      top: `${y}px`,
    };

    return (
      <img className="like" src={`${logo}?${Date.now()}`} style={styles} />
    );
  }
}

export default Pointing;
