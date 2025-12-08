const App = {
  estado: {
    matrizA: [],
    matrizB: [],
    resultado: null,
    tamanio: '2x2',
    pasos: []
  },

  iniciar() {
    this.renderizarInputs();
    this.vincularEventos();
  },

  vincularEventos() {
    document.getElementById('tamanioMatrices').addEventListener('change', (e) => {
      this.estado.tamanio = e.target.value;
      this.renderizarInputs();
    });
    document.getElementById('btnCalcular').addEventListener('click', () => this.calcular());
    document.getElementById('btnEjemplo').addEventListener('click', () => this.cargarEjemplo());
    document.getElementById('btnLimpiar').addEventListener('click', () => this.limpiar());
    document.getElementById('btnTogglePasos').addEventListener('click', () => this.alternarPasos());
    document.getElementById('botonMenu').addEventListener('click', () => this.alternarMenu());
  },

  renderizarInputs() {
    const [filas, columnas] = this.estado.tamanio.split('x').map(Number);
    
    this.crearGridMatriz('inputsMatrizA', filas, columnas, 'A');
    this.crearGridMatriz('inputsMatrizB', filas, columnas, 'B');

    this.estado.matrizA = Array(filas).fill(null).map(() => Array(columnas).fill(0));
    this.estado.matrizB = Array(filas).fill(null).map(() => Array(columnas).fill(0));

    document.getElementById('tarjetaResultado').classList.add('oculto');
    document.getElementById('seccionDesarrollo').classList.add('oculto');
  },

  crearGridMatriz(contenedorId, filas, columnas, nombreMatriz) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = '';
    contenedor.style.gridTemplateColumns = 'repeat(' + columnas + ', 1fr)';

    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        input.className = 'input-matriz';
        input.placeholder = nombreMatriz + '[' + i + '][' + j + ']';
        input.dataset.fila = i;
        input.dataset.columna = j;
        input.dataset.matriz = nombreMatriz;
        input.addEventListener('change', () => this.leerMatrices());
        contenedor.appendChild(input);
      }
    }
  },

  leerMatrices() {
    const [filas, columnas] = this.estado.tamanio.split('x').map(Number);
    this.estado.matrizA = Array(filas).fill(null).map(() => Array(columnas).fill(0));
    this.estado.matrizB = Array(filas).fill(null).map(() => Array(columnas).fill(0));

    document.querySelectorAll('#inputsMatrizA input').forEach(input => {
      const i = parseInt(input.dataset.fila);
      const j = parseInt(input.dataset.columna);
      this.estado.matrizA[i][j] = parseFloat(input.value) || 0;
    });

    document.querySelectorAll('#inputsMatrizB input').forEach(input => {
      const i = parseInt(input.dataset.fila);
      const j = parseInt(input.dataset.columna);
      this.estado.matrizB[i][j] = parseFloat(input.value) || 0;
    });
  },

  validar() {
    for (let i = 0; i < this.estado.matrizA.length; i++) {
      for (let j = 0; j < this.estado.matrizA[i].length; j++) {
        if (isNaN(this.estado.matrizA[i][j]) || isNaN(this.estado.matrizB[i][j])) {
          return false;
        }
      }
    }
    return true;
  },

  calcular() {
    try {
      this.leerMatrices();

      if (!this.validar()) {
        Notificaciones.error('Por favor completa todas las matrices con valores numéricos');
        return;
      }

      Notificaciones.calcular('Calculando suma de matrices...');

      const [filas, columnas] = this.estado.tamanio.split('x').map(Number);
      this.estado.resultado = Array(filas).fill(null).map(() => Array(columnas).fill(0));
      this.estado.pasos = [];

      // Realizar suma
      for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
          this.estado.resultado[i][j] = this.estado.matrizA[i][j] + this.estado.matrizB[i][j];
          this.estado.pasos.push({
            posicion: '[' + i + '][' + j + ']',
            operacion: this.estado.matrizA[i][j] + ' + ' + this.estado.matrizB[i][j],
            resultado: this.estado.resultado[i][j]
          });
        }
      }

      this.mostrarResultado();
      Notificaciones.exito('Suma calculada correctamente');
    } catch (error) {
      Notificaciones.error('Error: ' + error.message);
      console.error(error);
    }
  },

  mostrarResultado() {
    const contenedor = document.getElementById('contenedorResultado');
    
    let html = '<div class="contenedor-matrices-resultado">';
    html += this.generarTablaMatrizFormato(this.estado.matrizA, 'A');
    html += '<div class="operador">+</div>';
    html += this.generarTablaMatrizFormato(this.estado.matrizB, 'B');
    html += '<div class="operador">=</div>';
    html += this.generarTablaMatrizFormato(this.estado.resultado, 'C');
    html += '</div>';

    contenedor.innerHTML = html;

    document.getElementById('tarjetaResultado').classList.remove('oculto');
    document.getElementById('seccionDesarrollo').classList.add('oculto');
  },

  generarTablaMatrizFormato(matriz, nombre) {
    let html = '<div class="matriz-contenedor"><h4>Matriz ' + nombre + '</h4><table class="tabla-matriz-resultado"><tbody>';
    matriz.forEach(fila => {
      html += '<tr>';
      fila.forEach(valor => {
        html += '<td>' + valor.toFixed(2).replace(/\.?0+$/, '') + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  },

  alternarPasos() {
    const desarrollo = document.getElementById('seccionDesarrollo');
    if (desarrollo.classList.contains('oculto')) {
      this.mostrarDesarrollo();
      desarrollo.classList.remove('oculto');
    } else {
      desarrollo.classList.add('oculto');
    }
  },

  mostrarDesarrollo() {
    const contenedor = document.getElementById('contenedorDesarrollo');
    
    let html = '<div class="desarrollo-completo">';
    html += '<p><strong>Operación:</strong> C = A + B</p>';
    html += '<p><strong>Fórmula:</strong> C[i][j] = A[i][j] + B[i][j]</p><br>';
    html += '<table class="tabla-desarrollo"><thead><tr><th>Posición</th><th>Operación</th><th>Resultado</th></tr></thead><tbody>';

    this.estado.pasos.forEach(paso => {
      html += '<tr><td>' + paso.posicion + '</td>';
      html += '<td>' + paso.operacion + '</td>';
      html += '<td class="resultado-paso">' + paso.resultado.toFixed(2).replace(/\.?0+$/, '') + '</td></tr>';
    });

    html += '</tbody></table>';
    html += '</div>';

    contenedor.innerHTML = html;
    MathJax.typesetPromise().catch(err => console.log(err));
  },

  cargarEjemplo() {
    const ejemplos = {
      '2x2': { A: [[2, 3], [4, 5]], B: [[1, 2], [3, 4]] },
      '3x3': { A: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], B: [[9, 8, 7], [6, 5, 4], [3, 2, 1]] },
      '2x3': { A: [[1, 2, 3], [4, 5, 6]], B: [[6, 5, 4], [3, 2, 1]] },
      '3x2': { A: [[1, 2], [3, 4], [5, 6]], B: [[2, 1], [4, 3], [6, 5]] },
      '4x4': { A: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], B: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]] }
    };

    try {
      const ejemplo = ejemplos[this.estado.tamanio];
      
      document.querySelectorAll('#inputsMatrizA input').forEach((input) => {
        const i = parseInt(input.dataset.fila);
        const j = parseInt(input.dataset.columna);
        input.value = ejemplo.A[i][j];
      });

      document.querySelectorAll('#inputsMatrizB input').forEach((input) => {
        const i = parseInt(input.dataset.fila);
        const j = parseInt(input.dataset.columna);
        input.value = ejemplo.B[i][j];
      });

      Notificaciones.exito('Ejemplo cargado correctamente');
      this.leerMatrices();
    } catch (error) {
      Notificaciones.error('Error al cargar el ejemplo');
    }
  },

  limpiar() {
    if (confirm('¿Estás seguro de limpiar todos los datos?')) {
      document.querySelectorAll('.input-matriz').forEach(input => {
        input.value = '';
      });
      this.estado.matrizA = [];
      this.estado.matrizB = [];
      this.estado.resultado = null;
      document.getElementById('tarjetaResultado').classList.add('oculto');
      document.getElementById('seccionDesarrollo').classList.add('oculto');
      Notificaciones.info('Datos limpiados');
    }
  },

  alternarMenu() {
    const menu = document.getElementById('menuNavegacion');
    menu.classList.toggle('activo');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.iniciar();
});
