import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
    return(
        <article className="product-card">
            <Link to={`/product/${product.id}`}>
                <img src={product.thumbnail} alt={product.title} className="product-thumb" />
            </Link>
            <div className="product-body">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-price">${product.price}</p>
                <div className="product-actions">
                    <Link to={`/product/${product.id}`} className="btn small">View</Link>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;