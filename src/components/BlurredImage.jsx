import React from 'react';

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
        className={isBlurred ? 'blurred-image' : 'clear-image'}
      />
      {inCart && (
        <button onClick={handleDownload} className="download-button">
          Download
        </button>
      )}
    </div>
  );
}

export default BlurredImage;