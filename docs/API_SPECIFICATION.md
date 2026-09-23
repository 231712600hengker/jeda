# 📡 JEDA v2 REST API Specification

Seluruh endpoint REST API menggunakan format JSON dan dilindungi oleh session berbasis cookie `httpOnly` (`jeda_session`), kecuali endpoint publik autentikasi awal.

---

## 1. Authentication Endpoints

### 1.1 Generate Participant Code
* **Endpoint:** `POST /api/auth/generate-code`
* **Deskripsi:** Membuat identitas partisipan baru dengan kode akses 8 karakter acak.
* **Autentikasi:** Tidak dibutuhkan (Publik).
* **Response (201 Created):**
```json
{
  "userId": "d7b1d923-424a-4a6c-9457-3f338db72425",
  "accessCode": "K7M2P9X4",
  "createdAt": "2026-09-23T02:00:00.000Z"
}
```

### 1.2 Login with Access Code
* **Endpoint:** `POST /api/auth/login`
* **Deskripsi:** Autentikasi menggunakan kode akses dan menetapkan session cookie.
* **Autentikasi:** Tidak dibutuhkan (Publik).
* **Request Body:**
```json
{
  "accessCode": "K7M2P9X4"
}
```
* **Response (200 OK):** Menghasilkan Set-Cookie `jeda_session`
```json
{
  "userId": "d7b1d923-424a-4a6c-9457-3f338db72425",
  "accessCode": "K7M2P9X4",
  "consentAgreed": true,
  "lastCheckinAt": "2026-09-22T14:30:00.000Z"
}
```

### 1.3 Get Current Session
* **Endpoint:** `GET /api/auth/me`
* **Deskripsi:** Memeriksa status sesi login pengguna saat ini.
* **Autentikasi:** Wajib.
* **Response (200 OK):**
```json
{
  "userId": "d7b1d923-424a-4a6c-9457-3f338db72425",
  "accessCode": "K7M2P9X4",
  "consentAgreed": true,
  "lastCheckinAt": "2026-09-22T14:30:00.000Z"
}
```

### 1.4 Submit Informed Consent
* **Endpoint:** `POST /api/auth/consent`
* **Deskripsi:** Mencatat persetujuan informed consent riset oleh partisipan.
* **Autentikasi:** Wajib.
* **Request Body:**
```json
{
  "agreed": true
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "consentAgreedAt": "2026-09-23T02:05:00.000Z"
}
```

### 1.5 Logout
* **Endpoint:** `POST /api/auth/logout`
* **Deskripsi:** Menghapus session cookie `jeda_session`.
* **Autentikasi:** Wajib.
* **Response (200 OK):**
```json
{
  "success": true
}
```

---

## 2. Check-in Endpoints

### 2.1 Submit Daily Check-in
* **Endpoint:** `POST /api/checkins`
* **Deskripsi:** Menyimpan entri check-in 9 item EMA dan mengevaluasi pemicu alert.
* **Autentikasi:** Wajib (dan consent harus `true`).
* **Request Body:**
```json
{
  "anxietyQ1": 2,
  "anxietyQ2": 3,
  "fatigueMental": 8,
  "fatiguePhysical": 7,
  "sleepQuantity": "5-6 jam",
  "sleepQuality": "buruk",
  "progress": 2,
  "selfEfficacy": 2,
  "stressors": ["technical", "time_management"],
  "note": "Kesulitan debugging modul analisis data."
}
```
* **Response (201 Created):**
```json
{
  "id": "e8c3b123-...",
  "checkinDate": "2026-09-23",
  "acuteAlertTriggered": true,
  "chronicAlertTriggered": false,
  "detection": {
    "isAcute": true,
    "acuteDetails": {
      "combinedAnxiety": 5,
      "avgFatigue": 7.5,
      "reason": "Skor kecemasan gabungan 5/6 (ambang batas: ≥ 5)"
    },
    "isChronic": false
  }
}
```

### 2.2 Get Check-in History
* **Endpoint:** `GET /api/checkins?limit=30`
* **Deskripsi:** Mengambil daftar riwayat check-in partisipan.
* **Autentikasi:** Wajib.
* **Response (200 OK):** Array of `CheckinItem`.

---

## 3. Dashboard & Analytical Endpoints

### 3.1 Get Dashboard Summary & Charts
* **Endpoint:** `GET /api/dashboard/summary?days=30`
* **Deskripsi:** Mengambil metrik agregat, statistik kepatuhan (adherence), tren rata-rata 7 hari terakhir, dan distribusi stressor.
* **Autentikasi:** Wajib.
* **Response (200 OK):**
```json
{
  "totalCheckins": 14,
  "currentStreak": 5,
  "averages": {
    "anxiety": 2.4,
    "fatigue": 5.8,
    "progress": 3.1,
    "selfEfficacy": 3.5
  },
  "trend": [
    { "date": "17 Sep", "anxiety": 2, "fatigue": 6, "progress": 3 }
  ],
  "stressorDistribution": [
    { "name": "Beban Teknis", "count": 8, "percentage": 42 }
  ]
}
```

---

## 4. Alert & Intervention Endpoints

### 4.1 Get Active / Recent Alerts
* **Endpoint:** `GET /api/alerts`
* **Deskripsi:** Mengambil daftar alert akun partisipan.
* **Autentikasi:** Wajib.

### 4.2 Mark Alert as Reviewed
* **Endpoint:** `PATCH /api/alerts/[id]/review`
* **Deskripsi:** Menandai bahwa partisipan telah membuka atau membaca intervensi alert.
* **Autentikasi:** Wajib.
* **Response (200 OK):**
```json
{
  "success": true,
  "reviewedAt": "2026-09-23T02:15:00.000Z"
}
```

---

## 5. Export & GDPR / Data Portability

### 5.1 Export Check-in Data to CSV
* **Endpoint:** `GET /api/export/csv`
* **Deskripsi:** Mengunduh seluruh riwayat check-in pengguna dalam format CSV untuk transparansi riset.
* **Autentikasi:** Wajib.
* **Response Headers:** `Content-Type: text/csv`, `Content-Disposition: attachment; filename="jeda_export_<access_code>.csv"`

