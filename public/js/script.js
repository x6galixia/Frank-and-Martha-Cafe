document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Send a POST request to the server to handle the login
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => response.text())
        .then(data => {
            if (data === 'Login successful') {
                alert('Login successful!');
                window.open("index.html");
                // Redirect to the user's profile page or update the UI as needed.
            } else {
                alert('Wrong Username or Password!');
                const errorMessage = document.getElementById("error-message");
                errorMessage.textContent = data;
            }
        });
});
