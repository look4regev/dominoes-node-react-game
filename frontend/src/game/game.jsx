import React, { Component } from "react";

import "./game.css";
import Board from "./board.jsx";
import PlayerDeck from "./playerDeck.jsx";
import ImageHeadline from "./dominoes-header.jpg"
import { Left, Right, Up, Down } from "./domino/halfDomino.jsx";
import * as _ from "lodash";

export const Empty = -1;
export const Separator = -2;

let playerIndex = -2;
let deckFilled = false;

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            game: this.props.game,
            username: this.props.username,
            valid_placements: []
        };
        this.getData = this.getData.bind(this);
        this.getDrag = this.getDrag.bind(this);
        this.logout = this.logout.bind(this);
        this.leaveRoom = this.leaveRoom.bind(this);
        this.getGameData = this.getGameData.bind(this);
    }

    componentWillReceiveProps({ game }) {
        this.setState({ game: game });
    }

    isGameInProgress() {
        return this.state.game.players === this.state.game.registered_users.length;
    }

    findPlayerIndex() {
        for (let i = 0; i < this.state.game.registered_users.length; i++) {
            if (this.state.game.registered_users[i] === this.state.username) {
                return i;
            }
        }
        return -2;
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            playerIndex = this.findPlayerIndex();
            if (this.isGameInProgress() && !deckFilled && playerIndex >= 0) {
                deckFilled = true;
            }
            if (this.isGameInProgress() && this.isCurrentPlayerTurn()) {
                let game = this.state.game;
                game.statistics[playerIndex].elapsed_time++;
                Game.notifyGame(game, this.state.game.last_move_draw);
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.setState({
            valid_placements: []
        });
        deckFilled = false;
        playerIndex = -2;
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

    getGameData(gamename) {
        this.props.sendGameData(gamename);
    }

    leaveRoomFetch(data) {
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

    leaveRoom() {
        if (!this.isGameInProgress()) {
            const data = new URLSearchParams();
            data.append('username', this.state.username);
            this.leaveRoomFetch(data)
        } else {
            let game = this.state.game;
            game.players_left.push(playerIndex);
            Game.notifyGame(game);
            if (this.isGameOver()) {
                if (game.players_left.length === game.players) {
                    const data = new URLSearchParams();
                    data.append('clearroom', game.gamename);
                    this.leaveRoomFetch(data);
                    return;
                }
            }
        }
        this.getGameData('');

    }

    getData(val) {
        let game = this.state.game;
        game.all_dominoes[val.dot].direction = val.direction;
        Game.notifyGame(game);
    }

    getDrag(val) {
        if (this.isCurrentPlayerTurn()) {
            this.setState({
                valid_placements: val ? this.getValidPlacements(this.state.game.all_dominoes[val]) : [],
            });
        }
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

    isBoardEmpty() {
        for (let i = 0; i < this.state.game.board.length; i++) {
            for (let j = 0; j < this.state.game.board[i].length; j++) {
                if (this.state.game.board[i][j].dot !== Empty) {
                    return false;
                }
            }
        }
        return true;
    }

    isValidPlacement(domino, placement) {
        const x = parseInt(placement.x);
        const y = parseInt(placement.y);
        const num_rows = this.state.game.board.length;
        const num_cols = this.state.game.board[0].length;
        if (this.isBoardEmpty()) {
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
            game.player_decks[playerIndex] = game.player_decks[playerIndex].filter((k) => {
                return k !== idDropped.toString()
            });
            let value = game.all_dominoes[idDropped];
            value.placement = placement;
            game.all_dominoes[idDropped] = value;
            game.board = boardCopy;
            game.player_turn = Game.getNextTurn(game);
            game.statistics[playerIndex].plays_count++;
            game.statistics[playerIndex].total_score += dots1 + dots2;
            Game.notifyGame(game);
            this.setState({
                valid_placements: [],
            });
        }
    }

    static notifyGame(game, drawFromBank = false) {
        let objectToPost;
        if (drawFromBank) {
            objectToPost = {
                drawFromBank: true,
                game: game
            }
        } else {
            objectToPost = game;
        }
        fetch('/updategame', {
            method: 'POST',
            body: JSON.stringify(objectToPost),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    static onReset() {
        return window.location.reload();
    }

    static getPlacePosition(game, searchedPlayerIndex) {
        for (let i = 0; i < game.players_finished.length; i++) {
            if (game.players_finished[i] === searchedPlayerIndex) {
                return i;
            }
        }
        return -3;
    }

    calculateScore(playerDeck) {
        let totalScore = 0;
        for (let i = 0; i < playerDeck.length; i++) {
            totalScore += Math.floor(playerDeck[i].dot / 10) + Math.floor(playerDeck[i].dot % 10);
        }
        return totalScore;
    }

    getEndResult() {
        if (this.isGameInProgress() && deckFilled) {
            let game = this.state.game;
            let placePosition;
            if (game.players === 1) {
                if (game.player_decks[0].length === 0) {
                    if (!this.isGameOver()) {
                        game.players_finished.push(0);
                        Game.notifyGame(game);
                        clearInterval(this.interval);
                    }
                    return "You won! 👏";
                } else if (game.bank.length === 0) {
                    if (!this.isGameOver()) {
                        game.players_finished.push(0);
                        Game.notifyGame(game);
                        clearInterval(this.interval);
                    }
                    return "You lost! 💩";
                }
            }
            placePosition = Game.getPlacePosition(game, playerIndex);
            if ((placePosition < 0 && this.state.game.player_decks[playerIndex].length === 0) || (placePosition < 0 && game.players > 1 && game.players - game.players_finished.length === 1)) {
                game.players_finished.push(playerIndex);
                placePosition = game.players_finished.length - 1;
                Game.notifyGame(game);
                clearInterval(this.interval);
            }
            if (this.isEverybodyPlayingStuck() && !game.players_finished.includes(playerIndex)) {
                let sortable = [];
                for (let i = 0; i < game.registered_users.length; i++) {
                    sortable.push([i, this.calculateScore(game.player_decks[i])]);
                }
                sortable.sort((a, b) => (a[1] - b[1]));
                if (game.players_finished.length > 0) {
                    _.remove(sortable, (el) => el[0] === game.players_finished[0]);
                }
                for (let i = 0; i < sortable.length; i++) {
                    game.players_finished.push(sortable[i][0]);
                }
                placePosition = Game.getPlacePosition(game, playerIndex);
                Game.notifyGame(game);
                clearInterval(this.interval);
            }
            if (placePosition >= 0) {
                if (placePosition === 0) {
                    return "You won! 👏";
                }
                if (placePosition === game.players - 1) {
                    return "You lost! 💩";
                }
                return "You finished 2nd";
            }
        }
    }

    skipTurn() {
        let game = this.state.game;
        game.player_turn = Game.getNextTurn(game);
        Game.notifyGame(game);
        this.setState({
            valid_placements: []
        });
    }

    getBankDomino() {
        let game = this.state.game;
        const randBankDomino = game.bank[Math.floor(Math.random() * game.bank.length)];
        game.player_decks[playerIndex].push(randBankDomino);
        game.bank = game.bank.filter((k) => k !== randBankDomino);
        game.player_turn = Game.getNextTurn(game);
        game.statistics[playerIndex].plays_count++;
        game.statistics[playerIndex].pieces_taken++;
        Game.notifyGame(game, true);
        this.setState({
            valid_placements: []
        });
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

    createStatisticsTable() {
        let table = [];
        for (let i = 0; i < this.state.game.players; i++) {
            let children = [];
            if (this.state.game.statistics[i]) {
                children.push(<td>{this.state.game.registered_users[i]}</td>);
                children.push(<td>{this.state.game.statistics[i].plays_count}</td>);
                children.push(<td>{this.state.game.statistics[i].pieces_taken}</td>);
                children.push(<td>{this.state.game.statistics[i].total_score}</td>);
                children.push(<td>{this.state.game.statistics[i].elapsed_time}</td>);
            }
            table.push(<tr>{children}</tr>)
        }
        return table
    }

    isGameOver() {
        return this.state.game.players_finished.length === this.state.game.players || this.isEverybodyPlayingStuck();
    }

    isPlayerStuck(player) {
        const game = this.state.game;
        if (!deckFilled || game.bank.length > 0) {
            return false;
        }
        const playerDeck = game.player_decks[player];
        if (game.players_finished.includes(player)) {
            return true;
        }
        for (let j = 0; j < playerDeck.length; j++) {
            let domino = {};
            Object.assign(domino, game.all_dominoes[playerDeck[j]]);
            domino.direction = Left;
            if (this.getValidPlacements(domino).length > 0) {
                return false;
            }
            domino.direction = Up;
            if (this.getValidPlacements(domino).length > 0) {
                return false;
            }
            domino.direction = Right;
            if (this.getValidPlacements(domino).length > 0) {
                return false;
            }
            domino.direction = Down;
            if (this.getValidPlacements(domino).length > 0) {
                return false;
            }
        }
        return true;
    }

    isEverybodyPlayingStuck() {
        const game = this.state.game;
        if (!deckFilled || game.bank.length > 0) {
            return false;
        }
        for (let i = 0; i < game.registered_users.length; i++) {
            if (!this.isPlayerStuck(i)) {
                return false;
            }
        }
        return true;
    }

    static getNextTurn(game) {
        let nextPlayerTurn = (playerIndex + 1) % game.players;
        while (Game.getPlacePosition(game, nextPlayerTurn) >= 0) {
            nextPlayerTurn = (nextPlayerTurn + 1) % game.players;
        }
        return nextPlayerTurn;
    }

    isPlayedLastTurn() {
        if (this.state.game.players_finished.length > 0) {
            if (this.state.game.players_finished[0] === playerIndex) {
                return false;
            }
            return !this.isCurrentPlayerTurn();
        }
        const diff = this.state.game.player_turn - playerIndex;
        if (diff > 0) {
            return diff === 1;
        }
        return this.state.game.players + diff === 1;
    }

    getLastPlayerPlayed() {
        if (this.state.game.players_finished.length > 0) {
            if (playerIndex === this.state.game.players_finished[0]) {
                return this.state.game.players - this.state.game.player_turn - playerIndex;
            }
            for (let i = 0; i < this.state.game.registered_users.length; i++) {
                if (i !== playerIndex && i !== this.state.game.players_finished[0]) {
                    return i;
                }
            }
        }
        return playerIndex > 0 ? this.state.game.player_turn - 1 : this.state.game.players - 1;
    }

    render() {
        let statistics = this.state.game.statistics[playerIndex];
        if (!statistics) {
            statistics = {
                plays_count: 0,
                pieces_taken: 0,
                total_score: 0,
                elapsed_time: 0
            };
        }
        const endResult = this.getEndResult();
        const currentPlayersTurn = this.isCurrentPlayerTurn();
        const missingPlayers = this.state.game.players - this.state.game.registered_users.length;
        const temp_mins = Math.floor(statistics.elapsed_time / 60);
        const temp_secs = Math.floor(statistics.elapsed_time % 60);
        const mins = temp_mins < 10 ? '0' + temp_mins : temp_mins;
        const secs = temp_secs < 10 ? '0' + temp_secs : temp_secs;
        const avg = statistics.plays_count > 0 ? Math.floor(statistics.elapsed_time / statistics.plays_count) : 0;
        return (
            <div>
                <h1>Dominoes <img src={ImageHeadline} alt='dominoesheader' /> Game!</h1>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <div className="players">
                                    {playerIndex >= 0 && (
                                        <h2>Player {playerIndex + 1}</h2>
                                    )}
                                    <button disabled={missingPlayers === 0} onClick={this.logout}>Logout</button>
                                    <button disabled={missingPlayers === 0 && !this.state.game.players_finished.includes(playerIndex)} onClick={this.leaveRoom}>Leave Room</button>
                                    {this.isCurrentPlayerTurn() && (
                                        <h2>Your turn</h2>
                                    )}
                                    {missingPlayers === 0 && !this.isCurrentPlayerTurn() && (
                                        <h2>Player {this.state.game.player_turn + 1}'s turn</h2>
                                    )}
                                    {missingPlayers > 0 && (
                                        <h2>Waiting for {missingPlayers > 1 ? missingPlayers + ' more players' : missingPlayers + ' more player'}</h2>
                                    )}
                                    {this.state.game.last_move_draw && !this.isPlayedLastTurn() && (
                                        <h4>Player {this.getLastPlayerPlayed() + 1} drew from bank</h4>
                                    )}
                                    <h4>Players in Game</h4>
                                    {this.state.game.registered_users.map((player) => (
                                        <li key={player + '-ingame'} className={player === this.state.username ? 'me' : ''}>{player}</li>
                                    ))}
                                </div>
                            </td>
                            <td>
                                {!this.isGameOver() && (
                                    <div>
                                        <h2>Board:</h2>
                                        <div
                                            onDragOver={(e) => Game.onDragOver(e)}
                                            onDrop={(e) => this.onDrop(e)}>
                                            <Board allDominoes={this.state.game.all_dominoes} valid_placements={this.state.valid_placements} dominoes={this.state.game.board} />
                                        </div>
                                        <h2>Player deck:</h2>
                                        <div onDragOver={(e) => Game.onDragOver(e)}>
                                            <PlayerDeck allDominoes={this.state.game.all_dominoes} sendDrag={this.getDrag} sendData={this.getData} dominoes={playerIndex < 0 ? [] : this.state.game.player_decks[playerIndex]} />
                                        </div>
                                        <div className="control">
                                            <button disabled={!currentPlayersTurn || this.state.game.bank.length === 0} onClick={() => this.getBankDomino()}>
                                                Get domino from the bank
                                            </button>
                                            <button disabled={!currentPlayersTurn || this.state.game.players === 1 || !this.isPlayerStuck(playerIndex)} onClick={() => this.skipTurn()}>
                                                Skip turn
                                            </button>
                                        </div>
                                        <div className="statistics">
                                            <h4>Plays counter: {statistics.plays_count}</h4>
                                            <h4>Elapsed time: {mins + ':' + secs}</h4>
                                            <h4>Average time: {avg + 's'}</h4>
                                            <h4>Pieces taken: {statistics.pieces_taken}</h4>
                                            <h4>Total score: {statistics.total_score}</h4>
                                        </div>
                                    </div>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {this.isGameOver() && (
                                    <div>
                                        <h2>Game Summary:</h2>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Player</th>
                                                    <th>Play Count</th>
                                                    <th>Pieces Taken</th>
                                                    <th>Total Score</th>
                                                    <th>Elapsed Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.createStatisticsTable()}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <h2>{endResult}</h2>
                                {this.state.game.players_finished.length > 0 && (
                                    <div>
                                        <h3>Players Finished</h3>
                                        <ol>
                                            {this.state.game.players_finished.map((player) => (
                                                <li key={player + '-finished-' + Math.random() * 100}>{this.state.game.registered_users[player]}</li>))}
                                        </ol>
                                    </div>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div >
        );
    }
}

export default Game;