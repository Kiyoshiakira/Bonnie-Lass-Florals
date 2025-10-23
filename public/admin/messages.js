// API Base URL
const API_BASE = window.API_BASE || 'https://bonnie-lass-florals.onrender.com';

let currentMessages = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Wait for Firebase auth to initialize
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is logged in, fetch messages
      fetchMessages();
      fetchUnreadCount();
    } else {
      // Not logged in, show error
      document.getElementById('messagesContent').innerHTML = '<div class="no-messages">Please log in to view messages.</div>';
    }
  });
});

// Refresh messages function (called by button)
async function refreshMessages() {
  await fetchMessages();
  await fetchUnreadCount();
}

// Fetch unread count
async function fetchUnreadCount() {
  try {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const idToken = await user.getIdToken();
    const response = await fetch(`${API_BASE}/api/messages/unread-count`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const badge = document.getElementById('unreadBadge');
      if (data.count > 0) {
        badge.textContent = data.count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error fetching unread count:', error);
  }
}

// Fetch messages from API
async function fetchMessages() {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      document.getElementById('messagesContent').innerHTML = '<div class="no-messages">Please log in to view messages.</div>';
      return;
    }

    // Get ID token for authentication
    const idToken = await user.getIdToken();

    const response = await fetch(`${API_BASE}/api/messages`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        document.getElementById('notAdminMsg').style.display = 'block';
        document.getElementById('messagesContent').innerHTML = '';
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const messages = await response.json();
    currentMessages = messages;
    renderMessages(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    document.getElementById('messagesContent').innerHTML = '<div class="no-messages">Error loading messages. Please try again.</div>';
  }
}

// Render messages in table
function renderMessages(messages) {
  const container = document.getElementById('messagesContent');
  
  if (!messages || messages.length === 0) {
    container.innerHTML = '<div class="no-messages">No messages yet.</div>';
    return;
  }

  const tableHTML = `
    <table class="messages-table">
      <thead>
        <tr>
          <th>From</th>
          <th>Message</th>
          <th>Received</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${messages.map(msg => renderMessageRow(msg)).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = tableHTML;
}

// Render a single message row
function renderMessageRow(msg) {
  const date = new Date(msg.createdAt);
  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const unreadClass = msg.read ? '' : 'unread';
  const readButtonText = msg.read ? 'Mark Unread' : 'Mark Read';
  
  return `
    <tr class="${unreadClass}" id="message-${msg._id}">
      <td>
        <strong>${escapeHtml(msg.name)}</strong><br>
        <small>${escapeHtml(msg.email)}</small>
      </td>
      <td>
        <div class="message-preview" title="${escapeHtml(msg.message)}">
          ${escapeHtml(msg.message)}
        </div>
      </td>
      <td>
        <small>${formattedDate}</small>
      </td>
      <td>
        <button class="action-btn" onclick="toggleRead('${msg._id}', ${!msg.read})">${readButtonText}</button>
        <button class="action-btn delete" onclick="deleteMessage('${msg._id}')">Delete</button>
      </td>
    </tr>
  `;
}

// Toggle read/unread status
async function toggleRead(messageId, newReadStatus) {
  try {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const idToken = await user.getIdToken();
    const response = await fetch(`${API_BASE}/api/messages/${messageId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ read: newReadStatus })
    });

    if (response.ok) {
      // Update local state
      const message = currentMessages.find(m => m._id === messageId);
      if (message) {
        message.read = newReadStatus;
      }
      
      // Re-render the specific row
      const row = document.getElementById(`message-${messageId}`);
      if (row) {
        const tbody = row.parentElement;
        const index = Array.from(tbody.children).indexOf(row);
        row.outerHTML = renderMessageRow(message);
      }
      
      // Update unread count
      await fetchUnreadCount();
    } else {
      alert('Failed to update message status.');
    }
  } catch (error) {
    console.error('Error updating message:', error);
    alert('Error updating message. Please try again.');
  }
}

// Delete message
async function deleteMessage(messageId) {
  if (!confirm('Are you sure you want to delete this message?')) {
    return;
  }

  try {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const idToken = await user.getIdToken();
    const response = await fetch(`${API_BASE}/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (response.ok) {
      // Remove from local state
      currentMessages = currentMessages.filter(m => m._id !== messageId);
      
      // Re-render messages
      renderMessages(currentMessages);
      
      // Update unread count
      await fetchUnreadCount();
    } else {
      alert('Failed to delete message.');
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    alert('Error deleting message. Please try again.');
  }
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
