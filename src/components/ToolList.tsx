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

    if (!localPeer?.id) {
      return null;
    }

    const amIPresenter = presenter?.peerId === localPeer?.id;

    return amIPresenter ? (
      <ul className="tool-list tool-list--presenter">
        <ToolItem>
          <CameraSwitching />
        </ToolItem>
        <ToolItem>
          <CameraMuting />
        </ToolItem>
        <ToolItem>
          <MapMuting />
        </ToolItem>
        <ToolItem>
          <AudioMuting />
        </ToolItem>
      </ul>
    ) : (
      <ul className="tool-list">
        <ToolItem>
          <AudioMuting />
        </ToolItem>
      </ul>
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
