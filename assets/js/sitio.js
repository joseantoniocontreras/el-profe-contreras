/**
 * sitio.js — Lógica del sitio público de "El Profe Contreras"
 * Lee todo del DataStore (cursos, planes, config) y pinta el DOM.
 * El panel /admin/ escribe en el mismo DataStore, así que cualquier
 * cambio ahí se refleja aquí al recargar la página.
 */

document.addEventListener('DOMContentLoaded', () => {
  const config = DataStore.getConfig();

  aplicarConfigGeneral(config);
  aplicarEstadoEnVivo(config);
  renderizarCategorias();
  renderizarCursos();
  renderizarPlanes();
  configurarBotonesWhatsapp(config);
  configurarSliderFlechas();
  configurarMenuMovil();
  configurarPopupBoletin();
  configurarMetodosPago(config);

  // SEO dinámico básico (título / meta description ya están en el HTML,
  // pero si cambias el nombre de marca en el panel admin, esto lo
  // refleja también en runtime para coherencia)
  document.title = `${config.nombreMarca} — Cursos y mentorías de TI, Marketing y Diseño`;
});

function aplicarConfigGeneral(config) {
  document.querySelectorAll('[data-marca]').forEach(el => (el.textContent = config.nombreMarca));
  document.querySelectorAll('[data-tagline]').forEach(el => (el.textContent = config.tagline));

  const inicial = config.nombreMarca.split(' ').pop()?.charAt(0) || 'P';
  document.querySelectorAll('[data-inicial-marca]').forEach(el => (el.textContent = inicial));

  // Redes sociales en footer
  if (config.redes) {
    const mapa = { tiktok: 'TT', instagram: 'IG', facebook: 'FB' };
    Object.entries(config.redes).forEach(([red, url]) => {
      const link = document.querySelector(`[data-red="${red}"]`);
      if (link && url) link.href = url;
    });
  }
}

function aplicarEstadoEnVivo(config) {
  const barra = document.getElementById('barra-en-vivo');
  const footerBadge = document.getElementById('footer-en-vivo');

  if (config.enVivo) {
    if (barra) {
      barra.classList.add('activa');
      barra.innerHTML = `
        <span class="punto-vivo"></span>
        <span>🔴 EN VIVO AHORA — ${escapeHtml(config.enVivoTitulo)} en ${escapeHtml(config.enVivoPlataforma)}</span>
        <a href="${escapeAttr(config.enVivoUrl)}" target="_blank" rel="noopener">Entrar a la transmisión →</a>
      `;
    }
    if (footerBadge) {
      footerBadge.style.display = 'inline-flex';
      footerBadge.innerHTML = `<span class="punto-vivo" style="background:var(--ambar)"></span> En vivo ahora — ${escapeHtml(config.enVivoPlataforma)}`;
      footerBadge.href = config.enVivoUrl;
    }
  } else {
    if (barra) barra.classList.remove('activa');
    if (footerBadge) footerBadge.style.display = 'none';
  }
}

function renderizarCategorias() {
  const cursos = DataStore.getCursosVisibles();
  const categorias = ['Todos', ...new Set(cursos.map(c => c.categoria))];
  const contenedor = document.getElementById('categorias-slider');
  if (!contenedor) return;

  contenedor.innerHTML = categorias
    .map(
      (cat, i) =>
        `<button class="chip-categoria ${i === 0 ? 'activa' : ''}" data-categoria="${escapeAttr(cat)}">${escapeHtml(cat)}</button>`
    )
    .join('');

  contenedor.querySelectorAll('.chip-categoria').forEach(btn => {
    btn.addEventListener('click', () => {
      contenedor.querySelectorAll('.chip-categoria').forEach(b => b.classList.remove('activa'));
      btn.classList.add('activa');
      renderizarCursos(btn.dataset.categoria);
    });
  });
}

function renderizarCursos(filtroCategoria = 'Todos') {
  const slider = document.getElementById('slider-cursos');
  if (!slider) return;

  let cursos = DataStore.getCursosVisibles();
  if (filtroCategoria !== 'Todos') {
    cursos = cursos.filter(c => c.categoria === filtroCategoria);
  }

  if (cursos.length === 0) {
    slider.innerHTML = `<p style="padding:20px;color:var(--texto-secundario)">Aún no hay cursos publicados en esta categoría.</p>`;
    return;
  }

  slider.innerHTML = cursos.map(curso => tarjetaCursoHTML(curso)).join('');
}

function tarjetaCursoHTML(curso) {
  const ahorro = curso.precioAntes ? `<del>S/ ${curso.precioAntes}</del>` : '';
  return `
    <article class="tarjeta-curso">
      <div class="tarjeta-curso-img ${curso.portada}">
        <span class="tarjeta-curso-cat">${escapeHtml(curso.categoria)}</span>
        ${curso.destacado ? '<span class="tarjeta-curso-destacado">Top ventas</span>' : ''}
      </div>
      <div class="tarjeta-curso-body">
        <h3>${escapeHtml(curso.titulo)}</h3>
        <div class="tarjeta-curso-meta">
          <span>📚 ${escapeHtml(curso.modalidad)}</span>
          <span>⏱ ${escapeHtml(curso.duracion)}</span>
        </div>
        <div class="tarjeta-curso-rating">
          <span class="estrella">★</span> ${curso.rating.toFixed(1)}
          <span style="color:var(--texto-secundario);font-weight:500">· ${curso.alumnos} alumnos</span>
        </div>
        <div class="tarjeta-curso-footer">
          <div class="tarjeta-curso-precio">
            <strong>S/ ${curso.precio}</strong>
            ${ahorro}
          </div>
          <button class="btn-ver-curso" onclick="abrirWhatsappCurso('${escapeAttr(curso.titulo)}')">Quiero inscribirme →</button>
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
      <span class="plan-nombre">${escapeHtml(plan.nombre)}</span>
      <div class="plan-precio">
        <strong>S/ ${plan.precio}</strong>
        <span>/ ${escapeHtml(plan.periodo)}</span>
      </div>
      <ul class="plan-beneficios">
        ${plan.beneficios.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
      </ul>
      <button class="btn ${plan.destacado ? 'btn-ambar' : 'btn-primario'}" onclick="abrirWhatsappPlan('${escapeAttr(plan.nombre)}')">Quiero suscribirme</button>
    </div>
  `
    )
    .join('');
}

function configurarBotonesWhatsapp(config) {
  const numero = config.whatsappNumero;
  const mensaje = encodeURIComponent(config.whatsappMensaje);
  const url = `https://wa.me/${numero}?text=${mensaje}`;

  document.querySelectorAll('[data-whatsapp-general]').forEach(el => {
    el.href = url;
    el.target = '_blank';
    el.rel = 'noopener';
  });

  window.abrirWhatsappCurso = function (tituloCurso) {
    const msg = encodeURIComponent(`Hola Profe 👋, quiero inscribirme en el curso "${tituloCurso}". ¿Me ayudas con el proceso de pago?`);
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank', 'noopener');
  };

  window.abrirWhatsappPlan = function (nombrePlan) {
    const msg = encodeURIComponent(`Hola Profe 👋, quiero suscribirme al plan "${nombrePlan}". ¿Cómo es el proceso de pago?`);
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank', 'noopener');
  };
}

function configurarSliderFlechas() {
  const slider = document.getElementById('slider-cursos');
  const izq = document.getElementById('flecha-izq');
  const der = document.getElementById('flecha-der');
  if (!slider || !izq || !der) return;

  const distancia = 322; // ancho de tarjeta + gap aprox.
  izq.addEventListener('click', () => slider.scrollBy({ left: -distancia, behavior: 'smooth' }));
  der.addEventListener('click', () => slider.scrollBy({ left: distancia, behavior: 'smooth' }));
}

function configurarMenuMovil() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu-movil');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('abierto');
    toggle.textContent = menu.classList.contains('abierto') ? '✕' : '☰';
  });
}

function configurarPopupBoletin() {
  const overlay = document.getElementById('overlay-popup');
  const cerrar = document.getElementById('cerrar-popup');
  const form = document.getElementById('form-popup');
  const mensajeExito = document.getElementById('mensaje-exito-popup');
  if (!overlay) return;

  const YA_VISTO_KEY = 'epc_popup_visto';
  const yaVisto = sessionStorage.getItem(YA_VISTO_KEY);

  if (!yaVisto) {
    setTimeout(() => {
      overlay.classList.add('visible');
      sessionStorage.setItem(YA_VISTO_KEY, '1');
    }, 4500);
  }

  function cerrarPopup() {
    overlay.classList.remove('visible');
  }

  cerrar?.addEventListener('click', cerrarPopup);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) cerrarPopup();
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const email = input.value.trim();
    if (!email) return;

    const resultado = DataStore.agregarSuscriptor(email);
    if (resultado.ok) {
      form.style.display = 'none';
      mensajeExito.classList.add('visible');
      mensajeExito.textContent = '¡Listo! Te avisaremos de nuevos cursos y clases en vivo. 🎉';
      setTimeout(cerrarPopup, 2200);
    } else {
      mensajeExito.classList.add('visible');
      mensajeExito.style.color = 'var(--terracota)';
      mensajeExito.textContent = 'Ese correo ya está suscrito. ¡Gracias por tu interés!';
    }
  });
}

function configurarMetodosPago(config) {
  const yapeNumero = document.getElementById('yape-numero');
  const yapeTitular = document.getElementById('yape-titular');
  const plinNumero = document.getElementById('plin-numero');

  if (yapeNumero) yapeNumero.textContent = config.yapeNumero;
  if (yapeTitular) yapeTitular.textContent = config.yapeTitular;
  if (plinNumero) plinNumero.textContent = config.plinNumero;
}

// ---------- Utilidades de seguridad para inyección de texto en HTML ----------
function escapeHtml(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str = '') {
  return String(str).replace(/"/g, '&quot;');
}
