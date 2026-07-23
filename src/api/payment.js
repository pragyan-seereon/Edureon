

// // import api from "./axios"; // <-- match the import used in studentFeeDue.js / feeStructure.js
 
// // export const createPaymentOrder = (payload) =>
// //   api.post("/payments/create-order", payload);
 
// // export const verifyPayment = (payload) =>
// //   api.post("/payments/verify", payload);


// // export const collectOfflineFee = async (data) => {
// //   const res = await api.post("/payments/offline", data);
// //   return res.data;
// // };


// // export const getMonthlyDue = async (student_uuid, fee_month) => {
// //   const res = await api.get("/payments/monthly", {
// //     params: {
// //       student_uuid,
// //       fee_month,
// //     },
// //   });

// //   return res.data;
// // };


// // export const updatePayment = async (transaction_uuid, data) => {
// //   const res = await api.put(
// //     `/payments/${transaction_uuid}`,
// //     data
// //   );

// //   return res.data;
// // };


// // export const getPayment = async (transaction_uuid) => {
// //   const res = await api.get(`/payments/${transaction_uuid}`);
// //   return res.data;
// // };


// // export const deletePayment = async (transaction_uuid, data) => {
// //   const res = await api.delete(`/payments/${transaction_uuid}`, {
// //     data,
// //   });

// //   return res.data;
// // };

// // export const restorePayment = async (transaction_uuid) => {
// //   const res = await api.put(
// //     `/payments/${transaction_uuid}/restore`
// //   );

// //   return res.data;
// // };



// // src/api/payment.js

// import api from "./axios";
// import useAuthStore from "../store/authStore";

// // =====================================================
// // Headers
// // =====================================================

// const getHeaders = () => {
//   const { instituteUUID } = useAuthStore.getState();

//   return {
//     "X-Institute-UUID": instituteUUID,
//   };
// };

// // =====================================================
// // Create Razorpay Order
// // POST /payments/create-order
// // =====================================================

// export const createPaymentOrder = (payload) =>
//   api.post("/payments/create-order", payload, {
//     headers: getHeaders(),
//   });

// // =====================================================
// // Verify Razorpay Payment
// // POST /payments/verify
// // =====================================================

// export const verifyPayment = (payload) =>
//   api.post("/payments/verify", payload, {
//     headers: getHeaders(),
//   });

// // =====================================================
// // Collect Offline Fee
// // POST /payments/offline
// // =====================================================

// export const collectOfflineFee = async (data) => {
//   const res = await api.post("/payments/offline", data, {
//     headers: getHeaders(),
//   });

//   return res.data;
// };

// // =====================================================
// // Get Monthly Due
// // GET /payments/monthly
// // =====================================================

// export const getMonthlyDue = async (
//   student_uuid,
//   fee_month
// ) => {
//   const res = await api.get("/payments/monthly", {
//     params: {
//       student_uuid,
//       fee_month,
//     },
//     headers: getHeaders(),
//   });

//   return res.data;
// };

// // =====================================================
// // Update Payment
// // PUT /payments/{transaction_uuid}
// // =====================================================

// export const updatePayment = async (
//   transaction_uuid,
//   data
// ) => {
//   const res = await api.put(
//     `/payments/${transaction_uuid}`,
//     data,
//     {
//       headers: getHeaders(),
//     }
//   );

//   return res.data;
// };

// // =====================================================
// // Get Payment By UUID
// // GET /payments/{transaction_uuid}
// // =====================================================

// export const getPayment = async (
//   transaction_uuid
// ) => {
//   const res = await api.get(
//     `/payments/${transaction_uuid}`,
//     {
//       headers: getHeaders(),
//     }
//   );

//   return res.data;
// };

// // =====================================================
// // Delete Payment
// // DELETE /payments/{transaction_uuid}
// // =====================================================

// export const deletePayment = async (
//   transaction_uuid,
//   data
// ) => {
//   const res = await api.delete(
//     `/payments/${transaction_uuid}`,
//     {
//       data,
//       headers: getHeaders(),
//     }
//   );

//   return res.data;
// };

// // =====================================================
// // Restore Payment
// // PUT /payments/{transaction_uuid}/restore
// // =====================================================

// export const restorePayment = async (
//   transaction_uuid
// ) => {
//   const res = await api.put(
//     `/payments/${transaction_uuid}/restore`,
//     {},
//     {
//       headers: getHeaders(),
//     }
//   );

//   return res.data;
// };


import api from "./axios";
import useAuthStore from "../store/authStore";

// =====================================================
// Headers
// =====================================================

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// =====================================================
// Create Razorpay Order
// POST /payments/create-order
// =====================================================

export const createPaymentOrder = (payload) =>
  api.post("/payments/create-order", payload, {
    headers: getHeaders(),
  });

// =====================================================
// Verify Razorpay Payment
// POST /payments/verify
// =====================================================

export const verifyPayment = (payload) =>
  api.post("/payments/verify", payload, {
    headers: getHeaders(),
  });

// =====================================================
// Collect Offline Fee
// POST /payments/offline
// =====================================================

export const collectOfflineFee = async (data) => {
  const res = await api.post("/payments/offline", data, {
    headers: getHeaders(),
  });

  return res.data;
};

// =====================================================
// Get Custom Collection Details
// GET /payments/custom-collection/{student_uuid}
// =====================================================

export const getCustomCollectionDetails = async (
  student_uuid,
  institute_uuid
) => {
  const res = await api.get(
    `/payments/custom-collection/${student_uuid}`,
    {
      params: {
        institute_uuid,
      },
      headers: getHeaders(),
    }
  );

  return res.data;
};

// =====================================================
// Get Monthly Due
// GET /payments/monthly
// =====================================================

export const getMonthlyDue = async (
  student_uuid,
  fee_month
) => {
  const res = await api.get("/payments/monthly", {
    params: {
      student_uuid,
      fee_month,
    },
    headers: getHeaders(),
  });

  return res.data;
};

// =====================================================
// Update Payment
// PUT /payments/{transaction_uuid}
// =====================================================

export const updatePayment = async (
  transaction_uuid,
  data
) => {
  const res = await api.put(
    `/payments/${transaction_uuid}`,
    data,
    {
      headers: getHeaders(),
    }
  );

  return res.data;
};

// =====================================================
// Get Payment By UUID
// GET /payments/{transaction_uuid}
// =====================================================

export const getPayment = async (
  transaction_uuid
) => {
  const res = await api.get(
    `/payments/${transaction_uuid}`,
    {
      headers: getHeaders(),
    }
  );

  return res.data;
};

// =====================================================
// Delete Payment
// DELETE /payments/{transaction_uuid}
// =====================================================

export const deletePayment = async (
  transaction_uuid,
  data
) => {
  const res = await api.delete(
    `/payments/${transaction_uuid}`,
    {
      data,
      headers: getHeaders(),
    }
  );

  return res.data;
};

// =====================================================
// Restore Payment
// PUT /payments/{transaction_uuid}/restore
// =====================================================

export const restorePayment = async (
  transaction_uuid
) => {
  const res = await api.put(
    `/payments/${transaction_uuid}/restore`,
    {},
    {
      headers: getHeaders(),
    }
  );

  return res.data;
};