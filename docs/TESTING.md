# IRILLIC testing

## Automated suites

```powershell
npm run test:unit
$env:TEST_ADMIN_EMAIL="administrator@example.com"
$env:TEST_ADMIN_PASSWORD="temporary-or-test-password"
npm run test:integration
npm run type-check
npm run lint
npm run build
```

Integration tests expect the local app at `http://localhost:3000`. Set `TEST_BASE_URL` to use another environment. Test content uses unique `integration-*` and `race-*` slugs and is removed automatically.

Coverage includes:

- CMS, enquiry, URL and file-signature validation
- anonymous access denial and forced-password-change authorization
- login and non-enumerating password recovery
- public route rendering and security headers
- CMS create/read/update/delete, duplicate and concurrent writes
- core page deletion/unpublish protection
- real admin edit to public-page rendering and restoration
- normalized page-section create, nested-field update, reorder, visibility and delete protection
- independent Home page section updates rendered on the live public page
- invalid identifiers, malformed payloads and honeypot spam
- corrupt/spoofed upload rejection
- concurrent database health requests

The sole administrator uses a temporary credential only for the first login. Until a strong password is selected, dashboard content is replaced by the password-change screen and all other admin APIs return `403 PASSWORD_CHANGE_REQUIRED`.
