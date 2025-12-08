/* --- MATRIZ INVERSA (GAUSS-JORDAN) --- */

const App = {
  estado: {
    matriz: [],
    inversa: [],
    determinante: 0,
    tamanio: 2,
    pasos: [],
    esInvertible: false
  },

  async iniciar() {
    this.vincularEventos();
    this.generarInputs();
  },

  vincularEventos() {
    document.getElementById('tamanioMatriz').addEventListener('change', () => this.actualizarTamanio());
    document.getElementById('btnCalcular').addEventListener('click', () => this.calcular());
    document.getElementById('btnEjemplo').addEventListener('click', () => this.cargarEjemplo());
    document.getElementById('btnLimpiar').addEventListener('click', () => this.limpiar());
    document.getElementById('btnAlternarPasos').addEventListener('click', () => this.alternarPasos());
  },

  actualizarTamanio() {
    this.estado.tamanio = parseInt(document.getElementById('tamanioMatriz').value);
    this.generarInputs();
  },

  generarInputs() {
    const n = this.estado.tamanio;
    this.crearInputsMatriz('inputsMatrizA', 'A', n, n);
    this.estado.matriz = Array(n).fill(null).map(() => Array(n).fill(0));

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
        contenedor.appendChild(input);
      }
    }
  },

  validar() {
    const inputs = document.querySelectorAll('#inputsMatrizA input');
    for (let input of inputs) {
      if (input.value === '' || isNaN(parseFloat(input.value))) {
        return false;
      }
    }
    return true;
  },

  leerMatriz() {
    const n = this.estado.tamanio;
    this.estado.matriz = Array(n).fill(null).map(() => Array(n).fill(0));

    const inputs = document.querySelectorAll('#inputsMatrizA input');
    inputs.forEach(input => {
      const i = parseInt(input.dataset.fila);
      const j = parseInt(input.dataset.columna);
      this.estado.matriz[i][j] = parseFloat(input.value) || 0;
    });
  },

  calcularDeterminante() {
    const n = this.estado.tamanio;
    if (n === 2) {
      const m = this.estado.matriz;
      return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    } else {
      let det = 0;
      for (let j = 0; j < n; j++) {
        const menor = this.calcularMenor(0, j);
        const signo = ((0 + j) % 2 === 0) ? 1 : -1;
        det += this.estado.matriz[0][j] * signo * menor;
      }
      return det;
    }
  },

  calcularMenor(fila, columna) {
    const n = this.estado.tamanio;
    const submatriz = [];
    
    for (let i = 0; i < n; i++) {
      if (i === fila) continue;
      const nuevaFila = [];
      for (let j = 0; j < n; j++) {
        if (j === columna) continue;
        nuevaFila.push(this.estado.matriz[i][j]);
      }
      submatriz.push(nuevaFila);
    }

    if (submatriz.length === 1) {
      return submatriz[0][0];
    } else if (submatriz.length === 2) {
      return submatriz[0][0] * submatriz[1][1] - submatriz[0][1] * submatriz[1][0];
    }
  },

  calcular() {
    try {
      if (!this.validar()) {
        Notificaciones.error('Por favor completa la matriz con valores numéricos');
        return;
      }

      Notificaciones.calcular('Calculando matriz inversa...');
      this.leerMatriz();
      
      const n = this.estado.tamanio;
      this.estado.determinante = this.calcularDeterminante();

      if (Math.abs(this.estado.determinante) < 1e-10) {
        Notificaciones.error('La matriz es singular (det = 0). No tiene inversa.');
        this.estado.esInvertible = false;
        return;
      }

      this.estado.esInvertible = true;
      this.calcularInversaGaussJordan();
      this.mostrarResultado();
      Notificaciones.exito('Matriz inversa calculada correctamente');
    } catch (error) {
      Notificaciones.error('Error al calcular: ' + error.message);
      console.error(error);
    }
  },

  calcularInversaGaussJordan() {
    const n = this.estado.tamanio;
    const pasos = [];
    
    pasos.push('Método de Gauss-Jordan');
    pasos.push('Se crea matriz aumentada [A|I] y se reduce a [I|A⁻¹]');
    pasos.push('');

    const aumentada = [];
    for (let i = 0; i < n; i++) {
      const fila = [...this.estado.matriz[i]];
      for (let j = 0; j < n; j++) {
        fila.push(i === j ? 1 : 0);
      }
      aumentada.push(fila);
    }

    for (let i = 0; i < n; i++) {
      let maxFila = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(aumentada[k][i]) > Math.abs(aumentada[maxFila][i])) {
          maxFila = k;
        }
      }

      if (maxFila !== i) {
        const temp = aumentada[i];
        aumentada[i] = aumentada[maxFila];
        aumentada[maxFila] = temp;
      }

      const pivot = aumentada[i][i];
      if (Math.abs(pivot) < 1e-10) {
        throw new Error('Pivote muy pequeño');
      }

      for (let j = 0; j < 2 * n; j++) {
        aumentada[i][j] /= pivot;
      }

      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = aumentada[k][i];
          for (let j = 0; j < 2 * n; j++) {
            aumentada[k][j] -= factor * aumentada[i][j];
          }
        }
      }
    }

    this.estado.inversa = [];
    for (let i = 0; i < n; i++) {
      const fila = [];
      for (let j = n; j < 2 * n; j++) {
        fila.push(aumentada[i][j]);
      }
      this.estado.inversa.push(fila);
    }

    pasos.push('Proceso completado');
    this.estado.pasos = pasos;
  },

  mostrarResultado() {
    const contenedor = document.getElementById('contenedorResultado');
    const resumenDiv = document.getElementById('resumenMatriz');
    const inversaDiv = document.getElementById('resumenMatrizInversa');
    const verificacionDiv = document.getElementById('verificacion');

    let resumen = '<div class="matrices-contenedor"><div class="matriz-contenedor">';
    resumen += '<h4>Matriz Original A:</h4><table class="tabla-matriz"><tbody>';
    this.estado.matriz.forEach(fila => {
      resumen += '<tr>';
      fila.forEach(valor => {
        resumen += '<td>' + valor.toFixed(3).replace(/\.?0+$/, '') + '</td>';
      });
      resumen += '</tr>';
    });
    resumen += '</tbody></table><p><strong>det(A) = ' + this.estado.determinante.toFixed(4) + '</strong></p></div>';

    let inversa = '<div class="matriz-contenedor"><h4>Matriz Inversa A⁻¹:</h4><table class="tabla-matriz"><tbody>';
    this.estado.inversa.forEach(fila => {
      inversa += '<tr>';
      fila.forEach(valor => {
        inversa += '<td>' + valor.toFixed(4).replace(/\.?0+$/, '') + '</td>';
      });
      inversa += '</tr>';
    });
    inversa += '</tbody></table></div></div>';

    resumenDiv.innerHTML = resumen;
    inversaDiv.innerHTML = inversa;

    const verificacion = this.verificarInversa();
    verificacionDiv.innerHTML = '<h4>Verificación: A × A⁻¹ = I</h4>' + verificacion;

    contenedor.classList.remove('oculto');
    document.getElementById('contenedorDesarrollo').classList.add('oculto');
  },

  verificarInversa() {
    const n = this.estado.tamanio;
    const producto = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          producto[i][j] += this.estado.matriz[i][k] * this.estado.inversa[k][j];
        }
      }
    }

    let html = '<table class="tabla-matriz"><tbody>';
    producto.forEach(fila => {
      html += '<tr>';
      fila.forEach(valor => {
        const esIdentidad = (Math.abs(valor - 1) < 0.01 || Math.abs(valor) < 0.01);
        const clase = esIdentidad ? '' : 'error-celda';
        html += '<td class="' + clase + '">' + valor.toFixed(4).replace(/\.?0+$/, '') + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table><p style="font-size: 12px; margin-top: 10px;">Los valores cercanos a 1 en la diagonal y cercanos a 0 fuera de ella confirman que es la inversa correcta.</p>';

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
    
    let html = '<div class="desarrollo-math">';
    this.estado.pasos.forEach((paso, idx) => {
      if (paso === '') {
        html += '<hr style="margin: 10px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">';
      } else {
        html += '<p>' + paso + '</p>';
      }
    });
    html += '<p><strong>Nota:</strong> El método de Gauss-Jordan transforma [A|I] en [I|A⁻¹] usando operaciones de fila.</p>';
    html += '</div>';

    contenedor.innerHTML = html;
    MathJax.typesetPromise().catch(err => console.log(err));
  },

  cargarEjemplo() {
    try {
      const n = this.estado.tamanio;
      const ejemplos = {
        2: [[4, 7], [2, 6]],
        3: [[1, 2, 3], [0, 1, 4], [5, 6, 0]],
        4: [[1, 0, 2, 0], [0, 1, 0, 2], [0, 0, 1, 0], [0, 0, 0, 1]]
      };

      const ejemplo = ejemplos[n];
      
      document.querySelectorAll('#inputsMatrizA input').forEach((input) => {
        const fila = parseInt(input.dataset.fila);
        const columna = parseInt(input.dataset.columna);
        input.value = ejemplo[fila][columna];
      });

      Notificaciones.exito('Ejemplo cargado correctamente');
    } catch (error) {
      Notificaciones.error('Error al cargar el ejemplo: ' + error.message);
    }
  },

  limpiar() {
    document.querySelectorAll('#inputsMatrizA input').forEach(input => {
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
