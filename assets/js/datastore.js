/**
 * DataStore — Capa de acceso a datos de "El Profe Contreras"
 * ------------------------------------------------------------------
 * FASE ACTUAL: usa localStorage del navegador (sirve para GitHub Pages,
 * sin backend, sin costo).
 *
 * FASE FUTURA: cuando tengas dominio + hosting + base de datos real,
 * solo tienes que reemplazar las funciones de este archivo para que
 * en vez de leer/escribir en localStorage, hagan fetch() a tu API
 * (PHP+MySQL, Node+Postgres, Firebase, Supabase, lo que elijas).
 * El resto del sitio (sitio público + panel admin) llama SIEMPRE a
 * estas funciones, nunca a localStorage directamente — por eso migrar
 * no obliga a tocar el resto del código.
 *
 * Cómo migrar en el futuro (resumen):
 *   1. Crea tus endpoints (ej. GET/POST /api/cursos, /api/config, etc.)
 *   2. En cada función de abajo, cambia el cuerpo para usar fetch()
 *      en vez de localStorage.getItem/setItem.
 *   3. Como todas las funciones son async-ready (puedes volverlas
 *      `async` y usar `await fetch(...)`), el resto del sitio que ya
 *      usa `await DataStore.getCursos()` no necesita cambios.
 * ------------------------------------------------------------------
 */

const DataStore = (() => {
  const KEYS = {
    CURSOS: 'epc_cursos',
    CONFIG: 'epc_config',
    SUSCRIPTORES: 'epc_suscriptores',
    PLANES: 'epc_planes',
    SLIDES: 'epc_slides',
  };

  // ---------- Utilidades internas ----------
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.error('DataStore: error leyendo', key, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('DataStore: error guardando', key, e);
      return false;
    }
  }

  function uid(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // ---------- Datos semilla (solo se usan la primera vez) ----------
  const SLIDES_SEMILLA = [
    {
      id: 'slide_1',
      eyebrow: '📖 Aprende con quien lo aplica todos los días',
      titulo: 'Aprende diseño, IA y marketing con resultados que se ven en tu trabajo',
      tituloAcento: 'diseño, IA y marketing',
      texto: 'Cursos prácticos, mentorías 1:1 y clases en vivo. Sin relleno teórico, directo a lo que necesitas resolver.',
      fondo: 'hero-slide-bg-1',
      ilustracion: 'pantalla',
      botonTexto: 'Ver todos los cursos',
      botonEnlace: 'cursos.html',
      visible: true,
      orden: 1,
    },
    {
      id: 'slide_2',
      eyebrow: '🔴 Clases en vivo cada semana',
      titulo: 'Conecta en TikTok Live y resuelve tus dudas en tiempo real',
      tituloAcento: 'TikTok Live',
      texto: 'Transmito clases gratuitas para que conozcas mi forma de enseñar antes de inscribirte a un curso completo.',
      fondo: 'hero-slide-bg-2',
      ilustracion: 'transmision',
      botonTexto: 'Ver próximas transmisiones',
      botonEnlace: 'contacto.html',
      visible: true,
      orden: 2,
    },
    {
      id: 'slide_3',
      eyebrow: '💳 Pago simple, 100% peruano',
      titulo: 'Paga con Yape, Plin o transferencia, sin complicaciones',
      tituloAcento: 'Yape, Plin',
      texto: 'Todo el proceso de compra se cierra por WhatsApp: eliges, confirmas y pagas como ya sabes hacerlo.',
      fondo: 'hero-slide-bg-3',
      ilustracion: 'pago',
      botonTexto: 'Ver cómo pagar',
      botonEnlace: 'como-pagar.html',
      visible: true,
      orden: 3,
    },
  ];

  const CURSOS_SEMILLA = [
    {
      id: 'curso_canva_pro',
      titulo: 'Canva para crear piezas que sí venden',
      categoria: 'Diseño gráfico',
      nivel: 'Principiante',
      modalidad: 'Grabado + Q&A en vivo',
      duracion: '6 sesiones · 8 horas',
      precio: 89,
      precioAntes: 129,
      destacado: true,
      alumnos: 47,
      rating: 4.9,
      portada: 'gradient-1',
      resumen: 'Domina Canva Pro desde cero: flyers, posts, banners y branding básico, con ejercicios reales de negocio.',
      visible: true,
      orden: 1,
    },
    {
      id: 'curso_ia_productividad',
      titulo: 'IA aplicada: ahorra 5 horas a la semana',
      categoria: 'Inteligencia Artificial',
      nivel: 'Todo nivel',
      modalidad: 'En vivo (cohort)',
      duracion: '4 sesiones · 6 horas',
      precio: 109,
      precioAntes: null,
      destacado: true,
      alumnos: 33,
      rating: 5.0,
      portada: 'gradient-2',
      resumen: 'Prompts y flujos prácticos con ChatGPT para automatizar reportes, correos y tareas repetitivas de oficina.',
      visible: true,
      orden: 2,
    },
    {
      id: 'curso_marketing_digital',
      titulo: 'Marketing digital para negocios locales',
      categoria: 'Marketing Digital',
      nivel: 'Intermedio',
      modalidad: 'Grabado',
      duracion: '8 sesiones · 10 horas',
      precio: 139,
      precioAntes: 179,
      destacado: false,
      alumnos: 21,
      rating: 4.8,
      portada: 'gradient-3',
      resumen: 'Estrategia de redes, contenido y captación de clientes con presupuesto real de una pyme peruana.',
      visible: true,
      orden: 3,
    },
    {
      id: 'curso_excel_basico',
      titulo: 'Excel desde cero para el día a día de oficina',
      categoria: 'Productividad',
      nivel: 'Principiante',
      modalidad: 'Grabado',
      duracion: '5 sesiones · 5 horas',
      precio: 59,
      precioAntes: null,
      destacado: false,
      alumnos: 58,
      rating: 4.7,
      portada: 'gradient-4',
      resumen: 'Fórmulas, tablas y reportes simples para resolver tu trabajo administrativo sin enredarte.',
      visible: true,
      orden: 4,
    },
    {
      id: 'curso_illustrator',
      titulo: 'Illustrator para redes sociales',
      categoria: 'Diseño gráfico',
      nivel: 'Principiante',
      modalidad: 'Grabado + Q&A en vivo',
      duracion: '8 sesiones · 9 horas',
      precio: 99,
      precioAntes: null,
      destacado: false,
      alumnos: 15,
      rating: 4.9,
      portada: 'gradient-5',
      resumen: 'Vectores, tipografía y composición aplicados a contenido publicitario real para Instagram y TikTok.',
      visible: true,
      orden: 5,
    },
    {
      id: 'curso_mentoria_1a1',
      titulo: 'Mentoría 1:1 — Transformación digital de tu negocio',
      categoria: 'Mentoría',
      nivel: 'Profesional',
      modalidad: 'Sesiones individuales en vivo',
      duracion: '4 sesiones · 1 hora c/u',
      precio: 320,
      precioAntes: null,
      destacado: true,
      alumnos: 9,
      rating: 5.0,
      portada: 'gradient-6',
      resumen: 'Diagnóstico de tus procesos de TI, marketing o comunicación y plan de acción acompañado paso a paso.',
      visible: true,
      orden: 6,
    },
  ];

  const PLANES_SEMILLA = [
    {
      id: 'plan_mensual',
      nombre: 'Suscripción mensual',
      precio: 49,
      periodo: 'mes',
      destacado: true,
      beneficios: [
        'Acceso a todos los cursos grabados del catálogo',
        'Clases en vivo grupales cada mes',
        'Comunidad privada de WhatsApp',
        'Cancela cuando quieras, sin permanencia',
      ],
      visible: true,
    },
    {
      id: 'plan_anual',
      nombre: 'Suscripción anual',
      precio: 39,
      periodo: 'mes (pago anual)',
      destacado: false,
      beneficios: [
        'Todo lo del plan mensual',
        '2 meses gratis frente al plan mensual',
        'Acceso prioritario a cupos de mentoría 1:1',
      ],
      visible: true,
    },
  ];

  const CONFIG_SEMILLA = {
    nombreMarca: 'El Profe Contreras',
    tagline: 'Aprende lo que ya uso todos los días en TI, marketing y diseño',
    whatsappNumero: '51999999999',
    whatsappMensaje: 'Hola Profe, quiero más información sobre los cursos 👋',
    enVivo: false,
    enVivoTitulo: 'Clase en vivo ahora: Canva para negocios',
    enVivoPlataforma: 'TikTok Live',
    enVivoUrl: 'https://www.tiktok.com/@elprofecontreras/live',
    yapeNumero: '999 999 999',
    yapeTitular: 'José Contreras',
    plinNumero: '999 999 999',
    redes: {
      tiktok: 'https://www.tiktok.com/@elprofecontreras',
      instagram: 'https://www.instagram.com/elprofecontreras',
      facebook: 'https://www.facebook.com/elprofecontreras',
    },
  };

  // ---------- API pública del DataStore ----------
  return {
    // SLIDES DEL HERO
    getSlides() {
      let slides = read(KEYS.SLIDES, null);
      if (!slides) {
        slides = SLIDES_SEMILLA;
        write(KEYS.SLIDES, slides);
      }
      return slides;
    },

    getSlidesVisibles() {
      return this.getSlides().filter(s => s.visible).sort((a, b) => a.orden - b.orden);
    },

    guardarSlide(slide) {
      const slides = this.getSlides();
      if (slide.id) {
        const idx = slides.findIndex(s => s.id === slide.id);
        if (idx >= 0) slides[idx] = { ...slides[idx], ...slide };
        else slides.push(slide);
      } else {
        slide.id = uid('slide');
        slide.orden = slides.length + 1;
        slide.visible = slide.visible !== undefined ? slide.visible : true;
        slides.push(slide);
      }
      write(KEYS.SLIDES, slides);
      return slide;
    },

    eliminarSlide(id) {
      const slides = this.getSlides().filter(s => s.id !== id);
      write(KEYS.SLIDES, slides);
    },

    toggleVisibilidadSlide(id) {
      const slides = this.getSlides();
      const slide = slides.find(s => s.id === id);
      if (slide) {
        slide.visible = !slide.visible;
        write(KEYS.SLIDES, slides);
      }
      return slide;
    },

    // CURSOS
    getCursos() {
      let cursos = read(KEYS.CURSOS, null);
      if (!cursos) {
        cursos = CURSOS_SEMILLA;
        write(KEYS.CURSOS, cursos);
      }
      return cursos;
    },

    getCursosVisibles() {
      return this.getCursos()
        .filter(c => c.visible)
        .sort((a, b) => a.orden - b.orden);
    },

    getCursoPorId(id) {
      return this.getCursos().find(c => c.id === id) || null;
    },

    guardarCurso(curso) {
      const cursos = this.getCursos();
      if (curso.id) {
        const idx = cursos.findIndex(c => c.id === curso.id);
        if (idx >= 0) {
          cursos[idx] = { ...cursos[idx], ...curso };
        } else {
          cursos.push(curso);
        }
      } else {
        curso.id = uid('curso');
        curso.orden = cursos.length + 1;
        curso.alumnos = curso.alumnos || 0;
        curso.rating = curso.rating || 5.0;
        curso.visible = curso.visible !== undefined ? curso.visible : true;
        cursos.push(curso);
      }
      write(KEYS.CURSOS, cursos);
      return curso;
    },

    eliminarCurso(id) {
      const cursos = this.getCursos().filter(c => c.id !== id);
      write(KEYS.CURSOS, cursos);
    },

    toggleVisibilidadCurso(id) {
      const cursos = this.getCursos();
      const curso = cursos.find(c => c.id === id);
      if (curso) {
        curso.visible = !curso.visible;
        write(KEYS.CURSOS, cursos);
      }
      return curso;
    },

    reordenarCursos(idsEnOrden) {
      const cursos = this.getCursos();
      idsEnOrden.forEach((id, idx) => {
        const curso = cursos.find(c => c.id === id);
        if (curso) curso.orden = idx + 1;
      });
      write(KEYS.CURSOS, cursos);
    },

    // PLANES DE SUSCRIPCIÓN
    getPlanes() {
      let planes = read(KEYS.PLANES, null);
      if (!planes) {
        planes = PLANES_SEMILLA;
        write(KEYS.PLANES, planes);
      }
      return planes;
    },

    getPlanesVisibles() {
      return this.getPlanes().filter(p => p.visible);
    },

    guardarPlan(plan) {
      const planes = this.getPlanes();
      if (plan.id) {
        const idx = planes.findIndex(p => p.id === plan.id);
        if (idx >= 0) planes[idx] = { ...planes[idx], ...plan };
        else planes.push(plan);
      } else {
        plan.id = uid('plan');
        plan.visible = plan.visible !== undefined ? plan.visible : true;
        planes.push(plan);
      }
      write(KEYS.PLANES, planes);
      return plan;
    },

    eliminarPlan(id) {
      const planes = this.getPlanes().filter(p => p.id !== id);
      write(KEYS.PLANES, planes);
    },

    // CONFIGURACIÓN GENERAL DEL SITIO
    getConfig() {
      let config = read(KEYS.CONFIG, null);
      if (!config) {
        config = CONFIG_SEMILLA;
        write(KEYS.CONFIG, config);
      }
      // Asegura que config tenga todas las claves nuevas si se actualizó CONFIG_SEMILLA
      return { ...CONFIG_SEMILLA, ...config, redes: { ...CONFIG_SEMILLA.redes, ...(config.redes || {}) } };
    },

    guardarConfig(parcial) {
      const actual = this.getConfig();
      const nuevo = { ...actual, ...parcial };
      if (parcial.redes) nuevo.redes = { ...actual.redes, ...parcial.redes };
      write(KEYS.CONFIG, nuevo);
      return nuevo;
    },

    setEnVivo(activo, datos = {}) {
      return this.guardarConfig({ enVivo: activo, ...datos });
    },

    // SUSCRIPTORES AL BOLETÍN (newsletter)
    getSuscriptores() {
      return read(KEYS.SUSCRIPTORES, []);
    },

    agregarSuscriptor(email) {
      const suscriptores = this.getSuscriptores();
      const yaExiste = suscriptores.some(s => s.email.toLowerCase() === email.toLowerCase());
      if (yaExiste) return { ok: false, motivo: 'ya_existe' };
      suscriptores.push({ email, fecha: new Date().toISOString() });
      write(KEYS.SUSCRIPTORES, suscriptores);
      return { ok: true };
    },

    eliminarSuscriptor(email) {
      const suscriptores = this.getSuscriptores().filter(s => s.email !== email);
      write(KEYS.SUSCRIPTORES, suscriptores);
    },

    exportarSuscriptoresCSV() {
      const suscriptores = this.getSuscriptores();
      const filas = ['email,fecha'];
      suscriptores.forEach(s => filas.push(`${s.email},${s.fecha}`));
      return filas.join('\n');
    },

    // RESET (útil en desarrollo/pruebas)
    resetTodo() {
      localStorage.removeItem(KEYS.CURSOS);
      localStorage.removeItem(KEYS.CONFIG);
      localStorage.removeItem(KEYS.SUSCRIPTORES);
      localStorage.removeItem(KEYS.PLANES);
      localStorage.removeItem(KEYS.SLIDES);
    },
  };
})();
