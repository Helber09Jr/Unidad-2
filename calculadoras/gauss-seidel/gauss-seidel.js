/* --- MÉTODO GAUSS-SEIDEL --- */

const App = {
  estado: {
    n: 2,
    matrizAumentada: [],
    solucion: [],
    iteraciones: [],
    tol: 1e-5,
    maxIter: 100,
    convergio: false,
    iteracionesFinal: 0
  },

  async iniciar() {
    this.vincularEventos();
    this.generarInputs();
  },

  vincularEventos() {
    document.getElementById('numEcuaciones').addEventListener('change', () => this.actualizarTamanio());
    document.getElementById('btnCalcular').addEventListener('click', () => this.calcular());
    document.getElementById('btnEjemplo').addEventListener('click', () => this.cargarEjemplo());
    document.getElementById('btnLimpiar').addEventListener('click', () => this.limpiar());
    document.getElementById('btnAlternarTabla').addEventListener('click', () => this.alternarTabla());
  },

  actualizarTamanio() {
    this.estado.n = parseInt(document.getElementById('numEcuaciones').value);
    this.generarInputs();
  },

  generarInputs() {
    const n = this.estado.n;
    this.crearInputsMatrizAumentada(n);
    this.estado.matrizAumentada = Array(n).fill(null).map(() => Array(n + 1).fill(0));

    document.getElementById('contenedorResultado').classList.add('oculto');
    document.getElementById('contenedorTabla').classList.add('oculto');
  },

  crearInputsMatrizAumentada(n) {
    const contenedor = document.getElementById('inputsMatrizAumentada');
    contenedor.innerHTML = '';
    
    const grid = contenedor.style;
    grid.gridTemplateColumns = 'repeat(' + (n + 1) + ', 1fr)';
    grid.gap = '8px';

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n + 1; j++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        if (j === n) {
          input.placeholder = 'b[' + i + ']';
        } else {
          input.placeholder = 'a[' + i + '][' + j + ']';
        }
        input.dataset.fila = i;
        input.dataset.columna = j;
        contenedor.appendChild(input);
      }
    }
  },

  validar() {
    const inputs = document.querySelectorAll('#inputsMatrizAumentada input');
    for (let input of inputs) {
      if (input.value === '' || isNaN(parseFloat(input.value))) {
        return false;
      }
    }
    return true;
  },

  leerMatrizAumentada() {
    const n = this.estado.n;
    this.estado.matrizAumentada = Array(n).fill(null).map(() => Array(n + 1).fill(0));

    const inputs = document.querySelectorAll('#inputsMatrizAumentada input');
    inputs.forEach(input => {
      const i = parseInt(input.dataset.fila);
      const j = parseInt(input.dataset.columna);
      this.estado.matrizAumentada[i][j] = parseFloat(input.value) || 0;
    });
  },

  verificarDominancDiagonal() {
    const n = this.estado.n;
    for (let i = 0; i < n; i++) {
      let suma = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          suma += Math.abs(this.estado.matrizAumentada[i][j]);
        }
      }
      if (Math.abs(this.estado.matrizAumentada[i][i]) <= suma) {
        return false;
      }
    }
    return true;
  },

  calcular() {
    try {
      if (!this.validar()) {
        Notificaciones.error('Por favor completa el sistema con valores numéricos');
        return;
      }

      this.leerMatrizAumentada();
      this.estado.tol = parseFloat(document.getElementById('tolerancia').value);
      this.estado.maxIter = parseInt(document.getElementById('maxIteraciones').value);

      if (!this.verificarDominancDiagonal()) {
        Notificaciones.error('Matriz no es diagonalmente dominante. Gauss-Seidel puede no converger.');
        return;
      }

      Notificaciones.calcular('Resolviendo con método Gauss-Seidel...');
      
      const n = this.estado.n;
      this.estado.iteraciones = [];
      this.estado.solucion = Array(n).fill(0);
      let xAnterior = Array(n).fill(0);
      
      for (let k = 0; k < this.estado.maxIter; k++) {
        let xNueva = [...xAnterior];
        
        for (let i = 0; i < n; i++) {
          let suma = 0;
          for (let j = 0; j < n; j++) {
            if (i !== j) {
              suma += this.estado.matrizAumentada[i][j] * xNueva[j];
            }
          }
          xNueva[i] = (this.estado.matrizAumentada[i][n] - suma) / this.estado.matrizAumentada[i][i];
        }

        let error = 0;
        for (let i = 0; i < n; i++) {
          error = Math.max(error, Math.abs(xNueva[i] - xAnterior[i]));
        }

        const iteracion = { iter: k + 1, x: [...xNueva], error: error };
        this.estado.iteraciones.push(iteracion);
        this.estado.solucion = [...xNueva];

        if (error < this.estado.tol) {
          this.estado.convergio = true;
          this.estado.iteracionesFinal = k + 1;
          break;
        }

        xAnterior = [...xNueva];
      }

      if (!this.estado.convergio) {
        this.estado.iteracionesFinal = this.estado.maxIter;
        Notificaciones.error('No convergió en ' + this.estado.maxIter + ' iteraciones');
        return;
      }

      this.mostrarResultado();
      Notificaciones.exito('Sistema resuelto en ' + this.estado.iteracionesFinal + ' iteraciones');
    } catch (error) {
      Notificaciones.error('Error al resolver: ' + error.message);
      console.error(error);
    }
  },

  mostrarResultado() {
    const contenedor = document.getElementById('contenedorResultado');
    const solucionDiv = document.getElementById('resultadoSolucion');
    const convergenciaDiv = document.getElementById('convergenciaInfo');

    let solucionHTML = '<h4>Vector Solución x:</h4><table class="tabla-solucion"><tbody>';
    this.estado.solucion.forEach((valor, idx) => {
      solucionHTML += '<tr><td>x[' + idx + ']</td><td>' + valor.toFixed(6).replace(/\.?0+$/, '') + '</td></tr>';
    });
    solucionHTML += '</tbody></table>';

    let convergenciaHTML = '<div class="info-convergencia">';
    convergenciaHTML += '<p><strong>Convergencia:</strong> ' + (this.estado.convergio ? 'Sí' : 'No') + '</p>';
    convergenciaHTML += '<p><strong>Iteraciones:</strong> ' + this.estado.iteracionesFinal + '</p>';
    convergenciaHTML += '<p><strong>Tolerancia Final:</strong> ' + this.estado.iteraciones[this.estado.iteraciones.length - 1].error.toExponential(4) + '</p>';
    convergenciaHTML += '<p><strong>Tolerancia Requerida:</strong> ' + this.estado.tol.toExponential(4) + '</p>';
    convergenciaHTML += '<p style="font-size: 12px; color: #666; margin-top: 10px;"><em>Nota: Gauss-Seidel típicamente converge más rápido que Jacobi.</em></p>';
    convergenciaHTML += '</div>';

    solucionDiv.innerHTML = solucionHTML;
    convergenciaDiv.innerHTML = convergenciaHTML;

    contenedor.classList.remove('oculto');
    document.getElementById('contenedorTabla').classList.add('oculto');
  },

  alternarTabla() {
    const tabla = document.getElementById('contenedorTabla');
    if (tabla.classList.contains('oculto')) {
      this.mostrarTabla();
      tabla.classList.remove('oculto');
    } else {
      tabla.classList.add('oculto');
    }
  },

  mostrarTabla() {
    const contenedor = document.getElementById('tablaIteraciones');
    const n = this.estado.n;
    
    let html = '<table class="tabla-metodo"><thead><tr><th>Iter</th>';
    for (let i = 0; i < n; i++) {
      html += '<th>x[' + i + ']</th>';
    }
    html += '<th>Error</th></tr></thead><tbody>';

    this.estado.iteraciones.forEach(it => {
      html += '<tr><td>' + it.iter + '</td>';
      it.x.forEach(val => {
        html += '<td>' + val.toFixed(4).replace(/\.?0+$/, '') + '</td>';
      });
      html += '<td>' + it.error.toExponential(3) + '</td></tr>';
    });

    html += '</tbody></table>';
    contenedor.innerHTML = html;
  },

  cargarEjemplo() {
    try {
      const n = this.estado.n;
      const ejemplos = {
        2: [[10, 1, 11], [1, 10, 12]],
        3: [[10, 1, 1, 12], [1, 10, 1, 12], [1, 1, 10, 12]],
        4: [[10, 1, 2, 1, 14], [1, 10, 1, 1, 12], [2, 1, 10, 1, 14], [1, 1, 1, 10, 13]]
      };

      const ejemplo = ejemplos[n];
      
      document.querySelectorAll('#inputsMatrizAumentada input').forEach((input) => {
        const i = parseInt(input.dataset.fila);
        const j = parseInt(input.dataset.columna);
        input.value = ejemplo[i][j];
      });

      Notificaciones.exito('Ejemplo cargado correctamente');
    } catch (error) {
      Notificaciones.error('Error al cargar el ejemplo: ' + error.message);
    }
  },

  limpiar() {
    document.querySelectorAll('#inputsMatrizAumentada input').forEach(input => {
      input.value = '';
    });
    document.getElementById('contenedorResultado').classList.add('oculto');
    document.getElementById('contenedorTabla').classList.add('oculto');
    Notificaciones.info('Campos limpiados');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.iniciar();
});
