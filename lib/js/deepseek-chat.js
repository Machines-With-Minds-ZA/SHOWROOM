document.addEventListener("DOMContentLoaded", () => {
  // Stop the widget from being added more than once.
  if (document.getElementById("glaChatWidget")) {
    return;
  }

  const API_URL = "/api/deepseek/chat";
  const STORAGE_KEY = "glaChatHistory";
  const MAX_HISTORY_MESSAGES = 10;

  let conversationHistory = loadSavedHistory();

  const widget = document.createElement("div");
  widget.id = "glaChatWidget";

  widget.innerHTML = `
    <button
      type="button"
      class="gla-chat-launcher"
      id="glaChatLauncher"
      aria-label="Open GRIT Lab Africa Assistant"
      aria-expanded="false"
    >
      <span class="gla-chat-launcher-tooltip">
        Ask GRIT Lab Africa
      </span>

      <span
        class="gla-chat-notification"
        id="glaChatNotification"
      ></span>

      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3C6.49 3 2 6.81 2 11.5c0 2.64 1.45 5.08 3.92 6.68L5 22l4.37-2.18c.85.18 1.73.27 2.63.27 5.51 0 10-3.81 10-8.59S17.51 3 12 3Zm-4 10a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 8 13Zm4 0a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 12 13Zm4 0a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 16 13Z"/>
      </svg>
    </button>

    <div
      class="gla-chat-overlay"
      id="glaChatOverlay"
      aria-hidden="true"
    >
      <div
        class="gla-chat-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="glaChatTitle"
      >
        <div class="gla-chat-header">
          <div class="gla-chat-header-avatar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 9V7h-2.18A3 3 0 0 0 15 5h-2V3h-2v2H9a3 3 0 0 0-2.82 2H4v2h2v2H4v2h2v2H4v2h2.18A3 3 0 0 0 9 19h6a3 3 0 0 0 2.82-2H20v-2h-2v-2h2v-2h-2V9h2Zm-5 8H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1Zm-5-7h2v2h-2v-2Zm4 0h2v2h-2v-2Zm-4 4h6v2h-6v-2Z"/>
            </svg>

            <span class="gla-chat-online-dot"></span>
          </div>

          <div class="gla-chat-header-details">
            <h2 id="glaChatTitle">
              GRIT Lab Africa Assistant
            </h2>

            <p>
              Online · Ask about our projects and organisation
            </p>
          </div>

          <div class="gla-chat-header-actions">
            <button
              type="button"
              class="gla-chat-header-button"
              id="glaChatClear"
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 3v1H4v2h1v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3H9Zm-2 3h10v14H7V6Zm2 2v10h2V8H9Zm4 0v10h2V8h-2Z"/>
              </svg>
            </button>

            <button
              type="button"
              class="gla-chat-header-button gla-chat-close"
              id="glaChatClose"
              aria-label="Close chatbot"
              title="Close"
            >
              &times;
            </button>
          </div>
        </div>

        <div
          class="gla-chat-messages"
          id="glaChatMessages"
          aria-live="polite"
        ></div>

        <div class="gla-chat-quick-section">
          <div class="gla-chat-quick-list">
            <button
              type="button"
              class="gla-chat-quick-button"
              data-question="What is GRIT Lab Africa?"
            >
              What is GRIT Lab Africa?
            </button>

            <button
              type="button"
              class="gla-chat-quick-button"
              data-question="Tell me about your projects."
            >
              Explore projects
            </button>

            <button
              type="button"
              class="gla-chat-quick-button"
              data-question="How can I contact GRIT Lab Africa?"
            >
              Contact information
            </button>

            <button
              type="button"
              class="gla-chat-quick-button"
              data-question="Who is part of the GRIT Lab Africa team?"
            >
              Meet the team
            </button>
          </div>
        </div>

        <form class="gla-chat-form" id="glaChatForm">
          <div class="gla-chat-input-wrapper">
            <textarea
              class="gla-chat-input"
              id="glaChatInput"
              placeholder="Ask us anything..."
              maxlength="2000"
              rows="1"
              required
            ></textarea>

            <button
              type="submit"
              class="gla-chat-send"
              id="glaChatSend"
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m3.4 20.4 17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a1 1 0 0 0-1.38 1.12L3.5 10.5l9.5 1.5-9.5 1.5-1.48 5.78A1 1 0 0 0 3.4 20.4Z"/>
              </svg>
            </button>
          </div>
        </form>

        <div class="gla-chat-footer-note">
          AI responses may occasionally be inaccurate. Verify important information.
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(widget);

  const launcher = document.getElementById("glaChatLauncher");
  const notification = document.getElementById(
    "glaChatNotification"
  );
  const overlay = document.getElementById("glaChatOverlay");
  const closeButton = document.getElementById("glaChatClose");
  const clearButton = document.getElementById("glaChatClear");
  const chatForm = document.getElementById("glaChatForm");
  const messageInput = document.getElementById("glaChatInput");
  const messagesContainer = document.getElementById(
    "glaChatMessages"
  );
  const sendButton = document.getElementById("glaChatSend");
  const quickButtons = document.querySelectorAll(
    ".gla-chat-quick-button"
  );

  renderStartingMessages();

  function loadSavedHistory() {
    try {
      const savedHistory = sessionStorage.getItem(STORAGE_KEY);

      if (!savedHistory) {
        return [];
      }

      const parsedHistory = JSON.parse(savedHistory);

      if (!Array.isArray(parsedHistory)) {
        return [];
      }

      return parsedHistory
        .filter((item) => {
          return (
            item &&
            (item.role === "user" ||
              item.role === "assistant") &&
            typeof item.content === "string"
          );
        })
        .slice(-MAX_HISTORY_MESSAGES);
    } catch (error) {
      console.error("Could not load chatbot history:", error);
      return [];
    }
  }

  function saveHistory() {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(conversationHistory)
      );
    } catch (error) {
      console.error("Could not save chatbot history:", error);
    }
  }

  function renderStartingMessages() {
    messagesContainer.innerHTML = "";

    if (conversationHistory.length === 0) {
      // This message is now one clean line.
      // It will no longer contain the unnecessary indentation.
      addMessage(
        "assistant",
        "Hello! I am the GRIT Lab Africa assistant. Ask me about our projects, gallery, team or organisation.",
        "",
        false
      );

      return;
    }

    conversationHistory.forEach((item) => {
      addMessage(
        item.role,
        item.content,
        "",
        false
      );
    });
  }

  function getAssistantAvatar() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 9V7h-2.18A3 3 0 0 0 15 5h-2V3h-2v2H9a3 3 0 0 0-2.82 2H4v2h2v2H4v2h2v2H4v2h2.18A3 3 0 0 0 9 19h6a3 3 0 0 0 2.82-2H20v-2h-2v-2h2v-2h-2V9h2Zm-5 8H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1Z"/>
      </svg>
    `;
  }

  function addMessage(
    role,
    text,
    extraClass = "",
    shouldScroll = true
  ) {
    const messageWrapper =
      document.createElement("div");

    messageWrapper.className =
      `gla-chat-message gla-chat-message-${role} ${extraClass}`.trim();

    const avatar = document.createElement("div");
    avatar.className = "gla-chat-message-avatar";

    if (role === "assistant") {
      avatar.innerHTML = getAssistantAvatar();
    } else {
      avatar.textContent = "You";
    }

    const bubble = document.createElement("div");
    bubble.className = "gla-chat-message-bubble";

    // textContent protects the website from injected HTML.
    bubble.textContent = text.trim();

    messageWrapper.appendChild(avatar);
    messageWrapper.appendChild(bubble);

    messagesContainer.appendChild(messageWrapper);

    if (shouldScroll) {
      scrollMessagesToBottom();
    }

    return messageWrapper;
  }

  function addTypingIndicator() {
    const messageWrapper =
      document.createElement("div");

    messageWrapper.className =
      "gla-chat-message gla-chat-message-assistant";

    const avatar = document.createElement("div");
    avatar.className = "gla-chat-message-avatar";
    avatar.innerHTML = getAssistantAvatar();

    const bubble = document.createElement("div");
    bubble.className =
      "gla-chat-message-bubble gla-chat-typing";

    bubble.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;

    messageWrapper.appendChild(avatar);
    messageWrapper.appendChild(bubble);

    messagesContainer.appendChild(messageWrapper);
    scrollMessagesToBottom();

    return messageWrapper;
  }

  function scrollMessagesToBottom() {
    requestAnimationFrame(() => {
      messagesContainer.scrollTop =
        messagesContainer.scrollHeight;
    });
  }

  function openChatbot() {
    overlay.classList.add("gla-chat-visible");
    overlay.setAttribute("aria-hidden", "false");

    launcher.setAttribute("aria-expanded", "true");

    notification.classList.add("hidden");

    document.body.classList.add("gla-chat-open");

    setTimeout(() => {
      messageInput.focus();
      scrollMessagesToBottom();
    }, 280);
  }

  function closeChatbot() {
    overlay.classList.remove("gla-chat-visible");
    overlay.setAttribute("aria-hidden", "true");

    launcher.setAttribute("aria-expanded", "false");

    document.body.classList.remove("gla-chat-open");

    launcher.focus();
  }

  function clearConversation() {
    const shouldClear = window.confirm(
      "Clear the chatbot conversation?"
    );

    if (!shouldClear) {
      return;
    }

    conversationHistory = [];

    sessionStorage.removeItem(STORAGE_KEY);

    renderStartingMessages();

    messageInput.value = "";
    resizeMessageInput();
    messageInput.focus();
  }

  function resizeMessageInput() {
    messageInput.style.height = "auto";

    messageInput.style.height =
      `${Math.min(messageInput.scrollHeight, 115)}px`;
  }

  async function sendMessage(providedMessage = "") {
    const message =
      providedMessage.trim() ||
      messageInput.value.trim();

    if (!message || sendButton.disabled) {
      return;
    }

    addMessage("user", message);

    messageInput.value = "";
    resizeMessageInput();

    messageInput.disabled = true;
    sendButton.disabled = true;

    const typingIndicator = addTypingIndicator();

    try {
      const apiResponse = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message,
          history: conversationHistory,
          pageTitle: document.title,
          pagePath: window.location.pathname
        })
      });

      const responseData =
        await apiResponse.json().catch(() => {
          return {};
        });

      typingIndicator.remove();

      if (!apiResponse.ok) {
        throw new Error(
          responseData.error ||
          "The AI assistant could not process your message."
        );
      }

      const reply =
        typeof responseData.reply === "string"
          ? responseData.reply.trim()
          : "";

      if (!reply) {
        throw new Error(
          "The AI assistant returned an empty response."
        );
      }

      addMessage("assistant", reply);

      conversationHistory.push({
        role: "user",
        content: message
      });

      conversationHistory.push({
        role: "assistant",
        content: reply
      });

      if (
        conversationHistory.length >
        MAX_HISTORY_MESSAGES
      ) {
        conversationHistory =
          conversationHistory.slice(
            -MAX_HISTORY_MESSAGES
          );
      }

      saveHistory();
    } catch (error) {
      if (typingIndicator.isConnected) {
        typingIndicator.remove();
      }

      addMessage(
        "assistant",
        error.message ||
        "Something went wrong. Please try again.",
        "gla-chat-error"
      );
    } finally {
      messageInput.disabled = false;
      sendButton.disabled = false;

      messageInput.focus();
      resizeMessageInput();
    }
  }

  launcher.addEventListener("click", openChatbot);

  closeButton.addEventListener("click", closeChatbot);

  clearButton.addEventListener(
    "click",
    clearConversation
  );

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeChatbot();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      overlay.classList.contains(
        "gla-chat-visible"
      )
    ) {
      closeChatbot();
    }
  });

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage();
  });

  messageInput.addEventListener(
    "input",
    resizeMessageInput
  );

  messageInput.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        sendMessage();
      }
    }
  );

  quickButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const question =
        button.dataset.question || "";

      sendMessage(question);
    });
  });
});