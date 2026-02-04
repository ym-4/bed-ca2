document.addEventListener("DOMContentLoaded", function () {
  const userId = localStorage.getItem("loggedInUserId");
  const token = localStorage.getItem("token");

  if (!userId || !token) {
    window.location.href = "login.html";
    return;
  }

  let equippedPetId = null;
  let currentEditPetId = null;

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

  // equipped pet
  function loadEquippedPet() {
    fetchMethod(currentUrl + `/api/users/${userId}`, (status, data) => {
      if (status === 200 && data.equipped_pet_id) {
        equippedPetId = data.equipped_pet_id;
        loadEquippedPetDetails(equippedPetId);
      }
    }, "GET", null, token);
  }

  function loadEquippedPetDetails(userPetId) {
    fetchMethod(currentUrl + `/api/users/${userId}/pets`, (status, data) => {
      if (status === 200) {
        const equippedPet = data.find(pet => pet.user_pet_id === userPetId);
        if (equippedPet) {
          document.getElementById('equippedPetName').textContent = equippedPet.pet_name.toUpperCase();
          document.getElementById('equippedPetBreed').textContent = equippedPet.breed_name || 'Unknown';
          document.getElementById('equippedPetLevel').textContent = equippedPet.pet_level;
          document.getElementById('equippedPetExp').textContent = `${equippedPet.experience_points || 0}`;
          
          if (equippedPet.breed_id) {
            document.getElementById('equippedPetImage').src = `http://localhost:3000/images/sprites/${equippedPet.breed_id}.png`;
            document.getElementById('equippedPetImage').style.display = 'block';
            document.getElementById('noEquippedPetMsg').style.display = 'none';
          }
        }
      }
    }, "GET", null, token);
  }

  // all pets owned
  function loadAllPets() {
    fetchMethod(currentUrl + `/api/users/${userId}/pets`, (status, data) => {
      if (status === 200) {
        displayPets(data);
      } else {
        document.getElementById('petsGrid').innerHTML = '<div class="col-12 text-center"><p class="text-dark">No pets owned at the moment...<br> Go ahead and <a href="petShop.html">adopt a new friend</a> to join you!</p></div>';
      }
    }, "GET", null, token);
  }

  function displayPets(pets) {
    const grid = document.getElementById('petsGrid');
    
    if (pets.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center"><p class="text-muted">You don\'t have any pets yet. Visit the <a href="petShop.html">Pet Shop!</a></p></div>';
      return;
    }

    grid.innerHTML = '';
    
    pets.forEach(pet => {
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = createPetCard(pet);
      grid.appendChild(col);
    });
  }

  function createPetCard(pet) {
    const isEquipped = pet.user_pet_id === equippedPetId;
    
    return `
      <div class="pet-card-container" style="perspective: 1000px;">
        <div class="pet-card" id="card-${pet.user_pet_id}" style="position: relative; transform-style: preserve-3d; transition: transform 0.6s;">

          <!-- Front of card -->
          <div class="pet-card-front" style="backface-visibility: hidden; border-radius: 16px; background: white; border: 2px solid var(--border-color); padding: 1.5rem; position: relative; min-height: 420px;">
            <div class="text-center mb-3">
              <img src="${`http://localhost:3000/images/sprites/${pet.breed_id}.png`}" alt="${pet.pet_name}" class="img-fluid pet-image">
            </div>
            <h5 class="text-center mb-3" style="color: var(--text-dark);">${pet.pet_name}</h5>
            <p class="mb-2"><strong>Breed:</strong> ${pet.breed_name || 'Unknown'}</p>
            <p class="mb-2"><strong>Level:</strong> ${pet.pet_level}</p>
            <p class="mb-3"><strong>XP:</strong> ${pet.experience_points}</p>
            
            <div class="d-grid gap-2">
              <button class="btn btn-sm" style="background-color: #e2dac5;" onclick="editPetName(${pet.user_pet_id}, '${pet.pet_name}')">
                Edit Name
              </button>
              ${!isEquipped ? `
                <button class="btn btn-sm" style="background-color: rgb(144, 160, 121);" onclick="equipPet(${pet.user_pet_id})">
                  Equip
                </button>
              ` : `
                <button 
                class="btn btn-sm rounded-pill shadow-sm" style="background-color: rgb(191, 218, 145);" 
                onclick="unequipPet()">
                Unequip
                </button>

              `}
              <button class="btn btn-sm btn-primary" style="color: white;" onclick="flipCard(${pet.user_pet_id})">
                View Powers
              </button>
            </div>
          </div>
          
          <!-- Back of card -->
          <div class="pet-card-back" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; backface-visibility: hidden; transform: rotateY(180deg); border-radius: 16px; background: linear-gradient(135deg, var(--primary-light) 0%, var(--secondary-light) 100%); padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
            <h5 class="text-center mb-3" style="color: var(--text-dark);">Powers</h5>
            <div id="abilities-${pet.user_pet_id}" class="abilities-container" style="max-height: 250px; overflow-y: auto;">
              <p class="text-center text-muted">Loading abilities...</p>
            </div>
            <button class="btn btn-sm btn-dark mt-3 w-100" onclick="flipCard(${pet.user_pet_id})">
              Back
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Flip card function
  window.flipCard = function(userPetId) {
    const card = document.getElementById(`card-${userPetId}`);
    const isFlipped = card.style.transform === 'rotateY(180deg)';
    
    if (!isFlipped) {
      loadAbilities(userPetId);
      card.style.transform = 'rotateY(180deg)';
    } else {
      card.style.transform = 'rotateY(0deg)';
    }
  };

  // abilities
  function loadAbilities(userPetId) {
    const container = document.getElementById(`abilities-${userPetId}`);
    
    fetchMethod(currentUrl + `/api/pets/${userPetId}/abilities`, (status, data) => {
      if (status === 200 && data.length > 0) {
        container.innerHTML = data.map(ability => `
          <div class="ability-item mb-2 p-2" style="background: rgb(254, 234, 241); border-radius: 8px; border-left: 3px solid var(--accent-color);">
            <strong>${ability.ability_name}</strong><br>
            <small class="text-muted">Unlocked at ${ability.unlocked_at || 'N/A'}</small>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<p class="text-center text-muted">No abilities unlocked yet <br> Visit the <a href="petShop.html">Abilities Canopy</a> to unlock new powers!</p>';
      }
    }, "GET", null, token);
  }

  // Edit pet name - updated to use modal
  window.editPetName = function(userPetId, currentName) {
    currentEditPetId = userPetId;
    document.getElementById('newPetNameInput').value = currentName;
    
    const modal = new bootstrap.Modal(document.getElementById('editPetNameModal'));
    modal.show();
  };

  // Edit pet name form submission
  document.getElementById('editPetNameForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newName = document.getElementById('newPetNameInput').value.trim();
    
    if (!newName) {
      showToast('Please enter a valid name', 'warning');
      return;
    }

    fetchMethod(currentUrl + `/api/users/${userId}/pets/${currentEditPetId}`, (status, data) => {
      if (status === 200) {
        showToast('Pet name updated successfully!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('editPetNameModal'));
        modal.hide();
        loadAllPets();
        if (equippedPetId === currentEditPetId) {
          loadEquippedPet();
        }
      } else {
        showToast(data.message || 'Failed to update pet name', 'danger');
      }
    }, "PUT", { pet_name: newName }, token);
  });

  // Equip pet
  window.equipPet = function(userPetId) {
    if (equippedPetId !== null) {
      showToast('Please unequip your current pet first', 'warning');
      return;
    }
    
    fetchMethod(currentUrl + `/api/users/${userId}/equip-pet/${userPetId}`, (status, data) => {
      if (status === 200) {
        showToast('Pet equipped successfully!', 'success');
        equippedPetId = userPetId;
        loadEquippedPet();
        loadAllPets();
      } else {
        showToast(data.message || 'Failed to equip pet', 'danger');
      }
    }, "PUT", null, token);
  };

  // Unequip pet
  window.unequipPet = function() {
    if (equippedPetId === null) {
      showToast('No pet is currently equipped', 'warning');
      return;
    }
    
    fetchMethod(currentUrl + `/api/users/${userId}/unequip-pet`, (status, data) => {
      if (status === 200) {
        showToast('Pet unequipped successfully!', 'success');
        equippedPetId = null;
        document.getElementById('equippedPetName').textContent = 'No pet equipped';
        document.getElementById('equippedPetBreed').textContent = '-';
        document.getElementById('equippedPetLevel').textContent = '-';
        document.getElementById('equippedPetExp').textContent = '-';
        document.getElementById('equippedPetImage').style.display = 'none';
        document.getElementById('noEquippedPetMsg').style.display = 'block';
        loadAllPets();
      } else {
        showToast(data.message || 'Failed to unequip pet', 'danger');
      }
    }, "PUT", null, token);
  };

  // tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

  loadEquippedPet();
  loadAllPets();
});