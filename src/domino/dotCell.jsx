import React, { Component } from "react";

import "./domino.css";

class DotCell extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  getStyle() {
    return (this.props.isDotted ? "dotted" : "empty-dot");
  }

  render() {
    return (
      <td className={this.getStyle()}></td>
    );
  }
}

DotCell.defaultProps = {
  isDotted: true,
};

export default DotCell;