

import api from "./axios";
import useAuthStore from "../store/authStore";

const getHeaders = () => {
  const { instituteUUID } = useAuthStore.getState();

  return {
    "X-Institute-UUID": instituteUUID,
  };
};


const toDraftFormData = (data) => {
  const formData = new FormData();
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    formData.append(key, value instanceof File ? value : String(value));
  });
  return formData;
};

// ===============================
// Step 1 - Create Draft
// ===============================
export const createEmployeeDraft = async (data) => {
  const response = await api.post(
    "/employee-drafts",
    toDraftFormData(data),
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// ===============================
// Step 2 - Job Details
// ===============================
export const updateEmployeeJob = async (draftUuid, data) => {
  const response = await api.put(
    `/employee-drafts/${draftUuid}/job`,
    toDraftFormData(data),
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ===============================
// Step 3 - Salary
// ===============================
export const updateEmployeeSalary = async (draftUuid, data) => {
  const response = await api.put(
    `/employee-drafts/${draftUuid}/salary`,
    toDraftFormData(data),
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ===============================
// Step 4 - Legal
// ===============================
export const updateEmployeeLegal = async (draftUuid, data) => {
  const response = await api.put(
    `/employee-drafts/${draftUuid}/legal`,
    toDraftFormData(data),
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ===============================
// Step 5 - Bank
// ===============================
export const updateEmployeeBank = async (draftUuid, data) => {
  const response = await api.put(
    `/employee-drafts/${draftUuid}/bank`,
    toDraftFormData(data),
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ===============================
// Step 6 - Assignment
// ===============================
export const updateEmployeeAssignment = async (draftUuid, data) => {
  const response = await api.put(
    `/employee-drafts/${draftUuid}/assignment`,
    toDraftFormData(data),
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ===============================
// Step 7 - Upload Documents
// ===============================
export const uploadEmployeeDocuments = async (
  draftUuid,
  files,
  documentTypes
) => {
  const formData = new FormData();

  documentTypes.forEach((type, index) => {
    const file = files[index];

    switch (type) {
      case "PHOTO":
        formData.append("photo_file", file);
        break;

      case "AADHAAR":
        formData.append("aadhaar_file", file);
        break;

      case "PAN":
        formData.append("pan_file", file);
        break;

      case "UAN":
        formData.append("uan_file", file);
        break;

      case "PASSPORT":
        formData.append("passport_file", file);
        break;

      case "VISA":
        formData.append("visa_file", file);
        break;

      case "QUALIFICATION":
        formData.append("qualification_file", file);
        break;

      case "EXPERIENCE":
        formData.append("experience_file", file);
        break;

      case "BANK_PASSBOOK":
        formData.append("bank_passbook_file", file);
        break;

      case "RESUME":
        formData.append("resume_file", file);
        break;

      case "OTHER":
        formData.append("other_file", file);
        break;
    }
  });

  const response = await api.post(
    `/employee-drafts/${draftUuid}/documents`,
    formData,
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ===============================
// Step 8 - Review
// ===============================
export const reviewEmployeeDraft = async (draftUuid) => {
  const response = await api.get(
    `/employee-drafts/${draftUuid}/review`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// ===============================
// Step 9 - Submit
// ===============================
export const submitEmployeeDraft = async (draftUuid) => {
  const response = await api.post(
    `/employee-drafts/${draftUuid}/submit`,
    {},
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};


// ===============================
// Get Employee Draft
// ===============================
export const getEmployeeDraft = async (draftUuid) => {
  const response = await api.get(
    `/employee-drafts/${draftUuid}`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};




// ===================================
// Get All Employees
// ===================================
export const getEmployees = async (params = {}) => {
  const response = await api.get("/employees", {
    params,
    headers: getHeaders(),
  });

  return response.data;
};

// ===================================
// Get Employee By UUID
// ===================================
export const getEmployeeByUUID = async (employeeUUID) => {
  const response = await api.get(`/employees/${employeeUUID}`, {
    headers: getHeaders(),
  });

  return response.data;
};

// ===================================
// Update Employee
// ===================================
export const updateEmployee = async (employeeUUID, data) => {
  const response = await api.put(
    `/employees/${employeeUUID}`,
    toDraftFormData(data),
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
// ===================================
// Update Employee Status
// ===================================
export const updateEmployeeStatus = async (
  employeeUUID,
  data
) => {
  const response = await api.patch(
    `/employees/${employeeUUID}/status`,
    data,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// ===================================
// Activate Employee
// ===================================
export const activateEmployee = async (employeeUUID) => {
  const response = await api.patch(
    `/employees/${employeeUUID}/activate`,
    {},
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// ===================================
// Deactivate Employee
// ===================================
export const deactivateEmployee = async (employeeUUID) => {
  const response = await api.patch(
    `/employees/${employeeUUID}/deactivate`,
    {},
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};


// ===============================
// Roles API
// ===============================
export const getRoles = async (params = {}) => {
  const response = await api.get("/super/roles", {
    params: {
      institute_uuid: useAuthStore.getState().instituteUUID,
      active_only: params.active_only || false,
      page: params.page || 1,
      limit: params.limit || 100,
      ...params
    },
    headers: getHeaders(),
  });
  return response.data;
};

// ===============================
// Departments API
// ===============================
export const getDepartments = async () => {
  const response = await api.get("/departments/", {
    headers: getHeaders(),
  });
  return response.data;
};

// ===============================
// Step 1 - Update Personal
// ===============================
export const updateEmployeePersonal = async (draftUuid, data) => {
  const response = await api.put(
    `/employee-drafts/${draftUuid}/personal`,
    toDraftFormData(data),
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};




// ===============================
// Delete Employee Draft
// ===============================
export const deleteEmployeeDraft = async (draftUuid) => {
  const response = await api.delete(
    `/employee-drafts/${draftUuid}`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};


// ===============================
// Employee Groups
// ===============================
export const getEmployeeGroups = async () => {
  const response = await api.get("/employee-groups", {
    headers: getHeaders(),
  });

  return response.data;
};

// ===============================
// Shifts
// ===============================
export const getShifts = async () => {
  const response = await api.get("/shifts", {
    headers: getHeaders(),
  });

  return response.data;
};

// ===============================
// Leave Groups
// ===============================
export const getLeaveGroups = async () => {
  const response = await api.get("/leave-groups", {
    headers: getHeaders(),
  });

  return response.data;
};

// ===============================
// Holiday Groups
// ===============================
export const getHolidayGroups = async () => {
  const response = await api.get("/academic-calendar", {
    headers: getHeaders(),
  });

  return response.data;
};


// ===============================
// Work Day Categories
// ===============================
export const getWorkDayCategories = async () => {
  const response = await api.get("/work-day-categories", {
    headers: getHeaders(),
  });

  return response.data;
};

// ===============================
// Classes
// ===============================
export const getClasses = async () => {
  const response = await api.get("/classes", {
    headers: getHeaders(),
  });

  return response.data;
};


export const getSubjects = async (params = {}) => {
  const response = await api.get("/subjects", {
    params,
    headers: getHeaders(),
  });

  return response.data;
};

// ===============================
// Employees (Reporting Managers)
// ===============================
export const getEmployeeDropdown = async () => {
  const response = await api.get("/employees", {
    params: {
      page: 1,
      limit: 1000,
      status: "ACTIVE",
    },
    headers: getHeaders(),
  });

  return response.data;
};

// ===============================
// Create Shift
// ===============================
export const createShift = async (data) => {
  const response = await api.post(
    "/shifts",
    data,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// ===============================
// Get Shift By UUID
// ===============================
export const getShiftByUUID = async (shiftUUID) => {
  const response = await api.get(
    `/shifts/${shiftUUID}`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// ===============================
// Delete Shift
// ===============================
export const deleteShift = async (shiftUUID) => {
  const response = await api.delete(
    `/shifts/${shiftUUID}`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// ===============================
// Update Shift
// ===============================
export const updateShift = async (
  shiftUUID,
  data
) => {
  const response = await api.put(
    `/shifts/${shiftUUID}`,
    data,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};