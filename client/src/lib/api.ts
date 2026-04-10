import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ---- PRODUCTS ----
export async function getProducts(category = "all") {
  let query = supabase.from("products").select("*, reviews (rating)");
  if (category !== "all") query = query.eq("category", category);
  const { data, error } = await query;
  if (error) { console.error("Error fetching products:", error); return []; }
  return data || [];
}

export async function getProductsById(id: string) {
  const { data, error } = await supabase.from("products").select("*, reviews (rating)").eq("id", id).single();
  if (error) { console.error("Error fetching product:", error); return null; }
  return data;
}

export async function getCategories() {
  const { data, error } = await supabase.from("products").select("category");
  if (error) { console.error("Error fetching categories:", error); return []; }
  return [...new Set((data || []).map((item: { category: string }) => item.category))];
}

// ---- ORDERS ----
export async function createOrder(orderData: Record<string, unknown>, orderItems: Array<{ id: string; qty: number; price: number }>) {
  const orderId = crypto.randomUUID();
  const { error: orderError } = await supabase.from("orders").insert([{ id: orderId, ...orderData }]);
  if (orderError) throw orderError;
  const items = orderItems.map((item) => ({ order_id: orderId, product_id: item.id, quantity: item.qty, unit_price: item.price }));
  const { error: itemsError } = await supabase.from("order_items").insert(items);
  if (itemsError) throw itemsError;
  return { id: orderId, ...orderData };
}

export async function getUserOrders(userId: string) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("orders")
    .select(`*, order_items (id, product_id, quantity, unit_price, products ( name, image_url ))`)
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error("Error fetching user orders:", error); return []; }
  return data || [];
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(`*, order_items (id, product_id, quantity, unit_price, products ( name, image_url )), profiles!orders_customer_id_fkey ( full_name, role )`)
    .order("created_at", { ascending: false });
  if (error) { console.error("Error fetching all orders:", error); return []; }
  return data || [];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabase.from("orders").update({ status }).eq("id", orderId).select().single();
  if (error) throw error;
  return data;
}

// ---- PRODUCTS CRUD ----
export async function insertProduct(productData: Record<string, unknown>) {
  const { data, error } = await supabase.from("products").insert([productData]).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, productData: Record<string, unknown>) {
  const { data, error } = await supabase.from("products").update(productData).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// ---- REVIEWS ----
export async function getProductReviews(productId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select(`id, rating, comment, created_at, profiles ( * )`)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) { console.error("Error fetching reviews:", error); return []; }
  return data || [];
}

export async function submitReview(reviewData: Record<string, unknown>) {
  const { data, error } = await supabase.from("reviews").insert([reviewData]).select().single();
  if (error) throw error;
  return data;
}

// ---- CRM ----
export async function getCustomers() {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) { console.error("Error fetching customers:", error); return []; }
  return data || [];
}

// ---- BRANDS ----
export async function getBrands() {
  const { data, error } = await supabase.from("brands").select("*").order("name", { ascending: true });
  if (error) { console.error("Error fetching brands:", error); return []; }
  return data || [];
}

export async function insertBrand(brandData: Record<string, unknown>) {
  const { data, error } = await supabase.from("brands").insert([brandData]).select().single();
  if (error) throw error;
  return data;
}

export async function updateBrand(id: string, brandData: Record<string, unknown>) {
  const { data, error } = await supabase.from("brands").update(brandData).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBrand(id: string) {
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// ---- PAYMENT VERIFICATION (Server-Side Price Trust) ----
export async function verifyPaystackPayment(data: {
  reference: string;
  guestEmail: string;
  userId: string | null;
  cart: Array<{ id: string; qty: number }>;
}) {
  const res = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Payment verification failed");
  return result;
}

// ---- STAFF & COMMISSION ----
export async function getSalesTeam() {
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "salesperson");
  if (error) throw error;
  return data || [];
}

export async function createSalesStaff(staffData: { email: string; password: string; fullName: string }) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("No active session");
  const res = await fetch("/api/admin/create-staff", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(staffData),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to provision staff account");
  return result;
}

// ---- DARAJA (M-PESA) ----
export async function pushSTK(phone: string, amount: number) {
  const res = await fetch("/api/mpesa/stkpush", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, amount }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error);
  return result;
}

export async function verifySTK(checkoutRequestId: string) {
  const res = await fetch(`/api/mpesa/stkpush/query/${checkoutRequestId}`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.error);
  return result;
}
