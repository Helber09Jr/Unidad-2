/* === ANIMACIONES Y FUNCIONALIDAD HOME === */

// Variables globales para el carrusel
let posicionCarrusel = 0;
const tarjetasAutor = document.querySelectorAll('.tarjeta-autor');
const carruselAutores = document.querySelector('.carrusel-autores');
let intervaloCarrusel;

// Ancho de cada tarjeta
const ANCHO_TARJETA = 240 + 30; // 240px de tarjeta + 30px de gap

/**
 * Inicializar funcionalidad del carrusel
 */
function inicializarCarrusel() {
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const indicadoresContainer = document.getElementById('indicadoresCarrusel');

  // Crear indicadores
  tarjetasAutor.forEach((_, index) => {
    const indicador = document.createElement('div');
    indicador.className = 'indicador';
    if (index === 0) indicador.classList.add('activo');
    indicador.addEventListener('click', () => irAAutor(index));
    indicadoresContainer.appendChild(indicador);
  });

  // Event listeners para botones
  btnPrev.addEventListener('click', () => {
    rotarCarrusel(-1);
    resetearIntervaloCarrusel();
  });

  btnNext.addEventListener('click', () => {
    rotarCarrusel(1);
    resetearIntervaloCarrusel();
  });

  // Iniciar auto-rotación
  iniciarAutoCarrusel();

  // Pausa en hover
  carruselAutores.addEventListener('mouseenter', () => {
    clearInterval(intervaloCarrusel);
  });

  carruselAutores.addEventListener('mouseleave', () => {
    iniciarAutoCarrusel();
  });
}

/**
 * Rotar carrusel hacia adelante o atrás
 * @param {number} direccion - 1 para adelante, -1 para atrás
 */
function rotarCarrusel(direccion) {
  posicionCarrusel += direccion;

  // Circular: si llega al final, vuelve al inicio
  if (posicionCarrusel >= tarjetasAutor.length) {
    posicionCarrusel = 0;
  } else if (posicionCarrusel < 0) {
    posicionCarrusel = tarjetasAutor.length - 1;
  }

  actualizarPosicionCarrusel();
}

/**
 * Ir a un autor específico
 * @param {number} index - Índice del autor
 */
function irAAutor(index) {
  posicionCarrusel = index;
  actualizarPosicionCarrusel();
  resetearIntervaloCarrusel();
}

/**
 * Actualizar posición visual del carrusel
 */
function actualizarPosicionCarrusel() {
  const offset = -posicionCarrusel * ANCHO_TARJETA;
  carruselAutores.style.transform = `translateX(${offset}px)`;

  // Actualizar indicadores
  const indicadores = document.querySelectorAll('.indicador');
  indicadores.forEach((ind, index) => {
    if (index === posicionCarrusel) {
      ind.classList.add('activo');
    } else {
      ind.classList.remove('activo');
    }
  });
}

/**
 * Iniciar auto-rotación del carrusel (cada 6 segundos)
 */
function iniciarAutoCarrusel() {
  intervaloCarrusel = setInterval(() => {
    rotarCarrusel(1);
  }, 6000);
}

/**
 * Resetear el intervalo del carrusel automático
 */
function resetearIntervaloCarrusel() {
  clearInterval(intervaloCarrusel);
  iniciarAutoCarrusel();
}

/**
 * Animar números contadores cuando se hacen visibles
 */
function inicializarContadoresNumeros() {
  const numerosAnimados = document.querySelectorAll('.numero-animado');

  const observador = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.animado) {
        entry.target.dataset.animado = 'true';
        const valorFinal = parseInt(entry.target.dataset.valor);
        animarNumero(entry.target, valorFinal);
      }
    });
  }, { threshold: 0.5 });

  numerosAnimados.forEach((numero) => {
    observador.observe(numero);
  });
}

/**
 * Animar un número contador de 0 a un valor final
 * @param {HTMLElement} elemento - El elemento a animar
 * @param {number} valorFinal - Valor final del contador
 */
function animarNumero(elemento, valorFinal) {
  const duracion = 2000; // 2 segundos
  const inicioTiempo = Date.now();

  function actualizar() {
    const tiempoTranscurrido = Date.now() - inicioTiempo;
    const progreso = Math.min(tiempoTranscurrido / duracion, 1);

    // Easing cuadrático
    const valorActual = Math.floor(progreso * valorFinal);
    elemento.textContent = valorActual;

    if (progreso < 1) {
      requestAnimationFrame(actualizar);
    } else {
      elemento.textContent = valorFinal;
    }
  }

  actualizar();
}

/**
 * Inicializar scroll animations para secciones
 */
function inicializarScrollAnimations() {
  const secciones = document.querySelectorAll('section');

  const observador = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeIn 0.6s ease-out';
        observador.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  secciones.forEach((seccion) => {
    observador.observe(seccion);
  });
}

/**
 * Inicializar smooth scroll para enlaces internos
 */
function inicializarSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
    enlace.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const elemento = document.querySelector(href);
      if (elemento) {
        elemento.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Ajustar parallax effect en desktop
 */
function inicializarParallax() {
  const portadaBackground = document.querySelector('.portada-background');

  if (window.matchMedia('(max-width: 768px)').matches) {
    // En móvil, desactivar parallax
    if (portadaBackground) {
      portadaBackground.style.backgroundAttachment = 'scroll';
    }
  } else {
    // En desktop, aplicar parallax
    if (portadaBackground) {
      portadaBackground.style.backgroundAttachment = 'fixed';
    }
  }

  window.addEventListener('resize', () => {
    if (window.matchMedia('(max-width: 768px)').matches) {
      if (portadaBackground) {
        portadaBackground.style.backgroundAttachment = 'scroll';
      }
    } else {
      if (portadaBackground) {
        portadaBackground.style.backgroundAttachment = 'fixed';
      }
    }
  });
}

/**
 * Animar elementos al pasar el mouse
 */
function inicializarHoverAnimations() {
  const tarjetas = document.querySelectorAll('.tarjeta-estadistica, .tarjeta-caracteristica, .paso-proceso, .tarjeta-caso');

  tarjetas.forEach((tarjeta) => {
    tarjeta.addEventListener('mouseenter', function () {
      this.style.transition = 'all 0.3s ease';
    });
  });
}

/**
 * Inicializar todo cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
  // Esperar un pequeño delay para asegurar que el DOM esté completamente renderizado
  setTimeout(() => {
    inicializarCarrusel();
    inicializarContadoresNumeros();
    inicializarScrollAnimations();
    inicializarSmoothScroll();
    inicializarParallax();
    inicializarHoverAnimations();
  }, 100);
});

/**
 * Manejar cambios de orientación en dispositivos móviles
 */
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    inicializarParallax();
    actualizarPosicionCarrusel();
  }, 300);
});
