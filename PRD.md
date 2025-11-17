# PRD: GMPTEC WSForms Integration

**Ziel:** LocalStorage Cart mit WSForms Pro verbinden, damit Nutzer ihre ausgewählten Produkte per Formular anfragen können.

---

## 1. Projekt-Kontext

### Was gibt es bereits?

**Funktionierende Komponenten:**
- ✅ LocalStorage Cart-System (hinzufügen/entfernen)
- ✅ Cart-Counter im WordPress-Menü
- ✅ Cart-Page mit Produktliste-Rendering
- ✅ Button-State-Management (hinzufügen ↔ entfernen)
- ✅ Event-Delegation für dynamische Buttons
- ✅ Bricks Builder kompatibel

**Vorhandene Dateien:**
```
/gmptec-add-cart-script.js    # Core Cart + Cart-Page (GMPTECCart Klasse)
/gmptec-cart-counter.js        # Menu Counter (GMPTECCartCounter Klasse)
```

**Tech Stack:**
- WordPress
- Bricks Builder
- ACSS Framework
- WSForms Pro
- WP CodeBox (JavaScript-Verwaltung)

### Was fehlt?

- ❌ WSForms Integration
- ❌ Produktliste ins Formular übertragen
- ❌ Form Submit Handling
- ❌ Cart leeren nach erfolgreicher Anfrage

---

## 2. Technische Anforderungen

### 2.1 Neue JavaScript-Datei

**Datei:** `gmptec-cart-form-integration.js`

**Zweck:**
1. LocalStorage Cart auslesen
2. WSForms Produkt-Field befüllen
3. Empty Cart verhindern
4. Nach Submit → Cart leeren

### 2.2 Dependencies

**Benötigt:**
- `window.gmptecCart` (GMPTECCart Klasse)
- WSForms DOM (`.wsf-form`)

**Load Order:**
```
1. gmptec-add-cart-script       (Priority: 10)
2. gmptec-cart-counter          (Priority: 20)
3. gmptec-cart-form-integration (Priority: 30) ← NEU
```

### 2.3 Seiten-Scope

**Lädt nur auf:** `/anfrage/` Seite (Cart-Page)

**WP CodeBox Conditional:**
```php
is_page('anfrage')
```

---

## 3. Funktionale Anforderungen

### 3.1 Produktliste übertragen

**Input:** LocalStorage Cart
```javascript
[
  { id: "123", name: "Produkt 1", thumbnail: "..." },
  { id: "456", name: "Produkt 2", thumbnail: "..." }
]
```

**Output:** WSForms Field
```
Produkt 1
Produkt 2
```
(Ein Produkt pro Zeile, Plain Text)

### 3.2 Empty Cart Handling

**Wenn Cart leer:**
- Submit-Button deaktivieren
- Warnung anzeigen: "Bitte wählen Sie zunächst Produkte aus."
- Produkt-Field leer lassen

### 3.3 Form Submit

**Vor Submit:**
- Validierung: Cart muss mindestens 1 Produkt enthalten
- Bei leerem Cart: Submit verhindern

**Nach erfolgreichem Submit:**
- Cart leeren (`window.gmptecCart.clearCart()`)
- Success-Message anzeigen
- Optional: Redirect zu Danke-Seite

### 3.4 Real-Time Sync

**Wenn Nutzer auf Cart-Page Produkte entfernt:**
- Formular-Field automatisch aktualisieren
- Submit-Button Status anpassen

---

## 4. WSForms Setup

**Formular-Felder:**
- Name (required)
- Firma (required)
- Standort (required)
- E-Mail (required)
- Telefon (required)
- **Produkte** (Textarea oder Hidden) ← Dynamisch befüllt
- Nachricht (optional)

**Produkt-Field:**
- Name: `products` (oder variabel)
- Wird von JavaScript gefunden und befüllt
- Kann Textarea (sichtbar) oder Hidden sein

---

## 5. Code-Architektur

### 5.1 Klassen-Struktur

```javascript
class GMPTECCartFormIntegration {
  constructor(config)
  init()
  waitForDependencies()
  setupIntegration()
  findProductField()
  updateProductField()
  handleEmptyCart()
  bindFormSubmit()
  handleSuccess()
  bindCartChanges()
  showMessage(text, type)
}
```

### 5.2 Konfiguration

```javascript
{
  formSelector: '.wsf-form',
  productFieldName: 'products',
  emptyCartMessage: 'Bitte wählen Sie zunächst Produkte aus.',
  successMessage: 'Anfrage erfolgreich versendet!',
  clearCartOnSuccess: true,
  redirectOnSuccess: null,
  redirectDelay: 2000
}
```

---

## 6. Testing-Szenarien

### Must-Have Tests:
1. **Empty Cart:** Submit disabled, Warnung sichtbar
2. **Single Product:** Field befüllt, Submit enabled
3. **Multiple Products:** Alle Produkte im Field (Zeilenumbrüche)
4. **Produkt entfernen:** Field aktualisiert automatisch
5. **Form Success:** Cart wird geleert
6. **Reload nach Success:** Cart bleibt leer

### Edge Cases:
- JavaScript deaktiviert (Graceful Degradation)
- LocalStorage blockiert
- WSForms Field nicht gefunden
- Multiple Form Submits (Prevention)

---

## 7. Offene Punkte

**Nach WSForms Setup zu klären:**
1. Exakter Field-Name des Produkt-Fields
2. Field-Typ: Textarea (sichtbar) oder Hidden?
3. Redirect-URL nach Erfolg gewünscht?
4. E-Mail-Format: Plain Text oder HTML?

**Zu klären**
1. Soll Cart immer nach Submit geleert werden?
2. Produktliste im Formular sichtbar für User?

---

## 8. Success Criteria

✅ Produkte werden automatisch ins Formular übertragen  
✅ Submit nur möglich wenn Cart nicht leer  
✅ Cart wird nach erfolgreichem Versand geleert  
✅ Real-Time Sync zwischen Cart und Formular  
✅ Keine Console Errors  
✅ Funktioniert in Chrome, Firefox, Safari  

---

**Next Step:** Claude Code analysiert Projekt-Struktur und erstellt `gmptec-cart-form-integration.js`