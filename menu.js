/* --- FUNCIONALIDAD MENU CALCULADORAS --- */

// Variables globales para tabs y filtrados
let tabActual = 'todas';
let filtroCategoria = null;

document.addEventListener('DOMContentLoaded', () => {
  configurarMenuResponsivo();
  cargarCalculadorasDinamicas();
  configurarTabs();
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

      // Actualizar vista con el tab por defecto (Todas)
      actualizarVista();
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

/* --- TABS/PESTAÑAS --- */

function configurarTabs() {
  const botonesTab = document.querySelectorAll('.tab-btn');
  const btnCategorias = document.getElementById('btnCategorias');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const itemsDropdown = document.querySelectorAll('.dropdown-item');

  // Cerrar dropdown cuando clickeas fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-categorias')) {
      dropdownMenu.classList.remove('activo');
    }
  });

  // Toggle dropdown
  btnCategorias.addEventListener('click', () => {
    dropdownMenu.classList.toggle('activo');
  });

  // Tabs principales (Todas, Unidad I, Unidad II)
  botonesTab.forEach(btn => {
    if (btn.dataset.tab) {
      btn.addEventListener('click', () => {
        // Remover activo de todos
        document.querySelectorAll('.tab-btn[data-tab]').forEach(b => {
          b.classList.remove('tab-activo');
        });

        // Marcar clickeado como activo
        btn.classList.add('tab-activo');
        tabActual = btn.dataset.unidad || 'todas';
        filtroCategoria = null;

        // Cerrar dropdown
        dropdownMenu.classList.remove('activo');

        // Actualizar vista
        actualizarVista();
      });
    }
  });

  // Items del dropdown de categorías
  itemsDropdown.forEach(item => {
    item.addEventListener('click', () => {
      // Remover activo de todos los tabs
      document.querySelectorAll('.tab-btn[data-tab]').forEach(b => {
        b.classList.remove('tab-activo');
      });

      // Remover activo de todos los items
      itemsDropdown.forEach(i => i.classList.remove('activo'));

      // Marcar como activo
      item.classList.add('activo');
      filtroCategoria = item.dataset.filtro;
      tabActual = 'todas';

      // Cerrar dropdown
      dropdownMenu.classList.remove('activo');

      // Actualizar vista
      actualizarVista();
    });
  });
}

/* --- BÚSQUEDA Y FILTROS --- */

function configurarBusquedaYFiltros() {
  const inputBusqueda = document.getElementById('inputBusqueda');

  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', () => {
      actualizarVista();
    });
  }
}

function actualizarVista() {
  const inputBusqueda = document.getElementById('inputBusqueda');
  const textoBusqueda = (inputBusqueda?.value || '').toLowerCase();
  const bloques = document.querySelectorAll('.bloque-unidad');
  const tarjetas = document.querySelectorAll('.tarjeta');

  let visiblesTotal = 0;

  // Mostrar/ocultar bloques según tab activo
  bloques.forEach(bloque => {
    const bloqueUnidad = Object.keys(window.datosCalculadoras || {}).find(key =>
      window.datosCalculadoras[key].items.some(item =>
        bloque.querySelector('.tarjeta')?.dataset?.categoria === item.categoria
      )
    );

    if (tabActual === 'todas' || bloqueUnidad === tabActual) {
      bloque.classList.add('unidad-activa');
    } else {
      bloque.classList.remove('unidad-activa');
    }
  });

  // Filtrar tarjetas
  tarjetas.forEach(tarjeta => {
    const nombre = tarjeta.querySelector('h3')?.textContent.toLowerCase() || '';
    const descripcion = tarjeta.querySelector('p')?.textContent.toLowerCase() || '';
    const categoria = tarjeta.dataset.categoria || '';
    const bloqueUnidad = tarjeta.closest('.bloque-unidad');

    // Validar búsqueda
    const coincideBusqueda = nombre.includes(textoBusqueda) || descripcion.includes(textoBusqueda);

    // Validar tab
    const coincideTab = tabActual === 'todas' || bloqueUnidad?.classList.contains('unidad-activa');

    // Validar categoría
    const coincideCategoria = !filtroCategoria || categoria === filtroCategoria;

    if (coincideBusqueda && coincideTab && coincideCategoria) {
      tarjeta.style.display = '';
      tarjeta.style.animation = 'tarjetaEntrada 0.3s ease-out';
      visiblesTotal++;
    } else {
      tarjeta.style.display = 'none';
    }
  });

  // Mostrar/ocultar mensaje vacío
  const contenedor = document.getElementById('contenedorCalculadoras');
  let mensajeVacio = contenedor.querySelector('.mensaje-vacio');

  if (visiblesTotal === 0) {
    if (!mensajeVacio) {
      mensajeVacio = document.createElement('div');
      mensajeVacio.className = 'mensaje-vacio';
      mensajeVacio.innerHTML = `
        <h3>No se encontraron resultados</h3>
        <p>Intenta con otra búsqueda, tab o filtro diferente</p>
      `;
      contenedor.appendChild(mensajeVacio);
    }
  } else if (mensajeVacio) {
    mensajeVacio.remove();
  }
}
