# MVP Quick Start Guide

**Ziel:** WSForms Integration in 10 Minuten testen

---

## Schritt 1: WSForms Formular erstellen (5 Min)

### 1.1 Neues Formular anlegen
- WSForms → Add New
- Name: "Produktanfrage MVP"

### 1.2 Felder hinzufügen (Minimal!)

**Feld 1: Name**
- Field Type: `Text`
- Required: ✅ Ja

**Feld 2: E-Mail**
- Field Type: `Email`
- Required: ✅ Ja

**Feld 3: Produkte** ← WICHTIG!
- Field Type: `Textarea` (NICHT Text!)
- Label: "Ausgewählte Produkte"
- Required: ✅ Ja
- Rows: 5-10 (für mehrere Produkte)
- Readonly: Optional (verhindert User-Bearbeitung)

**Feld 4: Submit Button**
- Standard Submit Button

**⚠️ Warum Textarea und nicht Text?**

Textarea erlaubt mehrere Zeilen, perfekt für mehrere Produkte:
```
Produkt 1
Produkt 2
Produkt 3
```

Text-Field würde alle Produkte in eine Zeile quetschen:
```
Produkt 1, Produkt 2, Produkt 3  ← Schwer lesbar!
```

### 1.3 IDs notieren
- **Form ID:** Oben rechts in URL (z.B. `post=1` → Form ID = `1`)
- **Field ID für "Produkte":**
  1. Produkte-Field anklicken
  2. Rechts unter "Advanced" → Tab "ID"
  3. Notiere die Nummer (z.B. `123`)

### 1.4 Formular speichern & Shortcode kopieren
- Formular speichern
- Shortcode kopieren (z.B. `[ws_form id="1"]`)

---

## Schritt 2: Formular auf Cart-Page einbinden (2 Min)

### 2.1 Seite öffnen
- Pages → `/anfrage/` (deine Cart-Page)

### 2.2 Shortcode einfügen
- Im Bricks Builder oder WordPress Editor
- Shortcode Block hinzufügen
- Shortcode einfügen: `[ws_form id="1"]`

### 2.3 Speichern & Preview
- Seite speichern
- Im Frontend ansehen

---

## Schritt 3: JavaScript hochladen (3 Min)

### 3.1 Datei vorbereiten
- Öffne `gmptec-cart-form-integration-mvp.js`
- Zeile 66 & 73: IDs anpassen:
  ```javascript
  formId: 1,           // ← Deine Form ID
  productFieldId: 123   // ← Deine Field ID
  ```

### 3.2 In WP CodeBox hochladen
1. WP CodeBox → Add New
2. Name: "Cart Form Integration MVP"
3. Code einfügen (komplette Datei)
4. **Location:** Frontend
5. **Priority:** 30
6. **Conditional Logic:** `is_page('anfrage')`
7. Speichern

---

## Schritt 4: Testing (5 Min)

### Test 1: Empty Cart ❌
1. Console öffnen (F12)
2. `clearCart()` eingeben
3. Seite neu laden
4. **Erwartung:**
   - Console zeigt: `⚠️ Cart is empty!`
   - Produkte-Field ist leer

### Test 2: Mit Produkten ✅
1. Gehe zu einer Produktseite
2. Klicke "Zur Anfrage hinzufügen" (2-3 Produkte)
3. Gehe zu `/anfrage/`
4. **Erwartung:**
   - Console zeigt: `✅ Populated X products`
   - Produkte-Field enthält Namen (Zeile für Zeile)

### Test 3: Submit ✅
1. Fülle Name & E-Mail aus
2. Klicke Submit
3. **Erwartung:**
   - Formular wird submitted
   - Console zeigt: `✅ Form submitted successfully, clearing cart...`
   - Cart Counter auf 0

### Test 4: Nach Submit 🔄
1. Nach Submit: `debugCart()` in Console
2. **Erwartung:**
   - Zeigt leeres Array: `[]`

---

## Debug Befehle (Console)

```javascript
// Cart Inhalt anzeigen
debugCart()

// Cart leeren
clearCart()

// Form Integration testen
testFormIntegration()

// Cart Counter anzeigen
getCartCount()
```

---

## Troubleshooting

### Problem: Field wird nicht befüllt

**Lösung 1: Field ID überprüfen**
```javascript
// In Console auf /anfrage/ Seite:
document.querySelector('.wsf-form textarea').id
// Zeigt z.B.: "wsf-1-field-123"
// → Field ID ist 123
```

**Lösung 2: Form ID überprüfen**
```javascript
// In Console:
document.querySelector('.wsf-form').dataset.id
// Zeigt Form ID
```

**Lösung 3: Console Logs checken**
- Öffne Console (F12)
- Suche nach `[GMPTEC Form MVP]`
- Achte auf Fehlermeldungen in rot

### Problem: Submit wird nicht verhindert bei leerem Cart

**Lösung:**
- Überprüfe ob `gmptecCart` geladen ist: `window.gmptecCart`
- Überprüfe Load Order: Cart Script (Priority 10) muss VOR Form Script (Priority 30) laden

### Problem: Cart wird nicht geleert nach Submit

**Lösung:**
- Prüfe ob `wsf-submit-complete` Event feuert
- Console sollte zeigen: `✅ Form submitted successfully`

---

## Success Criteria ✅

- [ ] Produkte werden beim Load ins Field übertragen
- [ ] Submit funktioniert mit Produkten
- [ ] Submit wird verhindert bei leerem Cart
- [ ] Cart wird nach Submit geleert
- [ ] Keine roten Errors in Console

---

## Nächste Schritte nach erfolgreichem Test

Wenn MVP funktioniert:
1. Feedback geben: Was fehlt? Was stört?
2. Phase 2 Features priorisieren
3. Full Version implementieren

---

## Support

Bei Problemen:
1. Console Logs screenshot
2. Form ID & Field ID bestätigen
3. WordPress Version & WSForms Version notieren
