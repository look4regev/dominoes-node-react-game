import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import Dominoes from './dominoes.jsx';

const App = () => (
    <Dominoes />
);

ReactDOM.render(<App />, document.getElementById("root"));
