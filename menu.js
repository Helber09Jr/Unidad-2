/* --- FUNCIONALIDAD MENU CALCULADORAS --- */

// Variable global para filtrado
let calculadorasActuales = [];
let filtroActual = 'todas';

document.addEventListener('DOMContentLoaded', () => {
  configurarMenuResponsivo();
  cargarCalculadorasDinamicas();
  configurarBusquedaYFiltros();
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

/* --- CARGAR CALCULADORAS --- */

function cargarCalculadorasDinamicas() {
  const contenedor = document.getElementById('contenedorCalculadoras');

  fetch('data/calculadoras.json')
    .then(respuesta => {
      if (!respuesta.ok) {
        throw new Error('Error al cargar el archivo de calculadoras');
      }
      return respuesta.json();
    })
    .then(datos => {
      contenedor.innerHTML = '';
      renderizarCalculadoras(datos, contenedor);
      configurarAcordeon();
      
      // Abrir automáticamente la primera unidad
      const primerBloque = contenedor.querySelector('.bloque-unidad');
      if (primerBloque) {
        primerBloque.classList.add('unidad-activa');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      contenedor.innerHTML = `
        <div class="mensaje-error">
          <h3>Error al cargar las calculadoras</h3>
          <p>No se pudieron cargar los datos. Por favor, intenta recargar la página.</p>
        </div>
      `;
    });
}

/* --- RENDERIZAR CALCULADORAS --- */

function renderizarCalculadoras(datos, contenedor) {
  // Guardar datos globalmente para búsqueda
  window.datosCalculadoras = datos;

  Object.keys(datos).forEach(claveUnidad => {
    const unidad = datos[claveUnidad];

    // Solo renderizar unidades que tengan items
    if (unidad.items && unidad.items.length > 0) {
      const bloqueUnidad = crearBloqueUnidad(unidad);
      contenedor.appendChild(bloqueUnidad);
    }
  });
}

/* --- CREAR BLOQUE UNIDAD --- */

function crearBloqueUnidad(unidad) {
  const seccion = document.createElement('section');
  seccion.classList.add('bloque-unidad');

  const titulo = document.createElement('h2');
  titulo.classList.add('titulo-unidad');
  titulo.textContent = unidad.titulo;
  seccion.appendChild(titulo);

  const contenedorTarjetas = document.createElement('div');
  contenedorTarjetas.classList.add('contenedor-tarjetas');

  unidad.items.forEach(item => {
    const tarjeta = crearTarjetaCalculadora(item);
    contenedorTarjetas.appendChild(tarjeta);
  });

  seccion.appendChild(contenedorTarjetas);
  return seccion;
}

/* --- CREAR TARJETA CALCULADORA --- */

function crearTarjetaCalculadora(item) {
  const enlace = document.createElement('a');
  enlace.classList.add('tarjeta');
  enlace.dataset.categoria = item.categoria || '';

  // Si está en desarrollo, deshabilitar el enlace y agregar badge
  if (item.estado === 'desarrollo') {
    enlace.href = '#';
    enlace.style.opacity = '0.6';
    enlace.style.cursor = 'not-allowed';
    enlace.addEventListener('click', (e) => {
      e.preventDefault();
    });
  } else {
    enlace.href = item.link;
  }

  const imagenContenedor = document.createElement('div');
  imagenContenedor.classList.add('imagen-tarjeta');

  // Número de práctica
  if (item.numero) {
    const numeroPractica = document.createElement('div');
    numeroPractica.classList.add('numero-practica');
    numeroPractica.textContent = String(item.numero).padStart(2, '0');
    imagenContenedor.appendChild(numeroPractica);
  }

  const imagen = document.createElement('img');
  imagen.src = item.imagen;
  imagen.alt = item.nombre;
  imagen.loading = 'lazy';

  // Manejo de error si la imagen no existe
  imagen.onerror = function() {
    this.style.display = 'none';
    imagenContenedor.innerHTML += '<div style="font-size: 4em; color: #ccc;">📊</div>';
  };

  imagenContenedor.appendChild(imagen);

  // Badge de estado
  if (item.estado === 'desarrollo') {
    const badge = document.createElement('span');
    badge.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #f59e0b;
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.75em;
      font-weight: 700;
      text-transform: uppercase;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    badge.textContent = 'En desarrollo';
    imagenContenedor.style.position = 'relative';
    imagenContenedor.appendChild(badge);
  } else if (item.estado === 'nuevo') {
    const badge = document.createElement('span');
    badge.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #10b981;
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.75em;
      font-weight: 700;
      text-transform: uppercase;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    badge.textContent = 'Nuevo';
    imagenContenedor.style.position = 'relative';
    imagenContenedor.appendChild(badge);
  }

  const contenido = document.createElement('div');
  contenido.classList.add('contenido-tarjeta');

  const nombre = document.createElement('h3');
  nombre.textContent = item.nombre;

  const descripcion = document.createElement('p');
  descripcion.textContent = item.descripcion;

  contenido.appendChild(nombre);
  contenido.appendChild(descripcion);

  enlace.appendChild(imagenContenedor);
  enlace.appendChild(contenido);

  return enlace;
}

/* --- ACORDEON --- */

function configurarAcordeon() {
  const titulosUnidad = document.querySelectorAll('.titulo-unidad');

  titulosUnidad.forEach(titulo => {
    titulo.addEventListener('click', () => {
      const bloque = titulo.parentElement;

      // Opcional: cerrar otros bloques al abrir uno
      // const todosLosBloques = document.querySelectorAll('.bloque-unidad');
      // todosLosBloques.forEach(b => {
      //   if (b !== bloque) b.classList.remove('unidad-activa');
      // });

      bloque.classList.toggle('unidad-activa');
    });
  });
}

/* --- BÚSQUEDA Y FILTROS --- */

function configurarBusquedaYFiltros() {
  const inputBusqueda = document.getElementById('inputBusqueda');
  const botonesFiltro = document.querySelectorAll('.filtro-btn');

  // Guardar todas las calculadoras
  Object.keys(window.datosCalculadoras || {}).forEach(unidad => {
    if (window.datosCalculadoras[unidad].items) {
      calculadorasActuales.push(...window.datosCalculadoras[unidad].items);
    }
  });

  // Búsqueda
  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', (e) => {
      filtrarCalculadoras();
    });
  }

  // Filtros
  botonesFiltro.forEach(btn => {
    btn.addEventListener('click', () => {
      botonesFiltro.forEach(b => b.classList.remove('filtro-activo'));
      btn.classList.add('filtro-activo');
      filtroActual = btn.dataset.filtro;
      filtrarCalculadoras();
    });
  });
}

function filtrarCalculadoras() {
  const inputBusqueda = document.getElementById('inputBusqueda');
  const textoBusqueda = (inputBusqueda?.value || '').toLowerCase();
  const tarjetas = document.querySelectorAll('.tarjeta');

  let visibles = 0;

  tarjetas.forEach(tarjeta => {
    const nombre = tarjeta.querySelector('h3')?.textContent.toLowerCase() || '';
    const descripcion = tarjeta.querySelector('p')?.textContent.toLowerCase() || '';
    const categoria = tarjeta.dataset.categoria || '';

    // Coincidir búsqueda
    const coincideBusqueda = nombre.includes(textoBusqueda) || descripcion.includes(textoBusqueda);

    // Coincidir filtro
    const coincideFiltro = filtroActual === 'todas' || categoria === filtroActual;

    if (coincideBusqueda && coincideFiltro) {
      tarjeta.style.display = '';
      tarjeta.style.animation = 'tarjetaEntrada 0.3s ease-out';
      visibles++;
    } else {
      tarjeta.style.display = 'none';
    }
  });

  // Mostrar mensaje si no hay resultados
  const contenedor = document.getElementById('contenedorCalculadoras');
  let mensajeVacio = contenedor.querySelector('.mensaje-vacio');

  if (visibles === 0) {
    if (!mensajeVacio) {
      mensajeVacio = document.createElement('div');
      mensajeVacio.className = 'mensaje-vacio';
      mensajeVacio.innerHTML = `
        <h3>No se encontraron resultados</h3>
        <p>Intenta con otra búsqueda o filtro diferente</p>
      `;
      contenedor.appendChild(mensajeVacio);
    }
  } else if (mensajeVacio) {
    mensajeVacio.remove();
  }
}
