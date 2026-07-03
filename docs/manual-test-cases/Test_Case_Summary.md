# EMS Test Case Summary

**Project:** Employee Management System  
**Date:** 2026-06-30  
**Prepared by:** QA Review (Claude Code)

---

## 1. Total Test Cases

| Metric | Count |
|---|---|
| **Total Test Cases** | **179** |
| Pass | 0 |
| Fail | 0 |
| Blocked | 0 |
| Not Run | 179 |
| Pass Rate | 0% |

---

## 2. Count by Module

| Module | Prefix | Count |
|---|---|---|
| Authentication | TC-AUTH | 22 |
| Dashboard | TC-DASH | 15 |
| Employee List / View / Delete | TC-EMP | 20 |
| Add Employee Form | TC-AE | 32 |
| Edit Employee Form | TC-EE | 12 |
| Attendance | TC-ATT | 25 |
| Departments | TC-DEPT | 18 |
| UI / UX Global | TC-UI | 20 |
| Security | TC-SEC | 15 |
| **Total** | | **179** |

> Note: TC-AE-001 to TC-AE-048 exist in the original Add Employee Excel sheet. The new cases in this document start from TC-AE-049 to avoid duplication.

---

## 3. Count by Priority

| Priority | Count | % of Total |
|---|---|---|
| Critical | 54 | 30% |
| High | 84 | 47% |
| Medium | 39 | 22% |
| Low | 2 | 1% |
| **Total** | **179** | 100% |

---

## 4. Count by Test Type

| Test Type | Count |
|---|---|
| Positive | 61 |
| Negative | 58 |
| Permission | 22 |
| Security | 15 |
| UI/UX | 14 |
| Regression | 9 |
| Boundary | 8 |
| Accessibility | 2 |
| **Total** | **179** |

---

## 5. Known Bugs Documented in Test Cases (RESOLVED)

These bugs were found during code inspection and confirmed by automated tests. All have been fixed in `BackEnd/src/middleware/validate.ts`.

| TC ID | Bug Description | Severity | Status |
|---|---|---|---|
| TC-AE-061 | First name accepts numbers only (e.g. "2223") — backend only checks empty, not format | High | Fixed |
| TC-AE-062 | Last name accepts numbers only — same root cause as above | High | Fixed |
| TC-AE-063 | First name accepts mixed letters+numbers (e.g. "Ali123") | High | Fixed |
| TC-AE-069 | Join date accepts wrong format (e.g. "15-01-2024") — no YYYY-MM-DD validation | High | Fixed |
| TC-AE-070 | Join date accepts any string — "January 15" passes backend validation | High | Fixed |
| TC-AE-058 | Phone accepts alphabetic characters — no phone validation at all | Medium | Fixed |
| TC-AE-059 | Phone accepts any length — no minimum length check | Medium | Fixed |
| TC-AE-060 | Phone accepts any length — no maximum length check | Medium | Fixed |
| TC-DEPT-013 | Deleting a department silently unassigns all its employees — no blocking or strong warning | Medium | Verified — frontend already shows a confirmation modal with affected employee count |

**Root cause of name/date bugs:** `validate.ts` only called `.trim()` to check if empty. It applied no regex for format or content.
**Fix applied:** Added `NAME_PATTERN = /^[A-Za-z\s'-]+$/` for `firstName`/`lastName`, `JOIN_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/` for `joinDate`, and a new `phone` check (`/^[0-9+\-\s()]+$/` plus a 7–15 digit length range), mirroring the validation already present client-side in `FrontEnd/components/employees/EmployeeForm.tsx`. Covered by `BackEnd/src/__tests__/validate.test.ts` (57/57 backend tests passing).

---

## 6. Suggested Execution Order

Execute in this order to catch blockers early and avoid cascading failures:

### Phase 1 — Foundation (Run First)
These must pass before testing anything else:

1. TC-AUTH-001 — Login page loads
2. TC-AUTH-002 — Super admin login
3. TC-AUTH-003 — Employee login
4. TC-AUTH-014 — Logout works
5. TC-AUTH-016 — Session restores on reload

### Phase 2 — Core CRUD
6. TC-DEPT-001 to TC-DEPT-003 — Department list + create (needed for employee tests)
7. TC-AE-050 — Create employee (needed for most other tests)
8. TC-EMP-001 — Employee list loads
9. TC-EMP-013 — Employee profile
10. TC-EE-001 to TC-EE-002 — Edit employee
11. TC-EMP-015 to TC-EMP-017 — Delete employee

### Phase 3 — Attendance
12. TC-ATT-001 to TC-ATT-009 — Mark attendance and upsert behavior
13. TC-ATT-010 to TC-ATT-013 — Navigation and filters
14. TC-ATT-016 to TC-ATT-018 — Employee self-service

### Phase 4 — Validation & Negative Cases
15. TC-AUTH-004 to TC-AUTH-012 — Login failures
16. TC-AE-051 to TC-AE-080 — Add Employee validations (including bug cases)
17. TC-DEPT-005 to TC-DEPT-010 — Department validations
18. TC-ATT-021 to TC-ATT-024 — Attendance validations

### Phase 5 — Permissions & Security
19. TC-AUTH-019 to TC-AUTH-021 — Route guard redirects
20. TC-EMP-019, TC-ATT-025, TC-DEPT-016 — Role access
21. TC-SEC-001 to TC-SEC-015 — Security cases

### Phase 6 — UI, Regression & Dashboard
22. TC-DASH-001 to TC-DASH-015 — Dashboard
23. TC-UI-001 to TC-UI-020 — UI/UX
24. TC-DASH-008, TC-DASH-009, TC-AE-080, TC-EMP-017 — Regression cases

---

## 7. Automation Priorities

### 7a. Automate First — Playwright / Selenium (End-to-End Browser Tests)

These tests simulate a real user in a real browser. They are highest value because they test the full stack together.

| Priority | Test Cases | Why Automate |
|---|---|---|
| 1 | TC-AUTH-002, 003, 004-012, 014-021 | Login/logout/redirect flows are triggered on every deploy |
| 2 | TC-AE-050-056, 061-070, 078-080 | Form validation + submit is the most-used flow in the app |
| 3 | TC-SEC-008-012 | Route guard — critical security, easy to automate with Playwright |
| 4 | TC-EMP-015-017 | Delete with cascade — catch regressions after DB changes |
| 5 | TC-ATT-003-009, 016-017 | Attendance marking + role enforcement — runs daily |

**Suggested Playwright test files:**
```
e2e/
├── auth.spec.ts         ← TC-AUTH-002 to TC-AUTH-021
├── addEmployee.spec.ts  ← TC-AE-050 to TC-AE-080
├── security.spec.ts     ← TC-SEC-008 to TC-SEC-015
├── attendance.spec.ts   ← TC-ATT-001 to TC-ATT-025
└── departments.spec.ts  ← TC-DEPT-001 to TC-DEPT-018
```

---

### 7b. Automate Second — Jest + Supertest (Backend API Tests)

These tests call the Express API directly. No browser needed. Fast and reliable.

| Priority | Test Cases | Endpoint |
|---|---|---|
| 1 | TC-AUTH-004-012, 022 | POST /api/auth/login, POST /api/auth/set-password |
| 2 | TC-AE-051-056, 061-070 | POST /api/employees (validation) |
| 3 | TC-ATT-021-023 | POST /api/attendance (validation) |
| 4 | TC-DEPT-005-008 | POST /api/departments (validation) |
| 5 | TC-SEC-013, TC-SEC-014 | Auth middleware + role middleware |
| 6 | TC-EMP-014, TC-EE-012 | passwordHash never in response |

**Existing test files to extend:**
```
BackEnd/src/__tests__/
├── controllers/authController.test.ts    ← Already has 11 tests — extend with TC-AUTH-022
├── controllers/employeeController.test.ts ← Already has 11 tests — extend with TC-AE-061-070
├── middleware/validate.test.ts           ← Add format validation cases
├── middleware/authenticate.test.ts       ← Covers TC-SEC-013
└── middleware/requireRole.test.ts        ← Covers TC-SEC-014
```

---

### 7c. Automate Third — Jest + React Testing Library (Component Tests)

These test individual React components in isolation. Best for form validation feedback.

| Priority | Test Cases | Component |
|---|---|---|
| 1 | TC-AE-051-065 (frontend validation) | EmployeeForm.tsx |
| 2 | TC-UI-013-017 | Button.tsx, Input.tsx, forms |
| 3 | TC-EMP-003-006 (search) | EmployeeTable.tsx |
| 4 | TC-EMP-018 (status badge colors) | StatusBadge.tsx |
| 5 | TC-UI-002 (active sidebar) | Sidebar.tsx |

---

### 7d. Leave for Manual Testing

These are harder to automate and better verified by a human tester:

| Test Cases | Reason |
|---|---|
| TC-UI-006 to TC-UI-012 (themes, responsive) | Visual inspection needed |
| TC-UI-019 (keyboard navigation) | Accessibility tools better suited |
| TC-SEC-001-005 (XSS visual check) | Need to observe browser behavior |
| TC-DASH-007 (recent activity) | Depends on audit logging feature |
| TC-AE-077 (cancel with unsaved changes) | UX behavior not yet defined |
| TC-AE-071 (future date rule) | Business rule not yet documented |

---

## 8. Test Environment Requirements

| Requirement | Details |
|---|---|
| Super admin account | Email + password set via setup script |
| Employee account | Created by super_admin with password set |
| At least 1 department | Required for Add Employee form |
| At least 11 employees | Required for pagination tests (TC-EMP-010) |
| Employee with attendance | Required for TC-ATT-008, TC-EMP-017 |
| Test database | `employee_management_test` (separate from production) |
| Browser DevTools | For TC-EMP-014, TC-EE-012, TC-SEC-013 (inspect network) |
| Postman or curl | For TC-SEC-013, TC-SEC-014, TC-ATT-021-023 (direct API calls) |

---

## 9. Files in This Directory

| File | Purpose |
|---|---|
| `EMS_Manual_Test_Cases.md` | Full test cases in readable Markdown format |
| `EMS_Manual_Test_Cases.csv` | Same test cases importable into Google Sheets / Excel |
| `Test_Case_Summary.md` | This file — summary, counts, automation guide |
