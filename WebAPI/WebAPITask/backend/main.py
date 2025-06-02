from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os

# Запуск через терминал: uvicorn backend.main:app --reload и открыть frontend/index.html
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

def init_db(db_path: str = "app.db"):
    # Создаём БД, если ещё нет
    if not os.path.isfile(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                in_stock INTEGER NOT NULL DEFAULT 1
            )
        """)
        conn.commit()
        conn.close()
        print(f"БД создана: {db_path}")
    else:
        print(f"БД уже существует: {db_path}")

@app.get("/products")
def get_products():
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, price, in_stock FROM products")
    rows = cursor.fetchall()
    conn.close()
    return [
        {"id": r[0], "name": r[1], "price": r[2], "in_stock": bool(r[3])}
        for r in rows
    ]

@app.post("/products")
async def create_product(request: Request):
    data = await request.json()
    name = data.get("name")
    price = data.get("price")
    in_stock = data.get("in_stock", True)

    if not isinstance(name, str) or not name:
        raise HTTPException(status_code=422, detail="Поле name обязательно и должно быть строкой")
    if not isinstance(price, (int, float)):
        raise HTTPException(status_code=422, detail="Поле price обязательно и должно быть числом")

    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO products (name, price, in_stock) VALUES (?, ?, ?)",
        (name, price, int(bool(in_stock)))
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return {"id": new_id, "name": name, "price": price, "in_stock": bool(in_stock)}

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM products WHERE id = ?", (product_id,))
    count = cursor.fetchone()[0]
    if count == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Продукт не найден")

    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return {"id": product_id}



init_db()