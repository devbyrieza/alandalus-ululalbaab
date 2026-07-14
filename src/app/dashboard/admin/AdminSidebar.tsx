"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

import {
  LayoutDashboard,
  Users,
  FileCheck,
  CreditCard,
  Calendar,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  BarChart,
  ClipboardEdit,
  UserCog,
  Landmark,
  Map,
  Zap,
  UserCircle,
  Edit3,
  Activity,
  PieChart,
  Shuffle,
  Shirt,
  Wallet,
  GraduationCap
} from "lucide-react";

import {
  getMenuItemsForRole,
  UserRole,
  ROLE_LABELS,
} from "@/lib/access-control";
import { BRANDING } from "@/config/branding";

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Users,
  FileCheck,
  CreditCard,
  Calendar,
  Trophy,
  Settings,
  FileText,
  BarChart,
  ClipboardEdit,
  UserCog,
  Landmark,
  Map,
  Zap,
  UserCircle,
  Edit3,
  Activity,
  PieChart,
  Shuffle,
  Shirt,
  Wallet,
};

interface AdminSidebarProps {
  children: React.ReactNode;
  userRole: UserRole | null;
  adminName: string;
  userId?: string;
  availableRoles?: string[];
  unverifiedPaymentsCount?: number;
  unverifiedDocsCount?: number;
  pendingDataRequestsCount?: number;
}

export default function AdminSidebar({
  children,
  userRole,
  adminName,
  userId,
  availableRoles,
  unverifiedPaymentsCount = 0,
  unverifiedDocsCount = 0,
  pendingDataRequestsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [paymentsCount, setPaymentsCount] = useState(unverifiedPaymentsCount);
  const [docsCount, setDocsCount] = useState(unverifiedDocsCount);
  const [requestsCount, setRequestsCount] = useState(pendingDataRequestsCount);

  useEffect(() => {
    if (!userRole || userRole === "pendaftar") return;
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/sidebar-counts");
        if (res.ok) {
          const data = await res.json();
          setPaymentsCount(data.unverifiedPaymentsCount || 0);
          setDocsCount(data.unverifiedDocsCount || 0);
          setRequestsCount(data.pendingDataRequestsCount || 0);
        }
      } catch (error) {}
    };
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [userRole]);

  const rawMenuItems = userRole ? getMenuItemsForRole(userRole) : [];
  const menuItems = rawMenuItems.map((item) => {
    let badgeCount = 0;
    if (item.name === "Verifikasi Pembayaran") badgeCount = paymentsCount;
    else if (item.name === "Verifikasi Dokumen") badgeCount = docsCount;
    else if (item.name === "Perubahan Data" || item.name.includes("Perubahan") || item.name.includes("Edit")) badgeCount = requestsCount;

    return {
      ...item,
      icon: ICON_MAP[item.icon] || LayoutDashboard,
      isActive: pathname === item.href,
      badge: badgeCount,
    };
  });

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Keluar Sekarang?",
      text: "Anda akan diarahkan kembali ke halaman login.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    }
  };

  return (
    <div className="app-layout">
      <div className="mobile-header" style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, height: 56, background: "var(--primary-dark)", zIndex: 50, padding: "0 16px", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "white", fontWeight: 800, fontSize: 16 }}>{BRANDING.schoolShortName}</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", color: "white", display: "flex", padding: 4 }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <aside className={`app-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, var(--secondary), var(--secondary-light))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <GraduationCap size={22} color="var(--primary-dark)" />
            </div>
            <div>
              <h1>{BRANDING.schoolShortName}</h1>
              <p>Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Menu Utama</div>
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-link ${item.isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={18} />
              {item.name}
              {item.badge > 0 && <span className="badge badge-alpha" style={{ marginLeft: "auto" }}>{item.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 700, color: "white" }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {adminName}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userRole ? ROLE_LABELS[userRole] : "Admin"}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", color: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.15)" }}>
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 39 }} />
      )}

      <main className="app-content">
        <header className="page-header" style={{ display: "flex" }}>
          <div>
            <h1>Admin Portal</h1>
            <p>Sistem Informasi Pendaftaran</p>
          </div>
        </header>
        <div style={{ padding: "24px" }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
          .app-content { padding-top: 56px; }
          .page-header { display: none !important; }
        }
      `}</style>
    </div>
  );
}
