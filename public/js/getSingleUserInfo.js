document.addEventListener("DOMContentLoaded", function () {
  const userId = localStorage.getItem("loggedInUserId");
  const token = localStorage.getItem("token");

  if (!userId || !token) {
    window.location.href = "login.html";
    return;
  }

  let editUsernameModal;

  // Toast notification 
  window.showToast = function(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const alertDiv = toast.querySelector('.alert');
    
    alertDiv.className = `alert alert-dismissible fade show alert-${type}`;
    toastMessage.textContent = message;
    toast.style.display = 'block';
    
    setTimeout(() => hideToast(), 3000);
  };

  window.hideToast = function() {
    document.getElementById('toast').style.display = 'none';
  };

  // user profile information
  function loadUserProfile() {
    fetchMethod(currentUrl + `/api/users/${userId}`, (status, data) => {
      if (status === 200) {
        document.getElementById('welcomeMessage').innerHTML = 
        `Welcome back, <span class="usernameGreet">${data.username}</span>! ★`;


        document.getElementById('usernameDisplay').textContent = data.username;
        document.getElementById('emailDisplay').textContent = data.email;
        
        const createdDate = new Date(data.created_on);
        document.getElementById('createdOnDisplay').textContent = 
          createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        document.getElementById('pointsDisplay').textContent = data.points;
      } else {
        showToast('Failed to load profile information', 'danger');
      }
    }, "GET", null, token);
  }

  // edit username modal
  window.openEditUsernameModal = function() {
    const currentUsername = document.getElementById('usernameDisplay').textContent;
    document.getElementById('newUsername').value = currentUsername;
    
    if (!editUsernameModal) {
      editUsernameModal = new bootstrap.Modal(document.getElementById('editUsernameModal'));
    }
    editUsernameModal.show();
  };

  // edit username submission
  document.getElementById('editUsernameForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newUsername = document.getElementById('newUsername').value.trim();
    
    if (!newUsername) {
      showToast('Username cannot be empty', 'warning');
      return;
    }

    fetchMethod(currentUrl + `/api/users/${userId}`, (status, data) => {
      if (status === 200) {
        showToast('Username changed successfully!', 'success');
        document.getElementById('usernameDisplay').textContent = newUsername;
        document.getElementById('welcomeMessage').innerHTML = 
        `Welcome back, <span class="usernameGreet">${data.username}</span>! ★`;
        
        editUsernameModal.hide();
      } else {
        showToast(data.message || 'Failed to update username', 'danger');
      }
    }, "PUT", { username: newUsername }, token);
  });

  // Delete account
  window.deleteAccount = function() {
    if (!confirm('Are you sure you want to delete your account permanently? This action cannot be undone.')) {
        return;
    }

    fetchMethod(currentUrl + `/api/users/${userId}`, (status, data) => {
      if (status === 200 || status === 204) {  
        showToast('Account deleted successfully', 'success');
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUserId');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1200);
      } else {
        showToast(data?.message || 'Failed to delete account', 'danger');
      }
    }, "DELETE", null, token);
  };

  // Load user's created tasks
  function loadUserTasks() {
    fetchMethod(currentUrl + `/api/challenges/creator/${userId}`, (status, data) => {
      if (status === 200) {
        displayTasks(data);
      } else {
        console.error('Failed to load tasks');
      }
    }, "GET", null, token);
  }

  function displayTasks(tasks) {
    const grid = document.getElementById('tasksGrid');
    
    const createCard = grid.children[0];
    grid.innerHTML = '';
    grid.appendChild(createCard);
    
    tasks.forEach(task => {
      const col = document.createElement('div');
      col.className = 'col-md-6';
      col.innerHTML = createTaskCard(task);
      grid.appendChild(col);
    });
  }

  function createTaskCard(task) {
    return `
      <div class="card task-card" id="task-${task.challenge_id}" style="border-radius: 16px; border: 2px solid var(--border-color); background-color: white;">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="card-title" style="color: var(--text-dark); font-weight: 600;">Task #${task.challenge_id}</h5>
            <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.challenge_id})">
              Delete
            </button>
          </div>
          
          <!-- Description -->
            <div class="mb-3">
            <label class="form-label fw-bold" style="color: var(--text-dark); font-size: 0.9rem;">Description</label>
            <div class="d-flex gap-2 align-items-start">
                <div style="flex: 1;">
                <div id="desc-display-${task.challenge_id}" class="task-field-display">
                    ${task.description}
                </div>
                <textarea id="desc-edit-${task.challenge_id}" class="form-control task-field-edit" style="display: none;" rows="3">${task.description}</textarea>
                </div>
                <button class="btn btn-secondary btn-sm mt-1" onclick="toggleEditField(${task.challenge_id}, 'desc')" style="white-space: nowrap;">
                <span id="desc-btn-${task.challenge_id}">Edit</span>
                </button>
            </div>
            </div>
          
          <!-- Points -->
          <div class="mb-3">
            <label class="form-label fw-bold" style="color: var(--text-dark); font-size: 0.9rem;">Points Reward</label>
            <div id="points-display-${task.challenge_id}" class="task-field-display p-2" style="background: rgb(254, 224, 237); display: inline-block; border-radius: 50%; font-weight: 600;">
              ${task.points}
            </div>
            <input type="number" id="points-edit-${task.challenge_id}" class="form-control task-field-edit" style="display: none; width: 150px;" value="${task.points}" min="1">
            <button class="btn btn-primary btn-sm m-2" onclick="toggleEditField(${task.challenge_id}, 'points')">
              <span id="points-btn-${task.challenge_id}">Edit</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }


  window.toggleEditField = function(challengeId, field) {
    const display = document.getElementById(`${field}-display-${challengeId}`);
    const edit = document.getElementById(`${field}-edit-${challengeId}`);
    const btn = document.getElementById(`${field}-btn-${challengeId}`);
    
    if (edit.style.display === 'none') {
      display.style.display = 'none';
      edit.style.display = 'block';
      btn.textContent = 'Save';
    } else {
      // Save changes
      const newValue = edit.value.trim();
      
      if (!newValue || (field === 'points' && newValue < 1)) {
        showToast('Invalid input', 'warning');
        return;
      }
      
      const updateData = {
        user_id: parseInt(userId),
        description: field === 'desc' ? newValue : display.textContent,
        points: field === 'points' ? parseInt(newValue) : parseInt(document.getElementById(`points-edit-${challengeId}`).value)
      };
      
      // If editing description, keep current points
      if (field === 'desc') {
        updateData.points = parseInt(document.getElementById(`points-display-${challengeId}`).textContent);
      }
      // If editing points, keep current description
      if (field === 'points') {
        updateData.description = document.getElementById(`desc-display-${challengeId}`).textContent;
      }
      
      fetchMethod(currentUrl + `/api/challenges/${challengeId}`, (status, data) => {
        if (status === 200) {
          showToast('Task sucessfully updated!', 'success');
          
          if (field === 'desc') {
            display.textContent = newValue;
          } else {
            display.textContent = newValue;
          }
          
          display.style.display = field === 'points' ? 'inline-block' : 'block';
          edit.style.display = 'none';
          btn.textContent = 'Edit';
        } else {
          showToast(data.message || 'Failed to update task', 'danger');
        }
      }, "PUT", updateData, token);
    }
  };

  // Delete task
    window.deleteTask = function(challengeId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    fetchMethod(currentUrl + `/api/challenges/${challengeId}`, (status, data) => {
        if (status === 200 || status === 204) { 
        showToast('Task deleted successfully!', 'success');
        // Remove the task card
        const taskCard = document.getElementById(`task-${challengeId}`);
        if (taskCard) {
            taskCard.closest('.col-md-6').remove();
        }
        } else if (status === 404) {
        // Task already deleted or doesn't exist
        showToast('Task was already deleted', 'warning');
        const taskCard = document.getElementById(`task-${challengeId}`);
        if (taskCard) {
            taskCard.closest('.col-md-6').remove();
        }
        } else {
        showToast(data?.message || 'Failed to delete task', 'danger');
        }
    }, "DELETE", null, token);
    };

  // create task form submission
  document.getElementById('createTaskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const description = document.getElementById('newTaskDescription').value.trim();
    const points = parseInt(document.getElementById('newTaskPoints').value);
    
    if (!description || points < 1) {
      showToast('Please fill in all fields correctly', 'warning');
      return;
    }

    const newTask = {
      user_id: parseInt(userId),
      description: description,
      points: points
    };

    fetchMethod(currentUrl + `/api/challenges`, (status, data) => {
      if (status === 201 || status === 200) {
        showToast('Task created successfully!', 'success');
        document.getElementById('createTaskForm').reset();
        loadUserTasks(); 
        
      } else {
        showToast(data.message || 'Failed to create task', 'danger');
      }
    }, "POST", newTask, token);
  });

  // Initialize
  loadUserProfile();
  loadUserTasks();
});