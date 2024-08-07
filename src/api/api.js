// Simulated backend API
export const api = {
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
        resolve(posts.map((post) => ({ ...post, purchased: false })));
      }, 500);
    });
  },

  deletePost: (postId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let posts = JSON.parse(localStorage.getItem('posts') || '[]');
        posts = posts.filter((post) => post.id !== postId);
        localStorage.setItem('posts', JSON.stringify(posts));
        resolve();
      }, 500);
    });
  },

  purchasePost: (postId, buyer) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const purchasedPostIndex = posts.findIndex((post) => post.id === postId);
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