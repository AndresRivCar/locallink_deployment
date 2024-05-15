import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
    const attendance = document.querySelector('#confirm-assistance');
    if(attendance) {
        attendance.addEventListener('submit', confirmAssistance);
    }

});

function confirmAssistance(e) {
    e.preventDefault();

    const btn = document.querySelector('#confirm-assistance input[type="submit"]');
    let action = document.querySelector('#action').value;
    const message = document.querySelector('#message');

    // limpia la respuesta previa
    while (message.firstChild) {
        message.removeChild(message.firstChild);
    }

    // obtiene el valor cancelar o confirmar en el hidden
    const data = {
        action
    }

    axios.post(this.getAttribute('action'), data)
        .then(response => {
            // actualiza el número de asistentes en la página
            const numAttendees = document.getElementById('num-attendees');
            const currentAttendees = parseInt(numAttendees.textContent.split(' ')[0]);
            numAttendees.textContent = (action === 'confirm') ? (currentAttendees + 1) + ' Asistentes' : (currentAttendees - 1) + ' Asistentes';

            if (action === 'confirm') {
                // modifica los elementos del boton
                document.querySelector('#action').value = 'cancel';
                btn.value = 'Cancelar';
                btn.classList.remove('btn-azul');
                btn.classList.add('btn-rojo');

            } else {
                document.querySelector('#action').value = 'confirm';
                btn.value = 'Si';
                btn.classList.remove('btn-rojo');
                btn.classList.add('btn-azul');
            }
            // mostrar un mensaje
            message.appendChild(document.createTextNode(response.data));
        })
        .catch(error => {
            console.error('Error:', error);
        });
}