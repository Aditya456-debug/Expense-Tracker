const form = document.getElementById('transaction-form');
const list = document.getElementById('transaction-list');
const incomeDisplay = document.getElementById('total-income');
const expenseDisplay = document.getElementById('total-expense');
const balanceDisplay = document.getElementById('net-balance');
const filterCategory = document.getElementById('filter-category');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let expenseChart;

// Save to Local Storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Calculate Summary
function calculateSummary() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
    });

    incomeDisplay.textContent = `₹${income}`;
    expenseDisplay.textContent = `₹${expense}`;
    balanceDisplay.textContent = `₹${income - expense}`;
}

// Render Transactions
function renderTransactions() {
    list.innerHTML = '';
    const filter = filterCategory.value;

    transactions
        .filter(t => filter === 'all' || t.category === filter)
        .forEach(t => {
            const li = document.createElement('li');
            li.classList.add(t.type);

            li.innerHTML = `
                ${t.date} | ${t.description} | ${t.category} | ₹${t.amount}
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">X</button>
            `;

            list.appendChild(li);
        });

    calculateSummary();
    updateChart();
}

// Delete Transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    renderTransactions();
}

// Add Transaction
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    if (!date || !description || !category || !amount || !type || amount <= 0) {
        document.getElementById('error-msg').textContent = "Please enter valid data!";
        return;
    }

    const transaction = {
        id: Date.now(),
        date,
        description,
        category,
        amount,
        type
    };

    transactions.push(transaction);
    updateLocalStorage();
    form.reset();
    renderTransactions();
});

// Pie Chart
function updateChart() {

    const expenseData = {};

    transactions.forEach(t => {
        if (t.type === 'expense') {
            expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
        }
    });

    const categories = Object.keys(expenseData);
    const amounts = Object.values(expenseData);

    if (expenseChart) {
        expenseChart.destroy();
    }

    const ctx = document.getElementById('expenseChart').getContext('2d');

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: [
                    '#ff6384',
                    '#36a2eb',
                    '#ffcd56',
                    '#4bc0c0',
                    '#9966ff',
                    '#ff9f40'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: "white"
                    }
                }
            }
        }
    });
}

filterCategory.addEventListener('change', renderTransactions);

renderTransactions();
