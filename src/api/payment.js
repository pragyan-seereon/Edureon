// import api from "./axios";

// // --------------------------------------------
// // Create Razorpay Order
// // --------------------------------------------

// export const createOrder = (data) => {
//   return api.post(
//     "/payments/create-order",
//     data
//   );
// };

// // --------------------------------------------
// // Verify Razorpay Payment
// // --------------------------------------------

// export const verifyPayment = (data) => {
//   return api.post(
//     "/payments/verify",
//     data
//   );
// };



import api from "./axios"; // <-- match the import used in studentFeeDue.js / feeStructure.js
 
export const createPaymentOrder = (payload) =>
  api.post("/payments/create-order", payload);
 
export const verifyPayment = (payload) =>
  api.post("/payments/verify", payload);