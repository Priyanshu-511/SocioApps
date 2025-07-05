function validateForm() {
            const title = document.querySelector('input[name="title"]').value;
            const description = document.querySelector('textarea[name="description"]').value;
            const file = document.querySelector('input[name="file"]').value;
            if (!title || !description || !file) {
                alert('Please fill in all fields');
                return false;
            }
            return true;
        }


        document.getElementById('searchForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const query = document.getElementById('searchInput').value.trim();
  const type = document.getElementById('searchType').value;
  
  if (!query) return;
  
  try {
    const response = await fetch(`/search?query=${encodeURIComponent(query)}&type=${type}`);
    const data = await response.json();
    
    if (data.success) {
      displaySearchResults(data.results);
    } else {
      alert('Search failed: ' + data.error);
    }
  } catch (error) {
    console.error('Search error:', error);
    alert('Search failed. Please try again.');
  }
});

function displaySearchResults(results) {
  const resultsContainer = document.getElementById('resultsContainer');
  const searchResults = document.getElementById('searchResults');
  
  if (results.length === 0) {
    resultsContainer.innerHTML = '<p>No results found.</p>';
  } else {
    resultsContainer.innerHTML = results.map(result => {
      if (result.type === 'user') {
        return `
          <div class="search-result user-result">
            <h4>${result.username}</h4>
            <p>${result.email}</p>
            <button onclick="viewUserProfile('${result.id}')">View Profile</button>
          </div>
        `;
      } else if (result.type === 'upload') {
        return `
          <div class="search-result upload-result">
            <h4>${result.title}</h4>
            <p>${result.description}</p>
            <p><small>By: ${result.uploadedBy} | ${new Date(result.uploadedAt).toLocaleDateString()}</small></p>
            ${getFilePreview(result)}
          </div>
        `;
      }
    }).join('');
  }
  
  searchResults.style.display = 'block';
  document.getElementById('userProfile').style.display = 'none';
}

function getFilePreview(upload) {
  if (upload.fileType === 'image') {
    return `<img src="${upload.url}" alt="${upload.title}" style="max-width: 200px;">`;
  } else if (upload.fileType === 'video') {
    return `<video src="${upload.url}" controls style="max-width: 200px;">Video: ${upload.title}</video>`;
  } else if (upload.fileType === 'text') {
    return `<p><a href="${upload.url}" target="_blank">View Text File</a></p>`;
  }
  return '';
}

async function viewUserProfile(userId) {
  try {
    const response = await fetch(`/user/${userId}`);
    const data = await response.json();
    
    if (data.success) {
      displayUserProfile(data.user, data.uploads);
    } else {
      alert('Failed to load user profile: ' + data.error);
    }
  } catch (error) {
    console.error('Profile error:', error);
    alert('Failed to load user profile. Please try again.');
  }
}

function displayUserProfile(user, uploads) {
  document.getElementById('profileUsername').textContent = user.username;
  
  const userUploads = document.getElementById('userUploads');
  if (uploads.length === 0) {
    userUploads.innerHTML = '<p>No uploads yet.</p>';
  } else {
    userUploads.innerHTML = `
      <h4>Uploads (${uploads.length})</h4>
      ${uploads.map(upload => `
        <div class="upload-item">
          <h5>${upload.title}</h5>
          <p>${upload.description}</p>
          <p><small>${new Date(upload.uploadedAt).toLocaleDateString()}</small></p>
          ${getFilePreview(upload)}
        </div>
      `).join('')}
    `;
  }
  
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('userProfile').style.display = 'block';
}

function showSearchResults() {
  document.getElementById('userProfile').style.display = 'none';
  document.getElementById('searchResults').style.display = 'block';
}
