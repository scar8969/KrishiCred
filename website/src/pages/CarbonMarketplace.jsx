import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import pseudoDatabase from '../services/pseudoDatabase';
import { useMarketplaceStore } from '../stores/index';

const CarbonMarketplace = () => {
  const { listings: storeListings, cart, addToCart, removeFromCart, clearCart, getTotalValue } = useMarketplaceStore();

  // Get real listings from pseudoDatabase
  const marketplaceListings = pseudoDatabase.marketplaceListings;

  // Filter states
  const [filters, setFilters] = useState({
    district: 'all',
    status: 'verified',
    priceMin: 800,
    priceMax: 2500,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [notification, setNotification] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Punjab',
    pincode: '',
    paymentMethod: 'upi',
  });

  const [formErrors, setFormErrors] = useState({});

  // Get districts from pseudoDatabase for the dropdown
  const districts = pseudoDatabase.districts;

  // Filter listings
  const filteredListings = useMemo(() => {
    return marketplaceListings.filter((listing) => {
      // Status filter
      if (filters.status === 'verified' && listing.verificationStatus !== 'verified' && listing.verificationStatus !== 'approved') {
        return false;
      }
      if (filters.status === 'pending' && listing.verificationStatus === 'verified') {
        return false;
      }

      // District filter
      if (filters.district !== 'all') {
        const district = districts.find(d => d.name === filters.district);
        if (district && listing.sellerId && !listing.sellerId.includes(district.id)) {
          return false;
        }
      }

      // Price filter
      if (listing.pricePerUnit < filters.priceMin || listing.pricePerUnit > filters.priceMax) {
        return false;
      }

      return true;
    });
  }, [filters, marketplaceListings, districts]);

  // Cart calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add to cart
  const handleAddToCart = (listing) => {
    addToCart(listing);
    setNotification({ type: 'success', message: 'Added to cart!' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Remove from cart
  const handleRemoveFromCart = (id) => {
    removeFromCart(id);
    setNotification({ type: 'info', message: 'Removed from cart' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Buy now (add to cart and show cart)
  const handleBuyNow = (listing) => {
    handleAddToCart(listing);
    setShowCart(true);
  };

  // Validate checkout form
  const validateForm = () => {
    const errors = {};
    if (!checkoutForm.name.trim()) errors.name = 'Name is required';
    if (!checkoutForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(checkoutForm.email)) errors.email = 'Invalid email';
    if (!checkoutForm.phone.trim()) errors.phone = 'Phone is required';
    else if (!/^\+?\d{10,15}$/.test(checkoutForm.phone.replace(/\s/g, ''))) errors.phone = 'Invalid phone number';
    if (!checkoutForm.address.trim()) errors.address = 'Address is required';
    if (!checkoutForm.city.trim()) errors.city = 'City is required';
    if (!checkoutForm.pincode.trim()) errors.pincode = 'Pincode is required';
    return errors;
  };

  // Checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCart(false);
    setShowCheckout(true);
  };

  // Process order
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Simulate order processing
    const newOrderId = `ORD${Date.now()}`;
    setOrderId(newOrderId);
    setOrderPlaced(true);
    clearCart();

    // Reset form
    setTimeout(() => {
      setShowCheckout(false);
      setOrderPlaced(false);
      setCheckoutForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: 'Punjab',
        pincode: '',
        paymentMethod: 'upi',
      });
      setFormErrors({});
    }, 5000);
  };

  // Close checkout modal
  const handleCloseCheckout = () => {
    if (orderPlaced) return; // Don't allow closing during success state
    setShowCheckout(false);
    setFormErrors({});
  };

  // Clear cart
  const handleClearCart = () => {
    clearCart();
    setNotification({ type: 'info', message: 'Cart cleared' });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="bg-background text-on-background">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up ${
          notification.type === 'success' ? 'bg-primary-container text-on-primary-container' :
          notification.type === 'error' ? 'bg-error-container text-on-error-container' :
          'bg-surface-container-high text-on-surface'
        }`}>
          <span className="material-symbols-outlined text-sm">
            {notification.type === 'success' ? 'check_circle' : notification.type === 'error' ? 'error' : 'info'}
          </span>
          <span className="text-sm font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/10 rounded-full"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Cart Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface-container-lowest shadow-2xl transform transition-transform z-50 ${
        showCart ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-surface-container-high flex justify-between items-center">
            <h3 className="text-xl font-bold">Your Cart</h3>
            <button onClick={() => setShowCart(false)} className="p-2 hover:bg-surface-container-high rounded-full">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">shopping_cart</span>
                <p className="text-on-surface-variant">Your cart is empty</p>
                <button onClick={() => setShowCart(false)} className="mt-4 text-primary font-bold hover:underline">
                  Browse Credits
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-surface-container-low p-4 rounded-xl flex gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.title}</p>
                        <p className="text-xs text-on-surface-variant">
                          {item.quantity} tCO2e at ₹{item.pricePerUnit}/ton
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">₹{(item.quantity * item.pricePerUnit).toLocaleString()}</p>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-xs text-tertiary hover:underline mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t border-surface-container-high">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-medium">Total Credits</span>
                <span className="font-bold">{cartCount} tCO2e</span>
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-sm font-medium">Cart Value</span>
                <span className="text-2xl font-black text-primary">₹{cartTotal.toLocaleString()}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={handleClearCart}
                className="w-full mt-3 py-2 text-sm text-on-surface-variant hover:text-primary"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseCheckout}></div>
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Close Button */}
            {!orderPlaced && (
              <button
                onClick={handleCloseCheckout}
                className="absolute top-4 right-4 p-2 hover:bg-surface-container-high rounded-full z-10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}

            {orderPlaced ? (
              // Success State
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl text-on-primary-container">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-2">Order Placed Successfully!</h2>
                <p className="text-on-surface-variant mb-4">Your carbon credits purchase has been confirmed.</p>
                <div className="bg-surface-container-low rounded-xl p-4 mb-6">
                  <p className="text-sm text-on-surface-variant">Order ID</p>
                  <p className="text-xl font-bold text-primary font-mono">{orderId}</p>
                </div>
                <p className="text-sm text-on-surface-variant">
                  A confirmation email has been sent to your registered email address with all the details.
                </p>
              </div>
            ) : (
              // Checkout Form
              <div className="p-8">
                <h2 className="text-2xl font-bold text-on-surface mb-2">Checkout</h2>
                <p className="text-on-surface-variant mb-6">Complete your purchase of {cartCount} carbon credits</p>

                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  {/* Order Summary */}
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <h3 className="font-bold text-sm mb-3">Order Summary</h3>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-on-surface-variant">{item.title} ({item.quantity} tCO2e)</span>
                          <span className="font-medium">₹{(item.quantity * item.pricePerUnit).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-surface-container-highest mt-3 pt-3 flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-primary text-xl">₹{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="font-bold text-sm mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.name}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                          className={`w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary ${formErrors.name ? 'ring-2 ring-error' : ''}`}
                          placeholder="Enter your name"
                        />
                        {formErrors.name && <p className="text-error text-xs mt-1">{formErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={checkoutForm.email}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                          className={`w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary ${formErrors.email ? 'ring-2 ring-error' : ''}`}
                          placeholder="your@email.com"
                        />
                        {formErrors.email && <p className="text-error text-xs mt-1">{formErrors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={checkoutForm.phone}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                          className={`w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary ${formErrors.phone ? 'ring-2 ring-error' : ''}`}
                          placeholder="+91 98765 43210"
                        />
                        {formErrors.phone && <p className="text-error text-xs mt-1">{formErrors.phone}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.city}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                          className={`w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary ${formErrors.city ? 'ring-2 ring-error' : ''}`}
                          placeholder="Your city"
                        />
                        {formErrors.city && <p className="text-error text-xs mt-1">{formErrors.city}</p>}
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Address *
                      </label>
                      <textarea
                        value={checkoutForm.address}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                        className={`w-full bg-surface-container-highest border-none rounded-xl p-4 focus:ring-2 focus:ring-primary ${formErrors.address ? 'ring-2 ring-error' : ''}`}
                        placeholder="Complete address"
                        rows="2"
                      />
                      {formErrors.address && <p className="text-error text-xs mt-1">{formErrors.address}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.state}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, state: e.target.value })}
                          className="w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.pincode}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, pincode: e.target.value })}
                          className={`w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary ${formErrors.pincode ? 'ring-2 ring-error' : ''}`}
                          placeholder="141001"
                        />
                        {formErrors.pincode && <p className="text-error text-xs mt-1">{formErrors.pincode}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-bold text-sm mb-3">Payment Method</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'upi', label: 'UPI', icon: 'qr_code' },
                        { id: 'card', label: 'Card', icon: 'credit_card' },
                        { id: 'bank', label: 'Bank Transfer', icon: 'account_balance' },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: method.id })}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                            checkoutForm.paymentMethod === method.id
                              ? 'border-primary bg-primary-container text-on-primary-container'
                              : 'border-surface-container-highest bg-surface-container-highest hover:bg-surface-container-high'
                          }`}
                        >
                          <span className="material-symbols-outlined">{method.icon}</span>
                          <span className="text-xs font-bold">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseCheckout}
                      className="px-6 py-4 bg-surface-container-low text-on-surface hover:bg-surface-container-high rounded-xl font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 signature-gradient text-on-primary py-4 rounded-xl font-bold active:scale-95 transition-all"
                    >
                      Place Order - ₹{cartTotal.toLocaleString()}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 pt-24">
        {/* Stats Header - Remove fake numbers, show cart button */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-surface-container-low p-6 rounded-xl">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Available Credits</p>
            <h2 className="text-4xl font-extrabold text-on-surface">{filteredListings.length}</h2>
            <p className="mt-2 text-on-surface-variant text-sm">Verified listings</p>
          </div>

          <div className="bg-secondary-container p-6 rounded-xl text-on-secondary-container">
            <p className="font-medium mb-1 opacity-90">Market Price Range</p>
            <h2 className="text-4xl font-extrabold">₹800 - ₹2,500<span className="text-lg font-semibold">/tCO2e</span></h2>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Your Cart</p>
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-extrabold text-primary">{cartCount}</h2>
              <span className="text-sm text-on-surface-variant">credits</span>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 active:scale-95"
            >
              View Cart
            </button>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl text-center">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Total Value</p>
            <h2 className="text-4xl font-extrabold text-primary">₹{cartTotal.toLocaleString()}</h2>
          </div>
        </section>

        {/* Filters Section - Make functional */}
        <section className="mb-10">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-surface-container-low hover:bg-surface-container-high text-on-surface px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">tune</span>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <span className="bg-surface-container-highest px-2 py-1 rounded-full text-xs">
              {`${Object.values(filters).filter(v => v !== 'all' && v !== 800 && v !== 2500).length} active`}
            </span>
          </button>

          {showFilters && (
            <div className="mt-4 bg-surface-container-low p-6 rounded-xl space-y-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">District</label>
                <select
                  value={filters.district}
                  onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                  className="w-full bg-surface-container-lowest border-none rounded-xl h-12 px-4 appearance-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Districts</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Verification Status</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFilters({ ...filters, status: 'verified' })}
                    className={`px-4 py-2 rounded-xl font-bold text-sm ${
                      filters.status === 'verified' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Verified
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, status: 'pending' })}
                    className={`px-4 py-2 rounded-xl font-bold text-sm ${
                      filters.status === 'pending' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, status: 'all' })}
                    className={`px-4 py-2 rounded-xl font-bold text-sm ${
                      filters.status === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  Price Range: ₹{filters.priceMin} - ₹{filters.priceMax}
                </label>
                <input
                  type="range"
                  min="800"
                  max="2500"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: parseInt(e.target.value) })}
                  className="w-full accent-primary h-2 bg-surface-container-highest rounded-full appearance-none"
                />
              </div>
            </div>
          )}
        </section>

        {/* Marketplace Grid */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">
            Available Carbon Credits
          </h3>
          <span className="text-sm text-on-surface-variant">
            {filteredListings.length} listings found
          </span>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-low rounded-xl">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">search_off</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">No credits found</h3>
            <p className="text-on-surface-variant">Try adjusting your filters</p>
            <button
              onClick={() => setFilters({ district: 'all', status: 'verified', priceMin: 800, priceMax: 2500 })}
              className="mt-4 text-primary font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 w-full relative">
                  <img className="w-full h-full object-cover" src={listing.image} alt={listing.title} />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    <span className="text-xs font-extrabold text-on-surface">VERIFIED</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase">Credit ID: {listing.id}</p>
                    <h4 className="text-xl font-bold text-on-surface">{listing.title}</h4>
                    <p className="text-sm text-on-surface-variant mt-1">{listing.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-surface-container-low p-3 rounded-xl">
                      <p className="text-xs text-on-surface-variant mb-1">Quantity</p>
                      <p className="text-lg font-bold">
                        {listing.quantity} <span className="text-xs font-normal">tCO2e</span>
                      </p>
                    </div>
                    <div className="bg-secondary-fixed/30 p-3 rounded-xl">
                      <p className="text-xs text-on-secondary-fixed-variant mb-1">Price / Ton</p>
                      <p className="text-lg font-bold text-secondary">₹{listing.pricePerUnit}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
                      <span className="material-symbols-outlined text-on-surface-variant">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{listing.sellerName}</p>
                      <p className="text-xs text-on-surface-variant">{listing.sellerId}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleBuyNow(listing)}
                      className="flex-1 signature-gradient text-on-primary py-3 rounded-xl font-bold text-sm active:scale-95 transition-all"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={() => handleAddToCart(listing)}
                      className="px-4 py-3 bg-surface-container-low text-on-surface hover:bg-surface-container-high rounded-xl font-bold text-sm transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CarbonMarketplace;
