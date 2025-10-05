document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  // Credenciales de ejemplo para diferentes tipos de usuario
  const adminUser = "admin";
  const adminPass = "1234";
  const clientUser = "cliente";
  const clientPass = "5678";

  if (username === adminUser && password === adminPass) {
    // Guardar sesión como administrador
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userType", "admin");
    
    // Redirigir al panel admin
    const redirect = localStorage.getItem("redirectAfterLogin") || "admin.html";
    localStorage.removeItem("redirectAfterLogin");
    window.location.href = redirect;
  } else if (username === clientUser && password === clientPass) {
    // Guardar sesión como cliente
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userType", "cliente");
    
    // Redirigir al portal cliente
    const redirect = localStorage.getItem("redirectAfterLogin") || "cliente.html";
    localStorage.removeItem("redirectAfterLogin");
    window.location.href = redirect;
  } else {
    errorMsg.textContent = "Usuario o contraseña incorrectos.";
  }
});