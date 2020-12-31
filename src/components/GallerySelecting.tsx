import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { TStore } from "../store";
import { selectPeer } from "../actions";

import logo from "./GallerySelecting.svg";
import "./GallerySelecting.css";

interface IProps {
  selectPeer: any;
}

class GallerySelecting extends React.PureComponent<IProps> {
  render() {
    return (
      <button onClick={this.props.selectPeer} className="gallery-button">
        <img
          src={logo}
          alt="enable gallery view"
          className="gallery-button__image"
        />
      </button>
    );
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<TStore, void, AnyAction>
) => ({
  selectPeer: () => {
    dispatch(selectPeer(""));
  },
});

export default connect(null, mapDispatchToProps)(GallerySelecting);
