// top 5 users
document.addEventListener("DOMContentLoaded", function () {
  const callbackForLeaderboard = (responseStatus, responseData) => {
    console.log("responseStatus:", responseStatus);
    console.log("responseData:", responseData);

    const leaderboardList = document.getElementById("leaderboardList");

    if (responseStatus == 404 || responseStatus == 500) {
      leaderboardList.innerHTML = `<p class="text-center text-danger">Failed to load leaderboard</p>`;
      return;
    }

    if (responseData.length == 0) {
      leaderboardList.innerHTML = `<p class="text-center">No users yet!</p>`;
      return;
    }

    // leaderboard
    let leaderboardHTML = '<div class="list-group">';
    
    responseData.forEach((user, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
      
      leaderboardHTML += `
        <div class="list-group-item d-flex justify-content-between align-items-center" style="border-radius: 8px; margin-bottom: 0.5rem;">
          <div>
            <span style="font-size: 1.5rem; margin-right: 1rem;">${medal}</span>
            <strong>${user.username}</strong>
          </div>
          <div class="text-end">
            <div><small class="text-muted">Challenges Completed: ${user.challenges_completed}</small></div>
            <div><span class="badge" style="background: var(--accent-light); color: var(--text-dark);">${user.total_points_earned} pts</span></div>
          </div>
        </div>
      `;
    });
    
    leaderboardHTML += '</div>';
    leaderboardList.innerHTML = leaderboardHTML;
  };

  fetchMethod(currentUrl + `/api/leaderboard`, callbackForLeaderboard);
});


// pet of the day
const callbackForPetOfDay = (responseStatus, responseData) => {
  if (responseStatus == 200 && responseData) {
    document.getElementById("petOfDayBreed").textContent = responseData.breed_name;
    document.getElementById("petOfDayImage").src = `http://localhost:3000/images/sprites/${responseData.breed_id}.png`;
  } else {
    document.getElementById("petOfDayBreed").textContent = "No pet today!";
  }
};
fetchMethod(currentUrl + `/api/top-pet`, callbackForPetOfDay);