import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};

// ===================================
// Fee Discount APIs
// ===================================

export const getFeeDiscounts = (params = {}) =>
  api.get("/fee-discounts", {
    headers: getHeaders(),
    params,
  });

export const getFeeDiscountByUUID = (discountUUID) =>
  api.get(`/fee-discounts/${discountUUID}`, {
    headers: getHeaders(),
  });

export const createFeeDiscount = (data) =>
  api.post("/fee-discounts", data, {
    headers: getHeaders(),
  });

export const updateFeeDiscount = (discountUUID, data) =>
  api.put(`/fee-discounts/${discountUUID}`, data, {
    headers: getHeaders(),
  });

export const deleteFeeDiscount = (discountUUID) =>
  api.delete(`/fee-discounts/${discountUUID}`, {
    headers: getHeaders(),
  });

export const archiveFeeDiscount = (discountUUID) =>
  api.patch(
    `/fee-discounts/${discountUUID}/archive`,
    {},
    {
      headers: getHeaders(),
    }
  );

export const activateFeeDiscount = (discountUUID) =>
  api.patch(
    `/fee-discounts/${discountUUID}/activate`,
    {},
    {
      headers: getHeaders(),
    }
  );

export const getFeeDiscountDropdown = () =>
  api.get("/fee-discounts/dropdown/list", {
    headers: getHeaders(),
  });