const App = {
  estado: {
    funcion: '',
    x0: 0,
    y0: 0,
    xf: 0,
    h: 0,
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
    document.getElementById('toggleTangentes').onchange = () => this.graficar();

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

  calcularDerivada(expresion, x, y) {
    const epsilon = 1e-7;
    const fx = this.evaluarFuncion(expresion, x, y);

    const dfdx = (this.evaluarFuncion(expresion, x + epsilon, y) - fx) / epsilon;
    const dfdy = (this.evaluarFuncion(expresion, x, y + epsilon) - fx) / epsilon;

    const fprime = dfdx + dfdy * fx;

    return fprime;
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

    if (h <= 0) {
      advertencia.classList.remove('oculto');
      advertencia.innerHTML = '<p>⚠️ El paso h debe ser positivo.</p>';
      return;
    }

    if (xf <= x0) {
      advertencia.classList.remove('oculto');
      advertencia.innerHTML = '<p>⚠️ El valor final debe ser mayor que el inicial.</p>';
      return;
    }

    const n = Math.round((xf - x0) / h);
    const hCalculado = (xf - x0) / n;

    if (Math.abs(hCalculado - h) > 1e-10) {
      advertencia.classList.remove('oculto');
      advertencia.innerHTML = `<p>ℹ️ Se ajustará h a ${this.formatear(hCalculado)} para que (xf - x0) sea múltiplo exacto de h.</p>`;
    } else {
      advertencia.classList.add('oculto');
    }
  },

  validar() {
    const funcion = document.getElementById('inputFuncion').value.trim();
    const x0 = parseFloat(document.getElementById('inputX0').value);
    const y0 = parseFloat(document.getElementById('inputY0').value);
    const xf = parseFloat(document.getElementById('inputXf').value);
    const h = parseFloat(document.getElementById('inputH').value);

    if (!funcion) {
      throw new Error('Ingrese una función');
    }

    if (isNaN(x0) || isNaN(y0)) {
      throw new Error('Las condiciones iniciales deben ser números válidos');
    }

    if (isNaN(xf)) {
      throw new Error('El valor final xf debe ser un número válido');
    }

    if (xf <= x0) {
      throw new Error('El valor final debe ser mayor que el inicial');
    }

    if (isNaN(h) || h <= 0) {
      throw new Error('El paso h debe ser un número positivo');
    }

    try {
      this.evaluarFuncion(funcion, x0, y0);
    } catch (error) {
      throw new Error('La función ingresada no es válida');
    }

    return { funcion, x0, y0, xf, h };
  },

  calcular() {
    try {
      const { funcion, x0, y0, xf, h } = this.validar();

      const n = Math.round((xf - x0) / h);
      const hAjustado = (xf - x0) / n;

      const puntos = [];
      let xActual = x0;
      let yActual = y0;

      puntos.push({ x: xActual, y: yActual, f: 0, fprime: 0 });

      for (let i = 0; i < n; i++) {
        const f = this.evaluarFuncion(funcion, xActual, yActual);
        const fprime = this.calcularDerivada(funcion, xActual, yActual);

        const yNuevo = yActual + hAjustado * f + (hAjustado ** 2 / 2) * fprime;
        const xNuevo = xActual + hAjustado;

        puntos[i].f = f;
        puntos[i].fprime = fprime;

        xActual = xNuevo;
        yActual = yNuevo;

        puntos.push({ x: xActual, y: yActual, f: 0, fprime: 0 });
      }

      const fFinal = this.evaluarFuncion(funcion, puntos[n].x, puntos[n].y);
      const fprimeFinal = this.calcularDerivada(funcion, puntos[n].x, puntos[n].y);
      puntos[n].f = fFinal;
      puntos[n].fprime = fprimeFinal;

      this.estado.funcion = funcion;
      this.estado.x0 = x0;
      this.estado.y0 = y0;
      this.estado.xf = xf;
      this.estado.h = hAjustado;
      this.estado.resultado = {
        puntos,
        n
      };

      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.graficar();

      const seccionResultado = document.getElementById('tarjetaResultado');
      const seccionTabla = document.getElementById('seccionTablaCompleta');
      seccionResultado.classList.remove('oculto');
      seccionTabla.classList.remove('oculto');

      Notificaciones.exito(`Cálculo completado: y(${this.formatear(xf)}) ≈ ${this.formatear(yActual)}`);

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

    const ultimoPunto = r.puntos[r.n];

    let html = `
      <div class="resultado-principal">
        <p class="etiqueta-resultado">Solución numérica en x = ${this.formatear(this.estado.xf)}:</p>
        <p class="valor-resultado">$$y(${this.formatear(this.estado.xf)}) \\approx ${this.formatear(ultimoPunto.y)}$$</p>
      </div>
      <div class="resultado-detalles">
        <p>$$n = ${r.n}$$ iteraciones</p>
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
              <th>f'(x<sub>i</sub>, y<sub>i</sub>)</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (let i = 0; i < numMostrar; i++) {
      const p = r.puntos[i];
      html += `
        <tr>
          <td>${i}</td>
          <td>${this.formatear(p.x)}</td>
          <td>${this.formatear(p.y)}</td>
          <td>${this.formatear(p.f)}</td>
          <td>${this.formatear(p.fprime)}</td>
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
        <h4>Fórmula del Método de Taylor (Orden 2)</h4>
        <p>$$y_{n+1} = y_n + h \\cdot f(x_n, y_n) + \\frac{h^2}{2} \\cdot f'(x_n, y_n)$$</p>
        <p>$$x_{n+1} = x_n + h$$</p>
        <p>$$f(x, y) = ${this.estado.funcion}, \\quad h = ${this.formatear(this.estado.h)}$$</p>
        <p>$$x_0 = ${this.formatear(this.estado.x0)}, \\quad y_0 = ${this.formatear(this.estado.y0)}$$</p>
      </div>
    `;

    for (let i = 0; i < numMostrar; i++) {
      const actual = r.puntos[i];
      const siguiente = r.puntos[i + 1];
      if (!siguiente) break;

      latex += `
        <div class="paso-desarrollo">
          <h4>Iteración ${i + 1}</h4>
          <p>$$f(x_{${i}}, y_{${i}}) = f(${this.formatear(actual.x)}, ${this.formatear(actual.y)}) = ${this.formatear(actual.f)}$$</p>
          <p>$$f'(x_{${i}}, y_{${i}}) = ${this.formatear(actual.fprime)}$$</p>
          <p>$$y_{${i + 1}} = y_{${i}} + h \\cdot f + \\frac{h^2}{2} \\cdot f'$$</p>
          <p>$$y_{${i + 1}} = ${this.formatear(actual.y)} + ${this.formatear(this.estado.h)} \\cdot (${this.formatear(actual.f)}) + \\frac{(${this.formatear(this.estado.h)})^2}{2} \\cdot (${this.formatear(actual.fprime)})$$</p>
          <p>$$y_{${i + 1}} = ${this.formatear(siguiente.y)}$$</p>
          <p>$$x_{${i + 1}} = x_{${i}} + h = ${this.formatear(actual.x)} + ${this.formatear(this.estado.h)} = ${this.formatear(siguiente.x)}$$</p>
        </div>
      `;
    }

    if (r.n > numMostrar) {
      latex += `
        <div class="paso-desarrollo">
          <p><em>Mostrando las primeras ${numMostrar} de ${r.n} iteraciones. Ver tabla completa abajo.</em></p>
        </div>
      `;
    }

    document.getElementById('contenedorDesarrollo').innerHTML = latex;

    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  },

  mostrarTablaExpandida() {
    const seccion = document.getElementById('seccionTablaCompleta');
    seccion.classList.remove('oculto');
    seccion.setAttribute('aria-hidden', 'false');

    this.mostrarTablaCompleta();

    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  mostrarTablaCompleta() {
    const r = this.estado.resultado;
    if (!r) return;

    let html = `
      <div class="tabla-wrapper">
        <table class="tabla-completa">
          <thead>
            <tr>
              <th>i</th>
              <th>x<sub>i</sub></th>
              <th>y<sub>i</sub></th>
              <th>f(x<sub>i</sub>, y<sub>i</sub>)</th>
              <th>f'(x<sub>i</sub>, y<sub>i</sub>)</th>
            </tr>
          </thead>
          <tbody>
    `;

    r.puntos.forEach((punto, i) => {
      html += `
        <tr>
          <td>${i}</td>
          <td>${this.formatear(punto.x)}</td>
          <td>${this.formatear(punto.y)}</td>
          <td>${this.formatear(punto.f)}</td>
          <td>${this.formatear(punto.fprime)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('contenedorTablaCompleta').innerHTML = html;
  },

  graficar() {
    const r = this.estado.resultado;
    if (!r) return;

    const xMin = this.estado.x0;
    const xMax = this.estado.xf;

    const trazaSolucion = {
      x: r.puntos.map(p => p.x),
      y: r.puntos.map(p => p.y),
      mode: 'lines+markers',
      name: 'Solución Taylor',
      line: { color: '#1e40af', width: 3 },
      marker: {
        color: '#dc2626',
        size: 8,
        symbol: 'circle',
        line: { color: 'white', width: 2 }
      }
    };

    const trazas = [trazaSolucion];
    const shapes = [];

    const mostrarTangentes = document.getElementById('toggleTangentes').checked;

    if (mostrarTangentes) {
      r.puntos.forEach((punto, i) => {
        if (i < r.n) {
          const xStart = punto.x;
          const yStart = punto.y;
          const xEnd = r.puntos[i + 1].x;
          const yEnd = yStart + this.estado.h * punto.f;

          shapes.push({
            type: 'line',
            x0: xStart,
            y0: yStart,
            x1: xEnd,
            y1: yEnd,
            line: {
              color: '#10b981',
              width: 2,
              dash: 'dash'
            }
          });
        }
      });
    }

    const layout = {
      title: {
        text: `Método de Taylor (Orden 2): y' = ${this.estado.funcion}`,
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
      hovermode: 'closest',
      shapes: shapes
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false
    };

    Plotly.newPlot('graficoTaylor', trazas, layout, config);
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
