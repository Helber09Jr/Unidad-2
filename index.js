/* --- FUNCIONALIDAD HOME --- */

document.addEventListener('DOMContentLoaded', () => {
  configurarMenuResponsivo();
  configurarDesplazamientoSuave();
  configurarEnlacesActivos();
});

/* --- MENU RESPONSIVO --- */

function configurarMenuResponsivo() {
  const botonMenu = document.getElementById('botonMenu');
  const menuNavegacion = document.getElementById('menuNavegacion');

  if (!botonMenu || !menuNavegacion) return;

  botonMenu.addEventListener('click', () => {
    menuNavegacion.classList.toggle('menu-activo');
  });

  const enlacesMenu = document.querySelectorAll('.menu-navegacion a');
  enlacesMenu.forEach(enlace => {
    enlace.addEventListener('click', () => {
      menuNavegacion.classList.remove('menu-activo');
    });
  });
}

/* --- DESPLAZAMIENTO SUAVE --- */

function configurarDesplazamientoSuave() {
  const enlacesInternos = document.querySelectorAll('a[href^="#"]');
  
  enlacesInternos.forEach(enlace => {
    enlace.addEventListener('click', (evento) => {
      const href = enlace.getAttribute('href');
      
      if (href === '#') return;
      
      const destino = document.querySelector(href);
      
      if (destino) {
        evento.preventDefault();
        destino.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/* --- ENLACES ACTIVOS --- */

function configurarEnlacesActivos() {
  const secciones = document.querySelectorAll('section[id]');
  const enlacesMenu = document.querySelectorAll('.menu-navegacion a[href^="#"]');

  if (secciones.length === 0 || enlacesMenu.length === 0) return;

  window.addEventListener('scroll', () => {
    const scrollActual = window.pageYOffset;

    secciones.forEach(seccion => {
      const alturaSeccion = seccion.offsetHeight;
      const posicionSeccion = seccion.offsetTop - 100;
      const idSeccion = seccion.getAttribute('id');

      if (scrollActual > posicionSeccion && scrollActual <= posicionSeccion + alturaSeccion) {
        enlacesMenu.forEach(enlace => {
          enlace.classList.remove('enlace-activo');
          if (enlace.getAttribute('href') === `#${idSeccion}`) {
            enlace.classList.add('enlace-activo');
          }
        });
      }
    });
  });
}
