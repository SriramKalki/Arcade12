const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');

const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = (event) => {
  const message = document.createElement('div');
  message.textContent = event.data;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
};

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = chatInput.value;
  ws.send(message);
  chatInput.value = '';
});
