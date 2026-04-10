import Link from "next/link";
import { Heart, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-brand">Nesh<span style={{ color: "var(--accent)" }}>.</span>Store</div>
            <p className="footer-desc">
              Premium electronics & lifestyle products. Fast delivery, secure payments, and exceptional customer service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading">Shop</h4>
            <ul className="footer-links">
              <li><Link href="/">All Products</Link></li>
              <li><Link href="/wishlist">Wishlist</Link></li>
              <li><Link href="/cart">Cart</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="footer-heading">Account</h4>
            <ul className="footer-links">
              <li><Link href="/login">Sign In</Link></li>
              <li><Link href="/signup">Create Account</Link></li>
              <li><Link href="/dashboard">My Orders</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-links">
              <li className="flex items-center gap-2"><MapPin size={14} /> Nairobi, Kenya</li>
              <li className="flex items-center gap-2"><Mail size={14} /> hello@neshstore.com</li>
              <li className="flex items-center gap-2"><Phone size={14} /> +254 700 000 000</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {currentYear} NeshStore. Built by Geoffrey Munene.</span>
          <span className="flex items-center gap-1">Made with <Heart size={12} className="text-red-500 fill-red-500" /> in Nairobi</span>
        </div>
      </div>
    </footer>
  );
}
