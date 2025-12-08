/* === FUNCIONES UTILITARIAS COMPARTIDAS === */

const Utils = {
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

  formatear(numero) {
    if (Number.isInteger(numero)) {
      return numero.toString();
    }
    return parseFloat(numero.toFixed(6)).toString();
  }
};
