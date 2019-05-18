import React, { Component } from "react";

import "./board.css";
import { HalfDomino, Left, Right } from "./domino/halfDomino.jsx";
import { Empty, Separator } from "./game.jsx";

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
      let rows = [];
      for (let i = 0; i < this.props.dominoes.length; i++) {
          const rowID = `row${i}`;
          let cell = [];
          for (let j = 0; j < this.props.dominoes[i].length; j++ ) {
              const cellID = `${i},${j}`;
              switch (this.props.dominoes[i][j].dot) {
                  case Empty:
                      if (this.props.valid_placements.includes(i + ',' + j)) {
                          cell.push(<td className="possible_location_placeholder" key={cellID} id={cellID}/>);
                      } else {
                          cell.push(<td className="placeholder" key={cellID} id={cellID}/>);
                      }
                      break;
                  case Separator:
                      if (this.props.dominoes[i][j].direction === Left || this.props.dominoes[i][j].direction === Right) {
                          cell.push(<td key={cellID} className="separator_container" id={cellID}><div className="separator"/></td>);
                      } else {
                          cell.push(<td key={cellID} className="separator_container_vertical" id={cellID}><h5 className="separator_vertical"/></td>);
                      }
                      break;
                  default:
                      if (this.props.dominoes[i][j].direction === Left || this.props.dominoes[i][j].direction === Right) {
                          cell.push(<td key={cellID} className="cell" id={cellID}><HalfDomino value={this.props.dominoes[i][j].dot}/></td>);
                      } else {
                          cell.push(<td key={cellID} className="cell_vertical" id={cellID}><HalfDomino value={this.props.dominoes[i][j].dot}/></td>);
                      }
              }
          }
          rows.push(<tr key={i} id={rowID}>{cell}</tr>);
      }
      return(
          <div className="container">
              <table className="board">
                  <tbody>
                  {rows}
                  </tbody>
              </table>
          </div>
      )
  }
}

export default Board;