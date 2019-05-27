import React, { Component } from "react";

import "./signup.css";

class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: ''
        };
    }

    signUp() {
        const data = new URLSearchParams();
        data.append('username', this.state.inputValue);
        fetch('/signup', {
            method: 'post',
            body: data
        }).then(res => {
                if (res.status === 200) {
                    this.props.sendData();
                } else {
                    return res.json();
                }
            });
    }

    updateInputValue(evt) {
        this.setState({inputValue: evt.target.value})
    }

    render() {
        return (
            <div className="signup-form">
                <h1>Sign Up</h1>
                <input value={this.state.inputValue} onChange={evt => this.updateInputValue(evt)}/>
                <button onClick={() => this.signUp()}>
                    Sign Up
                </button>
            </div >
        );
    }
}

export default SignUp;