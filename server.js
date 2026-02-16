FILE 2: server.js (Main API Code)
--------------------------------------------------
const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory storage for books
let books = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee' },
    { id: 3, title: '1984', author: 'George Orwell' }
];
let nextId = 4;

// Helper function to find book by ID
const findBookById = (id) => books.find(book => book.id === id);
const findBookIndex = (id) => books.findIndex(book => book.id === id);

// GET all books with optional filtering
app.get('/books', (req, res) => {
    const { author, title } = req.query;
    let filteredBooks = [...books];
    
    if (author) {
        filteredBooks = filteredBooks.filter(book => 
            book.author.toLowerCase().includes(author.toLowerCase())
        );
    }
    
    if (title) {
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(title.toLowerCase())
        );
    }
    
    res.json({
        count: filteredBooks.length,
        books: filteredBooks
    });
});

// GET single book
app.get('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const book = findBookById(id);
    
    if (!book) {
        return res.status(404).json({ 
            error: 'Book not found',
            message: No book exists with ID ${id}
        });
    }
    
    res.json(book);
});

// POST new book
app.post('/books', (req, res) => {
    const { title, author } = req.body;
    
    // Enhanced validation
    const errors = [];
    if (!title || title.trim() === '') {
        errors.push('Title is required and cannot be empty');
    }
    if (!author || author.trim() === '') {
        errors.push('Author is required and cannot be empty');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors
        });
    }
    
    // Check for duplicate
    const existingBook = books.find(book => 
        book.title.toLowerCase() === title.toLowerCase() && 
        book.author.toLowerCase() === author.toLowerCase()
    );
    
    if (existingBook) {
        return res.status(409).json({ 
            error: 'Duplicate book',
            message: 'This book already exists in the collection'
        });
    }
    
    const newBook = {
        id: nextId++,
        title: title.trim(),
        author: author.trim()
    };
    
    books.push(newBook);
    res.status(201).json(newBook);
});

// PUT update book
app.put('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { title, author } = req.body;
    const bookIndex = findBookIndex(id);
    
    if (bookIndex === -1) {
        return res.status(404).json({ 
            error: 'Book not found',
            message: Cannot update - no book exists with ID ${id}
        });
    }
    
    // Validation
    const errors = [];
    if (!title || title.trim() === '') {
        errors.push('Title is required and cannot be empty');
    }
    if (!author || author.trim() === '') {
        errors.push('Author is required and cannot be empty');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors
        });
    }
    
    // Update book
    books[bookIndex] = {
        id: id,
        title: title.trim(),
        author: author.trim()
    };
    
    res.json({
        message: 'Book updated successfully',
        book: books[bookIndex]
    });
});

// PATCH partially update a book
app.patch('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const bookIndex = findBookIndex(id);
    
    if (bookIndex === -1) {
        return res.status(404).json({ 
            error: 'Book not found',
            message: Cannot update - no book exists with ID ${id}
        });
    }
    
    // Apply only valid updates
    if (updates.title) {
        books[bookIndex].title = updates.title.trim();
    }
    if (updates.author) {
        books[bookIndex].author = updates.author.trim();
    }
    
    res.json({
        message: 'Book partially updated',
        book: books[bookIndex]
    });
});

// DELETE book
app.delete('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const bookIndex = findBookIndex(id);
    
    if (bookIndex === -1) {
        return res.status(404).json({ 
            error: 'Book not found',
            message: Cannot delete - no book exists with ID ${id}
        });
    }
    
    const deletedBook = books[bookIndex];
    books.splice(bookIndex, 1);
    
    res.json({
        message: 'Book deleted successfully',
        deletedBook: deletedBook
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal server error',
        message: 'Something went wrong on the server'
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Not found',
        message: Cannot ${req.method} ${req.originalUrl}
    });
});

app.listen(port, () => {
    console.log(Book API server running at http://localhost:${port});
    console.log('Available endpoints:');
    console.log('  GET    /books              - List all books');
    console.log('  GET    /books/:id           - Get a specific book');
    console.log('  POST   /books               - Create a new book');
    console.log('  PUT    /books/:id           - Update a book completely');
    console.log('  PATCH  /books/:id           - Partially update a book');
    console.log('  DELETE /books/:id           - Delete a book');
});
