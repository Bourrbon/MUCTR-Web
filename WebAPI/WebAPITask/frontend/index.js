document.addEventListener("DOMContentLoaded", () => {
    loadProducts();

    // Создание продукта
    document.getElementById("product-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const priceValue = document.getElementById("price").value;
        const inStock = document.getElementById("in_stock").checked;

        // Проверка корректности ввода перед отправкой
        if (!name) {
            alert("Поле \"Название\" обязательно");
            return;
        }
        if (priceValue === "") {
            alert("Поле \"Цена\" обязательно");
            return;
        }
        const price = parseFloat(priceValue);
        if (isNaN(price) || price <= 0) {
            alert("Цена должна быть положительным числом");
            return;
        }

        const payload = { name, price, in_stock: inStock };

        try {
            const res = await fetch("http://localhost:8000/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                alert("Ошибка при создании: " + res.status + " " + res.statusText);
                return;
            }
            const newProduct = await res.json();
            appendProductToList(newProduct);
            document.getElementById("name").value = "";
            document.getElementById("price").value = "";
            document.getElementById("in_stock").checked = true;
        } catch (err) {
            console.error(err);
            alert("Сетевая ошибка при создании продукта.");
        }
    });

    // Удаление продукта
    document.getElementById("product-list").addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const li = e.target.closest("li");
            const productId = li.getAttribute("data-id");
            if (!productId) return;

            const confirmDelete = confirm("Удалить этот продукт?");
            if (!confirmDelete) return;

            try {
                const res = await fetch(`http://localhost:8000/products/${productId}`, {
                    method: "DELETE",
                });
                if (!res.ok) {
                    if (res.status === 404) {
                        alert("Продукт не найден (возможно, уже удалён).");
                    } else {
                        alert("Ошибка при удалении: " + res.status);
                    }
                    return;
                }
                // Удалить из списка
                li.remove();
            } catch (err) {
                console.error(err);
                alert("Сетевая ошибка при удалении продукта.");
            }
        }
    });
});

// Загрузка всех продуктов
async function loadProducts() {
    try {
        const res = await fetch("http://localhost:8000/products");
        if (!res.ok) {
            alert("Ошибка при загузке продуктов: " + res.status);
            return;
        }
        const products = await res.json();
        const ul = document.getElementById("product-list");
        ul.innerHTML = "";
        products.forEach(p => appendProductToList(p));
    } catch (err) {
        console.error(err);
        alert("Сетевая ошибка при загрузке продуктов.");
    }
}


function appendProductToList(product) {
    const ul = document.getElementById("product-list");
    const li = document.createElement("li");
    li.setAttribute("data-id", product.id);

    const text = document.createTextNode(
        `ID: ${product.id} — ${product.name}, цена: ${product.price}, в наличии: ${product.in_stock}`
    );
    li.appendChild(text);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Удалить";
    delBtn.classList.add("delete-btn");
    delBtn.style.marginLeft = "10px";
    li.appendChild(delBtn);

    ul.appendChild(li);
}
