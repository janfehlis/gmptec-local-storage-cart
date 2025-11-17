# MVP Test Plan - WSForms Integration

**Ziel:** Minimale funktionierende Version testen, bevor wir alle Features implementieren

---

## MVP Scope (Phase 1)

### ✅ Was ist DRIN:

1. **Produkte ins Formular übertragen** beim Laden
2. **Submit verhindern** wenn Cart leer ist
3. **Cart leeren** nach erfolgreichem Submit
4. **Console Logging** für Debugging

### ❌ Was ist NICHT DRIN (später):

1. Real-Time Updates (Produkt entfernen auf Cart-Page)
2. Visuelle Warning-Messages
3. Submit-Button Text dynamisch ändern
4. Redirect nach Submit
5. Komplexes Error Handling
6. Cross-Tab Sync

---

## MVP Setup Anforderungen

### WSForms Formular (Minimal):

1. **Name** (Text, Required)
2. **E-Mail** (Email, Required)
3. **Produkte** (Textarea, Required)
   - Field ID: `123` (oder anpassen im Code)
4. **Submit Button**

### WordPress Setup:

1. Formular auf `/anfrage/` Seite einbinden
2. Form ID notieren (z.B. `1`)
3. Field ID für "Produkte" notieren (z.B. `123`)

### JavaScript Setup:

1. `gmptec-cart-form-integration-mvp.js` hochladen
2. WP CodeBox Priority: `30`
3. Conditional: `is_page('anfrage')`
4. Config im Code anpassen:
   ```javascript
   formId: 1,           // Deine Form ID
   productFieldId: 123   // Deine Field ID
   ```

---

## MVP Testing Workflow

### Test 1: Empty Cart
1. Cart leeren: `clearCart()` in Console
2. Seite neu laden
3. **Erwartung:**
   - Console: "Cart is empty!"
   - Field bleibt leer
   - Submit wird verhindert

### Test 2: Single Product
1. Ein Produkt zum Cart hinzufügen
2. Zu `/anfrage/` navigieren
3. **Erwartung:**
   - Console: "Populated 1 products"
   - Textarea enthält Produktname
   - Submit funktioniert

### Test 3: Multiple Products
1. 3 Produkte zum Cart hinzufügen
2. Zu `/anfrage/` navigieren
3. **Erwartung:**
   - Console: "Populated 3 products"
   - Textarea enthält alle 3 Namen (Zeilenumbrüche)

### Test 4: Form Submit
1. Formular mit Produkten ausfüllen
2. Submit klicken
3. **Erwartung:**
   - Form wird submitted
   - Console: "Form submitted, clearing cart..."
   - Nach Success: Cart ist leer (`debugCart()` zeigt `[]`)

---

## MVP Success Criteria

✅ Produkte werden beim Load ins Formular übertragen
✅ Submit wird verhindert wenn Cart leer
✅ Cart wird nach Submit geleert
✅ Keine Console Errors
✅ Funktioniert in Chrome/Firefox/Safari

---

## Bekannte MVP Limitierungen

⚠️ Keine Real-Time Updates (Page Reload nötig nach Cart-Änderung)
⚠️ Keine visuellen Warnings (nur Console)
⚠️ Keine Submit-Button Anpassungen
⚠️ Hardcoded Form/Field IDs (muss manuell angepasst werden)

---

## Nach MVP Testing → Phase 2

Wenn MVP funktioniert, erweitern wir:
1. Real-Time Cart Updates
2. Visual Feedback (Warnings, Messages)
3. Submit-Button State Management
4. Konfigurierbare Settings
5. Error Handling & Edge Cases
