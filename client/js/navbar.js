document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector(".navbar");

  // Example: Change background color on scroll
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Example: Dynamically add a new nav item
  const newNavItem = document.createElement("li");
  newNavItem.classList.add("nav-item");

  const newLink = document.createElement("a");
  newLink.classList.add("nav-link");
  newLink.href = "#";
  newLink.textContent = "Contact Us";

  newNavItem.appendChild(newLink);
  document.querySelector(".custom-navbar").appendChild(newNavItem);
});
