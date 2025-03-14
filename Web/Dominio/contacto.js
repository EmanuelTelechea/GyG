document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formResponse = document.getElementById('formResponse');

    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const message = formData.get('message');

        fetch('http://gyg-production-312a.up.railway.app/api/contacto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, message })
        })
        .then(response => response.json())
        .then(data => {
            formResponse.innerHTML = '<div class="alert alert-success">Mensaje enviado con éxito.</div>';
            contactForm.reset();
        })
        .catch(error => {
            formResponse.innerHTML = '<div class="alert alert-danger">Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.</div>';
            console.error('Error:', error);
        });
    });
});
