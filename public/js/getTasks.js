document.addEventListener("DOMContentLoaded", function () {
  const userId = localStorage.getItem("loggedInUserId");
  const token = localStorage.getItem("token");

  // Available Tasks
  const callbackForAvailableTasks = (responseStatus, responseData) => {
    const container = document.getElementById("availableTasks");
    
    if (responseStatus !== 200 || !responseData || responseData.length === 0) {
      container.innerHTML = '<p class="text-center col-12">No tasks available!</p>';
      return;
    }

    let html = '';
    responseData.forEach(task => {
    const isDisabled = !userId || !token ? 'disabled' : '';
    const buttonText = !userId || !token ? 'Please login to attempt' : 'Mark as Completed';
    
    html += `
        <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
            <div class="card-body">
            <h5 class="card-title" style="color: var(--primary-color);">${task.description}</h5>
            <p class="card-text"><strong>Points:</strong> <span class="badge" style="background: var(--bg-soft); color: var(--text-dark);">${task.points}</span></p>
            <button class="btn btn-primary w-100" ${isDisabled} onclick="completeTask(${task.challenge_id})">${buttonText}</button>
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
              onclick="editComment(${completion.completion_id})">
              Edit Comment
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
};


  // Complete Task Function
  window.completeTask = function (challengeId) {
  const comment = prompt("Leave a comment for this task");

  const data = {
    user_id: userId,
    challenge_id: challengeId,
    details: comment
  };

    const callback = (responseStatus, responseData) => {
    console.log(responseData);
    if (responseStatus === 201 || responseStatus === 200) {
        showToast('Success!', 'Task marked as completed!', 'success');
        setTimeout(() => location.reload(), 1800);
    } else if (responseStatus === 409) {
        showToast('Already Completed', 'You already completed this challenge today!', 'warning');
    } else {
        showToast('Error', responseData.error || responseData.message || 'Failed to complete task', 'error');
    }
    };

  fetchMethod(
    currentUrl + `/api/challenges/${challengeId}`, callback, "POST", data, token
  );
};

// to change completion comment
window.editComment = function (completionId) {
  const commentElement = document.getElementById(`comment-${completionId}`);
  const currentComment =
    commentElement.textContent === 'No comment yet'
      ? ''
      : commentElement.textContent;

  const newComment = prompt("Edit your comment:", currentComment);
  if (newComment === null) return;

  const data = {
    details: newComment
  };

  const callback = (responseStatus) => {
    if (responseStatus === 200) {
      commentElement.textContent = newComment || 'No comment yet';
      alert("Comment updated!");
    } else {
      alert("Failed to update comment");
    }
  };

  fetchMethod(
    currentUrl + `/api/challenges/${completionId}/edit`, callback, "PUT", data, token
  );
};

  fetchMethod(currentUrl + `/api/challenges`, callbackForAvailableTasks, "GET", null, token);

    if (userId && token) {
        fetchMethod(currentUrl + `/api/challenges/users/${userId}`, callbackForCompletedTasks, "GET", null, token);
    } else {
    // login message for non logged in users
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

function showToast(title, message, type = 'success') {
  const toastEl = document.getElementById('notificationToast');
  const toastHeader = document.getElementById('toastHeader');
  
  // Color based on type
  if (type === 'success') toastHeader.style.backgroundColor = '#d4edda';
  if (type === 'error') toastHeader.style.backgroundColor = '#f8d7da';
  if (type === 'warning') toastHeader.style.backgroundColor = '#fff3cd';
  
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMessage').textContent = message;
  
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}