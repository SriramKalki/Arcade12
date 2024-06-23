const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', () => {
    console.log('Connected to the server');
});

socket.addEventListener('message', (event) => {
    const chatBox = document.getElementById('chat-box');
    const message = document.createElement('div');
    message.textContent = event.data;
    chatBox.appendChild(message);
});

document.getElementById('send-button').addEventListener('click', () => {
    const input = document.getElementById('message-input');
    const message = input.value;
    socket.send(message);
    input.value = '';
});
