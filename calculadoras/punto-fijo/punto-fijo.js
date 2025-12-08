const App = {
  calc() {
    try {
      const f = document.getElementById('funcion').value;
      const x0 = parseFloat(document.getElementById('x0').value);
      const tol = parseFloat(document.getElementById('tol').value);
      const maxIter = parseInt(document.getElementById('maxIter').value);
      
      Notificaciones.calcular('Calculando...');
      
      let x = x0, convergio = false;
      for (let i = 0; i < maxIter; i++) {
        const xnew = Function('x', 'return ' + f.replace(/\^/g, '**'))(x);
        if (Math.abs(xnew - x) < tol) { x = xnew; convergio = true; break; }
        x = xnew;
      }
      
      if (convergio) {
        document.getElementById('resDiv').innerHTML = '<p><strong>Solución: x = ' + x.toFixed(6) + '</strong></p>';
        document.getElementById('res').classList.remove('oculto');
        Notificaciones.exito('Raíz: ' + x.toFixed(6));
      } else {
        Notificaciones.error('No convergió');
      }
    } catch (e) { Notificaciones.error(e.message); }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnCalc').onclick = () => App.calc();
  document.getElementById('btnEj').onclick = () => { document.getElementById('funcion').value = '(x^2 + 2) / 3'; Notificaciones.exito('Ejemplo'); };
  document.getElementById('btnLim').onclick = () => { document.getElementById('funcion').value = ''; document.getElementById('res').classList.add('oculto'); };
});
