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


// Add this to your work.js file or create a new JavaScript file

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchType = document.getElementById('searchType');
    const searchResults = document.getElementById('searchResults');
    const resultsContainer = document.getElementById('resultsContainer');
    const userProfile = document.getElementById('userProfile');

    if (searchForm) {
        searchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await performSearch();
        });
    }

    async function performSearch() {
        const query = searchInput.value.trim();
        const type = searchType.value;
        
        if (!query) {
            alert('Please enter a search term');
            return;
        }

        try {
            showLoading();
            
            const response = await fetch(`/search?query=${encodeURIComponent(query)}&type=${type}`);
            const data = await response.json();
            
            if (data.success) {
                displayResults(data.results, data.totalFound);
            } else {
                showError(data.error);
            }
        } catch (error) {
            console.error('Search error:', error);
            showError('Search failed. Please try again.');
        }
    }

    function displayResults(results, totalFound) {
        searchResults.style.display = 'block';
        userProfile.style.display = 'none';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No results found.</p>';
            return;
        }

        const resultsHTML = results.map(result => {
            if (result.type === 'user') {
                return `
                    <div class="result-item user-result">
                        <div class="result-header">
                            <h4>👤 ${result.name}</h4>
                            <span class="result-type">User</span>
                        </div>
                        <p><strong>Email:</strong> ${result.email}</p>
                        <p><strong>Joined:</strong> ${new Date(result.createdAt).toLocaleDateString()}</p>
                        <button onclick="viewUserProfile('${result.id}')" class="view-profile-btn">
                            View Profile & Uploads
                        </button>
                    </div>
                `;
            } else if (result.type === 'upload') {
                return `
                    <div class="result-item upload-result">
                        <div class="result-header">
                            <h4>📁 ${result.title}</h4>
                            <span class="result-type">Upload</span>
                        </div>
                        <p><strong>Description:</strong> ${result.description}</p>
                        <p><strong>Uploaded by:</strong> 
                            <a href="#" onclick="viewUserProfile('${result.uploadedById}')">${result.uploadedBy}</a>
                        </p>
                        <p><strong>File Type:</strong> ${result.fileType.toUpperCase()}</p>
                        <p><strong>Uploaded:</strong> ${new Date(result.createdAt).toLocaleDateString()}</p>
                        <div class="file-preview">
                            ${getFilePreview(result)}
                        </div>
                    </div>
                `;
            }
        }).join('');

        resultsContainer.innerHTML = `
            <div class="results-summary">
                <p>Found ${totalFound} result(s) for "${searchInput.value}"</p>
            </div>
            ${resultsHTML}
        `;
    }

    function getFilePreview(upload) {
        const { fileType, fileUrl, filename } = upload;
        
        if (fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png') {
            return `<img src="${fileUrl}" alt="${filename}" style="max-width: 200px; max-height: 150px; border-radius: 4px;">`;
        } else if (fileType === 'mp4') {
            return `<video src="${fileUrl}" controls style="max-width: 200px; max-height: 150px; border-radius: 4px;"></video>`;
        } else {
            return `<a href="${fileUrl}" target="_blank" class="file-link">📄 ${filename}</a>`;
        }
    }

    // Make this function global so it can be called from onclick
    window.viewUserProfile = async function(userId) {
        if (!userId) {
            alert('User ID not found');
            return;
        }

        try {
            showLoading();
            
            const response = await fetch(`/user/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                displayUserProfile(data.user, data.uploads);
            } else {
                showError(data.error);
            }
        } catch (error) {
            console.error('Profile error:', error);
            showError('Failed to load user profile');
        }
    };

    function displayUserProfile(user, uploads) {
        searchResults.style.display = 'none';
        userProfile.style.display = 'block';
        
        document.getElementById('profileUsername').textContent = `${user.name}'s Profile`;
        
        const userUploads = document.getElementById('userUploads');
        
        if (uploads.length === 0) {
            userUploads.innerHTML = `
                <div class="profile-info">
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                    <p><strong>Total Uploads:</strong> 0</p>
                    <p>This user hasn't uploaded any files yet.</p>
                </div>
            `;
            return;
        }

        const uploadsHTML = uploads.map(upload => `
            <div class="upload-item">
                <h4>${upload.title}</h4>
                <p>${upload.description}</p>
                <div class="file-preview">
                    ${getFilePreview(upload)}
                </div>
                <small>Uploaded: ${new Date(upload.createdAt).toLocaleDateString()}</small>
            </div>
        `).join('');

        userUploads.innerHTML = `
            <div class="profile-info">
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                <p><strong>Total Uploads:</strong> ${uploads.length}</p>
            </div>
            <div class="user-uploads">
                <h4>Recent Uploads:</h4>
                ${uploadsHTML}
            </div>
        `;
    }

    window.showSearchResults = function() {
        userProfile.style.display = 'none';
        searchResults.style.display = 'block';
    };

    function showLoading() {
        resultsContainer.innerHTML = '<div class="loading">🔍 Searching...</div>';
        searchResults.style.display = 'block';
    }

    function showError(message) {
        resultsContainer.innerHTML = `<div class="error">❌ ${message}</div>`;
        searchResults.style.display = 'block';
    }
});