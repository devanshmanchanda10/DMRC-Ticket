import React, { useState, useEffect } from 'react';
import './App.css';

// Simulated backend API
const api = {
  login: (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username && password) {
          let users = JSON.parse(localStorage.getItem('users') || '{}');
          if (!users[username]) {
            users[username] = { username, wallet: 1000 }; // New users start with $1000
            localStorage.setItem('users', JSON.stringify(users));
          }
          resolve(users[username]);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  },
  submitPost: (post) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const newPost = { ...post, id: Date.now(), purchased: false };
        posts.push(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        resolve(newPost);
      }, 500);
    });
  },
  getPosts: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        resolve(posts.map(post => ({ ...post, purchased: false })));
      }, 500);
    });
  },
  deletePost: (postId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let posts = JSON.parse(localStorage.getItem('posts') || '[]');
        posts = posts.filter(post => post.id !== postId);
        localStorage.setItem('posts', JSON.stringify(posts));
        resolve();
      }, 500);
    });
  },
  purchasePost: (postId, buyer) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const purchasedPostIndex = posts.findIndex(post => post.id === postId);
        if (purchasedPostIndex === -1) {
          reject(new Error('Post not found'));
          return;
        }
        const purchasedPost = posts[purchasedPostIndex];
        
        let users = JSON.parse(localStorage.getItem('users') || '{}');
        const buyerUser = users[buyer];
        const sellerUser = users[purchasedPost.author];
        
        if (buyerUser.wallet < purchasedPost.price) {
          reject(new Error('Insufficient funds'));
          return;
        }
        
        // Transfer funds
        buyerUser.wallet -= Number(purchasedPost.price);
        sellerUser.wallet += Number(purchasedPost.price);
        
        // Remove post from posts
        posts.splice(purchasedPostIndex, 1);
        localStorage.setItem('posts', JSON.stringify(posts));
        
        // Add post to buyer's cart
        let carts = JSON.parse(localStorage.getItem('carts') || '{}');
        if (!carts[buyer]) {
          carts[buyer] = [];
        }
        carts[buyer].push(purchasedPost);
        
        // Save updated data
        localStorage.setItem('carts', JSON.stringify(carts));
        localStorage.setItem('users', JSON.stringify(users));
        
        resolve({ purchasedPost, updatedWallet: buyerUser.wallet });
      }, 500);
    });
  },
  getCart: (username) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const carts = JSON.parse(localStorage.getItem('carts') || '{}');
        resolve(carts[username] || []);
      }, 500);
    });
  },
  getWallet: (username) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        resolve(users[username]?.wallet || 0);
      }, 500);
    });
  },
  clearAllData: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('posts');
        localStorage.removeItem('carts');
        
        // Reset all user wallets to 1000
        let users = JSON.parse(localStorage.getItem('users') || '{}');
        for (let username in users) {
          users[username].wallet = 1000;
        }
        localStorage.setItem('users', JSON.stringify(users));
        
        resolve();
      }, 500);
    });
  },
};

// import React, { useState, useEffect } from 'react';
// import './App.css';

// ... (keep the existing api object as is)

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  // const [searchPrice, setSearchPrice] = useState('');
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [price, setPrice] = useState('');
  const [posts, setPosts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [wallet, setWallet] = useState(0);
  const [searchPrice, setSearchPrice] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  function BlurredImage({ src, isBlurred, alt, inCart, filename }) {
    const handleDownload = () => {
      const link = document.createElement('a');
      link.href = src;
      link.download = filename || 'ticket.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    return (
      <div className="image-container">
        <img 
          src={src} 
          alt={alt} 
          className={isBlurred ? "blurred-image" : "clear-image"}
        />
        {inCart && (
          <button onClick={handleDownload} className="download-button">
            Download
          </button>
        )}
      </div>
    );
  }
  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
  
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
  
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // You can adjust quality here
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };
  
  

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      api.getWallet(parsedUser.username).then(setWallet);
    }
  }, []);

  useEffect(() => {
    if (user) {
      api.getPosts().then(posts => {
        setPosts(posts);
        setFilteredPosts(posts);
      });
      api.getCart(user.username).then(setCart);
      api.getWallet(user.username).then(setWallet);
    }
  }, [user]);

  useEffect(() => {
    if (searchPrice === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => Number(post.price) >= Number(searchPrice));
      setFilteredPosts(filtered);
    }
  }, [searchPrice, posts]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loggedInUser = await api.login(username, password);
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setWallet(loggedInUser.wallet);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCart([]);
    setShowCart(false);
    setWallet(0);
    setSearchPrice('');
  };

  const handlePriceChange = (e) => setPrice(e.target.value);
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleSearch = () => {
    setSearchPrice(searchTerm);
  };
  useEffect(() => {
    if (searchPrice === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => Number(post.price) >= Number(searchPrice));
      setFilteredPosts(filtered);
    }
  }, [searchPrice, posts]);
  // const handleSearchPriceChange = (e) => setSearchPrice(e.target.value);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const resizedImage = await resizeImage(file, 800, 600); // You can adjust these dimensions
      setSelectedImage(resizedImage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedImage && price) {
      const newPost = { image: selectedImage, price, author: user.username };
      const submittedPost = await api.submitPost(newPost);
      setPosts([...posts, submittedPost]);
      setFilteredPosts([...filteredPosts, submittedPost]);
      setSelectedImage(null);
      setPrice('');
    } else {
      alert('Please enter both price and image');
    }
  };

  const handleDelete = async (postId) => {
    await api.deletePost(postId);
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts);
    setFilteredPosts(updatedPosts.filter(post => Number(post.price) >= Number(searchPrice)));
  };

  const handlePurchase = async (postId) => {
    try {
      const { purchasedPost, updatedWallet } = await api.purchasePost(postId, user.username);
      
      // Add timestamp to the purchased post
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const postWithTimestamp = {
        ...purchasedPost,
        purchaseTimestamp: timestamp
      };
      
      // Remove the purchased post from posts and filteredPosts
      const updatedPosts = posts.filter(post => post.id !== postId);
      setPosts(updatedPosts);
      setFilteredPosts(updatedPosts.filter(post => Number(post.price) >= Number(searchPrice)));
      
      // Add the purchased post to the cart
      setCart(prevCart => [...prevCart, postWithTimestamp]);
      
      // Update wallet
      setWallet(updatedWallet);
    } catch (error) {
      alert('Purchase failed: ' + error.message);
    }
  };

  const toggleCart = () => {
    setShowCart(!showCart);
    if (showCart) {
      // Refresh posts when hiding cart
      api.getPosts().then(posts => {
        setPosts(posts);
        setFilteredPosts(posts.filter(post => Number(post.price) >= Number(searchPrice)));
      });
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      await api.clearAllData();
      alert('All data has been cleared. Please log in again.');
      handleLogout();
    }
  };

  if (!user) {
    return (
      <div className="App">
        <h1>DMRC E-Ticket</h1>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <button onClick={handleClearAll} className="clear-all-button">Clear Database</button>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Welcome, {user.username}!</h1>
      <p>Wallet: ${wallet}</p>
      <button onClick={handleLogout} className="logout-button">Logout</button>
      <button onClick={toggleCart} className="cart-button">
        {showCart ? 'Hide Cart' : `Show Cart (${cart.length})`}
      </button>
      
      {showCart ? (
  <div className="cart-container">
    <h2>Your Cart</h2>
    {cart.map((item) => (
      <div key={item.id} className="cart-item">
        <BlurredImage 
          src={item.image} 
          isBlurred={false} 
          alt="Purchased" 
          inCart={true}
          filename={`ticket_${item.id}.jpg`}
        />
        <p>Price: ${item.price}</p>
        <p>Sold by: {item.author}</p>
      </div>
    ))}
  </div>
) : (
        <>
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="priceInput">Enter Price of Your Ticket: </label>
              <input
                type="number"
                id="priceInput"
                value={price}
                onChange={handlePriceChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="imageInput">Upload Ticket QR: </label>
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>
            
            <button type="submit" className="submit-button">Sell Your Ticket</button>
          </form>

          <div className="search-container">
  <label htmlFor="priceSearch">Price of ticket you want</label>
  <input
    id="priceSearch"
    type="number"
    placeholder="Enter price"
    value={searchTerm}
    onChange={handleSearchInputChange}
    className="search-input"
  />
  <button onClick={handleSearch} className="search-button">
    🔍
  </button>
</div>

          <div className="posts-container">
            <h2>All Posts</h2>
            {filteredPosts
  .filter(post => !cart.some(cartItem => cartItem.id === post.id))
  .map((post) => (
    <div key={post.id} className="post">
      <BlurredImage 
        src={post.image} 
        isBlurred={post.author !== user.username} 
        alt="Posted" 
      />
      <p>Price: ${post.price}</p>
      <p>Posted by: {post.author}</p>
      {post.author === user.username ? (
        <button onClick={() => handleDelete(post.id)} className="delete-button">Delete</button>
      ) : (
        <button onClick={() => handlePurchase(post.id)} className="purchase-button">Purchase</button>
      )}
    </div>
  ))
}
          </div>
        </>
      )}
    </div>
  );
}

export default App;