import React, { Component } from "react";
import SignUp from "./signup/signup.jsx";
import Lobby from "./lobby/lobby.jsx";

class Dominoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSignedUp: false
        };
        this.getData = this.getData.bind(this);
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    getData(val) {
        this.setState({isSignedUp: true});
    }

    render() {
        return (
            <div>
                {!this.state.isSignedUp && <SignUp sendData={this.getData}/>}
                {this.state.isSignedUp && <Lobby />}
            </div>
        );
    }
}

export default Dominoes;