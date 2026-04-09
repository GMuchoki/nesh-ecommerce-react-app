import { supabase } from "./supabaseClient";

export async function getProducts(category = "all") {
    let query = supabase.from('products').select('*');
    if (category !== "all") {
        query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }
    return data || [];
}

export async function getProductsById(id) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) {
        console.error("Error fetching product:", error);
        return null;
    }
    return data;
}

export async function getCategories() {
    const { data, error } = await supabase.from('products').select('category');
    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
    const uniqueCategories = [...new Set((data || []).map(item => item.category))];
    return uniqueCategories;
}

export async function createOrder(orderData, orderItems) {
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
    
    if (orderError) throw orderError;
    
    const items = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.qty,
        unit_price: item.price
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items);
        
    if (itemsError) throw itemsError;

    return order;
}
