import React, { Component } from "react";

import './playerDeck.css';
import { Domino } from "./domino/domino.jsx"

class PlayerDeck extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.getData = this.getData.bind(this);
  }

  getData(val) {
    this.props.sendData(val);
  }

  onDragStart(ev, id) {
    ev.dataTransfer.setData("id", id);
    this.props.sendDrag(null);
  }

  onDrag(ev, id) {
    this.props.sendDrag(id);
  }

  onDragEnd() {
    this.props.sendDrag(null);
  }

  getDominoes() {
    return (
      this.props.dominoes.map((domino) => (
        <td key={domino} onDragEnd={() => this.onDragEnd()} onDrag={(e) => this.onDrag(e, domino)} onDragStart={(e) => this.onDragStart(e, domino)} draggable>
          <Domino sendData={this.getData} sendDrag={this.onDrag} domino={this.props.allDominoes[domino]}/>
        </td>
      ))
    );
  }

  getDeck() {
    return (
      <div className="player-deck">
        <table>
          <tbody>
            <tr>
              {this.getDominoes()}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    return (this.getDeck());
  }
}

export default PlayerDeck;