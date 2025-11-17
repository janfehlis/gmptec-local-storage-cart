# GMPTEC LocalStorage Cart System

A lightweight, WooCommerce-free cart system for WordPress using LocalStorage. Perfect for inquiry-based product workflows without the complexity of e-commerce.

## Features

- **LocalStorage-based Cart** - No database queries, fast and efficient
- **WordPress Menu Integration** - Auto-attaching cart counter with smart detection
- **Bricks Builder Compatible** - Works seamlessly with Bricks page builder
- **Dynamic Button States** - Add/Remove buttons update automatically
- **Cross-Tab Sync** - Cart updates across browser tabs in real-time
- **Cart Page Rendering** - Full cart display with product list
- **WSForms Integration Ready** - Planned integration for form submissions

## Tech Stack

- Vanilla JavaScript (no build system required)
- WordPress
- Bricks Builder
- ACSS Framework
- WSForms Pro (planned)
- WP CodeBox (for script management)

## Installation

### 1. Add JavaScript Files to WordPress

Upload both JavaScript files to your WordPress installation via **WP CodeBox** or your preferred method:

**File Load Order (WP CodeBox Priority):**
1. `gmptec-add-cart-script.js` - Priority: 10
2. `gmptec-cart-counter.js` - Priority: 20

### 2. Setup Product Buttons

Add "Add to Cart" buttons to your product pages with required data attributes:

```html
<button class="gmptec-add-to-cart"
        data-product-id="123"
        data-product-name="Product Name"
        data-product-thumbnail="<img src='...'>">
    Zur Anfrage hinzufügen
</button>
```

### 3. Create Cart Page

Create a WordPress page (e.g., `/anfrage/`) with:

**Required HTML Structure:**
```html
<div class="gmptec-cart-items">
    <!-- Products will be rendered here -->
</div>

<div class="gmptec-empty-cart">
    <p>Ihr Warenkorb ist leer.</p>
</div>
```

### 4. Add Menu Item

Create a menu link to your cart page (`/anfrage/`). The cart counter will automatically attach itself to any menu link containing cart-related keywords.

## Usage

### Adding Products to Cart

Products are automatically added when users click buttons with the `.gmptec-add-to-cart` class. The button automatically transforms to "Remove" state when product is in cart.

### Cart Data Structure

```javascript
// LocalStorage key: 'gmptec_cart'
[
  {
    id: "123",
    name: "Product Name",
    thumbnail: "https://example.com/image.jpg"
  }
]
```

### Console Debug Functions

For development and debugging:

```javascript
// Display cart contents
window.debugCart()

// Clear entire cart
window.clearCart()

// Refresh cart display
window.updateDisplay()

// Re-render cart page
window.renderCartPage()

// Update counter
window.updateCartCounter()

// Get cart count
window.getCartCount()

// Test product removal
window.testCartRemove('product-id')

// Manually attach counter to element
window.attachCounterToElement('.my-menu-link')
```

## Architecture

### GMPTECCart Class

Core cart functionality managing:
- Add/remove operations with duplicate prevention
- LocalStorage persistence
- Event delegation for dynamic buttons
- Cart page rendering
- Button state management

### GMPTECCartCounter Class

Menu counter functionality:
- Auto-detection of cart menu items
- Visual counter (red badge when items present, gray when empty)
- Cross-tab synchronization
- Syncs with GMPTECCart via method overrides

## Cart Counter Auto-Detection

The counter automatically attaches to menu links matching:

**URL Patterns:**
- `/anfrage/`
- `/cart/`
- `/warenkorb/`
- `/basket/`
- `/shopping-cart/`

**Text Patterns:**
- "anfrage"
- "cart"
- "warenkorb"
- "basket"
- "shopping cart"

## Customization

### Counter Styling

The counter includes default styling but can be customized via CSS:

```css
.gmptec-cart-count {
    /* Your custom styles */
}

.gmptec-cart-count.has-items {
    /* Styling when cart has items */
}

.gmptec-cart-count.empty {
    /* Styling when cart is empty */
}
```

### Cart Page Styling

Customize the cart item display:

```css
.gmptec-cart-list {
    /* List container */
}

.gmptec-cart-item {
    /* Individual cart item */
}

.cart-item-image,
.cart-item-content,
.cart-item-actions {
    /* Item components */
}
```

## Roadmap

- [ ] WSForms integration (`gmptec-cart-form-integration.js`)
- [ ] Form field auto-population with cart products
- [ ] Empty cart validation on form submit
- [ ] Auto-clear cart after successful form submission
- [ ] Configurable redirect after submission

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Requires LocalStorage support (all modern browsers).

## Contributing

This is a private project for GMPTEC. For questions or issues, please contact the development team.

## Documentation

- **[PRD.md](PRD.md)** - Full product requirements document (German)
- **[CLAUDE.md](CLAUDE.md)** - Development guide for Claude Code

## License

Proprietary - All rights reserved GMPTEC
