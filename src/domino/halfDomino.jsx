import React, { Component } from "react";

import "./domino.css";
import DotCell from "./dotCell.jsx";

export const Left = 0;
export const Up = 90;
export const Right = 180;
export const Down = 270;

const valueToDottedCells = {
  0: [],
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

class HalfDomino extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  static isCellDotted(index, value) {
    return (valueToDottedCells[value].includes(index));
  }

  getTable() {
    return (
      <table className="half_domino">
        <tbody>
          <tr>
            <DotCell isDotted={HalfDomino.isCellDotted(0, this.props.value)} />
            <DotCell isDotted={HalfDomino.isCellDotted(1, this.props.value)} />
            <DotCell isDotted={HalfDomino.isCellDotted(2, this.props.value)} />
          </tr>
          <tr>
            <DotCell isDotted={HalfDomino.isCellDotted(3, this.props.value)} />
            <DotCell isDotted={HalfDomino.isCellDotted(4, this.props.value)} />
            <DotCell isDotted={HalfDomino.isCellDotted(5, this.props.value)} />
          </tr>
          <tr>
            <DotCell isDotted={HalfDomino.isCellDotted(6, this.props.value)} />
            <DotCell isDotted={HalfDomino.isCellDotted(7, this.props.value)} />
            <DotCell isDotted={HalfDomino.isCellDotted(8, this.props.value)} />
          </tr>
        </tbody>
      </table>
    );
  }

  render() {
    return (this.getTable());
  }
}

export { HalfDomino };