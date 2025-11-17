/**
 * GMPTEC Cart → WSForms Integration (MVP Version)
 * Minimale Version für initiales Testing
 *
 * Features:
 * - Produkte ins Formular übertragen beim Load
 * - Submit verhindern wenn Cart leer
 * - Cart leeren nach Submit
 *
 * Setup:
 * 1. Form ID und Field ID unten anpassen
 * 2. Als WP CodeBox Script hochladen (Priority: 30)
 * 3. Conditional: is_page('anfrage')
 */

class GMPTECCartFormIntegrationMVP {
    constructor(config = {}) {
        // WICHTIG: Diese IDs anpassen!
        this.config = {
            formId: 1,              // WSForms Form ID (siehe URL: post=X)
            productFieldId: 123,    // WSForms Field ID (siehe Field Settings → Advanced → ID)
            debug: true,            // Console Logging
            ...config
        };

        this.log('🚀 MVP Integration initialized with config:', this.config);
        this.init();
    }

    init() {
        this.log('⏳ Waiting for dependencies...');
        this.waitForDependencies().then(() => {
            this.log('✅ Dependencies loaded, setting up integration...');
            this.setupIntegration();
        });
    }

    waitForDependencies() {
        return new Promise((resolve) => {
            const check = () => {
                if (window.gmptecCart && typeof jQuery !== 'undefined') {
                    this.log('✅ GMPTECCart and jQuery found');
                    resolve();
                } else {
                    this.log('⏳ Waiting for dependencies...');
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    setupIntegration() {
        const $ = jQuery;

        // Event 1: Form geladen → Produkte befüllen
        $(document).on('wsf-rendered', (e, form, form_id, instance_id) => {
            if (form_id !== this.config.formId) {
                this.log(`⏭️ Skipping form ${form_id} (not our form)`);
                return;
            }

            this.log(`📝 Form ${form_id} rendered (instance: ${instance_id})`);
            this.populateProductField(instance_id);
        });

        // Event 2: Vor Submit → Validierung
        $(document).on('wsf-submit-before-ajax', (e, form_object, form_id, instance_id, form_el) => {
            if (form_id !== this.config.formId) return;

            this.log('🔍 Validating before submit...');
            const cart = window.gmptecCart.getCart();

            if (cart.length === 0) {
                this.log('❌ Cart is empty, preventing submit');
                e.preventDefault();
                alert('Bitte wählen Sie zunächst Produkte aus.');
                return false;
            }

            this.log(`✅ Validation passed (${cart.length} products)`);
        });

        // Event 3: Nach Submit → Cart leeren
        $(document).on('wsf-submit-complete', (e, form_object, form_id, instance_id) => {
            if (form_id !== this.config.formId) return;

            this.log('✅ Form submitted successfully, clearing cart...');
            window.gmptecCart.clearCart();
            this.log('🗑️ Cart cleared');
        });

        this.log('✅ All event handlers registered');
    }

    populateProductField(instance_id) {
        const $ = jQuery;
        const cart = window.gmptecCart.getCart();

        this.log('📦 Cart contents:', cart);

        if (cart.length === 0) {
            this.log('⚠️ Cart is empty!');
            return;
        }

        // Field Selector: #wsf-{instance_id}-field-{field_id}
        const fieldSelector = `#wsf-${instance_id}-field-${this.config.productFieldId}`;
        this.log(`🎯 Target field selector: ${fieldSelector}`);

        const field = $(fieldSelector);

        if (field.length === 0) {
            this.log(`❌ ERROR: Field not found! Check productFieldId (${this.config.productFieldId})`);
            return;
        }

        // Produktliste als Text formatieren (ein Produkt pro Zeile)
        const productText = cart.map(p => p.name).join('\n');

        field.val(productText);
        this.log(`✅ Populated ${cart.length} products into field:`, productText);
    }

    log(...args) {
        if (this.config.debug) {
            console.log('[GMPTEC Form MVP]', ...args);
        }
    }
}

// ===== AUTO-INITIALIZATION =====

(function initMVP() {
    // Prüfen ob wir auf einer Seite mit WSForms sind
    const hasForm = document.querySelector('.wsf-form');

    if (!hasForm) {
        console.log('[GMPTEC Form MVP] No WSForm found on this page, skipping...');
        return;
    }

    console.log('[GMPTEC Form MVP] WSForm detected, initializing...');

    // Initialize sobald DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.gmptecCartFormMVP = new GMPTECCartFormIntegrationMVP({
                formId: 1,           // ← ANPASSEN!
                productFieldId: 123   // ← ANPASSEN!
            });
        });
    } else {
        window.gmptecCartFormMVP = new GMPTECCartFormIntegrationMVP({
            formId: 1,           // ← ANPASSEN!
            productFieldId: 123   // ← ANPASSEN!
        });
    }
})();

// ===== DEBUG HELPERS =====

if (typeof window !== 'undefined') {
    // Test-Funktion für Console
    window.testFormIntegration = () => {
        if (!window.gmptecCartFormMVP) {
            console.error('Form integration not initialized yet');
            return;
        }

        console.log('=== Form Integration Test ===');
        console.log('Config:', window.gmptecCartFormMVP.config);
        console.log('Cart:', window.gmptecCart.getCart());
        console.log('Form present:', document.querySelector('.wsf-form') ? 'YES' : 'NO');
    };
}
