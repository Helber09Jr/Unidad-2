/* === ANIMACIONES Y FUNCIONALIDAD HOME === */

/**
 * Duplicar tarjetas del carrusel para crear efecto infinito
 */
function duplicarTarjetasCarrusel() {
  const carruselAutores = document.querySelector('.carrusel-autores');
  if (!carruselAutores) return;

  const tarjetasOriginales = Array.from(carruselAutores.querySelectorAll('.tarjeta-autor'));

  // Duplicar las tarjetas al final para crear el efecto infinito
  tarjetasOriginales.forEach(tarjeta => {
    const clon = tarjeta.cloneNode(true);
    carruselAutores.appendChild(clon);
  });
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
  const tarjetas = document.querySelectorAll('.tarjeta-caracteristica, .paso-proceso, .tarjeta-caso');

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
    duplicarTarjetasCarrusel();
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
  }, 300);
});
