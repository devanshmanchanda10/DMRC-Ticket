import React, { useState } from 'react';
import BlurredImage from './BlurredImage';

function PostList({ posts, cart, onDelete, onPurchase, onSearch, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div>
      <div className="search-container">
        <label htmlFor="priceSearch">Price of ticket you want</label>
        <input
          id="priceSearch"
          type="number"
          placeholder="Enter price"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">🔍</button>
      </div>

      <div className="posts-container">
        <h2>All Posts</h2>
        {posts
          .filter((post) => !cart.some((cartItem) => cartItem.id === post.id))
          .map((post) => (
            <div key={post.id} className="post">
              <BlurredImage
                src={post.image}
                isBlurred={post.author !== currentUser}
                alt="Posted"
              />
              <p>Price: ${post.price}</p>
              <p>Posted by: {post.author}</p>
              {post.author === currentUser ? (
                <button onClick={() => onDelete(post.id)} className="delete-button">Delete</button>
              ) : (
                <button onClick={() => onPurchase(post.id)} className="purchase-button">Purchase</button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default PostList;
