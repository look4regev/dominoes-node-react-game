const Left = 0;
const Empty = -1;

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

const allDominoes = {
    0: { dot: 0, direction: Left }, 1: { dot: 1, direction: Left }, 2: { dot: 2, direction: Left }, 3: { dot: 3, direction: Left }, 4: { dot: 4, direction: Left }, 5: { dot: 5, direction: Left }, 6: { dot: 6, direction: Left },
    11: { dot: 11, direction: Left }, 12: { dot: 12, direction: Left }, 13: { dot: 13, direction: Left }, 14: { dot: 14, direction: Left }, 15: { dot: 15, direction: Left }, 16: { dot: 16, direction: Left },
    22: { dot: 22, direction: Left }, 23: { dot: 23, direction: Left }, 24: { dot: 24, direction: Left }, 25: { dot: 25, direction: Left }, 26: { dot: 26, direction: Left },
    33: { dot: 33, direction: Left }, 34: { dot: 34, direction: Left }, 35: { dot: 35, direction: Left }, 36: { dot: 36, direction: Left },
    44: { dot: 44, direction: Left }, 45: { dot: 45, direction: Left }, 46: { dot: 46, direction: Left },
    55: { dot: 55, direction: Left }, 56: { dot: 56, direction: Left },
    66: { dot: 66, direction: Left }
};

router.get('/health', function (req, res) {
    res.status(200).send({ "status": "UP" });
});

router.post('/signup', function (req, res) {
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
    res.cookie('username', username);
    res.sendStatus(200);
});

router.post('/logout', function (req, res) {
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
    res.cookie('username', '');
    res.sendStatus(200);
});

function getRandomDominoes(players, allDominoes) {
    const randomDominoes = [];
    const keys = Object.keys(allDominoes);
    while (randomDominoes.length < PlayerInitialDominoesCount * players) {
        const randDomino = keys[Math.floor(Math.random() * keys.length)];
        if (!randomDominoes.includes(randDomino)) {
            randomDominoes.push(randDomino);
        }
    }
    return randomDominoes;
}

function getPlayerDecks(players, allDominoes) {
    let player_decks = [];
    const randomDominoes = getRandomDominoes(players, allDominoes);
    for (let i = 0; i < players; i++) {
        const randomPlayerDominoes = randomDominoes.slice(i * PlayerInitialDominoesCount, i * PlayerInitialDominoesCount + PlayerInitialDominoesCount);
        player_decks[i] = Object.keys(allDominoes).filter((k) => randomPlayerDominoes.includes(k));
    }
    return player_decks;
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

function createGame(players, gamename, username) {
    let playerDecks = [];
    for (let i = 0; i < players; i++) {
        playerDecks.push([]);
    }
    return {
        gamename: gamename,
        players: players,
        previous_players: players,
        username: username,
        all_dominoes: allDominoes,
        registered_users: [],
        players_left: [],
        player_turn: -1,
        last_move_draw: false,
        players_finished: [],
        player_decks: playerDecks,
        statistics: new Array(players),
        board: getBoard(9, 9),
        bank: Object.keys(allDominoes)
    };
}

router.post('/creategame', function (req, res) {
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
    games[gamename] = createGame(players, gamename, username);
    res.sendStatus(200);
});

router.post('/updategame', function (req, res) {
    res.contentType('application/json');
    const objectPosted = req.body;
    if (!objectPosted) {
        res.status(500).send({ "error": "must provide game" });
        return;
    }
    let game;
    if ('drawFromBank' in objectPosted) {
        game = objectPosted.game;
        if (!game) {
            res.status(500).send({ "error": "must provide game" });
            return;
        }
        game.last_move_draw = true;
    } else {
        game = objectPosted;
        game.last_move_draw = false;
    }
    if (!game.gamename in games) {
        res.status(500).send({ "error": "game does not exist" });
        return;
    }
    games[game.gamename] = game;
    res.sendStatus(200);
});

router.post('/deletegame', function (req, res) {
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
    if (game.registered_users.length > 0 && game.players_finished.length === 0) {
        res.status(500).send({ "error": "unable to delete due to game having registered players" });
        return;
    }
    games = _.omit(games, [gamename]);
    res.sendStatus(200);
});

function getPlayerStatistics(players) {
    let statistics = [];
    for (let i = 0; i < players; i++) {
        statistics.push({
            plays_count: 0,
            pieces_taken: 0,
            total_score: 0,
            elapsed_time: 0
        });
    }
    return statistics;
}

router.post('/joingame', function (req, res) {
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
    game.registered_users = registeredUsers;
    if (registeredUsers.length === game.players) {
        game.player_turn = 0;
        const playerDecks = getPlayerDecks(game.players, allDominoes);
        const statistics = getPlayerStatistics(game.players);
        let usedDominoes = [];
        for (let i = 0; i < game.players; i++) {
            usedDominoes = usedDominoes.concat(playerDecks[i]);
        }
        game.player_decks = playerDecks;
        game.statistics = statistics;
        game.bank = Object.keys(allDominoes).filter((k) => !usedDominoes.includes(k))
    }
    games[gamename] = game;
    res.sendStatus(200);
});

router.post('/singlegame', function (req, res) {
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
    let game = games[gamename];
    game.registered_users = [username];
    game.players = 1;
    game.player_turn = 0;
    const playerDecks = getPlayerDecks(game.players, allDominoes);
    game.player_decks = playerDecks;
    game.statistics = getPlayerStatistics(game.players);
    game.bank = Object.keys(allDominoes).filter((k) => !playerDecks[0].includes(k));
    games[gamename] = game;
    res.sendStatus(200);
});

router.post('/leavegame', function (req, res) {
    res.contentType('application/json');
    const username = req.body.username;
    const clearRoom = req.body.clearroom;
    if (clearRoom) {
        games[clearRoom] = createGame(games[clearRoom].previous_players, clearRoom, games[clearRoom].username);
        res.sendStatus(200);
        return;
    }
    if (!username) {
        res.status(500).send({ "error": "must provide username" });
        return;
    }
    if (!usernames.includes(username)) {
        res.status(500).send({ "error": "username not signed up" });
        return;
    }
    Object.keys(games).map((gamename) => {
        _.remove(games[gamename].registered_users, (el) => el === username);
    });
    res.sendStatus(200);
});

router.get('/issignedin', function (req, res) {
    res.contentType('application/json');
    const username = req.query.username;
    if (!username) {
        res.status(500).send({ "error": "must provide username" });
        return;
    }
    usernames.includes(username) ? res.send({ "answer": "yes" }) : res.send({ "answer": "no" });
});

router.get('/users', function (req, res) {
    res.contentType('application/json');
    res.send(usernames);
});

router.get('/games', function (req, res) {
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