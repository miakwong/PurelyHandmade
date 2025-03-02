document.addEventListener("DOMContentLoaded", function () {
  const recommendedItems = document.getElementById("recommended-items");
  const sidebar = document.getElementById("sidebar");
  const designerCarousel = document.getElementById("designerCarousel");

  // Navigation links
  const newArrivalsLink = document.getElementById("newArrivalsLink");
  const onSaleLink = document.getElementById("onSaleLink");

  // Category filter links
  const categoryLinks = document.querySelectorAll(".category-link");

  // Image directory path
  const imgPath = "../../assets/img/";

  console.log("Testing image path:", imgPath + "mug_1.JPG");

  // Product data
  const products = {
    newArrivals: [
      { img: "mug_1.JPG", title: "Handmade Mug", price: "$25" },
      { img: "wood_item2_1.JPG", title: "Wood Carving Art2", price: "$40" },
      { img: "handwoven_item2_1.JPG", title: "Handwoven Toy", price: "$30" },
      { img: "mug_item2_1.JPG", title: "Handmade Mug2", price: "$30" },
      { img: "Handwoven_1.JPG", title: "Handwoven Scarf", price: "$40" },
      { img: "Wood_1.JPG", title: "Wood Carving Art", price: "$30" },
    ],
    onSale: [
      { img: "handwoven_item2_1.JPG", title: "Handwoven Basket", price: "$20", discount: "5% OFF" },
      { img: "Wood_1.JPG", title: "Wood Carving Art", price: "$35", discount: "10% OFF" }
    ],
    categories: {
      ceramics: [
        { img: "mug_1.JPG", title: "Handmade Mug", price: "$25" },
        { img: "mug_item2_1.JPG", title: "Handmade Mug2", price: "$30" }
      ],
      art: [
      ],
      accessories: [
        { img: "handwoven_item2_1.JPG", title: "Handwoven Toy", price: "$30" },
        { img: "Handwoven_1.JPG", title: "Handwoven Scarf", price: "$40" }
      ],
      home: [
        { img: "wood_item2_1.JPG", title: "Wood Carving Art2", price: "$40" },
        { img: "Wood_1.JPG", title: "Wood Carving Art", price: "$30" }
      ]
    }
  };


  /**
   * Function to render product cards dynamically
   * @param {Array} items - List of products to display
   */
  function renderProducts(items, title, category) {
    recommendedItems.innerHTML = `
        <h2 class="text-center">${title}</h2>
        <div class="row">
          ${items.map(item => `
            <div class="col-md-4">
              <div class="card">
                <div class="image-container">
                  ${item.discount ? `<span class="discount-badge">${item.discount}</span>` : ""}
                  <img src="${imgPath}${item.img}" class="card-img-top" alt="${item.title}">
                </div>
                <div class="card-body">
                  <h5 class="card-title">${item.title}</h5>
                  <p class="card-text">${item.price}</p>
                  <a href="src//views/product/product_detail.html?name=${encodeURIComponent(item.title)}&category=${encodeURIComponent(category)}" class="btn btn-primary">View</a>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
    `;
  }
  console.log("Final Image Path:", imgPath + "mug_1.JPG");


  // Toggle New Arrivals section
  if (newArrivalsLink) {
    newArrivalsLink.addEventListener("click", function (event) {
      event.preventDefault();
      sidebar.classList.add("d-none");
      designerCarousel.classList.add("d-none");
      renderProducts(products.newArrivals, "New Arrivals");
    });
  }

  // Toggle On Sale section
  if (onSaleLink) {
    onSaleLink.addEventListener("click", function (event) {
      event.preventDefault();
      sidebar.classList.add("d-none");
      designerCarousel.classList.add("d-none");
      renderProducts(products.onSale, "On Sale - Special Discount");
    });
  }


  // Handle category filter click event
  categoryLinks.forEach(link => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const category = this.getAttribute("data-category");

      // Show sidebar and designer carousel when filtering by category
      sidebar.classList.remove("d-none");
      designerCarousel.classList.remove("d-none");

      // Render products based on selected category
      if (products.categories[category]) {
        const categoryTitle = this.textContent;
        renderProducts(products.categories[category], `${categoryTitle}`);
      }
    });
  });
});
