import React, { Component } from "react";

import "./game.css";
import Board from "./board.jsx";
import PlayerDeck from "./playerDeck.jsx";
import ImageHeadline from "./dominoes-header.jpg"
import { Left, Right, Up, Down } from "./domino/halfDomino.jsx";

export const Empty = -1;
export const Separator = -2;

let playerIndex = -1;
let playerDeck;

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            game: this.props.game,
            username: this.props.username,
            plays_count: 0,
            valid_placements: [],
            pieces_taken: 0,
            total_score: 0,
            elapsed_time: 0
        };
        this.getData = this.getData.bind(this);
        this.getDrag = this.getDrag.bind(this);
        this.logout = this.logout.bind(this);
        this.leaveRoom = this.leaveRoom.bind(this);
        this.getGameData = this.getGameData.bind(this);
    }

    componentWillReceiveProps({game}) {
        this.setState({game: game});
    }

    componentDidMount() {
        for (let i = 0; i < this.state.game.registered_users.length; i++) {
            if (this.state.game.registered_users[i] === this.state.username) {
                playerIndex = i;
                break;
            }
        }
        this.interval = setInterval(() => {
            if (this.state.game.players === this.state.game.registered_users.length && !playerDeck) {
                playerDeck = this.state.game.player_decks[playerIndex];
            }
            if (this.isCurrentPlayerTurn()) {
                this.setState({
                        elapsed_time: this.state.elapsed_time + 1
                    }
                );
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.setState({
                plays_count: 0,
                valid_placements: [],
                pieces_taken: 0,
                total_score: 0,
                elapsed_time: 0
            }
        );
        playerDeck = [];
    }

    logout() {ge
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

    getGameData(gamename) {
        this.props.sendGameData(gamename);
    }

    leaveRoom() {
        const data = new URLSearchParams();
        data.append('username', this.state.username);
        fetch('/leavegame', {
            method: 'post',
            body: data
        }).then(res => {
            if (res.status === 200) {
                this.getGameData('');
            } else {
                return res.json();
            }
        }).then(jsonData => {
            if (jsonData) {
                alert(jsonData.error);
            }
        });
    }

    getData(val) {
        let game = this.state.game;
        game.all_dominoes[val.dot].direction = val.direction;
        this.setState({game: game});
    }

    getDrag(val) {
        this.setState({
            valid_placements: val ? this.getValidPlacements(this.state.game.all_dominoes[val]) : [],
        });
    }

    static onDragOver(ev) {
        return (ev.preventDefault());
    }

    getValidPlacements(domino) {
        let validPlacements = [];
        for (let i = 0; i < this.state.game.board.length; i++) {
            for (let j = 0; j < this.state.game.board[i].length; j++) {
                const placement = { x: i, y: j };
                if (this.isValidPlacement(domino, placement)) {
                    validPlacements.push(placement.x + ',' + placement.y);
                }
            }
        }
        return validPlacements;
    }

    isValidPlacement(domino, placement) {
        const x = parseInt(placement.x);
        const y = parseInt(placement.y);
        const num_rows = this.state.game.board.length;
        const num_cols = this.state.game.board[0].length;
        if (this.state.total_score === 0) {
            return x < num_rows - 1 && x > 0 && y < num_cols - 1 && y > 0;
        }
        let dots1 = Math.floor(domino.dot / 10);
        let dots2 = Math.floor(domino.dot % 10);
        if (domino.direction === Left || domino.direction === Right) {
            //if already occupied
            if (this.state.game.board[x][y].dot !== Empty || this.state.game.board[x][Math.max(0, y - 1)].dot !== Empty || this.state.game.board[x][Math.min(num_cols - 1, y + 1)].dot !== Empty) {
                return false;
            }
            if (domino.direction === Right) {
                const temp = dots1;
                dots1 = dots2;
                dots2 = temp;
            }
            //to the right normal
            if (y >= 2 && y < num_cols - 1 && (this.state.game.board[x][y - 2].direction === Left || this.state.game.board[x][y - 2].direction === Right) && (this.state.game.board[x][y - 2].dot === dots1 || dots1 === 0 || this.state.game.board[x][y - 2].dot === 0)) {
                return true;
            }
            //to the right separator
            if (y >= 2 && x >= 1 && x < num_rows - 1 && (this.state.game.board[x][y - 2].direction === Up || this.state.game.board[x][y - 2].direction === Down) && this.state.game.board[x][y - 2].dot === Separator && this.state.game.board[x - 1][y - 2].dot === this.state.game.board[x + 1][y - 2].dot && (this.state.game.board[x + 1][y - 2].dot === 0 || dots1 === 0 || this.state.game.board[x + 1][y - 2].dot === dots1)) {
                return true;
            }
            //to the left normal
            if (y > 0 && y < num_cols - 2 && (this.state.game.board[x][y + 2].direction === Left || this.state.game.board[x][y + 2].direction === Right) && (this.state.game.board[x][y + 2].dot === dots2 || dots2 === 0 || this.state.game.board[x][y + 2].dot === 0)) {
                return true;
            }
            //to the left separator
            if (y < num_cols - 2 && x >= 1 && x < num_rows - 1 && (this.state.game.board[x][y + 2].direction === Up || this.state.game.board[x][y + 2].direction === Down) && this.state.game.board[x][y + 2].dot === Separator && this.state.game.board[x - 1][y + 2].dot === this.state.game.board[x + 1][y + 2].dot && (this.state.game.board[x + 1][y + 2].dot === 0 || dots2 === 0 || this.state.game.board[x + 1][y + 2].dot === dots2)) {
                return true;
            }
            //above separator
            if (x >= 1 && (this.state.game.board[x - 1][y].direction === Up || this.state.game.board[x - 1][y].direction === Down) && dots1 === dots2 && (this.state.game.board[x - 1][y].dot === dots1 || this.state.game.board[x - 1][y].dot === 0 || dots1 === 0)) {
                return true;
            }
            //below separator
            if (x < num_rows - 1 && (this.state.game.board[x + 1][y].direction === Up || this.state.game.board[x + 1][y].direction === Down) && dots1 === dots2 && (this.state.game.board[x + 1][y].dot === dots1 || this.state.game.board[x + 1][y].dot === 0 || dots1 === 0)) {
                return true;
            }
        } else {
            //if already occupied
            if (this.state.game.board[x][y].dot !== Empty || this.state.game.board[Math.max(0, x - 1)][y].dot !== Empty || this.state.game.board[Math.min(num_rows - 1, x + 1)][y].dot !== Empty) {
                return false;
            }
            if (domino.direction === Down) {
                const temp = dots1;
                dots1 = dots2;
                dots2 = temp;
            }
            //below normal
            if (x >= 2 && x < num_rows - 1 && (this.state.game.board[x - 2][y].direction === Up || this.state.game.board[x - 2][y].direction === Down) && (this.state.game.board[x - 2][y].dot === dots1 || dots1 === 0 || this.state.game.board[x - 2][y].dot === 0)) {
                return true;
            }
            //below separator
            if (x >= 2 && y >= 1 && y < num_cols - 1 && (this.state.game.board[x - 2][y].direction === Left || this.state.game.board[x - 2][y].direction === Right) && this.state.game.board[x - 2][y].dot === Separator && this.state.game.board[x - 2][y - 1].dot === this.state.game.board[x - 2][y + 1].dot && (this.state.game.board[x - 2][y + 1].dot === 0 || dots1 === 0 || this.state.game.board[x - 2][y + 1].dot === dots1)) {
                return true;
            }
            //above normal
            if (x < num_rows - 2 && x > 0 && (this.state.game.board[x + 2][y].direction === Up || this.state.game.board[x + 2][y].direction === Down) && (this.state.game.board[x + 2][y].dot === dots2 || dots2 === 0 || this.state.game.board[x + 2][y].dot === 0)) {
                return true;
            }
            //above separator
            if (x < num_rows - 2 && y >= 1 && y < num_cols - 1 && (this.state.game.board[x + 2][y].direction === Left || this.state.game.board[x + 2][y].direction === Right) && this.state.game.board[x + 2][y].dot === Separator && this.state.game.board[x + 2][y - 1].dot === this.state.game.board[x + 2][y + 1].dot && (this.state.game.board[x + 2][y + 1].dot === 0 || dots2 === 0 || this.state.game.board[x + 2][y + 1].dot === dots2)) {
                return true;
            }
            //to the left separator
            if (y >= 1 && (this.state.game.board[x][y - 1].direction === Left || this.state.game.board[x][y - 1].direction === Right) && dots1 === dots2 && (this.state.game.board[x][y - 1].dot === dots1 || this.state.game.board[x][y - 1].dot === 0 || dots1 === 0)) {
                return true;
            }
            //to the right separator
            if (y < num_cols - 1 && (this.state.game.board[x][y + 1].direction === Left || this.state.game.board[x][y + 1].direction === Right) && dots1 === dots2 && (this.state.game.board[x][y + 1].dot === dots1 || this.state.game.board[x][y + 1].dot === 0 || dots1 === 0)) {
                return true;
            }
        }
        return false;
    }

    onDrop(ev) {
        ev.preventDefault();
        if (ev.target.id && this.isCurrentPlayerTurn()) {
            let game = this.state.game;
            const placement = { 'x': parseInt(ev.target.id.split(',')[0]), 'y': parseInt(ev.target.id.split(',')[1]) };
            const idDropped = parseInt(ev.dataTransfer.getData('id'));
            if (!this.isValidPlacement(game.all_dominoes[idDropped], placement)) {
                return;
            }
            const domino = game.all_dominoes[idDropped];
            game.all_dominoes[idDropped].placement = placement;
            let boardCopy = game.board;
            let dots1;
            let dots2;
            if (domino.direction === Left || domino.direction === Up) {
                dots1 = Math.floor(domino.dot / 10);
                dots2 = Math.floor(domino.dot % 10);
            } else {
                dots1 = Math.floor(domino.dot % 10);
                dots2 = Math.floor(domino.dot / 10);
            }
            if (domino.direction === Left || domino.direction === Right) {
                boardCopy[placement.x][placement.y - 1].dot = dots1;
                boardCopy[placement.x][placement.y - 1].direction = domino.direction;
                boardCopy[placement.x][placement.y].dot = Separator;
                boardCopy[placement.x][placement.y].direction = domino.direction;
                boardCopy[placement.x][placement.y + 1].dot = dots2;
                boardCopy[placement.x][placement.y + 1].direction = domino.direction;
            } else {
                boardCopy[placement.x - 1][placement.y].dot = dots1;
                boardCopy[placement.x - 1][placement.y].direction = domino.direction;
                boardCopy[placement.x][placement.y].dot = Separator;
                boardCopy[placement.x][placement.y].direction = domino.direction;
                boardCopy[placement.x + 1][placement.y].dot = dots2;
                boardCopy[placement.x + 1][placement.y].direction = domino.direction;
            }
            this.resizeBoardIfNeeded(boardCopy);
            game.board = boardCopy;
            playerDeck = playerDeck.filter((k) => {
                return k !== idDropped.toString()
            });
            game.player_turn = playerIndex + 1 % game.players;
            this.setState({
                game: game,
                plays_count: this.state.plays_count + 1,
                valid_placements: [],
                total_score: this.state.total_score + dots1 + dots2
            });
            this.notifyGame(game);
        }
    }

    notifyGame(game) {
        fetch('/updategame', {
            method: 'POST',
            body: JSON.stringify(game),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
            .then(response => console.log('Success:', JSON.stringify(response)))
            .catch(error => alert('Error:' + error));
    }

    static onReset() {
        return window.location.reload();
    }

    getEndResult() {
        if (playerDeck.length === 0) {
            clearInterval(this.interval);
            //TODO - notify win
            return "Player wins!";
        } else if (this.state.game.bank.length === 0) {
            //TODO - notify loss
            clearInterval(this.interval);
            return "Player loses!"
        }
    }

    getBankDomino() {
        let game = this.state.game;
        const randBankDomino = game.bank[Math.floor(Math.random() * game.bank.length)];
        playerDeck.push(randBankDomino);
        game.bank = game.bank.filter((k) => k !== randBankDomino);
        game.player_turn = playerIndex + 1 % game.players;
        this.setState({
            game: game,
            plays_count: this.state.plays_count + 1,
            pieces_taken: this.state.pieces_taken + 1,
            valid_placements: []
        });
        fetch('/updategame', {
            method: 'POST',
            body: JSON.stringify(game),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
            .then(response => console.log('Success:', JSON.stringify(response)))
            .catch(error => alert('Error:' + error));
    }

    isCurrentPlayerTurn() {
        return this.state.game.player_turn === playerIndex;
    }

    resizeBoardIfNeeded(board) {
        let min_row = this.state.game.board.length;
        let min_col = board[0].length;
        let max_row = 0;
        let max_col = 0;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].dot !== Empty && i < min_row) {
                    min_row = i;
                }
                if (board[i][j].dot !== Empty && i > max_row) {
                    max_row = i;
                }
                if (board[i][j].dot !== Empty && j < min_col) {
                    min_col = j;
                }
                if (board[i][j].dot !== Empty && j > max_col) {
                    max_col = j;
                }
            }
        }
        if (min_row < 3 || max_row > board.length - 4) {
            let rowsToAdd;
            if (min_row < 3) {
                rowsToAdd = 3 - min_row;
            } else {
                rowsToAdd = 4 - (board.length - max_row);
            }
            for (let i = 0; i < rowsToAdd; i++) {
                let new_row = new Array(board[0].length);
                for (let j = 0; j < new_row.length; j++) {
                    new_row[j] = { dot: Empty };
                }
                if (min_row < 3) {
                    board.unshift(new_row);
                } else {
                    board.push(new_row);
                }
            }
        }
        if (min_col < 3 || max_col > board[0].length - 4) {
            let colsToAdd;
            if (min_col < 3) {
                colsToAdd = 3 - min_col;
            } else {
                colsToAdd = 4 - (board[0].length - max_col);
            }
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < colsToAdd; j++) {
                    if (min_col < 3) {
                        board[i].unshift({ dot: Empty });
                    } else {
                        board[i].push({ dot: Empty });
                    }
                }
            }
        }
    }

    render() {
        const endResult = this.getEndResult();
        const missingPlayers = this.state.game.players - this.state.game.registered_users.length;
        const temp_mins = Math.floor(this.state.elapsed_time / 60);
        const temp_secs = Math.floor(this.state.elapsed_time % 60);
        const mins = temp_mins < 10 ? '0' + temp_mins : temp_mins;
        const secs = temp_secs < 10 ? '0' + temp_secs : temp_secs;
        const avg = this.state.plays_count > 0 ? Math.floor(this.state.elapsed_time / this.state.plays_count) : 0;
        return (
            <div>
                <h1>Dominoes <img src={ImageHeadline} alt='dominoesheader' /> Game!</h1>
                <button disabled={missingPlayers === 0} onClick={this.logout}>Logout</button>
                <button disabled={missingPlayers === 0} onClick={this.leaveRoom}>Leave Room</button>
                <div className="players">
                    {missingPlayers === 0 && (
                        <h2>Player {this.state.game.player_turn + 1}'s turn</h2>
                    )}
                    {missingPlayers > 0 && (
                        <h2>Waiting for {missingPlayers > 1 ? missingPlayers + ' more players' : missingPlayers + ' more player'}</h2>
                    )}
                </div>
                <h2>Board:</h2>
                <div
                    onDragOver={(e) => Game.onDragOver(e)}
                    onDrop={(e) => this.onDrop(e)}>
                    <Board allDominoes={this.state.game.all_dominoes} valid_placements={this.state.valid_placements} dominoes={this.state.game.board}/>
                </div>
                <h2>Player deck:</h2>
                <div onDragOver={(e) => Game.onDragOver(e)}>
                    <PlayerDeck allDominoes={this.state.game.all_dominoes} sendDrag={this.getDrag} sendData={this.getData} dominoes={playerDeck} />
                </div>
                <button disabled={!this.isCurrentPlayerTurn} onClick={() => this.getBankDomino()}>
                    Get domino from the bank
                </button>
                <div className="statistics">
                    <h4>Plays counter: {this.state.plays_count}</h4>
                    <h4>Elapsed time: {mins + ':' + secs}</h4>
                    <h4>Average time: {avg + 's'}</h4>
                    <h4>Pieces taken: {this.state.pieces_taken}</h4>
                    <h4>Total score: {this.state.total_score}</h4>
                </div>
                <h3>{endResult}</h3>
            </div >
        );
    }
}

export default Game;