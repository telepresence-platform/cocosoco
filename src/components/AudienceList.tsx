import React from "react";
import { connect } from "react-redux";

import { TStore } from "../store";
import { Member } from "../types";

import AudienceItem from "./AudienceItem";

import "./AudienceList.css";

interface IProps {
  audiences: Member[];
  localPeer?: Peer;
  presenter?: Member;
}

class AudienceList extends React.PureComponent<IProps> {
  render() {
    const { audiences, localPeer, presenter } = this.props;

    return (
      <ul className="audience-list">
        {audiences.map(audience => (
          <AudienceItem
            key={audience.peerId}
            audience={audience}
            isMuted={audience.peerId === localPeer?.id}
            isSelected={audience.peerId === presenter?.peerId}
          />
        ))}
      </ul>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    audiences: store.state.audiences,
    localPeer: store.state.localPeer,
    presenter: store.state.presenter,
  };
};

export default connect(mapStateToProps)(AudienceList);
