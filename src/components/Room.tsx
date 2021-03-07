import React from "react";
import { connect } from "react-redux";

import { TStore } from "../store";

import AudienceList from "./AudienceList";
import MapPanel from "./MapPanel";
import Preferences from "./Preferences";
import Presenter from "./Presenter";
import ToolList from "./ToolList";

import "./Room.css";

interface IProps {
  isPreferencesVisible: boolean;
}

class Room extends React.PureComponent<IProps> {
  render() {
    const { isPreferencesVisible } = this.props;

    return (
      <section className="room">
        <ToolList />
        <Presenter />
        <MapPanel />
        <AudienceList />
        {isPreferencesVisible ? <Preferences /> : null}
      </section>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    isPreferencesVisible: store.state.isPreferencesVisible,
  };
};

export default connect(mapStateToProps)(Room);
