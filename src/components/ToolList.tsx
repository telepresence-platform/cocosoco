import React from "react";
import { connect } from "react-redux";

import { TStore } from "../store";
import AudioMuting from "./AudioMuting";
import CameraMuting from "./CameraMuting";
import MapMuting from "./MapMuting";
import CameraSwitching from "./CameraSwitching";
import ToolItem from "./ToolItem";

import { Member } from "../types";
import "./ToolList.css";

interface IProps {
  presenter?: Member;
  localPeer?: Peer;
}

class ToolList extends React.PureComponent<IProps> {
  render() {
    const { presenter, localPeer } = this.props;
    let amIPresenter;

    if (!localPeer?.id) {
      return null;
    }

    if (presenter?.peerId === localPeer?.id) {
      amIPresenter = true;
    } else {
      amIPresenter = null;
    }

    console.log(presenter?.peerId);
    console.log(localPeer?.id);
    console.log(amIPresenter);

    return (
      <div>
        {amIPresenter ? (
          <ul className="tool-list">
            <ToolItem>
              <CameraSwitching />
            </ToolItem>
            <ToolItem>
              <MapMuting />
            </ToolItem>
            <ToolItem>
              <CameraMuting />
            </ToolItem>
            <ToolItem>
              <AudioMuting />
            </ToolItem>
          </ul>
        ) : (
          <ul className="tool-list">
            <ToolItem>
              <MapMuting />
            </ToolItem>
            <ToolItem>
              <CameraMuting />
            </ToolItem>
          </ul>
        )}
      </div>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    presenter: store.state.presenter,
    localPeer: store.state.localPeer,
  };
};

export default connect(mapStateToProps)(ToolList);
