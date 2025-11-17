/**
 * GMPTEC LocalStorage Cart System
 * Ersetzt WooCommerce für reine Anfrage-Funktionalität
 */

class GMPTECCart {
    constructor() {
        this.storageKey = 'gmptec_cart';
        this.isInitialized = false;
        this.cartPageInitialized = false;
        this.init();
    }

    extractImageUrl(htmlString) {
        if (!htmlString) return '';
        
        try {
            // HTML-dekodieren
            const decoded = htmlString.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
            
            // data-src extrahieren (für Lazy Loading)
            const dataSrcMatch = decoded.match(/data-src="([^"]+)"/);
            if (dataSrcMatch) {
                return dataSrcMatch[1];
            }
            
            // Fallback: src extrahieren
            const srcMatch = decoded.match(/src="([^"]+)"/);
            if (srcMatch) {
                return srcMatch[1];
            }
            
            return '';
        } catch (error) {
            console.error('Fehler beim Extrahieren der Bild-URL:', error);
            return '';
        }
    }

    init() {
        if (this.isInitialized) return;
        
        // Cart beim Laden der Seite initialisieren
        this.bindEvents();
        // Kleine Verzögerung für DOM-Readiness
        setTimeout(() => {
            this.updateCartDisplay();
            this.isInitialized = true;
        }, 100);
    }

    bindEvents() {
        // Event Listeners für "Zur Anfrage hinzufügen" Buttons
        document.addEventListener('click', (e) => {
            // Verbesserte Event-Delegation für dynamische Buttons
            const target = e.target;
            
            // Prüfe ob der geklickte Element oder ein Kind-Element die Klasse hat
            const addButton = target.closest('.gmptec-add-to-cart');
            const removeButton = target.closest('.gmptec-remove-from-cart');
            
            if (addButton) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add button clicked:', addButton.dataset.productId);
                this.handleAddToCart(addButton);
                return;
            }
            
            if (removeButton) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Remove button clicked:', removeButton.dataset.productId);
                this.handleRemoveFromCart(removeButton);
                return;
            }
        });
    }

    handleAddToCart(button) {
        const productData = {
            id: button.dataset.productId,
            name: button.dataset.productName,
            thumbnail: this.extractImageUrl(button.dataset.productThumbnail) || ''
        };

        // Validierung
        if (!productData.id || !productData.name) {
            console.error('Produkt-Daten unvollständig', productData);
            return;
        }

        if (this.addProduct(productData)) {
            // Success Feedback
            console.log('SUCCESS: Zur Anfrage hinzugefügt');
            
            // Cart Display aktualisieren (inkl. Button-States)
            this.updateCartDisplay();
        }
    }

    handleRemoveFromCart(button) {
        const productId = button.dataset.productId;
        
        if (this.removeProduct(productId)) {
            // Success Feedback
            console.log('INFO: Aus Anfrage entfernt');
            
            // Cart Display aktualisieren (inkl. Button-States)
            this.updateCartDisplay();
        }
    }

    addProduct(productData) {
        try {
            let cart = this.getCart();
            
            console.log('=== ADD PRODUCT DEBUG ===');
            console.log('Neues Produkt:', productData);
            console.log('Aktueller Cart vor Hinzufügen:', cart);
            
            // Prüfen ob Produkt bereits im Cart
            const existingProduct = cart.find(item => item.id === productData.id);
            if (existingProduct) {
                console.warn('Produkt bereits in der Anfrage', productData);
                console.log('Existierendes Produkt:', existingProduct);
                return false;
            }

            // Produkt hinzufügen
            cart.push(productData);
            console.log('Cart nach Hinzufügen:', cart);
            this.saveCart(cart);
            
            console.log('Produkt hinzugefügt:', productData.name);
            console.log('Aktueller Cart:', cart);
            console.log('=== ADD PRODUCT COMPLETE ===');
            return true;
        } catch (error) {
            console.error('Fehler beim Hinzufügen:', error);
            return false;
        }
    }

    removeProduct(productId) {
        try {
            let cart = this.getCart();
            const initialLength = cart.length;
            
            console.log('=== REMOVE PRODUCT CALLED ===', productId);
            console.log('Cart vor Entfernung:', cart);
            
            // Produkt entfernen
            cart = cart.filter(item => item.id !== productId);
            
            if (cart.length < initialLength) {
                this.saveCart(cart);
                console.log('Produkt entfernt:', productId);
                console.log('Aktueller Cart:', cart);
                console.log('=== REMOVE PRODUCT COMPLETE ===');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Fehler beim Entfernen:', error);
            return false;
        }
    }

    getCart() {
        try {
            const cartData = localStorage.getItem(this.storageKey);
            const cart = cartData ? JSON.parse(cartData) : [];
            console.log('Cart aus LocalStorage geladen:', cart);
            return cart;
        } catch (error) {
            console.error('Fehler beim Laden des Carts:', error);
            return [];
        }
    }

    saveCart(cart) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(cart));
            console.log('Cart in LocalStorage gespeichert:', cart);
        } catch (error) {
            console.error('Fehler beim Speichern des Carts:', error);
        }
    }

    updateCartDisplay() {
        const cart = this.getCart();
        const cartCount = cart.length;

        // Cart Counter Update
        this.updateCartCounters();
        
        // Button States Update - auch nach Seitenwechsel
        this.updateButtonStates(cart);

        // NEU: Cart-Page Update falls wir auf der Cart-Seite sind
        if (document.querySelector('.gmptec-cart-items')) {
            this.renderCartPage();
        }

        // Console Log für Development
        console.log(`Cart Status: ${cartCount} Produkt(e)`, cart);
    }

    updateCartCounters() {
        const cart = this.getCart();
        const cartCount = cart.length;

        // Cart Counter Update
        const counterElements = document.querySelectorAll('.gmptec-cart-count');
        counterElements.forEach(element => {
            element.textContent = cartCount;
            element.style.display = cartCount > 0 ? 'inline' : 'none';
        });
    }

    updateButtonStates(cart) {
        const cartProductIds = cart.map(item => item.id);
        
        // Nur Produktseiten-Buttons aktualisieren, nicht Cart-Seite Buttons
        const productPageButtons = document.querySelectorAll('.gmptec-add-to-cart, .gmptec-remove-from-cart');
        
        productPageButtons.forEach(button => {
            const productId = button.dataset.productId;
            if (!productId) return; // Skip wenn keine Product-ID
            
            // Skip Cart-Seite Buttons (diese haben spezielle Klassen)
            if (button.classList.contains('cart-remove-btn')) {
                return;
            }
            
            const isInCart = cartProductIds.includes(productId);
            
            if (isInCart) {
                button.textContent = 'Aus Anfrage entfernen';
                button.classList.remove('gmptec-add-to-cart');
                button.classList.add('gmptec-remove-from-cart');
            } else {
                button.textContent = 'Zur Anfrage hinzufügen';
                button.classList.remove('gmptec-remove-from-cart');
                button.classList.add('gmptec-add-to-cart');
            }
        });
        
        console.log(`Button states updated for ${productPageButtons.length} product page buttons, ${cartProductIds.length} products in cart`);
    }

    // ===== CART PAGE FUNKTIONALITÄT =====
    
    renderCartPage() {
        const cart = this.getCart();
        const cartItemsContainer = document.querySelector('.gmptec-cart-items');
        const emptyCartContainer = document.querySelector('.gmptec-empty-cart');
        
        if (!cartItemsContainer) {
            console.error('Cart items container (.gmptec-cart-items) nicht gefunden');
            return;
        }

        console.log('=== RENDER CART PAGE ===');
        console.log('Cart Inhalt:', cart);
        console.log('Anzahl Produkte:', cart.length);

        if (cart.length === 0) {
            // Empty State anzeigen
            this.showEmptyState(cartItemsContainer, emptyCartContainer);
        } else {
            // Produkte anzeigen
            this.showCartProducts(cart, cartItemsContainer, emptyCartContainer);
        }
    }

    showEmptyState(cartContainer, emptyContainer) {
        // Cart Items verstecken
        cartContainer.innerHTML = '';
        cartContainer.style.display = 'none';
        
        // Empty State anzeigen
        if (emptyContainer) {
            emptyContainer.style.display = 'block';
        }
        
        console.log('Empty State angezeigt');
    }

    showCartProducts(cart, cartContainer, emptyContainer) {
        // Empty State verstecken
        if (emptyContainer) {
            emptyContainer.style.display = 'none';
        }
        
        // Cart Container anzeigen
        cartContainer.style.display = 'block';
        
        // HTML als ul/li Liste generieren
        const cartHTML = `
            <ul class="gmptec-cart-list">
                ${cart.map(product => this.generateProductHTML(product)).join('')}
            </ul>
        `;
        cartContainer.innerHTML = cartHTML;
        
        console.log(`${cart.length} Produkte auf Cart-Seite gerendert`);
    }

    generateProductHTML(product) {
        // Fallback für fehlendes Bild
        const thumbnailSrc = product.thumbnail || '/wp-content/themes/default/images/placeholder.jpg';
        
        return `
            <li class="gmptec-cart-item" data-product-id="${product.id}">
                <div class="cart-item-image">
                    <img src="${thumbnailSrc}" alt="${product.name}" loading="lazy">
                </div>
                <div class="cart-item-content">
                    <h3 class="cart-item-title">${product.name}</h3>
                </div>
                <div class="cart-item-actions">
                    <button class="gmptec-remove-from-cart cart-remove-btn" 
                            data-product-id="${product.id}"
                            data-product-name="${product.name}"
                            aria-label="Produkt ${product.name} entfernen">
                        <span class="remove-icon">×</span>
                        <span class="remove-text">Entfernen</span>
                    </button>
                </div>
            </li>
        `;
    }

    initCartPage() {
        // Verhindere doppelte Initialisierung
        if (this.cartPageInitialized) {
            console.log('Cart-Page bereits initialisiert, überspringe...');
            return;
        }
        
        this.cartPageInitialized = true;
        
        // Initial render
        this.renderCartPage();
        
        console.log('Cart-Page initialisiert');
    }

    showFeedback(button, message, type = 'info') {
        // Einfaches Feedback - kann später erweitert werden
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Optional: Kurzes visuelles Feedback am Button
        if (button) {
            const originalText = button.textContent;
            button.textContent = message;
            button.style.opacity = '0.7';
            
            setTimeout(() => {
                button.style.opacity = '1';
                // Text wird durch updateButtonStates() korrekt gesetzt
            }, 1000);
        }
    }

    // Public Methods für externe Nutzung
    getCartCount() {
        return this.getCart().length;
    }

    getCartProducts() {
        return this.getCart();
    }

    clearCart() {
        this.saveCart([]);
        this.updateCartDisplay();
        console.log('Cart geleert');
    }

    // Debug Method
    debugCart() {
        const cart = this.getCart();
        console.table(cart);
        return cart;
    }
}

// Cart System initialisieren - nur einmal!
if (!window.gmptecCart) {
    // Sofort initialisieren wenn DOM bereit ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.gmptecCart) {
                window.gmptecCart = new GMPTECCart();
                
                // Global für Console-Debugging verfügbar machen
                window.debugCart = () => window.gmptecCart.debugCart();
                window.clearCart = () => window.gmptecCart.clearCart();
                window.updateDisplay = () => window.gmptecCart.updateCartDisplay();
                window.renderCartPage = () => window.gmptecCart.renderCartPage();
                window.testCartRemove = (productId) => {
                    if (window.gmptecCart) {
                        console.log('Test: Entferne Produkt', productId);
                        window.gmptecCart.removeProduct(productId);
                        window.gmptecCart.updateCartDisplay();
                    }
                };
            }
        });
    } else {
        // DOM bereits geladen
        window.gmptecCart = new GMPTECCart();
        
        // Global für Console-Debugging verfügbar machen
        window.debugCart = () => window.gmptecCart.debugCart();
        window.clearCart = () => window.gmptecCart.clearCart();
        window.updateDisplay = () => window.gmptecCart.updateCartDisplay();
        window.renderCartPage = () => window.gmptecCart.renderCartPage();
        window.testCartRemove = (productId) => {
            if (window.gmptecCart) {
                console.log('Test: Entferne Produkt', productId);
                window.gmptecCart.removeProduct(productId);
                window.gmptecCart.updateCartDisplay();
            }
        };
    }
}

// Auto-Initialize für Cart-Page - BRICKS KOMPATIBEL
(function initCartPageWhenReady() {
    // Prüfen ob wir auf der Cart-Seite sind
    if (document.querySelector('.gmptec-cart-items')) {
        console.log('Cart-Page DOM gefunden, warte auf GMPTECCart...');
        
        // Warten bis GMPTECCart initialisiert ist
        const initCartPage = () => {
            if (window.gmptecCart && window.gmptecCart.isInitialized) {
                // Nur einmalig initialisieren
                if (!window.gmptecCart.cartPageInitialized) {
                    window.gmptecCart.initCartPage();
                    console.log('Cart-Page erfolgreich initialisiert (Bricks)');
                }
            } else {
                // Retry nach 100ms
                setTimeout(initCartPage, 100);
            }
        };
        
        initCartPage();
    } else if (document.readyState !== 'complete') {
        // DOM noch nicht fertig, nochmal versuchen
        setTimeout(initCartPageWhenReady, 200);
    }
})();