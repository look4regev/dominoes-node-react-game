import React, { Component } from "react";
import SignUp from "./signup/signup.jsx";
import Lobby from "./lobby/lobby.jsx";
import Game from "./game/game";

class Dominoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSignedUp: false,
            isInGame: false,
            username: '',
        };
        this.getData = this.getData.bind(this);
        this.getGameData = this.getGameData.bind(this);
    }

    getData(username) {
        this.setState({isSignedUp: true, username: username});
    }

    getGameData(isInGame) {
        this.setState({isInGame: isInGame});
    }

    render() {
        return (
            <div>
                {!this.state.isSignedUp && <SignUp sendData={this.getData} />}
                {this.state.isSignedUp && !this.state.isInGame && <Lobby sendGameData={this.getGameData} username={this.state.username} />}
                {this.state.isInGame && <Game />}
            </div>
        );
    }
}

export default Dominoes;