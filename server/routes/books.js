import express from 'express';
import Book from '../models/Book.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const books = await Book.find().populate('borrowedBy', 'username email');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { title, author, isbn } = req.body;

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    const book = new Book({ title, author, isbn });
    await book.save();

    res.status(201).json({
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id/borrow', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!book.available) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    book.available = false;
    book.borrowedBy = req.user._id;
    book.borrowedAt = new Date();
    
    await book.save();
    await book.populate('borrowedBy', 'username email');

    res.json({
      message: 'Book borrowed successfully',
      book
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id/return', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.available) {
      return res.status(400).json({ message: 'Book is already available' });
    }

    if (book.borrowedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only return books you borrowed' });
    }

    book.available = true;
    book.borrowedBy = null;
    book.borrowedAt = null;
    
    await book.save();

    res.json({
      message: 'Book returned successfully',
      book
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
