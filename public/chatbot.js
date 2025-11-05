/**
 * Bonnie Lass Florals Chatbot
 * AI-powered customer service chatbot using Gemini 2.5 Flash
 */

(function() {
  'use strict';

  // Determine API base URL (consistent with other files)
  const hostname = window.location.hostname;
  const BACKEND_URL = (hostname === 'localhost' || hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://bonnie-lass-florals.onrender.com';
  const CHATBOT_API = `${BACKEND_URL}/api/chatbot`;
  
  // Chat history to maintain conversation context
  let chatHistory = [];
  
  // Chatbot state
  let isChatbotOpen = false;
  let isLoading = false;

  /**
   * Create chatbot HTML structure
   */
  function createChatbotHTML() {
    const chatbotHTML = `
      <div id="chatbot-widget">
        <!-- Chatbot Toggle Button -->
        <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Open chat">
          <div class="chatbot-toggle-icon">
            <svg class="chatbot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <circle cx="9" cy="10" r="1" fill="currentColor"/>
              <circle cx="15" cy="10" r="1" fill="currentColor"/>
              <path d="M9 14c.5.5 1.5 1 3 1s2.5-.5 3-1"/>
            </svg>
          </div>
          <span class="chatbot-pulse"></span>
          <span class="chatbot-notification-badge" id="chatbot-notification" style="display: none;">1</span>
        </button>

        <!-- Chatbot Window -->
        <div id="chatbot-window" class="chatbot-window" style="display: none;">
          <div class="chatbot-header">
            <div class="chatbot-header-content">
              <div class="chatbot-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <circle cx="9" cy="10" r="1.5"/>
                  <circle cx="15" cy="10" r="1.5"/>
                  <path d="M12 17c2.33 0 4.32-1.45 5.12-3.5H6.88c.8 2.05 2.79 3.5 5.12 3.5z"/>
                </svg>
              </div>
              <div class="chatbot-header-text">
                <h3>Floral Assistant</h3>
                <p class="chatbot-status" id="chatbot-status">
                  <span class="status-indicator"></span>
                  Online
                </p>
              </div>
            </div>
            <button id="chatbot-close" class="chatbot-close" aria-label="Close chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div id="chatbot-messages" class="chatbot-messages">
            <div class="chatbot-welcome">
              <div class="chatbot-welcome-icon">🌸</div>
              <h4>Welcome to Bonnie Lass Florals!</h4>
              <p>I'm your floral assistant. I can help you with:</p>
              <ul>
                <li>🌺 Finding products</li>
                <li>💰 Pricing information</li>
                <li>📦 Stock availability</li>
                <li>🎨 Custom arrangements</li>
              </ul>
            </div>
            <div class="chatbot-message assistant">
              <div class="chatbot-avatar-small">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="9" cy="10" r="1.5" fill="white"/>
                  <circle cx="15" cy="10" r="1.5" fill="white"/>
                  <path d="M12 17c2 0 3.5-1 4-2.5H8c.5 1.5 2 2.5 4 2.5z" fill="white"/>
                </svg>
              </div>
              <div class="chatbot-message-content">
                <p>Hi there! 👋 What can I help you with today?</p>
              </div>
            </div>
          </div>

          <div class="chatbot-input-container">
            <textarea 
              id="chatbot-input" 
              class="chatbot-input" 
              placeholder="Type your message..."
              rows="1"
            ></textarea>
            <button id="chatbot-send" class="chatbot-send-button" aria-label="Send message">
              <svg class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>

          <div class="chatbot-footer">
            <svg class="gemini-logo" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            <small>Powered by Google Gemini AI</small>
          </div>
        </div>
      </div>
    `;

    // Insert chatbot HTML into the page
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  }

  /**
   * Add CSS styles for the chatbot
   */
  function addChatbotStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #chatbot-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .chatbot-toggle {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, #85ff85 0%, #a3ffc6 50%, #62f4f2 100%);
        border: none;
        box-shadow: 0 8px 24px rgba(133, 255, 133, 0.4);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: visible;
      }

      .chatbot-toggle:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 12px 32px rgba(133, 255, 133, 0.5);
      }

      .chatbot-toggle:active {
        transform: translateY(-2px) scale(1.02);
      }

      .chatbot-toggle-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: relative;
        z-index: 2;
      }

      .chatbot-icon {
        width: 32px;
        height: 32px;
        color: #1f2937;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      }

      .chatbot-pulse {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, #85ff85 0%, #a3ffc6 50%, #62f4f2 100%);
        opacity: 0.6;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.6;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.15);
          opacity: 0;
        }
      }

      .chatbot-notification-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        border-radius: 50%;
        min-width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        z-index: 3;
        animation: bounce 0.5s ease-in-out;
      }

      @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }

      .chatbot-window {
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 400px;
        max-width: calc(100vw - 40px);
        height: 600px;
        max-height: calc(100vh - 140px);
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .chatbot-header {
        background: linear-gradient(135deg, #85ff85 0%, #a3ffc6 50%, #62f4f2 100%);
        color: #1f2937;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 12px rgba(133, 255, 133, 0.2);
      }

      .chatbot-header-content {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .chatbot-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(31, 41, 55, 0.15);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(31, 41, 55, 0.2);
      }

      .chatbot-avatar svg {
        width: 28px;
        height: 28px;
        color: #1f2937;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }

      .chatbot-header-text h3 {
        margin: 0;
        font-size: 17px;
        font-weight: 700;
        letter-spacing: -0.2px;
      }

      .chatbot-status {
        margin: 4px 0 0;
        font-size: 13px;
        opacity: 0.95;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
        animation: statusPulse 2s ease-in-out infinite;
      }

      @keyframes statusPulse {
        0%, 100% {
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
        }
        50% {
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }
      }

      .chatbot-close {
        background: transparent;
        border: none;
        color: #1f2937;
        cursor: pointer;
        padding: 0;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s;
      }

      .chatbot-close svg {
        width: 20px;
        height: 20px;
      }

      .chatbot-close:hover {
        background: rgba(31, 41, 55, 0.1);
        transform: rotate(90deg);
      }

      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
      }

      .chatbot-messages::-webkit-scrollbar {
        width: 6px;
      }

      .chatbot-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .chatbot-messages::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }

      .chatbot-messages::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }

      .chatbot-welcome {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(254, 230, 138, 0.3);
        border: 1px solid #fbbf24;
      }

      .chatbot-welcome-icon {
        font-size: 48px;
        margin-bottom: 12px;
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .chatbot-welcome h4 {
        margin: 0 0 12px 0;
        color: #92400e;
        font-size: 18px;
        font-weight: 700;
      }

      .chatbot-welcome p {
        margin: 0 0 12px 0;
        color: #78350f;
        font-size: 14px;
      }

      .chatbot-welcome ul {
        list-style: none;
        padding: 0;
        margin: 0;
        text-align: left;
        display: inline-block;
      }

      .chatbot-welcome li {
        color: #78350f;
        font-size: 14px;
        padding: 4px 0;
      }

      .chatbot-message {
        display: flex;
        gap: 10px;
        animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(15px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .chatbot-message.user {
        flex-direction: row-reverse;
      }

      .chatbot-avatar-small {
        width: 32px;
        height: 32px;
        min-width: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #85ff85 0%, #a3ffc6 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(133, 255, 133, 0.3);
      }

      .chatbot-avatar-small svg {
        width: 20px;
        height: 20px;
        color: #1f2937;
      }

      .chatbot-message-content {
        max-width: 75%;
        padding: 12px 16px;
        border-radius: 16px;
        word-wrap: break-word;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .chatbot-message.assistant .chatbot-message-content {
        background: white;
        color: #1f2937;
        border: 1px solid #e5e7eb;
        border-radius: 16px 16px 16px 4px;
      }

      .chatbot-message.user .chatbot-message-content {
        background: linear-gradient(135deg, #85ff85 0%, #a3ffc6 100%);
        color: #1f2937;
        border-radius: 16px 16px 4px 16px;
        box-shadow: 0 4px 12px rgba(133, 255, 133, 0.3);
      }

      .chatbot-message-content p {
        margin: 0;
        font-size: 14px;
        line-height: 1.6;
      }

      .chatbot-message-content p + p {
        margin-top: 10px;
      }

      .chatbot-loading {
        display: flex;
        gap: 6px;
        padding: 10px;
        align-items: center;
      }

      .chatbot-loading-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: linear-gradient(135deg, #85ff85 0%, #a3ffc6 100%);
        animation: bounce 1.4s infinite ease-in-out both;
        box-shadow: 0 2px 4px rgba(133, 255, 133, 0.3);
      }

      .chatbot-loading-dot:nth-child(1) {
        animation-delay: -0.32s;
      }

      .chatbot-loading-dot:nth-child(2) {
        animation-delay: -0.16s;
      }

      @keyframes bounce {
        0%, 80%, 100% {
          transform: scale(0);
          opacity: 0.5;
        }
        40% {
          transform: scale(1.2);
          opacity: 1;
        }
      }

      .chatbot-input-container {
        display: flex;
        gap: 10px;
        padding: 16px;
        background: white;
        border-top: 1px solid #e5e7eb;
      }

      .chatbot-input {
        flex: 1;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 12px 14px;
        font-size: 14px;
        font-family: inherit;
        resize: none;
        max-height: 120px;
        overflow-y: auto;
        transition: all 0.2s;
      }

      .chatbot-input:focus {
        outline: none;
        border-color: #85ff85;
        box-shadow: 0 0 0 4px rgba(133, 255, 133, 0.1);
      }

      .chatbot-input::placeholder {
        color: #9ca3af;
      }

      .chatbot-send-button {
        background: linear-gradient(135deg, #85ff85 0%, #a3ffc6 100%);
        border: none;
        border-radius: 12px;
        color: #1f2937;
        min-width: 44px;
        height: 44px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(133, 255, 133, 0.3);
      }

      .chatbot-send-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(133, 255, 133, 0.4);
      }

      .chatbot-send-button:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(133, 255, 133, 0.3);
      }

      .chatbot-send-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .send-icon {
        width: 20px;
        height: 20px;
        transition: transform 0.2s;
      }

      .chatbot-send-button:hover:not(:disabled) .send-icon {
        transform: translateX(2px);
      }

      .chatbot-footer {
        padding: 10px 16px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .gemini-logo {
        width: 16px;
        height: 16px;
        color: #85ff85;
      }

      .chatbot-footer small {
        color: #6b7280;
        font-size: 11px;
        font-weight: 500;
      }

      /* Error message styling */
      .chatbot-error {
        background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
        border: 1px solid #ef4444;
        border-radius: 12px;
        padding: 12px;
        margin: 8px 0;
        color: #7f1d1d;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
      }

      .chatbot-error-icon {
        font-size: 18px;
      }

      /* Connection status */
      .chatbot-connection-status {
        padding: 8px 16px;
        background: #fef3c7;
        border-bottom: 1px solid #fbbf24;
        font-size: 12px;
        color: #78350f;
        text-align: center;
        display: none;
      }

      .chatbot-connection-status.show {
        display: block;
      }

      @media (max-width: 480px) {
        .chatbot-window {
          bottom: 90px;
          right: 10px;
          left: 10px;
          width: auto;
          max-width: none;
          height: calc(100vh - 110px);
          max-height: none;
          border-radius: 20px 20px 0 0;
        }

        #chatbot-widget {
          bottom: 10px;
          right: 10px;
        }

        .chatbot-toggle {
          width: 56px;
          height: 56px;
        }

        .chatbot-icon {
          width: 28px;
          height: 28px;
        }

        .chatbot-message-content {
          max-width: 85%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Toggle chatbot window
   */
  function toggleChatbot() {
    isChatbotOpen = !isChatbotOpen;
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    
    if (isChatbotOpen) {
      chatbotWindow.style.display = 'flex';
      chatbotToggle.style.display = 'none';
      document.getElementById('chatbot-input').focus();
    } else {
      chatbotWindow.style.display = 'none';
      chatbotToggle.style.display = 'flex';
    }
  }

  /**
   * Add a message to the chat
   */
  function addMessage(content, role = 'assistant') {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${role}`;
    
    // Add avatar for assistant messages
    if (role === 'assistant') {
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'chatbot-avatar-small';
      avatarDiv.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="9" cy="10" r="1.5" fill="white"/>
          <circle cx="15" cy="10" r="1.5" fill="white"/>
          <path d="M12 17c2 0 3.5-1 4-2.5H8c.5 1.5 2 2.5 4 2.5z" fill="white"/>
        </svg>
      `;
      messageDiv.appendChild(avatarDiv);
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'chatbot-message-content';
    
    // Convert line breaks to paragraphs
    const paragraphs = content.split('\n').filter(p => p.trim());
    contentDiv.innerHTML = paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Show loading indicator
   */
  function showLoading() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'chatbot-loading-indicator';
    loadingDiv.className = 'chatbot-message assistant';
    loadingDiv.innerHTML = `
      <div class="chatbot-message-content">
        <div class="chatbot-loading">
          <div class="chatbot-loading-dot"></div>
          <div class="chatbot-loading-dot"></div>
          <div class="chatbot-loading-dot"></div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Hide loading indicator
   */
  function hideLoading() {
    const loadingIndicator = document.getElementById('chatbot-loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }

  /**
   * Show error message with retry option
   */
  function showErrorMessage(message, canRetry = false, retryCallback = null) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'chatbot-error';
    
    const errorIcon = document.createElement('span');
    errorIcon.className = 'chatbot-error-icon';
    errorIcon.textContent = '⚠️';
    
    const errorContent = document.createElement('div');
    errorContent.style.flex = '1';
    
    const errorText = document.createElement('div');
    errorText.innerHTML = `<strong>Error:</strong> ${escapeHtml(message)}`;
    errorContent.appendChild(errorText);
    
    if (canRetry && retryCallback) {
      const retryButton = document.createElement('button');
      retryButton.textContent = 'Retry';
      retryButton.style.cssText = 'margin-top: 8px; padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;';
      retryButton.addEventListener('click', () => {
        errorDiv.remove();
        retryCallback();
      });
      errorContent.appendChild(retryButton);
    }
    
    errorDiv.appendChild(errorIcon);
    errorDiv.appendChild(errorContent);
    messagesContainer.appendChild(errorDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Show connection status banner
   */
  function showConnectionStatus(message, show = true) {
    let statusBanner = document.getElementById('chatbot-connection-status');
    
    if (!statusBanner) {
      statusBanner = document.createElement('div');
      statusBanner.id = 'chatbot-connection-status';
      statusBanner.className = 'chatbot-connection-status';
      const chatbotWindow = document.getElementById('chatbot-window');
      const header = chatbotWindow.querySelector('.chatbot-header');
      header.after(statusBanner);
    }
    
    statusBanner.textContent = message;
    statusBanner.classList.toggle('show', show);
  }

  /**
   * Show admin mode indicator
   */
  function showAdminModeIndicator() {
    const statusElement = document.getElementById('chatbot-status');
    if (statusElement) {
      statusElement.innerHTML = `
        <span class="status-indicator" style="background: #f59e0b;"></span>
        Admin Mode
      `;
    }
    
    // Add admin badge to welcome section
    const welcomeSection = document.querySelector('.chatbot-welcome');
    if (welcomeSection && !document.getElementById('admin-mode-badge')) {
      const adminBadge = document.createElement('div');
      adminBadge.id = 'admin-mode-badge';
      adminBadge.style.cssText = 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 8px 12px; border-radius: 8px; margin-top: 12px; text-align: center; font-size: 13px; font-weight: 600;';
      adminBadge.innerHTML = '🛡️ Admin Mode Active - Product management enabled';
      welcomeSection.appendChild(adminBadge);
    }
  }

  /**
   * Send message to chatbot API
   */
  async function sendMessage(message, isRetry = false) {
    if (isLoading) return;
    
    try {
      isLoading = true;
      showLoading();
      
      // Add user message to history
      chatHistory.push({ role: 'user', content: message });
      
      // Get Firebase auth token if user is logged in
      let authToken = null;
      try {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
          authToken = await firebase.auth().currentUser.getIdToken();
        }
      } catch (authError) {
        console.log('Could not get auth token:', authError);
      }
      
      // Build headers
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token if available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${CHATBOT_API}/message`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          message,
          chatHistory: chatHistory.slice(0, -1) // Don't include the current message
        })
      });
      
      hideLoading();
      
      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 503) {
          throw new Error('The chatbot service is temporarily unavailable. The API key may not be configured. Please try again later or contact support.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Invalid request. Please try again.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again in a few moments.');
        } else {
          throw new Error('Failed to get response from chatbot. Please check your connection.');
        }
      }
      
      const data = await response.json();
      
      if (data.success && data.response) {
        // Add assistant response to history
        chatHistory.push({ role: 'assistant', content: data.response });
        addMessage(data.response, 'assistant');
        
        // If admin mode is detected, show a notice
        if (data.isAdmin && chatHistory.length <= 2) {
          // Show admin mode indicator on first message
          showAdminModeIndicator();
        }
        
        // Clear any connection status
        showConnectionStatus('', false);
      } else {
        throw new Error('Invalid response from chatbot');
      }
      
    } catch (error) {
      console.error('Chatbot error:', error);
      hideLoading();
      
      // Remove the last user message from history if this wasn't a retry
      if (!isRetry && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user') {
        chatHistory.pop();
      }
      
      // Show user-friendly error messages
      let errorMessage = error.message;
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the chatbot service. Please check your internet connection.';
        showConnectionStatus('⚠️ Connection issue - Please check your internet', true);
      }
      
      showErrorMessage(errorMessage, true, function() {
        const input = document.getElementById('chatbot-input');
        input.value = message;
        sendMessage(message, true);
      });
    } finally {
      isLoading = false;
    }
  }

  /**
   * Handle send button click
   */
  function handleSend() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message || isLoading) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Send to API
    sendMessage(message);
  }

  /**
   * Auto-resize textarea
   */
  function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Initialize chatbot
   */
  function initChatbot() {
    // Add styles
    addChatbotStyles();
    
    // Create chatbot HTML
    createChatbotHTML();
    
    // Event listeners
    document.getElementById('chatbot-toggle').addEventListener('click', toggleChatbot);
    document.getElementById('chatbot-close').addEventListener('click', toggleChatbot);
    document.getElementById('chatbot-send').addEventListener('click', handleSend);
    
    const input = document.getElementById('chatbot-input');
    
    // Auto-resize textarea
    input.addEventListener('input', () => autoResizeTextarea(input));
    
    // Handle Enter key (Shift+Enter for new line)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }

})();
