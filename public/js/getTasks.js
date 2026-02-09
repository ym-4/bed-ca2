document.addEventListener("DOMContentLoaded", function () {
  const userId = localStorage.getItem("loggedInUserId");
  const token = localStorage.getItem("token");

  window.userPowerBonus = { has_bonus: false, multiplier: 1.00, bonus_percent: 0 };

  let completeTaskModal;
  let editCommentModal;
  let currentChallengeId = null;
  let currentCompletionId = null;

    if (userId && token) {
        // Get user's power bonus
        fetchMethod(currentUrl + `/api/challenges/users/${userId}/power-bonus`, (bonusStatus, bonusData) => {
            if (bonusStatus === 200 && bonusData.has_bonus) {
                window.userPowerBonus = bonusData;
                
                // Show bonus activated
                const bonusIndicator = document.createElement('div');
                bonusIndicator.className = 'alert alert-info mb-4';
                bonusIndicator.innerHTML = `
                    <strong>⚡ Power Boost Active!</strong>
                    Your equipped pet gives you <b>${bonusData.bonus_percent}% extra </b> bonus points on task completion!
                `;
                
                const availableTasksDiv = document.getElementById('availableTasks');
                if (availableTasksDiv) {
                    availableTasksDiv.parentNode.insertBefore(bonusIndicator, availableTasksDiv);
                }
            }
        }, "GET", null, token);
    }

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



  // Available Tasks
  const callbackForAvailableTasks = (responseStatus, responseData) => {
    const container = document.getElementById("availableTasks");
    
    if (responseStatus !== 200 || !responseData || responseData.length === 0) {
      container.innerHTML = '<p class="text-center col-12">No tasks available!</p>';
      return;
    }

    let html = '';
    responseData.forEach(task => {
    const basePoints = task.points;
    const bonusMultiplier = window.userPowerBonus?.multiplier || 1.00;
    const bonusPoints = Math.round(basePoints * bonusMultiplier);
    
    const isDisabled = !userId || !token ? 'disabled' : '';
    const buttonText = !userId || !token ? 'Please login to attempt' : 'Mark as Completed';
    
    html += `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title" style="color: var(--primary-color);">${task.description}</h5>
                    <p class="card-text">
                        <strong class="fs-6">Points:</strong> 
                        <span class="badge fs-6 px-2 py-1 ${window.userPowerBonus?.has_bonus ? 'bg-info text-muted' : 'text-secondary'}" 
                            style="${window.userPowerBonus?.has_bonus ? 'background: linear-gradient(135deg, #e3f2fd, #bbdefb) !important;' : 'background: var(--bg-soft); color: var(--text-dark);'}">
                            ${window.userPowerBonus?.has_bonus ? bonusPoints : basePoints}
                            ${window.userPowerBonus?.has_bonus ? ' ⚡' : ''}
                        </span>
                    </p>
                    <button class="btn btn-primary w-100" ${isDisabled} onclick="openCompleteTaskModal(${task.challenge_id})">${buttonText}</button>
                </div>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
  };

  // Completed Tasks
  const callbackForCompletedTasks = (responseStatus, responseData) => {
    const container = document.getElementById("completedTasks");

    if (responseStatus !== 200 || !responseData || responseData.length === 0) {
      container.innerHTML = '<p class="text-center col-12">No completed tasks yet!</p>';
      return;
    }

    let html = '';
    responseData.forEach(completion => {
      html += `
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title" style="color: var(--secondary-color);">
                Task ${completion.challenge_id}: ${completion.description}
              </h5>

              <p class="card-text">
                <strong>Completed on:</strong> ${completion.completed_at}
              </p>

              <div class="mb-3">
                <strong>Comment:</strong>
                <p id="comment-${completion.completion_id}" class="text-muted">
                  ${completion.details || 'No comment yet'}
                </p>
              </div>

              <button
                class="btn btn-outline-secondary btn-sm"
                onclick="openEditCommentModal(${completion.completion_id})">
                Edit Comment
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  };



  // Open complete task modal
  window.openCompleteTaskModal = function(challengeId) {
    currentChallengeId = challengeId;
    document.getElementById('taskComment').value = '';
    
    if (!completeTaskModal) {
      completeTaskModal = new bootstrap.Modal(document.getElementById('completeTaskModal'));
    }
    completeTaskModal.show();
  };

  // complete task form submission
  document.getElementById('completeTaskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const comment = document.getElementById('taskComment').value.trim();

    const data = {
      user_id: userId,
      challenge_id: currentChallengeId,
      details: comment
    };

    const callback = (responseStatus, responseData) => {
      if (responseStatus === 201 || responseStatus === 200) {
        showToast('Task marked as completed!', 'success');

        // power bonus message
        if (responseData.powerBonus) {
            showToast(`Task completed with ${responseData.powerBonus.message}`, 'success');
        }

        if (responseData.leveledUp && responseData.levelUpMessage) {
            setTimeout(() => {
                showToast(responseData.levelUpMessage, 'success');
            }, 1700);
        }
        completeTaskModal.hide();
        setTimeout(() => location.reload(), 3000);

      } else if (responseStatus === 409) {
        showToast('You already completed this challenge today!', 'warning');
      } else {
        showToast(responseData.error || responseData.message || 'Failed to complete task', 'danger');
      }
    };

    fetchMethod(
      currentUrl + `/api/challenges/${currentChallengeId}`, 
      callback, 
      "POST", 
      data, 
      token
    );
  });



  // Open edit comment modal
  window.openEditCommentModal = function(completionId) {
    currentCompletionId = completionId;
    const commentElement = document.getElementById(`comment-${completionId}`);
    const currentComment = commentElement.textContent === 'No comment yet' 
      ? '' 
      : commentElement.textContent;

    document.getElementById('editTaskComment').value = currentComment;
    
    if (!editCommentModal) {
      editCommentModal = new bootstrap.Modal(document.getElementById('editCommentModal'));
    }
    editCommentModal.show();
  };

  // edit comment form submission
  document.getElementById('editCommentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newComment = document.getElementById('editTaskComment').value.trim();

    const data = {
      details: newComment
    };

    const callback = (responseStatus) => {
      if (responseStatus === 200) {
        const commentElement = document.getElementById(`comment-${currentCompletionId}`);
        commentElement.textContent = newComment || 'No comment yet';
        showToast('Comment updated successfully!', 'success');
        editCommentModal.hide();
      } else {
        showToast('Failed to update comment', 'danger');
      }
    };

    fetchMethod(
      currentUrl + `/api/challenges/${currentCompletionId}/edit`, 
      callback, 
      "PUT", 
      data, 
      token
    );
  });



  // available tasks
  fetchMethod(currentUrl + `/api/challenges`, callbackForAvailableTasks, "GET", null, token);

  // get completed tasks only if logged in
  if (userId && token) {
    fetchMethod(currentUrl + `/api/challenges/users/${userId}`, callbackForCompletedTasks, "GET", null, token);
  } else {
    // Login message for non logged in users
    document.getElementById("completedTasks").innerHTML = `
      <div class="col-12">
        <div class="alert alert-light text-center" role="alert">
          <p class="mb-2">Please log in to view your completed tasks!</p>
          <a href="login.html" class="btn btn-primary btn-sm">Login</a>
        </div>
      </div>
    `;
  }
});