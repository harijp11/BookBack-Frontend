import React from 'react';

const UserLanding: React.FC = () => {
  return (
    <div className="font-sans text-black bg-white">
      {/* Header / Hero Section */}
      <header className="bg-black text-white py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center">
          Borrow, Lend, Read – BookBack
        </h1>
        <p className="text-lg md:text-xl text-center mt-4">
          Share your bookshelf and rent from others in your community.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button className="bg-white text-black border-2 border-black py-2 px-6 hover:bg-black hover:text-white transition">
            Download the App
          </button>
          <button className="bg-white text-black border-2 border-black py-2 px-6 hover:bg-black hover:text-white transition">
            Learn More
          </button>
        </div>
        
      </header>

      {/* Why BookBack Section */}
      <section className="py-10 px-4 border-b border-black">
        <h2 className="text-3xl font-bold text-center mb-8">A New Way to Enjoy Books</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="w-64 p-4">
            <h3 className="text-xl font-semibold">Save Money</h3>
            <p>Rent books instead of buying new.</p>
          </div>
          <div className="w-64 p-4">
            <h3 className="text-xl font-semibold">Share Your Collection</h3>
            <p>Earn by lending your books.</p>
          </div>
          <div className="w-64 p-4">
            <h3 className="text-xl font-semibold">Community-Driven</h3>
            <p>Connect with local readers.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 px-4 border-b border-black">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="w-64 p-4">
            <h3 className="text-xl font-semibold">1. Sign Up</h3>
            <p>List books you’re willing to lend.</p>
          </div>
          <div className="w-64 p-4">
            <h3 className="text-xl font-semibold">2. Browse</h3>
            <p>Find books from users near you.</p>
          </div>
          <div className="w-64 p-4">
            <h3 className="text-xl font-semibold">3. Rent or Lend</h3>
            <p>Arrange secure rentals.</p>
          </div>
          <div className="w-64 p-4">
            <h3 className="text-xl font-semibold">4. Enjoy</h3>
            <p>Read, return, and repeat!</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 px-4 border-b border-black">
        <h2 className="text-3xl font-bold text-center mb-8">What Makes BookBack Special</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="w-48 p-4">User Ratings</div>
          <div className="w-48 p-4">Secure Payments</div>
          <div className="w-48 p-4">Local Focus</div>
          <div className="w-48 p-4">Wishlist</div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Ready to Dive In?</h2>
        <p className="text-lg text-center mb-6">Join the BookBack community today.</p>
        <div className="flex justify-center">
          <button className="bg-white text-black border-2 border-black py-2 px-6 hover:bg-black hover:text-white transition">
            Get the App Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-6 px-4 text-center">
        <p>© 2025 BookBack. All rights reserved.</p>
        <p className="mt-2">
          About Us | FAQ | Contact | Terms | Privacy
        </p>
      </footer>
    </div>
  );
};

export default UserLanding;