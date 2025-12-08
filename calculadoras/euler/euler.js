const App = {
  estado: {
    funcion: '',
    x0: 0,
    y0: 0,
    xf: 0,
    h: 0,
    resultado: null,
    mostrarTangentes: false
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
    document.getElementById('toggleTangentes').onchange = (e) => {
      this.estado.mostrarTangentes = e.target.checked;
      if (this.estado.resultado) {
        this.graficar();
      }
    };

    document.getElementById('selectFuncion').onchange = (e) => {
      if (e.target.value) {
        document.getElementById('inputFuncion').value = e.target.value;
      }
    };

    document.getElementById('inputH').oninput = () => this.verificarH();
    document.getElementById('inputXf').oninput = () => this.verificarH();
    document.getElementById('inputX0').oninput = () => this.verificarH();

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

  evaluarFuncion(expresion, x, y) {
    try {
      const expresionParseada = this.parsearFuncion(expresion);
      const expresionConXY = expresionParseada
        .replace(/x/g, `(${x})`)
        .replace(/y/g, `(${y})`);
      return eval(expresionConXY);
    } catch (error) {
      throw new Error('Error al evaluar la función');
    }
  },

  verificarH() {
    const x0 = parseFloat(document.getElementById('inputX0').value);
    const xf = parseFloat(document.getElementById('inputXf').value);
    const h = parseFloat(document.getElementById('inputH').value);
    const advertencia = document.getElementById('advertenciaH');

    if (isNaN(x0) || isNaN(xf) || isNaN(h)) {
      advertencia.classList.add('oculto');
      return;
    }

    if (xf <= x0) {
      advertencia.classList.add('oculto');
      return;
    }

    const intervalo = xf - x0;
    const n = intervalo / h;

    if (!Number.isInteger(n) || n <= 0) {
      const nAjustado = Math.ceil(n);
      const hAjustado = intervalo / nAjustado;

      advertencia.classList.remove('oculto');
      advertencia.innerHTML = `
        <p>⚠️ El paso h no divide exactamente el intervalo. Se ajustará automáticamente.</p>
        <p><strong>Paso ajustado:</strong> h = ${this.formatear(hAjustado)} (${nAjustado} pasos)</p>
      `;
    } else {
      advertencia.classList.add('oculto');
    }
  },

  validar() {
    const funcion = document.getElementById('inputFuncion').value.trim();
    let x0 = parseFloat(document.getElementById('inputX0').value);
    let y0 = parseFloat(document.getElementById('inputY0').value);
    let xf = parseFloat(document.getElementById('inputXf').value);
    let h = parseFloat(document.getElementById('inputH').value);

    if (!funcion) {
      throw new Error('Ingrese una función f(x, y)');
    }

    if (isNaN(x0) || isNaN(y0)) {
      throw new Error('La condición inicial debe tener valores numéricos válidos');
    }

    if (isNaN(xf)) {
      throw new Error('El valor final xf debe ser un número válido');
    }

    if (xf <= x0) {
      throw new Error('El valor final xf debe ser mayor que x₀');
    }

    if (isNaN(h) || h <= 0) {
      throw new Error('El tamaño del paso h debe ser un número positivo');
    }

    const intervalo = xf - x0;
    let n = intervalo / h;

    if (!Number.isInteger(n) || n <= 0) {
      n = Math.ceil(n);
      h = intervalo / n;
    }

    n = Math.round(n);

    try {
      this.evaluarFuncion(funcion, x0, y0);
    } catch (error) {
      throw new Error('La función ingresada no es válida');
    }

    return { funcion, x0, y0, xf, h, n };
  },

  calcular() {
    try {
      const { funcion, x0, y0, xf, h, n } = this.validar();

      const puntos = [];
      let xi = x0;
      let yi = y0;

      puntos.push({
        i: 0,
        x: xi,
        y: yi,
        pendiente: this.evaluarFuncion(funcion, xi, yi)
      });

      for (let i = 0; i < n; i++) {
        const pendiente = this.evaluarFuncion(funcion, xi, yi);
        const yNext = yi + h * pendiente;
        const xNext = xi + h;

        puntos.push({
          i: i + 1,
          x: xNext,
          y: yNext,
          pendiente: this.evaluarFuncion(funcion, xNext, yNext),
          xPrev: xi,
          yPrev: yi,
          pendientePrev: pendiente
        });

        xi = xNext;
        yi = yNext;
      }

      this.estado.funcion = funcion;
      this.estado.x0 = x0;
      this.estado.y0 = y0;
      this.estado.xf = xf;
      this.estado.h = h;
      this.estado.resultado = {
        n,
        puntos
      };

      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.mostrarTablaCompleta();
      this.graficar();

      Notificaciones.exito(`Cálculo completado: ${n + 1} puntos generados. Solución en x = ${this.formatear(xf)}: y ≈ ${this.formatear(yi)}`);

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

    const ultimoPunto = r.puntos[r.puntos.length - 1];

    let html = `
      <div class="resultado-principal">
        <p class="etiqueta-resultado">Solución numérica en x = ${this.formatear(this.estado.xf)}:</p>
        <p class="valor-resultado">$$y(${this.formatear(this.estado.xf)}) \\approx ${this.formatear(ultimoPunto.y)}$$</p>
      </div>
      <div class="resultado-detalles">
        <p>$$n = ${r.n}$$ pasos</p>
        <p>$$h = ${this.formatear(this.estado.h)}$$</p>
      </div>
    `;

    const numMostrar = Math.min(10, r.puntos.length);

    html += `
      <div class="tabla-resumen">
        <h4>Primeros ${numMostrar} puntos</h4>
        <table class="tabla-desarrollo">
          <thead>
            <tr>
              <th>i</th>
              <th>x<sub>i</sub></th>
              <th>y<sub>i</sub></th>
              <th>f(x<sub>i</sub>, y<sub>i</sub>)</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (let i = 0; i < numMostrar; i++) {
      const p = r.puntos[i];
      html += `
        <tr>
          <td>${p.i}</td>
          <td>${this.formatear(p.x)}</td>
          <td>${this.formatear(p.y)}</td>
          <td>${this.formatear(p.pendiente)}</td>
        </tr>
      `;
    }

    html += `
          </tbody>
        </table>
      </div>
    `;

    if (r.puntos.length > numMostrar) {
      html += `
        <div class="enlace-tabla">
          <button class="boton-esis secundario" onclick="App.mostrarTablaExpandida()">
            Ver tabla completa (${r.puntos.length} puntos)
          </button>
        </div>
      `;
    }

    document.getElementById('contenedorResultado').innerHTML = html;

    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  },

  mostrarDesarrollo() {
    const r = this.estado.resultado;
    if (!r) return;

    const numMostrar = Math.min(10, r.n);

    let latex = `
      <div class="paso-desarrollo">
        <h4>Fórmula del Método de Euler</h4>
        <p>$$y_{n+1} = y_n + h \\cdot f(x_n, y_n)$$</p>
        <p>$$x_{n+1} = x_n + h$$</p>
        <p>$$f(x, y) = ${this.estado.funcion}, \\quad h = ${this.formatear(this.estado.h)}$$</p>
        <p>$$x_0 = ${this.formatear(this.estado.x0)}, \\quad y_0 = ${this.formatear(this.estado.y0)}$$</p>
      </div>
    `;

    for (let i = 0; i < numMostrar; i++) {
      const actual = r.puntos[i];
      const siguiente = r.puntos[i + 1];

      if (!siguiente) break;

      const funcionEvaluada = `${this.estado.funcion}`.replace(/x/g, this.formatear(actual.x)).replace(/y/g, this.formatear(actual.y));

      latex += `
        <div class="paso-desarrollo">
          <h4>Iteración ${i + 1}</h4>
          <p>$$y_{${i + 1}} = y_{${i}} + h \\cdot f(x_{${i}}, y_{${i}}) = ${this.formatear(actual.y)} + ${this.formatear(this.estado.h)} \\cdot f(${this.formatear(actual.x)}, ${this.formatear(actual.y)})$$</p>
          <p>$$y_{${i + 1}} = ${this.formatear(actual.y)} + ${this.formatear(this.estado.h)} \\cdot (${this.formatear(actual.pendiente)}) = ${this.formatear(siguiente.y)}$$</p>
          <p>$$x_{${i + 1}} = x_{${i}} + h = ${this.formatear(actual.x)} + ${this.formatear(this.estado.h)} = ${this.formatear(siguiente.x)}$$</p>
        </div>
      `;
    }

    if (r.n > numMostrar) {
      latex += `
        <div class="paso-desarrollo">
          <p><em>Mostrando primeras ${numMostrar} iteraciones de ${r.n} totales. Ver tabla completa para todos los valores.</em></p>
        </div>
      `;
    }

    latex += `
      <div class="resultado-final">
        <strong>Resultado Final:</strong>
        <p>$$y(${this.formatear(this.estado.xf)}) \\approx ${this.formatear(r.puntos[r.puntos.length - 1].y)}$$</p>
      </div>
    `;

    document.getElementById('contenedorDesarrollo').innerHTML = latex;

    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  },

  mostrarTablaCompleta() {
    const r = this.estado.resultado;
    if (!r) return;

    let html = `
      <table class="tabla-desarrollo tabla-completa">
        <thead>
          <tr>
            <th>i</th>
            <th>x<sub>i</sub></th>
            <th>y<sub>i</sub></th>
            <th>f(x<sub>i</sub>, y<sub>i</sub>)</th>
          </tr>
        </thead>
        <tbody>
    `;

    r.puntos.forEach(p => {
      html += `
        <tr>
          <td>${p.i}</td>
          <td>${this.formatear(p.x)}</td>
          <td>${this.formatear(p.y)}</td>
          <td>${this.formatear(p.pendiente)}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    document.getElementById('contenedorTablaCompleta').innerHTML = html;
  },

  mostrarTablaExpandida() {
    const seccion = document.getElementById('seccionTablaCompleta');
    seccion.classList.remove('oculto');
    seccion.setAttribute('aria-hidden', 'false');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  graficar() {
    const r = this.estado.resultado;
    if (!r) return;

    const xValues = r.puntos.map(p => p.x);
    const yValues = r.puntos.map(p => p.y);

    const trazaSolucion = {
      x: xValues,
      y: yValues,
      mode: 'lines',
      name: 'Solución numérica',
      line: { color: '#1e40af', width: 3 }
    };

    const trazaPuntos = {
      x: xValues,
      y: yValues,
      mode: 'markers',
      name: 'Puntos',
      marker: {
        color: '#dc2626',
        size: 8,
        symbol: 'circle',
        line: { color: 'white', width: 2 }
      }
    };

    const trazas = [trazaSolucion, trazaPuntos];

    if (this.estado.mostrarTangentes) {
      for (let i = 0; i < r.puntos.length - 1; i++) {
        const p = r.puntos[i];
        const pNext = r.puntos[i + 1];

        const xTangente = [p.x, pNext.x];
        const yTangente = [p.y, p.y + p.pendiente * (pNext.x - p.x)];

        trazas.push({
          x: xTangente,
          y: yTangente,
          mode: 'lines',
          name: i === 0 ? 'Rectas tangentes' : '',
          showlegend: i === 0,
          line: { color: '#10b981', width: 1.5, dash: 'dot' }
        });
      }
    }

    const layout = {
      title: {
        text: `Método de Euler: y' = ${this.estado.funcion}`,
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
        title: { text: 'y', font: { size: 14, color: '#475569' } },
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
      hovermode: 'closest'
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false
    };

    Plotly.newPlot('graficoEuler', trazas, layout, config);
  },

  alternarPasos() {
    if (!this.estado.resultado) {
      Notificaciones.error('Primero calcula la solución');
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
      boton.textContent = 'Ver desarrollo';
    }
  },

  alternarMenu() {
    const menu = document.getElementById('menuNavegacion');
    menu.classList.toggle('menu-activo');
  },

  cargarEjemplo() {
    document.getElementById('selectFuncion').value = '-2*y + x';
    document.getElementById('inputFuncion').value = '-2*y + x';
    document.getElementById('inputX0').value = '0';
    document.getElementById('inputY0').value = '0';
    document.getElementById('inputXf').value = '0.3';
    document.getElementById('inputH').value = '0.1';

    this.verificarH();

    Notificaciones.exito('Ejemplo cargado correctamente');
  }
};

document.addEventListener('DOMContentLoaded', () => App.iniciar());
