import React, { Component } from "react";

import "./gamerooms.css";

class GameRooms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            games: this.props.games,
            username: this.props.username
        };
        this.joinGame = this.joinGame.bind(this);
        this.singleGame = this.singleGame.bind(this);
        this.deleteGame = this.deleteGame.bind(this);
    }

    componentWillReceiveProps({ games }) {
        this.setState({ games: games });
    }

    joinGame(game) {
        if (window.confirm('Are you sure you want to join the game?')) {
            const data = new URLSearchParams();
            data.append('username', this.state.username);
            data.append('gamename', game.gamename);
            fetch('/joingame', {
                method: 'post',
                body: data
            }).then(res => {
                if (res.status === 200) {
                    this.props.sendGameData(game.gamename);
                } else {
                    return res.json();
                }
            }).then(jsonData => {
                if (jsonData) {
                    alert(jsonData.error);
                }
            });
        }
    }

    singleGame(game) {
        if (window.confirm('Are you sure you want to play as single game?')) {
            const data = new URLSearchParams();
            data.append('username', this.state.username);
            data.append('gamename', game.gamename);
            fetch('/singlegame', {
                method: 'post',
                body: data
            }).then(res => {
                if (res.status === 200) {
                    this.props.sendGameData(game.gamename);
                } else {
                    return res.json();
                }
            }).then(jsonData => {
                if (jsonData) {
                    alert(jsonData.error);
                }
            });
        }
    }

    static gameStarted(game) {
        return game.registered_users.length === game.players;
    }

    static gameFinished(game) {
        return game.players === game.players_finished.length;
    }

    deleteGame(game) {
        if (game.registered_users.length > 0 && !GameRooms.gameStarted(game)) {
            alert('Unable to delete game - already have registered players');
            return;
        }
        if (GameRooms.gameStarted(game) && !GameRooms.gameFinished(game)) {
            alert('Unable to delete game - game already started');
            return;
        }
        if (window.confirm('Are you sure you want to delete the game?')) {
            const data = new URLSearchParams();
            data.append('username', game.username);
            data.append('gamename', game.gamename);
            fetch('/deletegame', {
                method: 'post',
                body: data
            }).then(res => {
                if (res.status !== 200) {
                    return res.json();
                }
            }).then(jsonData => {
                if (jsonData) {
                    alert(jsonData.error);
                }
            });
        }
    }

    render() {
        return (
            <table>
                <thead>
                    <tr>
                        <th>Game Name</th>
                        <th>Max Players</th>
                        <th>Owner</th>
                        <th>Registered</th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(this.state.games).map((gamename) => {
                        const game = this.state.games[gamename];
                        const username = this.state.username;
                        return <tr key={gamename} className={GameRooms.gameStarted(game) && !GameRooms.gameFinished(game) ? 'activegame' : ''}>
                            <td>{game.gamename}</td>
                            <td>{game.players}</td>
                            <td>{game.username}</td>
                            <td>{game.registered_users.join(',')}</td>
                            <td>{!GameRooms.gameStarted(game) && <button onClick={() => this.joinGame(game)}>Join</button>}</td>
                            <td>{game.registered_users.length === 0 && <button onClick={() => this.singleGame(game)}>Single Game</button>}</td>
                            <td>{game.username === username && <button onClick={() => this.deleteGame(game)}>Delete</button>}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        );
    }
}

export default GameRooms;