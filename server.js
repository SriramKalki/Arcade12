const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const session = require('express-session');
const bodyParser = require('body-parser');
const sanitizeHtml = require('sanitize-html');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static('public'));

let users = [];

db.serialize(() => {
    db.run("CREATE TABLE messages (username TEXT, message TEXT, timestamp TEXT)");
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    if (username) {
        req.session.username = username;
        res.redirect('/');
    } else {
        res.send('Login failed');
    }
});

app.get('/', (req, res) => {
    if (req.session.username) {
        res.sendFile(__dirname + '/public/index.html');
    } else {
        res.sendFile(__dirname + '/public/login.html');
    }
});

wss.on('connection', (ws, req) => {
    const session = req.session;
    if (session && session.username) {
        users.push(session.username);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'users', users }));
            }
        });

        db.each("SELECT username, message, timestamp FROM messages", (err, row) => {
            if (err) {
                console.error(err.message);
            } else {
                ws.send(JSON.stringify({ type: 'message', username: row.username, message: row.message, timestamp: row.timestamp }));
            }
        });

        ws.on('message', (data) => {
            const message = JSON.parse(data);
            message.message = sanitizeHtml(message.message);
            db.run(`INSERT INTO messages(username, message, timestamp) VALUES(?, ?, ?)`, [message.username, message.message, message.timestamp], function(err) {
                if (err) {
                    return console.log(err.message);
                }
            });
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        });

        ws.on('close', () => {
            users = users.filter(user => user !== session.username);
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'users', users }));
                }
            });
        });
    } else {
        ws.close();
    }
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
});
