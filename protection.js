// Proteção do código fonte - Calculadora Moto Chefe
// Desenvolvido por Alan Rigon e Alisson Aldias

(function() {
  'use strict';

  // Desabilitar menu de contexto (botão direito)
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Desabilitar seleção de texto (opcional - pode ser removido se necessário)
  document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
  });

  // Desabilitar arrastar e soltar
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  });

  // Desabilitar atalhos de teclado
  document.addEventListener('keydown', function(e) {
    // F12 - DevTools
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I - DevTools
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+J - Console
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+C - Inspect Element
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }

    // Ctrl+U - View Source
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }

    // Ctrl+S - Save Page
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }

    // Ctrl+P - Print (pode manter se quiser permitir impressão)
    // if (e.ctrlKey && e.key === 'p') {
    //   e.preventDefault();
    //   return false;
    // }

    // Ctrl+Shift+P - Command Palette (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+K - Console (Firefox)
    if (e.ctrlKey && e.shiftKey && e.key === 'K') {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+E - Network (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      return false;
    }

    // Desabilitar Ctrl+A (selecionar tudo) - opcional
    // if (e.ctrlKey && e.key === 'a') {
    //   e.preventDefault();
    //   return false;
    // }

    // Desabilitar Ctrl+C (copiar) - opcional
    // if (e.ctrlKey && e.key === 'c') {
    //   e.preventDefault();
    //   return false;
    // }
  });

  // Proteção contra inspeção de elementos
  let devtools = {open: false, orientation: null};
  const threshold = 160;
  
  setInterval(function() {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true;
        // Pode adicionar um aviso aqui se quiser
        console.clear();
        console.log('%c⚠️ ACESSO NEGADO ⚠️', 'color: red; font-size: 50px; font-weight: bold;');
        console.log('%cEste código é propriedade de Alan Rigon e Alisson Aldias.', 'color: red; font-size: 20px;');
        console.log('%cTodos os direitos reservados.', 'color: red; font-size: 20px;');
        console.log('%cÉ proibida a cópia, reprodução ou distribuição deste código.', 'color: red; font-size: 20px;');
      }
    } else {
      devtools.open = false;
    }
  }, 500);

  // Proteção contra cópia via console
  Object.defineProperty(window, 'console', {
    value: console,
    writable: false,
    configurable: false
  });

  // Aviso de copyright no console
  console.log('%c⚠️ AVISO ⚠️', 'color: red; font-size: 30px; font-weight: bold;');
  console.log('%cEste código é propriedade de Alan Rigon e Alisson Aldias.', 'color: red; font-size: 16px;');
  console.log('%cTodos os direitos reservados. É proibida a cópia, reprodução ou distribuição.', 'color: red; font-size: 14px;');

})();

