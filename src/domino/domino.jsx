import React, { Component } from "react";

import "./domino.css";
import { HalfDomino, Up, Down, Left, Right } from "./halfDomino.jsx";

class Domino extends Component {
  constructor(props) {
    super(props);
    this.state = {
      domino: this.props.domino
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if (!this.state.domino.placement) {
      let dominoCopy = JSON.parse(JSON.stringify(this.state.domino));
      switch (dominoCopy.direction) {
        case Left:
          dominoCopy.direction = Up;
          break;
        case Up:
          dominoCopy.direction = Right;
          break;
        case Right:
          dominoCopy.direction = Down;
          break;
        case Down:
          dominoCopy.direction = Left;
          break;
      }
      this.props.sendData(dominoCopy);
      this.setState({domino: dominoCopy});
    }
  }

  render() {
    const dots1 = Math.floor(this.props.domino.dot / 10);
    const dots2 = Math.floor(this.props.domino.dot % 10);
    const deg = this.state.domino.direction;
    const divStyle = {
      border: '1px solid black',
      transform: 'rotate(' + deg + 'deg)',
      borderRadius: '5px',
      width: '100%',
      height: '100%',
    };
    return (
        <div style={divStyle} onClick={this.onClick}>
          <table border="1" className="domino">
            <tbody>
              <tr>
                <td><HalfDomino value={dots1}/></td>
                <td><HalfDomino value={dots2}/></td>
              </tr>
            </tbody>
          </table>
        </div>
    );
  }
}

export { Domino };