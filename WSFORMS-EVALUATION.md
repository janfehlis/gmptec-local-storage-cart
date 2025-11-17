# WSForms Pro Integration - Evaluierung

**Datum:** 2025-01-17
**Projekt:** GMPTEC LocalStorage Cart System
**Ziel:** Evaluierung der WSForms Integration für Cart-zu-Formular Übertragung

---

## Executive Summary

WSForms Pro bietet ausreichende JavaScript-API-Funktionalität für die geplante Integration. Die Implementierung ist mit dem `wsf-rendered` Event und Standard-DOM-Manipulation machbar.

**Empfehlung:** ✅ WSForms Pro ist geeignet für die Integration

---

## 1. Verfügbare WSForms JavaScript API

### 1.1 Events

**wsf-rendered Event** (✅ Verfügbar)
```javascript
$(document).on('wsf-rendered', function(e, form, form_id, instance_id) {
    // Läuft wenn Formular geladen ist
    // Perfekt für initiale Feld-Befüllung
});
```

**wsf-submit-before-ajax Event** (✅ Verfügbar)
```javascript
$(document).on('wsf-submit-before-ajax', function(event, form_object, form_id, instance_id, form_el, form_canvas_el) {
    // Läuft vor Submit
    // Perfekt für Validierung
});
```

**wsf-submit-complete Event** (✅ Verfügbar)
```javascript
$(document).on('wsf-submit-complete', function(e, form_object, form_id, instance_id) {
    // Läuft nach erfolgreichem Submit
    // Perfekt für Cart leeren
});
```

### 1.2 Field Manipulation

**Field Selector Pattern:**
```javascript
$('#wsf-' + instance_id + '-field-' + field_id)
```

**Field Value setzen:**
```javascript
$('#wsf-' + instance_id + '-field-' + field_id).val('Wert');
```

**Field deaktivieren:**
```javascript
$('#wsf-' + instance_id + '-field-' + field_id).prop('disabled', true);
```

### 1.3 Submit Button Manipulation

```javascript
// Submit Button finden (Standard WordPress Pattern)
var submitButton = form_el.find('button[type="submit"]');

// Deaktivieren
submitButton.prop('disabled', true);

// Text ändern
submitButton.text('Neuer Text');
```

---

## 2. Integration Ansätze

### Ansatz 1: Textarea Field (Sichtbar)
**Empfohlen für:** Transparenz, User kann Produkte sehen

**Vorteile:**
- ✅ User sieht welche Produkte in der Anfrage sind
- ✅ Einfach zu debuggen
- ✅ Kann vom User manuell editiert werden (falls gewünscht)

**Nachteile:**
- ❌ Nimmt Platz im Formular ein
- ❌ User könnte Inhalt versehentlich ändern

**Implementation:**
```javascript
// Produktliste als Text formatieren
var productText = cart.map(p => p.name).join('\n');
$('#wsf-' + instance_id + '-field-' + field_id).val(productText);
```

### Ansatz 2: Hidden Field (Unsichtbar)
**Empfohlen für:** Clean UI, keine User-Interaktion

**Vorteile:**
- ✅ Sauberes UI, nimmt keinen Platz weg
- ✅ User kann Inhalt nicht versehentlich ändern
- ✅ Cleaner Workflow

**Nachteile:**
- ❌ User sieht nicht welche Produkte übertragen werden
- ❌ Schwieriger zu debuggen für Non-Devs

**Implementation:**
```javascript
// JSON oder Text
var productData = JSON.stringify(cart);
// oder als Namen-Liste
var productText = cart.map(p => p.name).join('\n');
$('#wsf-' + instance_id + '-field-' + field_id).val(productData);
```

### Ansatz 3: Hybrid - Visible Summary + Hidden Data
**Empfohlen für:** Beste UX + Clean Data

**Vorteile:**
- ✅ User sieht Produkte (Read-only Anzeige im HTML)
- ✅ Saubere Datenübertragung (Hidden Field)
- ✅ Beste User Experience

**Nachteile:**
- ❌ Etwas komplexer in der Implementation
- ❌ Benötigt Custom HTML Container

**Implementation:**
```javascript
// Sichtbare Liste (Custom HTML Container)
var productHTML = cart.map(p => `<li>${p.name}</li>`).join('');
$('.product-summary-list').html(productHTML);

// Hidden Field für Formular
var productData = cart.map(p => p.name).join('\n');
$('#wsf-' + instance_id + '-field-' + field_id).val(productData);
```

---

## 3. Empfohlene Implementation

### Option A: Textarea Field (Einfachste Lösung)

**WSForms Setup:**
1. Textarea Field hinzufügen
2. Field ID notieren (z.B. `123`)
3. Label: "Ausgewählte Produkte"
4. Readonly: Ja (optional)
5. Required: Nein (wird via JS gesetzt)

**JavaScript:**
```javascript
class GMPTECCartFormIntegration {
    constructor(config = {}) {
        this.config = {
            formId: 1,                    // WSForms Form ID
            productFieldId: 123,           // Field ID für Produkte
            formSelector: '.wsf-form',
            ...config
        };
        this.init();
    }

    init() {
        // Warten auf Dependencies
        this.waitForDependencies().then(() => {
            this.setupIntegration();
        });
    }

    waitForDependencies() {
        return new Promise((resolve) => {
            const check = () => {
                if (window.gmptecCart && typeof jQuery !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    setupIntegration() {
        const $ = jQuery;

        // Form Rendered Event
        $(document).on('wsf-rendered', (e, form, form_id, instance_id) => {
            if (form_id !== this.config.formId) return;

            console.log('WSForms rendered, populating products...');
            this.populateProductField(instance_id);
            this.handleEmptyCart(instance_id);
        });

        // Submit Validation
        $(document).on('wsf-submit-before-ajax', (e, form_object, form_id, instance_id, form_el) => {
            if (form_id !== this.config.formId) return;

            const cart = window.gmptecCart.getCart();
            if (cart.length === 0) {
                e.preventDefault();
                alert('Bitte wählen Sie zunächst Produkte aus.');
                return false;
            }
        });

        // Submit Success
        $(document).on('wsf-submit-complete', (e, form_object, form_id, instance_id) => {
            if (form_id !== this.config.formId) return;

            console.log('Form submitted successfully, clearing cart...');
            window.gmptecCart.clearCart();
        });

        // Real-Time Cart Updates (wenn User Produkte auf Cart-Page entfernt)
        this.bindCartChanges();
    }

    populateProductField(instance_id) {
        const $ = jQuery;
        const cart = window.gmptecCart.getCart();
        const fieldSelector = `#wsf-${instance_id}-field-${this.config.productFieldId}`;

        // Produktliste als Text
        const productText = cart.map(p => p.name).join('\n');

        $(fieldSelector).val(productText);
        console.log(`Populated ${cart.length} products into field`);
    }

    handleEmptyCart(instance_id) {
        const $ = jQuery;
        const cart = window.gmptecCart.getCart();
        const formEl = $(`.wsf-form[data-id="${this.config.formId}"]`);
        const submitBtn = formEl.find('button[type="submit"]');

        if (cart.length === 0) {
            submitBtn.prop('disabled', true);
            submitBtn.text('Bitte wählen Sie Produkte aus');
            this.showWarning('Bitte wählen Sie zunächst Produkte aus.');
        } else {
            submitBtn.prop('disabled', false);
            submitBtn.text('Anfrage senden');
            this.hideWarning();
        }
    }

    bindCartChanges() {
        // Überwache Cart Änderungen
        const originalUpdateDisplay = window.gmptecCart.updateCartDisplay;
        window.gmptecCart.updateCartDisplay = () => {
            originalUpdateDisplay.call(window.gmptecCart);

            // Re-populate form wenn auf Cart-Page
            if (document.querySelector(this.config.formSelector)) {
                // Form instance_id finden und neu befüllen
                const $ = jQuery;
                const formEl = $(this.config.formSelector).first();
                const instanceId = formEl.data('instance-id') || 1;

                this.populateProductField(instanceId);
                this.handleEmptyCart(instanceId);
            }
        };
    }

    showWarning(message) {
        // TODO: Warning anzeigen
        console.warn(message);
    }

    hideWarning() {
        // TODO: Warning verstecken
    }
}

// Initialize (nur auf Cart-Page)
if (document.querySelector('.wsf-form')) {
    window.gmptecCartForm = new GMPTECCartFormIntegration({
        formId: 1,           // Anpassen!
        productFieldId: 123   // Anpassen!
    });
}
```

---

## 4. WSForms Setup Schritte

### Schritt 1: Formular erstellen
1. WSForms → Add New
2. Name: "Produktanfrage"
3. Layout erstellen

### Schritt 2: Felder hinzufügen
1. **Name** (Text, Required)
2. **Firma** (Text, Required)
3. **Standort** (Text, Required)
4. **E-Mail** (Email, Required)
5. **Telefon** (Tel, Required)
6. **Produkte** (Textarea, Required)
   - Field ID notieren (z.B. 123)
   - Label: "Ausgewählte Produkte"
   - Readonly: Optional (wenn User nicht editieren soll)
7. **Nachricht** (Textarea, Optional)

### Schritt 3: Form ID & Field ID notieren
- Form ID: Oben rechts in der URL (z.B. `post=1` → Form ID: `1`)
- Field ID: In Field Settings unter "Advanced" → "ID"

### Schritt 4: JavaScript hochladen
- WP CodeBox: `gmptec-cart-form-integration.js`
- Priority: 30
- Conditional: `is_page('anfrage')`

### Schritt 5: Config anpassen
```javascript
window.gmptecCartForm = new GMPTECCartFormIntegration({
    formId: 1,           // Deine Form ID
    productFieldId: 123   // Deine Field ID
});
```

---

## 5. Alternative Field Types

### Hidden Field
**Setup:** Field Type → "Hidden"
**Pro:** Unsichtbar, sauberes UI
**Con:** User sieht Produkte nicht im Formular

### Readonly Textarea
**Setup:** Field Type → "Textarea" + Readonly
**Pro:** User sieht Produkte, kann aber nicht editieren
**Con:** Nimmt visuellen Platz weg

### Custom HTML + Hidden
**Setup:** HTML Field für Anzeige + Hidden Field für Daten
**Pro:** Beste UX, volle Kontrolle über Design
**Con:** Komplexer Setup

---

## 6. Testing Checklist

### Muss getestet werden:
- [ ] Empty Cart: Submit disabled, Warnung angezeigt
- [ ] 1 Produkt: Field befüllt, Submit enabled
- [ ] 3+ Produkte: Alle Produkte im Field (Zeilenumbrüche)
- [ ] Produkt auf Cart-Page entfernen: Field aktualisiert
- [ ] Form Submit: Cart wird geleert
- [ ] Page Reload nach Submit: Cart bleibt leer
- [ ] Cross-Tab: Cart in Tab A ändern, Tab B Formular aktualisiert

### Edge Cases:
- [ ] JavaScript deaktiviert: Graceful Degradation
- [ ] LocalStorage blockiert: Error Handling
- [ ] WSForms Field nicht gefunden: Error Handling
- [ ] Doppel-Submit Prevention

---

## 7. Offene Fragen für Kunden-Absprache

1. **Field Type:** Textarea (sichtbar) oder Hidden (unsichtbar)?
2. **Produktformat im Formular:**
   - Nur Namen? `Produkt 1\nProdukt 2`
   - Mit IDs? `[123] Produkt 1\n[456] Produkt 2`
   - Als JSON? `[{"id":"123","name":"Produkt 1"}]`
3. **Cart leeren:** Immer nach Submit oder nur nach erfolgreichem Submit?
4. **Redirect:** Nach Submit zu Danke-Seite oder auf Cart-Page bleiben?
5. **E-Mail Format:** Plain Text oder HTML?

---

## 8. Fazit

**Status:** ✅ WSForms Pro Integration ist machbar

**Komplexität:** 🟢 Niedrig bis Mittel

**Empfohlene Variante:**
- **Textarea Field (Readonly)** für beste Balance zwischen Transparenz und Sicherheit
- Real-Time Sync via Cart-Event-Hooks
- Submit-Validierung via `wsf-submit-before-ajax`
- Cart leeren via `wsf-submit-complete`

**Geschätzte Entwicklungszeit:**
- Implementation: 2-3 Stunden
- Testing: 1 Stunde
- Gesamt: 3-4 Stunden

**Nächste Schritte:**
1. Kunden-Absprache zu offenen Fragen
2. WSForms Formular erstellen & Form/Field IDs notieren
3. `gmptec-cart-form-integration.js` implementieren
4. Testing auf Staging-Umgebung
5. Go-Live
