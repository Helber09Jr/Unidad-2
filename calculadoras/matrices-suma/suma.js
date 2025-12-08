/* --- SUMA DE MATRICES --- */

const App = {
  estado: {
    matrizA: [],
    matrizB: [],
    resultado: null,
    tamaño: '2x2'
  },

  async iniciar() {
    this.configurarTamaño();
    this.vincularEventos();
    this.generarInputs();
  },

  vincularEventos() {
    document.getElementById('tamañoMatrices').addEventListener('change', (e) => {
      this.estado.tamaño = e.target.value;
      this.generarInputs();
    });

    document.getElementById('btnCalcular').addEventListener('click', () => {
      this.calcular();
    });

    document.getElementById('btnEjemplo').addEventListener('click', () => {
      this.cargarEjemplo();
    });

    document.getElementById('btnLimpiar').addEventListener('click', () => {
      this.limpiar();
    });

    document.getElementById('btnAlternarPasos').addEventListener('click', () => {
      this.alternarPasos();
    });
  },

  configurarTamaño() {
    const select = document.getElementById('tamañoMatrices');
    const stored = localStorage.getItem('tamañoMatricesSuma');
    if (stored && Array.from(select.options).some(opt => opt.value === stored)) {
      select.value = stored;
      this.estado.tamaño = stored;
    }
  },

  generarInputs() {
    const [filas, columnas] = this.estado.tamaño.split('x').map(Number);
    
    localStorage.setItem('tamañoMatricesSuma', this.estado.tamaño);

    this.crearInputsMatriz('inputsMatrizA', 'A', filas, columnas);
    this.crearInputsMatriz('inputsMatrizB', 'B', filas, columnas);

    this.estado.matrizA = Array(filas).fill(null).map(() => Array(columnas).fill(0));
    this.estado.matrizB = Array(filas).fill(null).map(() => Array(columnas).fill(0));

    document.getElementById('contenedorResultado').classList.add('oculto');
    document.getElementById('contenedorDesarrollo').classList.add('oculto');
  },

  crearInputsMatriz(contenedorId, nombreMatriz, filas, columnas) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = '';
    contenedor.style.gridTemplateColumns = 'repeat(' + columnas + ', 1fr)';

    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        input.placeholder = nombreMatriz + '[' + i + '][' + j + ']';
        input.dataset.fila = i;
        input.dataset.columna = j;
        input.dataset.matriz = nombreMatriz.toLowerCase();
        contenedor.appendChild(input);
      }
    }
  },

  validar() {
    const inputs = document.querySelectorAll('#inputsMatrizA input, #inputsMatrizB input');
    
    for (let input of inputs) {
      if (input.value === '' || isNaN(parseFloat(input.value))) {
        return false;
      }
    }
    return true;
  },

  leerMatrices() {
    const [filas, columnas] = this.estado.tamaño.split('x').map(Number);
    this.estado.matrizA = Array(filas).fill(null).map(() => Array(columnas).fill(0));
    this.estado.matrizB = Array(filas).fill(null).map(() => Array(columnas).fill(0));

    const inputs = document.querySelectorAll('#inputsMatrizA input');
    inputs.forEach(input => {
      const i = parseInt(input.dataset.fila);
      const j = parseInt(input.dataset.columna);
      this.estado.matrizA[i][j] = parseFloat(input.value) || 0;
    });

    const inputsB = document.querySelectorAll('#inputsMatrizB input');
    inputsB.forEach(input => {
      const i = parseInt(input.dataset.fila);
      const j = parseInt(input.dataset.columna);
      this.estado.matrizB[i][j] = parseFloat(input.value) || 0;
    });
  },

  calcular() {
    try {
      if (!this.validar()) {
        Notificaciones.error('Por favor completa todas las matrices con valores numéricos');
        return;
      }

      Notificaciones.calcular('Calculando suma de matrices...');

      this.leerMatrices();
      
      const [filas, columnas] = this.estado.tamaño.split('x').map(Number);
      this.estado.resultado = Array(filas).fill(null).map(() => Array(columnas).fill(0));

      for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
          this.estado.resultado[i][j] = this.estado.matrizA[i][j] + this.estado.matrizB[i][j];
        }
      }

      this.mostrarResultado();
      Notificaciones.exito('Suma calculada correctamente');
    } catch (error) {
      Notificaciones.error('Error al calcular la suma: ' + error.message);
      console.error(error);
    }
  },

  mostrarResultado() {
    const contenedor = document.getElementById('contenedorResultado');
    const resultadoDiv = document.getElementById('resultadoSuma');

    resultadoDiv.innerHTML = this.generarTablaMatriz(this.estado.resultado, 'C');
    contenedor.classList.remove('oculto');
    document.getElementById('contenedorDesarrollo').classList.add('oculto');
  },

  generarTablaMatriz(matriz, nombre) {
    let html = '<div class="matriz-contenedor"><h4>Matriz ' + nombre + ':</h4><table class="tabla-matriz"><tbody>';

    matriz.forEach(fila => {
      html += '<tr>';
      fila.forEach(valor => {
        html += '<td>' + valor.toFixed(4).replace(/\.?0+$/, '') + '</td>';
      });
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
  },

  alternarPasos() {
    const desarrollo = document.getElementById('contenedorDesarrollo');
    if (desarrollo.classList.contains('oculto')) {
      this.mostrarDesarrollo();
      desarrollo.classList.remove('oculto');
    } else {
      desarrollo.classList.add('oculto');
    }
  },

  mostrarDesarrollo() {
    const contenedor = document.getElementById('pasosPasos');
    const [filas, columnas] = this.estado.tamaño.split('x').map(Number);
    
    let html = '<div class="desarrollo-math"><p><strong>Operación: C = A + B</strong></p>';
    html += '<p>Se suma elemento a elemento:</p>';
    html += '<p><strong>C[i][j] = A[i][j] + B[i][j]</strong></p><br>';
    html += '<p><strong>Matrices de entrada:</strong></p>';
    
    html += '<div class="matrices-fila">';
    html += this.generarTablaMatriz(this.estado.matrizA, 'A');
    html += this.generarTablaMatriz(this.estado.matrizB, 'B');
    html += '</div>';

    html += '<p><strong>Cálculos elemento a elemento:</strong></p>';
    html += '<table class="tabla-pasos"><tr><th>Posición</th><th>Operación</th><th>Resultado</th></tr>';

    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        const operacion = this.estado.matrizA[i][j] + ' + ' + this.estado.matrizB[i][j];
        const resultado = this.estado.resultado[i][j];
        html += '<tr><td>[' + i + '][' + j + ']</td><td>' + operacion + '</td><td>' + resultado.toFixed(4).replace(/\.?0+$/, '') + '</td></tr>';
      }
    }

    html += '</table><br><p><strong>Matriz Resultado C:</strong></p>';
    html += this.generarTablaMatriz(this.estado.resultado, 'C');
    html += '</div>';

    contenedor.innerHTML = html;
    MathJax.typesetPromise().catch(err => console.log(err));
  },

  cargarEjemplo() {
    try {
      const ejemplos = {
        '2x2': {
          A: [[2, 3], [4, 5]],
          B: [[1, 2], [3, 4]]
        },
        '3x3': {
          A: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
          B: [[9, 8, 7], [6, 5, 4], [3, 2, 1]]
        },
        '2x3': {
          A: [[1, 2, 3], [4, 5, 6]],
          B: [[6, 5, 4], [3, 2, 1]]
        },
        '3x2': {
          A: [[1, 2], [3, 4], [5, 6]],
          B: [[2, 1], [4, 3], [6, 5]]
        },
        '4x4': {
          A: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]],
          B: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]
        }
      };

      const ejemplo = ejemplos[this.estado.tamaño];
      
      // Llenar matriz A
      document.querySelectorAll('#inputsMatrizA input').forEach((input) => {
        const fila = parseInt(input.dataset.fila);
        const columna = parseInt(input.dataset.columna);
        input.value = ejemplo.A[fila][columna];
      });

      // Llenar matriz B
      document.querySelectorAll('#inputsMatrizB input').forEach((input) => {
        const fila = parseInt(input.dataset.fila);
        const columna = parseInt(input.dataset.columna);
        input.value = ejemplo.B[fila][columna];
      });

      Notificaciones.exito('Ejemplo cargado correctamente');
    } catch (error) {
      Notificaciones.error('Error al cargar el ejemplo: ' + error.message);
    }
  },

  limpiar() {
    document.querySelectorAll('#inputsMatrizA input, #inputsMatrizB input').forEach(input => {
      input.value = '';
    });
    document.getElementById('contenedorResultado').classList.add('oculto');
    document.getElementById('contenedorDesarrollo').classList.add('oculto');
    Notificaciones.info('Campos limpiados');
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  App.iniciar();
});
