import React from "react";

import { connect } from "react-redux";

import { TStore } from "../store";
import { Member } from "../types";

import "./AudienceNumbers.css";

interface IProps {
  audiences: Member[];
}

class AudienceNumbers extends React.PureComponent<IProps> {
  render() {
    const { audiences } = this.props;

    return <div className="audience-number">{audiences.length}</div>;
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    audiences: store.state.audiences,
  };
};

export default connect(mapStateToProps)(AudienceNumbers);
