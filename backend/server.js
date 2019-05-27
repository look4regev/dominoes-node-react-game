let express = require('express');
let router = express.Router();

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
    const players = req.body.players;
    if (!players) {
        res.status(500).send({ "error": "must provide number of players" });
        return;
    }
    if (players !== 2 && players !== 3) {
        res.status(500).send({ "error": "number of players must be either 2 or 3" });
        return;
    }
    games[gamename] = {
        players: players,
        username: username,
        registered_users: [],
        started: false
    };
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
    if (registeredUsers.length < game.players) {
        registeredUsers.push(username);
    } else {
        game.started = true;
    }
    res.sendStatus(200);
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