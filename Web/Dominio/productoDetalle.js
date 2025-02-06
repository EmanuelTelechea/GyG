document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        fetch(`http://localhost:3000/api/articulos/${productId}`)
            .then(response => response.json())
            .then(product => {
                const imageUrl = product.imagenes.length > 0 ? product.imagenes[0] : 'default-image.jpg'; // Fallback image

                let imagePreviews = '';
                product.imagenes.forEach((image, index) => {
                    imagePreviews += `
                        <div class="col-2">
                            <img src="${image}" class="img-thumbnail" onclick="changeMainImage('${image}')" alt="Product Image ${index + 1}">
                        </div>
                    `;
                });

                const productDetails = `
                    <div class="col-md-6">
                        <img id="main-product-image" src="${imageUrl}" alt="${product.nombre}" class="img-fluid"/>
                        <div class="row mt-2">
                            ${imagePreviews}
                        </div>
                    </div>
                    <div class="col-md-6" id="product-info">
                        <h2>${product.nombre}</h2>
                        <br>
                        <h3>$${product.precio}</h3>
                        <br>
                        <h5>Quedan ${product.stock} unidades disponibles</h5>
                    </div>
                    <div class="col-md-12" id="product-description">
                        <h3>Descripcion</h3>
                        <p>${product.descripcion}</p>
                        <p>Medidas: ${product.medidas} cm</p>
                        <p>Categoría: ${product.categoria_id}</p>
                    </div>
                    <div class="col-md-12" id="related-products">
                        <h3>Productos Relacionados</h3>
                        <div id="related-products-carousel" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-inner" id="related-products-list">
                                <!-- Related products will be loaded here -->
                            </div>
                            <button class="carousel-control-prev custom-carousel-control" type="button" data-bs-target="#related-products-carousel" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next custom-carousel-control" type="button" data-bs-target="#related-products-carousel" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>
                `;
                document.getElementById('product-details').innerHTML = productDetails;

                // Fetch related products
                fetch(`http://localhost:3000/api/articulos/categorias/${product.categoria_id}`)
                    .then(response => response.json())
                    .then(relatedProducts => {
                        displayRelatedProducts(relatedProducts, productId);
                    })
                    .catch(error => console.error('Error fetching related products:', error));
            })
            .catch(error => console.error('Error fetching product details:', error));
    }

    function displayRelatedProducts(products, currentProductId) {
        const relatedProductsList = document.getElementById('related-products-list');
        relatedProductsList.innerHTML = ''; // Clear existing products
        if (Array.isArray(products)) {
            let slideContent = '';
            products.forEach((product, index) => {
                if (product.id !== currentProductId) { // Exclude the current product
                    const imageUrl = product.imagenes.length > 0 ? product.imagenes[0] : 'default-image.jpg'; // Fallback image
                    if (index % 1 === 0) { // Cambiar de uno en uno
                        if (slideContent) {
                            relatedProductsList.innerHTML += slideContent;
                        }
                        slideContent = `<div class="carousel-item ${index === 0 ? 'active' : ''}"><div class="row">`;
                    }
                    slideContent += `
                        <div class="col-md-3 mb-4">
                            <div class="card articulo-card" onclick="window.location.href='productoDetalle.html?id=${product.id}'">
                                <img alt="${product.nombre}" class="card-img-top" height="300" src="${imageUrl}" width="300"/>
                                <div class="card-body">
                                    <h5 class="card-title">${product.nombre}</h5>
                                    <p class="card-text">$${product.precio}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    if (index % 1 === 0 || index === products.length - 1) { // Cambiar de uno en uno
                        slideContent += `</div></div>`;
                    }
                }
            });
            relatedProductsList.innerHTML += slideContent;
        } else {
            console.error('No related products found in the response.');
        }
    }
});

function changeMainImage(imageUrl) {
    document.getElementById('main-product-image').src = imageUrl;
}