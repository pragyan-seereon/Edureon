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


export const collectOfflineFee = async (data) => {
  const res = await api.post("/payments/offline", data);
  return res.data;
};


export const getMonthlyDue = async (student_uuid, fee_month) => {
  const res = await api.get("/payments/monthly", {
    params: {
      student_uuid,
      fee_month,
    },
  });

  return res.data;
};


export const updatePayment = async (transaction_uuid, data) => {
  const res = await api.put(
    `/payments/${transaction_uuid}`,
    data
  );

  return res.data;
};


export const getPayment = async (transaction_uuid) => {
  const res = await api.get(`/payments/${transaction_uuid}`);
  return res.data;
};


export const deletePayment = async (transaction_uuid, data) => {
  const res = await api.delete(`/payments/${transaction_uuid}`, {
    data,
  });

  return res.data;
};

export const restorePayment = async (transaction_uuid) => {
  const res = await api.put(
    `/payments/${transaction_uuid}/restore`
  );

  return res.data;
};



