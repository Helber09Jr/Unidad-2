const App = {
  estado: {
    funcion: '',
    a: 0,
    b: 0,
    n: 0,
    resultado: null
  },

  iniciar() {
    this.vincularEventos();
    this.cargarEjemplo();
  },

  vincularEventos() {
    document.getElementById('btnCalcular').onclick = () => this.calcular();
    document.getElementById('btnEjemplo').onclick = () => this.cargarEjemplo();
    document.getElementById('btnTogglePasos').onclick = () => this.alternarPasos();
    document.getElementById('botonMenu').onclick = () => this.alternarMenu();

    document.getElementById('selectFuncion').onchange = (e) => {
      if (e.target.value) {
        document.getElementById('inputFuncion').value = e.target.value;
      }
    };

    const inputFuncion = document.getElementById('inputFuncion');
    const botonesCalc = document.querySelectorAll('.boton-calc');

    botonesCalc.forEach(boton => {
      boton.onclick = () => {
        const valor = boton.getAttribute('data-valor');
        const posicion = inputFuncion.selectionStart;
        const textoAntes = inputFuncion.value.substring(0, posicion);
        const textoDespues = inputFuncion.value.substring(posicion);
        inputFuncion.value = textoAntes + valor + textoDespues;
        inputFuncion.focus();
        inputFuncion.selectionStart = inputFuncion.selectionEnd = posicion + valor.length;
      };
    });
  },

  parsearFuncion(expresion) {
    return expresion
      .replace(/\s+/g, '')
      .replace(/pi/g, Math.PI.toString())
      .replace(/e(?![a-z])/g, Math.E.toString())
      .replace(/(\d)([a-z(])/g, '$1*$2')
      .replace(/([a-z)])(\d)/g, '$1*$2')
      .replace(/\)\(/g, ')*(')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/exp/g, 'Math.exp')
      .replace(/ln/g, 'Math.log')
      .replace(/log/g, 'Math.log10')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/\^/g, '**');
  },

  evaluarFuncion(expresion, x) {
    try {
      const expresionParseada = this.parsearFuncion(expresion);
      const expresionConX = expresionParseada.replace(/x/g, `(${x})`);
      return eval(expresionConX);
    } catch (error) {
      throw new Error('Error al evaluar la función');
    }
  },

  validar() {
    const funcion = document.getElementById('inputFuncion').value.trim();
    const a = parseFloat(document.getElementById('inputA').value);
    const b = parseFloat(document.getElementById('inputB').value);
    const n = parseInt(document.getElementById('inputN').value);

    if (!funcion) {
      throw new Error('Ingrese una función');
    }

    if (isNaN(a) || isNaN(b)) {
      throw new Error('Los límites de integración deben ser números válidos');
    }

    if (a >= b) {
      throw new Error('El límite inferior debe ser menor que el límite superior');
    }

    if (isNaN(n) || n < 1) {
      throw new Error('El número de subintervalos debe ser al menos 1');
    }

    try {
      this.evaluarFuncion(funcion, a);
    } catch (error) {
      throw new Error('La función ingresada no es válida');
    }

    return { funcion, a, b, n };
  },

  calcular() {
    try {
      const { funcion, a, b, n } = this.validar();

      const deltaX = (b - a) / n;
      const nodos = [];
      const evaluaciones = [];

      for (let i = 0; i <= n; i++) {
        const xi = a + i * deltaX;
        nodos.push(xi);
        evaluaciones.push(this.evaluarFuncion(funcion, xi));
      }

      const sumaExtremos = evaluaciones[0] + evaluaciones[n];
      let sumaInteriores = 0;
      for (let i = 1; i < n; i++) {
        sumaInteriores += evaluaciones[i];
      }

      const S = sumaExtremos + 2 * sumaInteriores;
      const T = (deltaX / 2) * S;

      this.estado.funcion = funcion;
      this.estado.a = a;
      this.estado.b = b;
      this.estado.n = n;
      this.estado.resultado = {
        deltaX,
        nodos,
        evaluaciones,
        sumaExtremos,
        sumaInteriores,
        S,
        T
      };

      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.graficar();

      Notificaciones.exito(`Integral calculada correctamente: I ≈ ${this.formatear(T)}`);

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

    const html = `
      <div class="resultado-principal">
        <p class="etiqueta-resultado">Valor aproximado de la integral:</p>
        <p class="valor-resultado">$$\\int_{${this.formatear(this.estado.a)}}^{${this.formatear(this.estado.b)}} f(x) \\, dx \\approx ${this.formatear(r.T)}$$</p>
      </div>
      <div class="resultado-detalles">
        <p>$$n = ${r.nodos.length - 1}$$ subintervalos</p>
        <p>$$\\Delta x = ${this.formatear(r.deltaX)}$$</p>
      </div>
    `;

    document.getElementById('contenedorResultado').innerHTML = html;

    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  },

  mostrarDesarrollo() {
    const r = this.estado.resultado;
    if (!r) return;

    let latex = `
      <div class="paso-desarrollo">
        <h4>Paso 1: Ancho del subintervalo</h4>
        <p>$$\\Delta x = \\frac{b - a}{n} = \\frac{${this.formatear(this.estado.b)} - ${this.formatear(this.estado.a)}}{${r.nodos.length - 1}} = ${this.formatear(r.deltaX)}$$</p>
      </div>
    `;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 2: Nodos</h4>
        <p>$$x_i = a + i \\Delta x, \\quad i = 0, 1, 2, \\ldots, ${r.nodos.length - 1}$$</p>
        <table class="tabla-desarrollo">
          <thead>
            <tr>
              <th>i</th>
              <th>x<sub>i</sub></th>
            </tr>
          </thead>
          <tbody>
    `;

    r.nodos.forEach((nodo, i) => {
      latex += `
        <tr>
          <td>${i}</td>
          <td>${this.formatear(nodo)}</td>
        </tr>
      `;
    });

    latex += `
          </tbody>
        </table>
      </div>
    `;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 3: Evaluaciones</h4>
        <p>$$f(x) = ${this.estado.funcion}$$</p>
        <table class="tabla-desarrollo">
          <thead>
            <tr>
              <th>i</th>
              <th>x<sub>i</sub></th>
              <th>f(x<sub>i</sub>)</th>
            </tr>
          </thead>
          <tbody>
    `;

    r.nodos.forEach((nodo, i) => {
      latex += `
        <tr>
          <td>${i}</td>
          <td>${this.formatear(nodo)}</td>
          <td>${this.formatear(r.evaluaciones[i])}</td>
        </tr>
      `;
    });

    latex += `
          </tbody>
        </table>
      </div>
    `;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 4: Suma</h4>
        <p><strong>Extremos:</strong></p>
        <p>$$f(x_0) + f(x_n) = ${this.formatear(r.evaluaciones[0])} + ${this.formatear(r.evaluaciones[r.nodos.length - 1])} = ${this.formatear(r.sumaExtremos)}$$</p>
    `;

    if (r.nodos.length > 2) {
      let sumatoriaInteriores = '';
      for (let i = 1; i < r.nodos.length - 1; i++) {
        if (i > 1) sumatoriaInteriores += ' + ';
        sumatoriaInteriores += this.formatear(r.evaluaciones[i]);
      }

      latex += `
        <p><strong>Interiores:</strong></p>
        <p>$$2\\left(${sumatoriaInteriores}\\right) = 2 \\times ${this.formatear(r.sumaInteriores)} = ${this.formatear(2 * r.sumaInteriores)}$$</p>
      `;
    }

    latex += `
      <p><strong>Suma total:</strong></p>
      <p>$$S = ${this.formatear(r.sumaExtremos)} + ${this.formatear(2 * r.sumaInteriores)} = ${this.formatear(r.S)}$$</p>
      </div>
    `;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 5: Fórmula del trapecio</h4>
        <p>$$T = \\frac{\\Delta x}{2} \\times S = \\frac{${this.formatear(r.deltaX)}}{2} \\times ${this.formatear(r.S)} = ${this.formatear(r.T)}$$</p>
      </div>
    `;

    latex += `
      <div class="resultado-final">
        <strong>Resultado Final:</strong>
        <p>$$\\int_{${this.formatear(this.estado.a)}}^{${this.formatear(this.estado.b)}} f(x) \\, dx \\approx ${this.formatear(r.T)}$$</p>
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

    const xMin = this.estado.a;
    const xMax = this.estado.b;
    const rango = xMax - xMin;

    const puntosFuncion = [];
    const numPuntos = 200;
    const paso = rango / numPuntos;

    for (let i = 0; i <= numPuntos; i++) {
      const x = xMin + i * paso;
      try {
        const y = this.evaluarFuncion(this.estado.funcion, x);
        if (isFinite(y)) {
          puntosFuncion.push({ x, y });
        }
      } catch (e) {
        continue;
      }
    }

    const trazaFuncion = {
      x: puntosFuncion.map(p => p.x),
      y: puntosFuncion.map(p => p.y),
      mode: 'lines',
      name: 'f(x)',
      line: { color: '#1e40af', width: 3 }
    };

    const trazaNodos = {
      x: r.nodos,
      y: r.evaluaciones,
      mode: 'markers',
      name: 'Nodos',
      marker: {
        color: '#dc2626',
        size: 10,
        symbol: 'circle',
        line: { color: 'white', width: 2 }
      }
    };

    const shapes = [];
    const annotations = [];

    for (let i = 0; i < r.nodos.length - 1; i++) {
      const x0 = r.nodos[i];
      const x1 = r.nodos[i + 1];
      const y0 = r.evaluaciones[i];
      const y1 = r.evaluaciones[i + 1];

      shapes.push({
        type: 'path',
        path: `M ${x0},0 L ${x0},${y0} L ${x1},${y1} L ${x1},0 Z`,
        fillcolor: 'rgba(30, 64, 175, 0.15)',
        line: { color: '#1e40af', width: 1 }
      });

      shapes.push({
        type: 'line',
        x0: x0,
        x1: x0,
        y0: 0,
        y1: y0,
        line: { color: '#94a3b8', width: 1, dash: 'dot' }
      });
    }

    shapes.push({
      type: 'line',
      x0: r.nodos[r.nodos.length - 1],
      x1: r.nodos[r.nodos.length - 1],
      y0: 0,
      y1: r.evaluaciones[r.evaluaciones.length - 1],
      line: { color: '#94a3b8', width: 1, dash: 'dot' }
    });

    const layout = {
      title: {
        text: `Método del Trapecio: ∫ ${this.estado.funcion} dx`,
        font: { size: 18, color: '#1e293b', family: 'Inter, system-ui, sans-serif' }
      },
      xaxis: {
        title: { text: 'x', font: { size: 14, color: '#475569' } },
        gridcolor: '#e2e8f0',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#94a3b8',
        zerolinewidth: 2
      },
      yaxis: {
        title: { text: 'f(x)', font: { size: 14, color: '#475569' } },
        gridcolor: '#e2e8f0',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#94a3b8',
        zerolinewidth: 2
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
      shapes: shapes,
      annotations: annotations
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false
    };

    Plotly.newPlot('graficoTrapecio', [trazaFuncion, trazaNodos], layout, config);
  },

  alternarPasos() {
    if (!this.estado.resultado) {
      Notificaciones.error('Primero calcula la integral');
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
    document.getElementById('selectFuncion').value = 'x^2';
    document.getElementById('inputFuncion').value = 'x^2';
    document.getElementById('inputA').value = '0';
    document.getElementById('inputB').value = '2';
    document.getElementById('inputN').value = '4';

    Notificaciones.exito('Ejemplo cargado correctamente');
  }
};

document.addEventListener('DOMContentLoaded', () => App.iniciar());
