/* --- MULTIPLICACIÓN DE MATRICES --- */

const App = {
  estado: {
    matrizA: [],
    matrizB: [],
    resultado: null,
    filasA: 2,
    columnasA: 2,
    columnasB: 2
  },

  async iniciar() {
    this.vincularEventos();
    this.generarInputs();
  },

  vincularEventos() {
    document.getElementById('filasA').addEventListener('change', () => this.actualizarDimensiones());
    document.getElementById('columnasA').addEventListener('change', () => this.actualizarDimensiones());
    document.getElementById('columnasB').addEventListener('change', () => this.actualizarDimensiones());

    document.getElementById('btnCalcular').addEventListener('click', () => this.calcular());
    document.getElementById('btnEjemplo').addEventListener('click', () => this.cargarEjemplo());
    document.getElementById('btnLimpiar').addEventListener('click', () => this.limpiar());
    document.getElementById('btnAlternarPasos').addEventListener('click', () => this.alternarPasos());
  },

  actualizarDimensiones() {
    this.estado.filasA = parseInt(document.getElementById('filasA').value);
    this.estado.columnasA = parseInt(document.getElementById('columnasA').value);
    this.estado.columnasB = parseInt(document.getElementById('columnasB').value);
    this.generarInputs();
  },

  generarInputs() {
    const m = this.estado.filasA;
    const n = this.estado.columnasA;
    const p = this.estado.columnasB;

    this.crearInputsMatriz('inputsMatrizA', 'A', m, n);
    this.crearInputsMatriz('inputsMatrizB', 'B', n, p);

    this.estado.matrizA = Array(m).fill(null).map(() => Array(n).fill(0));
    this.estado.matrizB = Array(n).fill(null).map(() => Array(p).fill(0));

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
    const m = this.estado.filasA;
    const n = this.estado.columnasA;
    const p = this.estado.columnasB;

    this.estado.matrizA = Array(m).fill(null).map(() => Array(n).fill(0));
    this.estado.matrizB = Array(n).fill(null).map(() => Array(p).fill(0));

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

      Notificaciones.calcular('Calculando multiplicación de matrices...');

      this.leerMatrices();
      
      const m = this.estado.filasA;
      const n = this.estado.columnasA;
      const p = this.estado.columnasB;
      
      this.estado.resultado = Array(m).fill(null).map(() => Array(p).fill(0));

      for (let i = 0; i < m; i++) {
        for (let j = 0; j < p; j++) {
          let suma = 0;
          for (let k = 0; k < n; k++) {
            suma += this.estado.matrizA[i][k] * this.estado.matrizB[k][j];
          }
          this.estado.resultado[i][j] = suma;
        }
      }

      this.mostrarResultado();
      Notificaciones.exito('Multiplicación calculada correctamente');
    } catch (error) {
      Notificaciones.error('Error al calcular la multiplicación: ' + error.message);
      console.error(error);
    }
  },

  mostrarResultado() {
    const contenedor = document.getElementById('contenedorResultado');
    const resultadoDiv = document.getElementById('resultadoMultiplicacion');

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
    const m = this.estado.filasA;
    const n = this.estado.columnasA;
    const p = this.estado.columnasB;
    
    let html = '<div class="desarrollo-math"><p><strong>Operación: C = A × B</strong></p>';
    html += '<p>Dimensiones: A es (' + m + '×' + n + '), B es (' + n + '×' + p + '), Resultado C es (' + m + '×' + p + ')</p>';
    html += '<p><strong>Fórmula:</strong> C[i][j] = Σ(A[i][k] × B[k][j]) para k=0 a ' + (n-1) + '</p><br>';
    
    html += '<p><strong>Matrices de entrada:</strong></p>';
    html += '<div class="matrices-fila">';
    html += this.generarTablaMatriz(this.estado.matrizA, 'A');
    html += this.generarTablaMatriz(this.estado.matrizB, 'B');
    html += '</div>';

    html += '<p><strong>Cálculos por elemento (seleccionados):</strong></p>';
    html += '<table class="tabla-pasos"><tr><th>Posición</th><th>Operación</th><th>Resultado</th></tr>';

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < p; j++) {
        let operacion = '';
        for (let k = 0; k < n; k++) {
          if (k > 0) operacion += ' + ';
          operacion += '(' + this.estado.matrizA[i][k] + '×' + this.estado.matrizB[k][j] + ')';
        }
        const resultado = this.estado.resultado[i][j];
        html += '<tr><td>[' + i + '][' + j + ']</td><td style="text-align:left;">' + operacion + '</td><td>' + resultado.toFixed(4).replace(/\.?0+$/, '') + '</td></tr>';
      }
    }

    html += '</table><br><p><strong>Matriz Resultado C (' + m + '×' + p + '):</strong></p>';
    html += this.generarTablaMatriz(this.estado.resultado, 'C');
    html += '</div>';

    contenedor.innerHTML = html;
    MathJax.typesetPromise().catch(err => console.log(err));
  },

  cargarEjemplo() {
    try {
      const ejemplos = {
        '2x2x2': {
          A: [[2, 3], [4, 5]],
          B: [[1, 2], [3, 4]]
        },
        '2x3x2': {
          A: [[1, 2, 3], [4, 5, 6]],
          B: [[1, 2], [3, 4], [5, 6]]
        },
        '3x2x3': {
          A: [[1, 2], [3, 4], [5, 6]],
          B: [[1, 2, 3], [4, 5, 6]]
        }
      };

      const key = this.estado.filasA + 'x' + this.estado.columnasA + 'x' + this.estado.columnasB;
      
      let ejemplo = ejemplos[key];
      if (!ejemplo) {
        ejemplo = {
          A: Array(this.estado.filasA).fill(null).map((_, i) => 
            Array(this.estado.columnasA).fill(null).map((_, j) => (i + j + 1))
          ),
          B: Array(this.estado.columnasA).fill(null).map((_, i) => 
            Array(this.estado.columnasB).fill(null).map((_, j) => (i * this.estado.columnasB + j + 1))
          )
        };
      }
      
      document.querySelectorAll('#inputsMatrizA input').forEach((input) => {
        const fila = parseInt(input.dataset.fila);
        const columna = parseInt(input.dataset.columna);
        input.value = ejemplo.A[fila][columna];
      });

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

document.addEventListener('DOMContentLoaded', () => {
  App.iniciar();
});
