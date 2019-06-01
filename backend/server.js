let express = require('express');
let router = express.Router();
let _ = require('lodash');

let app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use('/', router);

let usernames = [];
let games = {};

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
    games[gamename] = {
        gamename: gamename,
        players: players,
        username: username,
        registered_users: [],
        started: false
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
    let registeredUsers = game.registered_users;
    if (registeredUsers.length > 0) {
        res.status(500).send({ "error": "unable to delete due to game having registered players" });
        return;
    }
    if (registeredUsers.started) {
        res.status(500).send({ "error": "unable to delete due to game already in progress" });
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
    if (registeredUsers.length < game.players) {
        registeredUsers.push(username);
    } else {
        game.started = true;
    }
    res.sendStatus(200);
});

router.get('/issignedin', function(req, res) {
    res.contentType('application/json');
    const username = req.query.username;
    usernames.includes(username) ? res.send({ "answer": "yes" }) : res.send({ "answer": "no" });
});

router.get('/users', function(req, res) {
    res.contentType('application/json');
    res.send(usernames);
});

router.get('/games', function(req, res) {
    res.contentType('application/json');
    res.send(games);
});

app.listen(8000);