import React from "react";

import PresenterSelecting from "./PresenterSelecting";
import PresenterIcon from "./PresenterIcon";
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
        <div className="room__viewtoollist">
          <PresenterIcon />
          <PresenterSelecting />
        </div>
        <AudienceList />
      </section>
    );
  }
}

export default Room;
