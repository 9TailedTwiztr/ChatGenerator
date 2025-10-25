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
    const loadConversationSelect = document.getElementById('load-conversation-select');

    // --- State & Constants ---
    let messages = [];
    const INDEX_KEY = 'auroraChatIndex';
    const DATA_PREFIX = 'auroraChat_';

    // --- Utility Functions ---
    const getParticipantNames = () => Array.from(document.querySelectorAll('.participant-name')).map(input => input.value.trim()).filter(Boolean);
    const generateUID = () => Math.random().toString(36).substring(2, 11);

    function getUniqueUID(index) {
        let newId = generateUID();
        while (index.some(item => item.id === newId)) {
            newId = generateUID();
        }
        return newId;
    }

    // --- Core UI Functions ---
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
                </div>`;
        } else if (target.classList.contains('save-msg-btn')) {
            const newSender = li.querySelector('.timeline-sender-edit').value;
            const newBody = li.querySelector('.timeline-body-edit').value.trim();
            if (newBody) messages[index] = { sender: newSender, body: newBody };
            renderTimeline();
        } else if (target.classList.contains('cancel-edit-btn')) {
            renderTimeline();
        }
    }

    // --- Save/Load Functions ---
    function saveConversation() {
        const chatName = chatRoomNameInput.value.trim();
        if (!chatName) {
            alert("Please enter a chat room name to save the conversation.");
            return;
        }

        const index = JSON.parse(localStorage.getItem(INDEX_KEY)) || [];
        const newId = getUniqueUID(index);
        
        const conversation = {
            chatName: chatName,
            participants: getParticipantNames(),
            messages: messages
        };
        
        localStorage.setItem(DATA_PREFIX + newId, JSON.stringify(conversation));
        index.push({ id: newId, title: chatName });
        localStorage.setItem(INDEX_KEY, JSON.stringify(index));

        saveConversationBtn.textContent = 'Saved!';
        setTimeout(() => { saveConversationBtn.textContent = 'Save Conversation'; }, 2000);
        
        populateLoadDropdown();
    }

    function loadSelectedConversation(id) {
        if (!id) return;
        const savedData = localStorage.getItem(DATA_PREFIX + id);
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
        
        loadConversationSelect.classList.add('hidden');
        loadConversationBtn.classList.remove('hidden');
    }
    
    function populateLoadDropdown() {
        const index = JSON.parse(localStorage.getItem(INDEX_KEY)) || [];
        loadConversationSelect.innerHTML = '<option value="">Choose a conversation...</option>';
        
        if (index.length === 0) {
            loadConversationBtn.disabled = true;
            return;
        }
        
        loadConversationBtn.disabled = false;
        index.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.title;
            loadConversationSelect.appendChild(option);
        });
    }

    // --- Generator Functions ---
    async function generateScreenshots() {
        // ... (This function remains unchanged)
    }

    function generateAo3Code() {
        // ... (This function remains unchanged)
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

    loadConversationBtn.addEventListener('click', () => {
        loadConversationBtn.classList.add('hidden');
        loadConversationSelect.classList.remove('hidden');
        loadConversationSelect.value = "";
    });

    loadConversationSelect.addEventListener('change', (e) => loadSelectedConversation(e.target.value));

    copyAo3CodeBtn.addEventListener('click', () => {
        ao3Output.select();
        document.execCommand('copy');
        copyAo3CodeBtn.textContent = 'Copied!';
        setTimeout(() => { copyAo3CodeBtn.textContent = 'Copy Code'; }, 2000);
    });

    // --- Initial Setup ---
    updateSenderDropdown();
    populateLoadDropdown();
});
