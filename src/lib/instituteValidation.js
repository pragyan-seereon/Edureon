// instituteValidation.js
// ─────────────────────────────────────────────────────────────────────────
// Validation rules — mirrored 1:1 from the backend (InstituteDraftService)
// so the user gets the same errors client-side before hitting the API.
//
// Extracted from CreateInstitute.jsx so validation logic lives in one
// place and can be unit-tested / reused independently of the component.
// ─────────────────────────────────────────────────────────────────────────

export const NAME_PATTERN = /^[A-Za-z0-9\s\-.,]+$/;
export const CITY_PATTERN = /^[A-Za-z ]+$/;
export const HEX_PATTERN = /^#[A-Fa-f0-9]{6}$/;
export const PHONE_PATTERN = /^(\+?[0-9]{1,3})?[0-9]{8,11}$/;
export const EMAIL_PATTERN = /^[\w.-]+@[\w.-]+\.\w+$/;
export const WEBSITE_PATTERN = /^https?:\/\/.+/;
export const PERSON_NAME_PATTERN = /^[A-Za-z .]+$/;
export const MOBILE_PATTERN = /^[6-9]\d{9}$/; // Indian 10-digit mobile, starts 6-9
export const GST_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const TAN_PATTERN = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const ACCOUNT_HOLDER_PATTERN = /^[A-Za-z ]+$/;
export const PIN_PATTERN = /^[1-9][0-9]{5}$/;

export const INSTITUTE_TYPES = [
  "School",
  "College",
  "Coaching Centre",
  "University",
  "Other",
];

export const BOARD_OPTIONS = ["CBSE", "ICSE", "State Board", "UGC", "AICTE", "Other"];

export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry",
  "Chandigarh","Andaman and Nicobar Islands","Lakshadweep",
  "Dadra and Nagar Haveli and Daman and Diu",
];

export const ACCOUNT_TYPES = ["Savings", "Current", "Overdraft"];

// ── Step 1: Basic Info ──────────────────────────────────────────────────
export function validateStep1(form) {
  const e = {};
  const name = form.name.trim();
  if (name.length < 3) e.name = "Institute Name required.";
  else if (name.length > 200) e.name = "Institute Name maximum 200 characters.";
  else if (!NAME_PATTERN.test(name)) e.name = "Institute Name contains invalid characters.";

  if (!INSTITUTE_TYPES.includes(form.type)) e.type = "Invalid Institute Type.";
  if (!BOARD_OPTIONS.includes(form.board)) e.board = "Invalid Board.";

  if (form.board === "Other") {
    const cb = (form.customBoardName || "").trim();
    if (!cb) e.customBoardName = "Custom Board Name required.";
    else if (cb.length < 3) e.customBoardName = "Custom Board Name minimum 3 characters.";
    else if (cb.length > 100) e.customBoardName = "Custom Board Name maximum 100 characters.";
  }

  if (!form.academicYearStartMonth || !form.academicYearStartYear) {
    e.academicYearStart = "Academic Start Month & Year is required.";
  }
  if (!form.academicYearEndMonth || !form.academicYearEndYear) {
    e.academicYearEnd = "Academic End Month & Year is required.";
  }

  if (
    form.academicYearStartMonth &&
    form.academicYearEndMonth &&
    form.academicYearStartMonth === form.academicYearEndMonth &&
    form.academicYearStartYear === form.academicYearEndYear
  ) {
    e.academicYearEnd = "Academic Start and End Month & Year cannot be same.";
  } else if (
    form.academicYearStartMonth &&
    form.academicYearEndMonth
  ) {
    const startKey = parseInt(form.academicYearStartYear) * 100 + parseInt(form.academicYearStartMonth);
    const endKey = parseInt(form.academicYearEndYear) * 100 + parseInt(form.academicYearEndMonth);
    if (endKey <= startKey) {
      e.academicYearEnd = "Academic End Month & Year must be after Start Month & Year.";
    }
  }

  if (form.primaryColor && !HEX_PATTERN.test(form.primaryColor)) {
    e.primaryColor = "Invalid Primary Color.";
  }
  if (form.secondaryColor && !HEX_PATTERN.test(form.secondaryColor)) {
    e.secondaryColor = "Invalid Secondary Color.";
  }

  return e;
}

// ── Step 2: Contact & Address ───────────────────────────────────────────
export function validateStep2(form) {
  const e = {};
  const a1 = form.addressLine1.trim();
  if (a1.length < 5) e.addressLine1 = "Address Line 1 required.";
  else if (a1.length > 300) e.addressLine1 = "Address Line 1 maximum 300 characters.";

  if (form.addressLine2 && form.addressLine2.trim().length > 300) {
    e.addressLine2 = "Address Line 2 maximum 300 characters.";
  }

  const city = form.city.trim();
  if (city.length < 2) e.city = "City required.";
  else if (city.length > 100) e.city = "City maximum 100 characters.";
  else if (!CITY_PATTERN.test(city)) e.city = "City allows letters and spaces only.";

  if (!INDIAN_STATES.includes(form.state)) e.state = " State required.";
  //pin
if (!form.pin?.trim()) {
  e.pin = "PIN Code is required.";
} else if (!/^\d+$/.test(form.pin)) {
  e.pin = "PIN Code must contain digits only.";
} else if (form.pin.length !== 6) {
  e.pin = "PIN Code must be exactly 6 digits.";
}  if (!form.country) e.country = "Country required.";
  //phone
if (!form.phone?.trim()) {
  e.phone = "Phone Number is required.";
} else if (!/^\d+$/.test(form.phone)) {
  e.phone = "Phone Number must contain digits only.";
} else if (form.phone.length !== 10) {
  e.phone = "Phone Number must be exactly 10 digits.";
}
// Email
if (!form.email?.trim()) {
  e.email = "Email Address is required.";
} else if (!EMAIL_PATTERN.test(form.email)) {
  e.email = "Enter a valid email address (e.g. example@gmail.com).";
}
  if (form.website && !WEBSITE_PATTERN.test(form.website)) {
    e.website = "Website must start with http:// or https://";
  }

  return e;
}

// ── Step 3: Key People ──────────────────────────────────────────────────
export function validateStep3(form) {
  const e = {};

  // Principal Name
  const pName = form.principalName.trim();
  if (!pName) {
    e.principalName = "Principal Name is required.";
  } else if (pName.length < 2) {
    e.principalName = "Principal Name must be at least 2 characters.";
  } else if (pName.length > 150) {
    e.principalName = "Principal Name cannot exceed 150 characters.";
  } else if (!PERSON_NAME_PATTERN.test(pName)) {
    e.principalName = "Principal Name can contain only letters, spaces and dots.";
  }

  // Principal Mobile
  if (!form.principalPhone?.trim()) {
    e.principalPhone = "Principal Mobile Number is required.";
  } else if (!/^\d+$/.test(form.principalPhone)) {
    e.principalPhone = "Principal Mobile Number must contain digits only.";
  } else if (form.principalPhone.length !== 10) {
    e.principalPhone = "Principal Mobile Number must be exactly 10 digits.";
  } else if (!MOBILE_PATTERN.test(form.principalPhone)) {
    e.principalPhone =
      "Principal Mobile Number must start with 6, 7, 8 or 9.";
  }

  // Principal Email
  if (!form.principalEmail?.trim()) {
    e.principalEmail = "Principal Email is required.";
  } else if (!EMAIL_PATTERN.test(form.principalEmail)) {
    e.principalEmail =
      "Enter a valid Principal Email (e.g. principal@gmail.com).";
  }

  // Admin Name
  const aName = form.adminName.trim();
  if (!aName) {
    e.adminName = "Admin Name is required.";
  } else if (aName.length < 2) {
    e.adminName = "Admin Name must be at least 2 characters.";
  } else if (aName.length > 150) {
    e.adminName = "Admin Name cannot exceed 150 characters.";
  } else if (!PERSON_NAME_PATTERN.test(aName)) {
    e.adminName = "Admin Name can contain only letters, spaces and dots.";
  }

  // Admin Email
  if (!form.adminEmail?.trim()) {
    e.adminEmail = "Admin Email is required.";
  } else if (
    form.adminEmail === form.principalEmail &&
    form.principalEmail
  ) {
    e.adminEmail = "Admin Email cannot be same as Principal Email.";
  } else if (!EMAIL_PATTERN.test(form.adminEmail)) {
    e.adminEmail =
      "Enter a valid Admin Email (e.g. admin@gmail.com).";
  }

  // Admin Mobile
  if (!form.adminPhone?.trim()) {
    e.adminPhone = "Admin Mobile Number is required.";
  } else if (!/^\d+$/.test(form.adminPhone)) {
    e.adminPhone = "Admin Mobile Number must contain digits only.";
  } else if (form.adminPhone.length !== 10) {
    e.adminPhone = "Admin Mobile Number must be exactly 10 digits.";
  } else if (!MOBILE_PATTERN.test(form.adminPhone)) {
    e.adminPhone =
      "Admin Mobile Number must start with 6, 7, 8 or 9.";
  }

  return e;
}
// ── Step 4: Financial ───────────────────────────────────────────────────
export function validateStep4(form) {
  const e = {};

  // GST (Optional)
  if (!form.gst?.trim()) {
  e.gst = "GST Number is required.";
} else {
  const gst = form.gst.toUpperCase();

  if (gst.length !== 15) {
    e.gst = "GST Number must be 15 characters.";
  } else if (!GST_PATTERN.test(gst)) {
    e.gst = "Invalid GST Number.";
  }
}

  // PAN (Required)
  if (!form.pan?.trim()) {
    e.pan = "PAN Number is required.";
  } else {
    const pan = form.pan.toUpperCase();
    if (pan.length !== 10) {
      e.pan = "PAN Number must be 10 characters.";
    } else if (!PAN_PATTERN.test(pan)) {
      e.pan = "Invalid PAN Number.";
    }
  }

  // TAN (Optional)
  if (form.tan) {
    const tan = form.tan.toUpperCase();
    if (tan.length !== 10) {
      e.tan = "TAN Number must be 10 characters.";
    } else if (!TAN_PATTERN.test(tan)) {
      e.tan = "Invalid TAN Number.";
    }
  }

  // Account Number (Required)
  if (!form.accountNumber?.trim()) {
    e.accountNumber = "Account Number is required.";
  } else if (!/^\d+$/.test(form.accountNumber)) {
    e.accountNumber = "Account Number must contain digits only.";
  } else if (form.accountNumber.length < 9) {
    e.accountNumber = "Account Number must contain minimum 9 digits.";
  } else if (form.accountNumber.length > 18) {
    e.accountNumber = "Account Number cannot exceed 18 digits.";
  }

  // Confirm Account Number (Required)
  if (!form.confirmAccountNumber?.trim()) {
    e.confirmAccountNumber = "Confirm Account Number is required.";
  } else if (form.accountNumber !== form.confirmAccountNumber) {
    e.confirmAccountNumber =
      "Account Number and Confirm Account Number do not match.";
  }

  // IFSC (Required)
  if (!form.ifscCode?.trim()) {
    e.ifscCode = "IFSC Code is required.";
  } else if (!IFSC_PATTERN.test(form.ifscCode.toUpperCase())) {
    e.ifscCode = "Invalid IFSC Code.";
  }

  // Account Holder Name (Required)
  if (!form.accountHolderName?.trim()) {
    e.accountHolderName = "Account Holder Name is required.";
  } else if (form.accountHolderName.length > 150) {
    e.accountHolderName =
      "Account Holder Name cannot exceed 150 characters.";
  } else if (!ACCOUNT_HOLDER_PATTERN.test(form.accountHolderName)) {
    e.accountHolderName = "Invalid Account Holder Name.";
  }

  // Account Type (Required)
  if (!form.accountType) {
    e.accountType = "Account Type is required.";
  } else if (!ACCOUNT_TYPES.includes(form.accountType)) {
    e.accountType = "Invalid Account Type.";
  }

  return e;
}

// ── Step 5: Documents ───────────────────────────────────────────────────
// Mirrors the component's getEffectiveBadge/getMissingMandatory logic so
// the "all mandatory docs uploaded" check can live next to the other
// validators instead of being defined inline in the component.
export function getEffectiveDocBadge(slot, gst) {
  if (slot.gstConditional) {
    return gst?.trim() ? "Mandatory" : "Optional";
  }
  return slot.badge;
}

export function getMissingMandatoryDocs(docSlots, docs, gst) {
  return docSlots.filter((slot) => {
    if (getEffectiveDocBadge(slot, gst) !== "Mandatory") return false;
    const file = docs[slot.id];
    return slot.multi ? file.length === 0 : !file;
  });
}

export function validateStep5(docSlots, docs, gst) {
  const missing = getMissingMandatoryDocs(docSlots, docs, gst);
  return missing.length === 0 ? {} : { documents: "Please upload all required documents." };
}