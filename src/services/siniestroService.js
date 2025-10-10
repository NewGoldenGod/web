import { supabase } from './supabase';

class SiniestroManager {
  async crearSiniestro(datos) {
    const nuevoSiniestro = {
      rut: datos.rut,
      numero_poliza: datos.numeroPoliza,
      tipo_seguro: datos.tipoSeguro,
      vehiculo: datos.vehiculo,
      email: datos.email,
      telefono: datos.telefono,
      estado: 'Ingresado',
      liquidador: this.asignarLiquidador(),
      grua: this.asignarGrua(),
      taller: this.asignarTaller(),
      usuario_tipo: datos.usuarioTipo || 'cliente'
    };

    const { data, error } = await supabase
      .from('siniestros')
      .insert([nuevoSiniestro])
      .select()
      .single();

    if (error) {
      console.error('Error creating siniestro:', error);
      throw error;
    }

    return data;
  }

  async buscarSiniestro(rut, poliza) {
    let query = supabase.from('siniestros').select('*');

    if (rut) {
      query = query.eq('rut', rut);
    }
    if (poliza) {
      query = query.eq('numero_poliza', poliza);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error searching siniestro:', error);
      throw error;
    }

    return data;
  }

  async buscarSiniestros(criterios) {
    let query = supabase.from('siniestros').select('*');

    if (criterios.rut) {
      query = query.ilike('rut', `%${criterios.rut}%`);
    }
    if (criterios.poliza) {
      query = query.ilike('numero_poliza', `%${criterios.poliza}%`);
    }
    if (criterios.estado) {
      query = query.eq('estado', criterios.estado);
    }
    if (criterios.tipo) {
      query = query.eq('tipo_seguro', criterios.tipo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching siniestros:', error);
      throw error;
    }

    return data || [];
  }

  async obtenerSiniestro(id) {
    const { data, error } = await supabase
      .from('siniestros')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error getting siniestro:', error);
      throw error;
    }

    return data;
  }

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

  async actualizarEstado(id, nuevoEstado) {
    const { data, error } = await supabase
      .from('siniestros')
      .update({
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating siniestro:', error);
      return false;
    }

    return true;
  }

  async getEstadisticas() {
    const { data, error } = await supabase
      .from('siniestros')
      .select('estado');

    if (error) {
      console.error('Error getting estadisticas:', error);
      return {
        total: 0,
        activos: 0,
        finalizados: 0,
        enEvaluacion: 0,
        ingresados: 0
      };
    }

    const siniestros = data || [];
    const total = siniestros.length;
    const activos = siniestros.filter(s => s.estado !== 'Finalizado').length;
    const finalizados = siniestros.filter(s => s.estado === 'Finalizado').length;
    const enEvaluacion = siniestros.filter(s => s.estado === 'En Evaluación').length;
    const ingresados = siniestros.filter(s => s.estado === 'Ingresado').length;

    return {
      total,
      activos,
      finalizados,
      enEvaluacion,
      ingresados
    };
  }

  async getEstadisticasPorTipo() {
    const { data, error } = await supabase
      .from('siniestros')
      .select('tipo_seguro');

    if (error) {
      console.error('Error getting estadisticas por tipo:', error);
      return {};
    }

    const tipos = {};
    (data || []).forEach(s => {
      tipos[s.tipo_seguro] = (tipos[s.tipo_seguro] || 0) + 1;
    });
    return tipos;
  }

  async getEstadisticasPorLiquidador() {
    const { data, error } = await supabase
      .from('siniestros')
      .select('liquidador, estado');

    if (error) {
      console.error('Error getting estadisticas por liquidador:', error);
      return {};
    }

    const liquidadores = {};

    (data || []).forEach(s => {
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

  async getSiniestrosRecientes(limite = 5) {
    const { data, error } = await supabase
      .from('siniestros')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limite);

    if (error) {
      console.error('Error getting siniestros recientes:', error);
      return [];
    }

    return data || [];
  }
}

export const siniestroManager = new SiniestroManager();
