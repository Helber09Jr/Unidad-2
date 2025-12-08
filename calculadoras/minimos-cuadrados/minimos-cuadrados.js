const App = {
  estado: {
    puntos: [],
    resultado: null
  },

  iniciar() {
    this.renderizarTabla();
    this.actualizarEncabezados();
    this.vincularEventos();
  },

  vincularEventos() {
    document.getElementById('btnAgregarFila').onclick = () => this.agregarFila();
    document.getElementById('btnLimpiarTodo').onclick = () => this.limpiarTodo();
    document.getElementById('btnCalcular').onclick = () => this.calcular();
    document.getElementById('btnEjemplo').onclick = () => this.cargarEjemplo();
    document.getElementById('btnTogglePasos').onclick = () => this.alternarPasos();
    document.getElementById('botonMenu').onclick = () => this.alternarMenu();

    document.getElementById('nombreEjeX').oninput = () => this.actualizarEncabezados();
    document.getElementById('nombreEjeY').oninput = () => this.actualizarEncabezados();
  },

  agregarFila(x = '', y = '') {
    const tbody = document.getElementById('cuerpoTablaPuntos');
    const indice = tbody.children.length;
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${indice}</td>
      <td><input type="number" step="any" class="input-x" value="${x}"></td>
      <td><input type="number" step="any" class="input-y" value="${y}"></td>
      <td><button class="boton-eliminar">X</button></td>
    `;

    fila.querySelector('.input-x').oninput = () => this.leerPuntos();
    fila.querySelector('.input-y').oninput = () => this.leerPuntos();

    fila.querySelector('.boton-eliminar').onclick = () => {
      fila.remove();
      this.actualizarIndices();
    };

    tbody.appendChild(fila);
  },

  actualizarIndices() {
    const filas = document.querySelectorAll('#cuerpoTablaPuntos tr');
    filas.forEach((fila, i) => {
      fila.cells[0].textContent = i;
    });
  },

  renderizarTabla() {
    const tbody = document.getElementById('cuerpoTablaPuntos');
    tbody.innerHTML = '';

    for (let i = 0; i < 4; i++) {
      this.agregarFila();
    }
  },

  actualizarEncabezados() {
    const nombreX = document.getElementById('nombreEjeX').value || 'x';
    const nombreY = document.getElementById('nombreEjeY').value || 'y';

    document.querySelector('.encabezado-x').textContent = nombreX;
    document.querySelector('.encabezado-y').textContent = nombreY;
  },

  limpiarTodo() {
    if (confirm('Estas seguro de limpiar todos los datos?')) {
      this.estado.puntos = [];
      this.estado.resultado = null;
      this.renderizarTabla();
      document.getElementById('contenedorResultado').innerHTML = '';
      document.getElementById('contenedorDesarrollo').innerHTML = '';
      document.getElementById('graficoMinimos').innerHTML = '';
      document.getElementById('tituloExperimento').value = '';
      document.getElementById('nombreEjeX').value = 'x';
      document.getElementById('nombreEjeY').value = 'y';
      document.getElementById('inputXEvaluar').value = '25';
      document.getElementById('selectGrado').value = '2';
      this.actualizarEncabezados();

      const seccion = document.getElementById('seccionDesarrollo');
      if (!seccion.classList.contains('oculto')) {
        seccion.classList.add('oculto');
        seccion.setAttribute('aria-hidden', 'true');
        document.getElementById('btnTogglePasos').textContent = 'Abrir desarrollo';
      }

      Notificaciones.exito('Todos los datos han sido limpiados correctamente');
    }
  },

  leerPuntos() {
    const filas = document.querySelectorAll('#cuerpoTablaPuntos tr');
    this.estado.puntos = [];

    filas.forEach(fila => {
      const inputX = fila.querySelector('.input-x');
      const inputY = fila.querySelector('.input-y');
      const x = parseFloat(inputX.value);
      const y = parseFloat(inputY.value);

      this.estado.puntos.push({ x: isNaN(x) ? null : x, y: isNaN(y) ? null : y });
    });
  },

  quitarValidacionVisual() {
    document.querySelectorAll('.input-x, .input-y').forEach(input => {
      input.classList.remove('campo-invalido');
    });
  },

  validar() {
    this.leerPuntos();
    this.quitarValidacionVisual();

    const puntosValidos = this.estado.puntos.filter(p => p.x !== null && p.y !== null);

    if (puntosValidos.length < 2) {
      Notificaciones.error('Se necesitan al menos 2 puntos validos');
      return false;
    }

    const filas = document.querySelectorAll('#cuerpoTablaPuntos tr');
    filas.forEach((fila, i) => {
      const inputX = fila.querySelector('.input-x');
      const inputY = fila.querySelector('.input-y');
      const punto = this.estado.puntos[i];

      if (!punto) return;

      if (punto.x === null || isNaN(punto.x)) {
        inputX.classList.add('campo-invalido');
      }

      if (punto.y === null || isNaN(punto.y)) {
        inputY.classList.add('campo-invalido');
      }
    });

    return puntosValidos;
  },

  calcular() {
    const puntosValidos = this.validar();
    if (!puntosValidos) return;

    const puntos = puntosValidos.sort((a, b) => a.x - b.x);
    const grado = parseInt(document.getElementById('selectGrado').value);
    const xEval = parseFloat(document.getElementById('inputXEvaluar').value);

    if (isNaN(xEval)) {
      Notificaciones.error('Ingrese un valor valido para x');
      return;
    }

    if (grado >= puntos.length) {
      Notificaciones.error(`Para grado ${grado} se necesitan al menos ${grado + 1} puntos`);
      return;
    }

    try {
      const A = this.construirMatrizA(puntos, grado);
      const At = this.transponer(A);
      const M = this.multiplicarMatrices(At, A);
      const y = puntos.map(p => [p.y]);
      const b = this.multiplicarMatrices(At, y);
      const coeficientes = this.resolverSistema(M, b);
      const resultado = this.evaluarPolinomio(coeficientes, xEval);
      const errorCuadratico = this.calcularError(puntos, coeficientes);

      this.estado.resultado = {
        puntos,
        grado,
        xEval,
        A,
        At,
        M,
        b,
        coeficientes,
        resultado,
        errorCuadratico
      };

      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.graficar();

      Notificaciones.exito(`Ajuste calculado correctamente: P(${xEval}) = ${this.formatear(resultado)}`);

    } catch (error) {
      Notificaciones.error('Error: ' + error.message);
    }
  },

  construirMatrizA(puntos, grado) {
    const n = puntos.length;
    const A = [];

    for (let i = 0; i < n; i++) {
      A[i] = [];
      for (let j = 0; j <= grado; j++) {
        A[i][j] = Math.pow(puntos[i].x, j);
      }
    }

    return A;
  },

  transponer(matriz) {
    const filas = matriz.length;
    const cols = matriz[0].length;
    const resultado = [];

    for (let j = 0; j < cols; j++) {
      resultado[j] = [];
      for (let i = 0; i < filas; i++) {
        resultado[j][i] = matriz[i][j];
      }
    }

    return resultado;
  },

  multiplicarMatrices(A, B) {
    const filasA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;
    const resultado = [];

    for (let i = 0; i < filasA; i++) {
      resultado[i] = [];
      for (let j = 0; j < colsB; j++) {
        let suma = 0;
        for (let k = 0; k < colsA; k++) {
          suma += A[i][k] * B[k][j];
        }
        resultado[i][j] = suma;
      }
    }

    return resultado;
  },

  resolverSistema(M, b) {
    const n = M.length;
    const A = M.map((fila, i) => [...fila, b[i][0]]);

    for (let i = 0; i < n; i++) {
      let maxFila = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k][i]) > Math.abs(A[maxFila][i])) {
          maxFila = k;
        }
      }

      [A[i], A[maxFila]] = [A[maxFila], A[i]];

      for (let k = i + 1; k < n; k++) {
        const factor = A[k][i] / A[i][i];
        for (let j = i; j <= n; j++) {
          A[k][j] -= factor * A[i][j];
        }
      }
    }

    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = A[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= A[i][j] * x[j];
      }
      x[i] /= A[i][i];
    }

    return x;
  },

  evaluarPolinomio(coeficientes, x) {
    let resultado = 0;
    for (let i = 0; i < coeficientes.length; i++) {
      resultado += coeficientes[i] * Math.pow(x, i);
    }
    return resultado;
  },

  calcularError(puntos, coeficientes) {
    let error = 0;
    for (let i = 0; i < puntos.length; i++) {
      const yCalculado = this.evaluarPolinomio(coeficientes, puntos[i].x);
      const diferencia = puntos[i].y - yCalculado;
      error += diferencia * diferencia;
    }
    return error;
  },

  formatear(numero) {
    if (Number.isInteger(numero)) {
      return numero.toString();
    }
    return parseFloat(numero.toFixed(6)).toString();
  },

  mostrarResultado() {
    const r = this.estado.resultado;
    if (!r) return;

    let polinomioLatex = '';
    for (let i = 0; i < r.coeficientes.length; i++) {
      if (i > 0 && r.coeficientes[i] >= 0) polinomioLatex += ' + ';
      if (i > 0 && r.coeficientes[i] < 0) polinomioLatex += ' ';

      if (i === 0) {
        polinomioLatex += this.formatear(r.coeficientes[i]);
      } else if (i === 1) {
        polinomioLatex += `${this.formatear(r.coeficientes[i])}x`;
      } else {
        polinomioLatex += `${this.formatear(r.coeficientes[i])}x^{${i}}`;
      }
    }

    let coeficientesLatex = '';
    r.coeficientes.forEach((coef, i) => {
      coeficientesLatex += `$$a_{${i}} = ${this.formatear(coef)}$$`;
    });

    let html = `
      <div class="resultado-principal">
        ${coeficientesLatex}
        <div style="margin-top: 10px; padding-top: 10px; border-top: 2px solid #e5e7eb;">
          $$P(x) = ${polinomioLatex}$$
        </div>
      </div>
      <div class="resultado-evaluacion">
        <p class="etiqueta-resultado">Evaluacion en x = ${this.formatear(r.xEval)}:</p>
        <p class="valor-resultado">$$P(${this.formatear(r.xEval)}) = ${this.formatear(r.resultado)}$$</p>
      </div>
      <div class="resultado-error">
        <p class="etiqueta-resultado">Error cuadratico total:</p>
        <p class="valor-error">$$E = ${this.formatear(r.errorCuadratico)}$$</p>
      </div>
    `;

    document.getElementById('contenedorResultado').innerHTML = html;

    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  },

  calcularSumas(puntos, grado) {
    const sumas = {};
    const n = puntos.length;

    sumas.n = n;

    for (let k = 0; k <= grado * 2; k++) {
      sumas[`x${k}`] = puntos.reduce((sum, p) => sum + Math.pow(p.x, k), 0);
    }

    sumas.y = puntos.reduce((sum, p) => sum + p.y, 0);

    for (let k = 1; k <= grado; k++) {
      sumas[`x${k}y`] = puntos.reduce((sum, p) => sum + Math.pow(p.x, k) * p.y, 0);
    }

    return sumas;
  },

  mostrarDesarrollo() {
    const r = this.estado.resultado;
    if (!r) return;

    const nombreX = document.getElementById('nombreEjeX').value || 'x';
    const nombreY = document.getElementById('nombreEjeY').value || 'y';
    const sumas = this.calcularSumas(r.puntos, r.grado);

    let latex = `
      <div class="paso-desarrollo">
        <h4>Paso 1: Sumas necesarias</h4>
        <p>$$n = ${sumas.n}$$</p>
    `;

    for (let k = 1; k <= r.grado * 2; k++) {
      let sumandos = r.puntos.map(p => {
        const val = Math.pow(p.x, k);
        return k === 1 ? this.formatear(p.x) : `${this.formatear(p.x)}^{${k}}`;
      }).join(' + ');

      let resultado = r.puntos.reduce((sum, p) => sum + Math.pow(p.x, k), 0);

      latex += `<p>$$\\sum ${nombreX}_i${k > 1 ? `^{${k}}` : ''} = ${sumandos} = ${this.formatear(resultado)}$$</p>`;
    }

    let sumandosY = r.puntos.map(p => this.formatear(p.y)).join(' + ');
    latex += `<p>$$\\sum ${nombreY}_i = ${sumandosY} = ${this.formatear(sumas.y)}$$</p>`;

    for (let k = 1; k <= r.grado; k++) {
      let sumandos = r.puntos.map(p => {
        const xPart = k === 1 ? this.formatear(p.x) : `${this.formatear(p.x)}^{${k}}`;
        return `${xPart} \\cdot ${this.formatear(p.y)}`;
      }).join(' + ');

      let resultado = r.puntos.reduce((sum, p) => sum + Math.pow(p.x, k) * p.y, 0);
      latex += `<p>$$\\sum ${nombreX}_i${k > 1 ? `^{${k}}` : ''}${nombreY}_i = ${sumandos} = ${this.formatear(resultado)}$$</p>`;
    }

    latex += `</div>`;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 2: Ecuaciones normales</h4>
    `;

    for (let i = 0; i <= r.grado; i++) {
      let ecuacion = '';
      for (let j = 0; j <= r.grado; j++) {
        if (j > 0) ecuacion += ' + ';
        let suma_x = i + j;
        if (suma_x === 0) {
          ecuacion += `na_{${j}}`;
        } else {
          ecuacion += `\\left(\\sum ${nombreX}_i${suma_x > 1 ? `^{${suma_x}}` : ''}\\right)a_{${j}}`;
        }
      }

      let lado_derecho = i === 0 ? `\\sum ${nombreY}_i` : `\\sum ${nombreX}_i${i > 1 ? `^{${i}}` : ''}${nombreY}_i`;
      latex += `<p>$$${ecuacion} = ${lado_derecho}$$</p>`;
    }

    latex += `<h4 style="margin-top: 16px;">Sistema con valores:</h4>`;

    for (let i = 0; i <= r.grado; i++) {
      let ecuacion = '';
      for (let j = 0; j <= r.grado; j++) {
        if (j > 0 && r.M[i][j] >= 0) ecuacion += ' + ';
        else if (j > 0) ecuacion += ' ';
        ecuacion += `${this.formatear(r.M[i][j])}a_{${j}}`;
      }
      latex += `<p>$$${ecuacion} = ${this.formatear(r.b[i][0])}$$</p>`;
    }

    latex += `</div>`;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 3: Matriz aumentada</h4>
        <div class="matriz-container">
          <table class="tabla-matriz">
    `;

    const A_original = r.M.map((fila, i) => [...fila, r.b[i][0]]);

    for (let i = 0; i <= r.grado; i++) {
      latex += `<tr>`;
      A_original[i].forEach((val, j) => {
        if (j === r.grado + 1) {
          latex += `<td style="border-left: 3px solid #475569;">${this.formatear(val)}</td>`;
        } else {
          latex += `<td>${this.formatear(val)}</td>`;
        }
      });
      latex += `</tr>`;
    }

    latex += `</table></div><h4 style="margin-top: 16px;">Solucion:</h4>`;

    r.coeficientes.forEach((coef, i) => {
      latex += `<p>$$a_{${i}} = ${this.formatear(coef)}$$</p>`;
    });

    latex += `</div>`;

    let polinomio = '';
    for (let i = 0; i < r.coeficientes.length; i++) {
      if (i > 0 && r.coeficientes[i] >= 0) polinomio += ' + ';
      if (i > 0 && r.coeficientes[i] < 0) polinomio += ' ';

      if (i === 0) {
        polinomio += this.formatear(r.coeficientes[i]);
      } else if (i === 1) {
        polinomio += `${this.formatear(r.coeficientes[i])}x`;
      } else {
        polinomio += `${this.formatear(r.coeficientes[i])}x^{${i}}`;
      }
    }

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 4: Polinomio</h4>
        <p>$$P(x) = ${polinomio}$$</p>
      </div>
    `;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 5: Error cuadratico</h4>
        <p>$$E = \\sum_{i=0}^{${r.puntos.length-1}} \\left[${nombreY}_i - P(${nombreX}_i)\\right]^2$$</p>
    `;

    r.puntos.forEach((p, i) => {
      const yCalc = this.evaluarPolinomio(r.coeficientes, p.x);
      const error = p.y - yCalc;
      latex += `<p>$$e_{${i}} = ${this.formatear(p.y)} - ${this.formatear(yCalc)} = ${this.formatear(error)}$$</p>`;
    });

    latex += `<p style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;"><strong>$$E = ${this.formatear(r.errorCuadratico)}$$</strong></p></div>`;

    latex += `
      <div class="resultado-final">
        <strong>Resultado Final:</strong>
        <p>$$P(${this.formatear(r.xEval)}) = ${this.formatear(r.resultado)}$$</p>
      </div>
    `;

    document.getElementById('contenedorDesarrollo').innerHTML = latex;

    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  },

  graficar() {
    const r = this.estado.resultado;
    if (!r) return;

    const xs = r.puntos.map(p => p.x);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const rango = xMax - xMin;
    const inicio = xMin - rango * 0.1;
    const fin = xMax + rango * 0.1;

    const puntosPolinomio = [];
    const numPuntos = 200;
    const paso = (fin - inicio) / numPuntos;

    for (let i = 0; i <= numPuntos; i++) {
      const x = inicio + i * paso;
      const y = this.evaluarPolinomio(r.coeficientes, x);
      puntosPolinomio.push({ x, y });
    }

    const traza1 = {
      x: puntosPolinomio.map(p => p.x),
      y: puntosPolinomio.map(p => p.y),
      mode: 'lines',
      name: 'Ajuste P(x)',
      line: { color: '#1e40af', width: 3 }
    };

    const traza2 = {
      x: r.puntos.map(p => p.x),
      y: r.puntos.map(p => p.y),
      mode: 'markers',
      name: 'Datos',
      marker: {
        color: '#dc2626',
        size: 12,
        symbol: 'circle',
        line: { color: 'white', width: 2 }
      }
    };

    const traza3 = {
      x: [r.xEval],
      y: [r.resultado],
      mode: 'markers',
      name: `P(${this.formatear(r.xEval)})`,
      marker: {
        color: '#10b981',
        size: 14,
        symbol: 'diamond',
        line: { color: 'white', width: 2 }
      }
    };

    const titulo = document.getElementById('tituloExperimento').value || 'Ajuste Polinomial - Minimos Cuadrados';
    const nombreX = document.getElementById('nombreEjeX').value || 'x';
    const nombreY = document.getElementById('nombreEjeY').value || 'y';

    const layout = {
      title: {
        text: titulo,
        font: { size: 18, color: '#1e293b', family: 'Inter, system-ui, sans-serif' }
      },
      xaxis: {
        title: { text: nombreX, font: { size: 14, color: '#475569' } },
        gridcolor: '#e2e8f0',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#94a3b8',
        zerolinewidth: 1
      },
      yaxis: {
        title: { text: nombreY, font: { size: 14, color: '#475569' } },
        gridcolor: '#e2e8f0',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#94a3b8',
        zerolinewidth: 1
      },
      plot_bgcolor: '#ffffff',
      paper_bgcolor: '#ffffff',
      showlegend: true,
      legend: {
        x: 1,
        y: 1,
        xanchor: 'right',
        yanchor: 'top',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        bordercolor: '#cbd5e1',
        borderwidth: 1,
        font: { size: 12 }
      },
      margin: { l: 70, r: 40, t: 80, b: 60 },
      hovermode: 'closest',
      shapes: [{
        type: 'line',
        x0: r.xEval,
        x1: r.xEval,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: {
          color: '#10b981',
          width: 2,
          dash: 'dash'
        }
      }],
      annotations: [{
        x: r.xEval,
        y: 1,
        yref: 'paper',
        text: `x = ${this.formatear(r.xEval)}`,
        showarrow: false,
        yanchor: 'bottom',
        font: {
          size: 11,
          color: '#10b981',
          family: 'Inter, system-ui, sans-serif'
        },
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        borderpad: 3
      }]
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false
    };

    Plotly.newPlot('graficoMinimos', [traza1, traza2, traza3], layout, config);
  },

  alternarPasos() {
    if (!this.estado.resultado) {
      Notificaciones.error('Primero calcula el ajuste');
      return;
    }

    const seccion = document.getElementById('seccionDesarrollo');
    const boton = document.getElementById('btnTogglePasos');

    if (seccion.classList.contains('oculto')) {
      seccion.classList.remove('oculto');
      seccion.setAttribute('aria-hidden', 'false');
      boton.textContent = 'Ocultar desarrollo';
    } else {
      seccion.classList.add('oculto');
      seccion.setAttribute('aria-hidden', 'true');
      boton.textContent = 'Abrir desarrollo';
    }
  },

  alternarMenu() {
    const menu = document.getElementById('menuNavegacion');
    menu.classList.toggle('menu-activo');
  },

  cargarEjemplo() {
    document.getElementById('tituloExperimento').value = 'Velocidad vs Distancia de Frenado';
    document.getElementById('nombreEjeX').value = 'Velocidad (m/s)';
    document.getElementById('nombreEjeY').value = 'Distancia (m)';
    document.getElementById('inputXEvaluar').value = '25';
    document.getElementById('selectGrado').value = '2';

    this.actualizarEncabezados();

    const tbody = document.getElementById('cuerpoTablaPuntos');
    tbody.innerHTML = '';

    const ejemploPuntos = [
      { x: 10, y: 6 },
      { x: 20, y: 25 },
      { x: 30, y: 60 },
      { x: 40, y: 110 }
    ];

    ejemploPuntos.forEach(p => {
      this.agregarFila(p.x, p.y);
    });

    Notificaciones.exito('Ejemplo cargado correctamente');
  }
};

document.addEventListener('DOMContentLoaded', () => App.iniciar());
