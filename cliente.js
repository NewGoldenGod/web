// Verificar autenticación al cargar la página
document.addEventListener("DOMContentLoaded", function() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userType = localStorage.getItem("userType");

  // Si no está logueado o no es cliente, redirigir al login
  if (isLoggedIn !== "true" || userType !== "cliente") {
    localStorage.setItem("redirectAfterLogin", "cliente.html");
    window.location.href = "login.html";
    return;
  }

  // Ajustar navegación para cliente
  adjustNavigation();

  // Cargar datos del cliente
  loadClientData();
});

function logout() {
  // Limpiar datos de sesión
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userType");
  localStorage.removeItem("redirectAfterLogin");
  
  // Redirigir al login
  window.location.href = "login.html";
}

function adjustNavigation() {
  const navItems = document.querySelectorAll(".main-nav ul li a");


function loadClientData() {
  // Simular carga de datos del cliente
  console.log("Datos del cliente cargados");
  
  // Mostrar mensaje de bienvenida
  showNotification("Bienvenido al portal del cliente", "success");
}

function showContact() {
  // Mostrar información de contacto
  const contactInfo = `
    📞 Teléfono de Emergencia: 600 123 4567
    📧 Email: soporte@asistencia.cl
    🕐 Horario: 24/7 disponible
    
    Para emergencias, llama directamente al número de teléfono.
  `;
  
  alert(contactInfo);
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Estilos para la notificación
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}}