// Sistema de gestión de siniestros
class SiniestroManager {
    constructor() {
        this.siniestros = this.loadSiniestros();
        this.nextId = this.getNextId();
    }

    // Cargar siniestros desde localStorage
    loadSiniestros() {
        const stored = localStorage.getItem('siniestros');
        return stored ? JSON.parse(stored) : [];
    }

    // Guardar siniestros en localStorage
    saveSiniestros() {
        localStorage.setItem('siniestros', JSON.stringify(this.siniestros));
    }

    // Obtener siguiente ID disponible
    getNextId() {
        if (this.siniestros.length === 0) return 1;
        return Math.max(...this.siniestros.map(s => s.id)) + 1;
    }

    // Crear nuevo siniestro
    crearSiniestro(datos) {
        const nuevoSiniestro = {
            id: this.nextId++,
            ...datos,
            fechaRegistro: new Date().toISOString(),
            estado: 'Ingresado',
            liquidador: this.asignarLiquidador(),
            grua: this.asignarGrua(),
            taller: this.asignarTaller()
        };

        this.siniestros.push(nuevoSiniestro);
        this.saveSiniestros();

        return nuevoSiniestro;
    }

    // Buscar siniestro por RUT y póliza
    buscarSiniestro(rut, poliza) {
        return this.siniestros.find(s => {
            // Normalizar y buscar coincidencias parciales
            const rutNormalizado = rut ? rut.replace(/[^0-9kK]/g, '').toUpperCase() : '';
            const sRutNormalizado = s.rut ? s.rut.replace(/[^0-9kK]/g, '').toUpperCase() : '';
            
            const rutMatch = !rut || sRutNormalizado.includes(rutNormalizado);
            const polizaMatch = !poliza || s.numeroPoliza.toLowerCase().includes(poliza.toLowerCase());
            
            return rutMatch && polizaMatch;
        });
    }

    // Buscar siniestros por criterios múltiples
    buscarSiniestros(criterios) {
        return this.siniestros.filter(s => {
            const rutMatch = !criterios.rut || s.rut.includes(criterios.rut);
            const polizaMatch = !criterios.poliza || s.numeroPoliza.includes(criterios.poliza);
            const estadoMatch = !criterios.estado || s.estado === criterios.estado;
            const tipoMatch = !criterios.tipo || s.tipoSeguro === criterios.tipo;

            return rutMatch && polizaMatch && estadoMatch && tipoMatch;
        });
    }

    // Obtener siniestro por ID
    obtenerSiniestro(id) {
        return this.siniestros.find(s => s.id === id);
    }

    // Asignar liquidador automáticamente
    asignarLiquidador() {
        const liquidadores = [
            'María González',
            'Carlos López', 
            'Ana Silva',
            'Pedro Martínez',
            'Luis Rodríguez',
            'Carmen Morales'
        ];
        return liquidadores[Math.floor(Math.random() * liquidadores.length)];
    }

    // Asignar grúa automáticamente
    asignarGrua() {
        const gruas = [
            'Grúa Express Norte',
            'Grúa Rápida Sur',
            'Grúa Central 24/7',
            'Grúa Metropolitana',
            'Grúa Oriente'
        ];
        return gruas[Math.floor(Math.random() * gruas.length)];
    }

    // Asignar taller automáticamente
    asignarTaller() {
        const talleres = [
            'Taller Mecánico ABC',
            'Taller Automotriz Pro',
            'Taller Central Motors',
            'Taller Sur Especializado',
            'Taller Norte Premium'
        ];
        return talleres[Math.floor(Math.random() * talleres.length)];
    }

    // Actualizar estado del siniestro
    actualizarEstado(id, nuevoEstado) {
        const siniestro = this.siniestros.find(s => s.id === id);
        if (siniestro) {
            siniestro.estado = nuevoEstado;
            siniestro.fechaActualizacion = new Date().toISOString();
            this.saveSiniestros();
            return true;
        }
        return false;
    }

    // Obtener estadísticas
    getEstadisticas() {
        const total = this.siniestros.length;
        const activos = this.siniestros.filter(s => s.estado !== 'Finalizado').length;
        const finalizados = this.siniestros.filter(s => s.estado === 'Finalizado').length;
        const enEvaluacion = this.siniestros.filter(s => s.estado === 'En Evaluación').length;
        const ingresados = this.siniestros.filter(s => s.estado === 'Ingresado').length;

        return {
            total,
            activos,
            finalizados,
            enEvaluacion,
            ingresados
        };
    }

    // Obtener estadísticas por tipo de seguro
    getEstadisticasPorTipo() {
        const tipos = {};
        this.siniestros.forEach(s => {
            tipos[s.tipoSeguro] = (tipos[s.tipoSeguro] || 0) + 1;
        });
        return tipos;
    }

    // Obtener estadísticas por liquidador
    getEstadisticasPorLiquidador() {
        const liquidadores = {};

        this.siniestros.forEach(s => {
            if (!liquidadores[s.liquidador]) {
                liquidadores[s.liquidador] = {
                    total: 0,
                    activos: 0,
                    finalizados: 0,
                    enEvaluacion: 0,
                    ingresados: 0
                };
            }

            liquidadores[s.liquidador].total++;

            switch(s.estado) {
                case 'Finalizado':
                    liquidadores[s.liquidador].finalizados++;
                    break;
                case 'En Evaluación':
                    liquidadores[s.liquidador].enEvaluacion++;
                    break;
                case 'Ingresado':
                    liquidadores[s.liquidador].ingresados++;
                    break;
                default:
                    liquidadores[s.liquidador].activos++;
            }
        });

        return liquidadores;
    }

    // Obtener siniestros recientes
    getSiniestrosRecientes(limite = 5) {
        return this.siniestros
            .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
            .slice(0, limite);
    }
}

// Función para validar RUT chileno
function validarRUT(rut) {
    // Limpiar el RUT
    rut = rut.replace(/\s/g, '').toUpperCase();
    
    // Validar formato básico
    if (!/^(\d{7,8})-([\dK])$/.test(rut)) {
        return false;
    }
    
    // Separar el cuerpo del dígito verificador
    const [cuerpo, dv] = rut.split('-');
    
    // Calcular el dígito verificador esperado
    let suma = 0;
    let multiplo = 2;
    
    // Recorrer el cuerpo de derecha a izquierda
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    
    // Calcular dígito verificador esperado
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    
    // Validar que el DV coincida
    return dv === dvCalculado;
}

// Función para formatear RUT
function formatearRUT(rut) {
    rut = rut.replace(/\s/g, '').toUpperCase();
    const regex = /^(\d{1,2})(\d{3})(\d{3})-([\dK])$/;
    const match = rut.match(regex);
    
    if (match) {
        return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    
    return rut;
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatearFechaHora(fecha) {
    return new Date(fecha).toLocaleString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo = 'error') {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return;
    
    alertBox.innerHTML = `
        <div class="alert alert-${tipo}">
            ${mensaje}
        </div>
    `;
    
    // Auto-ocultar la alerta después de 5 segundos
    setTimeout(() => {
        alertBox.innerHTML = '';
    }, 5000);
}

// Función para validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función para validar teléfono chileno
function validarTelefono(telefono) {
    const regex = /^(\+56\s?)?[9]\s?\d{4}\s?\d{4}$/;
    return regex.test(telefono);
}

// Función para logout
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userType");
    localStorage.removeItem("redirectAfterLogin");
    window.location.href = "login.html";
}

// Instancia global del manager
const siniestroManager = new SiniestroManager();

// Código específico para ingreso.html
document.addEventListener("DOMContentLoaded", () => {
  // Verificar autenticación
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userType = localStorage.getItem("userType");
  
  if (isLoggedIn !== "true") {
    localStorage.setItem("redirectAfterLogin", "ingreso.html");
    window.location.href = "login.html";
    return;
  }
  
  // Actualizar tipo de usuario en la interfaz
  const userTypeDisplay = document.getElementById("userTypeDisplay");
  if (userTypeDisplay && userType) {
    userTypeDisplay.textContent = userType === "admin" ? "Administrador" : "Cliente";
  }
  
  // Configurar navegación según tipo de usuario
  const navInicio = document.getElementById("nav-inicio");
  if (navInicio) {
    navInicio.href = userType === "admin" ? "admin.html" : "cliente.html";
  }
  
  const formulario = document.getElementById("siniestroForm");
  if (!formulario) return;

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const rut = document.getElementById("rut").value.trim();
    const nombreCliente = document.getElementById("nombreCliente").value.trim();
    const poliza = document.getElementById("poliza").value.trim();
    const patente = document.getElementById("patente").value.trim();
    const marca = document.getElementById("marca").value.trim();
    const modelo = document.getElementById("modelo").value.trim();
    const tipoDanio = document.getElementById("tipoDanio").value;
    const tipoVehiculo = document.getElementById("tipoVehiculo").value;
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    // Validaciones
    if (!validarRUT(rut)) {
      mostrarAlerta("RUT inválido. Formato esperado: 12345678-9", "error");
      return;
    }

    if (!nombreCliente) {
      mostrarAlerta("El nombre del cliente es obligatorio", "error");
      return;
    }

    if (!poliza) {
      mostrarAlerta("El número de póliza es obligatorio", "error");
      return;
    }

    if (!patente) {
      mostrarAlerta("La patente del vehículo es obligatoria", "error");
      return;
    }

    if (!marca || !modelo) {
      mostrarAlerta("La marca y modelo del vehículo son obligatorios", "error");
      return;
    }

    if (!tipoDanio || !tipoVehiculo) {
      mostrarAlerta("Debe seleccionar el tipo de daño y tipo de vehículo", "error");
      return;
    }

    if (!validarEmail(email)) {
      mostrarAlerta("El email ingresado no es válido", "error");
      return;
    }

    if (!validarTelefono(telefono)) {
      mostrarAlerta("El teléfono debe tener formato chileno (+56 9 1234 5678)", "error");
      return;
    }

    // Crear objeto con los datos
    const datos = {
      rut: formatearRUT(rut),
      nombreCliente,
      numeroPoliza: poliza,
      patente: patente.toUpperCase(),
      marca,
      modelo,
      tipoSeguro: tipoDanio,
      vehiculo: tipoVehiculo,
      email,
      telefono
    };

    try {
      const nuevo = siniestroManager.crearSiniestro(datos);
      mostrarAlerta(`Siniestro creado exitosamente con ID: ${nuevo.id}. Liquidador asignado: ${nuevo.liquidador}`, "success");
      
      // Limpiar formulario
      formulario.reset();
      
      // Actualizar estadísticas si estamos en admin
      if (typeof actualizarEstadisticas === 'function') {
        actualizarEstadisticas();
      }
    } catch (error) {
      mostrarAlerta("Error al crear el siniestro. Intente nuevamente.", "error");
      console.error("Error:", error);
    }
  });

  // Manejar botón de archivo
  const fileButton = document.querySelector('.file-button');
  const fileText = document.querySelector('.file-text');
  
  if (fileButton && fileText) {
    fileButton.addEventListener('click', () => {
      // Simular selección de archivo
      const fileName = `documento_${Date.now()}.pdf`;
      fileText.textContent = fileName;
    });
  }
});