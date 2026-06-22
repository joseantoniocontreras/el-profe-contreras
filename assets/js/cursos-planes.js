/**
 * cursos-planes.js — Renderiza catálogo de cursos y planes de suscripción.
 * Se usa en index.html (versión resumida) y cursos.html / planes.html (versión completa).
 */

function renderizarCategorias(soloDestacados = false) {
  const cursos = soloDestacados ? DataStore.getCursosVisibles().filter(c => c.destacado) : DataStore.getCursosVisibles();
  const categorias = ['Todos', ...new Set(cursos.map(c => c.categoria))];
  const contenedor = document.getElementById('categorias-slider');
  if (!contenedor) return;

  contenedor.innerHTML = categorias
    .map((cat, i) => `<button class="chip-categoria ${i === 0 ? 'activa' : ''}" data-categoria="${escAttr(cat)}">${escHtml(cat)}</button>`)
    .join('');

  contenedor.querySelectorAll('.chip-categoria').forEach(btn => {
    btn.addEventListener('click', () => {
      contenedor.querySelectorAll('.chip-categoria').forEach(b => b.classList.remove('activa'));
      btn.classList.add('activa');
      renderizarCursos(btn.dataset.categoria, soloDestacados);
    });
  });
}

function renderizarCursos(filtroCategoria = 'Todos', soloDestacados = false, limite = null) {
  const slider = document.getElementById('slider-cursos');
  if (!slider) return;

  let cursos = DataStore.getCursosVisibles();
  if (soloDestacados) cursos = cursos.filter(c => c.destacado);
  if (filtroCategoria !== 'Todos') cursos = cursos.filter(c => c.categoria === filtroCategoria);
  if (limite) cursos = cursos.slice(0, limite);

  if (cursos.length === 0) {
    slider.innerHTML = `<p style="padding:24px;color:var(--gris-texto)">Aún no hay cursos publicados en esta categoría.</p>`;
    return;
  }

  slider.innerHTML = cursos.map(curso => tarjetaCursoHTML(curso)).join('');
}

function tarjetaCursoHTML(curso) {
  const ahorro = curso.precioAntes ? `<del>S/ ${curso.precioAntes}</del>` : '';

  // Si el curso tiene imagen real (URL), la usamos como fondo
  // Si no, usamos el gradiente de color como antes
  const tieneImagen = curso.imagenUrl && curso.imagenUrl.trim() !== '';
  const estiloImagen = tieneImagen
    ? `style="background-image: url('${escAttr(curso.imagenUrl)}')"` 
    : '';
  const claseImagen = tieneImagen
    ? `${curso.portada} tiene-imagen`
    : curso.portada;

  return `
    <article class="tarjeta-curso">
      <div class="tarjeta-curso-img ${claseImagen}" ${estiloImagen}>
        <span class="tarjeta-curso-cat">${escHtml(curso.categoria)}</span>
        ${curso.destacado ? '<span class="tarjeta-curso-destacado">Top ventas</span>' : ''}
      </div>
      <div class="tarjeta-curso-body">
        <h3>${escHtml(curso.titulo)}</h3>
        <div class="tarjeta-curso-meta">
          <span>📚 ${escHtml(curso.modalidad)}</span>
          <span>⏱ ${escHtml(curso.duracion)}</span>
        </div>
        <div class="tarjeta-curso-rating">
          <span class="estrella">★</span> ${curso.rating.toFixed(1)}
          <span style="color:var(--gris-texto);font-weight:500">· ${curso.alumnos} alumnos</span>
        </div>
        <div class="tarjeta-curso-footer">
          <div class="tarjeta-curso-precio">
            <strong>S/ ${curso.precio}</strong>
            ${ahorro}
          </div>
          <button class="btn-ver-curso" onclick="abrirWhatsappCurso('${escAttr(curso.titulo)}')">Quiero inscribirme →</button>
        </div>
      </div>
    </article>
  `;
}

function renderizarPlanes() {
  const contenedor = document.getElementById('planes-grid');
  if (!contenedor) return;

  const planes = DataStore.getPlanesVisibles();
  contenedor.innerHTML = planes
    .map(
      plan => `
    <div class="tarjeta-plan ${plan.destacado ? 'destacado' : ''}">
      ${plan.destacado ? '<span class="plan-badge">Más elegido</span>' : ''}
      <span class="plan-nombre">${escHtml(plan.nombre)}</span>
      <div class="plan-precio">
        <strong>S/ ${plan.precio}</strong>
        <span>/ ${escHtml(plan.periodo)}</span>
      </div>
      <ul class="plan-beneficios">
        ${plan.beneficios.map(b => `<li>${escHtml(b)}</li>`).join('')}
      </ul>
      <button class="btn ${plan.destacado ? 'btn-coral' : 'btn-primario'}" onclick="abrirWhatsappPlan('${escAttr(plan.nombre)}')">Quiero suscribirme</button>
    </div>
  `
    )
    .join('');
}

function configurarSliderFlechas() {
  const slider = document.getElementById('slider-cursos');
  const izq = document.getElementById('flecha-izq');
  const der = document.getElementById('flecha-der');
  if (!slider || !izq || !der) return;

  const distancia = 336;
  izq.addEventListener('click', () => slider.scrollBy({ left: -distancia, behavior: 'smooth' }));
  der.addEventListener('click', () => slider.scrollBy({ left: distancia, behavior: 'smooth' }));
}

function configurarMetodosPago(config) {
  const yapeNumero = document.getElementById('yape-numero');
  const yapeTitular = document.getElementById('yape-titular');
  const plinNumero = document.getElementById('plin-numero');
  if (yapeNumero) yapeNumero.textContent = config.yapeNumero;
  if (yapeTitular) yapeTitular.textContent = config.yapeTitular;
  if (plinNumero) plinNumero.textContent = config.plinNumero;
}

function escHtml(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function escAttr(str = '') {
  return String(str).replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  const config = DataStore.getConfig();
  const esIndex = (window.location.pathname.split('/').pop() || 'index.html') === 'index.html' || window.location.pathname.endsWith('/');

  renderizarCategorias(esIndex);
  renderizarCursos('Todos', esIndex, esIndex ? 6 : null);
  renderizarPlanes();
  configurarSliderFlechas();
  configurarMetodosPago(config);

  document.title = `${config.nombreMarca} — Cursos y mentorías de TI, Marketing y Diseño`;
});
