// server.js
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('src'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'src/index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'src/dashboard.html')));

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
