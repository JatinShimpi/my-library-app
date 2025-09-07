import React, { useState } from 'react';
import { Book, User, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface BookProps {
  book: {
    _id: string;
    title: string;
    author: string;
    isbn: string;
    available: boolean;
    borrowedBy?: {
      username: string;
      email: string;
    };
    borrowedAt?: string;
    createdAt: string;
  };
  onUpdate: () => void;
}

const BookCard: React.FC<BookProps> = ({ book, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  const handleBorrow = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await axios.put(`${API_URL}/books/${book._id}/borrow`);
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to borrow book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await axios.put(`${API_URL}/books/${book._id}/return`);
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  const canReturn = user && (
    (book.borrowedBy && user.id === book.borrowedBy.email) || 
    user.role === 'admin'
  );

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Book className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {book.title}
            </h3>
          </div>
          <div className="flex items-center">
            {book.available ? (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Available</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Borrowed</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-gray-600">
            <span className="font-medium">Author:</span> {book.author}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">ISBN:</span> {book.isbn}
          </p>
          
          {!book.available && book.borrowedBy && (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Borrowed by: {book.borrowedBy.username}</span>
              </div>
              {book.borrowedAt && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Since: {new Date(book.borrowedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {user && (
          <div className="flex space-x-2">
            {book.available ? (
              <button
                onClick={handleBorrow}
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Borrowing...' : 'Borrow'}
              </button>
            ) : canReturn ? (
              <button
                onClick={handleReturn}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Returning...' : 'Return'}
              </button>
            ) : (
              <div className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 rounded-md text-sm font-medium text-center">
                Not Available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;