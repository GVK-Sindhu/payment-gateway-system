# Payment Gateway – Deliverable 1

## Overview

This project implements the foundational components of a payment gateway similar to Razorpay or Stripe.  
It enables merchants to create payment orders via authenticated APIs and allows customers to complete payments through a hosted checkout page supporting UPI and Card payment methods.

The system is fully containerized using Docker and can be started with a single command.  
It demonstrates API authentication, payment validation logic, transaction lifecycle management, and user-facing payment interfaces.

---

## System Architecture

The system consists of four main components:

1. **Backend API (Port 8000)**
   - Handles merchant authentication
   - Order creation and retrieval
   - Payment processing and status management
   - Public endpoints for checkout flow
   - Database initialization and seeding

2. **PostgreSQL Database**
   - Stores merchants, orders, and payments
   - Automatically initialized and seeded on startup

3. **Merchant Dashboard (Port 3000)**
   - Login page for test merchant
   - Displays API credentials
   - Shows real-time transaction statistics
   - Lists all transactions

4. **Hosted Checkout Page (Port 3001)**
   - Accepts order_id as query parameter
   - Displays order summary
   - Supports UPI and Card payments
   - Shows processing, success, and failure states

Data Flow:
- Merchant creates an order via API
- Customer is redirected to hosted checkout page
- Checkout page uses public APIs to fetch order and create payment
- Payment status is persisted and reflected in dashboard

---

## Technology Stack

- Backend: Node.js, Express
- Database: PostgreSQL 15
- Frontend: HTML, CSS, Vanilla JavaScript
- Containerization: Docker, Docker Compose

---

## Project Structure

payment-gateway/
├── docker-compose.yml
├── README.md
├── .env.example
├── backend/
│ ├── Dockerfile
│ └── src/
│ ├── app.js
│ ├── server.js
│ ├── db/
│ ├── routes/
│ ├── controllers/
│ ├── services/
│ └── middlewares/
├── frontend/
│ ├── Dockerfile
│ ├── index.html (Login)
│ ├── dashboard.html
│ ├── transactions.html
│ ├── css/
│ └── checkout-page/
│ ├── index.html
│ └── styles.css

The dashboard and checkout interfaces are implemented using static HTML, CSS, and Vanilla JavaScript to ensure simplicity, fast loading, and compatibility with automated evaluation tools relying on `data-test-id` attributes.