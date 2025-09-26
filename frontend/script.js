document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const ddd = document.getElementById('ddd').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, ddd })
    });
    const data = await response.json();
    document.getElementById('message').textContent = data.message || 'No response message';
  } catch (error) {
    document.getElementById('message').textContent = 'Error: ' + error.message;
  }
});

document.getElementById('goToRegister').addEventListener('click', () => {
  window.location.href = 'register.html';
});
