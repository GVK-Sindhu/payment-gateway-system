# Payment Gateway with Asynchronous Processing

## Overview

This project is a **production-style payment gateway system** built using modern backend engineering patterns.
It extends a basic payment gateway into a **scalable, asynchronous, and event-driven architecture** using background job queues, webhook delivery with retries, idempotent APIs, refund management, and an embeddable checkout SDK.

The system demonstrates real-world patterns used by payment platforms such as **Stripe, Razorpay, and PayPal**, including:

* Asynchronous payment and refund processing
* Reliable webhook delivery with retry logic
* Secure HMAC-based webhook verification
* Redis-backed job queues with worker services
* Dockerized multi-service deployment

---

## System Architecture

**High-level components:**

* **API Service** – Handles authenticated payment, order, refund, and webhook APIs
* **Worker Service** – Processes background jobs (payments, refunds, webhooks)
* **PostgreSQL** – Persistent storage for payments, refunds, webhooks, idempotency keys
* **Redis** – Job queue backend
* **Dashboard** – Merchant-facing UI for configuration and logs
* **Checkout Page & SDK** – Embeddable JavaScript checkout widget

 *All services are orchestrated using Docker Compose.*

---

## Technology Stack

* **Backend:** Node.js, Express
* **Queue System:** Redis + BullMQ
* **Database:** PostgreSQL
* **Workers:** Dedicated Node.js worker service
* **Frontend:** HTML/CSS/JavaScript
* **SDK Bundling:** Webpack
* **Containerization:** Docker & Docker Compose

---

## Setup Instructions

### Prerequisites

* Docker
* Docker Compose
* curl (for API testing)

### Start the Application

```bash
docker-compose up -d
```

This starts:

* API server → `http://localhost:8000`
* Dashboard → `http://localhost:3000`
* Checkout page & SDK → `http://localhost:3001`
* Redis → `6379`
* PostgreSQL → `5432`

---

## Health Check

Verify the system is running:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## Authentication

All protected APIs require the following headers:

```
X-Api-Key: key_test_abc123
X-Api-Secret: secret_test_xyz789
```

---

## API Endpoints

### Create Order

```http
POST /api/v1/orders
```

**Request Body**

```json
{
  "amount": 500,
  "currency": "INR"
}
```

---

### Create Payment (Async)

```http
POST /api/v1/payments
```

**Headers**

```
Idempotency-Key: unique_key_123
```

**Request Body**

```json
{
  "order_id": "order_xxxxx"
}
```

Payments are created with status **`pending`** and processed asynchronously by workers.

---

### Refund Payment (Async)

```http
POST /api/v1/payments/{payment_id}/refunds
```

**Request Body**

```json
{
  "amount": 500,
  "reason": "Customer requested refund"
}
```

Refunds are processed asynchronously via background workers.

---

## Asynchronous Job Processing

* Payments, refunds, and webhooks are handled using **Redis-based job queues**
* Dedicated worker service processes jobs independently
* Supports retry logic and failure handling
* Ensures API responsiveness and scalability

---

## Job Queue Status (Evaluation Endpoint)

```http
GET /api/v1/jobs/status
```

**Response**

```json
{
  "waiting": 0,
  "active": 0,
  "completed": 0,
  "failed": 0
}
```

This endpoint provides visibility into background job processing.

---

## Webhook System

### Features

* Event-driven webhook delivery for:

  * `payment.success`
  * `payment.failed`
  * `refund.processed`
* Secure **HMAC-SHA256** signature verification
* Automatic retry logic (up to 5 attempts)
* Database-backed retry scheduling using `next_retry_at`
* Manual retry from dashboard

### Signature Verification Example

```js
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature === expected;
}
```

---

## Webhook Retry Logic

**Production Retry Schedule**

1. Immediate
2. After 1 minute
3. After 5 minutes
4. After 30 minutes
5. After 2 hours

**Test Mode**

```env
WEBHOOK_RETRY_INTERVALS_TEST=true
```

Test retries complete within seconds for evaluation.

---

## Embeddable JavaScript SDK

Merchants can embed the checkout using:

```html
<script src="http://localhost:3001/checkout.js"></script>
<script>
  const checkout = new PaymentGateway({
    key: 'key_test_abc123',
    orderId: 'order_xxx',
    onSuccess: (res) => console.log(res),
    onFailure: (err) => console.error(err)
  });

  checkout.open();
</script>
```

### SDK Features

* Modal-based checkout (iframe)
* Cross-origin communication via `postMessage`
* No redirects
* Clean close & callback handling

---

## Dashboard Features

* Webhook configuration
* Webhook secret management
* Webhook delivery logs
* Manual webhook retry
* API integration documentation

---

## Testing Instructions

* Start services using `docker-compose up -d`
* Use `curl` to test API endpoints
* Observe background processing via `/api/v1/jobs/status`
* Configure webhook URL and observe retries via logs

---

## Project Highlights

* Fully Dockerized multi-service architecture
* Reliable async processing using Redis queues
* Secure webhook delivery with retries
* Idempotent payment APIs
* Production-inspired system design

---

## Conclusion

This project demonstrates the design and implementation of a **resilient, scalable payment gateway** using modern backend engineering practices.
It emphasizes reliability, asynchronous processing, and real-world system design patterns.

