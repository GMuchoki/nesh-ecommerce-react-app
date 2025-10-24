import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {

    const discountPercent = Math.round(product.discountPercentage || 0);
    const originalPrice = (product.price / (1 - (product.discountPercentage || 0) / 100)).toFixed(2);

    return(
        <article className="product-card">
            <div className="product-thumbnail-container">
                <Link to={`/product/${product.id}`}>
                    <img src={product.thumbnail} alt={product.title} />
                </Link>
                {discountPercent > 0 ? (
                    <div className="discount-badge">-{discountPercent}%</div>
                ) : (
                    <div className="discount-badge">-{discountPercent}%</div>
                )}
                <button className="wishlist-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>

            <div className="product-body">
                <h3 className="product-title">{product.title}</h3>

                <div className="product-price-section">
                    <p className="product-current-price">${product.price}</p>
                    {discountPercent > 0 && (
                        <span className="product-original-price">${originalPrice}</span>
                    )}
                </div>
                <div className="product-rating-section">
                    <span>⭐{product.rating != null ? (Math.floor(product.rating * 10) / 10) : 'N/A'}</span>
                    <span className="product-stock-info">{product.stock ?? 0} in stock</span>
                </div>
                <div className="product-action-buttons">
                    <Link to="" className="btn btn-primary">Checkout</Link>
                    <Link to="" className="btn btn-secondary">Add to cart</Link>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
