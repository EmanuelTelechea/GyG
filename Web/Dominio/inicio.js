document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:3000/api/destacados')
    .then(response => {
        console.log(response);
        return response.json();
    })
    .then(data => {
        console.log(data);
        const articuloList = document.getElementById('featured-articulo-list');
        if (Array.isArray(data)) {
            let slideContent = '';
            data.forEach((articulo, index) => {
                if (index % 1 === 0) { // Cambiar de uno en uno
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
                if (index % 1 === 0 || index === data.length - 1) { // Cambiar de uno en uno
                    slideContent += `</div></div>`;
                }
            });
            articuloList.innerHTML += slideContent;
        } else {
            console.error('No articulos found in the response.');
        }
    })
    .catch(error => console.error('Error fetching articulos:', error));
});

document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:3000/api/en-oferta')
    .then(response => {
        console.log(response);
        return response.json();
    })
    .then(data => {
        console.log(data);
        const articuloList = document.getElementById('articulo-en-oferta');
        if (Array.isArray(data)) {
            let slideContent = '';
            data.forEach((articulo, index) => {
                if (index % 1 === 0) { // Cambiar de uno en uno
                    if (slideContent) {
                        articuloList.innerHTML += slideContent;
                    }
                    slideContent = `<div class="carousel-item ${index === 0 ? 'active' : ''}"><div class="row">`;
                }
                slideContent += `
                    <div class="col-md-3 mb-4">
                        <div class="card articulo-card" onclick="window.location.href='productoDetalle.html?id=${articulo.id}'">
                            <img alt="${articulo.nombre}" class="card-img-top" height="300" src="${articulo.imagenes}" width="300"/>
                            <div class="card-body">
                                <h5 class="card-title">${articulo.nombre}</h5>
                                <p class="card-text">$${articulo.precio}</p>
                            </div>
                        </div>
                    </div>
                `;
                if (index % 1 === 0 || index === data.length - 1) { // Cambiar de uno en uno
                    slideContent += `</div></div>`;
                }
            });
            articuloList.innerHTML += slideContent;
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
