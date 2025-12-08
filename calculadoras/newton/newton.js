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
    if (confirm('¿Estás seguro de limpiar todos los datos?')) {
      this.estado.puntos = [];
      this.estado.resultado = null;
      this.renderizarTabla();
      document.getElementById('contenedorResultado').innerHTML = '';
      document.getElementById('contenedorDesarrollo').innerHTML = '';
      document.getElementById('graficoNewton').innerHTML = '';
      document.getElementById('tituloExperimento').value = '';
      document.getElementById('nombreEjeX').value = 'x';
      document.getElementById('nombreEjeY').value = 'y';
      document.getElementById('inputXEvaluar').value = '2.5';
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
      Notificaciones.error('Se necesitan al menos 2 puntos válidos');
      return false;
    }

    const xs = puntosValidos.map(p => p.x);
    const xsUnicos = new Set(xs);
    if (xs.length !== xsUnicos.size) {
      Notificaciones.error('No puede haber valores de x repetidos');
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
    const xEval = parseFloat(document.getElementById('inputXEvaluar').value);

    if (isNaN(xEval)) {
      Notificaciones.error('Ingrese un valor válido para x');
      return;
    }

    try {
      const tabla = this.calcularDiferenciasDivididas(puntos);
      const coeficientes = tabla[0];
      const resultado = this.evaluarNewton(coeficientes, puntos.map(p => p.x), xEval);

      this.estado.resultado = {
        puntos,
        xEval,
        tabla,
        coeficientes,
        resultado
      };

      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.graficar();

      Notificaciones.exito(`Interpolación calculada correctamente: P(${xEval}) = ${this.formatear(resultado)}`);

    } catch (error) {
      Notificaciones.error('Error: ' + error.message);
    }
  },

  calcularDiferenciasDivididas(puntos) {
    const n = puntos.length;
    const tabla = Array(n).fill(null).map(() => Array(n).fill(null));

    for (let i = 0; i < n; i++) {
      tabla[i][0] = puntos[i].y;
    }

    for (let j = 1; j < n; j++) {
      for (let i = 0; i < n - j; i++) {
        tabla[i][j] = (tabla[i + 1][j - 1] - tabla[i][j - 1]) / (puntos[i + j].x - puntos[i].x);
      }
    }

    return tabla;
  },

  evaluarNewton(coeficientes, xs, xEval) {
    const n = coeficientes.length;
    let P = coeficientes[n - 1];

    for (let k = n - 2; k >= 0; k--) {
      P = P * (xEval - xs[k]) + coeficientes[k];
    }

    return P;
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

    const nombreX = document.getElementById('nombreEjeX').value || 'x';
    const nombreY = document.getElementById('nombreEjeY').value || 'y';

    let html = `
      <div class="resultado-principal">
        <p class="etiqueta-resultado">Valor interpolado:</p>
        <p class="valor-resultado">P(${this.formatear(r.xEval)}) = ${this.formatear(r.resultado)}</p>
      </div>
    `;

    document.getElementById('contenedorResultado').innerHTML = html;
  },

  mostrarDesarrollo() {
    const r = this.estado.resultado;
    if (!r) return;

    const nombreX = document.getElementById('nombreEjeX').value || 'x';
    const nombreY = document.getElementById('nombreEjeY').value || 'y';

    let latex = `
      <div class="paso-desarrollo">
        <h4>Paso 1: Fórmula General de Newton</h4>
        <p>$$P(x) = a_0 + a_1(x-x_0) + a_2(x-x_0)(x-x_1) + \\ldots + a_n(x-x_0)(x-x_1)\\cdots(x-x_{n-1})$$</p>
        <p>Donde:</p>
        <p>$$a_i = \\text{Diferencia dividida de orden } i$$</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 2: Puntos Dados</h4>
        <table class="tabla-desarrollo">
          <thead>
            <tr>
              <th>i</th>
              <th>${nombreX}<sub>i</sub></th>
              <th>${nombreY}<sub>i</sub></th>
            </tr>
          </thead>
          <tbody>
    `;

    r.puntos.forEach((p, i) => {
      latex += `
        <tr>
          <td>${i}</td>
          <td>${this.formatear(p.x)}</td>
          <td>${this.formatear(p.y)}</td>
        </tr>
      `;
    });

    latex += `
          </tbody>
        </table>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 3: Tabla de Diferencias Divididas</h4>
        <table class="tabla-desarrollo">
          <thead>
            <tr>
              <th>i</th>
              <th>${nombreX}<sub>i</sub></th>
              <th>f[${nombreX}<sub>i</sub>]</th>
    `;

    for (let j = 1; j < r.puntos.length; j++) {
      let indices = '';
      for (let k = 0; k <= j; k++) {
        if (k > 0) indices += ',';
        indices += `${nombreX}<sub>${k}</sub>`;
      }
      latex += `<th>f[${indices}]</th>`;
    }

    latex += `
            </tr>
          </thead>
          <tbody>
    `;

    for (let i = 0; i < r.puntos.length; i++) {
      latex += `<tr><td>${i}</td><td>${this.formatear(r.puntos[i].x)}</td>`;

      for (let j = 0; j < r.puntos.length; j++) {
        if (r.tabla[i][j] !== null) {
          const esCoeficiente = (i === 0);
          const clase = esCoeficiente ? ' style="background: #fef3c7; font-weight: 700;"' : '';
          latex += `<td${clase}>${this.formatear(r.tabla[i][j])}</td>`;
        } else {
          latex += `<td></td>`;
        }
      }

      latex += `</tr>`;
    }

    latex += `
          </tbody>
        </table>
        <p style="margin-top: 10px; font-size: 0.9em; color: #64748b;">
          Los coeficientes a<sub>i</sub> están resaltados en amarillo (primera fila)
        </p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 4: Coeficientes del Polinomio</h4>
    `;

    r.coeficientes.forEach((a, i) => {
      latex += `<p class="linea-calculo">$$a_{${i}} = ${this.formatear(a)}$$</p>`;
    });

    latex += `</div>`;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 5: Evaluación en x = ${this.formatear(r.xEval)} (Esquema de Horner)</h4>
        <p>Evaluación anidada de atrás hacia adelante:</p>
    `;

    const n = r.coeficientes.length;
    const xs = r.puntos.map(p => p.x);
    let P = r.coeficientes[n - 1];

    latex += `<p class="linea-calculo">$$P = a_{${n-1}} = ${this.formatear(r.coeficientes[n-1])}$$</p>`;

    for (let k = n - 2; k >= 0; k--) {
      const Pant = P;
      P = P * (r.xEval - xs[k]) + r.coeficientes[k];
      latex += `<p class="linea-calculo">$$P = ${this.formatear(Pant)} \\times (${this.formatear(r.xEval)} - ${this.formatear(xs[k])}) + ${this.formatear(r.coeficientes[k])} = ${this.formatear(P)}$$</p>`;
    }

    latex += `</div>`;

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
      const y = this.evaluarNewton(r.coeficientes, xs, x);
      puntosPolinomio.push({ x, y });
    }

    const traza1 = {
      x: puntosPolinomio.map(p => p.x),
      y: puntosPolinomio.map(p => p.y),
      mode: 'lines',
      name: 'P(x)',
      line: { color: '#1e40af', width: 3 }
    };

    const traza2 = {
      x: r.puntos.map(p => p.x),
      y: r.puntos.map(p => p.y),
      mode: 'markers',
      name: 'Puntos',
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

    const titulo = document.getElementById('tituloExperimento').value || 'Interpolación de Newton';
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

    Plotly.newPlot('graficoNewton', [traza1, traza2, traza3], layout, config);
  },

  alternarPasos() {
    if (!this.estado.resultado) {
      Notificaciones.error('Primero calcula la interpolación');
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
    document.getElementById('tituloExperimento').value = 'Función cuadrática y = x²';
    document.getElementById('nombreEjeX').value = 'x';
    document.getElementById('nombreEjeY').value = 'y';
    document.getElementById('inputXEvaluar').value = '2.5';

    this.actualizarEncabezados();

    const tbody = document.getElementById('cuerpoTablaPuntos');
    tbody.innerHTML = '';

    const ejemploPuntos = [
      { x: 1, y: 1 },
      { x: 2, y: 4 },
      { x: 3, y: 9 },
      { x: 4, y: 16 }
    ];

    ejemploPuntos.forEach(p => {
      this.agregarFila(p.x, p.y);
    });

    Notificaciones.exito('Ejemplo cargado correctamente');
  }
};

document.addEventListener('DOMContentLoaded', () => App.iniciar());
