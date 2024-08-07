import React from 'react';
import BlurredImage from './BlurredImage';

function Cart({ cart }) {
  return (
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
  );
}

export default Cart;
