# IRILLIC Website & CMS — Deployment Requirements

**For:** the client's IT / infrastructure team
**Purpose:** everything that must be provisioned and handed over before the IRILLIC website and administration panel can be deployed to the client's own AWS account.

Nothing in this document requires the application team's involvement. Once the items below are in place and the access details are returned, deployment and go-live can be completed in a single session.

---

## 1. What is being deployed

A Next.js 16 application that serves two things from one process:

- the public IRILLIC website (marketing pages, product pages, clinical content, enquiry form)
- a private administration panel at `/dashboard`, where staff edit every page, upload media and read enquiries

It is backed by a PostgreSQL database and stores uploaded files on the server's own disk. There is no third-party CMS, no external API and no licensing cost.

---

## 2. Compute — EC2 instance

| Item             | Requirement                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| Instance type    | **t3.medium recommended** (2 vCPU / 4 GB RAM). t3.small (2 GB) is the absolute minimum and will be tight on builds. |
| Operating system | Ubuntu Server 22.04 LTS or 24.04 LTS, 64-bit (x86_64)                                                               |
| Storage          | **30 GB gp3** minimum, on a volume that is **not** deleted on instance termination                                  |
| Region           | Closest to the primary audience — `ap-south-1` (Mumbai) recommended                                                 |

**Why 4 GB RAM:** the production build compiles the whole site in one pass, and images are re-encoded on upload. On a 2 GB instance the build can be killed by the kernel when the database is running alongside it.

**Why the storage note matters:** all media uploaded through the panel — product images, PDFs, brochures, video — is written to the server's disk at `public/uploads`. That directory must survive reboots and must be included in backups. It is not stored in the database and is not in the source code.

---

## 3. Database — PostgreSQL

Either option works. Please confirm which one you prefer.

### Option A — Amazon RDS for PostgreSQL (recommended)

| Item              | Requirement                                                               |
| ----------------- | ------------------------------------------------------------------------- |
| Engine version    | PostgreSQL 14 or newer                                                    |
| Instance class    | db.t4g.micro is sufficient to start                                       |
| Storage           | 20 GB gp3, autoscaling enabled                                            |
| Availability      | Single-AZ is acceptable; Multi-AZ if the client's policy requires it      |
| Automated backups | Enabled, 7-day retention minimum                                          |
| Network           | Private subnet, reachable **only** from the EC2 instance's security group |

### Option B — PostgreSQL installed on the same EC2 instance

Lower cost, but backups become the client's manual responsibility. If this is chosen, no action is needed beyond the EC2 instance itself.

**What we need handed over for Option A:**

- Database endpoint (hostname) and port
- Database name
- Application user name and password (a dedicated user, not the master user)
- Confirmation that the EC2 security group can reach it

---

## 4. Networking and access

| Item                      | Requirement                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Elastic IP                | One, associated with the EC2 instance, so the address does not change on reboot                                        |
| Security group — inbound  | `80/tcp` and `443/tcp` open to the internet. `22/tcp` open **only** to the client's office IP range or a bastion host. |
| Security group — outbound | Allow `443/tcp` (package downloads) and the SMTP port in section 6                                                     |
| Database access           | Reachable from the EC2 security group only — never from the public internet                                            |

**SSH access we need:** a `.pem` key pair and the user name to connect with (usually `ubuntu`). If the client's policy forbids sharing a private key, AWS Systems Manager Session Manager is an acceptable alternative — please say so and enable it on the instance.

---

## 5. Domain and certificate

| Item            | Requirement                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain          | The final public domain, e.g. `www.irillic.com`, and whether the bare `irillic.com` should redirect to it                                                              |
| DNS             | An `A` record pointing the domain at the Elastic IP, plus `www` if used. Either give us access to the DNS zone, or create the records yourself once we confirm the IP. |
| TLS certificate | We install a free Let's Encrypt certificate with automatic renewal unless the client requires their own. If so, send the certificate chain and private key.            |

**Please note:** the public domain must be decided **before** deployment, not after. It is compiled into the application at build time — changing it later means a rebuild, not a configuration edit. A wrong value breaks password-reset links and the links inside notification emails.

---

## 6. Email (SMTP)

The site sends two kinds of mail: enquiry notifications to the sales inbox, and password-reset links to staff. Without SMTP the site still works, but no mail leaves it and staff cannot recover a forgotten password.

Please provide working SMTP credentials:

- Host and port (`587` with STARTTLS is typical; `465` for implicit TLS)
- Username and password
- The **From** address mail should be sent as, e.g. `no-reply@irillic.com`
- The address enquiry notifications should be delivered **to**

Any provider is fine — Amazon SES, Microsoft 365, Google Workspace or the client's own mail server. If Amazon SES is chosen, note that a new SES account starts in sandbox mode and can only send to verified addresses; **production access must be requested from AWS in advance**, as approval can take a day or more.

We also recommend adding SPF and DKIM records for the sending domain so notification mail is not filtered as spam.

---

## 7. Software installed on the instance

We install and configure all of this during deployment. It is listed so the client's team knows what will be present:

- Node.js 20 LTS or newer (development and testing use Node 24)
- PM2, to keep the application running and restart it on reboot
- nginx, as the reverse proxy in front of the application
- Certbot, for the TLS certificate and its renewal
- PostgreSQL client tools, for backups

One nginx setting is worth flagging because its default silently breaks uploads: `client_max_body_size` must be raised to at least **25 MB**. The panel accepts video up to 20 MB, and nginx's 1 MB default would reject the upload before the application ever sees it.

---

## 8. Backups

Two things must be backed up. Either is useless without the other.

1. **The database** — all page content, users, enquiries and settings. Covered automatically by RDS automated backups (Option A). On Option B we configure a nightly `pg_dump`.
2. **The uploads directory** (`public/uploads`) — every image, PDF and video added through the panel. This is **not** in the database and **not** in the source code.

Please confirm the client's preferred retention period and whether backups should be copied to an S3 bucket. If so, provide the bucket name and an IAM role or user with write access to it.

---

## 9. Decisions and credentials to return

Please send the following. Items marked **before deployment** block the work; the rest can follow.

| #   | Item                                                                            | When              |
| --- | ------------------------------------------------------------------------------- | ----------------- |
| 1   | EC2 instance provisioned, with its public Elastic IP                            | Before deployment |
| 2   | SSH private key (`.pem`) and user name, or SSM access                           | Before deployment |
| 3   | Database choice (RDS or on-instance) and, for RDS, its endpoint and credentials | Before deployment |
| 4   | Final public domain name, and who controls DNS                                  | Before deployment |
| 5   | SMTP host, port, username, password and From address                            | Before go-live    |
| 6   | The email address enquiries should be delivered to                              | Before go-live    |
| 7   | Name and email address of the first administrator account                       | Before go-live    |
| 8   | Whether the client supplies their own TLS certificate                           | Before go-live    |
| 9   | Backup retention policy, and S3 bucket if backups are to be copied there        | After go-live     |

**On credentials:** please send passwords and the SSH key through a channel separate from this document — a password manager share or an encrypted message, not email with the document attached.

---

## 10. What happens after the handover

1. We install the runtime, deploy the code and create the database schema.
2. We seed the initial content and create the first administrator account.
3. We configure nginx, issue the TLS certificate and point the domain at it.
4. We configure SMTP in the panel and send a test message to confirm delivery.
5. We hand over the panel URL and a short walkthrough for the staff who will edit the site.

Expected duration once everything in section 9 is in hand: **one working day**, excluding DNS propagation and any wait for Amazon SES production access.

---

## 11. Ongoing costs the client should expect

Charged by AWS directly, not by us. Approximate, for `ap-south-1`:

| Item                                   | Approximate monthly cost |
| -------------------------------------- | ------------------------ |
| EC2 t3.medium, on-demand               | USD 30–35                |
| 30 GB gp3 storage                      | USD 3                    |
| RDS db.t4g.micro + 20 GB (if Option A) | USD 15–20                |
| Elastic IP (while associated)          | No charge                |
| Data transfer out                      | Usually under USD 5      |

A one-year Savings Plan or Reserved Instance reduces the EC2 and RDS figures substantially if the client is willing to commit.

---

## 12. Questions

If anything here conflicts with the client's internal policy — particularly around SSH key sharing, private subnets or certificate management — tell us what the policy requires and we will adapt. None of the choices above are fixed except the need for persistent storage for uploads and a domain decided before the build.
