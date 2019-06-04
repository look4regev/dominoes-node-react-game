import React, { Component } from "react";
import SignUp from "./signup/signup.jsx";
import Lobby from "./lobby/lobby.jsx";
import Game from "./game/game";

class Dominoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSignedUp: false,
            games: {},
            players: [],
            activeGame: '',
            username: '',
        };
        this.getData = this.getData.bind(this);
        this.getGameData = this.getGameData.bind(this);
    }

    componentDidMount() {
        setInterval(() => {
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

    getData(username) {
        this.setState({isSignedUp: true, username: username});
    }

    getGameData(gamename) {
        this.setState({activeGame: gamename});
    }

    render() {
        return (
            <div>
                {!this.state.isSignedUp && <SignUp sendData={this.getData} />}
                {this.state.isSignedUp && !this.state.activeGame && <Lobby sendGameData={this.getGameData}
                                                                           games={this.state.games}
                                                                           players={this.state.players}
                                                                           username={this.state.username} />}
                {this.state.activeGame && <Game sendGameData={this.getGameData}
                                                username={this.state.username}
                                                game={this.state.games[this.state.activeGame] }/>}
            </div>
        );
    }
}

export default Dominoes;