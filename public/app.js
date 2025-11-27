const API_BASE = '/api';

async function createLink() {
  const originalUrl = document.getElementById('originalUrl').value;
  const customCode = document.getElementById('customCode').value;
  const messageDiv = document.getElementById('createMessage');

  if (!originalUrl) {
    showMessage('Please enter a URL', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalUrl,
        customCode: customCode || undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || 'Error creating link', 'error');
      return;
    }

    document.getElementById('shortUrl').textContent = data.shortUrl;
    document.getElementById('resultBox').classList.remove('hidden');
    showMessage('Link created successfully! 🎉', 'success');
    
    document.getElementById('originalUrl').value = '';
    document.getElementById('customCode').value = '';

    loadLinks();
  } catch (err) {
    showMessage('Network error: ' + err.message, 'error');
  }
}

function showMessage(text, type) {
  const messageDiv = document.getElementById('createMessage');
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  
  setTimeout(() => {
    messageDiv.textContent = '';
    messageDiv.className = '';
  }, 5000);
}

document.getElementById('copyBtn').addEventListener('click', () => {
  const shortUrl = document.getElementById('shortUrl').textContent;
  navigator.clipboard.writeText(shortUrl);
  showMessage('Copied to clipboard! 📋', 'success');
});

async function loadLinks() {
  try {
    const response = await fetch(`${API_BASE}/links`);
    const links = await response.json();
    displayLinks(links);
  } catch (err) {
    console.error('Error loading links:', err);
    document.getElementById('tableBody').innerHTML = 
      '<tr><td colspan="5" style="text-align: center; color: #dc3545;">Error loading links</td></tr>';
  }
}

function displayLinks(links) {
  const tbody = document.getElementById('tableBody');
  
  if (links.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">No links yet. Create your first one! 👆</td></tr>';
    return;
  }

  tbody.innerHTML = links.map(link => {
    const lastClicked = link.last_clicked 
      ? new Date(link.last_clicked).toLocaleString()
      : 'Never';

    return `
      <tr>
        <td><code>${link.short_code}</code></td>
        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${link.original_url}">
          <a href="${link.original_url}" target="_blank" style="color: #667eea; text-decoration: none;">
            ${link.original_url}
          </a>
        </td>
        <td><strong>${link.click_count}</strong></td>
        <td style="font-size: 0.9em; color: #666;">${lastClicked}</td>
        <td>
          <button class="delete-btn" onclick="deleteLink('${link.short_code}')">🗑️ Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function deleteLink(code) {
  if (!confirm('Are you sure you want to delete this link?')) return;

  try {
    const response = await fetch(`${API_BASE}/${code}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showMessage('Link deleted successfully', 'success');
      loadLinks();
    } else {
      showMessage('Error deleting link', 'error');
    }
  } catch (err) {
    showMessage('Network error: ' + err.message, 'error');
  }
}

document.getElementById('searchInput').addEventListener('input', async (e) => {
  const query = e.target.value.toLowerCase();
  
  try {
    const response = await fetch(`${API_BASE}/links`);
    const links = await response.json();

    const filtered = links.filter(link =>
      link.short_code.toLowerCase().includes(query) ||
      link.original_url.toLowerCase().includes(query)
    );

    displayLinks(filtered);
  } catch (err) {
    console.error('Search error:', err);
  }
});

// Load links on page load
loadLinks();