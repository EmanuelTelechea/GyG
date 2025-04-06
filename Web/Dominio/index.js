document.addEventListener("DOMContentLoaded", () => {
  // Cargar productos destacados
  loadFeaturedProducts()

  // Cargar productos en oferta
  loadSaleProducts()

  // Configurar búsqueda
  setupSearch()

  // Configurar navegación de carruseles
  setupCarouselNavigation()
})

// Función para configurar la navegación de los carruseles
function setupCarouselNavigation() {
  // Carrusel de productos destacados
  const featuredSlider = document.getElementById("featured-products-slider")
  const featuredPrev = document.getElementById("featured-prev")
  const featuredNext = document.getElementById("featured-next")

  if (featuredSlider && featuredPrev && featuredNext) {
    featuredPrev.addEventListener("click", () => {
      scrollCarousel(featuredSlider, -1)
    })

    featuredNext.addEventListener("click", () => {
      scrollCarousel(featuredSlider, 1)
    })
  }

  // Carrusel de productos en oferta
  const saleSlider = document.getElementById("sale-products-slider")
  const salePrev = document.getElementById("sale-prev")
  const saleNext = document.getElementById("sale-next")

  if (saleSlider && salePrev && saleNext) {
    salePrev.addEventListener("click", () => {
      scrollCarousel(saleSlider, -1)
    })

    saleNext.addEventListener("click", () => {
      scrollCarousel(saleSlider, 1)
    })
  }
}

// Función para desplazar el carrusel
function scrollCarousel(slider, direction) {
  const cardWidth = slider.querySelector(".product-card-container")?.offsetWidth || 0
  const scrollAmount = cardWidth + 20 // 20px es el gap entre tarjetas

  if (direction > 0) {
    slider.scrollLeft += scrollAmount
  } else {
    slider.scrollLeft -= scrollAmount
  }
}

// Función para cargar productos destacados
function loadFeaturedProducts() {
  fetch("https://gyg-production.up.railway.app/api/destacados")
    .then((response) => response.json())
    .then((data) => {
      const productsSlider = document.getElementById("featured-products-slider");

      if (Array.isArray(data) && data.length > 0) {
        // Limpiar el contenedor
        productsSlider.innerHTML = "";

        // Agregar cada producto al slider
        data.forEach((articulo) => {
          // Verificar y obtener la URL de la imagen correctamente
          const imageUrl = Array.isArray(articulo.imagenes) && articulo.imagenes.length > 0
            ? articulo.imagenes[0]
            : typeof articulo.imagenes === "string"
            ? articulo.imagenes
            : "img/default-image.jpg"; // Imagen por defecto

          // Crear elemento de producto
          const productElement = document.createElement("div");
          productElement.className = "product-card-container";

          productElement.innerHTML = `
            <div class="product-card" onclick="window.location.href='productoDetalle.html?id=${articulo.id}'">
              <div class="product-image-container">
                <img src="${imageUrl}" alt="${articulo.nombre}" class="product-image">
              </div>
              <div class="card-body">
                <h5 class="card-title">${articulo.nombre}</h5>
                <p class="card-text">$${articulo.precio}</p>
                <a href="productoDetalle.html?id=${articulo.id}" class="btn btn-primary">Ver detalles</a>
              </div>
            </div>
          `;

          productsSlider.appendChild(productElement);
        });

        console.log("Productos destacados cargados:", data);
      } else {
        console.error("No se encontraron productos destacados o el formato de datos es incorrecto.");
        loadFallbackFeaturedProducts();
      }
    })
    .catch((error) => {
      console.error("Error al cargar productos destacados:", error);
      loadFallbackFeaturedProducts();
    });
}

// Función para cargar productos en oferta
function loadSaleProducts() {
  fetch("https://gyg-production.up.railway.app/api/en-oferta")
    .then((response) => response.json())
    .then((data) => {
      const productsSlider = document.getElementById("sale-products-slider");

      if (Array.isArray(data) && data.length > 0) {
        // Limpiar el contenedor
        productsSlider.innerHTML = "";

        // Agregar cada producto al slider
        data.forEach((articulo) => {
          // Verificar y obtener la URL de la imagen correctamente
          const imageUrl = Array.isArray(articulo.imagenes) && articulo.imagenes.length > 0
            ? articulo.imagenes[0]
            : typeof articulo.imagenes === "string"
            ? articulo.imagenes
            : "img/default-image.jpg"; // Imagen por defecto

          // Calcular descuento (ejemplo: 20% de descuento)
          const discount = "20%"; // Puedes calcular esto si tienes el precio original y el precio de oferta
          const originalPrice = (Number.parseFloat(articulo.precio) * 1.25).toFixed(2); // Ejemplo: precio original es 25% más

          // Crear elemento de producto
          const productElement = document.createElement("div");
          productElement.className = "product-card-container";

          productElement.innerHTML = `
            <div class="product-card" onclick="window.location.href='productoDetalle.html?id=${articulo.id}'">
              <div class="product-image-container">
                <img src="${imageUrl}" alt="${articulo.nombre}" class="product-image">
                <span class="discount-badge">-${discount}</span>
              </div>
              <div class="card-body">
                <h5 class="card-title">${articulo.nombre}</h5>
                <p class="card-text">
                  <span class="original-price">$${originalPrice}</span>
                  <span class="sale-price">$${articulo.precio}</span>
                </p>
                <a href="productoDetalle.html?id=${articulo.id}" class="btn btn-primary">Ver detalles</a>
              </div>
            </div>
          `;

          productsSlider.appendChild(productElement);
        });

        console.log("Productos en oferta cargados:", data);
      } else {
        console.error("No se encontraron productos en oferta o el formato de datos es incorrecto.");
        loadFallbackSaleProducts();
      }
    })
    .catch((error) => {
      console.error("Error al cargar productos en oferta:", error);
      loadFallbackSaleProducts();
    });
}

// Función para cargar productos destacados de respaldo en caso de error
function loadFallbackFeaturedProducts() {
  // Datos de ejemplo para productos destacados
  const featuredProducts = [
    {
      id: 1,
      nombre: "Mesa de Centro Rústica",
      precio: "15000",
      imagenes: { url: "img/product-1.jpg" },
    },
    {
      id: 2,
      nombre: "Estantería Vintage",
      precio: "8500",
      imagenes: { url: "img/product-2.jpg" },
    },
    {
      id: 3,
      nombre: "Lámpara de Madera",
      precio: "3200",
      imagenes: { url: "img/product-3.jpg" },
    },
    {
      id: 4,
      nombre: "Caja Decorativa",
      precio: "1800",
      imagenes: { url: "img/product-4.jpg" },
    },
    {
      id: 5,
      nombre: "Tabla para Picar",
      precio: "950",
      imagenes: { url: "img/product-5.jpg" },
    },
    {
      id: 6,
      nombre: "Portarretratos Artesanal",
      precio: "750",
      imagenes: { url: "img/product-6.jpg" },
    },
  ]

  const productsSlider = document.getElementById("featured-products-slider")

  if (productsSlider) {
    // Limpiar el contenedor
    productsSlider.innerHTML = ""

    // Agregar cada producto al slider
    featuredProducts.forEach((product) => {
      const productElement = document.createElement("div")
      productElement.className = "product-card-container"

      productElement.innerHTML = `
                <div class="product-card" onclick="window.location.href='productoDetalle.html?id=${product.id}'">
                    <div class="product-image-container">
                        <img src="${product.imagenes.url}" alt="${product.nombre}" class="product-image">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${product.nombre}</h5>
                        <p class="card-text">$${product.precio}</p>
                        <a href="productoDetalle.html?id=${product.id}" class="btn btn-primary">Ver detalles</a>
                    </div>
                </div>
            `

      productsSlider.appendChild(productElement)
    })
  }
}

// Función para cargar productos en oferta de respaldo en caso de error
function loadFallbackSaleProducts() {
  // Datos de ejemplo para productos en oferta
  const saleProducts = [
    {
      id: 7,
      nombre: "Banco de Madera",
      precio: "3750",
      imagenes: { url: "img/sale-1.jpg" },
    },
    {
      id: 8,
      nombre: "Organizador de Escritorio",
      precio: "1760",
      imagenes: { url: "img/sale-2.jpg" },
    },
    {
      id: 9,
      nombre: "Perchero de Pared",
      precio: "2450",
      imagenes: { url: "img/sale-3.jpg" },
    },
    {
      id: 10,
      nombre: "Caja de Té",
      precio: "840",
      imagenes: { url: "img/sale-4.jpg" },
    },
    {
      id: 11,
      nombre: "Bandeja Decorativa",
      precio: "1440",
      imagenes: { url: "img/sale-5.jpg" },
    },
    {
      id: 12,
      nombre: "Posavasos (Set de 4)",
      precio: "600",
      imagenes: { url: "img/sale-6.jpg" },
    },
  ]

  const productsSlider = document.getElementById("sale-products-slider")

  if (productsSlider) {
    // Limpiar el contenedor
    productsSlider.innerHTML = ""

    // Agregar cada producto al slider
    saleProducts.forEach((product) => {
      const discount = "20%"
      const originalPrice = (Number.parseFloat(product.precio) * 1.25).toFixed(2)

      const productElement = document.createElement("div")
      productElement.className = "product-card-container"

      productElement.innerHTML = `
                <div class="product-card" onclick="window.location.href='productoDetalle.html?id=${product.id}'">
                    <div class="product-image-container">
                        <img src="${product.imagenes.url}" alt="${product.nombre}" class="product-image">
                        <span class="discount-badge">-${discount}</span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${product.nombre}</h5>
                        <p class="card-text">
                            <span class="original-price">$${originalPrice}</span>
                            <span class="sale-price">$${product.precio}</span>
                        </p>
                        <a href="productoDetalle.html?id=${product.id}" class="btn btn-primary">Ver detalles</a>
                    </div>
                </div>
            `

      productsSlider.appendChild(productElement)
    })
  }
}

// Función para configurar la búsqueda
function setupSearch() {
  const searchInput = document.getElementById("searchInput")
  const searchButton = document.getElementById("searchButton")

  if (searchButton) {
    searchButton.addEventListener("click", () => {
      performSearch(searchInput.value)
    })
  } else {
    console.error('Element with id "searchButton" not found.')
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        performSearch(searchInput.value)
      }
    })
  }
}

// Función para realizar la búsqueda
function performSearch(query) {
  if (query.trim() !== "") {
    // Redirigir a la página de resultados de búsqueda con el término de búsqueda
    window.location.href = `productos.html?search=${encodeURIComponent(query)}`
  }
}

