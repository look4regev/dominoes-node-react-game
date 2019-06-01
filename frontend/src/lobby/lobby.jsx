import React, { Component } from "react";

import "./lobby.css";
import GameRooms from "./gamerooms.jsx";

class Lobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.username,
            games: this.props.games,
            players: this.props.players,
            gameNameInput: '',
            gamePlayersInput: '2'
        };
        this.createGame = this.createGame.bind(this);
        this.logout = this.logout.bind(this);
        this.getGameData = this.getGameData.bind(this);
    }

    handleNameChange(event) {
        this.setState({gameNameInput: event.target.value});
    }

    handlePlayersChange(event) {
        this.setState({gamePlayersInput: event.target.value});
    }

    getGameData(gamename) {
        this.props.sendGameData(gamename);
    }

    logout() {
        const data = new URLSearchParams();
        data.append('username', this.state.username);
        fetch('/logout', {
            method: 'post',
            body: data
        }).then(res => {
            if (res.status === 200) {
                window.location.reload();
            } else {
                return res.json();
            }
        }).then(jsonData => {
            if (jsonData) {
                alert(jsonData.error);
            }
        });
    }

    componentDidMount() {
        setInterval(() => {
            fetch('/issignedin?username=' + this.state.username, {
                method: 'get'
            }).then(response => response.json())
                .then((data) => {
                    if (data.answer === 'no') {
                        window.location.reload();
                    }
                });
        }, 5000);
    }

    componentWillReceiveProps({games, players}) {
        this.setState({...this.state, games, players});
    }

    createGame() {
        if (!this.state.gamePlayersInput) {
            alert("Must provide number of players");
            return;
        }
        const numberOfPlayers = parseInt(this.state.gamePlayersInput);
        if (numberOfPlayers !== 2 && numberOfPlayers !== 3) {
            alert('Number of players has to be either 2 or 3');
            return;
        }
        if (this.state.gameNameInput in this.state.games) {
            alert('Game name already taken');
            return;
        }
        const data = new URLSearchParams();
        data.append('username', this.state.username);
        data.append('gamename', this.state.gameNameInput);
        data.append('players', this.state.gamePlayersInput);
        fetch('/creategame', {
            method: 'post',
            body: data
        }).then(res => {
            if (res.status === 200) {
                this.setState({gameNameInput: '', gamePlayersInput: '2'});
            } else {
                return res.json();
            }
        }).then(jsonData => {
            if (jsonData) {
                alert(jsonData.error);
            }
        });
    }

    render() {
        return (
            <div className="lobby">
                <h1>Lobby</h1>
                <button onClick={this.logout}>Logout</button>
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
                    <h3>Create Game</h3>
                    <div className="creategame">
                        <label>
                            Game Name:
                            <input type="text" value={this.state.gameNameInput} onChange={evt => this.handleNameChange(evt)} />
                        </label>
                        <label>
                            Players:
                            <select onChange={evt => this.handlePlayersChange(evt)} value={this.state.gamePlayersInput}>
                                <option value="2">2</option>
                                <option value="3">3</option>
                            </select>
                        </label>
                        <button onClick={this.createGame}>Create</button>
                    </div>
                    <h3>Game Rooms</h3>
                    <GameRooms sendGameData={this.getGameData} games={this.state.games} username={this.state.username}/>
                </div>
            </div >
        );
    }
}

export default Lobby;