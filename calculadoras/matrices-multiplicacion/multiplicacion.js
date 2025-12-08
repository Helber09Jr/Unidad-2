const App = {
  estado: {
    matrizA: [],
    matrizB: [],
    resultado: null,
    m: 2, n: 2, p: 2,
    pasos: []
  },

  iniciar() {
    this.actualizarDimensiones();
    this.vincularEventos();
  },

  vincularEventos() {
    document.getElementById('filasA').addEventListener('change', () => this.actualizarDimensiones());
    document.getElementById('columnasA').addEventListener('change', () => this.actualizarDimensiones());
    document.getElementById('columnasB').addEventListener('change', () => this.actualizarDimensiones());
    document.getElementById('btnCalcular').addEventListener('click', () => this.calcular());
    document.getElementById('btnEjemplo').addEventListener('click', () => this.cargarEjemplo());
    document.getElementById('btnLimpiar').addEventListener('click', () => this.limpiar());
    document.getElementById('btnTogglePasos').addEventListener('click', () => this.alternarPasos());
    document.getElementById('botonMenu').addEventListener('click', () => this.alternarMenu());
  },

  actualizarDimensiones() {
    this.estado.m = parseInt(document.getElementById('filasA').value);
    this.estado.n = parseInt(document.getElementById('columnasA').value);
    this.estado.p = parseInt(document.getElementById('columnasB').value);
    
    this.crearGridMatriz('inputsMatrizA', this.estado.m, this.estado.n, 'A');
    this.crearGridMatriz('inputsMatrizB', this.estado.n, this.estado.p, 'B');

    this.estado.matrizA = Array(this.estado.m).fill(null).map(() => Array(this.estado.n).fill(0));
    this.estado.matrizB = Array(this.estado.n).fill(null).map(() => Array(this.estado.p).fill(0));

    document.getElementById('tarjetaResultado').classList.add('oculto');
    document.getElementById('seccionDesarrollo').classList.add('oculto');
  },

  crearGridMatriz(contenedorId, filas, columnas, nombre) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = '';
    contenedor.style.gridTemplateColumns = 'repeat(' + columnas + ', 1fr)';

    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        input.className = 'input-matriz';
        input.placeholder = nombre + '[' + i + '][' + j + ']';
        input.dataset.fila = i;
        input.dataset.columna = j;
        input.dataset.matriz = nombre;
        input.addEventListener('change', () => this.leerMatrices());
        contenedor.appendChild(input);
      }
    }
  },

  leerMatrices() {
    this.estado.matrizA = Array(this.estado.m).fill(null).map(() => Array(this.estado.n).fill(0));
    this.estado.matrizB = Array(this.estado.n).fill(null).map(() => Array(this.estado.p).fill(0));

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
    for (let i = 0; i < this.estado.m; i++) {
      for (let j = 0; j < this.estado.n; j++) {
        if (isNaN(this.estado.matrizA[i][j])) return false;
      }
    }
    for (let i = 0; i < this.estado.n; i++) {
      for (let j = 0; j < this.estado.p; j++) {
        if (isNaN(this.estado.matrizB[i][j])) return false;
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

      Notificaciones.calcular('Calculando multiplicación de matrices...');

      this.estado.resultado = Array(this.estado.m).fill(null).map(() => Array(this.estado.p).fill(0));
      this.estado.pasos = [];

      for (let i = 0; i < this.estado.m; i++) {
        for (let j = 0; j < this.estado.p; j++) {
          let suma = 0;
          let operacion = [];
          for (let k = 0; k < this.estado.n; k++) {
            suma += this.estado.matrizA[i][k] * this.estado.matrizB[k][j];
            operacion.push(this.estado.matrizA[i][k] + '×' + this.estado.matrizB[k][j]);
          }
          this.estado.resultado[i][j] = suma;
          this.estado.pasos.push({
            posicion: '[' + i + '][' + j + ']',
            operacion: operacion.join(' + '),
            resultado: suma
          });
        }
      }

      this.mostrarResultado();
      Notificaciones.exito('Multiplicación calculada correctamente');
    } catch (error) {
      Notificaciones.error('Error: ' + error.message);
    }
  },

  mostrarResultado() {
    const contenedor = document.getElementById('contenedorResultado');
    
    let html = '<div class="contenedor-matrices-resultado">';
    html += this.generarTablaMatrizFormato(this.estado.matrizA, 'A');
    html += '<div class="operador">×</div>';
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
    html += '<p><strong>Operación:</strong> C = A × B</p>';
    html += '<p><strong>Dimensiones:</strong> A es (' + this.estado.m + '×' + this.estado.n + '), B es (' + this.estado.n + '×' + this.estado.p + '), Resultado C es (' + this.estado.m + '×' + this.estado.p + ')</p>';
    html += '<p><strong>Fórmula:</strong> C[i][j] = Σ A[i][k] × B[k][j]</p><br>';
    html += '<table class="tabla-desarrollo"><thead><tr><th>Posición</th><th>Producto Punto</th><th>Resultado</th></tr></thead><tbody>';

    this.estado.pasos.forEach(paso => {
      html += '<tr><td>' + paso.posicion + '</td>';
      html += '<td style="font-size: 12px;">' + paso.operacion + '</td>';
      html += '<td class="resultado-paso">' + paso.resultado.toFixed(2).replace(/\.?0+$/, '') + '</td></tr>';
    });

    html += '</tbody></table></div>';

    contenedor.innerHTML = html;
    MathJax.typesetPromise().catch(err => console.log(err));
  },

  cargarEjemplo() {
    const ejemplos = {
      '2222': { A: [[2, 3], [4, 5]], B: [[1, 2], [3, 4]] },
      '2322': { A: [[1, 2, 3], [4, 5, 6]], B: [[1, 2], [3, 4], [5, 6]] },
      '3223': { A: [[1, 2], [3, 4], [5, 6]], B: [[1, 2, 3], [4, 5, 6]] }
    };

    try {
      const key = '' + this.estado.m + this.estado.n + this.estado.p + this.estado.m;
      let ejemplo = ejemplos[key];
      
      if (!ejemplo) {
        ejemplo = {
          A: Array(this.estado.m).fill(null).map((_, i) => Array(this.estado.n).fill(null).map((_, j) => i + j + 1)),
          B: Array(this.estado.n).fill(null).map((_, i) => Array(this.estado.p).fill(null).map((_, j) => i * this.estado.p + j + 1))
        };
      }
      
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
      document.querySelectorAll('.input-matriz').forEach(input => input.value = '');
      this.estado.matrizA = [];
      this.estado.matrizB = [];
      this.estado.resultado = null;
      document.getElementById('tarjetaResultado').classList.add('oculto');
      document.getElementById('seccionDesarrollo').classList.add('oculto');
      Notificaciones.info('Datos limpiados');
    }
  },

  alternarMenu() {
    document.getElementById('menuNavegacion').classList.toggle('activo');
  }
};

document.addEventListener('DOMContentLoaded', () => App.iniciar());
