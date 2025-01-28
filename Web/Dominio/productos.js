document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:3000/api/articulos')
        .then(response => {
            console.log(response);
            return response.json();
        })
        .then(data => {
            console.log(data);
            const productList = document.getElementById('articulo-list');
            if (Array.isArray(data)) {
                data.forEach(product => {
                    const productCard = `
                        <div class="col-md-3 mb-4">
                        <div class="card articulo-card">
                            <img alt="${product.nombre}" class="card-img-top" height="300" src="${product.foto}" width="300"/>
                            <div class="card-body">
                                <h5 class="card-title">${product.nombre}</h5>
                                <p class="card-text">$${product.precio}</p>
                                <a href="productoDetalle.html?id=${product.id}" class="btn btn-primary">Ver Detalles</a>
                            </div>
                        </div>
                    </div>
                    `;
                    productList.innerHTML += productCard;
                });
            } else {
                console.error('No products found in the response.');
            }
        })
        .catch(error => console.error('Error fetching products:', error));

    // Fetch individual product details if on productoDetalle.html
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
        fetch(`http://localhost:3000/api/articulos/${productId}`)
            .then(response => response.json())
            .then(product => {
                const productDetails = `
                    <div class="col-md-6">
                        <img src="${product.foto}" alt="${product.nombre}" class="img-fluid"/>
                    </div>
                    <div class="col-md-6">
                        <h2>${product.nombre}</h2>
                        <br>
                        <h3>$${product.precio}</h3>
                    </div>
                    <div class="col-md-12">
                    <h4>Descripción</h4>
                    <p>${product.descripcion}</p>
                    <p>Medidas: ${product.medidas} cm</p>
                        <p>Categoria: ${product.categoria}</p>
                    </div>
                `;
                document.getElementById('product-details').innerHTML = productDetails;
            })
            .catch(error => console.error('Error fetching product details:', error));
    }
});
