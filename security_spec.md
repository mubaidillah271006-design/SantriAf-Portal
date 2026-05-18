# Security Specification - SantriAf

## Data Invariants
1. A Santri must have a unique NIS.
2. Absensi and Pelanggaran records must point to an existing Santri ID.
3. Financial transactions (top-up, denda payment) must update the Santri's saldo correctly.
4. Only authorized administrators can modify Santri, Absensi, Pelanggaran, and Info data.
5. Wali Santri can only access data related to their own santri (identified by Wali HP).

## The Dirty Dozen Payloads
1. **NIS Spoofing:** Create a santri with an existing NIS.
2. **Saldo Injection:** Update a santri's saldo to 9,999,999 without a transaction.
3. **Orphaned Absensi:** Create an absensi record for a non-existent santri ID.
4. **Unauthorized Info:** A non-admin user creating or deleting an announcement.
5. **PII Leak:** An unauthenticated user listing all santri with their Wali HP.
6. **Negative Denda:** Creating a violation with a negative denda.
7. **Negative Saldo:** Updating a santri with a negative saldo.
8. **Impersonation:** Deleting another admin's announcements.
9. **Bulk Deletion:** Attempting to delete the entire santri collection.
10. **Shadow Fields:** Adding "isAdmin: true" to a santri document.
11. **Timestamp Poisoning:** Setting a future date for an absensi record.
12. **Status Bypass:** Marking a denda as "Lunas" without decreasing saldo.

## Security Rules Implementation Strategy
1. **Default Deny:** `match /{document=**} { allow read, write: if false; }`
2. **Admin Verification:** Use a dedicated `admins` collection where only authenticated uids in that collection can write.
3. **Wali Access:** For now, since Wali is unauthenticated in Firebase Auth, we will allow read access to `santri`, `absensi`, and `pelanggaran` but strictly via ID lookups or filtered listings. Note: This is a pivot point for improvement (recommend Firebase Auth).
4. **Schema Validation:** Every write must pass `isValidSantri()`, `isValidAbsensi()`, etc.

## Test Runner (Checklist)
- [ ] Deny unauthenticated writes.
- [ ] Deny writes that violate schema (e.g. missing required fields).
- [ ] Deny updates to immutable fields (e.g. createdAt).
- [ ] Enforce max size for strings and lists.
