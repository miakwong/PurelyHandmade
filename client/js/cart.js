document.addEventListener("DOMContentLoaded", function () {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsContainer = document.getElementById("cart-items");
  const subtotalElem = document.getElementById("subtotal");
  const totalElem = document.getElementById("total");

  function renderCart() {
    cartItemsContainer.innerHTML = "";
    let subtotal = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `<p class="text-center">Your shopping bag is empty.</p>`;
      subtotalElem.innerText = "0.00";
      totalElem.innerText = "0.00";
      return;
    }

    cart.forEach((item, index) => {
      let itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      let cartItem = document.createElement("div");
      cartItem.classList.add("d-flex", "justify-content-between", "align-items-center", "border-bottom", "p-3");

      cartItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${item.name}" width="80" class="me-3">
                    <div>
                        <h5>${item.name}</h5>
                        <p>${item.description}</p>
                        <p>$${item.price} x ${item.quantity}</p>
                    </div>
                </div>
                <div>
                    <button class="btn btn-sm btn-danger remove-item" data-index="${index}"><i class="fa fa-trash"></i></button>
                </div>
            `;

      cartItemsContainer.appendChild(cartItem);
    });

    subtotalElem.innerText = subtotal.toFixed(2);
    totalElem.innerText = subtotal.toFixed(2);
  }

  cartItemsContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-item")) {
      const index = e.target.dataset.index;
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }
  });

  renderCart();
});
