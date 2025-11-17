# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GMPTEC LocalStorage Cart System - A WooCommerce replacement for WordPress that uses LocalStorage for product inquiry functionality. Built for Bricks Builder with ACSS Framework and WSForms Pro integration.

## Architecture

### Core Components

**GMPTECCart Class** (`gmptec-add-cart-script.js`)
- Main cart system managing add/remove operations
- Handles LocalStorage persistence with key `gmptec_cart`
- Cart page rendering with product list display
- Product data structure: `{ id, name, thumbnail }`
- Event delegation for dynamic button state management
- Auto-initializes and exposes `window.gmptecCart`

**GMPTECCartCounter Class** (`gmptec-cart-counter.js`)
- Menu cart counter with auto-attachment to WordPress menu items
- Syncs with GMPTECCart via method overrides
- Cross-tab synchronization via storage events
- Auto-detects cart links by URL patterns (/anfrage/, /cart/, etc.)
- Counter styling: gray (#cccccc) when empty, red (#ff0000) when items present

**Load Order (WP CodeBox Priority)**
1. `gmptec-add-cart-script.js` (Priority: 10)
2. `gmptec-cart-counter.js` (Priority: 20)
3. `gmptec-cart-form-integration.js` (Priority: 30) - not yet implemented

### Key Design Patterns

**Single Initialization Pattern**: Both classes prevent double initialization via `window` checks and initialization flags
- `window.gmptecCart` for cart instance
- `window.gmptecCartCounter` for counter instance

**Event Delegation**: Cart uses `document.addEventListener('click')` with `.closest()` for dynamic button handling

**Button State Management**: Buttons toggle between classes:
- `.gmptec-add-to-cart` → "Zur Anfrage hinzufügen"
- `.gmptec-remove-from-cart` → "Aus Anfrage entfernen"

**Image URL Extraction**: `extractImageUrl()` handles HTML-encoded Bricks Builder image data attributes (data-src, src)

## Development Guidelines

### Cart Page Integration

The cart page requires a container with class `.gmptec-cart-items` to render products. Empty state uses `.gmptec-empty-cart`.

Cart page auto-initialization runs via IIFE with retry logic to wait for `window.gmptecCart.isInitialized`.

### Adding to Cart Buttons

Buttons must include data attributes:
```html
<button class="gmptec-add-to-cart"
        data-product-id="123"
        data-product-name="Product Name"
        data-product-thumbnail="<encoded-html-img>">
```

### Counter Integration

Counter automatically attaches to menu links containing cart-related URLs or text. Manual attachment via `window.attachCounterToElement(selector)`.

### WSForms Integration (Planned)

Next implementation: `gmptec-cart-form-integration.js`
- Page scope: `/anfrage/` (conditional: `is_page('anfrage')`)
- Dependencies: Waits for `window.gmptecCart`
- Features: Form field population, empty cart validation, cart clearing on submit

### LocalStorage Structure

```javascript
localStorage.getItem('gmptec_cart')
// Returns: [{ id: "123", name: "Product", thumbnail: "url" }, ...]
```

## Debugging

Console debug functions available:
- `window.debugCart()` - Display cart contents as table
- `window.clearCart()` - Empty cart
- `window.updateDisplay()` - Refresh cart display
- `window.renderCartPage()` - Re-render cart page
- `window.updateCartCounter()` - Update counter display
- `window.getCartCount()` - Get current cart count
- `window.testCartRemove(productId)` - Test product removal

## Tech Stack

- WordPress (no build system)
- Bricks Builder (page builder)
- ACSS Framework (CSS framework)
- WSForms Pro (form handling)
- WP CodeBox (JavaScript file management with priorities)

## Important Notes

- No package.json or build system - raw JavaScript files
- All code must be vanilla JS (no transpilation)
- Bricks Builder may HTML-encode image tags in data attributes
- Cart page uses Bricks Builder container elements
- Counter must use `!important` in CSS to override theme styles
