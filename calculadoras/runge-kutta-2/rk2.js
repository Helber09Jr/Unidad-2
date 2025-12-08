const App = {
  estado: {
    funcion: '',
    x0: 0,
    y0: 0,
    xf: 0,
    h: 0,
    variante: 'heun',
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
    const variante = document.getElementById('selectVariante').value;

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

    return { funcion, x0, y0, xf, h, variante };
  },

  calcular() {
    try {
      const { funcion, x0, y0, xf, h, variante } = this.validar();

      const n = Math.round((xf - x0) / h);
      const hAjustado = (xf - x0) / n;

      const puntos = [];
      let xActual = x0;
      let yActual = y0;

      puntos.push({ x: xActual, y: yActual, k1: 0, k2: 0 });

      for (let i = 0; i < n; i++) {
        let k1, k2, yNuevo;

        k1 = this.evaluarFuncion(funcion, xActual, yActual);

        if (variante === 'heun') {
          k2 = this.evaluarFuncion(funcion, xActual + hAjustado, yActual + hAjustado * k1);
          yNuevo = yActual + (hAjustado / 2) * (k1 + k2);
        } else if (variante === 'punto-medio') {
          k2 = this.evaluarFuncion(funcion, xActual + hAjustado / 2, yActual + (hAjustado / 2) * k1);
          yNuevo = yActual + hAjustado * k2;
        } else if (variante === 'ralston') {
          k2 = this.evaluarFuncion(funcion, xActual + (3 * hAjustado / 4), yActual + (3 * hAjustado / 4) * k1);
          yNuevo = yActual + hAjustado * ((1/3) * k1 + (2/3) * k2);
        }

        const xNuevo = xActual + hAjustado;

        puntos[i].k1 = k1;
        puntos[i].k2 = k2;

        xActual = xNuevo;
        yActual = yNuevo;

        puntos.push({ x: xActual, y: yActual, k1: 0, k2: 0 });
      }

      const k1Final = this.evaluarFuncion(funcion, puntos[n].x, puntos[n].y);
      let k2Final;

      if (variante === 'heun') {
        k2Final = this.evaluarFuncion(funcion, puntos[n].x + hAjustado, puntos[n].y + hAjustado * k1Final);
      } else if (variante === 'punto-medio') {
        k2Final = this.evaluarFuncion(funcion, puntos[n].x + hAjustado / 2, puntos[n].y + (hAjustado / 2) * k1Final);
      } else if (variante === 'ralston') {
        k2Final = this.evaluarFuncion(funcion, puntos[n].x + (3 * hAjustado / 4), puntos[n].y + (3 * hAjustado / 4) * k1Final);
      }

      puntos[n].k1 = k1Final;
      puntos[n].k2 = k2Final;

      this.estado.funcion = funcion;
      this.estado.x0 = x0;
      this.estado.y0 = y0;
      this.estado.xf = xf;
      this.estado.h = hAjustado;
      this.estado.variante = variante;
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

  obtenerNombreVariante() {
    const variantes = {
      'heun': 'Heun (Euler Mejorado)',
      'punto-medio': 'Punto Medio',
      'ralston': 'Ralston'
    };
    return variantes[this.estado.variante] || 'Heun';
  },

  mostrarResultado() {
    const r = this.estado.resultado;
    if (!r) return;

    const ultimoPunto = r.puntos[r.n];
    const nombreVariante = this.obtenerNombreVariante();

    let html = `
      <div class="resultado-principal">
        <p class="etiqueta-resultado">Solución numérica en x = ${this.formatear(this.estado.xf)} (${nombreVariante}):</p>
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
              <th>k<sub>1</sub></th>
              <th>k<sub>2</sub></th>
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
          <td>${this.formatear(p.k1)}</td>
          <td>${this.formatear(p.k2)}</td>
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
    const nombreVariante = this.obtenerNombreVariante();

    let latex = `
      <div class="paso-desarrollo">
        <h4>Fórmula del Método RK2 - ${nombreVariante}</h4>
    `;

    if (this.estado.variante === 'heun') {
      latex += `
        <p>$$k_1 = f(x_n, y_n)$$</p>
        <p>$$k_2 = f(x_n + h, y_n + h \\cdot k_1)$$</p>
        <p>$$y_{n+1} = y_n + \\frac{h}{2}(k_1 + k_2)$$</p>
      `;
    } else if (this.estado.variante === 'punto-medio') {
      latex += `
        <p>$$k_1 = f(x_n, y_n)$$</p>
        <p>$$k_2 = f(x_n + \\frac{h}{2}, y_n + \\frac{h}{2} \\cdot k_1)$$</p>
        <p>$$y_{n+1} = y_n + h \\cdot k_2$$</p>
      `;
    } else if (this.estado.variante === 'ralston') {
      latex += `
        <p>$$k_1 = f(x_n, y_n)$$</p>
        <p>$$k_2 = f(x_n + \\frac{3h}{4}, y_n + \\frac{3h}{4} \\cdot k_1)$$</p>
        <p>$$y_{n+1} = y_n + h \\left(\\frac{1}{3}k_1 + \\frac{2}{3}k_2\\right)$$</p>
      `;
    }

    latex += `
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
          <p>$$k_1 = f(x_{${i}}, y_{${i}}) = f(${this.formatear(actual.x)}, ${this.formatear(actual.y)}) = ${this.formatear(actual.k1)}$$</p>
      `;

      if (this.estado.variante === 'heun') {
        latex += `
          <p>$$k_2 = f(${this.formatear(actual.x)} + ${this.formatear(this.estado.h)}, ${this.formatear(actual.y)} + ${this.formatear(this.estado.h)} \\cdot ${this.formatear(actual.k1)}) = ${this.formatear(actual.k2)}$$</p>
          <p>$$y_{${i + 1}} = ${this.formatear(actual.y)} + \\frac{${this.formatear(this.estado.h)}}{2}(${this.formatear(actual.k1)} + ${this.formatear(actual.k2)}) = ${this.formatear(siguiente.y)}$$</p>
        `;
      } else if (this.estado.variante === 'punto-medio') {
        latex += `
          <p>$$k_2 = f(${this.formatear(actual.x)} + \\frac{${this.formatear(this.estado.h)}}{2}, ${this.formatear(actual.y)} + \\frac{${this.formatear(this.estado.h)}}{2} \\cdot ${this.formatear(actual.k1)}) = ${this.formatear(actual.k2)}$$</p>
          <p>$$y_{${i + 1}} = ${this.formatear(actual.y)} + ${this.formatear(this.estado.h)} \\cdot ${this.formatear(actual.k2)} = ${this.formatear(siguiente.y)}$$</p>
        `;
      } else if (this.estado.variante === 'ralston') {
        latex += `
          <p>$$k_2 = f(${this.formatear(actual.x)} + \\frac{3 \\cdot ${this.formatear(this.estado.h)}}{4}, ${this.formatear(actual.y)} + \\frac{3 \\cdot ${this.formatear(this.estado.h)}}{4} \\cdot ${this.formatear(actual.k1)}) = ${this.formatear(actual.k2)}$$</p>
          <p>$$y_{${i + 1}} = ${this.formatear(actual.y)} + ${this.formatear(this.estado.h)} \\left(\\frac{1}{3} \\cdot ${this.formatear(actual.k1)} + \\frac{2}{3} \\cdot ${this.formatear(actual.k2)}\\right) = ${this.formatear(siguiente.y)}$$</p>
        `;
      }

      latex += `
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
              <th>k<sub>1</sub></th>
              <th>k<sub>2</sub></th>
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
          <td>${this.formatear(punto.k1)}</td>
          <td>${this.formatear(punto.k2)}</td>
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

    const nombreVariante = this.obtenerNombreVariante();

    const trazaSolucion = {
      x: r.puntos.map(p => p.x),
      y: r.puntos.map(p => p.y),
      mode: 'lines+markers',
      name: `Solución RK2 (${nombreVariante})`,
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
          const yEnd = yStart + this.estado.h * punto.k1;

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
        text: `Método RK2 (${nombreVariante}): y' = ${this.estado.funcion}`,
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

    Plotly.newPlot('graficoRK2', trazas, layout, config);
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
    document.getElementById('selectVariante').value = 'heun';
    document.getElementById('selectFuncion').value = 'y - x^2 + 1';
    document.getElementById('inputFuncion').value = 'y - x^2 + 1';
    document.getElementById('inputX0').value = '0';
    document.getElementById('inputY0').value = '0.5';
    document.getElementById('inputXf').value = '0.1';
    document.getElementById('inputH').value = '0.1';

    this.verificarH();

    Notificaciones.exito('Ejemplo cargado correctamente');
  }
};

document.addEventListener('DOMContentLoaded', () => App.iniciar());
