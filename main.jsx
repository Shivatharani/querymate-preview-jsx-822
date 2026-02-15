import React, { useState, useEffect, useCallback } from 'react';

// Include Tailwind CSS CDN for styling
const TailwindCSSLink = document.createElement('link');
TailwindCSSLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
TailwindCSSLink.rel = 'stylesheet';
document.head.appendChild(TailwindCSSLink);

// Helper function to get/set data from localStorage
const getFromLocalStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from localStorage for key "${key}":`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving item to localStorage for key "${key}":`, error);
  }
};

// Main Application Component
function App() {
  // Global application state
  const [currentUser, setCurrentUser] = useState(null); // Stores username of logged-in user
  const [users, setUsers] = useState(() => getFromLocalStorage('saas_users_v2', {})); // { username: { password, items: [], lastUpdated } }
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', 'dashboard'
  const [isDarkMode, setIsDarkMode] = useState(() => getFromLocalStorage('saas_dark_mode', false));

  // Form states for login/register
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Item management state for the dashboard
  const [newItemText, setNewItemText] = useState('');
  const [editingItem, setEditingItem] = useState(null); // { id: number, text: string }
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- Effects for Persistence & Initial Load ---
  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    document.body.classList.toggle('bg-gray-900', isDarkMode);
    document.body.classList.toggle('text-gray-100', isDarkMode);
    document.body.classList.toggle('bg-gray-100', !isDarkMode);
    document.body.classList.toggle('text-gray-900', !isDarkMode);
    saveToLocalStorage('saas_dark_mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    // Load current user from localStorage on initial render
    const storedCurrentUser = getFromLocalStorage('saas_currentUser_v2', null);
    if (storedCurrentUser && users[storedCurrentUser]) {
      setCurrentUser(storedCurrentUser);
      setCurrentPage('dashboard');
    }
  }, [users]); // Re-run if users change, in case the stored user was deleted

  useEffect(() => {
    saveToLocalStorage('saas_currentUser_v2', currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveToLocalStorage('saas_users_v2', users);
  }, [users]);

  // --- Authentication Handlers ---
  const handleRegister = useCallback((e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { // Simulate API call
      if (!usernameInput || !passwordInput || !confirmPasswordInput) {
        alert('Please fill in all fields.');
        setIsLoading(false);
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        alert('Passwords do not match.');
        setIsLoading(false);
        return;
      }
      if (users[usernameInput]) {
        alert('Username already exists. Please choose a different one.');
        setIsLoading(false);
        return;
      }

      setUsers(prevUsers => ({
        ...prevUsers,
        [usernameInput]: {
          password: passwordInput,
          items: [],
          lastUpdated: new Date().toLocaleString()
        }
      }));
      alert('Registration successful! Please login.');
      setCurrentPage('login');
      setUsernameInput('');
      setPasswordInput('');
      setConfirmPasswordInput('');
      setIsLoading(false);
    }, 1000);
  }, [usernameInput, passwordInput, confirmPasswordInput, users]);

  const handleLogin = useCallback((e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { // Simulate API call
      if (!usernameInput || !passwordInput) {
        alert('Please enter username and password.');
        setIsLoading(false);
        return;
      }

      const userAccount = users[usernameInput];
      if (userAccount && userAccount.password === passwordInput) {
        setCurrentUser(usernameInput);
        setCurrentPage('dashboard');
        setUsernameInput('');
        setPasswordInput('');
        alert(`Welcome back, ${usernameInput}!`);
      } else {
        alert('Invalid username or password.');
      }
      setIsLoading(false);
    }, 1000);
  }, [usernameInput, passwordInput, users]);

  const handleLogout = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { // Simulate API call
      setCurrentUser(null);
      setCurrentPage('login');
      setNewItemText('');
      setEditingItem(null);
      setIsLoading(false);
      alert('You have been logged out.');
    }, 500);
  }, []);

  // --- Item Management Handlers ---
  const handleAddItem = useCallback((e) => {
    e.preventDefault();
    if (!newItemText.trim() || !currentUser) return;

    setIsLoading(true);
    setTimeout(() => { // Simulate API call
      setUsers(prevUsers => {
        const updatedUsers = { ...prevUsers };
        const userItems = [...(updatedUsers[currentUser]?.items || [])];
        updatedUsers[currentUser] = {
          ...updatedUsers[currentUser],
          items: [...userItems, { id: Date.now(), text: newItemText.trim() }],
          lastUpdated: new Date().toLocaleString()
        };
        return updatedUsers;
      });
      setNewItemText('');
      setIsLoading(false);
      alert('Item added successfully!');
    }, 700);
  }, [newItemText, currentUser, setUsers]);

  const handleStartEditItem = useCallback((item) => {
    setEditingItem(item);
    setNewItemText(item.text); // Pre-fill the input with the item's text
  }, []);

  const handleSaveEditItem = useCallback(() => {
    if (!newItemText.trim() || !currentUser || !editingItem) return;

    setIsLoading(true);
    setTimeout(() => { // Simulate API call
      setUsers(prevUsers => {
        const updatedUsers = { ...prevUsers };
        const userItems = (updatedUsers[currentUser]?.items || []).map(item =>
          item.id === editingItem.id ? { ...item, text: newItemText.trim() } : item
        );
        updatedUsers[currentUser] = {
          ...updatedUsers[currentUser],
          items: userItems,
          lastUpdated: new Date().toLocaleString()
        };
        return updatedUsers;
      });
      setNewItemText('');
      setEditingItem(null);
      setIsLoading(false);
      alert('Item updated successfully!');
    }, 700);
  }, [newItemText, currentUser, editingItem, setUsers]);

  const handleCancelEdit = useCallback(() => {
    setEditingItem(null);
    setNewItemText('');
  }, []);

  const handleDeleteRequest = useCallback((item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteItem = useCallback(() => {
    if (!currentUser || !itemToDelete) {
      setShowDeleteModal(false);
      return;
    }

    setIsLoading(true);
    setTimeout(() => { // Simulate API call
      setUsers(prevUsers => {
        const updatedUsers = { ...prevUsers };
        const userItems = (updatedUsers[currentUser]?.items || []).filter(item => item.id !== itemToDelete.id);
        updatedUsers[currentUser] = {
          ...updatedUsers[currentUser],
          items: userItems,
          lastUpdated: new Date().toLocaleString()
        };
        return updatedUsers;
      });
      setShowDeleteModal(false);
      setItemToDelete(null);
      setIsLoading(false);
      alert('Item deleted successfully!');
    }, 700);
  }, [currentUser, itemToDelete, setUsers]);

  const renderAuthForm = (isRegister) => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md transition-colors duration-300">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
        {isRegister ? 'Create Your Account' : 'Welcome Back!'}
      </h2>
      <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="username">
            Username
          </label>
          <input
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            type="text"
            id="username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            type="password"
            id="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        {isRegister && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              type="password"
              id="confirm-password"
              value={confirmPasswordInput}
              onChange={(e) => setConfirmPasswordInput(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>
      <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span
          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
          onClick={() => {
            setCurrentPage(isRegister ? 'login' : 'register');
            setUsernameInput('');
            setPasswordInput('');
            setConfirmPasswordInput('');
          }}
        >
          {isRegister ? 'Login here' : 'Register here'}
        </span>
      </p>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <div className="fixed top-4 right-4">
        <label htmlFor="theme-toggle" className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              id="theme-toggle"
              className="sr-only"
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
            />
            <div className={`block w-14 h-8 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isDarkMode ? 'translate-x-full bg-yellow-400' : ''}`}></div>
          </div>
          <div className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </div>
        </label>
      </div>

      <h1 className="text-5xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">
        My Impressive SaaS App
      </h1>

      {/* Auth Pages */}
      {!currentUser && (currentPage === 'login' || currentPage === 'register') && (
        renderAuthForm(currentPage === 'register')
      )}

      {/* Dashboard */}
      {currentUser && currentPage === 'dashboard' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl transition-colors duration-300">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
              Welcome, <span className="text-blue-600 dark:text-blue-400">{currentUser}</span>!
            </h2>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Logout
            </button>
          </div>

          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg shadow-md text-blue-800 dark:text-blue-200">
              <h4 className="font-bold text-lg">Total Items</h4>
              <p className="text-2xl">{users[currentUser]?.items?.length || 0}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg shadow-md text-green-800 dark:text-green-200">
              <h4 className="font-bold text-lg">Last Updated</h4>
              <p className="text-md">{users[currentUser]?.lastUpdated || 'N/A'}</p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold mb-5 text-gray-800 dark:text-gray-100">
            {editingItem ? 'Edit Your Item' : 'Manage Your Items'}
          </h3>

          {/* Item Add/Edit Form */}
          <form onSubmit={editingItem ? handleSaveEditItem : handleAddItem} className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              type="text"
              placeholder={editingItem ? 'Edit item text...' : 'Add a new item...'}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {editingItem ? 'Save Edit' : 'Add Item'}
              </button>
              {editingItem && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Item List */}
          {users[currentUser]?.items?.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 text-lg">No items yet. Add some above!</p>
          ) : (
            <ul className="space-y-3">
              {users[currentUser]?.items?.map(item => (
                <li key={item.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm flex justify-between items-center transition-colors duration-300">
                  <span className="text-lg text-gray-800 dark:text-gray-200">{item.text}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEditItem(item)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors duration-200 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(item)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors duration-200 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-2xl w-full max-w-sm transition-colors duration-300">
            <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Confirm Deletion</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete "<span className="font-semibold">{itemToDelete?.text}</span>"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setItemToDelete(null); }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}