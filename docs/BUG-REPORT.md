# Hardening bug report

All issues below were reproduced and fixed with regression coverage.

| Area              | Reproduced defect                                                                      | Resolution                                                                            |
| ----------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| CMS seed          | Re-running seed overwrote administrator-edited content                                 | Seed now inserts only missing records; a merge-only backfill preserves existing edits |
| CMS update        | Partial edits inherited create defaults and attempted to unpublish core pages          | Dedicated update schema has no injected defaults                                      |
| CMS errors        | Duplicate slugs and invalid UUIDs returned generic 500 responses                       | Deterministic 409 conflict and 400 validation responses                               |
| Core content      | Clinical application/resource pages could be deleted or unpublished                    | Both pages added to immutable core-page safeguards                                    |
| Dynamic content   | Clinical UI copy, filters, evidence notes and contact form copy remained in components | Moved into validated page content and backfilled into PostgreSQL                      |
| Admin editing UX  | Pages were edited through one raw JSON textarea                                        | Replaced by normalized page sections and visual page/section tabs                     |
| Home structure    | Multiple Home sections appeared inside one combined content object                     | Split each Home content area into an independently managed section tab                |
| Section safety    | Removing a required content block could break a public page                            | Candidate content is schema-validated before update, visibility or deletion commits   |
| Link security     | CMS links accepted `javascript:` and protocol-relative URLs                            | Safe URL allow-list validation added                                                  |
| Login bootstrap   | Requested weak temporary password could not pass the HTML login constraint             | Temporary login allowed only with mandatory first-login password replacement          |
| Forced password   | Temporary credentials could access CMS APIs                                            | Admin API guard returns 403 until a strong password is set                            |
| Single admin      | Old administrator could remain after account replacement                               | Transactional configuration deletes sessions, reset tokens and all other users        |
| Password reset    | Reset password only checked length                                                     | Same uppercase/lowercase/number/symbol policy as authenticated password change        |
| Password recovery | SMTP failure disclosed that an email account existed                                   | Identical response for known/unknown accounts; mail failure is not exposed            |
| Password recovery | Unlimited reset requests/tokens                                                        | Per-IP rate limit and one active token per user                                       |
| Enquiry spam      | Honeypot schema rejected bots before silent handling                                   | Honeypot payload now receives a neutral success without storage                       |
| Client IP         | Arbitrary forwarded header could exceed DB limits and bypass stable handling           | Only valid IPv4/IPv6 values are stored; otherwise `unknown`                           |
| Uploads           | Corrupt images produced 500; PDF/MP4 MIME could be spoofed                             | Corrupt images return 400 and document signatures are verified                        |
| Deployment        | Production build depended on live Google Fonts download                                | Network-independent font stack removes build-time external dependency                 |
| Formatting        | Invalid leading character in `.prettierrc` broke formatting commands                   | Configuration repaired                                                                |

No automated suite can prove that future code will contain zero defects. The maintained regression suite is the control that prevents these reproduced defects from returning.
