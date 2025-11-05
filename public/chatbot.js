/**
 * Bonnie Lass Florals Chatbot
 * AI-powered customer service chatbot using Gemini 2.5 Flash
 */

(function() {
  'use strict';

  const BACKEND_URL = window.BACKEND_URL || '';
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
          <img src="/img/logo.png" alt="Chat" class="chatbot-logo">
          <span class="chatbot-badge" id="chatbot-badge">?</span>
        </button>

        <!-- Chatbot Window -->
        <div id="chatbot-window" class="chatbot-window" style="display: none;">
          <div class="chatbot-header">
            <div class="chatbot-header-content">
              <img src="/img/logo.png" alt="Bonnie Lass Florals" class="chatbot-header-logo">
              <div class="chatbot-header-text">
                <h3>Bonnie Lass Florals</h3>
                <p class="chatbot-status">Ask me about our products!</p>
              </div>
            </div>
            <button id="chatbot-close" class="chatbot-close" aria-label="Close chat">&times;</button>
          </div>

          <div id="chatbot-messages" class="chatbot-messages">
            <div class="chatbot-message assistant">
              <div class="chatbot-message-content">
                <p>Hi there! 👋 I'm here to help you find the perfect handmade floral arrangement, wreath, or cottage food product. What are you looking for today?</p>
              </div>
            </div>
          </div>

          <div class="chatbot-input-container">
            <textarea 
              id="chatbot-input" 
              class="chatbot-input" 
              placeholder="Ask about products, pricing, availability..."
              rows="1"
            ></textarea>
            <button id="chatbot-send" class="chatbot-send-button" aria-label="Send message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>

          <div class="chatbot-footer">
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
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #d946ef 0%, #a855f7 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        position: relative;
        padding: 0;
        overflow: hidden;
      }

      .chatbot-toggle:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(168, 85, 247, 0.5);
      }

      .chatbot-toggle:active {
        transform: scale(0.95);
      }

      .chatbot-logo {
        width: 40px;
        height: 40px;
        object-fit: contain;
        border-radius: 50%;
        background: white;
        padding: 2px;
      }

      .chatbot-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        border: 2px solid white;
      }

      .chatbot-window {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 380px;
        max-width: calc(100vw - 40px);
        height: 550px;
        max-height: calc(100vh - 120px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .chatbot-header {
        background: linear-gradient(135deg, #d946ef 0%, #a855f7 100%);
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .chatbot-header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .chatbot-header-logo {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: white;
        padding: 4px;
        object-fit: contain;
      }

      .chatbot-header-text h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .chatbot-status {
        margin: 2px 0 0;
        font-size: 12px;
        opacity: 0.9;
      }

      .chatbot-close {
        background: transparent;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
      }

      .chatbot-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f9fafb;
      }

      .chatbot-message {
        display: flex;
        gap: 8px;
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .chatbot-message.user {
        flex-direction: row-reverse;
      }

      .chatbot-message-content {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 12px;
        word-wrap: break-word;
      }

      .chatbot-message.assistant .chatbot-message-content {
        background: white;
        color: #1f2937;
        border: 1px solid #e5e7eb;
      }

      .chatbot-message.user .chatbot-message-content {
        background: linear-gradient(135deg, #d946ef 0%, #a855f7 100%);
        color: white;
      }

      .chatbot-message-content p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
      }

      .chatbot-message-content p + p {
        margin-top: 8px;
      }

      .chatbot-loading {
        display: flex;
        gap: 4px;
        padding: 8px;
      }

      .chatbot-loading-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #9ca3af;
        animation: bounce 1.4s infinite ease-in-out both;
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
        }
        40% {
          transform: scale(1);
        }
      }

      .chatbot-input-container {
        display: flex;
        gap: 8px;
        padding: 12px;
        background: white;
        border-top: 1px solid #e5e7eb;
      }

      .chatbot-input {
        flex: 1;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 14px;
        font-family: inherit;
        resize: none;
        max-height: 100px;
        overflow-y: auto;
      }

      .chatbot-input:focus {
        outline: none;
        border-color: #a855f7;
        box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
      }

      .chatbot-send-button {
        background: linear-gradient(135deg, #d946ef 0%, #a855f7 100%);
        border: none;
        border-radius: 8px;
        color: white;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, opacity 0.2s;
      }

      .chatbot-send-button:hover:not(:disabled) {
        transform: scale(1.05);
      }

      .chatbot-send-button:active:not(:disabled) {
        transform: scale(0.95);
      }

      .chatbot-send-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .chatbot-footer {
        padding: 8px 16px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      .chatbot-footer small {
        color: #6b7280;
        font-size: 11px;
      }

      @media (max-width: 480px) {
        .chatbot-window {
          bottom: 80px;
          right: 10px;
          left: 10px;
          width: auto;
          max-width: none;
        }

        #chatbot-widget {
          bottom: 10px;
          right: 10px;
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
   * Send message to chatbot API
   */
  async function sendMessage(message) {
    if (isLoading) return;
    
    try {
      isLoading = true;
      showLoading();
      
      // Add user message to history
      chatHistory.push({ role: 'user', content: message });
      
      const response = await fetch(`${CHATBOT_API}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          chatHistory: chatHistory.slice(0, -1) // Don't include the current message
        })
      });
      
      hideLoading();
      
      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }
      
      const data = await response.json();
      
      if (data.success && data.response) {
        // Add assistant response to history
        chatHistory.push({ role: 'assistant', content: data.response });
        addMessage(data.response, 'assistant');
      } else {
        throw new Error('Invalid response from chatbot');
      }
      
    } catch (error) {
      console.error('Chatbot error:', error);
      hideLoading();
      addMessage('Sorry, I encountered an error. Please try again later.', 'assistant');
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
