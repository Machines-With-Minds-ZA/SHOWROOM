document.addEventListener("DOMContentLoaded", () => {
  // Prevent the chatbot from being created twice.
  if (document.getElementById("glaChatWidget")) {
    return;
  }

  const API_URL = "/api/deepseek/chat";
  const MAX_HISTORY_MESSAGES = 10;

  const chatWidget = document.createElement("div");
  chatWidget.id = "glaChatWidget";

  chatWidget.innerHTML = `
    <!-- Floating chatbot button -->
    <button
      type="button"
      class="gla-chat-launcher"
      id="glaChatLauncher"
      aria-label="Open GRIT Lab Africa chatbot"
      aria-expanded="false"
    >
      <span class="gla-chat-launcher-label">
        Ask GRIT Lab Africa
      </span>

      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3C6.49 3 2 6.81 2 11.5c0 2.64 1.45 5.08 3.92 6.68L5 22l4.37-2.18c.85.18 1.73.27 2.63.27 5.51 0 10-3.81 10-8.59S17.51 3 12 3Zm-4 10a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 8 13Zm4 0a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 12 13Zm4 0a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 16 13Z"/>
      </svg>
    </button>

    <!-- Blurred background overlay -->
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
        <!-- Chatbot header -->
        <div class="gla-chat-header">
          <div class="gla-chat-header-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 9V7h-2.18A3 3 0 0 0 15 5h-2V3h-2v2H9a3 3 0 0 0-2.82 2H4v2h2v2H4v2h2v2H4v2h2.18A3 3 0 0 0 9 19h6a3 3 0 0 0 2.82-2H20v-2h-2v-2h2v-2h-2V9h2Zm-5 8H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1Zm-5-7h2v2h-2v-2Zm4 0h2v2h-2v-2Zm-4 4h6v2h-6v-2Z"/>
            </svg>
          </div>

          <div class="gla-chat-header-information">
            <h2 id="glaChatTitle">
              GRIT Lab Africa Assistant
            </h2>

            <p class="gla-chat-status">
              <span class="gla-chat-status-dot"></span>
              Online · Powered by AI
            </p>
          </div>

          <button
            type="button"
            class="gla-chat-close"
            id="glaChatClose"
            aria-label="Close chatbot"
          >
            &times;
          </button>
        </div>

        <!-- Messages -->
        <div
          class="gla-chat-messages"
          id="glaChatMessages"
          aria-live="polite"
        >
          <div class="gla-chat-message gla-chat-message-assistant">
            <div class="gla-chat-message-bubble">
              Hello! I am the GRIT Lab Africa assistant. Ask me about our projects, gallery, team or organisation.
            </div>
          </div>
        </div>

        <!-- Message form -->
        <form class="gla-chat-form" id="glaChatForm">
          <input
            type="text"
            class="gla-chat-input"
            id="glaChatInput"
            placeholder="Type your question..."
            maxlength="2000"
            autocomplete="off"
            required
          >

          <button
            type="submit"
            class="gla-chat-send"
            id="glaChatSend"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(chatWidget);

  const launcher = document.getElementById("glaChatLauncher");
  const overlay = document.getElementById("glaChatOverlay");
  const closeButton = document.getElementById("glaChatClose");
  const chatForm = document.getElementById("glaChatForm");
  const messageInput = document.getElementById("glaChatInput");
  const messagesContainer = document.getElementById("glaChatMessages");
  const sendButton = document.getElementById("glaChatSend");

  const conversationHistory = [];

  function openChatbot() {
    overlay.classList.add("gla-chat-visible");
    overlay.setAttribute("aria-hidden", "false");

    launcher.setAttribute("aria-expanded", "true");

    document.body.classList.add("gla-chat-open");

    setTimeout(() => {
      messageInput.focus();
    }, 250);
  }

  function closeChatbot() {
    overlay.classList.remove("gla-chat-visible");
    overlay.setAttribute("aria-hidden", "true");

    launcher.setAttribute("aria-expanded", "false");

    document.body.classList.remove("gla-chat-open");

    launcher.focus();
  }

  function addMessage(role, text, extraClass = "") {
    const messageWrapper = document.createElement("div");

    messageWrapper.className =
      `gla-chat-message gla-chat-message-${role} ${extraClass}`.trim();

    const messageBubble = document.createElement("div");
    messageBubble.className = "gla-chat-message-bubble";

    // textContent prevents HTML or script injection.
    messageBubble.textContent = text;

    messageWrapper.appendChild(messageBubble);
    messagesContainer.appendChild(messageWrapper);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return messageWrapper;
  }

  launcher.addEventListener("click", openChatbot);

  closeButton.addEventListener("click", closeChatbot);

  // Close when the user clicks the dark blurred background.
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeChatbot();
    }
  });

  // Close when Escape is pressed.
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      overlay.classList.contains("gla-chat-visible")
    ) {
      closeChatbot();
    }
  });

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = messageInput.value.trim();

    if (!message) {
      return;
    }

    addMessage("user", message);

    messageInput.value = "";
    messageInput.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = "Sending...";

    const loadingMessage = addMessage(
      "assistant",
      "Thinking...",
      "gla-chat-loading"
    );

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

      const responseData = await apiResponse.json().catch(() => {
        return {};
      });

      loadingMessage.remove();

      if (!apiResponse.ok) {
        throw new Error(
          responseData.error ||
          "The AI assistant could not process your request."
        );
      }

      if (!responseData.reply) {
        throw new Error(
          "The AI assistant returned an empty response."
        );
      }

      addMessage("assistant", responseData.reply);

      conversationHistory.push({
        role: "user",
        content: message
      });

      conversationHistory.push({
        role: "assistant",
        content: responseData.reply
      });

      if (conversationHistory.length > MAX_HISTORY_MESSAGES) {
        conversationHistory.splice(
          0,
          conversationHistory.length - MAX_HISTORY_MESSAGES
        );
      }
    } catch (error) {
      if (loadingMessage.isConnected) {
        loadingMessage.remove();
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
      sendButton.textContent = "Send";

      messageInput.focus();
    }
  });
});