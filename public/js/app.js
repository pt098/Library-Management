// Library Management System
class LibraryApp {
    constructor() {
        this.currentSection = 'books';
        this.books = [];
        this.members = [];
        this.loans = [];
        this.token = localStorage.getItem('token') || '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showSection('books');
        this.loadData();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showSection(e.target.dataset.section);
            });
        });

        // Forms
        document.getElementById('addBookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBook();
        });

        document.getElementById('addMemberForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMember();
        });

        document.getElementById('borrowForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.borrowBook();
        });

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                this.token = '';
                window.location.href = '/login';
            });
        }
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Show section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}Section`).classList.add('active');

        this.currentSection = sectionName;
        this.loadData();
    }

    async loadData() {
        try {
            await Promise.all([
                this.loadBooks(),
                this.loadMembers(),
                this.loadLoans()
            ]);
            this.updateTables();
        } catch (error) {
            this.showMessage('Error loading data: ' + error.message, 'error');
        }
    }

    async loadBooks() {
        const response = await fetch('/api/books');
        if (response.ok) {
            this.books = await response.json();
        } else {
            throw new Error('Failed to load books');
        }
    }

    async loadMembers() {
        const response = await fetch('/api/members');
        if (response.ok) {
            this.members = await response.json();
        } else {
            throw new Error('Failed to load members');
        }
    }

    async loadLoans() {
        const response = await fetch('/api/loans');
        if (response.ok) {
            this.loans = await response.json();
        } else {
            throw new Error('Failed to load loans');
        }
    }

    updateTables() {
        this.updateBooksTable();
        this.updateMembersTable();
        this.updateLoansTable();
        this.updateBorrowForm();
    }

    updateBooksTable() {
        const tbody = document.querySelector('#booksTable tbody');
        tbody.innerHTML = '';

        this.books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.isbn || 'N/A'}</td>
                <td>${book.copies}</td>
                <td>
                    <button class="btn btn-danger" onclick="app.deleteBook('${book._id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateMembersTable() {
        const tbody = document.querySelector('#membersTable tbody');
        tbody.innerHTML = '';

        this.members.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td>${new Date(member.createdAt).toLocaleDateString()}</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateLoansTable() {
        const tbody = document.querySelector('#loansTable tbody');
        tbody.innerHTML = '';

        this.loans.forEach(loan => {
            const status = loan && loan.returnedAt ? 'Returned' : 'Active';
            const statusClass = loan && loan.returnedAt ? 'success' : 'info';
            const returnButton = loan.returnedAt ? 
                '' : 
                `<button class="btn btn-secondary" onclick="app.returnBook('${loan._id}')">Return</button>`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${loan && loan.book ? (loan.book.title || 'N/A') : 'N/A'}</td>
                <td>${loan && loan.member ? (loan.member.name || 'N/A') : 'N/A'}</td>
                <td>${loan && loan.borrowedAt ? new Date(loan.borrowedAt).toLocaleDateString() : 'N/A'}</td>
                <td>${loan && loan.dueAt ? new Date(loan.dueAt).toLocaleDateString() : 'N/A'}</td>
                <td><span class="message ${statusClass}">${status}</span></td>
                <td>${returnButton}</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateBorrowForm() {
        const bookSelect = document.getElementById('bookId');
        const memberSelect = document.getElementById('memberId');

        // Update book options
        bookSelect.innerHTML = '<option value="">Select a book</option>';
        this.books.filter(book => book.copies > 0).forEach(book => {
            const option = document.createElement('option');
            option.value = book._id;
            option.textContent = `${book.title} by ${book.author} (${book.copies} available)`;
            bookSelect.appendChild(option);
        });

        // Update member options
        memberSelect.innerHTML = '<option value="">Select a member</option>';
        this.members.forEach(member => {
            const option = document.createElement('option');
            option.value = member._id;
            option.textContent = `${member.name} (${member.email})`;
            memberSelect.appendChild(option);
        });
    }

    async addBook() {
        const form = document.getElementById('addBookForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
                body: JSON.stringify(data)
            });
            
            // If unauthorized, prompt login
            if (response.status === 401) return this.redirectToLogin();

            if (response.ok) {
                this.showMessage('Book added successfully!', 'success');
                form.reset();
                this.loadData();
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            this.showMessage('Error adding book: ' + error.message, 'error');
        }
    }

    async addMember() {
        const form = document.getElementById('addMemberForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
                body: JSON.stringify(data)
            });
            if (response.status === 401) return this.redirectToLogin();

            if (response.ok) {
                this.showMessage('Member added successfully!', 'success');
                form.reset();
                this.loadData();
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            this.showMessage('Error adding member: ' + error.message, 'error');
        }
    }

    async borrowBook() {
        const form = document.getElementById('borrowForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/loans/borrow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
                body: JSON.stringify(data)
            });
            if (response.status === 401) return this.redirectToLogin();

            if (response.ok) {
                this.showMessage('Book borrowed successfully!', 'success');
                form.reset();
                this.loadData();
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            this.showMessage('Error borrowing book: ' + error.message, 'error');
        }
    }

    async returnBook(loanId) {
        try {
            const response = await fetch(`/api/loans/${loanId}/return`, {
                method: 'POST',
                headers: { ...this.authHeaders() }
            });
            if (response.status === 401) return this.redirectToLogin();

            if (response.ok) {
                this.showMessage('Book returned successfully!', 'success');
                this.loadData();
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            this.showMessage('Error returning book: ' + error.message, 'error');
        }
    }

    async deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book?')) {
            return;
        }

        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE',
                headers: { ...this.authHeaders() }
            });
            if (response.status === 401) return this.redirectToLogin();

            if (response.ok) {
                this.showMessage('Book deleted successfully!', 'success');
                this.loadData();
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            this.showMessage('Error deleting book: ' + error.message, 'error');
        }
    }

    authHeaders() {
        return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    }

    redirectToLogin() {
        this.showMessage('Session expired. Redirecting to login...', 'error');
        setTimeout(() => { window.location.href = '/login'; }, 800);
    }

    async login() {
        const form = document.getElementById('loginForm');
        const data = Object.fromEntries(new FormData(form));
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Login failed');
            }
            const payload = await res.json();
            this.token = payload.token;
            localStorage.setItem('token', this.token);
            this.showMessage('Logged in successfully', 'success');
        } catch (e) {
            this.showMessage(e.message, 'error');
        }
    }
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        const container = document.querySelector('.main-content');
        container.insertBefore(messageDiv, container.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LibraryApp();
});