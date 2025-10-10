import { useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { siniestroManager } from '../services/siniestroService';
import { validarRUT, formatearRUT, validarEmail, validarTelefono } from '../utils/validators';

export default function Ingreso() {
  const [formData, setFormData] = useState({
    rut: '',
    poliza: '',
    tipoDano: '',
    tipoVehiculo: '',
    email: '',
    telefono: ''
  });
  const [fileName, setFileName] = useState('No se ha seleccionado ningún archivo');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileClick = () => {
    const simulatedFileName = `documento_${Date.now()}.pdf`;
    setFileName(simulatedFileName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarRUT(formData.rut)) {
      alert('RUT inválido. Formato esperado: 12345678-9');
      return;
    }

    if (!validarEmail(formData.email)) {
      alert('El email ingresado no es válido');
      return;
    }

    if (!validarTelefono(formData.telefono)) {
      alert('El teléfono debe tener formato chileno (+56 9 1234 5678)');
      return;
    }

    const datos = {
      rut: formatearRUT(formData.rut),
      numeroPoliza: formData.poliza,
      tipoSeguro: formData.tipoDano,
      vehiculo: formData.tipoVehiculo,
      email: formData.email,
      telefono: formData.telefono
    };

    try {
      const nuevo = await siniestroManager.crearSiniestro(datos);
      alert(`Siniestro creado exitosamente. Liquidador asignado: ${nuevo.liquidador}`);

      setFormData({
        rut: '',
        poliza: '',
        tipoDano: '',
        tipoVehiculo: '',
        email: '',
        telefono: ''
      });
      setFileName('No se ha seleccionado ningún archivo');
    } catch (error) {
      alert('Error al crear el siniestro. Intente nuevamente.');
      console.error('Error:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      rut: '',
      poliza: '',
      tipoDano: '',
      tipoVehiculo: '',
      email: '',
      telefono: ''
    });
    setFileName('No se ha seleccionado ningún archivo');
  };

  return (
    <>
      <Header />
      <Navigation />

      <main className="main-content">
        <div className="form-container">
          <h1>Ingreso de Siniestro</h1>
          <p>Completa los datos. La validación de póliza y creación de ficha están simuladas con datos locales.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>RUT del Asegurado</label>
                <input
                  type="text"
                  id="rut"
                  placeholder="12345678-5"
                  value={formData.rut}
                  onChange={handleChange}
                  required
                />
                <small className="hint">Ejemplo: 12345678-9</small>
              </div>
              <div className="form-group">
                <label>N° de Póliza</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="poliza"
                    placeholder="POL123"
                    value={formData.poliza}
                    onChange={handleChange}
                    required
                  />
                  <img src="/src/image/folder.png" alt="Póliza" className="input-icon" />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Daño</label>
                <select id="tipoDano" value={formData.tipoDano} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  <option>Colisión</option>
                  <option>Robo</option>
                  <option>Incendio</option>
                  <option>Vandalismo</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tipo de Vehículo</label>
                <select id="tipoVehiculo" value={formData.tipoVehiculo} onChange={handleChange} required>
                  <option value="">Selecciona...</option>
                  <option>Auto</option>
                  <option>Camioneta</option>
                  <option>Moto</option>
                  <option>Camión</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email de contacto</label>
                <input
                  type="email"
                  id="email"
                  placeholder="correo@dominio.cl"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  placeholder="+56 9 1234 5678"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group file-upload">
              <label>Adjuntar Documento (simulado)</label>
              <div className="file-input-wrapper">
                <button type="button" className="file-button" onClick={handleFileClick}>
                  <img src="/src/image/folder.png" alt="Archivo" className="file-icon" />
                  Elegir archivo
                </button>
                <span className="file-text">{fileName}</span>
              </div>
              <small className="file-hint">Se almacenan solo los nombres de archivo en esta demo</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <img src="/src/image/Checkmark.png" alt="Validar" className="btn-icon" />
                Validar y crear ficha
              </button>
              <button type="button" onClick={handleReset} className="btn btn-secondary">
                <img src="/src/image/list.png" alt="Limpiar" className="btn-icon" />
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
