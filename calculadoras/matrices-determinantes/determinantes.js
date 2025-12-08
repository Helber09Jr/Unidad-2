/* --- CÁLCULO DE DETERMINANTES --- */

const App = {
  estado: {
    matriz: [],
    determinante: 0,
    tamanio: 2,
    metodo: 'auto',
    pasos: []
  },

  async iniciar() {
    this.vincularEventos();
    this.generarInputs();
  },

  vincularEventos() {
    document.getElementById('tamanioMatriz').addEventListener('change', () => this.actualizarTamanio());
    document.getElementById('metodo').addEventListener('change', () => {
      const metodo = document.getElementById('metodo');
      if (this.estado.tamanio !== 3 && metodo.value === 'sarrus') {
        metodo.value = 'auto';
        Notificaciones.info('Sarrus solo es para matrices 3×3');
      }
    });

    document.getElementById('btnCalcular').addEventListener('click', () => this.calcular());
    document.getElementById('btnEjemplo').addEventListener('click', () => this.cargarEjemplo());
    document.getElementById('btnLimpiar').addEventListener('click', () => this.limpiar());
    document.getElementById('btnAlternarPasos').addEventListener('click', () => this.alternarPasos());
  },

  actualizarTamanio() {
    this.estado.tamanio = parseInt(document.getElementById('tamanioMatriz').value);
    const metodo = document.getElementById('metodo');
    if (this.estado.tamanio !== 3 && metodo.value === 'sarrus') {
      metodo.value = 'auto';
    }
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

  calcular() {
    try {
      if (!this.validar()) {
        Notificaciones.error('Por favor completa la matriz con valores numéricos');
        return;
      }

      Notificaciones.calcular('Calculando determinante...');
      this.leerMatriz();
      
      const n = this.estado.tamanio;
      const metodo = document.getElementById('metodo').value;
      
      if (n === 2) {
        this.calcularDet2x2();
      } else if (n === 3 && metodo === 'sarrus') {
        this.calcularDet3x3Sarrus();
      } else {
        this.calcularDetCofactores();
      }

      this.mostrarResultado();
      Notificaciones.exito('Determinante calculado: ' + this.estado.determinante.toFixed(4));
    } catch (error) {
      Notificaciones.error('Error al calcular: ' + error.message);
      console.error(error);
    }
  },

  calcularDet2x2() {
    const m = this.estado.matriz;
    this.estado.determinante = m[0][0] * m[1][1] - m[0][1] * m[1][0];
    this.estado.pasos = [
      'det(A) = a₀₀ × a₁₁ - a₀₁ × a₁₀',
      'det(A) = ' + m[0][0] + ' × ' + m[1][1] + ' - ' + m[0][1] + ' × ' + m[1][0],
      'det(A) = ' + (m[0][0] * m[1][1]) + ' - ' + (m[0][1] * m[1][0]),
      'det(A) = ' + this.estado.determinante
    ];
  },

  calcularDet3x3Sarrus() {
    const m = this.estado.matriz;
    
    const diag1 = m[0][0] * m[1][1] * m[2][2];
    const diag2 = m[0][1] * m[1][2] * m[2][0];
    const diag3 = m[0][2] * m[1][0] * m[2][1];
    const diag4 = m[0][2] * m[1][1] * m[2][0];
    const diag5 = m[0][0] * m[1][2] * m[2][1];
    const diag6 = m[0][1] * m[1][0] * m[2][2];

    this.estado.determinante = (diag1 + diag2 + diag3) - (diag4 + diag5 + diag6);
    
    this.estado.pasos = [
      'Método de Sarrus',
      'Diagonales positivas:',
      'Diag 1: ' + m[0][0] + '×' + m[1][1] + '×' + m[2][2] + ' = ' + diag1,
      'Diag 2: ' + m[0][1] + '×' + m[1][2] + '×' + m[2][0] + ' = ' + diag2,
      'Diag 3: ' + m[0][2] + '×' + m[1][0] + '×' + m[2][1] + ' = ' + diag3,
      'Suma positiva = ' + (diag1 + diag2 + diag3),
      '',
      'Diagonales negativas:',
      'Diag 4: ' + m[0][2] + '×' + m[1][1] + '×' + m[2][0] + ' = ' + diag4,
      'Diag 5: ' + m[0][0] + '×' + m[1][2] + '×' + m[2][1] + ' = ' + diag5,
      'Diag 6: ' + m[0][1] + '×' + m[1][0] + '×' + m[2][2] + ' = ' + diag6,
      'Suma negativa = ' + (diag4 + diag5 + diag6),
      '',
      'det(A) = ' + (diag1 + diag2 + diag3) + ' - ' + (diag4 + diag5 + diag6),
      'det(A) = ' + this.estado.determinante
    ];
  },

  calcularDetCofactores() {
    const n = this.estado.tamanio;
    const pasos = [];
    
    pasos.push('Método de Cofactores (Expansión por primera fila)');
    pasos.push('');
    
    let det = 0;
    for (let j = 0; j < n; j++) {
      const menor = this.calcularMenor(0, j);
      const signo = ((0 + j) % 2 === 0) ? 1 : -1;
      const cofactor = signo * menor;
      det += this.estado.matriz[0][j] * cofactor;
      
      pasos.push('Cofactor[0][' + j + ']: (' + signo + ') × ' + this.estado.matriz[0][j] + ' × ' + menor.toFixed(4) + ' = ' + (this.estado.matriz[0][j] * cofactor).toFixed(4));
    }
    
    this.estado.determinante = det;
    pasos.push('');
    pasos.push('det(A) = ' + det.toFixed(4));
    this.estado.pasos = pasos;
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
    } else if (submatriz.length === 3) {
      return (submatriz[0][0] * submatriz[1][1] * submatriz[2][2] +
              submatriz[0][1] * submatriz[1][2] * submatriz[2][0] +
              submatriz[0][2] * submatriz[1][0] * submatriz[2][1]) -
             (submatriz[0][2] * submatriz[1][1] * submatriz[2][0] +
              submatriz[0][0] * submatriz[1][2] * submatriz[2][1] +
              submatriz[0][1] * submatriz[1][0] * submatriz[2][2]);
    }
  },

  mostrarResultado() {
    const contenedor = document.getElementById('contenedorResultado');
    const valorDiv = document.getElementById('valorDeterminante');
    const resumenDiv = document.getElementById('resumenMatriz');

    valorDiv.innerHTML = '<span class="numero-resultado">' + this.estado.determinante.toFixed(4).replace(/\.?0+$/, '') + '</span>';
    
    let resumen = '<div class="matriz-contenedor"><h4>Matriz A:</h4><table class="tabla-matriz"><tbody>';
    this.estado.matriz.forEach(fila => {
      resumen += '<tr>';
      fila.forEach(valor => {
        resumen += '<td>' + valor.toFixed(2).replace(/\.?0+$/, '') + '</td>';
      });
      resumen += '</tr>';
    });
    resumen += '</tbody></table></div>';

    resumenDiv.innerHTML = resumen;
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
    this.estado.pasos.forEach((paso, idx) => {
      if (paso === '') {
        html += '<hr style="margin: 10px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">';
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
      const n = this.estado.tamanio;
      const ejemplos = {
        2: [[2, 3], [4, 5]],
        3: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
        4: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]
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
