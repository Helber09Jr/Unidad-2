/* --- MÉTODO DE GAUSS-JORDAN --- */

const App = {
  estado: {
    n: 2,
    matrizAumentada: [],
    matrizReducida: [],
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

      Notificaciones.calcular('Resolviendo con Gauss-Jordan...');
      this.leerMatrizAumentada();
      
      const n = this.estado.n;
      this.estado.matrizReducida = this.estado.matrizAumentada.map(fila => [...fila]);
      this.estado.pasos = [];
      this.estado.pasos.push('MÉTODO DE GAUSS-JORDAN');
      this.estado.pasos.push('Reduce [A|b] a [I|x] mediante operaciones de fila');
      this.estado.pasos.push('');

      this.gauss jordan();

      this.mostrarResultado();
      Notificaciones.exito('Sistema resuelto correctamente');
    } catch (error) {
      Notificaciones.error('Error al resolver: ' + error.message);
      console.error(error);
    }
  },

  'gauss jordan'() {
    const n = this.estado.n;
    
    for (let i = 0; i < n; i++) {
      let maxFila = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(this.estado.matrizReducida[k][i]) > Math.abs(this.estado.matrizReducida[maxFila][i])) {
          maxFila = k;
        }
      }

      if (maxFila !== i) {
        const temp = this.estado.matrizReducida[i];
        this.estado.matrizReducida[i] = this.estado.matrizReducida[maxFila];
        this.estado.matrizReducida[maxFila] = temp;
        this.estado.pasos.push('Intercambiar fila ' + i + ' con fila ' + maxFila);
      }

      const pivot = this.estado.matrizReducida[i][i];
      if (Math.abs(pivot) < 1e-10) {
        throw new Error('Sistema singular o mal condicionado');
      }

      for (let j = i; j < n + 1; j++) {
        this.estado.matrizReducida[i][j] /= pivot;
      }
      this.estado.pasos.push('Dividir fila ' + i + ' por ' + pivot.toFixed(4));

      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = this.estado.matrizReducida[k][i];
          this.estado.pasos.push('Fila ' + k + ': Restar ' + factor.toFixed(4) + ' × Fila ' + i);
          
          for (let j = i; j < n + 1; j++) {
            this.estado.matrizReducida[k][j] -= factor * this.estado.matrizReducida[i][j];
          }
        }
      }
      this.estado.pasos.push('');
    }

    this.estado.solucion = [];
    for (let i = 0; i < n; i++) {
      this.estado.solucion[i] = this.estado.matrizReducida[i][n];
    }
  },

  mostrarResultado() {
    const contenedor = document.getElementById('contenedorResultado');
    const solucionDiv = document.getElementById('resultadoSolucion');
    const reducidaDiv = document.getElementById('matrizReducida');

    let solucionHTML = '<h4>Vector Solución x:</h4><table class="tabla-solucion"><tbody>';
    this.estado.solucion.forEach((valor, idx) => {
      solucionHTML += '<tr><td>x[' + idx + ']</td><td>' + valor.toFixed(6).replace(/\.?0+$/, '') + '</td></tr>';
    });
    solucionHTML += '</tbody></table>';

    let reducidaHTML = '<h4>Matriz Reducida Fila Escalonada [I|x]:</h4><table class="tabla-matriz"><tbody>';
    this.estado.matrizReducida.forEach(fila => {
      reducidaHTML += '<tr>';
      fila.forEach((valor, idx) => {
        const clase = idx === this.estado.n ? 'columna-b' : '';
        reducidaHTML += '<td class="' + clase + '">' + valor.toFixed(4).replace(/\.?0+$/, '') + '</td>';
      });
      reducidaHTML += '</tr>';
    });
    reducidaHTML += '</tbody></table>';

    solucionDiv.innerHTML = solucionHTML;
    reducidaDiv.innerHTML = reducidaHTML;

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
        2: [[1, 1, 3], [2, -1, 3]],
        3: [[2, 1, 1, 8], [1, 3, -1, 7], [3, -1, 2, 8]],
        4: [[1, 2, 1, 3, 14], [2, 1, 3, 1, 11], [3, 1, 2, 2, 11], [1, 3, 2, 1, 8]]
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
