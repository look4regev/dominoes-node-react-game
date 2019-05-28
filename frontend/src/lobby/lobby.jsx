import React, { Component } from "react";

import "./lobby.css";
import {Domino} from "../game/domino/domino";

class Lobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            games: {},
            players: []
        };
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            fetch('/users', {
                method: 'get'
            }).then(response => response.json())
            .then(data => {
                this.setState({players: data});
            });
            fetch('/games', {
                method: 'get'
            }).then(response => response.json())
            .then(data => {
                this.setState({games: data});
            });
        }, 2000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <div className="lobby">
                <h1>Lobby</h1>
                <div className="players">
                    <h2>Players</h2>
                    <ul>
                        {this.state.players.map((player) => (
                            <li key={player}>{player}</li>
                        ))}
                    </ul>
                </div>
                <div className="games">
                    <h2>Games</h2>
                    <ul>
                        {Object.keys(this.state.games).map((game) => (
                            <li key={game}>{game}</li>
                        ))}
                    </ul>
                </div>
            </div >
        );
    }
}

export default Lobby;