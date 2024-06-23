const socket = new WebSocket('ws://localhost:3000');
let username = '';

socket.addEventListener('open', () => {
    console.log('Connected to the server');
});

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'users') {
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';
        data.users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.textContent = user;
            userItem.addEventListener('click', () => {
                username = user;
            });
            userList.appendChild(userItem);
        });
    } else if (data.type === 'message') {
        const chatBox = document.getElementById('chat-box');
        const message = document.createElement('div');
        message.textContent = `${data.timestamp} - ${data.username}: ${data.message}`;
        chatBox.appendChild(message);
    }
});

document.getElementById('send-button').addEventListener('click', () => {
    const input = document.getElementById('message-input');
    const message = input.value;
    const timestamp = new Date().toLocaleTimeString();
    socket.send(JSON.stringify({ type: 'message', username: 'User', message, timestamp, recipient: username }));
    input.value = '';
});
