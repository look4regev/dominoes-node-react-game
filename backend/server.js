import {Left} from "../frontend/src/game/domino/halfDomino";
import {Empty} from "../frontend/src/game/game";

let express = require('express');
let router = express.Router();
let _ = require('lodash');

let app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use('/', router);

let usernames = [];
let games = {};

const PlayerInitialDominoesCount = 6;

router.post('/signup', function(req, res) {
    res.contentType('application/json');
    const username = req.body.username;
    if (!username) {
        res.status(500).send({ "error": "must provide username" });
        return;
    }
    if (usernames.includes(username)) {
        res.status(500).send({ "error": "username already taken" });
        return;
    }
    usernames.push(username);
    res.sendStatus(200);
});

router.post('/logout', function(req, res) {
    res.contentType('application/json');
    const username = req.body.username;
    if (!username) {
        res.status(500).send({ "error": "must provide username" });
        return;
    }
    if (!usernames.includes(username)) {
        res.status(500).send({ "error": "username not signed up" });
        return;
    }
    _.remove(usernames, (el) => el === username);
    Object.keys(games).map((gamename) => {
        _.remove(games[gamename].registered_users, (el) => el === username);
        if (games[gamename].username === username) {
            games = _.omit(games, [gamename]);
        }
    });
    res.sendStatus(200);
});

function getRandomDominoes(players) {
    const randomDominoes = [];
    const keys = Object.keys(this.state.allDominoes);
    while (randomDominoes.length < PlayerInitialDominoesCount * players) {
        const randDomino = keys[Math.floor(Math.random() * keys.length)];
        if (!randomDominoes.includes(randDomino)) {
            randomDominoes.push(randDomino);
        }
    }
    return randomDominoes;
}

function getGameStates(players) {
    let game_states = [];
    const randomDominoes = getRandomDominoes(players);
    for (let i = 0; i < players; i++ ) {
        const randomPlayerDominoes = randomDominoes.slice(i * PlayerInitialDominoesCount, i * PlayerInitialDominoesCount + PlayerInitialDominoesCount);
        const allDominoes = {
            0:  { dot: 0,  direction: Left }, 1:  { dot: 1,  direction: Left }, 2:  { dot: 2,  direction: Left }, 3:  { dot: 3,  direction: Left }, 4:  { dot: 4,  direction: Left }, 5:  { dot: 5,  direction: Left }, 6:  { dot: 6,  direction: Left },
            11: { dot: 11, direction: Left }, 12: { dot: 12, direction: Left }, 13: { dot: 13, direction: Left }, 14: { dot: 14, direction: Left }, 15: { dot: 15, direction: Left }, 16: { dot: 16 , direction: Left },
            22: { dot: 22, direction: Left }, 23: { dot: 23, direction: Left }, 24: { dot: 24, direction: Left }, 25: { dot: 25, direction: Left }, 26: { dot: 26, direction: Left },
            33: { dot: 33, direction: Left }, 34: { dot: 34, direction: Left }, 35: { dot: 35, direction: Left }, 36: { dot: 36, direction: Left },
            44: { dot: 44, direction: Left }, 45: { dot: 45, direction: Left }, 46: { dot: 46, direction: Left },
            55: { dot: 55, direction: Left }, 56: { dot: 56, direction: Left },
            66: { dot: 66, direction: Left }
        };
        game_states.push({
            player_deck: Object.keys(allDominoes).filter((k) => randomPlayerDominoes.includes(k)),
            plays_count: 0,
            valid_placements: [],
            pieces_taken: 0,
            total_score: 0,
            elapsed_time: 0
        });
    }
    return game_states;
}

function getBoard(num_rows, num_cols) {
    let board = new Array(num_rows);
    for (let i = 0; i < num_rows; i++) {
        board[i] = new Array(num_cols);
        for (let j = 0; j < num_cols; j++) {
            board[i][j] = { dot: Empty };
        }
    }
    return board;
}

router.post('/creategame', function(req, res) {
    res.contentType('application/json');
    const username = req.body.username;
    if (!username) {
        res.status(500).send({ "error": "must provide username" });
        return;
    }
    if (!usernames.includes(username)) {
        res.status(500).send({ "error": "username not signed up" });
        return;
    }
    const gamename = req.body.gamename;
    if (!gamename) {
        res.status(500).send({ "error": "must provide game name" });
        return;
    }
    if (gamename in games) {
        res.status(500).send({ "error": "game name already taken" });
        return;
    }
    let players = req.body.players;
    if (!players) {
        res.status(500).send({ "error": "must provide number of players" });
        return;
    }
    players = parseInt(players);
    if (players !== 2 && players !== 3) {
        res.status(500).send({ "error": "number of players must be either 2 or 3" });
        return;
    }
    const gameStates = getGameStates(players);
    let usedDominoes = [];
    const allDominoes = gameStates[0].allDominoes;
    for (let i = 0; i < players; i++) {
        usedDominoes = usedDominoes.concat(gameStates[i].player_deck);
    }
    games[gamename] = {
        gamename: gamename,
        players: players,
        username: username,
        registered_users: [],
        player_turn: '',
        game_states: gameStates,
        board: getBoard(9, 9),
        bank: Object.keys(allDominoes).filter((k) => !usedDominoes.includes(k))
    };
    res.sendStatus(200);
});

router.post('/deletegame', function(req, res) {
    res.contentType('application/json');
    const username = req.body.username;
    if (!username) {
        res.status(500).send({ "error": "must provide username" });
        return;
    }
    if (!usernames.includes(username)) {
        res.status(500).send({ "error": "username not signed up" });
        return;
    }
    const gamename = req.body.gamename;
    if (!gamename) {
        res.status(500).send({ "error": "must provide game name" });
        return;
    }
    if (!gamename in games) {
        res.status(500).send({ "error": "game does not exist" });
        return;
    }
    const game = games[gamename];
    if (game.username !== username) {
        res.status(500).send({ "error": "user not allowed to delete game" });
        return;
    }
    if (game.registered_users.length > 0) {
        res.status(500).send({ "error": "unable to delete due to game having registered players" });
        return;
    }
    games = _.omit(games, [gamename]);
    res.sendStatus(200);
});

router.post('/joingame', function(req, res) {
    res.contentType('application/json');
    const username = req.body.username;
    if (!username) {
        res.status(500).send({ "error": "must provide username" });
        return;
    }
    if (!usernames.includes(username)) {
        res.status(500).send({ "error": "username not signed up" });
        return;
    }
    const gamename = req.body.gamename;
    if (!gamename) {
        res.status(500).send({ "error": "must provide game name" });
        return;
    }
    if (!gamename in games) {
        res.status(500).send({ "error": "game does not exist" });
        return;
    }
    const game = games[gamename];
    let registeredUsers = game.registered_users;
    if (registeredUsers.length >= game.players) {
        res.status(500).send({ "error": "game room is full" });
        return;
    }
    registeredUsers.push(username);
    res.sendStatus(200);
});

router.get('/issignedin', function(req, res) {
    res.contentType('application/json');
    const username = req.query.username;
    if (!username) {
        res.status(500).send({ "error": "must provide username" });
        return;
    }
    usernames.includes(username) ? res.send({ "answer": "yes" }) : res.send({ "answer": "no" });
});

router.get('/users', function(req, res) {
    res.contentType('application/json');
    res.send(usernames);
});

router.get('/games', function(req, res) {
    res.contentType('application/json');
    const gamename = req.query.gamename;
    if (!gamename) {
        res.send(games);
        return;
    }
    if (gamename in games) {
        res.send(games[gamename]);
    } else {
        res.status(500).send({ "error": "game not found" });
    }
});

app.listen(8000);