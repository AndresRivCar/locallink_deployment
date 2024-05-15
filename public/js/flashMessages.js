// Remover mensajes de flash después de 5 segundos
setTimeout(function() {
    var alertas = document.querySelectorAll('.alertas');
    alertas.forEach(function(alerta) {
        alerta.remove();
    });
}, 5000);