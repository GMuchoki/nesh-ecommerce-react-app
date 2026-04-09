import { supabase } from "./supabaseClient";

export async function getProducts(category = "all") {
    let query = supabase.from('products').select('*, reviews (rating)');
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
    const { data, error } = await supabase.from('products').select('*, reviews (rating)').eq('id', id).single();
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
    const orderId = crypto.randomUUID();
    const { error: orderError } = await supabase.from('orders').insert([{ id: orderId, ...orderData }]);
    
    if (orderError) throw orderError;
    
    const items = orderItems.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.qty,
        unit_price: item.price
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items);
        
    if (itemsError) throw itemsError;

    return { id: orderId, ...orderData };
}

export async function getUserOrders(userId) {
    if (!userId) return [];
    
    // We fetch orders and their related items joined with products.
    // Supabase allows this if foreign keys are properly set up:
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                id, product_id, quantity, unit_price,
                products ( name, image_url )
            )
        `)
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error("Error fetching user orders:", error);
        return [];
    }
    
    return data || [];
}

export async function insertProduct(productData) {
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
        
    if (error) {
        throw error;
    }
    return data;
}

export async function getProductReviews(productId) {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            id, rating, comment, created_at,
            profiles ( * )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
    return data || [];
}

export async function submitReview(reviewData) {
    const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single();
        
    if (error) {
        throw error;
    }
    return data;
}
export async function updateProduct(id, productData) {
    const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
        
    if (error) throw error;
    return data;
}

export async function deleteProduct(id) {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
    if (error) throw error;
    return true;
}
