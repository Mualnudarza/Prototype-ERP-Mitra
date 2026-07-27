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

  function syncSidebar() {
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
    const activeRole = localStorage.getItem("erp_active_role") || "Admin Mitra";
    const brand = document.querySelector(".sidebar-brand");
    if (brand && !document.querySelector(".user-switcher")) {
      const switcher = document.createElement("div");
      switcher.className = "user-switcher";
      switcher.innerHTML = `<select id="role-switcher" aria-label="Pilih user"><option value="Admin Mitra">Admin Mitra</option><option value="Super User Dasaria">Super User Dasaria</option></select>`;
      brand.insertAdjacentElement("afterend", switcher);
      switcher.querySelector("select").value = activeRole;
      switcher.querySelector("select").addEventListener("change", function () {
        localStorage.setItem("erp_active_role", this.value);
        window.location.href = rootPrefix + "index.html";
      });
    }
    sidebarNav.innerHTML = ""; // Clear existing sidebar

    SIDEBAR_MENU.filter(section => !section.superUserOnly || activeRole === "Super User Dasaria").forEach(section => {
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
