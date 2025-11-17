/**
 * GMPTEC Cart Counter für WordPress Menü
 * Zeigt die Anzahl der Produkte im LocalStorage Cart an
 */

class GMPTECCartCounter {
    constructor() {
        this.storageKey = 'gmptec_cart';
        this.cartPageUrl = '/anfrage/'; // URL der Cart-Seite
        this.counterSelectors = [
            '.gmptec-cart-count',           // Standard Selector
            '.menu-item a .cart-count',     // Menü-Link mit Counter
            '.header-cart-count',           // Header Counter
            '[data-cart-counter]'           // Data-Attribute Selector
        ];
        this.init();
    }

    init() {
        // Warten bis GMPTECCart verfügbar ist
        this.waitForCart();
        
        // Event Listener für LocalStorage Änderungen
        this.bindStorageEvents();
        
        // Automatische Anbindung an WordPress-Menü
        this.attachToWordPressMenu();
        
        // Initial Update
        this.updateCounter();
    }

    waitForCart() {
        const checkCart = () => {
            if (window.gmptecCart) {
                console.log('GMPTECCart gefunden, Counter initialisiert');
                // Counter bei Cart-Updates aktualisieren
                this.bindCartEvents();
            } else {
                setTimeout(checkCart, 100);
            }
        };
        checkCart();
    }

    bindCartEvents() {
        // Override der updateCartDisplay Methode um Counter zu aktualisieren
        const originalUpdateDisplay = window.gmptecCart.updateCartDisplay;
        window.gmptecCart.updateCartDisplay = function() {
            originalUpdateDisplay.call(this);
            // Counter nach Cart-Update aktualisieren
            if (window.gmptecCartCounter) {
                console.log('Cart updated, updating counter...');
                window.gmptecCartCounter.updateCounter();
            }
        };

        // Zusätzlich: Counter bei jeder Cart-Änderung aktualisieren
        const originalAddProduct = window.gmptecCart.addProduct;
        window.gmptecCart.addProduct = function(productData) {
            const result = originalAddProduct.call(this, productData);
            if (result && window.gmptecCartCounter) {
                console.log('Product added, updating counter...');
                window.gmptecCartCounter.updateCounter();
            }
            return result;
        };

        const originalRemoveProduct = window.gmptecCart.removeProduct;
        window.gmptecCart.removeProduct = function(productId) {
            const result = originalRemoveProduct.call(this, productId);
            if (result && window.gmptecCartCounter) {
                console.log('Product removed, updating counter...');
                window.gmptecCartCounter.updateCounter();
            }
            return result;
        };
    }

    bindStorageEvents() {
        // LocalStorage Änderungen überwachen (für Cross-Tab Synchronisation)
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                console.log('LocalStorage geändert, Counter aktualisiert');
                this.updateCounter();
            }
        });
    }

    // NEU: Automatische Anbindung an WordPress-Menü
    attachToWordPressMenu() {
        // Warten bis DOM vollständig geladen ist
        setTimeout(() => {
            this.findAndAttachToMenuItems();
        }, 500);
    }

    findAndAttachToMenuItems() {
        // Verschiedene WordPress-Menü-Selektoren
        const menuSelectors = [
            '.menu-item a',           // Standard WordPress Menü
            '.nav-menu a',            // Navigation Menü
            '.main-menu a',           // Hauptmenü
            '.header-menu a',         // Header Menü
            '.primary-menu a',        // Primäres Menü
            '.wp-block-navigation a', // Gutenberg Navigation
            '.bricks-navigation a'    // Bricks Builder Navigation
        ];

        menuSelectors.forEach(selector => {
            const menuItems = document.querySelectorAll(selector);
            menuItems.forEach(link => {
                this.checkAndAttachCounter(link);
            });
        });

        console.log('WordPress-Menü-Items gescannt und Counter angehängt');
        // Neu: direkt nach dem Anhängen alle Counter aktualisieren
        this.updateCounter();
    }

    checkAndAttachCounter(linkElement) {
        const href = linkElement.getAttribute('href');
        const text = linkElement.textContent.trim().toLowerCase();
        
        // Prüfen ob es sich um einen Cart/Anfrage-Link handelt
        if (this.isCartLink(href, text)) {
            // Prüfen ob bereits ein Counter existiert
            if (!linkElement.querySelector('.gmptec-cart-count')) {
                this.addCounterToLink(linkElement);
                console.log('Counter an Menü-Item angehängt:', text);
            }
        }
    }

    isCartLink(href, text) {
        // Verschiedene Cart-Seite URLs und Texte
        const cartUrls = [
            '/anfrage/',
            '/cart/',
            '/warenkorb/',
            '/basket/',
            '/shopping-cart/'
        ];
        
        const cartTexts = [
            'anfrage',
            'cart',
            'warenkorb',
            'basket',
            'einkaufswagen',
            'shopping cart'
        ];

        // URL-basierte Erkennung
        if (href && cartUrls.some(url => href.includes(url))) {
            return true;
        }

        // Text-basierte Erkennung
        if (text && cartTexts.some(cartText => text.includes(cartText))) {
            return true;
        }

        return false;
    }

    addCounterToLink(linkElement) {
        // Counter-Element erstellen
        const counter = document.createElement('span');
        counter.className = 'gmptec-cart-count';
        counter.textContent = '0';
        counter.setAttribute('aria-label', 'Anzahl Produkte in der Anfrage');
        
        // Counter an Link anhängen
        linkElement.appendChild(counter);
        
        // CSS-Styling hinzufügen falls nicht vorhanden
        this.addCounterStyles();

        // Neu: direkt nach dem Anhängen den aktuellen Wert setzen
        this.updateElement(counter, this.getCartCount());
    }

    addCounterStyles() {
        // Prüfen ob Styles bereits existieren
        if (document.getElementById('gmptec-counter-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'gmptec-counter-styles';
        style.textContent = `
            /* Basis Counter Styles */
            .gmptec-cart-count {
                background: #cccccc !important;
                color: #666666 !important;
                border-radius: 50% !important;
                padding: 2px 6px !important;
                font-size: 12px !important;
                font-weight: bold !important;
                display: inline-block !important;
                margin-left: 5px !important;
                min-width: 18px !important;
                text-align: center !important;
                line-height: 1 !important;
                position: relative !important;
                top: -1px !important;
                z-index: 9999 !important;
                box-sizing: border-box !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            .gmptec-cart-count.has-items {
                background: #ff0000 !important;
                color: white !important;
            }
            
            .gmptec-cart-count.empty {
                background: #cccccc !important;
                color: #666666 !important;
            }

            /* Spezielle Regeln für Bricks Builder */
            .bricks-menu-item .gmptec-cart-count,
            .bricks-menu-item a .gmptec-cart-count,
            .bricks-menu-item .menu-item a .gmptec-cart-count {
                background: #cccccc !important;
                color: #666666 !important;
                border-radius: 50% !important;
                padding: 2px 6px !important;
                font-size: 12px !important;
                font-weight: bold !important;
                display: inline-block !important;
                margin-left: 5px !important;
                min-width: 18px !important;
                text-align: center !important;
                line-height: 1 !important;
                position: relative !important;
                top: -1px !important;
                z-index: 9999 !important;
                box-sizing: border-box !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            .bricks-menu-item .gmptec-cart-count.has-items,
            .bricks-menu-item a .gmptec-cart-count.has-items,
            .bricks-menu-item .menu-item a .gmptec-cart-count.has-items {
                background: #ff0000 !important;
                color: white !important;
            }
            
            .bricks-menu-item .gmptec-cart-count.empty,
            .bricks-menu-item a .gmptec-cart-count.empty,
            .bricks-menu-item .menu-item a .gmptec-cart-count.empty {
                background: #cccccc !important;
                color: #666666 !important;
            }

            /* WordPress Menu spezifische Regeln */
            .menu-item .gmptec-cart-count,
            .menu-item a .gmptec-cart-count {
                background: #cccccc !important;
                color: #666666 !important;
                border-radius: 50% !important;
                padding: 2px 6px !important;
                font-size: 12px !important;
                font-weight: bold !important;
                display: inline-block !important;
                margin-left: 5px !important;
                min-width: 18px !important;
                text-align: center !important;
                line-height: 1 !important;
                position: relative !important;
                top: -1px !important;
                z-index: 9999 !important;
                box-sizing: border-box !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            .menu-item .gmptec-cart-count.has-items,
            .menu-item a .gmptec-cart-count.has-items {
                background: #ff0000 !important;
                color: white !important;
            }

            /* Debug: Sichtbarkeit erzwingen */
            .gmptec-cart-count[data-count] {
                display: inline-block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('Counter CSS Styles hinzugefügt');
    }

    getCartCount() {
        try {
            const cartData = localStorage.getItem(this.storageKey);
            if (!cartData) return 0;
            
            const cart = JSON.parse(cartData);
            return Array.isArray(cart) ? cart.length : 0;
        } catch (error) {
            console.error('Fehler beim Laden der Cart-Anzahl:', error);
            return 0;
        }
    }

    updateCounter() {
        const count = this.getCartCount();
        console.log(`Cart Counter Update: ${count} Produkt(e)`);

        // Alle Counter-Elemente finden und aktualisieren
        this.counterSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.updateElement(element, count);
            });
        });

        // Data-Attribute Counter
        const dataElements = document.querySelectorAll('[data-cart-counter]');
        dataElements.forEach(element => {
            this.updateElement(element, count);
        });
    }

    updateElement(element, count) {
        // Text aktualisieren
        element.textContent = count;
        
        // Sichtbarkeit basierend auf Anzahl
        if (count > 0) {
            element.style.display = 'inline-block';
            element.classList.add('has-items');
            element.classList.remove('empty');
            console.log(`Counter ${count} angezeigt für:`, element);
        } else {
            // Counter auch bei 0 anzeigen, aber mit leerem Styling
            element.style.display = 'inline-block';
            element.classList.remove('has-items');
            element.classList.add('empty');
            console.log(`Counter 0 angezeigt für:`, element);
        }

        // Aria-Label für Accessibility
        element.setAttribute('aria-label', `${count} Produkt${count !== 1 ? 'e' : ''} in der Anfrage`);
        
        // Data-Attribute für CSS
        element.setAttribute('data-count', count);
    }

    // Public Methods für externe Nutzung
    forceUpdate() {
        this.updateCounter();
    }

    getCount() {
        return this.getCartCount();
    }

    // NEU: Manuell Counter an Element anhängen
    attachCounterToElement(element) {
        if (element && !element.querySelector('.gmptec-cart-count')) {
            this.addCounterToLink(element);
            this.updateCounter();
        }
    }
}

// Counter System initialisieren
(function initCartCounter() {
    // Verhindere doppelte Initialisierung
    if (window.gmptecCartCounter) {
        console.log('Cart Counter bereits initialisiert');
        return;
    }

    // Warten bis DOM bereit ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.gmptecCartCounter = new GMPTECCartCounter();
        });
    } else {
        window.gmptecCartCounter = new GMPTECCartCounter();
    }
})();

// Global Debug Functions
if (typeof window !== 'undefined') {
    window.updateCartCounter = () => {
        if (window.gmptecCartCounter) {
            window.gmptecCartCounter.forceUpdate();
        }
    };
    
    window.getCartCount = () => {
        if (window.gmptecCartCounter) {
            return window.gmptecCartCounter.getCount();
        }
        return 0;
    };

    // NEU: Manuell Counter an Element anhängen
    window.attachCounterToElement = (selector) => {
        if (window.gmptecCartCounter) {
            const element = document.querySelector(selector);
            if (element) {
                window.gmptecCartCounter.attachCounterToElement(element);
            }
        }
    };
} 