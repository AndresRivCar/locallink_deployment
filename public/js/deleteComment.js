import axios from 'axios';
import swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
	const deleteForm = document.querySelectorAll('.delete-comment');

	// revisar que existan los formularios
	if (deleteForm.length > 0) {
		deleteForm.forEach((form) => {
			form.addEventListener('submit', deleteComment);
		});
	}
});

function deleteComment(e) {
	e.preventDefault();

	swal.fire({
		title: '¿Eliminar Comentario?',
		text: 'Un comentario eliminado no se puede recuperar',
		type: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#068D9D',
		cancelButtonColor: '#B8336A',
		confirmButtonText: 'Si, borrar!',
		cancelButtonText: 'Cancelar'
	}).then((result) => {
		if (result.value) {
            // tomar el id del comentario
            const commentId = this.children[0].value;

            // crear el objeto
            const data = {
                commentId
            }

            // ejecutar axios y pasar los datos
			axios.post(this.action, data).then((response) => {
                swal.fire('Eliminado', response.data, 'success');
                
                // Eliminar del DOM
                this.parentElement.parentElement.remove();
			}).catch(error => {
                if(error.response.status === 403 || error.response.status === 404) {
					swal.fire('Error', error.response.data, 'error');
				}
            }) ;
		}
	});
}