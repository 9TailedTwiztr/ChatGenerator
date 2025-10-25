document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const addParticipantBtn = document.getElementById('add-participant');
    const participantsList = document.getElementById('participants-list');
    const senderSelect = document.getElementById('sender-select');
    const addMessageBtn = document.getElementById('add-message-btn');
    const messageBody = document.getElementById('message-body');
    const messageTimeline = document.getElementById('message-timeline');
    const generateScreenshotsBtn = document.getElementById('generate-screenshots-btn');
    const generateAo3Btn = document.getElementById('generate-ao3-btn');
    const chatRoomNameInput = document.getElementById('chat-room-name');
    const screenshotContainer = document.getElementById('screenshot-container');
    const chatGeneratorArea = document.getElementById('chat-generator-area');
    const chatBody = chatGeneratorArea.querySelector('.chat-body');
    const chatTitle = chatGeneratorArea.querySelector('#chat-title');
    const ao3OutputSection = document.getElementById('ao3-output-section');
    const ao3Output = document.getElementById('ao3-output');
    const copyAo3CodeBtn = document.getElementById('copy-ao3-code-btn');
    const saveConversationBtn = document.getElementById('save-conversation-btn');
    const loadConversationBtn = document.getElementById('load-conversation-btn');

    // --- State ---
    let messages = [];
    const STORAGE_KEY = 'auroraChatConversation';

    // --- Functions ---
    const getParticipantNames = () => Array.from(document.querySelectorAll('.participant-name')).map(input => input.value.trim()).filter(Boolean);

    function updateSenderDropdown() {
        const names = getParticipantNames();
        senderSelect.innerHTML = '';
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            senderSelect.appendChild(option);
        });
    }

    function renderTimeline() {
        messageTimeline.innerHTML = '';
        messages.forEach((msg, index) => {
            const li = document.createElement('li');
            li.dataset.index = index;

            li.innerHTML = `
                <span class="timeline-text"><strong>${msg.sender}:</strong> ${msg.body}</span>
                <div class="timeline-buttons">
                    <button class="edit-msg-btn">Edit</button>
                    <button class="delete-msg-btn">Delete</button>
                </div>
            `;
            messageTimeline.appendChild(li);
        });
    }

    function handleAddMessage() {
        const sender = senderSelect.value;
        const body = messageBody.value.trim();
        if (sender && body) {
            messages.push({ sender, body });
            messageBody.value = '';
            renderTimeline();
        }
    }

    function handleTimelineClick(e) {
        const target = e.target;
        const li = target.closest('li');
        if (!li) return;

        const index = parseInt(li.dataset.index, 10);

        if (target.classList.contains('delete-msg-btn')) {
            messages.splice(index, 1);
            renderTimeline();
        } else if (target.classList.contains('edit-msg-btn')) {
            const msg = messages[index];
            const names = getParticipantNames();
            const options = names.map(name => `<option value="${name}" ${name === msg.sender ? 'selected' : ''}>${name}</option>`).join('');
            
            li.innerHTML = `
                <div class="timeline-edit-form" style="width: 100%; display: flex; gap: 5px;">
                    <select class="timeline-sender-edit">${options}</select>
                    <input type="text" class="timeline-body-edit" value="${msg.body}" style="flex-grow: 1; margin: 0;">
                </div>
                <div class="timeline-buttons">
                    <button class="save-msg-btn">Save</button>
                    <button class="cancel-edit-btn">Cancel</button>
                </div>
            `;
        } else if (target.classList.contains('save-msg-btn')) {
            const newSender = li.querySelector('.timeline-sender-edit').value;
            const newBody = li.querySelector('.timeline-body-edit').value.trim();
            if (newBody) {
                messages[index] = { sender: newSender, body: newBody };
            }
            renderTimeline();
        } else if (target.classList.contains('cancel-edit-btn')) {
            renderTimeline();
        }
    }
    
    function saveConversation() {
        const conversation = {
            chatName: chatRoomNameInput.value.trim(),
            participants: getParticipantNames(),
            messages: messages
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
        
        saveConversationBtn.textContent = 'Saved!';
        setTimeout(() => { saveConversationBtn.textContent = 'Save Conversation'; }, 2000);
        checkLoadButton();
    }
    
    function loadConversation() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;

        const conversation = JSON.parse(savedData);

        chatRoomNameInput.value = conversation.chatName;
        
        participantsList.innerHTML = '';
        conversation.participants.forEach((name, index) => {
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.className = 'participant-name';
            newInput.placeholder = index === 0 ? "Main Person's Name" : "Participant's Name";
            newInput.value = name;
            participantsList.appendChild(newInput);
        });

        messages = conversation.messages;
        
        updateSenderDropdown();
        renderTimeline();
        
        loadConversationBtn.textContent = 'Loaded!';
        setTimeout(() => { loadConversationBtn.textContent = 'Load Conversation'; }, 2000);
    }

    function checkLoadButton() {
        loadConversationBtn.disabled = !localStorage.getItem(STORAGE_KEY);
    }

    async function generateScreenshots() {
        screenshotContainer.innerHTML = '<h3>Generating...</h3>';
        chatBody.innerHTML = '';
        chatTitle.innerText = chatRoomNameInput.value.trim() || 'Chat Room';
        const mainPersonName = getParticipantNames()[0] || '';

        messages.forEach((msg, index) => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            
            const isFirstInSequence = (index === 0 || messages[index - 1].sender !== msg.sender);
            const isLastInSequence = (index === messages.length - 1 || messages[index + 1].sender !== msg.sender);

            if (msg.sender === mainPersonName) {
                messageDiv.classList.add('main-person');
                if (!isFirstInSequence) messageDiv.classList.add('no-top-right-radius');
                if (!isLastInSequence) messageDiv.classList.add('no-bottom-right-radius');
            } else {
                messageDiv.classList.add('other-person');
                if (!isFirstInSequence) messageDiv.classList.add('no-top-left-radius');
                if (!isLastInSequence) messageDiv.classList.add('no-bottom-left-radius');
                if (isFirstInSequence) {
                    const senderNameDiv = document.createElement('div');
                    senderNameDiv.classList.add('sender-name');
                    senderNameDiv.innerText = msg.sender;
                    messageDiv.appendChild(senderNameDiv);
                }
            }
            
            const messageTextDiv = document.createElement('div');
            messageTextDiv.innerText = msg.body;
            messageDiv.appendChild(messageTextDiv);
            chatBody.appendChild(messageDiv);
        });
        
        const screenshotElement = chatGeneratorArea.querySelector('.screenshot');
        chatBody.scrollTop = 0;
        const contentHeight = chatBody.scrollHeight;
        const visibleHeight = chatBody.clientHeight;
        const screenshotCount = Math.max(1, Math.ceil(contentHeight / visibleHeight));
        screenshotContainer.innerHTML = '';

        for (let i = 0; i < screenshotCount; i++) {
            chatBody.scrollTop = i * visibleHeight;
            const canvas = await html2canvas(screenshotElement, { scrollY: -chatBody.scrollTop });
            
            const wrapper = document.createElement('div');
            wrapper.className = 'screenshot-wrapper';
            const img = document.createElement('img');
            img.src = canvas.toDataURL('image/png');
            wrapper.appendChild(img);
            
            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copy Image';
            copyBtn.className = 'copy-btn';
            copyBtn.onclick = () => canvas.toBlob(blob => {
                navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => { copyBtn.textContent = 'Copy Image'; }, 2000);
                });
            });
            wrapper.appendChild(copyBtn);
            screenshotContainer.appendChild(wrapper);
        }
    }

    function generateAo3Code() {
        const names = getParticipantNames();
        const mainPersonName = names[0] || '';
        const isGroupChat = names.length > 2;
        const chatName = chatRoomNameInput.value.trim() || 'Contact';

        let html = `<div class="phone">\n<p class="messagebody">\n`;
        html += `<span class="header">${chatName}</span><br /><br />\n\n`;

        messages.forEach(msg => {
            if (msg.sender === mainPersonName) {
                html += `<span class="breply">${msg.body}</span><br /><br />\n`;
            } else {
                if (isGroupChat) {
                    html += `<span class="grouptext">${msg.sender}</span><br />\n`;
                }
                html += `<span class="text">${msg.body}</span><br /><br />\n`;
            }
        });

        html += `</p>\n</div>`;
        ao3Output.value = html;
        ao3OutputSection.classList.remove('hidden');
    }

    // --- Event Listeners ---
    addParticipantBtn.addEventListener('click', () => {
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.className = 'participant-name';
        newInput.placeholder = `Participant's Name`;
        participantsList.appendChild(newInput);
        newInput.addEventListener('input', updateSenderDropdown);
    });

    participantsList.addEventListener('input', updateSenderDropdown);
    addMessageBtn.addEventListener('click', handleAddMessage);
    messageTimeline.addEventListener('click', handleTimelineClick);
    generateScreenshotsBtn.addEventListener('click', generateScreenshots);
    generateAo3Btn.addEventListener('click', generateAo3Code);
    saveConversationBtn.addEventListener('click', saveConversation);
    loadConversationBtn.addEventListener('click', loadConversation);

    copyAo3CodeBtn.addEventListener('click', () => {
        ao3Output.select();
        document.execCommand('copy');
        copyAo3CodeBtn.textContent = 'Copied!';
        setTimeout(() => { copyAo3CodeBtn.textContent = 'Copy Code'; }, 2000);
    });

    // --- Initial Setup ---
    updateSenderDropdown();
    checkLoadButton();
});
