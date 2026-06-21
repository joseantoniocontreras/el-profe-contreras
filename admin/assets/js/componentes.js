/**
 * componentes.js — Genera el header, footer, popup y botón flotante
 * de forma idéntica en todas las páginas del sitio.
 * Cada página solo necesita tener <div id="header-app"></div> y
 * <div id="footer-app"></div> vacíos; este script los rellena.
 */

function paginaActual() {
  const ruta = window.location.pathname.split('/').pop() || 'index.html';
  return ruta;
}

function renderizarHeader(config) {
  const contenedor = document.getElementById('header-app');
  if (!contenedor) return;

  const actual = paginaActual();
  const enlace = (href, texto) =>
    `<a href="${href}" class="${actual === href ? 'activo' : ''}">${texto}</a>`;

  contenedor.innerHTML = `
    <div class="barra-en-vivo" id="barra-en-vivo"></div>
    <header class="principal">
      <nav class="barra-nav">
        <a href="index.html" class="logo-marca">
          <span class="logo-icono" data-inicial-marca>P</span>
          <span class="logo-texto">
            <span class="logo-linea1">El Profe</span>
            <span class="logo-linea2">Contreras</span>
          </span>
        </a>

        <div class="nav-links">
          ${enlace('index.html', 'Inicio')}
          ${enlace('cursos.html', 'Cursos')}
          ${enlace('mentorias.html', 'Mentorías')}
          ${enlace('planes.html', 'Suscripción')}
          ${enlace('como-pagar.html', 'Cómo pagar')}
          ${enlace('contacto.html', 'Contacto')}
        </div>

        <div class="nav-acciones">
          <a href="#" class="btn btn-whatsapp" data-whatsapp-general>
            💬 <span class="texto-completo">Chatear con alguien</span>
          </a>
          <button class="menu-toggle" id="menu-toggle">☰</button>
        </div>
      </nav>

      <div class="menu-movil" id="menu-movil">
        ${enlace('index.html', 'Inicio')}
        ${enlace('cursos.html', 'Cursos')}
        ${enlace('mentorias.html', 'Mentorías')}
        ${enlace('planes.html', 'Suscripción')}
        ${enlace('como-pagar.html', 'Cómo pagar')}
        ${enlace('contacto.html', 'Contacto')}
      </div>
    </header>
  `;
}

function renderizarFooter(config) {
  const contenedor = document.getElementById('footer-app');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <footer id="contacto-footer">
      <div class="contenedor">
        <div class="footer-grid">
          <div class="footer-col">
            <h4 data-marca>El Profe Contreras</h4>
            <p>Cursos, mentorías y capacitaciones de TI, Marketing Digital y Diseño Gráfico. Aprende con quien lo aplica todos los días en su trabajo real.</p>
            <a href="#" class="footer-en-vivo" id="footer-en-vivo" style="display:none"></a>
            <div class="footer-redes">
              <a href="#" data-red="tiktok" target="_blank" rel="noopener" aria-label="TikTok">TT</a>
              <a href="#" data-red="instagram" target="_blank" rel="noopener" aria-label="Instagram">IG</a>
              <a href="#" data-red="facebook" target="_blank" rel="noopener" aria-label="Facebook">FB</a>
            </div>
          </div>

          <div class="footer-col">
            <h4>Explorar</h4>
            <ul>
              <li><a href="cursos.html">Cursos</a></li>
              <li><a href="mentorias.html">Mentorías</a></li>
              <li><a href="planes.html">Suscripción</a></li>
              <li><a href="como-pagar.html">Cómo pagar</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Categorías</h4>
            <ul>
              <li><a href="cursos.html">Diseño gráfico</a></li>
              <li><a href="cursos.html">Inteligencia Artificial</a></li>
              <li><a href="cursos.html">Marketing Digital</a></li>
              <li><a href="cursos.html">Productividad</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li><a href="#" data-whatsapp-general>WhatsApp directo</a></li>
              <li><a href="como-pagar.html">Métodos de pago</a></li>
              <li><a href="contacto.html">Formulario de contacto</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© 2026 El Profe Contreras. Todos los derechos reservados.</span>
          <span>Lima, Perú</span>
        </div>
      </div>
    </footer>

    <a href="#" class="flotante-whatsapp" data-whatsapp-general aria-label="Chatear por WhatsApp">💬</a>

    <div class="overlay-popup" id="overlay-popup">
      <div class="tarjeta-popup">
        <button class="cerrar-popup" id="cerrar-popup" aria-label="Cerrar">✕</button>
        <div class="icono-popup">📩</div>
        <h3>No te pierdas los próximos cursos</h3>
        <p>Suscríbete y entérate antes que nadie de nuevas clases en vivo, descuentos y cupos de mentoría.</p>
        <form class="form-popup" id="form-popup">
          <input type="email" placeholder="Tu correo electrónico" required>
          <button type="submit" class="btn btn-coral" style="justify-content:center">Quiero enterarme primero</button>
          <span class="nota-legal">Sin spam. Cancelas tu suscripción al boletín cuando quieras.</span>
        </form>
        <div class="mensaje-exito" id="mensaje-exito-popup"></div>
      </div>
    </div>
  `;
}

function inicializarComponentes() {
  const config = DataStore.getConfig();
  renderizarHeader(config);
  renderizarFooter(config);

  aplicarConfigGeneral(config);
  aplicarEstadoEnVivo(config);
  configurarBotonesWhatsapp(config);
  configurarMenuMovil();
  configurarPopupBoletin();
}

function aplicarConfigGeneral(config) {
  document.querySelectorAll('[data-marca]').forEach(el => (el.textContent = config.nombreMarca));
  document.querySelectorAll('[data-tagline]').forEach(el => (el.textContent = config.tagline));
  const inicial = config.nombreMarca.split(' ').pop()?.charAt(0) || 'P';
  document.querySelectorAll('[data-inicial-marca]').forEach(el => (el.textContent = inicial));

  if (config.redes) {
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
      footerBadge.innerHTML = `<span class="punto-vivo" style="background:var(--amarillo)"></span> En vivo ahora — ${escapeHtml(config.enVivoPlataforma)}`;
      footerBadge.href = config.enVivoUrl;
    }
  } else {
    if (barra) barra.classList.remove('activa');
    if (footerBadge) footerBadge.style.display = 'none';
  }
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

  window.abrirWhatsappTexto = function (texto) {
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  };
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

  function cerrarPopup() { overlay.classList.remove('visible'); }

  cerrar?.addEventListener('click', cerrarPopup);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrarPopup(); });

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
      mensajeExito.style.color = 'var(--coral)';
      mensajeExito.textContent = 'Ese correo ya está suscrito. ¡Gracias por tu interés!';
    }
  });
}

// ---------- Utilidades de seguridad ----------
function escapeHtml(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttr(str = '') {
  return String(str).replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', inicializarComponentes);
