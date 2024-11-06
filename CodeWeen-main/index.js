document.getElementById('loginButton').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
      document.getElementById('errorMessage').textContent = 'Por favor, preencha todos os campos.';
      return;
  }

  try {
      const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
          const error = await response.text();
          document.getElementById('errorMessage').textContent = error;
          return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token); // Armazenar o token no localStorage
      document.getElementById('userName').textContent = data.name;
      document.getElementById('gameScreen').style.display = 'block';
      document.getElementById('authForm').style.display = 'none';
  } catch (error) {
      console.error('Erro no login:', error);
      document.getElementById('errorMessage').textContent = 'Erro ao tentar fazer login. Tente novamente.';
  }
});

document.getElementById('registerButton').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
      document.getElementById('errorMessage').textContent = 'Por favor, preencha todos os campos.';
      return;
  }

  try {
      const response = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password, name: email.split('@')[0], photo: 'default.png' }) // Adicionando um nome simples para o usuário
      });

      if (!response.ok) {
          const error = await response.text();
          document.getElementById('errorMessage').textContent = error;
          return;
      }

      document.getElementById('errorMessage').textContent = 'Usuário registrado com sucesso! Agora faça o login.';
  } catch (error) {
      console.error('Erro no registro:', error);
      document.getElementById('errorMessage').textContent = 'Erro ao tentar registrar. Tente novamente.';
  }
});
