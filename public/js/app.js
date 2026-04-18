document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');

    // Store conversation history for the AI
    let conversationHistory = [];

    // Configure marked for security
    marked.setOptions({
        headerIds: false,
        mangle: false
    });

    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.innerHTML = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'bubble';
        
        if (isUser) {
            bubbleDiv.textContent = text;
        } else {
            // Parse markdown and sanitize HTML for AI responses
            const rawHtml = marked.parse(text);
            const cleanHtml = DOMPurify.sanitize(rawHtml);
            bubbleDiv.innerHTML = cleanHtml;
        }

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(bubbleDiv);
        
        chatHistory.appendChild(messageDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function showTyping() {
        typingIndicator.style.display = 'flex';
        scrollToBottom();
    }

    function hideTyping() {
        typingIndicator.style.display = 'none';
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // 1. Add user message to UI
        addMessage(message, true);
        userInput.value = '';
        userInput.focus();

        // 2. Show typing indicator
        showTyping();

        try {
            // 3. Send to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    history: conversationHistory
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Unknown error occurred');
            }

            // 4. Hide typing indicator and show AI response
            hideTyping();
            addMessage(data.reply);

            // 5. Update history
            conversationHistory.push({ role: 'user', parts: [{ text: message }] });
            conversationHistory.push({ role: 'model', parts: [{ text: data.reply }] });

        } catch (error) {
            console.error('Error:', error);
            hideTyping();
            addMessage("Oops! The magical connection was lost. Please try again.");
        }
    }

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Focus input on load
    userInput.focus();
});
