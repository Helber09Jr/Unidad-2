const App = {
  estado: { funcion: 'x^3 - 2', x0: 1, x1: 2, tol: 0.0001, maxIter: 100, raiz: 0, iteraciones: [], convergio: false },
  
  evaluarFuncion(x) {
    const f = this.estado.funcion.replace(/\^/g, '**').replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/sqrt/g, 'Math.sqrt').replace(/exp/g, 'Math.exp').replace(/ln/g, 'Math.log');
    return Function('x', 'return ' + f)(x);
  },

  vincularEventos() {
    document.getElementById('btnCalcular').addEventListener('click', () => this.calcular());
    document.getElementById('btnEjemplo').addEventListener('click', () => {
      document.getElementById('funcion').value = 'x^3 - 2';
      document.getElementById('x0').value = '1';
      document.getElementById('x1').value = '2';
      Notificaciones.exito('Ejemplo cargado');
    });
    document.getElementById('btnLimpiar').addEventListener('click', () => this.limpiar());
    document.getElementById('btnAlternarTabla').addEventListener('click', () => this.alternarTabla());
  },

  calcular() {
    try {
      this.estado.funcion = document.getElementById('funcion').value;
      this.estado.x0 = parseFloat(document.getElementById('x0').value);
      this.estado.x1 = parseFloat(document.getElementById('x1').value);
      this.estado.tol = parseFloat(document.getElementById('tolerancia').value);
      this.estado.maxIter = parseInt(document.getElementById('maxIteraciones').value);

      if (!this.estado.funcion) {
        Notificaciones.error('Ingresa una función');
        return;
      }

      Notificaciones.calcular('Ejecutando método de la newton-raphson...');

      let x0 = this.estado.x0, x1 = this.estado.x1;
      this.estado.iteraciones = [];

      for (let k = 0; k < this.estado.maxIter; k++) {
        const f0 = this.evaluarFuncion(x0);
        const f1 = this.evaluarFuncion(x1);
        const x2 = x1 - f1 * (x1 - x0) / (f1 - f0);
        const error = Math.abs(x2 - x1);

        this.estado.iteraciones.push({ iter: k + 1, x: x2, fx: this.evaluarFuncion(x2), error: error });

        if (error < this.estado.tol || Math.abs(this.evaluarFuncion(x2)) < 1e-10) {
          this.estado.raiz = x2;
          this.estado.convergio = true;
          break;
        }

        x0 = x1;
        x1 = x2;
      }

      if (this.estado.convergio) {
        this.mostrarResultado();
        Notificaciones.exito('Raíz: x = ' + this.estado.raiz.toFixed(6));
      } else {
        Notificaciones.error('No convergió');
      }
    } catch (e) {
      Notificaciones.error('Error: ' + e.message);
    }
  },

  mostrarResultado() {
    const html = '<div class="resultado-principal"><p><strong>Raíz:</strong></p><span class="numero-raiz">' + this.estado.raiz.toFixed(6) + '</span><p>f(x) = ' + this.evaluarFuncion(this.estado.raiz).toFixed(8) + '</p><p>Iteraciones: ' + this.estado.iteraciones.length + '</p></div>';
    document.getElementById('resultadoRaiz').innerHTML = html;
    document.getElementById('contenedorResultado').classList.remove('oculto');
    document.getElementById('contenedorTabla').classList.add('oculto');
  },

  alternarTabla() {
    const tabla = document.getElementById('contenedorTabla');
    if (tabla.classList.contains('oculto')) {
      let html = '<table class="tabla-metodo"><thead><tr><th>Iter</th><th>x</th><th>f(x)</th><th>Error</th></tr></thead><tbody>';
      this.estado.iteraciones.forEach(it => {
        html += '<tr><td>' + it.iter + '</td><td>' + it.x.toFixed(6) + '</td><td>' + it.fx.toFixed(6) + '</td><td>' + it.error.toExponential(3) + '</td></tr>';
      });
      html += '</tbody></table>';
      document.getElementById('tablaIteraciones').innerHTML = html;
      tabla.classList.remove('oculto');
    } else {
      tabla.classList.add('oculto');
    }
  },

  limpiar() {
    document.getElementById('funcion').value = '';
    document.getElementById('x0').value = '';
    document.getElementById('x1').value = '';
    document.getElementById('contenedorResultado').classList.add('oculto');
    document.getElementById('contenedorTabla').classList.add('oculto');
    Notificaciones.info('Campos limpiados');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.vincularEventos();
});
