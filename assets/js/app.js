/* ============================================================
   ERP shared app utilities: toast, formatting, nav state
   ============================================================ */

const AppUtils = (function () {
  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return (
      d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " · " +
      d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    );
  }

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function toast(message, type = "default") {
    let root = document.getElementById("toast-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "toast-root";
      document.body.appendChild(root);
    }
    const el = document.createElement("div");
    el.className = "toast" + (type !== "default" ? " " + type : "");
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function syncSidebarBrand() {
    const brand = document.querySelector(".sidebar-brand");
    if (!brand || !window.AppRole || brand.querySelector(".role-switch")) return;

    brand.style.flexWrap = "wrap";
    const select = document.createElement("select");
    select.className = "role-switch";
    select.setAttribute("aria-label", "Pilih role");
    select.style.cssText = "width:100%;margin-top:10px;padding:8px 10px;border:1px solid var(--color-border);border-radius:10px;background:var(--color-surface);color:var(--color-text);font:inherit;";
    select.innerHTML = AppRole.all().map(role => `<option value="${escapeHtml(role)}">${escapeHtml(role)}</option>`).join("");
    select.value = AppRole.get();
    select.addEventListener("change", () => { AppRole.set(select.value); syncSidebar(); });
    brand.appendChild(select);
  }

  function syncSidebar() {
    syncSidebarBrand();
    const path = window.location.pathname.replace(/\\/g, "/");
    
    // Find the relative root path based on the current depth
    const depth = (path.match(/\//g) || []).length;
    let rootPrefix = "./";
    if (path.includes("/pages/")) {
      const parts = path.split("/pages/");
      if (parts.length > 1) {
         const subdirs = parts[1].split("/").length - 1;
         rootPrefix = "../".repeat(subdirs + 1);
      }
    } else if (depth > 1) {
      rootPrefix = "../".repeat(depth - 1);
    }
    
    // Some static hostings serves / as /index.html
    const isRoot = path.endsWith("/") || path.endsWith("/index.html") && !path.includes("/pages/");

    const sidebarNav = document.querySelector(".sidebar-nav");
    if (!sidebarNav) return;
    sidebarNav.innerHTML = ""; // Clear existing sidebar

    const menu = window.SIDEBAR_MENUS && window.AppRole ? SIDEBAR_MENUS[AppRole.get()] : SIDEBAR_MENU;
    menu.forEach(section => {
      const sectionLabel = document.createElement("div");
      sectionLabel.className = "nav-section-label";
      sectionLabel.textContent = section.section;
      sidebarNav.appendChild(sectionLabel);

      section.items.forEach(item => {
        const navItem = document.createElement("a");
        navItem.className = "nav-item";
        
        // Remove leading slash and prepend root prefix
        const relativeHref = rootPrefix + item.href.substring(1);
        navItem.href = relativeHref;
        
        navItem.innerHTML = `
          <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${item.icon}</svg>
          ${item.label}
        `;
        
        // Highlight logic
        if (item.href === "/index.html" && isRoot) {
          navItem.classList.add("active");
        } else if (item.href !== "/index.html" && path.includes(item.href)) {
          navItem.classList.add("active");
        }
        
        sidebarNav.appendChild(navItem);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncSidebar);
  } else {
    syncSidebar();
  }

  return { formatDate, formatDateTime, debounce, toast, qs, escapeHtml, syncSidebar };
})();
