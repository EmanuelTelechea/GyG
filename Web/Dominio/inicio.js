document.addEventListener('DOMContentLoaded', function() {
    fetch('http://gyg-production-312a.up.railway.app/api/destacados')
    .then(response => response.json())
    .then(data => {
        const articuloList = document.getElementById('featured-articulo-list');
        const prevButton = document.querySelector('#featured-carousel .carousel-control-prev');
        const nextButton = document.querySelector('#featured-carousel .carousel-control-next');

        if (Array.isArray(data)) {
            let slideContent = '';
            data.forEach((articulo, index) => {
                if (index % 4 === 0) {
                    if (slideContent) {
                        articuloList.innerHTML += slideContent;
                    }
                    slideContent = `<div class="carousel-item ${index === 0 ? 'active' : ''}"><div class="row">`;
                }
                slideContent += `
                    <div class="col-md-3 mb-4">
                        <div class="card articulo-card" onclick="window.location.href='productoDetalle.html?id=${articulo.id}'">
                            <img alt="${articulo.nombre}" class="card-img-top" height="300" src="${articulo.imagenes.url}" width="300"/>
                            <div class="card-body">
                                <h5 class="card-title">${articulo.nombre}</h5>
                                <p class="card-text">$${articulo.precio}</p>
                            </div>
                        </div>
                    </div>
                `;
                if (index % 4 === 3 || index === data.length - 1) {
                    slideContent += `</div></div>`;
                }
            });
            articuloList.innerHTML += slideContent;

            // Ocultar flechas si hay 4 o menos elementos
            if (data.length <= 4) {
                prevButton.style.display = 'none';
                nextButton.style.display = 'none';
            }
        } else {
            console.error('No articulos found in the response.');
        }
    })
    .catch(error => console.error('Error fetching articulos:', error));
});

document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('searchButton').click();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    fetch('http://gyg-production-312a.up.railway.app/api/en-oferta')
    .then(response => response.json())
    .then(data => {
        const articuloList = document.getElementById('articulo-en-oferta');
        const prevButton = document.querySelector('#offer-carousel .carousel-control-prev');
        const nextButton = document.querySelector('#offer-carousel .carousel-control-next');

        if (Array.isArray(data)) {
            let slideContent = '';
            data.forEach((articulo, index) => {
                if (index % 4 === 0) {
                    if (slideContent) {
                        articuloList.innerHTML += slideContent;
                    }
                    slideContent = `<div class="carousel-item ${index === 0 ? 'active' : ''}"><div class="row">`;
                }
                slideContent += `
                    <div class="col-md-3 mb-4">
                        <div class="card articulo-card" onclick="window.location.href='productoDetalle.html?id=${articulo.id}'">
                            <img alt="${articulo.nombre}" class="card-img-top" height="300" src="${articulo.imagenes.url}" width="300"/>
                            <div class="card-body">
                                <h5 class="card-title">${articulo.nombre}</h5>
                                <p class="card-text">$${articulo.precio}</p>
                            </div>
                        </div>
                    </div>
                `;
                if (index % 4 === 3 || index === data.length - 1) {
                    slideContent += `</div></div>`;
                }
            });
            articuloList.innerHTML += slideContent;

            // Ocultar flechas si hay 4 o menos elementos
            if (data.length <= 4) {
                prevButton.style.display = 'none';
                nextButton.style.display = 'none';
            }
        } else {
            console.error('No articulos found in the response.');
        }
    })
    .catch(error => console.error('Error fetching articulos:', error));
});

const searchButton = document.getElementById('searchButton');
if (searchButton) {
    searchButton.addEventListener('click', function() {
        const searchTerm = document.getElementById('searchInput').value;
        if (searchTerm) {
            window.location.href = `productos.html?search=${encodeURIComponent(searchTerm)}`;
        }
    });
} else {
    console.error('Element with id "searchButton" not found.');
}
