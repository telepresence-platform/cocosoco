import React from "react";

import AudienceList from "./AudienceList";
import Presenter from "./Presenter";
import ToolList from "./ToolList";

import "./Room.css";

class Room extends React.PureComponent {
  render() {
    return (
      <section className="room">
        <ToolList/>
        <Presenter/>
        <AudienceList/>
      </section>
    );
  }
}

export default Room;
