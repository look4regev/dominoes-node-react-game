import React, { Component } from "react";

import "./lobby.css";

class Lobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.username,
            games: {},
            players: [],
            gameNameInput: '',
            gamePlayersInput: ''
        };
        this.handleSubmit = this.handleSubmit.bind(this);
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

    handleNameChange(event) {
        this.setState({gameNameInput: event.target.value});
    }

    handlePlayersChange(event) {
        this.setState({gamePlayersInput: event.target.value});
    }

    createGame() {
        console.log(this.state.gameNameInput, this.state.gamePlayersInput);
        if (this.state.gamePlayersInput != 2 && this.state.gamePlayersInput != 3) {
            alert('Number of players has to be either 2 or 3');
            return;
        }
        if (this.state.gameNameInput in this.state.games) {
            alert('Game name already taken');
            return;
        }
        const data = new URLSearchParams();
        data.append('username', this.state.inputValue);
        data.append('gamename', this.state.gameNameInput);
        data.append('players', this.state.gamePlayersInput);
        fetch('/creategame', {
            method: 'post',
            body: data
        }).then(res => {
            if (res.status === 200) {
                console.log('success');
            } else {
                return res.json();
            }
        }).then(jsonData => {
            if (jsonData) {
                alert(jsonData.error);
            }
        });
        event.preventDefault();
    }

    joinGame(event) {
        console.log(this.state.gameNameInput, this.state.gamePlayersInput);
        const data = new URLSearchParams();
        data.append('username', this.state.username);
        data.append('gamename', event.target.value);
        fetch('/joingame', {
            method: 'post',
            body: data
        }).then(res => {
            if (res.status === 200) {
                console.log('success');
            } else {
                return res.json();
            }
        }).then(jsonData => {
            if (jsonData) {
                alert(jsonData.error);
            }
        });
        event.preventDefault();
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
                            <li key={game}>{game}<button onClick={(event) => this.joinGame(event)}>
                                Join
                            </button></li>
                        ))}
                    </ul>
                    <h3>Create Game</h3>
                    <form onSubmit={this.createGame}>
                        <label>
                            Name:
                            <input type="text" value={this.state.gameNameInput} onChange={evt => this.handleNameChange(evt)} />
                        </label>
                        <label>
                            Players:
                            <input type="text" value={this.state.gamePlayersInput} onChange={evt => this.handlePlayersChange(evt)} />
                        </label>
                        <input type="submit" value="Create" />
                    </form>
                </div>
            </div >
        );
    }
}

export default Lobby;