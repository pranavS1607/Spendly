from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )


@app.route("/")
def home():
    return jsonify({"message": "Spendly API is running!"})


@app.route("/expenses", methods=["GET"])
def get_expenses():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, amount, category, description, expense_date
        FROM expenses
        ORDER BY expense_date DESC, id DESC
    """)

    expenses = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(expenses)


@app.route("/expenses", methods=["POST"])
def add_expense():
    data = request.json

    amount = data.get("amount")
    category = data.get("category")
    description = data.get("description")
    expense_date = data.get("expense_date")

    if not amount or not category or not expense_date:
        return jsonify({"error": "Missing required fields"}), 400

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        INSERT INTO expenses
        (amount, category, description, expense_date)
        VALUES (%s, %s, %s, %s)
    """, (amount, category, description, expense_date))

    db.commit()

    new_id = cursor.lastrowid

    cursor.close()
    db.close()

    return jsonify({
        "message": "Expense added successfully",
        "id": new_id
    }), 201


@app.route("/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "DELETE FROM expenses WHERE id = %s",
        (expense_id,)
    )

    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Expense deleted successfully"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)