# 🌱 Chytrý květináč – IoT projekt

Tento projekt je zaměřený na vytvoření **chytrého květináče**, který automaticky zavlažuje rostlinu podle naměřené vlhkosti půdy. Cílem je pohodlná péče o rostliny pomocí reálného IoT systému postaveného na HARDWARIO Core Module.

---

## 🔧 Použité technologie a hardware

### 🧠 Řídicí jednotka
- [HARDWARIO Core Module](https://www.hardwario.com/)
- MicroPython / C firmware

### 📦 Senzory a akční členy
- Kapacitní měřič vlhkosti půdy
- Ultrazvukový senzor pro měření hladiny vody (např. JSN-SR04T)
- Relé modul (5V) pro spínání čerpadla
- Mini čerpadlo 5V/12V
- Nádoba na vodu

### 🖥️ Backend & Frontend
- **Backend**: Node.js + WebSockets + REST API
- **Databáze**: MongoDB
- **Frontend**: React / Next.js

---

## 🔁 Komunikační tok

1. **IoT květináč měří data (vlhkost, hladinu vody, teplotu...)**
2. Data jsou odesílána na **IoT Gateway**
3. Gateway je v pravidelných intervalech posílá na **backend**
4. **Backend ukládá data** a současně je přes WebSockets posílá **frontend aplikaci**
5. Pokud vlhkost klesne pod hranici, **květináč (nebo gateway)** aktivuje čerpadlo a zavlažuje

---

## 📦 Funkce systému

- ✅ Měření vlhkosti půdy, teploty, intenzity světla
- ✅ Automatické zavlažování podle nastavených pravidel
- ✅ Zobrazení aktuálních hodnot v aplikaci (v reálném čase – WebSocket)
- ✅ Upozornění na nízkou hladinu vody
- ✅ Statistiky a historie zavlažování
- ✅ Správa domácností a květináčů (uživatelské role)

---

## 🧪 Testování a vývoj

- Vývoj probíhá na **breadboardu** s použitím **dupont kabelů**  
- Veškeré měření je testováno s reálnou vodou a simulací různých podmínek

---

## 📸 Ukázky

> *(Sem můžeš dát později fotky květináče, schéma zapojení nebo screen z aplikace)*

---
