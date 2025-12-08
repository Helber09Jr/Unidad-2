/* --- TRIANGULACIÓN DE GAUSS --- */

const App = {
  estado: {
    n: 2,
    matrizAumentada: [],
    matrizTriangular: [],
    solucion: [],
    pasos: []
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
    document.getElementById('btnAlternarPasos').addEventListener('click', () => this.alternarPasos());
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
    document.getElementById('contenedorDesarrollo').classList.add('oculto');
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

  calcular() {
    try {
      if (!this.validar()) {
        Notificaciones.error('Por favor completa el sistema con valores numéricos');
        return;
      }

      Notificaciones.calcular('Calculando triangulación de Gauss...');
      this.leerMatrizAumentada();
      
      const n = this.estado.n;
      this.estado.matrizTriangular = this.estado.matrizAumentada.map(fila => [...fila]);
      this.estado.pasos = [];
      
      this.estado.pasos.push('MÉTODO DE TRIANGULACIÓN DE GAUSS');
      this.estado.pasos.push('Fase 1: Eliminación hacia adelante (Forward Elimination)');
      this.estado.pasos.push('');

      this.eliminacionHaciaAdelante();
      
      this.estado.pasos.push('');
      this.estado.pasos.push('Fase 2: Sustitución hacia atrás (Back Substitution)');
      this.estado.pasos.push('');

      this.sustitucionHaciaAtras();

      this.mostrarResultado();
      Notificaciones.exito('Sistema resuelto correctamente');
    } catch (error) {
      Notificaciones.error('Error al resolver: ' + error.message);
      console.error(error);
    }
  },

  eliminacionHaciaAdelante() {
    const n = this.estado.n;
    
    for (let k = 0; k < n - 1; k++) {
      let maxFila = k;
      for (let i = k + 1; i < n; i++) {
        if (Math.abs(this.estado.matrizTriangular[i][k]) > Math.abs(this.estado.matrizTriangular[maxFila][k])) {
          maxFila = i;
        }
      }

      if (maxFila !== k) {
        const temp = this.estado.matrizTriangular[k];
        this.estado.matrizTriangular[k] = this.estado.matrizTriangular[maxFila];
        this.estado.matrizTriangular[maxFila] = temp;
        this.estado.pasos.push('Intercambiar fila ' + k + ' con fila ' + maxFila);
      }

      const pivot = this.estado.matrizTriangular[k][k];
      if (Math.abs(pivot) < 1e-10) {
        throw new Error('Sistema singular o mal condicionado');
      }

      for (let i = k + 1; i < n; i++) {
        const factor = this.estado.matrizTriangular[i][k] / pivot;
        this.estado.pasos.push('Fila ' + i + ': Restar ' + factor.toFixed(4) + ' × Fila ' + k);
        
        for (let j = k; j < n + 1; j++) {
          this.estado.matrizTriangular[i][j] -= factor * this.estado.matrizTriangular[k][j];
        }
      }
      this.estado.pasos.push('');
    }
  },

  sustitucionHaciaAtras() {
    const n = this.estado.n;
    this.estado.solucion = Array(n).fill(0);

    for (let i = n - 1; i >= 0; i--) {
      let suma = 0;
      for (let j = i + 1; j < n; j++) {
        suma += this.estado.matrizTriangular[i][j] * this.estado.solucion[j];
      }
      this.estado.solucion[i] = (this.estado.matrizTriangular[i][n] - suma) / this.estado.matrizTriangular[i][i];
      this.estado.pasos.push('x[' + i + '] = ' + this.estado.solucion[i].toFixed(6));
    }
  },

  mostrarResultado() {
    const contenedor = document.getElementById('contenedorResultado');
    const solucionDiv = document.getElementById('resultadoSolucion');
    const triangularDiv = document.getElementById('matrizTriangular');

    let solucionHTML = '<h4>Vector Solución x:</h4><table class="tabla-solucion"><tbody>';
    this.estado.solucion.forEach((valor, idx) => {
      solucionHTML += '<tr><td>x[' + idx + ']</td><td>' + valor.toFixed(6).replace(/\.?0+$/, '') + '</td></tr>';
    });
    solucionHTML += '</tbody></table>';

    let triangularHTML = '<h4>Matriz Triangular Superior [U|b\']:</h4><table class="tabla-matriz"><tbody>';
    this.estado.matrizTriangular.forEach(fila => {
      triangularHTML += '<tr>';
      fila.forEach((valor, idx) => {
        const clase = idx === this.estado.n ? 'columna-b' : '';
        triangularHTML += '<td class="' + clase + '">' + valor.toFixed(4).replace(/\.?0+$/, '') + '</td>';
      });
      triangularHTML += '</tr>';
    });
    triangularHTML += '</tbody></table>';

    solucionDiv.innerHTML = solucionHTML;
    triangularDiv.innerHTML = triangularHTML;

    contenedor.classList.remove('oculto');
    document.getElementById('contenedorDesarrollo').classList.add('oculto');
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
    
    let html = '<div class="desarrollo-math">';
    this.estado.pasos.forEach((paso) => {
      if (paso === '') {
        html += '<hr style="margin: 8px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">';
      } else {
        html += '<p>' + paso + '</p>';
      }
    });
    html += '</div>';

    contenedor.innerHTML = html;
    MathJax.typesetPromise().catch(err => console.log(err));
  },

  cargarEjemplo() {
    try {
      const n = this.estado.n;
      const ejemplos = {
        2: [[2, -1, 1], [3, 1, 11]],
        3: [[1, 2, 1, 9], [2, 1, 3, 13], [3, 2, 1, 11]],
        4: [[4, 1, -1, 2, 12], [1, 5, 1, 1, 14], [-1, 1, 3, 2, 4], [2, 1, 2, 4, 12]]
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
    document.getElementById('contenedorDesarrollo').classList.add('oculto');
    Notificaciones.info('Campos limpiados');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.iniciar();
});
