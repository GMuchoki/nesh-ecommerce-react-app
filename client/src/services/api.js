import axios from "axios";

const API_BASE = "https://dummyjson.com/products";

export async function getProducts() {
    const res = await axios.get(API_BASE);
    return res.data;
}

export async function getProductsById(id) {
    const res = await axios.get(`${API_BASE}/${id}`);
    return res.data;
}
