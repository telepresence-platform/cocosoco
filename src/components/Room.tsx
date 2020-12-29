import React from "react";

import PresenterSelecting from "./PresenterSelecting";
import AudienceList from "./AudienceList";
import MapPanel from "./MapPanel";
import Presenter from "./Presenter";
import ToolList from "./ToolList";

import "./Room.css";

class Room extends React.PureComponent {
  render() {
    return (
      <section className="room">
        <ToolList />
        <Presenter />
        <MapPanel />
        <AudienceList />
        <PresenterSelecting />
      </section>
    );
  }
}

export default Room;
