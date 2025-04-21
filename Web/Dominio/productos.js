document.addEventListener('DOMContentLoaded', function() {
    // Fetch all categories and populate both sidebars
    fetch('https://gyg-production.up.railway.app/api/categorias')
        .then(response => response.json())
        .then(categories => {
            const sidebar = document.getElementById('categoryFilters');
            const mobileSidebar = document.getElementById('categoryFiltersMobile');
            if (sidebar && mobileSidebar) {
                sidebar.innerHTML = ''; 
                mobileSidebar.innerHTML = ''; 

                // Add "Todos los Productos" link
                const allProductsLink = document.createElement('a');
                allProductsLink.className = 'nav-link';
                allProductsLink.href = '#';
                allProductsLink.innerHTML = 'Todos los Productos';
                allProductsLink.addEventListener('click', function() {
                    fetchAllProducts();
                    closeMobileMenu(); // Cierra el menú móvil
                });
                sidebar.appendChild(allProductsLink);

                const allProductsLinkMobile = allProductsLink.cloneNode(true);
                allProductsLinkMobile.addEventListener('click', function() {
                    fetchAllProducts();
                    closeMobileMenu(); // Cierra el menú móvil
                });
                mobileSidebar.appendChild(allProductsLinkMobile);

                // Add category links
                categories.forEach(category => {
                    const categoryLink = document.createElement('a');
                    categoryLink.className = 'nav-link';
                    categoryLink.href = '#';
                    categoryLink.innerHTML = category.nombre;
                    categoryLink.addEventListener('click', function() {
                        filterProductsByCategory(category.id);
                        closeMobileMenu(); // Cierra el menú móvil
                    });
                    sidebar.appendChild(categoryLink);

                    const categoryLinkMobile = categoryLink.cloneNode(true);
                    categoryLinkMobile.addEventListener('click', function() {
                        filterProductsByCategory(category.id);
                        closeMobileMenu(); // Cierra el menú móvil
                    });
                    mobileSidebar.appendChild(categoryLinkMobile);
                });
            } else {
                console.error('No se encontraron los contenedores de categorías.');
            }
        })
        .catch(error => console.error('Error fetching categories:', error));

    // Fetch all products
    fetch('https://gyg-production.up.railway.app/api/articulos')
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

    // Function to fetch and display all products
    function fetchAllProducts() {
        fetch('https://gyg-production.up.railway.app/api/articulos')
            .then(response => response.json())
            .then(data => {
                displayProducts(data);
            })
            .catch(error => console.error('Error fetching all products:', error));
    }

    // Function to filter products by category
    function filterProductsByCategory(categoryId) {
        document.getElementById('articulo-list').setAttribute('data-category-id', categoryId);
        fetch(`https://gyg-production.up.railway.app/api/articulos/categorias/${categoryId}`)
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
        if (Array.isArray(products) && products.length > 0) {
            products.forEach(product => {
                const imageUrl = product.imagenes.length > 0 ? product.imagenes[0] : 'default-image.jpg'; // Fallback image
                const productCard = `
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
                productList.innerHTML += productCard;
            });
        } else {
            productList.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No se encontraron productos disponibles.</p>
                </div>
            `;
        }
    }

    // Function to close the mobile menu
    function closeMobileMenu() {
        const mobileCategoryMenu = document.getElementById('mobileCategoryMenu');
        if (mobileCategoryMenu) {
            mobileCategoryMenu.classList.remove('show'); // Asegura que el menú móvil se cierre
        }
    }

    // Sorting functionality
    document.getElementById('sortOptions').addEventListener('change', function() {
        const sortValue = this.value;
        const categoryId = document.getElementById('articulo-list').getAttribute('data-category-id');
        let fetchUrl = 'https://gyg-production.up.railway.app/api/articulos';

        if (categoryId) {
            fetchUrl = `https://gyg-production.up.railway.app/api/articulos/categorias/${categoryId}`;
        }

        fetch(fetchUrl)
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
