import React, { useState, useEffect, useCallback } from 'react';

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
  const [users, setUsers] = useState(() => getFromLocalStorage('saas_users', {})); // { username: { password, items: [] } }
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', 'dashboard'

  // Form states for login/register
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // Item management state for the dashboard
  const [newItemText, setNewItemText] = useState('');

  // --- Effects for Persistence ---
  useEffect(() => {
    // Load current user from localStorage on initial render
    const storedCurrentUser = getFromLocalStorage('saas_currentUser', null);
    if (storedCurrentUser && users[storedCurrentUser]) { // Check if user still exists
      setCurrentUser(storedCurrentUser);
      setCurrentPage('dashboard');
    }
  }, [users]); // Re-run if users change, in case the stored user was deleted

  useEffect(() => {
    // Save current user to localStorage whenever it changes
    saveToLocalStorage('saas_currentUser', currentUser);
  }, [currentUser]);

  useEffect(() => {
    // Save all users data to localStorage whenever it changes
    saveToLocalStorage('saas_users', users);
  }, [users]);

  // --- Authentication Handlers ---
  const handleRegister = useCallback((e) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput || !confirmPasswordInput) {
      alert('Please fill in all fields.');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      alert('Passwords do not match.');
      return;
    }
    if (users[usernameInput]) {
      alert('Username already exists. Please choose a different one.');
      return;
    }

    setUsers(prevUsers => ({
      ...prevUsers,
      [usernameInput]: {
        password: passwordInput,
        items: [] // New user starts with an empty item list
      }
    }));
    alert('Registration successful! Please login.');
    setCurrentPage('login');
    setUsernameInput('');
    setPasswordInput('');
    setConfirmPasswordInput('');
  }, [usernameInput, passwordInput, confirmPasswordInput, users]);

  const handleLogin = useCallback((e) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) {
      alert('Please enter username and password.');
      return;
    }

    const userAccount = users[usernameInput];
    if (userAccount && userAccount.password === passwordInput) {
      setCurrentUser(usernameInput);
      setCurrentPage('dashboard');
      setUsernameInput('');
      setPasswordInput('');
    } else {
      alert('Invalid username or password.');
    }
  }, [usernameInput, passwordInput, users]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentPage('login');
    setNewItemText(''); // Clear item input
    alert('You have been logged out.');
  }, []);

  // --- Item Management Handlers (for logged-in user) ---
  const handleAddItem = useCallback((e) => {
    e.preventDefault();
    if (!newItemText.trim() || !currentUser) return;

    setUsers(prevUsers => {
      const updatedUsers = { ...prevUsers };
      const userItems = [...(updatedUsers[currentUser]?.items || [])];
      updatedUsers[currentUser] = {
        ...updatedUsers[currentUser],
        items: [...userItems, { id: Date.now(), text: newItemText.trim() }]
      };
      return updatedUsers;
    });
    setNewItemText('');
  }, [newItemText, currentUser, setUsers]);

  const handleDeleteItem = useCallback((itemId) => {
    if (!currentUser) return;

    setUsers(prevUsers => {
      const updatedUsers = { ...prevUsers };
      const userItems = (updatedUsers[currentUser]?.items || []).filter(item => item.id !== itemId);
      updatedUsers[currentUser] = {
        ...updatedUsers[currentUser],
        items: userItems
      };
      return updatedUsers;
    });
  }, [currentUser, setUsers]);

  // --- Inline Styles ---
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '40px auto',
      padding: '25px',
      border: '1px solid #e0e0e0',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      backgroundColor: '#ffffff',
      color: '#333',
    },
    header: {
      textAlign: 'center',
      color: '#2c3e50',
      marginBottom: '30px',
      fontSize: '2.5em',
      fontWeight: '600',
    },
    subHeader: {
      textAlign: 'center',
      color: '#34495e',
      marginBottom: '20px',
      fontSize: '1.8em',
      fontWeight: '500',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: 'bold',
      color: '#555',
      fontSize: '0.95em',
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ccc',
      borderRadius: '6px',
      fontSize: '1em',
      boxSizing: 'border-box',
    },
    button: {
      padding: '12px 20px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '1.1em',
      marginRight: '15px',
      backgroundColor: '#007bff',
      color: 'white',
      transition: 'background-color 0.3s ease',
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
    },
    dangerButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9em',
      marginLeft: '10px',
    },
    logoutButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      padding: '10px 15px',
      borderRadius: '6px',
      cursor: 'pointer',
      float: 'right',
      fontSize: '1em',
    },
    link: {
      color: '#007bff',
      cursor: 'pointer',
      textDecoration: 'underline',
      display: 'block',
      textAlign: 'center',
      marginTop: '15px',
      fontSize: '0.95em',
    },
    itemList: {
      listStyle: 'none',
      padding: '0',
      marginTop: '25px',
    },
    item: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      padding: '12px 15px',
      marginBottom: '10px',
      borderRadius: '6px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '1.05em',
    },
    dashboardSection: {
      marginTop: '30px',
      paddingTop: '25px',
      borderTop: '1px solid #eee',
    },
    welcomeBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px',
      backgroundColor: '#eaf3ff',
      padding: '15px 20px',
      borderRadius: '8px',
      border: '1px solid #cce0ff',
    },
    welcomeText: {
      fontSize: '1.3em',
      fontWeight: 'bold',
      color: '#0056b3',
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>My Simple SaaS App</h1>

      {/* --- Registration Page --- */}
      {currentPage === 'register' && (
        <div>
          <h2 style={styles.subHeader}>Register</h2>
          <form onSubmit={handleRegister}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="reg-username">Username:</label>
              <input
                style={styles.input}
                type="text"
                id="reg-username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="reg-password">Password:</label>
              <input
                style={styles.input}
                type="password"
                id="reg-password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="reg-confirm-password">Confirm Password:</label>
              <input
                style={styles.input}
                type="password"
                id="reg-confirm-password"
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                required
              />
            </div>
            <button style={styles.button} type="submit">Register</button>
            <span
              style={{ ...styles.link, display: 'inline', marginLeft: '15px' }}
              onClick={() => setCurrentPage('login')}
            >
              Already have an account? Login
            </span>
          </form>
        </div>
      )}

      {/* --- Login Page --- */}
      {currentPage === 'login' && !currentUser && (
        <div>
          <h2 style={styles.subHeader}>Login</h2>
          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="login-username">Username:</label>
              <input
                style={styles.input}
                type="text"
                id="login-username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="login-password">Password:</label>
              <input
                style={styles.input}
                type="password"
                id="login-password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />
            </div>
            <button style={styles.button} type="submit">Login</button>
            <span
              style={{ ...styles.link, display: 'inline', marginLeft: '15px' }}
              onClick={() => setCurrentPage('register')}
            >
              Don't have an account? Register
            </span>
          </form>
        </div>
      )}

      {/* --- Dashboard Page (Logged In) --- */}
      {currentPage === 'dashboard' && currentUser && (
        <div style={styles.dashboardSection}>
          <div style={styles.welcomeBar}>
            <span style={styles.welcomeText}>Welcome, {currentUser}!</span>
            <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
          </div>

          <h3 style={{ color: '#34495e', marginBottom: '20px' }}>Your Items</h3>
          <form onSubmit={handleAddItem} style={{ display: 'flex', marginBottom: '25px' }}>
            <input
              style={{ ...styles.input, flexGrow: 1, marginRight: '10px' }}
              type="text"
              placeholder="Add a new item..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
            />
            <button style={styles.button} type="submit">Add Item</button>
          </form>

          {users[currentUser]?.items?.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#777' }}>No items yet. Add some above!</p>
          ) : (
            <ul style={styles.itemList}>
              {users[currentUser]?.items?.map(item => (
                <li key={item.id} style={styles.item}>
                  <span>{item.text}</span>
                  <button style={styles.dangerButton} onClick={() => handleDeleteItem(item.id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}