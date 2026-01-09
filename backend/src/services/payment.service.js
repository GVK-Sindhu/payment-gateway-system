// import pool from "../db/pool.js";

// /**
//  * INTERNAL PAYMENT CREATION
//  * Used by PUBLIC checkout flow (no merchant auth)
//  */
// export const createPaymentInternal = async ({ order, method, vpa, card }) => {
//   const paymentId = `pay_${Math.random().toString(36).substring(2, 18)}`;

//   const status = "success"; // Deliverable-1: deterministic success

//   await pool.query(
//     `
//     INSERT INTO payments (id, order_id, amount, currency, method, status)
//     VALUES ($1, $2, $3, $4, $5, $6)
//     `,
//     [
//       paymentId,
//       order.id,
//       order.amount,
//       order.currency,
//       method,
//       status
//     ]
//   );

//   return {
//     id: paymentId,
//     order_id: order.id,
//     amount: order.amount,
//     currency: order.currency,
//     method,
//     status,
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   };
// };

// /**
//  * AUTHENTICATED MERCHANT PAYMENT CREATION
//  */
// export const createPayment = async ({ order, method, vpa, card }) => {
//   return createPaymentInternal({ order, method, vpa, card });
// };

// /**
//  * GET PAYMENT BY ID
//  */
// export const getPaymentById = async (paymentId) => {
//   const { rows } = await pool.query(
//     "SELECT * FROM payments WHERE id = $1",
//     [paymentId]
//   );

//   return rows[0];
// };

import pool from "../db/pool.js";

/**
 * INTERNAL PAYMENT CREATION (Public checkout)
 */
export const createPaymentInternal = async ({ order_id, method, vpa, card }) => {
  // 1. Fetch order + merchant
  const { rows } = await pool.query(
    "SELECT id, amount, currency, merchant_id FROM orders WHERE id = $1",
    [order_id]
  );

  if (rows.length === 0) {
    throw new Error("Order not found");
  }

  const order = rows[0];

  // 2. Generate payment id
  const paymentId = `pay_${Math.random().toString(36).substring(2, 18)}`;

  // Deliverable-1 deterministic success
  const status = "success";

  // 3. Insert payment WITH merchant_id ✅
  await pool.query(
    `
    INSERT INTO payments (
      id,
      order_id,
      merchant_id,
      amount,
      currency,
      method,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      paymentId,
      order.id,
      order.merchant_id,
      order.amount,
      order.currency,
      method,
      status
    ]
  );

  return {
    id: paymentId,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    method,
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};
