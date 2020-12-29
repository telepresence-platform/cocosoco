import React from "react";
import { connect } from "react-redux";

import GalleryItem from "./GalleryItem";

import { TStore } from "../store";
import { Member } from "../types";

import "./Gallery.css";

interface IProps {
  audiences: Member[];
}

class Gallery extends React.PureComponent<IProps> {
  private _containerRef = React.createRef<HTMLElement | any>();

  _update() {
    const container = this._containerRef.current;
    if (!container) {
      return;
    }

    const children = [...container.querySelectorAll(".gellery__item")];
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    let { width, height } = getGridDimension(
      children.length,
      containerWidth,
      containerHeight
    );

    if (children.length !== 1 && children.length % 2 !== 0) {
      const { width: evenWidth, height: evenHeight } = getGridDimension(
        children.length + 1,
        containerWidth,
        containerHeight
      );

      const aspect = width / height;
      const evenAspect = evenWidth / evenHeight;
      if (isMoreSquare(evenAspect, aspect)) {
        width = evenWidth;
        height = evenHeight;
      }
    }

    const gap = 4;
    for (const child of children) {
      child.style.width = `${width - gap}px`;
      child.style.height = `${height - gap}px`;
    }
  }

  componentDidMount() {
    this._update();
  }

  componentDidUpdate() {
    this._update();
  }

  render() {
    const { audiences } = this.props;

    return (
      <ul className="gallery" ref={this._containerRef}>
        {audiences.map(audience => {
          return audience.stream ? (
            <GalleryItem
              audience={audience}
              key={audience.peerId}
              className="gellery__item"
            />
          ) : null;
        })}
      </ul>
    );
  }
}

function isMoreSquare(target: number, compared: number) {
  return Math.abs(1 - target) < Math.abs(1 - compared);
}

function getGridDimension(
  gridCount: number,
  containerWidth: number,
  containerHeight: number
) {
  let width = 0;
  let height = 0;

  for (let horizontal = 1; horizontal <= gridCount; horizontal++) {
    if (gridCount % horizontal !== 0) {
      continue;
    }

    const vertical = gridCount / horizontal;
    const currentWidth = containerWidth / horizontal;
    const currentHeight = containerHeight / vertical;

    const aspect = width / height;
    const currentAspect = currentWidth / currentHeight;

    if (width === 0 || isMoreSquare(currentAspect, aspect)) {
      width = currentWidth;
      height = currentHeight;
    }
  }

  return { width, height };
}

const mapStateToProps = (store: TStore) => {
  return {
    audiences: store.state.audiences,
  };
};

export default connect(mapStateToProps)(Gallery);
