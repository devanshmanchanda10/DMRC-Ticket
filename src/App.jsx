import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/Login";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import Cart from "./components/Cart";
import { api } from "./api/api";
//made comments so to remember the use of every code for myself in future
function App() {
  // State variables
  const [user, setUser] = useState(null); // Stores the logged-in user's information
  const [posts, setPosts] = useState([]); // Stores all posts
  const [cart, setCart] = useState([]); // Stores the user's cart items
  const [showCart, setShowCart] = useState(false); // Controls whether to show the cart or not
  const [wallet, setWallet] = useState(0); // Stores the user's wallet balance
  const [searchPrice, setSearchPrice] = useState(""); // Stores the search price for filtering posts
  const [filteredPosts, setFilteredPosts] = useState([]); // Stores the filtered posts based on search price

  // Effect to check for logged-in user when the component mounts
  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      api.getWallet(parsedUser.username).then(setWallet);
    }
  }, []);

  // Effect to fetch posts, cart, and wallet when user changes
  useEffect(() => {
    if (user) {
      api.getPosts().then((posts) => {
        setPosts(posts);
        setFilteredPosts(posts);
      });
      api.getCart(user.username).then(setCart);
      api.getWallet(user.username).then(setWallet);
    }
  }, [user]);

  // Effect to filter posts based on search price
  useEffect(() => {
    if (searchPrice === "") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(
        (post) => Number(post.price) >= Number(searchPrice)
      );
      setFilteredPosts(filtered);
    }
  }, [searchPrice, posts]);

  // Handler for user login
  const handleLogin = async (username, password) => {
    try {
      const loggedInUser = await api.login(username, password);
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setWallet(loggedInUser.wallet);
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  // Handler for user logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCart([]);
    setShowCart(false);
    setWallet(0);
    setSearchPrice("");
  };

  // Handler for search functionality
  const handleSearch = (searchTerm) => {
    setSearchPrice(searchTerm);
  };

  // Handler for submitting a new post
  const handleSubmitPost = async (newPost) => {
    const submittedPost = await api.submitPost(newPost);
    setPosts((prevPosts) => [...prevPosts, submittedPost]);
    setFilteredPosts((prevFiltered) => [...prevFiltered, submittedPost]);
  };

  // Handler for deleting a post
  const handleDeletePost = async (postId) => {
    await api.deletePost(postId);
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    setFilteredPosts((prevFiltered) =>
      prevFiltered.filter((post) => post.id !== postId)
    );
  };

  // Handler for purchasing a post
  const handlePurchase = async (postId) => {
    try {
      const { purchasedPost, updatedWallet } = await api.purchasePost(
        postId,
        user.username
      );
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      setFilteredPosts((prevFiltered) =>
        prevFiltered.filter((post) => post.id !== postId)
      );
      setCart((prevCart) => [...prevCart, purchasedPost]);
      setWallet(updatedWallet);
    } catch (error) {
      alert("Purchase failed: " + error.message);
    }
  };

  // Handler for toggling cart visibility
  const toggleCart = () => {
    setShowCart(!showCart);
    if (showCart) {
      api.getPosts().then((posts) => {
        setPosts(posts);
        setFilteredPosts(
          posts.filter((post) => Number(post.price) >= Number(searchPrice))
        );
      });
    }
  };

  // Handler for clearing all data (admin function)
  const handleClearAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      await api.clearAllData();
      alert("All data has been cleared. Please log in again.");
      handleLogout();
    }
  };

  // Render login screen if no user is logged in
  if (!user) {
    return <Login onLogin={handleLogin} onClearAll={handleClearAll} />;
  }

  // Main app render for logged-in users
  return (
    <div className="App">
      <h1>Welcome, {user.username}!</h1>
      <p>Wallet: ${wallet}</p>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
      <button onClick={toggleCart} className="cart-button">
        {showCart ? "Hide Cart" : `Show Cart (${cart.length})`}
      </button>

      {showCart ? (
        // Render Cart component when showCart is true
        <Cart cart={cart} />
      ) : (
        // Render PostForm and PostList when showCart is false
        <>
          <PostForm onSubmit={handleSubmitPost} username={user.username} />
          <PostList
            posts={filteredPosts}
            cart={cart}
            onDelete={handleDeletePost}
            onPurchase={handlePurchase}
            onSearch={handleSearch}
            currentUser={user.username}
          />
        </>
      )}
    </div>
  );
}

export default App;
