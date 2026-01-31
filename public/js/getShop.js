document.addEventListener("DOMContentLoaded", function () {
  const userId = localStorage.getItem("loggedInUserId");
  const token = localStorage.getItem("token");

  // Open Pet Shop Modal
  window.openPetShop = function() {
    const modal = new bootstrap.Modal(document.getElementById('petShopModal'));
    modal.show();
    loadPets();
  };

  // Open Power Shop Modal
  window.openPowerShop = function() {
    const modal = new bootstrap.Modal(document.getElementById('powerShopModal'));
    modal.show();
    loadAbilities();
  };

  // display pets
  function loadPets() {
    const callback = (responseStatus, responseData) => {
        const container = document.getElementById("petShopContent");
        
        if (responseStatus !== 200 || !responseData || responseData.length === 0) {
        container.innerHTML = '<p class="text-center col-12">No pets available!</p>';
        return;
        }

        // Get user's owned pets
        if (userId && token) {
        fetchMethod(currentUrl + `/api/users/${userId}/pets`, (status, ownedPets) => {
            const ownedBreedIds = (status === 200 && ownedPets)
                ? ownedPets.map(p => p.breed_id)
                : []; 
            renderPets(responseData, ownedBreedIds);
        }, "GET", null, token);

        } else {
        renderPets(responseData, []);
        }
    };

    fetchMethod(currentUrl + `/api/breeds`, callback, "GET", null, token);
    }

    function renderPets(pets, ownedBreedIds) {
        const container = document.getElementById("petShopContent");
        let html = '';

        pets.forEach(pet => {
            const isOwned = ownedBreedIds.includes(pet.breed_id);
            const isDisabled = (!userId || !token || isOwned) ? 'disabled' : '';
            let buttonText = 'Adopt';
            
            if (!userId || !token) buttonText = 'Please login to adopt';
            else if (isOwned) buttonText = 'Already Owned';

            html += `
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                <img src="${`http://localhost:3000/images/sprites/${pet.breed_id}.png`}" class="card-img-top" style="height: 250px; object-fit: cover; padding: 1rem;">
                <div class="card-body">
                    <h5 class="card-title" style="color: var(--primary-color);">${pet.breed_name}</h5>
                    <p class="card-text">${pet.description}</p>
                    <p><strong>Cost:</strong> <span class="badge" style="background: var(--secondary-soft); color: var(--text-dark);">${pet.required_points} pts</span></p>
                    <button class="btn btn-primary w-100" ${isDisabled} onclick="adoptPet(${pet.breed_id}, ${pet.required_points})">${buttonText}</button>
                </div>
                </div>
            </div>
            `;
        });
        container.innerHTML = html;
    }

  // Adopt Pet
  window.adoptPet = function (breedId, cost) {
    const petName = prompt("Give your new pet a name!");
    if (!petName) return;

    const data = { pet_name: petName };

    const callback = (responseStatus, responseData) => {
        if (responseStatus === 201 || responseStatus === 200) {
            showToast('Success!', `Hooray! Welcome ${petName} to your family!`, 'success');

            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('petShopModal'));
                if (modal) modal.hide();
                location.reload();
            }, 1500);

        } else if (responseStatus === 400 && responseData.message && responseData.message.includes('points')) {
            showToast('Not Enough Points', `You need ${cost} points to adopt this pet. Complete more tasks to earn points!`, 'warning');

        } else {
            showToast('Error', responseData.message || 'Failed to adopt pet', 'error');
        }
    };
    fetchMethod(currentUrl + `/api/users/${userId}/adopt/pets/${breedId}`, callback, "POST", data, token);
};


  // display powers
  function loadAbilities() {
    const callback = (responseStatus, responseData) => {
        const container = document.getElementById("powerShopContent");
        
        if (responseStatus !== 200 || !responseData || responseData.length === 0) {
        container.innerHTML = '<p class="text-center col-12">No abilities available!</p>';
        return;
        }

        const isDisabled = !userId || !token ? 'disabled' : '';
        const buttonText = !userId || !token ? 'Please login to unlock' : 'Unlock';

        let html = '';
        responseData.forEach(ability => {
        html += `
            <div class="col-md-6 mb-4">
            <div class="card h-100">
                <img src="${`http://localhost:3000/images/powers/${ability.ability_id}.png`}" class="img-fluid rounded-circle" style="width: 150px; height: 150px; object-fit: cover; border-radius: 12px; display: block; margin: 25px auto;">
                <div class="card-body">
                <h5 class="card-title" style="color: var(--accent-color);">${ability.ability_name}</h5>
                <p class="card-text">${ability.description}</p>
                <p><strong>Required Level:</strong> ${ability.required_level}</p>
                <button class="btn btn-primary w-100" ${isDisabled} onclick="unlockAbility(${ability.ability_id}, ${ability.required_level})">${buttonText}</button>
                </div>
            </div>
            </div>
        `;
        });
        container.innerHTML = html;
    };

    fetchMethod(currentUrl + `/api/abilities`, callback, "GET", null, token);
    }

  // Unlock Ability
    window.unlockAbility = function (abilityId, requiredLevel) {

  // Fetch user data to get equipped_pet_id
  const userCallback = (responseStatus, responseData) => {
    if (responseStatus !== 200) {
      showToast('Not signed in', 'Please sign in to unlock pet powers!', 'warning');
      return;
    }

    const equippedPetId = responseData.equipped_pet_id;
    if (!equippedPetId) {
      showToast('No pet equipped', 'You need to equip a pet first!', 'warning');
      return;
    }

    // Fetch equipped pet details
    const petCallback = (petStatus, petData) => {
      if (petStatus !== 200) {
        showToast('Error', 'Failed to load pet data', 'error');
        return;
      }

      if (petData.pet_level < requiredLevel) {
        showToast(
          'Insufficient level!', `${petData.pet_name} needs to be level ${requiredLevel} to unlock this power. Current level: ${petData.pet_level}`,'warning');
        return;
      }

      // Unlock ability
      const unlockCallback = (unlockStatus, unlockData) => {
        if (unlockStatus === 200 || unlockStatus === 201) {
          showToast('Success!', `Hooray! ${petData.pet_name} unlocked a new power!`,'success');

          setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('powerShopModal'));
            if (modal) modal.hide();
            location.reload();
          }, 1500);

        } else {
          showToast('Error', unlockData?.message || 'Failed to unlock power', 'error');
        }
      };

      fetchMethod(currentUrl + `/api/users/${userId}/unlock/pets/${equippedPetId}/ability/${abilityId}`, unlockCallback, "POST", {}, token);
    };

    fetchMethod(currentUrl + `/api/pets/${equippedPetId}`, petCallback, "GET", null, token);
  };

  fetchMethod(currentUrl + `/api/users/${userId}`, userCallback, "GET", null, token);
};

});

// toast
function showToast(title, message, type = 'success') {
  const toastEl = document.getElementById('notificationToast');
  const toastHeader = document.getElementById('toastHeader');
  
  if (type === 'success') toastHeader.style.backgroundColor = '#d4edda';
  if (type === 'error') toastHeader.style.backgroundColor = '#f8d7da';
  if (type === 'warning') toastHeader.style.backgroundColor = '#fff3cd';
  
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMessage').textContent = message;
  
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}