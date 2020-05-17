import React from "react";

import "./ToolItem.css";

class ToolItem extends React.PureComponent {
  render() {
    const { children } = this.props;

    return (
      <li className="tool-item">
        { children }
      </li>
    );
  }
}

export default ToolItem;
