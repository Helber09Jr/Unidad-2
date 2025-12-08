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
      this.renumerarFilas();
      this.leerPuntos();
    };

    fila.querySelector('.input-x').oninput = () => this.leerPuntos();
    fila.querySelector('.input-y').oninput = () => this.leerPuntos();

    tbody.appendChild(fila);
    this.leerPuntos();
  },

  renumerarFilas() {
    const filas = document.querySelectorAll('#cuerpoTablaPuntos tr');
    filas.forEach((fila, i) => {
      fila.firstElementChild.textContent = i;
    });
  },

  renderizarTabla() {
    const tbody = document.getElementById('cuerpoTablaPuntos');
    tbody.innerHTML = '';

    if (this.estado.puntos.length === 0) {
      this.agregarFila('1', '6.5');
      this.agregarFila('2', '13');
      this.agregarFila('3', '19.5');
      this.agregarFila('4', '26');
    } else {
      this.estado.puntos.forEach(p => {
        this.agregarFila(p.x !== null ? p.x : '', p.y !== null ? p.y : '');
      });
    }
  },

  leerPuntos() {
    const filas = document.querySelectorAll('#cuerpoTablaPuntos tr');
    this.estado.puntos = [];

    filas.forEach(fila => {
      const x = fila.querySelector('.input-x').value.trim();
      const y = fila.querySelector('.input-y').value.trim();

      if (x !== '' || y !== '') {
        this.estado.puntos.push({
          x: x !== '' ? parseFloat(x) : null,
          y: y !== '' ? parseFloat(y) : null
        });
      }
    });
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
      document.getElementById('graficoLagrange').innerHTML = '';
      document.getElementById('tituloExperimento').value = '';
      document.getElementById('nombreEjeX').value = 'x';
      document.getElementById('nombreEjeY').value = 'y';
      document.getElementById('inputXEvaluar').value = '3';
      this.actualizarEncabezados();

      const seccion = document.getElementById('seccionDesarrollo');
      if (!seccion.classList.contains('oculto')) {
        seccion.classList.add('oculto');
        seccion.setAttribute('aria-hidden', 'true');
        document.getElementById('btnTogglePasos').textContent = 'Abrir desarrollo';
      }

      Notificaciones.exito('Datos limpiados correctamente');
    }
  },

  quitarValidacionVisual() {
    document.querySelectorAll('.input-x, .input-y').forEach(input => {
      input.classList.remove('campo-invalido');
    });
  },

  validar() {
    this.leerPuntos();
    this.quitarValidacionVisual();

    const puntosValidos = this.estado.puntos.filter(p =>
      p.x !== null && !isNaN(p.x) && p.y !== null && !isNaN(p.y)
    );

    if (puntosValidos.length < 2) {
      throw new Error('Se necesitan al menos 2 puntos válidos');
    }

    const valoresX = puntosValidos.map(p => p.x);
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

      const duplicados = valoresX.filter(x => x === punto.x).length > 1;
      if (duplicados && !isNaN(punto.x) && punto.x !== null) {
        inputX.classList.add('campo-invalido');
        throw new Error(`Valor X duplicado: ${punto.x}`);
      }
    });

    return puntosValidos;
  },

  calcular() {
    try {
      const puntos = this.validar();
      const xEval = parseFloat(document.getElementById('inputXEvaluar').value);

      if (isNaN(xEval)) {
        throw new Error('El valor de x a evaluar debe ser un número válido');
      }

      Notificaciones.calcular('Calculando interpolación...');

      const n = puntos.length;
      const contribuciones = [];
      let resultado = 0;
      let acumulado = 0;

      for (let i = 0; i < n; i++) {
        let numerador = 1;
        let denominador = 1;
        const factoresNum = [];
        const factoresDen = [];

        for (let j = 0; j < n; j++) {
          if (j !== i) {
            const factorNum = xEval - puntos[j].x;
            const factorDen = puntos[i].x - puntos[j].x;

            numerador *= factorNum;
            denominador *= factorDen;

            factoresNum.push({ xj: puntos[j].x, valor: factorNum });
            factoresDen.push({ xj: puntos[j].x, valor: factorDen });
          }
        }

        const Li = numerador / denominador;
        const contrib = puntos[i].y * Li;
        acumulado += contrib;

        contribuciones.push({
          i,
          xi: puntos[i].x,
          yi: puntos[i].y,
          Li,
          factoresNum,
          factoresDen,
          numerador,
          denominador,
          contribucion: contrib,
          acumulado
        });

        resultado += contrib;
      }

      this.estado.resultado = {
        puntos,
        xEval,
        contribuciones,
        resultado
      };

      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.graficar();

      Notificaciones.exito(`P(${this.formatear(xEval)}) = ${this.formatear(resultado)}`);

    } catch (error) {
      Notificaciones.error('Error: ' + error.message);
    }
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
      <table class="tabla-resultados">
        <thead>
          <tr>
            <th>i</th>
            <th>${nombreX}</th>
            <th>${nombreY}</th>
            <th>L<sub>i</sub>(x)</th>
            <th>y<sub>i</sub> · L<sub>i</sub>(x)</th>
            <th>Acumulado</th>
          </tr>
        </thead>
        <tbody>
    `;

    r.contribuciones.forEach(c => {
      html += `
        <tr>
          <td>${c.i}</td>
          <td>${this.formatear(c.xi)}</td>
          <td>${this.formatear(c.yi)}</td>
          <td>${this.formatear(c.Li)}</td>
          <td>${this.formatear(c.contribucion)}</td>
          <td>${this.formatear(c.acumulado)}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    document.getElementById('contenedorResultado').innerHTML = html;
  },

  mostrarDesarrollo() {
    const r = this.estado.resultado;
    if (!r) return;

    const nombreX = document.getElementById('nombreEjeX').value || 'x';
    const nombreY = document.getElementById('nombreEjeY').value || 'y';

    let latex = `
      <div class="paso-desarrollo">
        <h4>Paso 1: Fórmula General de Lagrange</h4>
        <p>$$P(x) = \\sum_{i=0}^{n} y_i \\cdot L_i(x)$$</p>
        <p>Donde:</p>
        <p>$$L_i(x) = \\prod_{\\substack{j=0\\\\j \\neq i}}^{n} \\frac{x - x_j}{x_i - x_j}$$</p>
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
        <h4>Paso 3: Cálculo de Coeficientes L<sub>i</sub>(${this.formatear(r.xEval)})</h4>
    `;

    r.contribuciones.forEach(c => {
      latex += `<p class="linea-calculo">$$L_{${c.i}}(${this.formatear(r.xEval)}) = \\frac{`;

      c.factoresNum.forEach((f, idx) => {
        if (idx > 0) latex += ' \\cdot ';
        latex += `(${this.formatear(r.xEval)} - ${this.formatear(f.xj)})`;
      });
      latex += '}{';
      c.factoresDen.forEach((f, idx) => {
        if (idx > 0) latex += ' \\cdot ';
        latex += `(${this.formatear(c.xi)} - ${this.formatear(f.xj)})`;
      });

      latex += '} = \\frac{';
      c.factoresNum.forEach((f, idx) => {
        if (idx > 0) latex += ' \\times ';
        latex += this.formatear(f.valor);
      });
      latex += '}{';
      c.factoresDen.forEach((f, idx) => {
        if (idx > 0) latex += ' \\times ';
        latex += this.formatear(f.valor);
      });

      latex += `} = ${this.formatear(c.Li)}$$</p>`;
    });

    latex += `</div>`;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 4: Suma de Contribuciones</h4>
        <p>$$P(${this.formatear(r.xEval)}) = \\sum_{i=0}^{${r.contribuciones.length - 1}} y_i L_i(${this.formatear(r.xEval)})$$</p>
    `;

    r.contribuciones.forEach(c => {
      latex += `<p class="linea-calculo">$$y_{${c.i}} \\cdot L_{${c.i}}(${this.formatear(r.xEval)}) = ${this.formatear(c.yi)} \\times ${this.formatear(c.Li)} = ${this.formatear(c.contribucion)}$$</p>`;
    });

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
      let y = 0;

      for (let j = 0; j < r.puntos.length; j++) {
        let Li = 1;
        for (let k = 0; k < r.puntos.length; k++) {
          if (k !== j) {
            Li *= (x - r.puntos[k].x) / (r.puntos[j].x - r.puntos[k].x);
          }
        }
        y += r.puntos[j].y * Li;
      }

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

    const titulo = document.getElementById('tituloExperimento').value || 'Interpolación de Lagrange';
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

    Plotly.newPlot('graficoLagrange', [traza1, traza2, traza3], layout, config);
  },

  alternarPasos() {
    if (!this.estado.resultado) {
      Notificaciones.info('Primero calcula la interpolación');
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
    document.getElementById('tituloExperimento').value = 'Ejemplo: Enfriamiento de un líquido';
    document.getElementById('nombreEjeX').value = 'Tiempo (min)';
    document.getElementById('nombreEjeY').value = 'Temperatura (°C)';
    document.getElementById('inputXEvaluar').value = '7';

    this.estado.puntos = [
      { x: 0, y: 90 },
      { x: 5, y: 70 },
      { x: 10, y: 55 }
    ];

    this.renderizarTabla();
    this.actualizarEncabezados();

    Notificaciones.exito('Ejemplo cargado correctamente');
  }
};


document.addEventListener('DOMContentLoaded', () => {
  App.iniciar();
});
