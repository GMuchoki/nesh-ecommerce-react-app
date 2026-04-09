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
