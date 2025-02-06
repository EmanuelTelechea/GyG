
document.addEventListener('DOMContentLoaded', function() {
    const openChatbotButton = document.getElementById('openChatbot');
    const closeChatbotButton = document.getElementById('closeChatbot');
    const chatbot = document.getElementById('chatbot');
    const sendChatbotButton = document.getElementById('sendChatbot');
    const chatbotInput = document.getElementById('chatbotInput');
    const faqList = document.getElementById('faqList');

    openChatbotButton.addEventListener('click', function() {
        chatbot.style.display = 'flex';
        openChatbotButton.style.display = 'none';
    });

    closeChatbotButton.addEventListener('click', function() {
        chatbot.style.display = 'none';
        openChatbotButton.style.display = 'block';
    });

    sendChatbotButton.addEventListener('click', function() {
        const question = chatbotInput.value.trim();
        if (question) {
            const userQuestion = document.createElement('li');
            userQuestion.innerHTML = `<strong>Tú:</strong> ${question}`;
            faqList.appendChild(userQuestion);
            chatbotInput.value = '';

            // Aquí puedes agregar lógica para responder a las preguntas del usuario
            const botResponse = document.createElement('li');
            botResponse.innerHTML = `<strong>Bot:</strong> Lo siento, no tengo una respuesta para esa pregunta.`;
            faqList.appendChild(botResponse);
        }
    });
});