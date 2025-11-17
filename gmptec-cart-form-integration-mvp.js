/**
 * GMPTEC Cart → WSForms Integration (MVP Version)
 * Minimale Version für initiales Testing
 *
 * Features:
 * - Produkte ins Formular übertragen beim Load
 * - Submit verhindern wenn Cart leer
 * - Cart leeren nach Submit
 * - Wartet automatisch auf Formular (Bricks Builder kompatibel)
 *
 * ✅ Konfiguriert:
 * - Form ID: 1
 * - Field ID: 4 (Produkte Textarea)
 *
 * Setup:
 * 1. Als WP CodeBox Script hochladen (Priority: 30)
 * 2. Conditional: is_page('anfrage')  ← Deinen Page Slug prüfen!
 * 3. Testen!
 */

class GMPTECCartFormIntegrationMVP {
    constructor(config = {}) {
        // ✅ Konfiguriert für dein Formular
        this.config = {
            formId: 1,              // WSForms Form ID
            productFieldId: 4,      // WSForms Field ID (Produkte Textarea)
            debug: true,            // Console Logging aktiviert
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

        // Sofort befüllen wenn Formular schon gerendert ist
        this.checkAndPopulateImmediately();
    }

    checkAndPopulateImmediately() {
        const $ = jQuery;
        const form = $(`.wsf-form[data-id="${this.config.formId}"]`);

        if (form.length === 0) {
            this.log('⚠️ Form not found for immediate population');
            return;
        }

        // Prüfen ob bereits gerendert (data-wsf-rendered Attribut)
        const isRendered = form.attr('data-wsf-rendered') !== undefined;

        if (isRendered) {
            const instanceId = form.data('instance-id') || 1;
            this.log(`✨ Form already rendered, populating immediately (instance: ${instanceId})`);
            this.populateProductField(instanceId);
        } else {
            this.log('⏳ Form not yet rendered, waiting for wsf-rendered event...');
        }
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
    console.log('[GMPTEC Form MVP] Starting initialization...');

    // Warte auf WSForms (Bricks Builder lädt es async)
    let attempts = 0;
    const maxAttempts = 50; // 5 Sekunden max (50 x 100ms)

    function waitForForm() {
        attempts++;
        const hasForm = document.querySelector('.wsf-form');

        if (hasForm) {
            console.log('[GMPTEC Form MVP] ✅ WSForm found after', attempts, 'attempts');
            console.log('[GMPTEC Form MVP] Initializing integration...');

            window.gmptecCartFormMVP = new GMPTECCartFormIntegrationMVP({
                formId: 1,           // ✅ Konfiguriert
                productFieldId: 4     // ✅ Konfiguriert
            });
        } else if (attempts < maxAttempts) {
            console.log('[GMPTEC Form MVP] ⏳ Waiting for form... (attempt', attempts, '/', maxAttempts, ')');
            setTimeout(waitForForm, 100);
        } else {
            console.log('[GMPTEC Form MVP] ❌ No WSForm found after', maxAttempts, 'attempts. Giving up.');
        }
    }

    // Start waiting
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForForm);
    } else {
        waitForForm();
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
