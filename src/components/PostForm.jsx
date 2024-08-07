import React, { useState } from 'react';
import { resizeImage } from '../utils/imageUtils';

function PostForm({ onSubmit, username }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [price, setPrice] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const resizedImage = await resizeImage(file, 800, 600);
      setSelectedImage(resizedImage);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedImage && price) {
      onSubmit({ image: selectedImage, price, author: username });
      setSelectedImage(null);
      setPrice('');
    } else {
      alert('Please enter both price and image');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <div className="form-group">
        <label htmlFor="priceInput">Enter Price of Your Ticket: </label>
        <input
          type="number"
          id="priceInput"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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
  );
}

export default PostForm;