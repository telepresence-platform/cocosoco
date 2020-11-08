import React from "react";

import "./ToolItem.css";

interface IProps {
  children: React.ReactNode;
}

class ToolItem extends React.PureComponent<IProps> {
  render() {
    const { children } = this.props;

    return <li className="tool-item">{children}</li>;
  }
}

export default ToolItem;
