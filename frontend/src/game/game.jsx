import React, { Component } from "react";

import "./game.css";
import Board from "./board.jsx";
import PlayerDeck from "./playerDeck.jsx";
import ImageHeadline from "./dominoes-header.jpg"
import { Left, Right, Up, Down } from "./domino/halfDomino.jsx";

const PlayerInitialDominoesCount = 6;

export const Empty = -1;
export const Separator = -2;

let AllDominoes = {
    0:  { dot: 0,  direction: Left }, 1:  { dot: 1,  direction: Left }, 2:  { dot: 2,  direction: Left }, 3:  { dot: 3,  direction: Left }, 4:  { dot: 4,  direction: Left }, 5:  { dot: 5,  direction: Left }, 6:  { dot: 6,  direction: Left },
    11: { dot: 11, direction: Left }, 12: { dot: 12, direction: Left }, 13: { dot: 13, direction: Left }, 14: { dot: 14, direction: Left }, 15: { dot: 15, direction: Left }, 16: { dot: 16 , direction: Left },
    22: { dot: 22, direction: Left }, 23: { dot: 23, direction: Left }, 24: { dot: 24, direction: Left }, 25: { dot: 25, direction: Left }, 26: { dot: 26, direction: Left },
    33: { dot: 33, direction: Left }, 34: { dot: 34, direction: Left }, 35: { dot: 35, direction: Left }, 36: { dot: 36, direction: Left },
    44: { dot: 44, direction: Left }, 45: { dot: 45, direction: Left }, 46: { dot: 46, direction: Left },
    55: { dot: 55, direction: Left }, 56: { dot: 56, direction: Left },
    66: { dot: 66, direction: Left }
};

let plays = [];
let playsIndex;
let gameOver = false;

class Game extends Component {
    constructor(props) {
        super(props);
        const randomPlayer1Dominoes = Game.getRandomPlayer1Dominoes();
        const num_rows = 9;
        const num_cols = 9;
        let board = new Array(num_rows);
        for (let i = 0; i < num_rows; i++) {
            board[i] = new Array(num_cols);
            for (let j = 0; j < num_cols; j++) {
                board[i][j] = { dot: Empty };
            }
        }
        this.state = {
            player1Deck: Object.keys(AllDominoes).filter((k) => randomPlayer1Dominoes.includes(k)),
            bank: Object.keys(AllDominoes).filter((k) => !randomPlayer1Dominoes.includes(k)),
            board: board,
            plays_count: 0,
            valid_placements: [],
            pieces_taken: 0,
            total_score: 0,
            elapsed_time: 0,
        };
        this.getData = this.getData.bind(this);
        this.getDrag = this.getDrag.bind(this);
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            this.setState({
                    elapsed_time: this.state.elapsed_time + 1}
                );
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getData(val) {
        AllDominoes[val.dot].direction = val.direction;
    }

    getDrag(val) {
        this.setState({
            valid_placements: val ? this.getValidPlacements(AllDominoes[val]) : [],
        });
    }

    static getRandomPlayer1Dominoes() {
        const randomPlayer1Dominoes = [];
        const keys = Object.keys(AllDominoes);
        while (randomPlayer1Dominoes.length < PlayerInitialDominoesCount) {
            const randDomino = keys[Math.floor(Math.random() * keys.length)];
            if (!randomPlayer1Dominoes.includes(randDomino)) {
                randomPlayer1Dominoes.push(randDomino);
            }
        }
        return randomPlayer1Dominoes;
    }

    static onDragOver(ev) {
        return (ev.preventDefault());
    }

    getValidPlacements(domino) {
        let validPlacements = [];
        for (let i = 0; i < this.state.board.length; i++) {
            for (let j = 0; j < this.state.board[i].length; j++) {
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
        const num_rows = this.state.board.length;
        const num_cols = this.state.board[0].length;
        if (this.state.total_score === 0) {
            return x < num_rows - 1 && x > 0 && y < num_cols - 1 && y > 0;
        }
        let dots1 = Math.floor(domino.dot / 10);
        let dots2 = Math.floor(domino.dot % 10);
        if (domino.direction === Left || domino.direction === Right) {
            //if already occupied
            if (this.state.board[x][y].dot !== Empty || this.state.board[x][Math.max(0, y - 1)].dot !== Empty || this.state.board[x][Math.min(num_cols - 1, y + 1)].dot !== Empty) {
                return false;
            }
            if (domino.direction === Right) {
                const temp = dots1;
                dots1 = dots2;
                dots2 = temp;
            }
            //to the right normal
            if (y >= 2 && y < num_cols - 1 && (this.state.board[x][y - 2].direction === Left || this.state.board[x][y - 2].direction === Right) && (this.state.board[x][y - 2].dot === dots1 || dots1 === 0 || this.state.board[x][y - 2].dot === 0)) {
                return true;
            }
            //to the right separator
            if (y >= 2 && x >= 1 && x < num_rows - 1 && (this.state.board[x][y - 2].direction === Up || this.state.board[x][y - 2].direction === Down) && this.state.board[x][y - 2].dot === Separator && this.state.board[x - 1][y - 2].dot === this.state.board[x + 1][y - 2].dot && (this.state.board[x + 1][y - 2].dot === 0 || dots1 === 0 || this.state.board[x + 1][y - 2].dot === dots1)) {
                return true;
            }
            //to the left normal
            if (y > 0 && y < num_cols - 2 && (this.state.board[x][y + 2].direction === Left || this.state.board[x][y + 2].direction === Right) && (this.state.board[x][y + 2].dot === dots2 || dots2 === 0 || this.state.board[x][y + 2].dot === 0)) {
                return true;
            }
            //to the left separator
            if (y < num_cols - 2 && x >= 1 && x < num_rows - 1 && (this.state.board[x][y + 2].direction === Up || this.state.board[x][y + 2].direction === Down) && this.state.board[x][y + 2].dot === Separator && this.state.board[x - 1][y + 2].dot === this.state.board[x + 1][y + 2].dot && (this.state.board[x + 1][y + 2].dot === 0 || dots2 === 0 || this.state.board[x + 1][y + 2].dot === dots2)) {
                return true;
            }
            //above separator
            if (x >= 1 && (this.state.board[x - 1][y].direction === Up || this.state.board[x - 1][y].direction === Down) && dots1 === dots2 && (this.state.board[x - 1][y].dot === dots1 || this.state.board[x - 1][y].dot === 0 || dots1 === 0)) {
                return true;
            }
            //below separator
            if (x < num_rows - 1 && (this.state.board[x + 1][y].direction === Up || this.state.board[x + 1][y].direction === Down) && dots1 === dots2 && (this.state.board[x + 1][y].dot === dots1 || this.state.board[x + 1][y].dot === 0 || dots1 === 0)) {
                return true;
            }
        } else {
            //if already occupied
            if (this.state.board[x][y].dot !== Empty || this.state.board[Math.max(0, x - 1)][y].dot !== Empty || this.state.board[Math.min(num_rows - 1, x + 1)][y].dot !== Empty) {
                return false;
            }
            if (domino.direction === Down) {
                const temp = dots1;
                dots1 = dots2;
                dots2 = temp;
            }
            //below normal
            if (x >= 2 && x < num_rows - 1 && (this.state.board[x - 2][y].direction === Up || this.state.board[x - 2][y].direction === Down) && (this.state.board[x - 2][y].dot === dots1 || dots1 === 0 || this.state.board[x - 2][y].dot === 0)) {
                return true;
            }
            //below separator
            if (x >= 2 && y >= 1 && y < num_cols - 1 && (this.state.board[x - 2][y].direction === Left || this.state.board[x - 2][y].direction === Right) && this.state.board[x - 2][y].dot === Separator && this.state.board[x - 2][y - 1].dot === this.state.board[x - 2][y + 1].dot && (this.state.board[x - 2][y + 1].dot === 0 || dots1 === 0 || this.state.board[x - 2][y + 1].dot === dots1)) {
                return true;
            }
            //above normal
            if (x < num_rows - 2 && x > 0 && (this.state.board[x + 2][y].direction === Up || this.state.board[x + 2][y].direction === Down) && (this.state.board[x + 2][y].dot === dots2 || dots2 === 0 || this.state.board[x + 2][y].dot === 0)) {
                return true;
            }
            //above separator
            if (x < num_rows - 2 && y >= 1 && y < num_cols - 1 && (this.state.board[x + 2][y].direction === Left || this.state.board[x + 2][y].direction === Right) && this.state.board[x + 2][y].dot === Separator && this.state.board[x + 2][y - 1].dot === this.state.board[x + 2][y + 1].dot && (this.state.board[x + 2][y + 1].dot === 0 || dots2 === 0 || this.state.board[x + 2][y + 1].dot === dots2)) {
                return true;
            }
            //to the left separator
            if (y >= 1 && (this.state.board[x][y - 1].direction === Left || this.state.board[x][y - 1].direction === Right) && dots1 === dots2 && (this.state.board[x][y - 1].dot === dots1 || this.state.board[x][y - 1].dot === 0 || dots1 === 0)) {
                return true;
            }
            //to the right separator
            if (y < num_cols - 1 && (this.state.board[x][y + 1].direction === Left || this.state.board[x][y + 1].direction === Right) && dots1 === dots2 && (this.state.board[x][y + 1].dot === dots1 || this.state.board[x][y + 1].dot === 0 || dots1 === 0)) {
                return true;
            }
        }
        return false;
    }

    onDrop(ev) {
        ev.preventDefault();
        if (ev.target.id) {
            const placement = { 'x': parseInt(ev.target.id.split(',')[0]), 'y': parseInt(ev.target.id.split(',')[1]) };
            const idDropped = parseInt(ev.dataTransfer.getData('id'));
            if (!this.isValidPlacement(AllDominoes[idDropped], placement)) {
                return;
            }
            let stateCopy = Object.assign({}, this.state);
            delete stateCopy.valid_placements;
            let boardDeepCopy = new Array(this.state.board.length);
            for (let i = 0; i < this.state.board.length; i++) {
                boardDeepCopy[i] = new Array(this.state.board[i].length);
                for (let j = 0; j < this.state.board[i].length; j++) {
                    boardDeepCopy[i][j] = { dot: this.state.board[i][j].dot, direction: this.state.board[i][j].direction };
                }
            }
            stateCopy.board = boardDeepCopy;
            plays.push(stateCopy);
            console.log(plays);
            const domino = AllDominoes[idDropped];
            AllDominoes[idDropped].placement = placement;
            let boardCopy = this.state.board;
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
                boardCopy[placement.x - 1][placement.y].direction = domino.direction;;
                boardCopy[placement.x][placement.y].dot = Separator;
                boardCopy[placement.x][placement.y].direction = domino.direction;;
                boardCopy[placement.x + 1][placement.y].dot = dots2;
                boardCopy[placement.x + 1][placement.y].direction = domino.direction;;
            }
            Game.resizeBoardIfNeeded(boardCopy);
            this.setState({
                player1Deck: this.state.player1Deck.filter((k) => { return k !== idDropped.toString() }),
                board: boardCopy,
                plays_count: this.state.plays_count + 1,
                valid_placements: [],
                total_score: this.state.total_score + dots1 + dots2
            });
        }
    }

    static onReset() {
        return location.reload();
    }

    getEndResult() {
        if (this.state.player1Deck.length === 0) {
            clearInterval(this.interval);
            gameOver = true;
            return "Player wins!";
        } else if (this.state.bank.length === 0) {
            clearInterval(this.interval);
            gameOver = true;
            return "Player loses!"
        }
    }

    getBankDomino() {
        if (this.state.bank.length > 0) {
            const randBankDomino = this.state.bank[Math.floor(Math.random() * this.state.bank.length)];
            let player1DeckCopy = this.state.player1Deck.concat(randBankDomino);
            let stateCopy = Object.assign({}, this.state);
            delete stateCopy.valid_placements;
            plays.push(stateCopy);
            this.setState({
                player1Deck: player1DeckCopy,
                bank: this.state.bank.filter((k) => k !== randBankDomino),
                pieces_taken: this.state.pieces_taken + 1,
                plays_count: this.state.plays_count + 1
            });
        }
    }

    static resizeBoardIfNeeded(board) {
        let min_row = board.length;
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

    nextStep() {
        this.setState(plays[++playsIndex]);
    }

    prevStep() {
        if (!playsIndex) {
            playsIndex = plays.length - 1;
        }
        this.setState(plays[--playsIndex]);
    }

    onUndo() {
        this.setState(plays.pop());
    }

    render() {
        const endResult = this.getEndResult();
        const temp_mins = Math.floor(this.state.elapsed_time / 60);
        const temp_secs = Math.floor(this.state.elapsed_time % 60);
        const mins = temp_mins < 10 ? '0' + temp_mins : temp_mins;
        const secs = temp_secs < 10 ? '0' + temp_secs : temp_secs;
        const avg = this.state.plays_count > 0 ? Math.floor(this.state.elapsed_time / this.state.plays_count) : 0;
        return (
            <div>
                <h1>Dominoes <img src={ImageHeadline} /> Game!</h1>
                <h2>Board:</h2>
                <div
                    onDragOver={(e) => Game.onDragOver(e)}
                    onDrop={(e) => this.onDrop(e)}>
                    <Board allDominoes={AllDominoes} valid_placements={this.state.valid_placements} dominoes={this.state.board}/>
                </div>
                <div className="time_control">
                    <button disabled={(gameOver && playsIndex === 0) || !gameOver} onClick={() => this.prevStep()}>
                        Prev
                    </button>
                    <button disabled={!gameOver} onClick={() => Game.onReset()}>
                        Reset
                    </button>
                    <button disabled={gameOver || (!gameOver && plays.length === 0)} onClick={() => this.onUndo()}>
                        Undo
                    </button>
                    <button disabled={(gameOver && playsIndex === undefined || playsIndex === plays.length - 1) || !gameOver} onClick={() => this.nextStep()}>
                        Next
                    </button>
                </div>
                <h2>Player deck:</h2>
                <div onDragOver={(e) => Game.onDragOver(e)}>
                    <PlayerDeck allDominoes={AllDominoes} sendDrag={this.getDrag} sendData={this.getData} dominoes={this.state.player1Deck} />
                </div>
                <button disabled={gameOver} onClick={() => this.getBankDomino()}>
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