import React, { Component } from "react";
import SignUp from "./signup/signup.jsx";
import Lobby from "./lobby/lobby.jsx";

class Dominoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSignedUp: false,
            username: ''
        };
        this.getData = this.getData.bind(this);
    }

    getData(username) {
        this.setState({isSignedUp: true, username: username});
    }

    render() {
        return (
            <div>
                {!this.state.isSignedUp && <SignUp sendData={this.getData}/>}
                {this.state.isSignedUp && <Lobby username={this.state.username} />}
            </div>
        );
    }
}

export default Dominoes;