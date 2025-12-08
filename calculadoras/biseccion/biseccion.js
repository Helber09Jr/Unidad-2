/* --- MÉTODO DE BISECCIÓN --- */

const App = {
  estado: {
    funcion: 'x^2 - 4',
    limiteA: 1,
    limiteB: 3,
    tol: 0.0001,
    maxIter: 100,
    raiz: 0,
    iteraciones: [],
    convergio: false
  },

  async iniciar() {
    this.vincularEventos();
  },

  vincularEventos() {
    document.getElementById('btnCalcular').addEventListener('click', () => this.calcular());
    document.getElementById('btnEjemplo').addEventListener('click', () => this.cargarEjemplo());
    document.getElementById('btnLimpiar').addEventListener('click', () => this.limpiar());
    document.getElementById('btnAlternarTabla').addEventListener('click', () => this.alternarTabla());
  },

  evaluarFuncion(x) {
    try {
      const funcion = this.estado.funcion
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/exp/g, 'Math.exp')
        .replace(/ln/g, 'Math.log')
        .replace(/π/g, 'Math.PI')
        .replace(/e(?![a-z])/g, 'Math.E');
      return Function('x', 'return ' + funcion)(x);
    } catch (e) {
      throw new Error('Error al evaluar la función: ' + e.message);
    }
  },

  calcular() {
    try {
      this.estado.funcion = document.getElementById('funcion').value;
      this.estado.limiteA = parseFloat(document.getElementById('limiteA').value);
      this.estado.limiteB = parseFloat(document.getElementById('limiteB').value);
      this.estado.tol = parseFloat(document.getElementById('tolerancia').value);
      this.estado.maxIter = parseInt(document.getElementById('maxIteraciones').value);

      if (!this.estado.funcion) {
        Notificaciones.error('Por favor ingresa una función');
        return;
      }

      const fa = this.evaluarFuncion(this.estado.limiteA);
      const fb = this.evaluarFuncion(this.estado.limiteB);

      if (fa * fb > 0) {
        Notificaciones.error('f(a) y f(b) deben tener signos opuestos. f(a)=' + fa.toFixed(4) + ', f(b)=' + fb.toFixed(4));
        return;
      }

      Notificaciones.calcular('Ejecutando método de bisección...');

      let a = this.estado.limiteA;
      let b = this.estado.limiteB;
      this.estado.iteraciones = [];
      this.estado.convergio = false;

      for (let k = 0; k < this.estado.maxIter; k++) {
        const c = (a + b) / 2;
        const fc = this.evaluarFuncion(c);
        const error = Math.abs(b - a) / 2;

        this.estado.iteraciones.push({
          iter: k + 1,
          a: a,
          b: b,
          c: c,
          fc: fc,
          error: error
        });

        if (error < this.estado.tol || Math.abs(fc) < 1e-10) {
          this.estado.raiz = c;
          this.estado.convergio = true;
          break;
        }

        if (fa * fc < 0) {
          b = c;
          fb = fc;
        } else {
          a = c;
          fa = fc;
        }
      }

      if (this.estado.convergio) {
        this.mostrarResultado();
        Notificaciones.exito('Raíz encontrada: x = ' + this.estado.raiz.toFixed(6));
      } else {
        Notificaciones.error('No convergió en ' + this.estado.maxIter + ' iteraciones');
      }
    } catch (error) {
      Notificaciones.error('Error: ' + error.message);
      console.error(error);
    }
  },

  mostrarResultado() {
    const contenedor = document.getElementById('contenedorResultado');
    const resultadoDiv = document.getElementById('resultadoRaiz');

    let html = '<div class="resultado-principal">';
    html += '<p><strong>Raíz encontrada:</strong></p>';
    html += '<span class="numero-raiz">' + this.estado.raiz.toFixed(6) + '</span>';
    html += '<p><strong>f(x) = </strong>' + this.evaluarFuncion(this.estado.raiz).toFixed(8) + '</p>';
    html += '<p><strong>Iteraciones:</strong> ' + this.estado.iteraciones.length + '</p>';
    html += '<p><strong>Error final:</strong> ' + (this.estado.iteraciones[this.estado.iteraciones.length - 1].error).toExponential(4) + '</p>';
    html += '</div>';

    resultadoDiv.innerHTML = html;
    contenedor.classList.remove('oculto');
    document.getElementById('contenedorTabla').classList.add('oculto');
  },

  alternarTabla() {
    const tabla = document.getElementById('contenedorTabla');
    if (tabla.classList.contains('oculto')) {
      this.mostrarTabla();
      tabla.classList.remove('oculto');
    } else {
      tabla.classList.add('oculto');
    }
  },

  mostrarTabla() {
    const contenedor = document.getElementById('tablaIteraciones');
    
    let html = '<table class="tabla-metodo"><thead><tr><th>Iter</th><th>a</th><th>b</th><th>c = (a+b)/2</th><th>f(c)</th><th>Error</th></tr></thead><tbody>';

    this.estado.iteraciones.forEach(it => {
      html += '<tr><td>' + it.iter + '</td>';
      html += '<td>' + it.a.toFixed(4) + '</td>';
      html += '<td>' + it.b.toFixed(4) + '</td>';
      html += '<td>' + it.c.toFixed(6) + '</td>';
      html += '<td>' + it.fc.toFixed(6) + '</td>';
      html += '<td>' + it.error.toExponential(3) + '</td></tr>';
    });

    html += '</tbody></table>';
    contenedor.innerHTML = html;
  },

  cargarEjemplo() {
    document.getElementById('funcion').value = 'x^2 - 4';
    document.getElementById('limiteA').value = '1';
    document.getElementById('limiteB').value = '3';
    Notificaciones.exito('Ejemplo cargado: x² - 4, raíz en x ≈ 2');
  },

  limpiar() {
    document.getElementById('funcion').value = '';
    document.getElementById('limiteA').value = '';
    document.getElementById('limiteB').value = '';
    document.getElementById('contenedorResultado').classList.add('oculto');
    document.getElementById('contenedorTabla').classList.add('oculto');
    Notificaciones.info('Campos limpiados');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.iniciar();
});
