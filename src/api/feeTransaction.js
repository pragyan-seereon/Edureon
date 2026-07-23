// import api from "./axios";

// // =====================================================
// // Create Fee Transaction (Pay Fee)
// // POST /fee-transactions
// // =====================================================

// export const createFeeTransaction = async (data) => {
//   const res = await api.post("/fee-transactions", data);
//   return res.data;
// };

// // =====================================================
// // Get All Transactions
// // GET /fee-transactions
// // =====================================================

// export const getFeeTransactions = async ({
//   search = "",
//   academic_year = "",
//   payment_status = "",
//   page = 1,
//   page_size = 10,
// } = {}) => {
//   const res = await api.get("/fee-transactions", {
//     params: {
//       search,
//       academic_year,
//       payment_status,
//       page,
//       page_size,
//     },
//   });

//   return res.data;
// };

// // =====================================================
// // Get Transaction By UUID
// // GET /fee-transactions/{transaction_uuid}
// // =====================================================

// export const getFeeTransaction = async (transaction_uuid) => {
//   const res = await api.get(
//     `/fee-transactions/${transaction_uuid}`
//   );

//   return res.data;
// };

// // =====================================================
// // Student Transaction History
// // GET /fee-transactions/student/{student_uuid}
// // =====================================================

// export const getStudentTransactions = async (student_uuid) => {
//   const res = await api.get(
//     `/fee-transactions/student/${student_uuid}`
//   );

//   return res.data;
// };

// // =====================================================
// // Update Transaction
// // PUT /fee-transactions/{transaction_uuid}
// // =====================================================

// export const updateFeeTransaction = async (
//   transaction_uuid,
//   data
// ) => {
//   const res = await api.put(
//     `/fee-transactions/${transaction_uuid}`,
//     data
//   );

//   return res.data;
// };

// // =====================================================
// // Delete Transaction
// // DELETE /fee-transactions/{transaction_uuid}
// // =====================================================

// export const deleteFeeTransaction = async (
//   transaction_uuid
// ) => {
//   const res = await api.delete(
//     `/fee-transactions/${transaction_uuid}`
//   );

//   return res.data;
// };

// // =====================================================
// // Change Transaction Status
// // PATCH /fee-transactions/{transaction_uuid}/status
// // =====================================================

// export const changeTransactionStatus = async (
//   transaction_uuid,
//   payment_status
// ) => {
//   const res = await api.patch(
//     `/fee-transactions/${transaction_uuid}/status`,
//     {
//       payment_status,
//     }
//   );

//   return res.data;
// };


// src/api/feeTransaction.js

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
// Create Fee Transaction (Pay Fee)
// POST /fee-transactions
// =====================================================

export const createFeeTransaction = async (data) => {
  const res = await api.post("/fee-transactions", data, {
    headers: getHeaders(),
  });

  return res.data;
};

// =====================================================
// Get All Transactions
// GET /fee-transactions
// =====================================================

export const getFeeTransactions = async ({
  search = "",
  academic_year = "",
  payment_status = "",
  page = 1,
  page_size = 10,
} = {}) => {
  const res = await api.get("/fee-transactions", {
    params: {
      search,
      academic_year,
      payment_status,
      page,
      page_size,
    },
    headers: getHeaders(),
  });

  return res.data;
};

// =====================================================
// Get Transaction By UUID
// GET /fee-transactions/{transaction_uuid}
// =====================================================

export const getFeeTransaction = async (transaction_uuid) => {
  const res = await api.get(
    `/fee-transactions/${transaction_uuid}`,
    {
      headers: getHeaders(),
    }
  );

  return res.data;
};

// =====================================================
// Student Transaction History
// GET /fee-transactions/student/{student_uuid}
// =====================================================

export const getStudentTransactions = async (student_uuid) => {
  const res = await api.get(
    `/fee-transactions/student/${student_uuid}`,
    {
      headers: getHeaders(),
    }
  );

  return res.data;
};

// =====================================================
// Update Transaction
// PUT /fee-transactions/{transaction_uuid}
// =====================================================

export const updateFeeTransaction = async (
  transaction_uuid,
  data
) => {
  const res = await api.put(
    `/fee-transactions/${transaction_uuid}`,
    data,
    {
      headers: getHeaders(),
    }
  );

  return res.data;
};

// =====================================================
// Delete Transaction
// DELETE /fee-transactions/{transaction_uuid}
// =====================================================

export const deleteFeeTransaction = async (
  transaction_uuid
) => {
  const res = await api.delete(
    `/fee-transactions/${transaction_uuid}`,
    {
      headers: getHeaders(),
    }
  );

  return res.data;
};

// =====================================================
// Change Transaction Status
// PATCH /fee-transactions/{transaction_uuid}/status
// =====================================================

export const changeTransactionStatus = async (
  transaction_uuid,
  payment_status
) => {
  const res = await api.patch(
    `/fee-transactions/${transaction_uuid}/status`,
    {
      payment_status,
    },
    {
      headers: getHeaders(),
    }
  );

  return res.data;
};