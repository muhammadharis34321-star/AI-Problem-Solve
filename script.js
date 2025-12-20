
      console.log("🚀 AI Problem Solve - Auto Fix Enabled");

      // Automatic URL fix
      const originalFetch = window.fetch;
      window.fetch = function (url, options = {}) {
        if (typeof url === "string") {
          // Fix wrong backend URLs
          if (url.includes("abc-123.ngrok.io")) {
            console.log("🔄 Auto-fixing backend URL...");
            url = url.replace("abc-123.ngrok.io", "python22.pythonanywhere.com");
          }

          // Add CORS for all backend requests
          if (url.includes("python22.pythonanywhere.com")) {
            options.mode = "cors";
            options.credentials = "omit";
          }
        }
        return originalFetch(url, options);
      };

      // DOM Elements
      const chatContainer = document.getElementById("chatContainer");
      const userInput = document.getElementById("userInput");
      const sendButton = document.getElementById("sendButton");
      const newChatBtn = document.getElementById("newChat");
      const clearHistoryBtn = document.getElementById("clearHistory");
      const imageInput = document.getElementById("imageInput");
      const uploadBtn = document.getElementById("uploadBtn");
      const fileName = document.getElementById("fileName");
      const welcomeMessage = document.getElementById("welcomeMessage");
      const languageSelect = document.getElementById("language");
      const darkModeToggle = document.getElementById("darkModeToggle");
      const profilePicture = document.getElementById("profilePicture");
      const changeDpBtn = document.getElementById("changeDpBtn");
      const removeDpBtn = document.getElementById("removeDpBtn");
      const settingsBtn = document.getElementById("settingsBtn");
      const settingsModal = document.getElementById("settingsModal");
      const textColorPicker = document.getElementById("textColorPicker");
      const textColorBtn = document.getElementById("textColorBtn");
      const aiToggle = document.getElementById("aiToggle");
      const menuToggle = document.getElementById("menuToggle");
      const sidebar = document.querySelector(".sidebar");
      const historyList = document.getElementById("historyList");
      const clearAllHistory = document.getElementById("clearAllHistory");
      const tabButtons = document.querySelectorAll(".tab-button");
      const tabPanes = document.querySelectorAll(".tab-pane");
      const messagesContainer = document.getElementById("messagesContainer");

      // Current state
      let currentImage = null;
      let isAIActive = true;
      let currentTextColor = "#333";
      let conversations = JSON.parse(localStorage.getItem("aiConversations")) || [];
      let currentConversationId = null;
      let username = "User";
      let currentLanguage = "en";

      // Event Listeners
      sendButton.addEventListener("click", sendMessage);
      userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });

      newChatBtn.addEventListener("click", startNewChat);
      clearHistoryBtn.addEventListener("click", clearChatHistory);
      uploadBtn.addEventListener("click", () => imageInput.click());
      imageInput.addEventListener("change", handleImageUpload);
      languageSelect.addEventListener("change", changeLanguage);
      darkModeToggle.addEventListener("change", toggleDarkMode);
      changeDpBtn.addEventListener("click", changeProfilePicture);
      removeDpBtn.addEventListener("click", removeProfilePicture);
      settingsBtn.addEventListener("click", openSettings);
      textColorBtn.addEventListener("click", () => {
        settingsModal.style.display = "flex";
        switchTab("appearance");
      });
      aiToggle.addEventListener("click", toggleAI);
      menuToggle.addEventListener("click", toggleSidebar);
      clearAllHistory.addEventListener("click", clearAllHistoryHandler);

      // Tab switching
      tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const tabName = button.getAttribute("data-tab");
          switchTab(tabName);
        });
      });
      
      const headingTexts = ["AI PROBLEM SOLVE", "MUHAMMAD HARIS"];
      const normalTexts = ["AI PROBLEM SOLVE", "MUHAMMAD HARIS"];
      let headingIndex = 0;
      let normalIndex = 0;

      const headingEl = document.getElementById("heading");
      const normalEl = document.getElementById("normalText");
      const speed = 100;

      // Function to animate any text element
      function animate(element, texts, index, type) {
        let currentText = texts[index];
        let displayed = "";
        let i = 0;

        const typer = setInterval(() => {
          displayed += currentText[i];
          element.textContent = displayed;
          i++;
          if (i >= currentText.length) {
            clearInterval(typer);
            setTimeout(() => {
              erase(element, currentText, texts, index, type);
            }, 1000);
          }
        }, speed);
      }

      // Function to erase text
      function erase(element, currentText, texts, index, type) {
        let i = currentText.length;
        const eraser = setInterval(() => {
          element.textContent = currentText.slice(0, i - 1);
          i--;
          if (i <= 0) {
            clearInterval(eraser);
            index = (index + 1) % texts.length;

            // 👇 Recursive loop (calls itself again safely)
            if (type === "heading") {
              headingIndex = index;
              animate(headingEl, headingTexts, headingIndex, "heading");
            } else {
              normalIndex = index;
              animate(normalEl, normalTexts, normalIndex, "normal");
            }
          }
        }, speed);
      }

      // ✅ Start both animations
      if (headingEl && normalEl) {
        animate(headingEl, headingTexts, headingIndex, "heading");
        animate(normalEl, normalTexts, normalIndex, "normal");
      }

      // Auto-resize textarea
      userInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
      });

      // Initialize on page load
      document.addEventListener("DOMContentLoaded", function () {
        // Load dark mode preference
        if (localStorage.getItem("darkMode") === "enabled") {
          document.body.classList.add("dark-mode");
          darkModeToggle.checked = true;
        }

        // Load profile picture
        const savedProfilePic = localStorage.getItem("profilePicture");
        if (savedProfilePic) {
          profilePicture.src = savedProfilePic;
        }

        const colorOptions = document.querySelectorAll(".color-option");
        colorOptions.forEach((option) => {
          option.addEventListener("click", function () {
            const color = this.dataset.color;
            document.body.style.color = color;
            localStorage.setItem("textColor", color);
          });
        });

        const savedColor = localStorage.getItem("textColor");
        if (savedColor) {
          document.body.style.color = savedColor;
        }

        const savedTextColor = localStorage.getItem("textColor");
        if (savedTextColor) {
          currentTextColor = savedTextColor;
          document.documentElement.style.setProperty("--text-color", savedTextColor);
          Array.from(textColorPicker.children).forEach((opt) => {
            if (opt.getAttribute("data-color") === savedTextColor) {
              opt.classList.add("active");
            } else {
              opt.classList.remove("active");
            }
          });
        }

        loadConversations();
        updateWelcomeMessage();

        const savedLanguage = localStorage.getItem("language");
        if (savedLanguage && translations[savedLanguage]) {
          currentLanguage = savedLanguage;
          languageSelect.value = currentLanguage;
          updateLanguage();
        }
      });

      // ✅ DEBUGGING VERSION - Image Upload
      async function handleImageUpload(event) {
          const file = event.target.files[0];
          if (!file) return;

          console.log("📸 File selected:", file.name, file.size, file.type);

          const uploadBtn = document.getElementById('uploadBtn');
          const originalHTML = uploadBtn.innerHTML;
          uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
          
          try {
              // Show original image - WITH FORCED SMALL SIZE
              const reader = new FileReader();
              reader.onload = function(e) {
                  const messagesContainer = document.getElementById('messagesContainer');
                  const welcomeMessage = document.getElementById('welcomeMessage');
                  
                  if(welcomeMessage) welcomeMessage.style.display = 'none';
                  
                  const messageDiv = document.createElement('div');
                  messageDiv.className = 'message user-message';
                  
                  // ✅ YAHAN DIRECT STYLE ADD KARO
                  messageDiv.innerHTML = `
                      <div class="message-content">
                          <div class="image-message">
                              <img src="${e.target.result}" alt="Original" 
                                   style="max-width: 250px; max-height: 250px; width: auto; height: auto; border-radius: 10px; display: block;">
                              <div class="image-info">
                                  <span class="file-icon">📷</span>
                                  <span class="file-name">${file.name}</span>
                                  <span class="file-size">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                              </div>
                          </div>
                      </div>
                  `;
                  messagesContainer.appendChild(messageDiv);
                  scrollAfterMessage();
              };
              reader.readAsDataURL(file);

              // Simulate AI response for image
              setTimeout(() => {
                  uploadBtn.innerHTML = '<i class="fas fa-image"></i>';
                  
                  const aiMessageDiv = document.createElement('div');
                  aiMessageDiv.className = 'message ai-message';
                  
                  aiMessageDiv.innerHTML = `
                      <div class="message-content">
                          <div class="message-text">
                              I see you've uploaded an image! In this demo version, I can't process images directly, 
                              but I can help you with image-related questions and problems.
                          </div>
                      </div>
                  `;
                  
                  messagesContainer.appendChild(aiMessageDiv);
                  scrollAfterMessage();
              }, 2000);
              
          } catch (error) {
              console.error("🔥 Frontend error:", error);
              uploadBtn.innerHTML = '<i class="fas fa-image"></i>';
          } finally {
              document.getElementById('imageInput').value = '';
          }
      }

      // ✅ FIXED: Send Message Function - Text Only
      async function sendMessage() {
          const message = userInput.value.trim();

          if (!message) return;

          if (welcomeMessage) {
              welcomeMessage.style.display = "none";
          }

          addMessageToChat("user", message); // ✅ Text message only
          userInput.value = "";
          userInput.style.height = "auto";

          if (isAIActive) {
              showTypingIndicator();

              try {
                  const response = await fetch(
                      "https://python22.pythonanywhere.com/api/chat",
                      {
                          method: "POST",
                          headers: {
                              "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                              message: message,
                              conversation_id: currentConversationId || "default",
                              language: currentLanguage,
                          }),
                          mode: "cors",
                          credentials: "omit",
                      }
                  );

                  if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                  }

                  const data = await response.json();
                  removeTypingIndicator();

                  if (data && data.success !== false && data.response) {
                      addMessageToChat("ai", data.response);
                  } else {
                      const fallbackResponse = generateAIResponse(message);
                      addMessageToChat("ai", fallbackResponse);
                  }

                  saveConversation();
              } catch (error) {
                  removeTypingIndicator();
                  const fallbackResponse = generateAIResponse(message);
                  addMessageToChat("ai", fallbackResponse);
                  saveConversation();
              }
          } else {
              saveConversation();
          }
      }

      function addMessageToChat(sender, message, image = null) {
          const messageDiv = document.createElement("div");
          messageDiv.className = `message ${sender}-message`;

          const now = new Date();
          const timeString = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          let content = `
              <div class="message-header">
                  <img src="${
                      sender === "user"
                      ? profilePicture.src
                      : "https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
                  }" 
                      alt="${sender === "user" ? "User" : "AI"}" class="message-avatar">
                  <div class="message-sender">${
                      sender === "user"
                      ? translations[currentLanguage].you
                      : translations[currentLanguage].aiAssistant
                  }</div>
              </div>
          `;

          if (image) {
              content += `<div class="message-image"><img src="${image}" alt="Uploaded image"></div>`;
          }
          if (message) {
              content += `<div class="message-text">${escapeHtml(message)}</div>`;
          }

          content += `<div class="message-time">${timeString}</div>`;

          messageDiv.innerHTML = content;
          messagesContainer.appendChild(messageDiv);
          chatContainer.scrollTop = chatContainer.scrollHeight;

          if (!currentConversationId) {
              currentConversationId = Date.now().toString();
          }

          if (!conversations.find((c) => c.id === currentConversationId)) {
              conversations.push({
                  id: currentConversationId,
                  messages: [],
              });
          }

          const currentConv = conversations.find((c) => c.id === currentConversationId);
          currentConv.messages.push({
              sender: sender,
              message: message,
              image: image,
              timestamp: now.getTime(),
          });
      }

      function showTypingIndicator() {
          const typingDiv = document.createElement("div");
          typingDiv.className = "message ai-message typing-indicator";
          typingDiv.id = "typingIndicator";
          typingDiv.innerHTML = `
              <div class="message-header">
                  <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" alt="AI" class="message-avatar">
                  <div class="message-sender">${translations[currentLanguage].aiAssistant}</div>
              </div>
              <div class="typing-dots">
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
              </div>
          `;
          messagesContainer.appendChild(typingDiv);
          chatContainer.scrollTop = chatContainer.scrollHeight;
      }

      function removeTypingIndicator() {
          const typingIndicator = document.getElementById("typingIndicator");
          if (typingIndicator) {
              typingIndicator.remove();
          }
      }

      function generateAIResponse(userMessage) {
          const lang = translations[currentLanguage];
          let response = "";

          const lowerMessage = userMessage.toLowerCase();

          if (
              lowerMessage.includes("hello") ||
              lowerMessage.includes("hi") ||
              lowerMessage.includes("hey")
          ) {
              response = lang.aiResponses.hello;
          } else if (lowerMessage.includes("help")) {
              response = lang.aiResponses.help;
          } else if (lowerMessage.includes("thank")) {
              response = lang.aiResponses.thanks;
          } else if (lowerMessage.includes("image")) {
              response = lang.aiResponses.image;
          } else if (lowerMessage.includes("problem")) {
              response = lang.aiResponses.problem;
          } else {
              const responses = lang.aiResponses.default;
              response = responses[Math.floor(Math.random() * responses.length)];
          }

          return response;
      }

      function startNewChat() {
          if (conversations.length > 0 && messagesContainer.children.length > 0) {
              if (confirm("Start a new chat? Your current conversation will be saved.")) {
                  messagesContainer.innerHTML = "";
                  if (welcomeMessage) {
                      welcomeMessage.style.display = "block";
                  }
                  currentImage = null;
                  fileName.textContent = "";
                  currentConversationId = null;
                  saveConversation();
              }
          } else {
              messagesContainer.innerHTML = "";
              if (welcomeMessage) {
                  welcomeMessage.style.display = "block";
              }
              currentImage = null;
              fileName.textContent = "";
              currentConversationId = null;
          }
      }

      function clearChatHistory() {
          const lang = translations[currentLanguage];
          if (confirm(lang.confirmClear)) {
              conversations = [];
              localStorage.setItem("aiConversations", JSON.stringify(conversations));
              messagesContainer.innerHTML = "";
              if (welcomeMessage) {
                  welcomeMessage.style.display = "block";
              }
              currentConversationId = null;
              currentImage = null;
              fileName.textContent = "";
          }
      }

      function changeLanguage() {
          currentLanguage = languageSelect.value;
          updateLanguage();
          localStorage.setItem("language", currentLanguage);
      }

      function updateLanguage() {
          const lang = translations[currentLanguage];

          userInput.placeholder = lang.placeholder;

          updateMessagesLanguage();
      }

      function updateMessagesLanguage() {
          const messageSenders = document.querySelectorAll(".message-sender");
          const lang = translations[currentLanguage];

          messageSenders.forEach((sender) => {
              const message = sender.closest(".message");
              if (message.classList.contains("user-message")) {
                  sender.textContent = lang.you;
              } else if (message.classList.contains("ai-message")) {
                  sender.textContent = lang.aiAssistant;
              }
          });
      }

      function toggleDarkMode() {
          if (darkModeToggle.checked) {
              document.body.classList.add("dark-mode");
              localStorage.setItem("darkMode", "enabled");
          } else {
              document.body.classList.remove("dark-mode");
              localStorage.setItem("darkMode", "disabled");
          }
      }

      function changeProfilePicture() {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = function (e) {
              const file = e.target.files[0];
              if (file) {
                  const reader = new FileReader();
                  reader.onload = function (e) {
                      profilePicture.src = e.target.result;
                      localStorage.setItem("profilePicture", e.target.result);
                  };
                  reader.readAsDataURL(file);
              }
          };
          input.click();
      }

      function removeProfilePicture() {
          if (confirm("Remove your profile picture?")) {
              profilePicture.src = "https://via.placeholder.com/80";
              localStorage.removeItem("profilePicture");
          }
      }

      function openSettings() {
          settingsModal.style.display = "flex";
          loadHistory();
      }

      function saveSettingsChanges() {
          document.documentElement.style.setProperty("--text-color", currentTextColor);
          localStorage.setItem("textColor", currentTextColor);
          settingsModal.style.display = "none";
      }

      function toggleAI() {
          isAIActive = !isAIActive;
          const lang = translations[currentLanguage];
          aiToggle.innerHTML = `<i class="fas fa-robot"></i> <span class="btn-text"> ${
              isAIActive ? lang.aiOn : "OFF"
          }</span>`;
          aiToggle.style.background = isAIActive ? "" : "#e74c3c";
      }

      function toggleSidebar() {
          sidebar.classList.toggle("active");
      }

      function saveConversation() {
          localStorage.setItem("aiConversations", JSON.stringify(conversations));
      }

      function loadConversations() {
          if (conversations.length > 0) {
              const recentConv = conversations[conversations.length - 1];
              currentConversationId = recentConv.id;

              if (welcomeMessage) welcomeMessage.style.display = "none";
              recentConv.messages.forEach((msg) => {
                  addMessageToChat(msg.sender, msg.message, msg.image);
              });
          }
      }

      function escapeHtml(text) {
          const div = document.createElement("div");
          div.textContent = text;
          return div.innerHTML;
      }

      function updateWelcomeMessage() {
          const lang = translations[currentLanguage];
          // Welcome message update if needed
      }

      function switchTab(tabName) {
          tabButtons.forEach((button) => {
              if (button.getAttribute("data-tab") === tabName) {
                  button.classList.add("active");
              } else {
                  button.classList.remove("active");
              }
          });

          tabPanes.forEach((pane) => {
              if (pane.id === `${tabName}Tab`) {
                  pane.classList.add("active");
              } else {
                  pane.classList.remove("active");
              }
          });

          if (tabName === "history") {
              loadHistory();
          }
      }

      function loadHistory() {
          historyList.innerHTML = "";

          if (conversations.length === 0) {
              const lang = translations[currentLanguage];
              historyList.innerHTML = `<div class="no-history">${lang.noMessages}</div>`;
              return;
          }

          conversations.forEach((conversation, index) => {
              const historyItem = document.createElement("div");
              historyItem.className = "history-item";

              let previewText = "Empty conversation";
              if (conversation.messages.length > 0) {
                  const userMessage = conversation.messages.find(
                      (msg) => msg.sender === "user"
                  );
                  if (userMessage) {
                      previewText = userMessage.message.substring(0, 50);
                      if (userMessage.message.length > 50) {
                          previewText += "...";
                      }
                  }
              }

              historyItem.innerHTML = `
                  <div class="history-item-content">${previewText}</div>
                  <div class="history-item-actions">
                      <button class="history-btn view" data-index="${index}">View</button>
                      <button class="history-btn delete" data-index="${index}">Delete</button>
                  </div>
              `;

              historyList.appendChild(historyItem);
          });

          document.querySelectorAll(".history-btn.view").forEach((btn) => {
              btn.addEventListener("click", function () {
                  const index = this.getAttribute("data-index");
                  viewConversation(index);
              });
          });

          document.querySelectorAll(".history-btn.delete").forEach((btn) => {
              btn.addEventListener("click", function () {
                  const index = this.getAttribute("data-index");
                  deleteConversation(index);
              });
          });
      }

      function viewConversation(index) {
          const conversation = conversations[index];
          if (!conversation) return;

          messagesContainer.innerHTML = "";

          conversation.messages.forEach((msg) => {
              addMessageToChat(msg.sender, msg.message, msg.image);
          });

          currentConversationId = conversation.id;

          if (welcomeMessage) {
              welcomeMessage.style.display = "none";
          }

          settingsModal.style.display = "none";
      }

      function deleteConversation(index) {
          if (confirm("Are you sure you want to delete this conversation?")) {
              conversations.splice(index, 1);
              localStorage.setItem("aiConversations", JSON.stringify(conversations));
              loadHistory();

              if (
                  currentConversationId &&
                  !conversations.find((c) => c.id === currentConversationId)
              ) {
                  startNewChat();
              }
          }
      }

      function clearAllHistoryHandler() {
          const lang = translations[currentLanguage];
          if (confirm(lang.confirmClear)) {
              conversations = [];
              localStorage.setItem("aiConversations", JSON.stringify(conversations));
              loadHistory();
              startNewChat();
          }
      }

      // Color picker functionality
      Array.from(textColorPicker.children).forEach((option) => {
          option.addEventListener("click", function () {
              Array.from(textColorPicker.children).forEach((opt) =>
                  opt.classList.remove("active")
              );
              this.classList.add("active");
              currentTextColor = this.getAttribute("data-color");
          });
      });

      console.log("🎯 AI Problem Solve JavaScript Loaded Successfully!");
