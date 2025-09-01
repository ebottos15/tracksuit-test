# Extra for Experts (or Seniors)

Our eccentric investor promised us a briefcase of sequentially numbered USD
bills if we can scale “Insights.”\
Helicopter included. No pressure.

Below are my thoughts on how to evolve this tidy take-home into a platform that
20 engineers can collaborate on without losing their minds (or their weekends).

---

## 1. Collaboration

When a team grows from a handful of engineers to 20, the first challenge isn’t
technical scale — it’s **people tripping over each other**. A few things that
help:

- **Keep the monorepo, but set boundaries**\
  Client and server can live side-by-side in one repo, but each has its own
  deploy pipeline. Shared contracts (types, schemas) live in a single place so
  frontend and backend never drift apart.

- **Contracts first**\
  Define the API in schemas (OpenAPI) and generate clients for the frontend. No
  more guessing whether the server calls it `brandId` or `brand_id`.

- **Clear ownership and guardrails**\
  Add CODEOWNERS files, require reviews, and write down lightweight “rules of
  the road.” It avoids endless Slack debates later.

- **CI/CD as a teammate**\
  GitHub Actions runs linting, type checks, tests, and builds for every PR. Path
  filters make sure client and server are tested and deployed independently.
  Everyone gets fast feedback, nobody merges red builds.

- **Preview environments**\
  Every pull request spins up a temporary environment. Designers, PMs, and
  testers can click around without waiting for staging. Magic.

---

## 2. System Design Architecture

The current layering (routes → controllers → services → repositories) is a good
start. To evolve:

- **Versioned APIs**\
  Ship under `/api/v1` so we can change things later without breaking clients.

- **Business logic in services, not controllers**\
  Keeps controllers thin and reusable. Services handle validation, transactions,
  and rules.

- **Database with real constraints**\
  Graduate from SQLite to Postgres with strict constraints, indexes, and foreign
  keys. The database should prevent bad data, not just the app.

- **Multi-tenancy**\
  If multiple brands/clients will use this, enforce tenant scoping in every
  query.

- **Background jobs**\
  Add a job queue for heavy or slow work (processing, notifications). Not
  everything needs to block an HTTP request.

---

## 3. Infrastructure (AWS-flavoured)

If we really do get the helicopter money, here’s how I’d scale the infra:

- **Frontend** on S3 + CloudFront for global distribution.
- **API** behind an Application Load Balancer, running on ECS tasks (managed
  containers, no servers to babysit).
- **Database** on Amazon RDS or Aurora (Postgres) with backups, replicas, and
  monitoring.
- **Caching & queues** with ElastiCache (Redis) and SQS for background jobs.
- **Storage** in S3 for any large files, imports, or exports.
- **Secrets** in AWS Secrets Manager, not in environment files.
- **Infrastructure as Code** with Terraform, so environments (dev, staging,
  prod) are consistent.
- **Deployment strategy**: blue/green or canary deploys to reduce risk.

This setup keeps ops light while giving us headroom for heavier workloads.

---

## 4. Observability

Scaling isn’t just about handling more traffic — it’s about knowing what’s
happening when things go sideways.

- **Structured logging**\
  Every request gets a trace ID, user/tenant ID, and context. Logs are JSON, not
  random strings.

- **Metrics and dashboards**\
  Track latency, error rate, throughput, DB connections, and queue depth. Build
  RED (Rate, Errors, Duration) dashboards so we know if users are hurting.

- **Tracing**\
  Use AWS X-ray / Cloudwatch to connect frontend → API → DB → queues. When
  something is slow, we know where.

- **Alerts**\
  Only actionable alerts (nobody wants pager fatigue). Error budget burn alerts
  if we’re missing SLOs.

---

## 5. Future Features

Right now Insights is a neat CRUD app. With proper foundations, it could be a
**platform**:

- **Authentication & authorisation**\
  Add real login (Cognito/Auth0/etc.), roles, and permissions. Interns can add
  insights, companies can view and manage theirs.

- **Search and tagging**\
  Let users tag, filter, and search insights by brand, time, or keyword.

- **Notifications**\
  Email, Slack, or SMS when new insights are published or updated.

- **Bulk operations**\
  Import/export via CSV or Excel, with async processing behind the scenes.

- **Analytics dashboards**\
  Graphs and trends over time, helping companies see patterns across insights.

- **Audit log**\
  Show who changed what and when. Great for trust and compliance.

---

## Wrap-up

So:

- Collaboration scaffolding so 20 people can work without stepping on each
  other.
- A system design that keeps business logic clean and future-proof.
- AWS infrastructure that handles heavier workloads without heroics.
- Observability so problems are found before customers tweet about them.
- And a path from “add insights” to “a real insights platform.”

Now, about that helicopter full of USD bills… 🚁💼
