import React from "react";
import { connect } from "react-redux";
import { TStore } from "../store";

import Participation from "./Participation";
import Room from "./Room";

import "./App.css";

interface IProps {
  room: any;
}

class App extends React.PureComponent<IProps> {
  render() {
    return (
      <React.Fragment>
        {this.props.room ? <Room /> : <Participation />}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (store: TStore) => {
  return {
    room: store.state.room,
  };
};

export default connect(mapStateToProps)(App);
