"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Clock, LogOut, ShoppingBag, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();

  if (!user) { router.push("/login"); return null; }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", user.id],
    queryFn: () => getUserOrders(user.id),
    enabled: !!user?.id,
  });

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem", maxWidth: "960px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>My Account</h1>
          <p style={{ color: "var(--text-secondary)" }}>Welcome back, <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{profile?.full_name || user.email}</span></p>
        </div>
        <button onClick={() => { logout(); router.push("/"); }} style={{
          display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", borderRadius: "0.75rem",
          border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-secondary)",
          fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
        }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {/* Order History */}
      <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Clock size={18} style={{ color: "var(--text-muted)" }} /> Order History
      </h2>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: "120px", background: "var(--bg-secondary)", borderRadius: "1rem", animation: "pulse 2s infinite" }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "1.5rem",
          padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <ShoppingBag size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} strokeWidth={1.5} />
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>No orders yet</h3>
          <p style={{ color: "var(--text-muted)", maxWidth: "320px", marginBottom: "1.5rem" }}>When you place an order, it will appear here with tracking info.</p>
          <Link href="/" className="btn-primary" style={{ padding: "0.625rem 1.5rem" }}>
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {orders.map((order: any) => (
            <div key={order.id} style={{
              background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "1rem",
              overflow: "hidden", boxShadow: "var(--card-shadow)", transition: "box-shadow 0.2s"
            }}>
              {/* Order Header */}
              <div style={{
                background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", padding: "1rem 1.5rem",
                display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", fontSize: "0.8125rem"
              }}>
                <div style={{ display: "flex", gap: "2rem" }}>
                  <div><p style={{ color: "var(--text-muted)", fontWeight: 500, marginBottom: "0.125rem" }}>Date</p><p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{new Date(order.created_at).toLocaleDateString()}</p></div>
                  <div><p style={{ color: "var(--text-muted)", fontWeight: 500, marginBottom: "0.125rem" }}>Total</p><p style={{ fontWeight: 600, color: "var(--text-primary)" }}>Ksh {(order.total_amount || 0).toLocaleString()}</p></div>
                  <div><p style={{ color: "var(--text-muted)", fontWeight: 500, marginBottom: "0.125rem" }}>Order</p><p style={{ fontWeight: 600, color: "var(--text-primary)" }}>#{order.id.split("-")[0]}</p></div>
                </div>
                <span style={{
                  background: order.status === "pending" ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
                  color: order.status === "pending" ? "#f59e0b" : "#22c55e",
                  border: `1px solid ${order.status === "pending" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)"}`,
                  padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em"
                }}>{order.status || "completed"}</span>
              </div>
              {/* Order Items */}
              <div style={{ padding: "1.25rem 1.5rem" }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {order.order_items?.map((item: any, idx: number) => (
                  <div key={idx} style={{
                    display: "flex", alignItems: "center", gap: "1rem", paddingBottom: "1rem", marginBottom: "1rem",
                    borderBottom: idx < order.order_items.length - 1 ? "1px solid var(--border-color)" : "none"
                  }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "0.5rem", overflow: "hidden", background: "var(--bg-secondary)", flexShrink: 0 }}>
                      {item.products?.image_url ? <img src={item.products.image_url} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.625rem" }}>N/A</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>{item.products?.name || "Unknown"}</h4>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Qty: {item.quantity}</p>
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.875rem" }}>Ksh {(item.unit_price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                {(!order.order_items || order.order_items.length === 0) && <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", fontStyle: "italic" }}>Items could not be loaded.</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
