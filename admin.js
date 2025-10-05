// Verificar autenticación al cargar la página
document.addEventListener("DOMContentLoaded", function() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userType = localStorage.getItem("userType");

  // Si no está logueado o no es admin, redirigir al login
  if (isLoggedIn !== "true" || userType !== "admin") {
    localStorage.setItem("redirectAfterLogin", "admin.html");
    window.location.href = "login.html";
    return;
  }

  // Cargar datos del dashboard
  loadDashboardData();
});

function loadDashboardData() {
  // Cargar estadísticas reales desde siniestroManager
  const stats = siniestroManager.getEstadisticas();
  
  // Actualizar los números en el dashboard
  document.getElementById('siniestros-activos').textContent = stats.activos;
  document.getElementById('siniestros-completados').textContent = stats.finalizados;
  document.getElementById('siniestros-evaluacion').textContent = stats.enEvaluacion;
  document.getElementById('siniestros-total').textContent = stats.total;
  
  // Animar números
  animateNumbers();
  
  // Cargar actividad reciente real
  loadRecentActivity();
}

function animateNumbers() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  statNumbers.forEach(element => {
    const finalValue = parseInt(element.textContent);
    let currentValue = 0;
    const increment = finalValue / 30;
    
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= finalValue) {
        element.textContent = finalValue;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(currentValue);
      }
    }, 50);
  });
}

function loadRecentActivity() {
  const activityList = document.getElementById('activity-list');
  const recentSiniestros = siniestroManager.getSiniestrosRecientes(4);
  
  // Limpiar actividades existentes
  activityList.innerHTML = '';
  
  if (recentSiniestros.length === 0) {
    activityList.innerHTML = '<div class="no-activity"><p>No hay actividad reciente. Los siniestros registrados aparecerán aquí.</p></div>';
    return;
  }
  
  // Agregar actividades reales
  recentSiniestros.forEach(siniestro => {
    let icon, title;
    
    if (siniestro.estado === 'Ingresado') {
      icon = 'folder.png';
      title = 'Nuevo siniestro registrado';
    } else if (siniestro.estado === 'En Evaluación') {
      icon = 'list.png';
      title = 'Siniestro en evaluación';
    } else {
      icon = 'Checkmark.png';
      title = 'Siniestro finalizado';
    }
    
    const timeDiff = timeSince(new Date(siniestro.fechaRegistro));
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
      <img src="image/${icon}" alt="Actividad" class="activity-icon">
      <div class="activity-content">
        <p><strong>${title}</strong></p>
        <small>RUT: ${siniestro.rut} - Póliza: ${siniestro.numeroPoliza}</small>
        <span class="activity-time">Hace ${timeDiff}</span>
      </div>
    `;
    
    activityList.appendChild(activityItem);
  });
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) return Math.floor(interval) + " años";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " días";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " horas";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutos";
  return Math.floor(seconds) + " segundos";
}

// Función para actualizar estadísticas (llamada desde otros archivos)
function actualizarEstadisticas() {
  loadDashboardData();
}