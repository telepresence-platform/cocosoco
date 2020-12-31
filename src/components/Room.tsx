import React from "react";
import { connect } from "react-redux";

import AudienceList from "./AudienceList";
import Gallery from "./Gallery";
import GallerySelecting from "./GallerySelecting";
import MapPanel from "./MapPanel";
import Presenter from "./Presenter";
import ToolList from "./ToolList";

import { TStore } from "../store";
import { Member } from "../types";

import "./Room.css";

interface IProps {
  presenter?: Member;
}

class Room extends React.PureComponent<IProps> {
  render() {
    const { presenter } = this.props;

    return (
      <section className="room">
        <ToolList />
        {presenter ? <Presenter /> : <Gallery />}
        <MapPanel />
        <GallerySelecting />
        <AudienceList />
      </section>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    presenter: store.state.presenter,
  };
};

export default connect(mapStateToProps)(Room);
