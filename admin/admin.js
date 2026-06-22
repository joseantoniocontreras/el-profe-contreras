/**
 * admin.js — Panel de administración de "El Profe Contreras"
 * Usa el mismo DataStore que el sitio público. Todo lo que se
 * guarda aquí se refleja en index.html al recargar esa página.
 */

const CLAVE_ADMIN_KEY = 'epc_admin_autenticado';

document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem(CLAVE_ADMIN_KEY) === '1') {
    mostrarPanel();
  } else {
    configurarLogin();
  }
});

// ===================== LOGIN SIMPLE =====================
function configurarLogin() {
  const form = document.getElementById('form-login');
  const error = document.getElementById('login-error');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const clave = document.getElementById('input-clave').value;

    // Clave por defecto: "profecontreras2026" — cámbiala en este archivo
    // (línea de abajo) por la que tú quieras usar.
    const CLAVE_CORRECTA = 'profecontreras2026';

    if (clave === CLAVE_CORRECTA) {
      sessionStorage.setItem(CLAVE_ADMIN_KEY, '1');
      mostrarPanel();
    } else {
      error.textContent = 'Clave incorrecta. Intenta de nuevo.';
      error.classList.add('visible');
    }
  });
}

function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_ADMIN_KEY);
  location.reload();
}

function mostrarPanel() {
  document.getElementById('pantalla-login').style.display = 'none';
  document.getElementById('pantalla-panel').style.display = 'block';
  inicializarPanel();
}

// ===================== INICIALIZACIÓN DEL PANEL =====================
function inicializarPanel() {
  configurarTabs();
  renderizarTablaSlides();
  renderizarTablaCursos();
  renderizarTablaPlanes();
  cargarFormularioConfig();
  cargarEstadoEnVivo();
  renderizarListaSuscriptores();
  configurarFormularioSlide();
  configurarFormularioCurso();
  configurarFormularioPlan();
  configurarFormularioConfig();
  configurarFormularioEnVivo();
}

function configurarTabs() {
  const tabs = document.querySelectorAll('.tab-admin');
  const paneles = document.querySelectorAll('.panel-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('activa'));
      paneles.forEach(p => p.classList.remove('visible'));
      tab.classList.add('activa');
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add('visible');
    });
  });
}

// ===================== HERO / SLIDES: TABLA Y CRUD =====================
function renderizarTablaSlides() {
  const tbody = document.getElementById('tbody-slides');
  const slides = DataStore.getSlides().sort((a, b) => a.orden - b.orden);

  if (slides.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="celda-vacia">No hay slides. Agrega al menos uno para que el inicio tenga hero.</td></tr>`;
    return;
  }

  tbody.innerHTML = slides
    .map(
      slide => `
    <tr>
      <td><strong>${escapeHtml(slide.titulo)}</strong></td>
      <td>${escapeHtml(slide.botonTexto)} → ${escapeHtml(slide.botonEnlace)}</td>
      <td>
        <span class="badge-estado ${slide.visible ? 'badge-visible' : 'badge-oculto'}">
          ${slide.visible ? 'Visible' : 'Oculto'}
        </span>
      </td>
      <td class="celda-acciones">
        <button class="btn-accion" onclick="editarSlide('${slide.id}')" title="Editar">✏️</button>
        <button class="btn-accion" onclick="alternarVisibilidadSlide('${slide.id}')" title="Mostrar/ocultar">${slide.visible ? '🙈' : '👁️'}</button>
        <button class="btn-accion btn-peligro" onclick="eliminarSlideConfirm('${slide.id}')" title="Eliminar">🗑️</button>
      </td>
    </tr>
  `
    )
    .join('');
}

function configurarFormularioSlide() {
  const form = document.getElementById('form-slide');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const id = document.getElementById('slide-id').value || null;
    const slide = {
      id,
      eyebrow: document.getElementById('slide-eyebrow').value.trim(),
      titulo: document.getElementById('slide-titulo').value.trim(),
      tituloAcento: document.getElementById('slide-acento').value.trim(),
      texto: document.getElementById('slide-texto').value.trim(),
      fondo: document.getElementById('slide-fondo').value,
      ilustracion: document.getElementById('slide-ilustracion').value,
      botonTexto: document.getElementById('slide-boton-texto').value.trim(),
      botonEnlace: document.getElementById('slide-boton-enlace').value,
    };

    if (!slide.titulo || !slide.texto || !slide.botonTexto) {
      mostrarAviso('Completa al menos título, texto y botón.', 'error');
      return;
    }

    if (id) {
      const existente = DataStore.getSlides().find(s => s.id === id);
      slide.orden = existente?.orden ?? 999;
      slide.visible = existente?.visible ?? true;
    }

    DataStore.guardarSlide(slide);
    form.reset();
    document.getElementById('slide-id').value = '';
    document.getElementById('titulo-form-slide').textContent = 'Agregar nuevo slide del hero';
    renderizarTablaSlides();
    mostrarAviso(id ? 'Slide actualizado.' : 'Slide agregado.', 'exito');
  });

  document.getElementById('btn-cancelar-edicion-slide').addEventListener('click', () => {
    form.reset();
    document.getElementById('slide-id').value = '';
    document.getElementById('titulo-form-slide').textContent = 'Agregar nuevo slide del hero';
  });
}

function editarSlide(id) {
  const slide = DataStore.getSlides().find(s => s.id === id);
  if (!slide) return;

  document.getElementById('slide-id').value = slide.id;
  document.getElementById('slide-eyebrow').value = slide.eyebrow;
  document.getElementById('slide-titulo').value = slide.titulo;
  document.getElementById('slide-acento').value = slide.tituloAcento || '';
  document.getElementById('slide-texto').value = slide.texto;
  document.getElementById('slide-fondo').value = slide.fondo;
  document.getElementById('slide-ilustracion').value = slide.ilustracion;
  document.getElementById('slide-boton-texto').value = slide.botonTexto;
  document.getElementById('slide-boton-enlace').value = slide.botonEnlace;
  document.getElementById('titulo-form-slide').textContent = `Editando: ${slide.titulo}`;

  document.getElementById('form-slide').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function alternarVisibilidadSlide(id) {
  DataStore.toggleVisibilidadSlide(id);
  renderizarTablaSlides();
}

function eliminarSlideConfirm(id) {
  if (confirm('¿Eliminar este slide del hero?')) {
    DataStore.eliminarSlide(id);
    renderizarTablaSlides();
    mostrarAviso('Slide eliminado.', 'exito');
  }
}

// ===================== CURSOS: TABLA Y CRUD =====================
function renderizarTablaCursos() {
  const tbody = document.getElementById('tbody-cursos');
  const cursos = DataStore.getCursos().sort((a, b) => a.orden - b.orden);

  if (cursos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="celda-vacia">Aún no agregaste ningún curso. Usa el formulario de arriba.</td></tr>`;
    return;
  }

  tbody.innerHTML = cursos
    .map(
      curso => `
    <tr>
      <td><strong>${escapeHtml(curso.titulo)}</strong><br><span class="texto-mini">${escapeHtml(curso.categoria)}</span></td>
      <td>S/ ${curso.precio}</td>
      <td>${escapeHtml(curso.modalidad)}</td>
      <td>${curso.alumnos}</td>
      <td>
        <span class="badge-estado ${curso.visible ? 'badge-visible' : 'badge-oculto'}">
          ${curso.visible ? 'Visible' : 'Oculto'}
        </span>
      </td>
      <td class="celda-acciones">
        <button class="btn-accion" onclick="editarCurso('${curso.id}')" title="Editar">✏️</button>
        <button class="btn-accion" onclick="alternarVisibilidadCurso('${curso.id}')" title="Mostrar/ocultar">${curso.visible ? '🙈' : '👁️'}</button>
        <button class="btn-accion btn-peligro" onclick="confirmarEliminarCurso('${curso.id}', '${escapeAttr(curso.titulo)}')" title="Eliminar">🗑️</button>
      </td>
    </tr>
  `
    )
    .join('');
}

function actualizarPreviewImagen(url) {
  const preview = document.getElementById('preview-imagen-curso');
  if (!preview) return;
  if (url) {
    preview.innerHTML = `<img src="${url}" alt="Vista previa" onerror="this.parentElement.innerHTML='<span>URL inválida o imagen no accesible</span>'">`;
  } else {
    preview.innerHTML = '<span>Vista previa de la imagen aquí</span>';
  }
}

function configurarFormularioCurso() {
  const form = document.getElementById('form-curso');

  // Preview de imagen en tiempo real
  const inputImagen = document.getElementById('curso-imagen-url');
  inputImagen.addEventListener('input', () => actualizarPreviewImagen(inputImagen.value.trim()));

  form.addEventListener('submit', e => {
    e.preventDefault();

    const id = document.getElementById('curso-id').value || null;
    const curso = {
      id,
      titulo: document.getElementById('curso-titulo').value.trim(),
      categoria: document.getElementById('curso-categoria').value.trim(),
      nivel: document.getElementById('curso-nivel').value,
      modalidad: document.getElementById('curso-modalidad').value.trim(),
      duracion: document.getElementById('curso-duracion').value.trim(),
      precio: Number(document.getElementById('curso-precio').value),
      precioAntes: document.getElementById('curso-precio-antes').value
        ? Number(document.getElementById('curso-precio-antes').value)
        : null,
      destacado: document.getElementById('curso-destacado').checked,
      portada: document.getElementById('curso-portada').value,
      resumen: document.getElementById('curso-resumen').value.trim(),
      imagenUrl: document.getElementById('curso-imagen-url').value.trim(),
      visible: true,
    };

    if (!curso.titulo || !curso.categoria || !curso.precio) {
      mostrarAviso('Completa al menos título, categoría y precio.', 'error');
      return;
    }

    if (id) {
      const existente = DataStore.getCursoPorId(id);
      curso.alumnos = existente?.alumnos ?? 0;
      curso.rating = existente?.rating ?? 5.0;
      curso.orden = existente?.orden ?? 999;
      curso.visible = existente?.visible ?? true;
    }

    DataStore.guardarCurso(curso);
    form.reset();
    document.getElementById('curso-id').value = '';
    document.getElementById('titulo-form-curso').textContent = 'Agregar nuevo curso';
    renderizarTablaCursos();
    mostrarAviso(id ? 'Curso actualizado correctamente.' : 'Curso agregado correctamente.', 'exito');
  });

  document.getElementById('btn-cancelar-edicion-curso').addEventListener('click', () => {
    form.reset();
    document.getElementById('curso-id').value = '';
    document.getElementById('titulo-form-curso').textContent = 'Agregar nuevo curso';
  });
}

function editarCurso(id) {
  const curso = DataStore.getCursoPorId(id);
  if (!curso) return;

  document.getElementById('curso-id').value = curso.id;
  document.getElementById('curso-titulo').value = curso.titulo;
  document.getElementById('curso-categoria').value = curso.categoria;
  document.getElementById('curso-nivel').value = curso.nivel;
  document.getElementById('curso-modalidad').value = curso.modalidad;
  document.getElementById('curso-duracion').value = curso.duracion;
  document.getElementById('curso-precio').value = curso.precio;
  document.getElementById('curso-precio-antes').value = curso.precioAntes || '';
  document.getElementById('curso-destacado').checked = curso.destacado;
  document.getElementById('curso-portada').value = curso.portada;
  document.getElementById('curso-resumen').value = curso.resumen || '';
  document.getElementById('curso-imagen-url').value = curso.imagenUrl || '';
  actualizarPreviewImagen(curso.imagenUrl || '');
  document.getElementById('titulo-form-curso').textContent = `Editando: ${curso.titulo}`;

  document.getElementById('form-curso').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function alternarVisibilidadCurso(id) {
  DataStore.toggleVisibilidadCurso(id);
  renderizarTablaCursos();
}

let cursoAEliminar = null;
function confirmarEliminarCurso(id, titulo) {
  cursoAEliminar = id;
  document.getElementById('texto-confirmar-borrado').textContent = `¿Seguro que quieres eliminar "${titulo}"? Esta acción no se puede deshacer.`;
  document.getElementById('modal-confirmar-borrado').classList.add('visible');
}

function ejecutarEliminarCurso() {
  if (cursoAEliminar) {
    DataStore.eliminarCurso(cursoAEliminar);
    renderizarTablaCursos();
    mostrarAviso('Curso eliminado.', 'exito');
  }
  cerrarModalBorrado();
}

function cerrarModalBorrado() {
  cursoAEliminar = null;
  document.getElementById('modal-confirmar-borrado').classList.remove('visible');
}

// ===================== PLANES DE SUSCRIPCIÓN =====================
function renderizarTablaPlanes() {
  const tbody = document.getElementById('tbody-planes');
  const planes = DataStore.getPlanes();

  if (planes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="celda-vacia">No hay planes configurados.</td></tr>`;
    return;
  }

  tbody.innerHTML = planes
    .map(
      plan => `
    <tr>
      <td><strong>${escapeHtml(plan.nombre)}</strong></td>
      <td>S/ ${plan.precio} / ${escapeHtml(plan.periodo)}</td>
      <td>
        <span class="badge-estado ${plan.visible ? 'badge-visible' : 'badge-oculto'}">
          ${plan.visible ? 'Visible' : 'Oculto'}
        </span>
      </td>
      <td class="celda-acciones">
        <button class="btn-accion" onclick="editarPlan('${plan.id}')" title="Editar">✏️</button>
        <button class="btn-accion btn-peligro" onclick="eliminarPlanConfirm('${plan.id}')" title="Eliminar">🗑️</button>
      </td>
    </tr>
  `
    )
    .join('');
}

function configurarFormularioPlan() {
  const form = document.getElementById('form-plan');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const id = document.getElementById('plan-id').value || null;
    const beneficiosTexto = document.getElementById('plan-beneficios').value.trim();
    const beneficios = beneficiosTexto
      .split('\n')
      .map(b => b.trim())
      .filter(Boolean);

    const plan = {
      id,
      nombre: document.getElementById('plan-nombre').value.trim(),
      precio: Number(document.getElementById('plan-precio').value),
      periodo: document.getElementById('plan-periodo').value.trim(),
      destacado: document.getElementById('plan-destacado').checked,
      beneficios,
      visible: true,
    };

    if (!plan.nombre || !plan.precio || beneficios.length === 0) {
      mostrarAviso('Completa nombre, precio y al menos un beneficio.', 'error');
      return;
    }

    DataStore.guardarPlan(plan);
    form.reset();
    document.getElementById('plan-id').value = '';
    renderizarTablaPlanes();
    mostrarAviso(id ? 'Plan actualizado.' : 'Plan agregado.', 'exito');
  });
}

function editarPlan(id) {
  const plan = DataStore.getPlanes().find(p => p.id === id);
  if (!plan) return;

  document.getElementById('plan-id').value = plan.id;
  document.getElementById('plan-nombre').value = plan.nombre;
  document.getElementById('plan-precio').value = plan.precio;
  document.getElementById('plan-periodo').value = plan.periodo;
  document.getElementById('plan-destacado').checked = plan.destacado;
  document.getElementById('plan-beneficios').value = plan.beneficios.join('\n');

  document.getElementById('form-plan').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function eliminarPlanConfirm(id) {
  if (confirm('¿Eliminar este plan de suscripción?')) {
    DataStore.eliminarPlan(id);
    renderizarTablaPlanes();
  }
}

// ===================== CONFIGURACIÓN GENERAL =====================
function cargarFormularioConfig() {
  const config = DataStore.getConfig();

  document.getElementById('config-nombre-marca').value = config.nombreMarca;
  document.getElementById('config-tagline').value = config.tagline;
  document.getElementById('config-whatsapp-numero').value = config.whatsappNumero;
  document.getElementById('config-whatsapp-mensaje').value = config.whatsappMensaje;
  document.getElementById('config-yape-numero').value = config.yapeNumero;
  document.getElementById('config-yape-titular').value = config.yapeTitular;
  document.getElementById('config-plin-numero').value = config.plinNumero;
  document.getElementById('config-tiktok').value = config.redes.tiktok || '';
  document.getElementById('config-instagram').value = config.redes.instagram || '';
  document.getElementById('config-facebook').value = config.redes.facebook || '';

  // Cargar espaciado guardado y marcar el botón activo
  const nivelGuardado = config.espaciadoSeccion || 'normal';
  document.getElementById('config-espaciado').value = nivelGuardado;
  marcarBtnEspacioActivo(nivelGuardado);
}

function marcarBtnEspacioActivo(nivel) {
  document.querySelectorAll('.btn-espacio').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.nivel === nivel);
  });
}

function configurarSelectorEspaciado() {
  document.querySelectorAll('.btn-espacio').forEach(btn => {
    btn.addEventListener('click', () => {
      const nivel = btn.dataset.nivel;
      document.getElementById('config-espaciado').value = nivel;
      marcarBtnEspacioActivo(nivel);
      // Vista previa en tiempo real en el propio panel
      DataStore.setEspaciado(nivel);
      mostrarAviso(`Espaciado cambiado a "${nivel}" — guarda la configuración para aplicarlo permanentemente.`, 'exito');
    });
  });
}

function configurarFormularioConfig() {
  const form = document.getElementById('form-config');
  configurarSelectorEspaciado();

  form.addEventListener('submit', e => {
    e.preventDefault();

    const espaciado = document.getElementById('config-espaciado').value || 'normal';

    DataStore.guardarConfig({
      nombreMarca: document.getElementById('config-nombre-marca').value.trim(),
      tagline: document.getElementById('config-tagline').value.trim(),
      whatsappNumero: document.getElementById('config-whatsapp-numero').value.trim().replace(/\D/g, ''),
      whatsappMensaje: document.getElementById('config-whatsapp-mensaje').value.trim(),
      yapeNumero: document.getElementById('config-yape-numero').value.trim(),
      yapeTitular: document.getElementById('config-yape-titular').value.trim(),
      plinNumero: document.getElementById('config-plin-numero').value.trim(),
      espaciadoSeccion: espaciado,
      redes: {
        tiktok: document.getElementById('config-tiktok').value.trim(),
        instagram: document.getElementById('config-instagram').value.trim(),
        facebook: document.getElementById('config-facebook').value.trim(),
      },
    });

    DataStore.setEspaciado(espaciado);
    mostrarAviso('Configuración guardada. Los cambios se verán en todo el sitio al recargar.', 'exito');
  });
}

// ===================== ESTADO "EN VIVO" =====================
function cargarEstadoEnVivo() {
  const config = DataStore.getConfig();
  document.getElementById('envivo-switch').checked = config.enVivo;
  document.getElementById('envivo-titulo').value = config.enVivoTitulo;
  document.getElementById('envivo-plataforma').value = config.enVivoPlataforma;
  document.getElementById('envivo-url').value = config.enVivoUrl;
  actualizarIndicadorEnVivo(config.enVivo);
}

function actualizarIndicadorEnVivo(activo) {
  const indicador = document.getElementById('indicador-envivo-estado');
  if (activo) {
    indicador.textContent = '🔴 Actualmente EN VIVO en el sitio público';
    indicador.className = 'indicador-envivo activo';
  } else {
    indicador.textContent = '⚪ Actualmente sin transmisión activa';
    indicador.className = 'indicador-envivo inactivo';
  }
}

function configurarFormularioEnVivo() {
  const form = document.getElementById('form-envivo');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const activo = document.getElementById('envivo-switch').checked;
    DataStore.setEnVivo(activo, {
      enVivoTitulo: document.getElementById('envivo-titulo').value.trim(),
      enVivoPlataforma: document.getElementById('envivo-plataforma').value.trim(),
      enVivoUrl: document.getElementById('envivo-url').value.trim(),
    });

    actualizarIndicadorEnVivo(activo);
    mostrarAviso(activo ? '¡Listo! La barra "EN VIVO" ya está activa en el sitio.' : 'Transmisión marcada como finalizada.', 'exito');
  });
}

// ===================== SUSCRIPTORES DEL BOLETÍN =====================
function renderizarListaSuscriptores() {
  const tbody = document.getElementById('tbody-suscriptores');
  const suscriptores = DataStore.getSuscriptores().sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  document.getElementById('contador-suscriptores').textContent = suscriptores.length;

  if (suscriptores.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="celda-vacia">Aún no hay suscriptores al boletín.</td></tr>`;
    return;
  }

  tbody.innerHTML = suscriptores
    .map(
      s => `
    <tr>
      <td>${escapeHtml(s.email)}</td>
      <td>${new Date(s.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
      <td class="celda-acciones">
        <button class="btn-accion btn-peligro" onclick="eliminarSuscriptorConfirm('${escapeAttr(s.email)}')" title="Eliminar">🗑️</button>
      </td>
    </tr>
  `
    )
    .join('');

  document.getElementById('btn-exportar-csv').onclick = () => {
    const csv = DataStore.exportarSuscriptoresCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suscriptores-boletin.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
}

function eliminarSuscriptorConfirm(email) {
  if (confirm(`¿Eliminar a ${email} de la lista del boletín?`)) {
    DataStore.eliminarSuscriptor(email);
    renderizarListaSuscriptores();
  }
}

// ===================== AVISOS (toast) =====================
function mostrarAviso(mensaje, tipo = 'exito') {
  const aviso = document.getElementById('aviso-flotante');
  aviso.textContent = mensaje;
  aviso.className = `aviso-flotante visible ${tipo}`;
  setTimeout(() => aviso.classList.remove('visible'), 3200);
}

// ===================== UTILIDADES =====================
function escapeHtml(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str = '') {
  return String(str).replace(/'/g, '&#39;');
}
