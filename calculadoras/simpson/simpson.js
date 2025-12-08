const App = {
  estado: {
    funcion: '',
    a: 0,
    b: 0,
    n: 0,
    metodo: '1/3',
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

    document.getElementById('selectMetodo').onchange = () => this.verificarN();
    document.getElementById('inputN').oninput = () => this.verificarN();

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

  verificarN() {
    const metodo = document.getElementById('selectMetodo').value;
    const n = parseInt(document.getElementById('inputN').value);
    const advertencia = document.getElementById('advertenciaN');

    if (isNaN(n) || n < 2) {
      advertencia.classList.add('oculto');
      return;
    }

    if (metodo === '1/3' && n % 2 !== 0) {
      advertencia.classList.remove('oculto');
      advertencia.innerHTML = `
        <p>⚠️ Para Simpson 1/3, n debe ser par. Sugerencias:</p>
        <div class="botones-sugerencia">
          <button class="boton-ajuste" onclick="App.ajustarN(${n - 1})">n = ${n - 1}</button>
          <button class="boton-ajuste" onclick="App.ajustarN(${n + 1})">n = ${n + 1}</button>
        </div>
      `;
    } else if (metodo === '3/8' && n % 3 !== 0) {
      advertencia.classList.remove('oculto');
      const nAnterior = Math.floor(n / 3) * 3;
      const nSiguiente = Math.ceil(n / 3) * 3;
      advertencia.innerHTML = `
        <p>⚠️ Para Simpson 3/8, n debe ser múltiplo de 3. Sugerencias:</p>
        <div class="botones-sugerencia">
          ${nAnterior >= 3 ? `<button class="boton-ajuste" onclick="App.ajustarN(${nAnterior})">n = ${nAnterior}</button>` : ''}
          <button class="boton-ajuste" onclick="App.ajustarN(${nSiguiente})">n = ${nSiguiente}</button>
        </div>
      `;
    } else {
      advertencia.classList.add('oculto');
    }
  },

  ajustarN(nuevoN) {
    document.getElementById('inputN').value = nuevoN;
    this.verificarN();
  },

  validar() {
    const funcion = document.getElementById('inputFuncion').value.trim();
    const a = parseFloat(document.getElementById('inputA').value);
    const b = parseFloat(document.getElementById('inputB').value);
    const n = parseInt(document.getElementById('inputN').value);
    const metodo = document.getElementById('selectMetodo').value;

    if (!funcion) {
      throw new Error('Ingrese una función');
    }

    if (isNaN(a) || isNaN(b)) {
      throw new Error('Los límites de integración deben ser números válidos');
    }

    if (a >= b) {
      throw new Error('El límite inferior debe ser menor que el límite superior');
    }

    if (isNaN(n) || n < 2) {
      throw new Error('El número de subintervalos debe ser al menos 2');
    }

    if (metodo === '1/3' && n % 2 !== 0) {
      throw new Error('Para Simpson 1/3, n debe ser par');
    }

    if (metodo === '3/8' && n % 3 !== 0) {
      throw new Error('Para Simpson 3/8, n debe ser múltiplo de 3');
    }

    try {
      this.evaluarFuncion(funcion, a);
    } catch (error) {
      throw new Error('La función ingresada no es válida');
    }

    return { funcion, a, b, n, metodo };
  },

  calcular() {
    try {
      const { funcion, a, b, n, metodo } = this.validar();

      const h = (b - a) / n;
      const nodos = [];
      const evaluaciones = [];

      for (let i = 0; i <= n; i++) {
        const xi = a + i * h;
        nodos.push(xi);
        evaluaciones.push(this.evaluarFuncion(funcion, xi));
      }

      let resultado;
      if (metodo === '1/3') {
        resultado = this.calcularSimpson13(evaluaciones, h, n);
      } else {
        resultado = this.calcularSimpson38(evaluaciones, h, n);
      }

      this.estado.funcion = funcion;
      this.estado.a = a;
      this.estado.b = b;
      this.estado.n = n;
      this.estado.metodo = metodo;
      this.estado.resultado = {
        h,
        nodos,
        evaluaciones,
        ...resultado
      };

      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.graficar();

      Notificaciones.exito(`I ≈ ${this.formatear(resultado.I)}`);

    } catch (error) {
      Notificaciones.error('Error: ' + error.message);
    }
  },

  calcularSimpson13(evaluaciones, h, n) {
    const f0 = evaluaciones[0];
    const fn = evaluaciones[n];

    let sumaImpares = 0;
    for (let i = 1; i < n; i += 2) {
      sumaImpares += evaluaciones[i];
    }

    let sumaPares = 0;
    for (let i = 2; i < n; i += 2) {
      sumaPares += evaluaciones[i];
    }

    const S = f0 + 4 * sumaImpares + 2 * sumaPares + fn;
    const I = (h / 3) * S;

    return { I, f0, fn, sumaImpares, sumaPares, S };
  },

  calcularSimpson38(evaluaciones, h, n) {
    const f0 = evaluaciones[0];
    const fn = evaluaciones[n];

    let suma3coef = 0;
    for (let i = 1; i < n; i++) {
      if (i % 3 === 0) continue;
      suma3coef += evaluaciones[i];
    }

    let suma2coef = 0;
    for (let i = 3; i < n; i += 3) {
      suma2coef += evaluaciones[i];
    }

    const S = f0 + 3 * suma3coef + 2 * suma2coef + fn;
    const I = (3 * h / 8) * S;

    return { I, f0, fn, suma3coef, suma2coef, S };
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

    const nombreMetodo = this.estado.metodo === '1/3' ? 'Simpson 1/3' : 'Simpson 3/8';

    const html = `
      <div class="resultado-principal">
        <p class="etiqueta-resultado">Valor aproximado de la integral (${nombreMetodo}):</p>
        <p class="valor-resultado">$$\\int_{${this.formatear(this.estado.a)}}^{${this.formatear(this.estado.b)}} f(x) \\, dx \\approx ${this.formatear(r.I)}$$</p>
      </div>
      <div class="resultado-detalles">
        <p>$$n = ${this.estado.n}$$ subintervalos</p>
        <p>$$h = ${this.formatear(r.h)}$$</p>
      </div>
    `;

    document.getElementById('contenedorResultado').innerHTML = html;

    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  },

  mostrarDesarrollo() {
    if (this.estado.metodo === '1/3') {
      this.mostrarDesarrollo13();
    } else {
      this.mostrarDesarrollo38();
    }
  },

  mostrarDesarrollo13() {
    const r = this.estado.resultado;
    if (!r) return;

    let latex = `
      <div class="paso-desarrollo">
        <h4>Paso 1: Ancho del subintervalo</h4>
        <p>$$h = \\frac{b - a}{n} = \\frac{${this.formatear(this.estado.b)} - ${this.formatear(this.estado.a)}}{${this.estado.n}} = ${this.formatear(r.h)}$$</p>
      </div>
    `;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 2: Nodos</h4>
        <p>$$x_i = a + i h, \\quad i = 0, 1, 2, \\ldots, ${this.estado.n}$$</p>
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
        <h4>Paso 4: Suma con coeficientes</h4>
        <p><strong>Extremos:</strong></p>
        <p>$$f(x_0) = ${this.formatear(r.f0)}, \\quad f(x_n) = ${this.formatear(r.fn)}$$</p>
    `;

    if (this.estado.n >= 2) {
      let sumatoriaImpares = '';
      for (let i = 1; i < this.estado.n; i += 2) {
        if (sumatoriaImpares.length > 0) sumatoriaImpares += ' + ';
        sumatoriaImpares += this.formatear(r.evaluaciones[i]);
      }

      latex += `
        <p><strong>Índices impares (coeficiente 4):</strong></p>
        <p>$$4\\left(${sumatoriaImpares}\\right) = 4 \\times ${this.formatear(r.sumaImpares)} = ${this.formatear(4 * r.sumaImpares)}$$</p>
      `;
    }

    if (this.estado.n >= 4) {
      let sumatoriaPares = '';
      for (let i = 2; i < this.estado.n; i += 2) {
        if (sumatoriaPares.length > 0) sumatoriaPares += ' + ';
        sumatoriaPares += this.formatear(r.evaluaciones[i]);
      }

      latex += `
        <p><strong>Índices pares (coeficiente 2):</strong></p>
        <p>$$2\\left(${sumatoriaPares}\\right) = 2 \\times ${this.formatear(r.sumaPares)} = ${this.formatear(2 * r.sumaPares)}$$</p>
      `;
    }

    latex += `
      <p><strong>Suma total:</strong></p>
      <p>$$S = ${this.formatear(r.f0)} + ${this.formatear(4 * r.sumaImpares)} + ${this.formatear(2 * r.sumaPares)} + ${this.formatear(r.fn)} = ${this.formatear(r.S)}$$</p>
      </div>
    `;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 5: Fórmula de Simpson 1/3</h4>
        <p>$$I = \\frac{h}{3} \\times S = \\frac{${this.formatear(r.h)}}{3} \\times ${this.formatear(r.S)} = ${this.formatear(r.I)}$$</p>
      </div>
    `;

    latex += `
      <div class="resultado-final">
        <strong>Resultado Final:</strong>
        <p>$$\\int_{${this.formatear(this.estado.a)}}^{${this.formatear(this.estado.b)}} f(x) \\, dx \\approx ${this.formatear(r.I)}$$</p>
      </div>
    `;

    document.getElementById('contenedorDesarrollo').innerHTML = latex;

    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  },

  mostrarDesarrollo38() {
    const r = this.estado.resultado;
    if (!r) return;

    let latex = `
      <div class="paso-desarrollo">
        <h4>Paso 1: Ancho del subintervalo</h4>
        <p>$$h = \\frac{b - a}{n} = \\frac{${this.formatear(this.estado.b)} - ${this.formatear(this.estado.a)}}{${this.estado.n}} = ${this.formatear(r.h)}$$</p>
      </div>
    `;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 2: Nodos</h4>
        <p>$$x_i = a + i h, \\quad i = 0, 1, 2, \\ldots, ${this.estado.n}$$</p>
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
        <h4>Paso 4: Suma con coeficientes</h4>
        <p><strong>Extremos:</strong></p>
        <p>$$f(x_0) = ${this.formatear(r.f0)}, \\quad f(x_n) = ${this.formatear(r.fn)}$$</p>
    `;

    let sumatoria3 = '';
    for (let i = 1; i < this.estado.n; i++) {
      if (i % 3 === 0) continue;
      if (sumatoria3.length > 0) sumatoria3 += ' + ';
      sumatoria3 += this.formatear(r.evaluaciones[i]);
    }

    latex += `
      <p><strong>Índices no múltiplos de 3 (coeficiente 3):</strong></p>
      <p>$$3\\left(${sumatoria3}\\right) = 3 \\times ${this.formatear(r.suma3coef)} = ${this.formatear(3 * r.suma3coef)}$$</p>
    `;

    if (this.estado.n >= 6) {
      let sumatoria2 = '';
      for (let i = 3; i < this.estado.n; i += 3) {
        if (sumatoria2.length > 0) sumatoria2 += ' + ';
        sumatoria2 += this.formatear(r.evaluaciones[i]);
      }

      latex += `
        <p><strong>Índices múltiplos de 3 (coeficiente 2):</strong></p>
        <p>$$2\\left(${sumatoria2}\\right) = 2 \\times ${this.formatear(r.suma2coef)} = ${this.formatear(2 * r.suma2coef)}$$</p>
      `;
    }

    latex += `
      <p><strong>Suma total:</strong></p>
      <p>$$S = ${this.formatear(r.f0)} + ${this.formatear(3 * r.suma3coef)} + ${this.formatear(2 * r.suma2coef)} + ${this.formatear(r.fn)} = ${this.formatear(r.S)}$$</p>
      </div>
    `;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 5: Fórmula de Simpson 3/8</h4>
        <p>$$I = \\frac{3h}{8} \\times S = \\frac{3 \\times ${this.formatear(r.h)}}{8} \\times ${this.formatear(r.S)} = ${this.formatear(r.I)}$$</p>
      </div>
    `;

    latex += `
      <div class="resultado-final">
        <strong>Resultado Final:</strong>
        <p>$$\\int_{${this.formatear(this.estado.a)}}^{${this.formatear(this.estado.b)}} f(x) \\, dx \\approx ${this.formatear(r.I)}$$</p>
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
    const trazas = [trazaFuncion];

    if (this.estado.metodo === '1/3') {
      for (let i = 0; i < this.estado.n; i += 2) {
        const parabola = this.generarParabola(
          r.nodos[i],
          r.nodos[i + 1],
          r.nodos[i + 2],
          r.evaluaciones[i],
          r.evaluaciones[i + 1],
          r.evaluaciones[i + 2]
        );

        trazas.push({
          x: parabola.map(p => p.x),
          y: parabola.map(p => p.y),
          mode: 'lines',
          name: i === 0 ? 'Parábolas' : '',
          showlegend: i === 0,
          line: { color: '#10b981', width: 2 }
        });

        const pathParabola = parabola.map((p, idx) => {
          if (idx === 0) return `M ${p.x},0 L ${p.x},${p.y}`;
          return `L ${p.x},${p.y}`;
        }).join(' ') + ` L ${parabola[parabola.length - 1].x},0 Z`;

        shapes.push({
          type: 'path',
          path: pathParabola,
          fillcolor: 'rgba(16, 185, 129, 0.15)',
          line: { color: '#10b981', width: 1 }
        });
      }
    } else {
      for (let i = 0; i < this.estado.n; i += 3) {
        const cubica = this.generarParabolaCubica(
          r.nodos[i],
          r.nodos[i + 1],
          r.nodos[i + 2],
          r.nodos[i + 3],
          r.evaluaciones[i],
          r.evaluaciones[i + 1],
          r.evaluaciones[i + 2],
          r.evaluaciones[i + 3]
        );

        trazas.push({
          x: cubica.map(p => p.x),
          y: cubica.map(p => p.y),
          mode: 'lines',
          name: i === 0 ? 'Parábolas cúbicas' : '',
          showlegend: i === 0,
          line: { color: '#10b981', width: 2 }
        });

        const pathCubica = cubica.map((p, idx) => {
          if (idx === 0) return `M ${p.x},0 L ${p.x},${p.y}`;
          return `L ${p.x},${p.y}`;
        }).join(' ') + ` L ${cubica[cubica.length - 1].x},0 Z`;

        shapes.push({
          type: 'path',
          path: pathCubica,
          fillcolor: 'rgba(16, 185, 129, 0.15)',
          line: { color: '#10b981', width: 1 }
        });
      }
    }

    trazas.push(trazaNodos);

    const layout = {
      title: {
        text: `Método de Simpson ${this.estado.metodo}: ∫ ${this.estado.funcion} dx`,
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
      shapes: shapes
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false
    };

    Plotly.newPlot('graficoSimpson', trazas, layout, config);
  },

  generarParabola(x0, x1, x2, y0, y1, y2) {
    const puntos = [];
    const numPuntos = 50;
    for (let i = 0; i <= numPuntos; i++) {
      const t = i / numPuntos;
      const x = x0 + t * (x2 - x0);

      const L0 = ((x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2));
      const L1 = ((x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2));
      const L2 = ((x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1));

      const y = y0 * L0 + y1 * L1 + y2 * L2;

      if (isFinite(y)) {
        puntos.push({ x, y });
      }
    }
    return puntos;
  },

  generarParabolaCubica(x0, x1, x2, x3, y0, y1, y2, y3) {
    const puntos = [];
    const numPuntos = 50;
    for (let i = 0; i <= numPuntos; i++) {
      const t = i / numPuntos;
      const x = x0 + t * (x3 - x0);

      const L0 = ((x - x1) * (x - x2) * (x - x3)) / ((x0 - x1) * (x0 - x2) * (x0 - x3));
      const L1 = ((x - x0) * (x - x2) * (x - x3)) / ((x1 - x0) * (x1 - x2) * (x1 - x3));
      const L2 = ((x - x0) * (x - x1) * (x - x3)) / ((x2 - x0) * (x2 - x1) * (x2 - x3));
      const L3 = ((x - x0) * (x - x1) * (x - x2)) / ((x3 - x0) * (x3 - x1) * (x3 - x2));

      const y = y0 * L0 + y1 * L1 + y2 * L2 + y3 * L3;

      if (isFinite(y)) {
        puntos.push({ x, y });
      }
    }
    return puntos;
  },

  alternarPasos() {
    if (!this.estado.resultado) {
      // alert('Primero calcula la integral');
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
    document.getElementById('selectMetodo').value = '1/3';
    document.getElementById('inputN').value = '4';

    this.verificarN();

    Notificaciones.exito('Ejemplo cargado correctamente');
  }
};

document.addEventListener('DOMContentLoaded', () => App.iniciar());
