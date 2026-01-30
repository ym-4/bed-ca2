document.addEventListener("DOMContentLoaded", function () {
  const userId = localStorage.getItem("loggedInUserId");
  const token = localStorage.getItem("token");

  // Check if user is logged in
  if (!userId || !token) {
    window.location.href = "login.html";
    return;
  }

  const callbackForUserInfo = (responseStatus, responseData) => {
  console.log("responseStatus:", responseStatus);
  console.log("responseData:", responseData);

  if (responseStatus == 404) {
    document.getElementById("userInfo").innerHTML = `<p class="text-center">${responseData.message}</p>`;
    return;
  }

  document.getElementById("welcomeMessage").textContent = `Welcome back, ${responseData.username}! 🐾`;
  
  document.getElementById("username").textContent = responseData.username;
  document.getElementById("email").textContent = responseData.email;
  document.getElementById("points").textContent = responseData.points || 0;
  
  const createdDate = new Date(responseData.created_on);
  document.getElementById("createdOn").textContent = 
    createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

  console.log("Fetching URL:", currentUrl + `/api/user/${userId}`);
  fetchMethod(currentUrl + `/api/users/${userId}`, callbackForUserInfo);
});