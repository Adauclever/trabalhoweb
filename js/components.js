fetch("header.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("header-container").innerHTML = data;

        const menuToggle = document.getElementById("menu-toggle");
        const navbar = document.getElementById("navbar");

        menuToggle.addEventListener("click", () => {
            navbar.classList.toggle("active");
        });
    });