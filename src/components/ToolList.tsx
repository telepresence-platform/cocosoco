import React from "react";

import AudioMuting from "./AudioMuting";
import CameraMuting from "./CameraMuting";
import CameraSwitching from "./CameraSwitching";
import ToolItem from "./ToolItem";

import "./ToolList.css";

class ToolList extends React.PureComponent {
  render() {
    return (
      <ul className="tool-list">
        <ToolItem>
          <CameraSwitching />
        </ToolItem>
        <ToolItem>
          <CameraMuting />
        </ToolItem>
        <ToolItem>
          <AudioMuting />
        </ToolItem>
      </ul>
    );
  }
}

export default ToolList;