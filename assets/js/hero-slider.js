/**
 * hero-slider.js — Slider del hero en la página de inicio.
 * Lee los slides desde DataStore (gestionables en el panel admin)
 * y los renderiza con autoplay + flechas + dots.
 */

const ILUSTRACIONES_SVG = {
  pantalla: `
    <svg viewBox="0 0 420 380" xmlns="http://www.w3.org/2000/svg">
      <circle cx="210" cy="190" r="170" fill="rgba(255,255,255,0.06)"/>
      <rect x="60" y="70" width="300" height="200" rx="16" fill="#FBF8FF"/>
      <rect x="60" y="70" width="300" height="34" rx="16" fill="#1C1530"/>
      <circle cx="80" cy="87" r="5" fill="#FF6B5B"/>
      <circle cx="98" cy="87" r="5" fill="#FFC43D"/>
      <circle cx="116" cy="87" r="5" fill="#1FC9A3"/>
      <rect x="84" y="124" width="170" height="14" rx="7" fill="#6D4CF2" opacity="0.85"/>
      <rect x="84" y="150" width="220" height="10" rx="5" fill="#D9D2F2"/>
      <rect x="84" y="168" width="190" height="10" rx="5" fill="#D9D2F2"/>
      <rect x="84" y="194" width="120" height="36" rx="10" fill="#FF6B5B"/>
      <rect x="220" y="194" width="64" height="36" rx="10" fill="#1FC9A3"/>
      <circle cx="320" cy="100" r="34" fill="#FFC43D"/>
      <path d="M308 100 L317 109 L334 90" stroke="#1C1530" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="40" y="300" width="100" height="14" rx="7" fill="#FF6B5B" opacity="0.7"/>
      <rect x="150" y="300" width="140" height="14" rx="7" fill="#1FC9A3" opacity="0.55"/>
    </svg>
  `,
  transmision: `
    <svg viewBox="0 0 420 380" xmlns="http://www.w3.org/2000/svg">
      <circle cx="210" cy="190" r="170" fill="rgba(255,255,255,0.06)"/>
      <rect x="90" y="60" width="240" height="220" rx="22" fill="#FBF8FF"/>
      <circle cx="210" cy="150" r="46" fill="#1C1530"/>
      <path d="M196 132 L228 150 L196 168 Z" fill="#FFC43D"/>
      <rect x="120" y="220" width="180" height="12" rx="6" fill="#D9D2F2"/>
      <rect x="120" y="242" width="130" height="12" rx="6" fill="#D9D2F2"/>
      <rect x="146" y="30" width="128" height="38" rx="19" fill="#FF6B5B"/>
      <circle cx="166" cy="49" r="6" fill="#fff"/>
      <text x="184" y="54" font-family="sans-serif" font-size="16" font-weight="800" fill="#fff">EN VIVO</text>
      <circle cx="330" cy="280" r="30" fill="#1FC9A3"/>
      <path d="M320 280 L328 288 L342 270" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="60" cy="260" r="22" fill="#6D4CF2"/>
      <circle cx="50" cy="255" r="4" fill="#fff"/>
      <circle cx="70" cy="255" r="4" fill="#fff"/>
      <path d="M48 268 Q60 278 72 268" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  pago: `
    <svg viewBox="0 0 420 380" xmlns="http://www.w3.org/2000/svg">
      <circle cx="210" cy="190" r="170" fill="rgba(255,255,255,0.06)"/>
      <rect x="80" y="90" width="260" height="170" rx="20" fill="#FBF8FF"/>
      <rect x="80" y="90" width="260" height="46" rx="20" fill="#6D4CF2"/>
      <rect x="80" y="116" width="260" height="20" fill="#6D4CF2"/>
      <circle cx="110" cy="113" r="10" fill="#FFC43D"/>
      <rect x="104" y="170" width="130" height="14" rx="7" fill="#D9D2F2"/>
      <rect x="104" y="194" width="90" height="14" rx="7" fill="#D9D2F2"/>
      <rect x="104" y="222" width="160" height="22" rx="11" fill="#1FC9A3"/>
      <circle cx="300" cy="200" r="40" fill="#FF6B5B"/>
      <text x="300" y="208" font-family="sans-serif" font-size="20" font-weight="800" fill="#fff" text-anchor="middle">S/</text>
      <circle cx="60" cy="80" r="26" fill="#FFC43D"/>
      <path d="M48 80 L57 89 L73 70" stroke="#1C1530" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="40" y="280" width="340" height="16" rx="8" fill="#FFFFFF" opacity="0.12"/>
    </svg>
  `,
};

function renderizarHeroSlider() {
  const contenedor = document.getElementById('hero-slider-app');
  if (!contenedor) return;

  const slides = DataStore.getSlidesVisibles();
  if (slides.length === 0) return;

  contenedor.innerHTML = `
    <div class="hero-slider">
      ${slides
        .map(
          (slide, i) => `
        <div class="hero-slide ${slide.fondo} ${i === 0 ? 'activo' : ''}" data-slide-index="${i}">
          <div class="hero-grid">
            <div>
              <span class="hero-eyebrow">${escapeHtmlLocal(slide.eyebrow)}</span>
              <h1>${construirTituloConAcento(slide.titulo, slide.tituloAcento)}</h1>
              <p class="lead">${escapeHtmlLocal(slide.texto)}</p>
              <div class="hero-acciones">
                <a href="${escapeAttrLocal(slide.botonEnlace)}" class="btn btn-coral btn-grande">${escapeHtmlLocal(slide.botonTexto)}</a>
                <a href="#" class="btn btn-ghost-claro btn-grande" data-whatsapp-general>Hablar por WhatsApp</a>
              </div>
              <div class="hero-stats">
                <div class="hero-stat"><strong>180+</strong><span>Personas capacitadas</span></div>
                <div class="hero-stat"><strong>4.9★</strong><span>Calificación promedio</span></div>
                <div class="hero-stat"><strong>6+</strong><span>Cursos y mentorías activas</span></div>
              </div>
            </div>
            <div class="hero-ilustracion">${ILUSTRACIONES_SVG[slide.ilustracion] || ILUSTRACIONES_SVG.pantalla}</div>
          </div>
        </div>
      `
        )
        .join('')}

      ${
        slides.length > 1
          ? `
        <button class="slider-flecha-hero izq" id="hero-flecha-izq" aria-label="Anterior">←</button>
        <button class="slider-flecha-hero der" id="hero-flecha-der" aria-label="Siguiente">→</button>
        <div class="slider-controles">
          <div class="slider-dots" id="hero-dots">
            ${slides.map((_, i) => `<button class="slider-dot ${i === 0 ? 'activo' : ''}" data-dot-index="${i}" aria-label="Ir al slide ${i + 1}"></button>`).join('')}
          </div>
        </div>
      `
          : ''
      }
    </div>
  `;

  if (slides.length > 1) {
    configurarControlesSlider(slides.length);
  }
}

function construirTituloConAcento(titulo, acento) {
  const escapado = escapeHtmlLocal(titulo);
  if (!acento) return escapado;
  const acentoEscapado = escapeHtmlLocal(acento);
  if (!escapado.includes(acentoEscapado)) return escapado;
  return escapado.replace(acentoEscapado, `<em>${acentoEscapado}</em>`);
}

function configurarControlesSlider(totalSlides) {
  let indiceActual = 0;
  let intervalo = null;

  const slidesEl = () => document.querySelectorAll('.hero-slide');
  const dotsEl = () => document.querySelectorAll('.slider-dot');

  function mostrarSlide(indice) {
    slidesEl().forEach((s, i) => s.classList.toggle('activo', i === indice));
    dotsEl().forEach((d, i) => d.classList.toggle('activo', i === indice));
    indiceActual = indice;
  }

  function siguiente() { mostrarSlide((indiceActual + 1) % totalSlides); }
  function anterior() { mostrarSlide((indiceActual - 1 + totalSlides) % totalSlides); }

  function iniciarAutoplay() {
    detenerAutoplay();
    intervalo = setInterval(siguiente, 6000);
  }
  function detenerAutoplay() { if (intervalo) clearInterval(intervalo); }

  document.getElementById('hero-flecha-der')?.addEventListener('click', () => { siguiente(); iniciarAutoplay(); });
  document.getElementById('hero-flecha-izq')?.addEventListener('click', () => { anterior(); iniciarAutoplay(); });

  dotsEl().forEach((dot, i) => {
    dot.addEventListener('click', () => { mostrarSlide(i); iniciarAutoplay(); });
  });

  const sliderWrap = document.querySelector('.hero-slider');
  sliderWrap?.addEventListener('mouseenter', detenerAutoplay);
  sliderWrap?.addEventListener('mouseleave', iniciarAutoplay);

  iniciarAutoplay();
}

function escapeHtmlLocal(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttrLocal(str = '') {
  return String(str).replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(renderizarHeroSlider, 0);
});
