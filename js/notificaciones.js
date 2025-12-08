/* === SISTEMA DE NOTIFICACIONES TOAST === */

const Notificaciones = {
  crear() {
    const contenedor = document.createElement('div');
    contenedor.id = 'contenedor-notificaciones';
    contenedor.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    document.body.appendChild(contenedor);
  },

  mostrar(mensaje, tipo = 'exito', duracion = 3000) {
    // Crear contenedor si no existe
    let contenedor = document.getElementById('contenedor-notificaciones');
    if (!contenedor) {
      this.crear();
      contenedor = document.getElementById('contenedor-notificaciones');
    }

    const notif = document.createElement('div');

    const colores = {
      exito: { bg: '#10b981', icon: '✓' },
      error: { bg: '#ef4444', icon: '✕' },
      info: { bg: '#3b82f6', icon: 'ℹ️' },
      calcular: { bg: '#002855', icon: '⚙️' }
    };

    const config = colores[tipo] || colores.info;

    notif.style.cssText = `
      background: ${config.bg};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 500;
      min-width: 250px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
      pointer-events: auto;
      cursor: pointer;
    `;

    const icon = document.createElement('span');
    icon.textContent = config.icon;
    icon.style.fontSize = '18px';
    icon.style.flexShrink = '0';

    const texto = document.createElement('span');
    texto.textContent = mensaje;
    texto.style.flex = '1';

    notif.appendChild(icon);
    notif.appendChild(texto);

    contenedor.appendChild(notif);

    // Cerrar al hacer click
    notif.addEventListener('click', () => {
      notif.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => notif.remove(), 300);
    });

    // Auto cerrar
    if (duracion > 0) {
      setTimeout(() => {
        if (notif.parentElement) {
          notif.style.animation = 'slideOut 0.3s ease-out forwards';
          setTimeout(() => notif.remove(), 300);
        }
      }, duracion);
    }
  },

  exito(msg, duracion = 2500) {
    this.mostrar(msg, 'exito', duracion);
  },

  error(msg, duracion = 3500) {
    this.mostrar(msg, 'error', duracion);
  },

  info(msg, duracion = 3000) {
    this.mostrar(msg, 'info', duracion);
  },

  calcular(msg = 'Calculando...', duracion = 1500) {
    this.mostrar(msg, 'calcular', duracion);
  }
};

// Inyectar animaciones CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
