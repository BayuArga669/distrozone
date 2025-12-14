import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import Home from './pages/Home';
import Shop from './pages/Shop';
import Footer from './components/Footer';

// Public imports
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MyOrders from './pages/user/MyOrders';
import OrderDetail from './pages/user/OrderDetail';
import UserProfile from './pages/user/UserProfile';
import MyWishlist from './pages/user/MyWishlist';
import MyAddresses from './pages/user/MyAddresses';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Admin imports
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Categories from './pages/admin/Categories';
import AdminChats from './pages/admin/Chats';
import AdminLogin from './pages/admin/Login';
import AdminReviews from './pages/admin/Reviews';
import Settings from './pages/admin/Settings';
import AdminCoupons from './pages/admin/Coupons';
import AdminReports from './pages/admin/Reports';
import AdminPosts from './pages/admin/Posts';
import PostEditor from './pages/admin/PostEditor';
import PostPreview from './pages/admin/PostPreview';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <div className="app">
                <Navbar />
                <Home />
                <Footer />
              </div>
            } />
            <Route path="/shop" element={
              <div className="app">
                <Navbar />
                <Shop />
                <Footer />
              </div>
            } />
            <Route path="/about" element={
              <div className="app">
                <Navbar />
                <About />
                <Footer />
              </div>
            } />
            <Route path="/product/:slug" element={
              <div className="app">
                <Navbar />
                <ProductDetail />
                <Footer />
              </div>
            } />
            <Route path="/blog" element={
              <Blog />
            } />
            <Route path="/blog/:slug" element={
              <BlogPost />
            } />

            {/* Customer Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/cart" element={
              <div className="app">
                <Navbar />
                <Cart />
              </div>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <Checkout />
                </div>
              </ProtectedRoute>
            } />

            {/* User Routes (Should be protected) */}
            <Route path="/orders" element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <MyOrders />
                  <Footer />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <OrderDetail />
                  <Footer />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <UserProfile />
                  <Footer />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <MyWishlist />
                  <Footer />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/addresses" element={
              <ProtectedRoute>
                <div className="app">
                  <Navbar />
                  <MyAddresses />
                  <Footer />
                </div>
              </ProtectedRoute>
            } />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes (Protected) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="categories" element={<Categories />} />
              <Route path="chats" element={<AdminChats />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="posts/new" element={<PostEditor />} />
              <Route path="posts/:id/edit" element={<PostEditor />} />
              <Route path="posts/preview" element={<PostPreview />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
