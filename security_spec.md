# ZenPayroll AI Security Specification

## 1. Data Invariants
- An Employee record must have a valid salary structure.
- Payroll records are immutable once history is written.
- Only Admins and HR can manage employees.
- Employees can only read their own data (private profile/payslips).
- All writes must include server timestamps.

## 2. Dirty Dozen Payloads (Rejection Tests)
1. **Ghost Field Update**: Attempting to add `isAdmin: true` to an employee doc.
2. **Identity Spoofing**: Creating an employee with `id` of another user.
3. **Price Manipulation**: Setting `taxRate` to 0 via client-side write if it's supposed to be server-validated.
4. **Negative Salary**: Submitting a `basic` salary of -100.
5. **Orphaned Payroll**: Creating a payroll record for a non-existent employee ID.
6. **Cross-Tenant Access**: User A reading User B's private PII.
7. **Bypassing Verification**: Writing to `admins/` collection as a non-verified user.
8. **Resource Poisoning**: Uploading a 1MB string as an employee name.
9. **State Shortcutting**: Skipping the "processed" status in a multi-step payroll run.
10. **Shadow Key**: Adding `secret_bonus: 1000` to a payroll result.
11. **Invalid Status**: Setting status to 'fired' or any value outside 'active', 'inactive', 'on_leave'.
12. **Unauthorized Deletion**: HR deleting an Admin record.

## 3. Test Runner (Draft)
Verification will be performed against `DRAFT_firestore.rules`.
