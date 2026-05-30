#!/usr/bin/env node
/**
 * Unify navigation and footer across all cable-catalog HTML pages.
 *
 * Usage:
 *   cd d:/cc安装/projects/cable-catalog
 *   node scripts/unify-nav-footer.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Which pages are at root vs subdirectory
// ---------------------------------------------------------------------------
const ROOT_PAGE_NAMES = new Set([
  'index.html', 'about.html', 'certifications.html',
  'case-studies.html', 'pricing-guide.html', 'support.html',
  'glossary.html'
]);

// ---------------------------------------------------------------------------
// Unified CSS block — inserted just before </style>
// ---------------------------------------------------------------------------
const UNIFIED_CSS = `
    /* ===== UNIFIED NAV (generated) ===== */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 999;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 6%; height: 64px;
      background: rgba(255,255,255,0.94);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--gray-200);
      box-shadow: var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.04));
    }
    .logo {
      display: flex; align-items: center; gap: 8px;
      text-decoration: none; color: var(--navy);
      font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 1.2rem;
      letter-spacing: 1.5px;
    }
    .logo-img { height: 32px; }
    .nav-links { display: flex; gap: 32px; list-style: none; align-items: center; }
    .nav-links > li > a {
      color: var(--gray-600); text-decoration: none;
      font-size: 0.82rem; font-weight: 600; letter-spacing: 0.6px;
      text-transform: uppercase; transition: color 0.2s; padding: 4px 0; position: relative;
    }
    .nav-links > li > a::after {
      content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px;
      background: var(--navy); border-radius: 2px; transition: width 0.25s;
    }
    .nav-links > li > a:hover { color: var(--navy); }
    .nav-links > li > a:hover::after { width: 100%; }
    .nav-cta { background: var(--navy); color: #fff !important; padding: 10px 20px !important; border-radius: 6px; transition: all 0.25s !important; }
    .nav-cta:hover { background: var(--navy-light); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .nav-cta::after { display: none !important; }
    .nav-dropdown { position: relative; }
    .nav-dropdown > a::after { content: ' \\\\25BE'; }
    .nav-dropdown .dropdown-menu {
      display: none; position: absolute; top: calc(100% + 10px); left: 50%;
      transform: translateX(-50%); background: #fff; border: 1px solid var(--gray-200);
      border-radius: 10px; padding: 8px 0; min-width: 210px; list-style: none;
      z-index: 2000; box-shadow: 0 12px 40px rgba(0,0,0,0.08);
    }
    .nav-dropdown .dropdown-menu::before {
      content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
      border: 6px solid transparent; border-bottom-color: var(--gray-200); border-top: none;
    }
    .nav-dropdown:hover .dropdown-menu { display: block; }
    .nav-dropdown .dropdown-menu li a {
      display: block; padding: 10px 20px; color: var(--gray-600); font-size: 0.84rem;
      text-decoration: none; white-space: nowrap; transition: all 0.15s;
    }
    .nav-dropdown .dropdown-menu li a:hover { color: var(--navy); background: var(--gray-50); padding-left: 26px; }
    .nav-toggle { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; background: none; border: none; }
    .nav-toggle span { width: 24px; height: 2px; background: var(--navy); border-radius: 2px; transition: all 0.3s; display: block; }

    /* ===== UNIFIED FOOTER ===== */
    footer { background: var(--gray-900); padding: 60px 6% 32px; color: #fff; text-align: left; }
    .footer-top { display: grid; grid-template-columns: 1.8fr 1fr 1fr 1fr 1.3fr; gap: 48px; margin-bottom: 48px; }
    .footer-logo { font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 1.3rem; letter-spacing: 2px; margin-bottom: 14px; color: #fff; }
    .footer-tagline { color: var(--gray-400); font-size: 0.87rem; line-height: 1.7; max-width: 260px; margin-bottom: 16px; }
    .footer-wa-link { display: inline-flex; align-items: center; gap: 8px; background: var(--whatsapp); color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 0.82rem; transition: all 0.2s; }
    .footer-wa-link:hover { background: #20bd5a; }
    .footer-col-title { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 0.8rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--gray-400); margin-bottom: 18px; }
    .footer-links { display: flex; flex-direction: column; gap: 10px; list-style: none; padding: 0; }
    .footer-links a { color: var(--gray-500); text-decoration: none; font-size: 0.87rem; transition: color 0.2s; }
    .footer-links a:hover { color: var(--gold); }
    .footer-links li { color: var(--gray-500); font-size: 0.87rem; }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .footer-copy { color: var(--gray-500); font-size: 0.78rem; }

    /* ===== WHATSAPP FLOAT ===== */
    .wa-float {
      position: fixed; bottom: 32px; left: 32px; z-index: 999;
      width: 60px; height: 60px; border-radius: 50%;
      box-shadow: 0 8px 32px rgba(37,211,102,0.4);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex; align-items: center; justify-content: center;
      background: #25D366; text-decoration: none;
      animation: wa-pulse 2s infinite;
    }
    .wa-float:hover { transform: scale(1.1); box-shadow: 0 12px 40px rgba(37,211,102,0.6); }
    .wa-tooltip {
      position: absolute; left: 75px; top: 50%; transform: translateY(-50%);
      background: var(--gray-900); color: #fff; padding: 10px 18px;
      border-radius: 8px; font-size: 0.82rem; font-weight: 700; white-space: nowrap;
      opacity: 0; pointer-events: none; transition: 0.3s; box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    .wa-float:hover .wa-tooltip { opacity: 1; left: 70px; }
    @keyframes wa-pulse { 0%,100%{ box-shadow: 0 0 0 0 rgba(37,211,102,0.5); } 70%{ box-shadow: 0 0 0 15px rgba(37,211,102,0); } }

    /* ===== MOBILE STICKY CTA ===== */
    .mobile-sticky-cta { display: none; }
    @media(max-width:768px) {
      .mobile-sticky-cta {
        display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 998;
        background: #fff; border-top: 1px solid var(--gray-200);
        box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
      }
      .mobile-sticky-cta a {
        flex: 1; text-align: center; padding: 14px 8px;
        font-weight: 700; font-size: 0.82rem; text-decoration: none;
        display: flex; align-items: center; justify-content: center; gap: 6px;
      }
      .mobile-sticky-cta .mob-wa {
        background: var(--whatsapp); color: #fff;
      }
      .mobile-sticky-cta .mob-quote {
        background: var(--navy); color: #fff;
      }
      .wa-float { bottom: 20px; left: 12px; width: 54px; height: 54px; }
      .wa-tooltip { display: none; }
    }

    /* ===== RESPONSIVE (unified) ===== */
    @media(max-width:960px) {
      .footer-top { grid-template-columns: 1fr 1fr 1fr; }
    }
    @media(max-width:768px) {
      nav { height: 60px; }
      .nav-links { display: none; position: fixed; top: 60px; left: 0; right: 0; background: rgba(255,255,255,0.98); flex-direction: column; padding: 24px; gap: 16px; border-bottom: 1px solid var(--gray-200); backdrop-filter: blur(12px); }
      .nav-links.open { display: flex; }
      .nav-toggle { display: flex; }
      .nav-dropdown .dropdown-menu { display: block; position: static; transform: none; border: none; background: none; box-shadow: none; padding: 0 0 0 16px; border-left: 2px solid var(--gray-200); margin-top: 8px; }
      .footer-top { grid-template-columns: 1fr 1fr; gap: 32px; }
      .wa-float { bottom: 72px; }
    }
    @media(max-width:480px) {
      .footer-top { grid-template-columns: 1fr; }
    }
`;

// ---------------------------------------------------------------------------
// Nav HTML — root variant
// ---------------------------------------------------------------------------
const NAV_HTML_ROOT = `<!-- NAV -->
<nav>
  <a href="/" class="logo">
    <img src="assets/brand/amperon-logo.svg" alt="Amperon Cables" class="logo-img">
  </a>
  <ul class="nav-links" id="navLinks">
    <li><a href="#">Home</a></li>
    <li class="nav-dropdown">
      <a href="#products">Products</a>
      <ul class="dropdown-menu">
        <li><a href="products/lv-power-cables.html">LV Power Cables</a></li>
        <li><a href="products/mv-power-cables.html">MV Power Cables</a></li>
        <li><a href="products/swa-armored-power-cables.html">SWA Armored Cables</a></li>
        <li><a href="products/rubber-flexible-cables.html">Rubber Flexible Cables</a></li>
        <li><a href="products/overhead-abc-cables.html">Overhead ABC Cables</a></li>
        <li><a href="products/control-cables.html">Control Cables</a></li>
        <li><a href="#products">More Cable Types &darr;</a></li>
      </ul>
    </li>
    <li><a href="about.html">Factory</a></li>
    <li><a href="certifications.html">Quality</a></li>
    <li class="nav-dropdown">
      <a href="#resources">Resources</a>
      <ul class="dropdown-menu">
        <li><a href="about.html">About Us</a></li>
        <li><a href="case-studies.html">Case Studies</a></li>
        <li><a href="compare/">Comparison Guides</a></li>
        <li><a href="glossary.html">Glossary</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>
    </li>
    <li><a href="#quote" class="nav-cta">Get Quote</a></li>
  </ul>
  <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
    <span></span><span></span><span></span>
  </button>
</nav>`;

// ---------------------------------------------------------------------------
// Nav HTML — subdirectory variant
// ---------------------------------------------------------------------------
const NAV_HTML_SUB = `<!-- NAV -->
<nav>
  <a href="../" class="logo">
    <img src="../assets/brand/amperon-logo.svg" alt="Amperon Cables" class="logo-img">
  </a>
  <ul class="nav-links" id="navLinks">
    <li><a href="../index.html">Home</a></li>
    <li class="nav-dropdown">
      <a href="../index.html#products">Products</a>
      <ul class="dropdown-menu">
        <li><a href="../products/lv-power-cables.html">LV Power Cables</a></li>
        <li><a href="../products/mv-power-cables.html">MV Power Cables</a></li>
        <li><a href="../products/swa-armored-power-cables.html">SWA Armored Cables</a></li>
        <li><a href="../products/rubber-flexible-cables.html">Rubber Flexible Cables</a></li>
        <li><a href="../products/overhead-abc-cables.html">Overhead ABC Cables</a></li>
        <li><a href="../products/control-cables.html">Control Cables</a></li>
        <li><a href="../index.html#products">More Cable Types &darr;</a></li>
      </ul>
    </li>
    <li><a href="../about.html">Factory</a></li>
    <li><a href="../certifications.html">Quality</a></li>
    <li class="nav-dropdown">
      <a href="../index.html#resources">Resources</a>
      <ul class="dropdown-menu">
        <li><a href="../about.html">About Us</a></li>
        <li><a href="../case-studies.html">Case Studies</a></li>
        <li><a href="../compare/">Comparison Guides</a></li>
        <li><a href="../glossary.html">Glossary</a></li>
        <li><a href="../index.html#faq">FAQ</a></li>
      </ul>
    </li>
    <li><a href="../index.html#quote" class="nav-cta">Get Quote</a></li>
  </ul>
  <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
    <span></span><span></span><span></span>
  </button>
</nav>`;

// ---------------------------------------------------------------------------
// Footer HTML — root variant
// ---------------------------------------------------------------------------
const FOOTER_HTML_ROOT = `<!-- FOOTER -->
<footer>
  <div class="footer-top">
    <div>
      <div class="footer-logo">AMPERON CABLES</div>
      <p class="footer-tagline">Factory-direct B2B power cable manufacturer. Quality cables, competitive pricing, worldwide delivery.</p>
      <a href="https://api.whatsapp.com/send/?phone=8613201571341&text=Hello%20Amperon%2C%20I'd%20like%20to%20inquire%20about%20your%20cables.&type=phone_number&app_absent=0" class="footer-wa-link" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
        WhatsApp Us
      </a>
    </div>
    <div>
      <div class="footer-col-title">Products</div>
      <ul class="footer-links">
        <li><a href="products/lv-power-cables.html">LV Power Cables</a></li>
        <li><a href="products/mv-power-cables.html">MV Power Cables</a></li>
        <li><a href="products/swa-armored-power-cables.html">Armored SWA Cables</a></li>
        <li><a href="products/rubber-flexible-cables.html">Rubber Flexible Cables</a></li>
        <li><a href="products/overhead-abc-cables.html">Overhead ABC Cables</a></li>
        <li><a href="products/control-cables.html">Control Cables</a></li>
        <li><a href="products/solar-pv-dc-cables.html">Solar PV DC Cables</a></li>
        <li><a href="products/fire-resistant-cables.html">Fire-Resistant Cables</a></li>
        <li><a href="products/lszh-cables.html">LSZH Cables</a></li>
        <li><a href="products/trailing-mining-cables.html">Trailing/Mining Cables</a></li>
      </ul>
    </div>
    <div>
      <div class="footer-col-title">Quick Links</div>
      <ul class="footer-links">
        <li><a href="about.html">About Us</a></li>
        <li><a href="certifications.html">Certifications</a></li>
        <li><a href="case-studies.html">Case Studies</a></li>
        <li><a href="pricing-guide.html">Pricing &amp; MOQ</a></li>
        <li><a href="support.html">Support &amp; FAQ</a></li>
        <li><a href="#quote">Get Quote</a></li>
      </ul>
    </div>
    <div>
      <div class="footer-col-title">Applications</div>
      <ul class="footer-links">
        <li><a href="applications/mining-cables.html">Mining Cables</a></li>
        <li><a href="applications/construction-cables.html">Construction Cables</a></li>
        <li><a href="applications/power-distribution-cables.html">Power Distribution</a></li>
        <li><a href="applications/oil-gas-cables.html">Oil &amp; Gas Cables</a></li>
        <li><a href="applications/industrial-manufacturing-cables.html">Industrial Manufacturing</a></li>
        <li><a href="applications/renewable-energy-cables.html">Renewable Energy</a></li>
      </ul>
    </div>
    <div>
      <div class="footer-col-title">Contact</div>
      <ul class="footer-links">
        <li><a href="mailto:sales@amperoncables.com">sales@amperoncables.com</a></li>
        <li><a href="tel:+8613201571341">+86 132 0157 1341</a></li>
        <li>Export Department</li>
        <li>China</li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-copy">&copy; 2026 Amperon Cables. All rights reserved.</div>
  </div>
</footer>`;

// ---------------------------------------------------------------------------
// Footer HTML — subdirectory variant
// ---------------------------------------------------------------------------
const FOOTER_HTML_SUB = `<!-- FOOTER -->
<footer>
  <div class="footer-top">
    <div>
      <div class="footer-logo">AMPERON CABLES</div>
      <p class="footer-tagline">Factory-direct B2B power cable manufacturer. Quality cables, competitive pricing, worldwide delivery.</p>
      <a href="https://api.whatsapp.com/send/?phone=8613201571341&text=Hello%20Amperon%2C%20I'd%20like%20to%20inquire%20about%20your%20cables.&type=phone_number&app_absent=0" class="footer-wa-link" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
        WhatsApp Us
      </a>
    </div>
    <div>
      <div class="footer-col-title">Products</div>
      <ul class="footer-links">
        <li><a href="../products/lv-power-cables.html">LV Power Cables</a></li>
        <li><a href="../products/mv-power-cables.html">MV Power Cables</a></li>
        <li><a href="../products/swa-armored-power-cables.html">Armored SWA Cables</a></li>
        <li><a href="../products/rubber-flexible-cables.html">Rubber Flexible Cables</a></li>
        <li><a href="../products/overhead-abc-cables.html">Overhead ABC Cables</a></li>
        <li><a href="../products/control-cables.html">Control Cables</a></li>
        <li><a href="../products/solar-pv-dc-cables.html">Solar PV DC Cables</a></li>
        <li><a href="../products/fire-resistant-cables.html">Fire-Resistant Cables</a></li>
        <li><a href="../products/lszh-cables.html">LSZH Cables</a></li>
        <li><a href="../products/trailing-mining-cables.html">Trailing/Mining Cables</a></li>
      </ul>
    </div>
    <div>
      <div class="footer-col-title">Quick Links</div>
      <ul class="footer-links">
        <li><a href="../about.html">About Us</a></li>
        <li><a href="../certifications.html">Certifications</a></li>
        <li><a href="../case-studies.html">Case Studies</a></li>
        <li><a href="../pricing-guide.html">Pricing &amp; MOQ</a></li>
        <li><a href="../support.html">Support &amp; FAQ</a></li>
        <li><a href="../index.html#quote">Get Quote</a></li>
      </ul>
    </div>
    <div>
      <div class="footer-col-title">Applications</div>
      <ul class="footer-links">
        <li><a href="../applications/mining-cables.html">Mining Cables</a></li>
        <li><a href="../applications/construction-cables.html">Construction Cables</a></li>
        <li><a href="../applications/power-distribution-cables.html">Power Distribution</a></li>
        <li><a href="../applications/oil-gas-cables.html">Oil &amp; Gas Cables</a></li>
        <li><a href="../applications/industrial-manufacturing-cables.html">Industrial Manufacturing</a></li>
        <li><a href="../applications/renewable-energy-cables.html">Renewable Energy</a></li>
      </ul>
    </div>
    <div>
      <div class="footer-col-title">Contact</div>
      <ul class="footer-links">
        <li><a href="mailto:sales@amperoncables.com">sales@amperoncables.com</a></li>
        <li><a href="tel:+8613201571341">+86 132 0157 1341</a></li>
        <li>Export Department</li>
        <li>China</li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-copy">&copy; 2026 Amperon Cables. All rights reserved.</div>
  </div>
</footer>`;

// ---------------------------------------------------------------------------
// Mobile sticky CTA + WhatsApp float (same for all pages)
// ---------------------------------------------------------------------------
const MOBILE_CTA_HTML = `
<!-- MOBILE STICKY CTA -->
<div class="mobile-sticky-cta">
  <a href="https://api.whatsapp.com/send/?phone=8613201571341&text=Hello%20Amperon%2C%20I'm%20interested%20in%20your%20power%20cables.&type=phone_number&app_absent=0" class="mob-wa" target="_blank" rel="noopener">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
    WhatsApp
  </a>
  <a href="#quote" class="mob-quote">Get Quote</a>
</div>

<a href="https://api.whatsapp.com/send/?phone=8613201571341&text=Hello%20Amperon%2C%20I'm%20interested%20in%20your%20power%20cables.&type=phone_number&app_absent=0" class="wa-float" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
  <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
  <span class="wa-tooltip">Chat on WhatsApp</span>
</a>`;

// ---------------------------------------------------------------------------
// Nav toggle JS
// ---------------------------------------------------------------------------
const NAV_TOGGLE_JS = `<script>
  (function() {
    var toggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    if (toggle && navLinks) {
      toggle.addEventListener('click', function() {
        navLinks.classList.toggle('open');
      });
      navLinks.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          navLinks.classList.remove('open');
        });
      });
    }
  })();
<\/script>`;

// ---------------------------------------------------------------------------
// Collect all HTML files
// ---------------------------------------------------------------------------
function collectHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      results.push(...collectHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Process a single file
// ---------------------------------------------------------------------------
function processFile(filepath) {
  const relPath = path.relative(ROOT, filepath);
  const filename = path.basename(filepath);
  const depth = relPath.split(path.sep).length - 1; // 0 for root, 1 for sub
  const isRoot = (depth === 0);

  let content = fs.readFileSync(filepath, 'utf-8');
  const original = content;
  let changed = false;

  // --- 1. Replace nav ---
  const navHtml = isRoot ? NAV_HTML_ROOT : NAV_HTML_SUB;
  // Try comment+nav pattern first
  let m = content.match(/<!--\s*NAV\s*-->\s*<nav>[\s\S]*?<\/nav>/);
  if (m) {
    content = content.slice(0, m.index) + navHtml + content.slice(m.index + m[0].length);
    changed = true;
  } else {
    // Try bare <nav>...</nav>
    m = content.match(/<nav[^>]*>[\s\S]*?<\/nav>/);
    if (m) {
      content = content.slice(0, m.index) + navHtml + content.slice(m.index + m[0].length);
      changed = true;
    }
  }

  // --- 2. Replace footer ---
  const footerHtml = isRoot ? FOOTER_HTML_ROOT : FOOTER_HTML_SUB;
  m = content.match(/<!--\s*FOOTER\s*-->\s*<footer>[\s\S]*?<\/footer>/);
  if (m) {
    content = content.slice(0, m.index) + footerHtml + content.slice(m.index + m[0].length);
    changed = true;
  } else {
    m = content.match(/<footer[^>]*>[\s\S]*?<\/footer>/);
    if (m) {
      content = content.slice(0, m.index) + footerHtml + content.slice(m.index + m[0].length);
      changed = true;
    }
  }

  // --- 3. Remove old WhatsApp float (keep only the new one we'll add) ---
  // Look for old position styles
  m = content.match(/<a[^>]*class="wa-float"[^>]*>[\s\S]*?<\/a>/g);
  if (m) {
    for (const match of m) {
      // If it doesn't have wa-tooltip, it's the old one — remove it
      if (!match.includes('wa-tooltip')) {
        content = content.replace(match, '');
        changed = true;
      }
    }
  }

  // --- 4. Remove old mobile sticky CTA if present (without wa-tooltip pattern) ---
  m = content.match(/<!--\s*MOBILE STICKY CTA\s*-->[\s\S]*?<\/div>\s*<\/div>/);
  if (m && !m[0].includes('wa-tooltip')) {
    // Only remove old-style mobile CTAs
    content = content.replace(m[0], '');
    changed = true;
  }

  // --- 5. Insert unified CSS before </style> ---
  const styleIdx = content.lastIndexOf('</style>');
  if (styleIdx !== -1 && !content.includes('UNIFIED NAV')) {
    content = content.slice(0, styleIdx) + UNIFIED_CSS + '\n  ' + content.slice(styleIdx);
    changed = true;
  }

  // --- 6. Remove old nav JS patterns ---
  // Old hamburger JS
  const oldHamburgerRe = /<script>\s*\/\/\s*Mobile nav toggle[\s\S]*?<\/script>/g;
  if (oldHamburgerRe.test(content)) {
    content = content.replace(oldHamburgerRe, '');
    changed = true;
  }
  // Old generic nav toggle (but not our new one)
  const oldNavToggleRe = /<script>\s*const\s+hamburger[\s\S]*?<\/script>/g;
  if (oldNavToggleRe.test(content)) {
    content = content.replace(oldNavToggleRe, '');
    changed = true;
  }
  // Old document.querySelector('.hamburger') patterns
  const oldHamburger2Re = /<script>[\s\S]*?querySelector\(['"]\.hamburger['"][\s\S]*?<\/script>/g;
  if (oldHamburger2Re.test(content)) {
    content = content.replace(oldHamburger2Re, '');
    changed = true;
  }

  // --- 7. Add mobile CTA + WhatsApp float + nav JS before </body> ---
  const bodyIdx = content.lastIndexOf('</body>');
  if (bodyIdx !== -1) {
    // Check if mobile-sticky-cta already exists near the end
    const tail = content.slice(-4000);
    if (!tail.includes('mobile-sticky-cta')) {
      content = content.slice(0, bodyIdx) + '\n' + MOBILE_CTA_HTML + '\n\n' + content.slice(bodyIdx);
      changed = true;
    }
    // Add nav toggle JS if not present
    if (!content.includes('navToggle')) {
      const bodyIdx2 = content.lastIndexOf('</body>');
      content = content.slice(0, bodyIdx2) + '\n' + NAV_TOGGLE_JS + '\n' + content.slice(bodyIdx2);
      changed = true;
    }
  }

  // --- 8. Fix any "AMPERON" text appended after logo img ---
  content = content.replace(
    /(<img src="[^"]*amperon-logo\.svg"[^>]*>)\s*AMPERON\s*<\/a>/g,
    '$1</a>'
  );

  // --- 9. Remove "AMPER" or "AMPER ON" text in nav text nodes ---
  content = content.replace(
    /(<img src="[^"]*amperon-logo\.svg"[^>]*>)\s*AMPER\s*(ON\s*)?(CABLES\s*)?<\/a>/gi,
    '$1</a>'
  );

  if (changed && content !== original) {
    fs.writeFileSync(filepath, content, 'utf-8');
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const htmlFiles = collectHtmlFiles(ROOT);
  let processed = 0;
  let skipped = 0;
  const errors = [];

  console.log(`Found ${htmlFiles.length} HTML files\n`);

  for (const fp of htmlFiles) {
    try {
      if (processFile(fp)) {
        processed++;
        console.log(`  \x1b[32m✓\x1b[0m ${path.relative(ROOT, fp)}`);
      } else {
        skipped++;
        console.log(`  - ${path.relative(ROOT, fp)} (unchanged)`);
      }
    } catch (e) {
      errors.push([path.relative(ROOT, fp), e.message]);
      console.log(`  \x1b[31m✗\x1b[0m ${path.relative(ROOT, fp)} ERROR: ${e.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processed: ${processed} files modified`);
  console.log(`Skipped:   ${skipped} files unchanged`);
  if (errors.length > 0) {
    console.log(`Errors:    ${errors.length}`);
    for (const [fp, err] of errors) {
      console.log(`  - ${fp}: ${err}`);
    }
  }
  console.log(`${'='.repeat(60)}`);

  return errors.length === 0;
}

main();
