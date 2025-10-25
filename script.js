document.addEventListener('DOMContentLoaded', () => {
    const addParticipantBtn = document.getElementById('add-participant');
    const participantsList = document.getElementById('participants-list');
    const senderSelect = document.getElementById('sender-select');
    const addMessageBtn = document.getElementById('add-message');
    const messageBody = document.getElementById('message-body');
    const messageTimeline = document.getElementById('message-timeline');
    const generateBtn = document.getElementById('generate-btn');
    const chatRoomNameInput = document.getElementById('chat-room-name');
    const screenshotContainer = document.getElementById('screenshot-container');
    const chatGeneratorArea = document.getElementById('chat-generator-area');
    const chatBody = chatGeneratorArea.querySelector('.chat-body');
    const chatTitle = chatGeneratorArea.querySelector('#chat-title');

    let messages = [];

    function updateSenderDropdown() {
        senderSelect.innerHTML = '';
        const participantInputs = document.querySelectorAll('.participant-name');
        participantInputs.forEach(input => {
            const name = input.value.trim();
            if (name) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                senderSelect.appendChild(option);
            }
        });
    }

    addParticipantBtn.addEventListener('click', () => {
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.className = 'participant-name';
        newInput.placeholder = `Participant's Name`;
        participantsList.appendChild(newInput);
        newInput.addEventListener('input', updateSenderDropdown);
    });

    participantsList.addEventListener('input', updateSenderDropdown);

    addMessageBtn.addEventListener('click', () => {
        const sender = senderSelect.value;
        const body = messageBody.value.trim();
        if (sender && body) {
            messages.push({ sender, body });
            const li = document.createElement('li');
            li.textContent = `${sender}: ${body}`;
            messageTimeline.appendChild(li);
            messageBody.value = '';
        }
    });

    generateBtn.addEventListener('click', async () => {
        screenshotContainer.innerHTML = '';
        chatBody.innerHTML = '';
        chatTitle.innerText = chatRoomNameInput.value.trim() || 'Chat Room';
        const mainPersonName = document.querySelector('.participant-name').value.trim();

        messages.forEach((msg, index) => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            
            let senderNameDiv;
            if (msg.sender !== mainPersonName) {
                messageDiv.classList.add('other-person');
                if (index === 0 || messages[index - 1].sender !== msg.sender) {
                    senderNameDiv = document.createElement('div');
                    senderNameDiv.classList.add('sender-name');
                    senderNameDiv.innerText = msg.sender;
                    messageDiv.appendChild(senderNameDiv);
                }
            } else {
                messageDiv.classList.add('main-person');
            }

            const messageTextDiv = document.createElement('div');
            messageTextDiv.innerText = msg.body;
            messageDiv.appendChild(messageTextDiv);
            chatBody.appendChild(messageDiv);
        });
        
        await generateScreenshots();
    });

    async function generateScreenshots() {
        const screenshotElement = chatGeneratorArea.querySelector('.screenshot');
        const originalScrollTop = chatBody.scrollTop;
        chatBody.scrollTop = 0;
        
        let isDone = false;
        while (!isDone) {
            const canvas = await html2canvas(screenshotElement, {
                scrollY: -window.scrollY
            });
            const img = document.createElement('img');
            img.src = canvas.toDataURL('image/png');
            screenshotContainer.appendChild(img);

            chatBody.scrollTop += chatBody.clientHeight;
            if (chatBody.scrollTop >= chatBody.scrollHeight - chatBody.clientHeight) {
                isDone = true;
            }
        }
        chatBody.scrollTop = originalScrollTop;
    }

    // Initial population of dropdown
    updateSenderDropdown();
});
