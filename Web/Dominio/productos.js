document.addEventListener('DOMContentLoaded', function() {
    // Fetch all categories and populate the sidebar
    fetch('http://localhost:3000/api/categorias')
        .then(response => response.json())
        .then(categories => {
            const sidebar = document.getElementById('sidebarMenu');
            sidebar.innerHTML = ''; 
            categories.forEach(category => {
                const categoryLink = document.createElement('a');
                categoryLink.className = 'nav-link';
                categoryLink.href = '#';
                categoryLink.innerHTML = ` ${category.nombre}`;
                categoryLink.addEventListener('click', function() {
                    filterProductsByCategory(category.id);
                });
                sidebar.appendChild(categoryLink);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));

    // Fetch all products
    fetch('http://localhost:3000/api/articulos')
        .then(response => response.json())
        .then(data => {
            displayProducts(data);
            const urlParams = new URLSearchParams(window.location.search);
            const searchTerm = urlParams.get('search');
            if (searchTerm) {
                filterProductsBySearchTerm(searchTerm, data);
            }
        })
        .catch(error => console.error('Error fetching products:', error));

    // Function to filter products by category
    function filterProductsByCategory(categoryId) {
        fetch(`http://localhost:3000/api/articulos/${categoryId}`)
            .then(response => response.json())
            .then(data => {
                displayProducts(data);
            })
            .catch(error => console.error('Error fetching filtered products:', error));
    }

    // Function to display products
    function displayProducts(products) {
        const productList = document.getElementById('articulo-list');
        productList.innerHTML = ''; // Clear existing products
        if (Array.isArray(products)) {
            products.forEach(product => {
                const imageUrl = product.imagenes.length > 0 ? product.imagenes[0] : 'default-image.jpg'; // Fallback image
                const productCard = `
                    <div class="col-md-3 mb-4">
                        <div class="card articulo-card">
                            <img alt="${product.nombre}" class="card-img-top" height="300" src="${imageUrl}" width="300"/>
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
    }

    // Sorting functionality
    document.getElementById('sortOptions').addEventListener('change', function() {
        const sortValue = this.value;
        fetch('http://localhost:3000/api/articulos')
            .then(response => response.json())
            .then(data => {
                if (sortValue === 'priceAsc') {
                    data.sort((a, b) => a.precio - b.precio);
                } else if (sortValue === 'priceDesc') {
                    data.sort((a, b) => b.precio - a.precio);
                } else if (sortValue === 'nameAsc') {
                    data.sort((a, b) => a.nombre.localeCompare(b.nombre));
                } else if (sortValue === 'nameDesc') {
                    data.sort((a, b) => b.nombre.localeCompare(a.nombre));
                }
                displayProducts(data);
            })
            .catch(error => console.error('Error fetching products for sorting:', error));
    });

    // Fetch individual product details if on productoDetalle.html
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
        fetch(`http://localhost:3000/api/articulos/${productId}`)
            .then(response => response.json())
            .then(product => {
                const imageUrl = product.imagenes.length > 0 ? product.imagenes[0] : 'default-image.jpg'; // Fallback image
                const productDetails = `
                    <div class="col-md-6">
                        <img src="${imageUrl}" alt="${product.nombre}" class="img-fluid"/>
                    </div>
                    <div class="col-md-6" id="product-info">
                        <h2>${product.nombre}</h2>
                        <br>
                        <h3>$${product.precio}</h3>
                        <h5>Quedan ${product.stock} unidades disponibles</h5>
                    </div>
                    <div class="col-md-12">
                    <h3>Descripcion</h3>
                        <p>${product.descripcion}</p>
                        <p>Medidas: ${product.medidas} cm</p>
                        <p>Categoría: ${product.categoria_id}</p>
                    </div>
                `;
                document.getElementById('product-details').innerHTML = productDetails;
            })
            .catch(error => console.error('Error fetching product details:', error));
    }

    

    // Function to filter products by search term
    function filterProductsBySearchTerm(searchTerm, products) {
        const productList = document.getElementById('articulo-list');
        productList.innerHTML = ''; // Clear existing products
        const filteredProducts = products.filter(product => 
            product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        displayProducts(filteredProducts);
    }
});

document.getElementById('searchButton').addEventListener('click', function() {
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm) {
        window.location.href = `productos.html?search=${encodeURIComponent(searchTerm)}`;
    }
});