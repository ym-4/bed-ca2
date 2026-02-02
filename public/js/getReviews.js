document.addEventListener("DOMContentLoaded", function () {
  const userId = localStorage.getItem("loggedInUserId");
  const token = localStorage.getItem("token");

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

  // all reviews
  function loadReviews() {
    fetchMethod(currentUrl + `/api/review`, (status, data) => {
      if (status === 200) {
        displayReviews(data);
      } else {
        document.getElementById('reviewsGrid').innerHTML = '<div class="col-12 text-center"><p class="text-danger">Failed to load reviews</p></div>';
      }
    }, "GET");
  }

  function displayReviews(reviews) {
    const grid = document.getElementById('reviewsGrid');
    
    if (reviews.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No reviews yet. Be the first to share!</p></div>';
      return;
    }

    grid.innerHTML = '';
    
    reviews.forEach(review => {
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = createReviewCard(review);
      grid.appendChild(col);
    });
  }

  function createReviewCard(review) {
    const isOwner = userId && parseInt(userId) === parseInt(review.user_id);
    const stars = generateStars(review.review_amt);
    const createdDate = new Date(review.created_at);
    const formattedDate = createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    
    return `
      <div class="card review-card" id="review-${review.id}" style="border-radius: 16px; border: 2px solid var(--border-color); background-color: white; height: 100%;">
        <div class="card-body p-4 d-flex flex-column">
          <!-- Header with name and buttons -->
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div style="flex: 1;">
              <div id="name-display-${review.id}">
                <h5 class="card-title mb-1" style="color: var(--text-dark); font-weight: 600;">${review.name || 'Anonymous'}</h5>
              </div>
              <input type="text" id="name-edit-${review.id}" class="form-control form-control-sm" style="display: none; max-width: 200px;" value="${review.name || ''}">
              <small class="text-muted">${formattedDate}</small>
            </div>
            ${isOwner ? `
              <div class="btn-group-vertical" role="group">
                <button class="btn btn-primary btn-sm mb-1" onclick="toggleEditReview(${review.id})" style="font-size: 0.75rem;">
                  <span id="edit-btn-${review.id}">Edit</span>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteReview(${review.id})" style="font-size: 0.75rem;">
                  Delete
                </button>
              </div>
            ` : ''}
          </div>
          
          <!-- Star Rating Display -->
          <div class="mb-3">
            <div id="stars-display-${review.id}" class="review-stars-display">
              ${stars}
            </div>
            <!-- Star Rating Edit (hidden by default) -->
            <div id="stars-edit-${review.id}" class="star-rating-edit" style="display: none;">
              ${createEditStarRating(review.id, review.review_amt)}
            </div>
          </div>
          
          <!-- Description -->
          <div class="flex-grow-1">
            <div id="desc-display-${review.id}" class="review-desc-display">
              ${review.description}
            </div>
            <textarea id="desc-edit-${review.id}" class="form-control" style="display: none;" rows="4">${review.description}</textarea>
          </div>
          
          ${isOwner ? `
            <div id="save-section-${review.id}" style="display: none;" class="mt-3">
              <button class="btn btn-primary btn-sm w-100" onclick="saveReviewEdit(${review.id})">
                Save Changes
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '<span class="star filled">★</span>';
      } else {
        stars += '<span class="star">★</span>';
      }
    }
    return stars;
  }

  function createEditStarRating(reviewId, currentRating) {
    return `
      <div class="star-rating-edit-container">
        <input type="radio" id="edit-star5-${reviewId}" name="edit-rating-${reviewId}" value="5" ${currentRating === 5 ? 'checked' : ''}>
        <label for="edit-star5-${reviewId}" title="5 stars">★</label>
        
        <input type="radio" id="edit-star4-${reviewId}" name="edit-rating-${reviewId}" value="4" ${currentRating === 4 ? 'checked' : ''}>
        <label for="edit-star4-${reviewId}" title="4 stars">★</label>
        
        <input type="radio" id="edit-star3-${reviewId}" name="edit-rating-${reviewId}" value="3" ${currentRating === 3 ? 'checked' : ''}>
        <label for="edit-star3-${reviewId}" title="3 stars">★</label>
        
        <input type="radio" id="edit-star2-${reviewId}" name="edit-rating-${reviewId}" value="2" ${currentRating === 2 ? 'checked' : ''}>
        <label for="edit-star2-${reviewId}" title="2 stars">★</label>
        
        <input type="radio" id="edit-star1-${reviewId}" name="edit-rating-${reviewId}" value="1" ${currentRating === 1 ? 'checked' : ''}>
        <label for="edit-star1-${reviewId}" title="1 star">★</label>
      </div>
    `;
  }

  // edit mode for review
  window.toggleEditReview = function(reviewId) {
    const nameDisplay = document.getElementById(`name-display-${reviewId}`);
    const nameEdit = document.getElementById(`name-edit-${reviewId}`);
    const descDisplay = document.getElementById(`desc-display-${reviewId}`);
    const descEdit = document.getElementById(`desc-edit-${reviewId}`);
    const starsDisplay = document.getElementById(`stars-display-${reviewId}`);
    const starsEdit = document.getElementById(`stars-edit-${reviewId}`);
    const saveSection = document.getElementById(`save-section-${reviewId}`);
    const editBtn = document.getElementById(`edit-btn-${reviewId}`);
    
    if (descEdit.style.display === 'none') {
      // edit mode
      nameDisplay.style.display = 'none';
      nameEdit.style.display = 'block';
      descDisplay.style.display = 'none';
      descEdit.style.display = 'block';
      starsDisplay.style.display = 'none';
      starsEdit.style.display = 'block';
      saveSection.style.display = 'block';
      editBtn.textContent = 'Cancel';
    } else {
      // Cancel edit mode
      nameDisplay.style.display = 'block';
      nameEdit.style.display = 'none';
      descDisplay.style.display = 'block';
      descEdit.style.display = 'none';
      starsDisplay.style.display = 'block';
      starsEdit.style.display = 'none';
      saveSection.style.display = 'none';
      editBtn.textContent = 'Edit';
    }
  };

 // Save review edit
  window.saveReviewEdit = function(reviewId) {
    const newName = document.getElementById(`name-edit-${reviewId}`).value.trim();
    const newDescription = document.getElementById(`desc-edit-${reviewId}`).value.trim();
    const newRating = document.querySelector(`input[name="edit-rating-${reviewId}"]:checked`)?.value;
    
    if (!newName || !newDescription || !newRating) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    const updateData = {
      user_id: parseInt(userId),
      name: newName,
      description: newDescription,
      review_amt: parseInt(newRating)
    };

    fetchMethod(currentUrl + `/api/review/${reviewId}`, (status, data) => {
      if (status === 200) {
        showToast('Review updated successfully!', 'success');
        loadReviews(); // Reload all reviews
      } else {
        showToast(data?.message || 'Failed to update review', 'danger');
      }
    }, "PUT", updateData, token);
  };

  // Delete review
  window.deleteReview = function(reviewId) {
    fetchMethod(currentUrl + `/api/review/${reviewId}`, (status, data) => {
      if (status === 200 || status === 204) {
        showToast('Review deleted successfully!', 'success');
        document.getElementById(`review-${reviewId}`).closest('.col-md-4').remove();
      } else {
        showToast(data?.message || 'Failed to delete review', 'danger');
      }
    }, "DELETE", null, token);
  };

  // create review form submission
  document.getElementById('createReviewForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!userId || !token) {
      showToast('Please log in to post a review', 'warning');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      return;
    }
    
    const name = document.getElementById('newReviewName').value.trim();
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const description = document.getElementById('newReviewDescription').value.trim();
    
    if (!name || !rating || !description) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    const newReview = {
      user_id: parseInt(userId),
      name: name,
      review_amt: parseInt(rating),
      description: description
    };

    fetchMethod(currentUrl + `/api/review`, (status, data) => {
      if (status === 201 || status === 200) {
        showToast('Review posted successfully!', 'success');
        document.getElementById('createReviewForm').reset();
        loadReviews(); // Reload reviews
      } else if (status === 409) {
        showToast('You can only post one review a day', 'warning');
      } else {
        showToast(data?.message || 'Failed to post review', 'danger');
      }
    }, "POST", newReview, token);
  });

  loadReviews();
});