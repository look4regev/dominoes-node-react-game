import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import Game from './game.jsx';

const App = () => (
    <Game />
);

ReactDOM.render(<App />, document.getElementById("root"));
