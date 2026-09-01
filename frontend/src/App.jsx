import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:5000";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    category: "Food",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`);
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const addExpense = async (event) => {
    event.preventDefault();

    if (!form.amount || !form.category || !form.expense_date) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add expense");
      }

      setForm({
        amount: "",
        category: "Food",
        description: "",
        expense_date: new Date().toISOString().split("T")[0],
      });

      fetchExpenses();
    } catch (error) {
      console.error(error);
      alert("Could not add expense.");
    }
  };

  const deleteExpense = async (id) => {
    try {
      await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
      });

      fetchExpenses();
    } catch (error) {
      console.error(error);
    }
  };

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const categoryTotals = expenses.reduce((result, expense) => {
    const category = expense.category;

    result[category] = (result[category] || 0) + Number(expense.amount);

    return result;
  }, {});

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Spendly</h1>
          <p>Personal expense tracker</p>
        </div>

        <div className="total-card">
          <span>Total spent</span>
          <strong>₹{total.toFixed(2)}</strong>
        </div>
      </header>

      <main className="dashboard">
        <section className="card add-card">
          <h2>Add Expense</h2>

          <form onSubmit={addExpense}>
            <label>
              Amount
              <input
                type="number"
                name="amount"
                placeholder="₹ 0.00"
                value={form.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </label>

            <label>
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Entertainment</option>
                <option>Bills</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Description
              <input
                type="text"
                name="description"
                placeholder="What did you spend on?"
                value={form.description}
                onChange={handleChange}
              />
            </label>

            <label>
              Date
              <input
                type="date"
                name="expense_date"
                value={form.expense_date}
                onChange={handleChange}
                required
              />
            </label>

            <button type="submit">+ Add Expense</button>
          </form>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>Spending by Category</h2>
              <p>Where your money is going</p>
            </div>
          </div>

          <div className="category-list">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div className="category-row" key={category}>
                <span>{category}</span>
                <strong>₹{amount.toFixed(2)}</strong>
              </div>
            ))}

            {Object.keys(categoryTotals).length === 0 && (
              <p className="empty">No spending yet.</p>
            )}
          </div>
        </section>

        <section className="card expenses-card">
          <div className="section-header">
            <div>
              <h2>Recent Expenses</h2>
              <p>Your latest transactions</p>
            </div>

            <span className="count">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <p className="empty">Loading...</p>
          ) : expenses.length === 0 ? (
            <p className="empty">No expenses yet.</p>
          ) : (
            <div className="expense-list">
              {expenses.map((expense) => (
                <div className="expense-row" key={expense.id}>
                  <div className="expense-info">
                    <div className="expense-icon">
                      {expense.category.charAt(0)}
                    </div>

                    <div>
                      <strong>
                        {expense.description || expense.category}
                      </strong>
                      <span>
                        {expense.category} • {expense.expense_date}
                      </span>
                    </div>
                  </div>

                  <div className="expense-actions">
                    <strong>₹{Number(expense.amount).toFixed(2)}</strong>

                    <button
                      className="delete-button"
                      onClick={() => deleteExpense(expense.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;