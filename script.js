document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const addParticipantBtn = document.getElementById("add-participant");
  const participantsList = document.getElementById("participants-list");
  const senderSelect = document.getElementById("sender-select");
  const addMessageBtn = document.getElementById("add-message-btn");
  const messageBody = document.getElementById("message-body");
  const messageTimeline = document.getElementById("message-timeline");
  const generateScreenshotsBtn = document.getElementById(
    "generate-screenshots-btn"
  );
  const generateAo3Btn = document.getElementById("generate-ao3-btn");
  const chatRoomNameInput = document.getElementById("chat-room-name");
  const screenshotContainer = document.getElementById("screenshot-container");
  const chatGeneratorArea = document.getElementById("chat-generator-area");
  const chatBody = chatGeneratorArea.querySelector(".chat-body");
  const chatTitle = chatGeneratorArea.querySelector("#chat-title");
  const ao3OutputSection = document.getElementById("ao3-output-section");
  const ao3Output = document.getElementById("ao3-output");
  const copyAo3HtmlBtn = document.getElementById("copy-ao3-html-btn");
  const saveConversationBtn = document.getElementById("save-conversation-btn");
  const loadConversationBtn = document.getElementById("load-conversation-btn");
  const loadConversationSelect = document.getElementById(
    "load-conversation-select"
  );
  const includeAo3HeaderCheckbox =
    document.getElementById("include-ao3-header");
  const ao3CssOutputSection = document.getElementById("ao3-css-output-section");
  const ao3CssOutput = document.getElementById("ao3-css-output");
  const copyAo3CssBtn = document.getElementById("copy-ao3-css-btn");

  // --- State & Constants ---
  let messages = [];
  const INDEX_KEY = "auroraChatIndex";
  const DATA_PREFIX = "auroraChat_";

  const AO3_CSS_TEMPLATE = `#workskin .phone {
  max-width: 300px;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  display: table;
  margin: auto;
}

#workskin .header {
  min-width: 300px;
  background-color: #f6f6f6;
  border-bottom: 1px solid #b2b2b2;
  color: #000000;
  font-weight: bold;
  padding-bottom: .5em;
  padding-top: .5em;
  margin-left: -.5em;
  margin-right: -.5em;
  margin-bottom: -2em;
  text-align: center;
  text-transform: capitalize;
  display: table;
}

#workskin .messagebody {
  background-color: #FFFFFF;
  display: table;
  padding-left: .5em;
  padding-right: .5em;
}

#workskin .text {
  float: left;
  color: #000000;
  margin: 0 0 0.5em;
  border-radius: 1em;
  padding: 0.5em 1em;
  background: #e5e5ea;
  max-width: 75%;
  clear: both;
  position: relative;
}

#workskin .text::after {
  content: "";
  position: absolute;
  left: -.5em;
  bottom: 0;
  width: 0.5em;
  height: 1em;
  border-right: 0.5em solid #e5e5ea;
  border-bottom-right-radius: 1em 0.5em;
}

#workskin .breply {
  float: right;
  color: #FFFFFF;
  margin: 0 0 0.5em;
  border-radius: 1em;
  padding: 0.5em 1em;
  background: #1289fe;
  max-width: 75%;
  clear: both;
  position: relative;
}

#workskin .breply::after {
  content: "";
  position: absolute;
  right: -0.5em;
  bottom: 0;
  width: 0.5em;
  height: 1em;
  border-left: 0.5em solid #1289fe;
  border-bottom-left-radius: 1em 0.5em;
}

#workskin .grouptext {
  color: #7B7C80;
  font-size: .75em;
  padding-bottom: .5em;
  padding-top: 0;
  margin-left: .5em;
  margin-bottom: -2.5em;
  text-align: left;
  display: table;
  clear: both;
}`;

  // --- Utility Functions ---
  const getParticipantNames = () =>
    Array.from(document.querySelectorAll(".participant-name"))
      .map((input) => input.value.trim())
      .filter(Boolean);
  const generateUID = () => Math.random().toString(36).substring(2, 11);

  function getUniqueUID(index) {
    let newId = generateUID();
    while (index.some((item) => item.id === newId)) {
      newId = generateUID();
    }
    return newId;
  }

  // --- Core UI Functions ---
  function updateSenderDropdown() {
    const names = getParticipantNames();
    senderSelect.innerHTML = "";
    names.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      senderSelect.appendChild(option);
    });
  }

  function renderTimeline() {
    messageTimeline.innerHTML = "";
    messages.forEach((msg, index) => {
      const li = document.createElement("li");
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
      messageBody.value = "";
      renderTimeline();
    }
  }

  function handleTimelineClick(e) {
    const target = e.target;
    const li = target.closest("li");
    if (!li) return;

    const index = parseInt(li.dataset.index, 10);

    if (target.classList.contains("delete-msg-btn")) {
      messages.splice(index, 1);
      renderTimeline();
    } else if (target.classList.contains("edit-msg-btn")) {
      const msg = messages[index];
      const names = getParticipantNames();
      const options = names
        .map(
          (name) =>
            `<option value="${name}" ${
              name === msg.sender ? "selected" : ""
            }>${name}</option>`
        )
        .join("");
      li.innerHTML = `
                <div class="timeline-edit-form" style="width: 100%; display: flex; gap: 5px;">
                    <select class="timeline-sender-edit">${options}</select>
                    <input type="text" class="timeline-body-edit" value="${msg.body}" style="flex-grow: 1; margin: 0;">
                </div>
                <div class="timeline-buttons">
                    <button class="save-msg-btn">Save</button>
                    <button class="cancel-edit-btn">Cancel</button>
                </div>`;
    } else if (target.classList.contains("save-msg-btn")) {
      const newSender = li.querySelector(".timeline-sender-edit").value;
      const newBody = li.querySelector(".timeline-body-edit").value.trim();
      if (newBody) {
        messages[index] = { sender: newSender, body: newBody };
      }
      renderTimeline();
    } else if (target.classList.contains("cancel-edit-btn")) {
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
      messages: messages,
    };

    localStorage.setItem(DATA_PREFIX + newId, JSON.stringify(conversation));
    index.push({ id: newId, title: chatName });
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));

    saveConversationBtn.textContent = "Saved!";
    setTimeout(() => {
      saveConversationBtn.textContent = "Save Conversation";
    }, 2000);

    populateLoadDropdown();
  }

  function loadSelectedConversation(id) {
    if (!id) return;
    const savedData = localStorage.getItem(DATA_PREFIX + id);
    if (!savedData) {
      alert("Could not find saved data.");
      return;
    }

    const conversation = JSON.parse(savedData);
    chatRoomNameInput.value = conversation.chatName;

    participantsList.innerHTML = "";
    conversation.participants.forEach((name, index) => {
      const newInput = document.createElement("input");
      newInput.type = "text";
      newInput.className = "participant-name";
      newInput.placeholder =
        index === 0 ? "Main Person's Name" : "Participant's Name";
      newInput.value = name;
      participantsList.appendChild(newInput);
    });

    messages = conversation.messages;
    updateSenderDropdown();
    renderTimeline();

    loadConversationSelect.classList.add("hidden");
    loadConversationBtn.classList.remove("hidden");
  }

  function populateLoadDropdown() {
    const index = JSON.parse(localStorage.getItem(INDEX_KEY)) || [];
    loadConversationSelect.innerHTML =
      '<option value="">Choose a conversation...</option>';

    if (index.length === 0) {
      loadConversationBtn.disabled = true;
      return;
    }

    loadConversationBtn.disabled = false;
    index.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.title;
      loadConversationSelect.appendChild(option);
    });
  }

  // --- Generator Functions ---
  async function generateScreenshots() {
    screenshotContainer.innerHTML = "<h3>Generating...</h3>";
    chatBody.innerHTML = "";
    chatTitle.innerText = chatRoomNameInput.value.trim() || "Chat Room";
    const mainPersonName = getParticipantNames()[0] || "";

    messages.forEach((msg, index) => {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");

      const isFirstInSequence =
        index === 0 || messages[index - 1].sender !== msg.sender;
      const isLastInSequence =
        index === messages.length - 1 ||
        messages[index + 1].sender !== msg.sender;

      if (msg.sender === mainPersonName) {
        messageDiv.classList.add("main-person");
        if (!isFirstInSequence) messageDiv.classList.add("no-top-right-radius");
        if (!isLastInSequence)
          messageDiv.classList.add("no-bottom-right-radius");
      } else {
        messageDiv.classList.add("other-person");
        if (!isFirstInSequence) messageDiv.classList.add("no-top-left-radius");
        if (!isLastInSequence)
          messageDiv.classList.add("no-bottom-left-radius");
        if (isFirstInSequence) {
          const senderNameDiv = document.createElement("div");
          senderNameDiv.classList.add("sender-name");
          senderNameDiv.innerText = msg.sender;
          messageDiv.appendChild(senderNameDiv);
        }
      }

      const messageTextDiv = document.createElement("div");
      messageTextDiv.innerText = msg.body;
      messageDiv.appendChild(messageTextDiv);
      chatBody.appendChild(messageDiv);
    });

    const screenshotElement = chatGeneratorArea.querySelector(".screenshot");
    chatBody.scrollTop = 0;
    const contentHeight = chatBody.scrollHeight;
    const visibleHeight = chatBody.clientHeight;
    const screenshotCount = Math.max(
      1,
      Math.ceil(contentHeight / visibleHeight)
    );
    screenshotContainer.innerHTML = "";

    for (let i = 0; i < screenshotCount; i++) {
      chatBody.scrollTop = i * visibleHeight;
      const canvas = await html2canvas(screenshotElement, {
        scrollY: -chatBody.scrollTop,
      });

      const wrapper = document.createElement("div");
      wrapper.className = "screenshot-wrapper";
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      wrapper.appendChild(img);

      const copyBtn = document.createElement("button");
      copyBtn.textContent = "Copy Image";
      copyBtn.className = "copy-btn";
      copyBtn.onclick = () =>
        canvas.toBlob((blob) => {
          navigator.clipboard
            .write([new ClipboardItem({ "image/png": blob })])
            .then(() => {
              copyBtn.textContent = "Copied!";
              setTimeout(() => {
                copyBtn.textContent = "Copy Image";
              }, 2000);
            });
        });
      wrapper.appendChild(copyBtn);
      screenshotContainer.appendChild(wrapper);
    }
  }

  function generateAo3Code() {
    const names = getParticipantNames();
    const mainPersonName = names[0] || "";
    const isGroupChat = names.length > 2;
    const chatName = chatRoomNameInput.value.trim() || "Contact";
    const includeHeader = includeAo3HeaderCheckbox.checked;

    let html = `<div class="phone">\n<p class="messagebody">\n`;

    if (includeHeader) {
      html += `<span class="header">${chatName}</span><br /><br />\n\n`;
    }

    messages.forEach((msg) => {
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
    ao3OutputSection.classList.remove("hidden");

    ao3CssOutput.value = AO3_CSS_TEMPLATE;
    ao3CssOutputSection.classList.remove("hidden");
  }

  // --- Event Listeners ---
  addParticipantBtn.addEventListener("click", () => {
    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.className = "participant-name";
    newInput.placeholder = `Participant's Name`;
    participantsList.appendChild(newInput);
    newInput.addEventListener("input", updateSenderDropdown);
  });

  participantsList.addEventListener("input", updateSenderDropdown);
  addMessageBtn.addEventListener("click", handleAddMessage);
  messageTimeline.addEventListener("click", handleTimelineClick);
  generateScreenshotsBtn.addEventListener("click", generateScreenshots);
  generateAo3Btn.addEventListener("click", generateAo3Code);
  saveConversationBtn.addEventListener("click", saveConversation);

  loadConversationBtn.addEventListener("click", () => {
    loadConversationBtn.classList.add("hidden");
    loadConversationSelect.classList.remove("hidden");
    loadConversationSelect.value = "";
  });

  loadConversationSelect.addEventListener("change", (e) =>
    loadSelectedConversation(e.target.value)
  );

  copyAo3HtmlBtn.addEventListener("click", () => {
    ao3Output.select();
    document.execCommand("copy");
    copyAo3HtmlBtn.textContent = "Copied!";
    setTimeout(() => {
      copyAo3HtmlBtn.textContent = "Copy HTML";
    }, 2000);
  });

  copyAo3CssBtn.addEventListener("click", () => {
    ao3CssOutput.select();
    document.execCommand("copy");
    copyAo3CssBtn.textContent = "Copied!";
    setTimeout(() => {
      copyAo3CssBtn.textContent = "Copy CSS";
    }, 2000);
  });

  // --- Initial Setup ---
  updateSenderDropdown();
  populateLoadDropdown();
});
