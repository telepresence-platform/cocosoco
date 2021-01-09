import React from "react";

import { connect } from "react-redux";

import { TStore } from "../store";
import { Member } from "../types";

import AudienceNumbers from "./AudienceNumbers";

import "./PresenterIcon.css";

interface IProps {
  audiences: Member[];
  presenter?: Member;
}

class PresenterIcon extends React.PureComponent<IProps> {
  render() {
    const { audiences, presenter } = this.props;
    const index = audiences.findIndex(a => a.peerId === presenter?.peerId);
    const className =
      "presenter-item " + (presenter ? "" : "presenter-item--no-presenter");
    return (
      <>
        <span className={className}>
          {presenter ? (
            <img
              src={audiences[index].dataURL}
              className="presenter-item__icon"
            ></img>
          ) : null}
        </span>
        <AudienceNumbers />
      </>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    audiences: store.state.audiences,
    presenter: store.state.presenter,
  };
};

export default connect(mapStateToProps)(PresenterIcon);
