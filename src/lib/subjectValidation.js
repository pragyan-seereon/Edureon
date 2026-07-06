// src/lib/validation/subjectValidation.js
//
// Validation rules for the Subject form (Create / Edit).
// Mirrors the "Basic Info" onboarding validation UX:
//   - required fields show an inline error (icon + red text) under the field
//   - duplicate subject_code / subject_name show an inline "already exists"
//     error, whether caught client-side (against subjects already loaded)
//     or returned by the API on submit.

export const SUBJECT_VALIDATION_MESSAGES = {
  CODE_REQUIRED: "Subject Code required.",
  NAME_REQUIRED: "Subject Name required.",
  CODE_DUPLICATE: "Subject Code already exists.",
  NAME_DUPLICATE: "Subject Name already exists.",
};

/**
 * Client-side validation, run on submit (and optionally onBlur).
 *
 * @param {Object} form              - { subject_code, subject_name, ... }
 * @param {Array}  existingSubjects  - full list of subjects already loaded in the app
 * @param {string|number|null} editUuid - subject_uuid currently being edited
 *                                        (excluded from the duplicate check); null when creating
 * @returns {Object} errors - { subject_code?: string, subject_name?: string }
 */
export function validateSubjectForm(form, existingSubjects = [], editUuid = null) {
  const errors = {};

  const code = (form.subject_code ?? "").trim();
  const name = (form.subject_name ?? "").trim();

  // ---- Required checks ----
  if (!code) {
    errors.subject_code = SUBJECT_VALIDATION_MESSAGES.CODE_REQUIRED;
  }
  if (!name) {
    errors.subject_name = SUBJECT_VALIDATION_MESSAGES.NAME_REQUIRED;
  }

  // ---- Duplicate checks (case-insensitive, ignore the record being edited) ----
  const others = existingSubjects.filter((s) => s.subject_uuid !== editUuid);

  if (!errors.subject_code && code) {
    const codeExists = others.some(
      (s) => (s.subject_code ?? "").trim().toLowerCase() === code.toLowerCase(),
    );
    if (codeExists) errors.subject_code = SUBJECT_VALIDATION_MESSAGES.CODE_DUPLICATE;
  }

  if (!errors.subject_name && name) {
    const nameExists = others.some(
      (s) => (s.subject_name ?? "").trim().toLowerCase() === name.toLowerCase(),
    );
    if (nameExists) errors.subject_name = SUBJECT_VALIDATION_MESSAGES.NAME_DUPLICATE;
  }

  return errors;
}

export function isSubjectFormValid(errors) {
  return Object.keys(errors).length === 0;
}

/**
 * Maps a backend error (e.g. a 409 conflict from createSubject / updateSubject,
 * for a duplicate that only the server can see) to the same errors shape used
 * by validateSubjectForm, so API-caught duplicates render with the identical
 * inline error UI as client-side ones.
 *
 * Adjust the string matching below to match your actual API error payload
 * shape (e.g. err.response.data.field / err.response.data.code).
 */
export function mapApiErrorToFieldErrors(err) {
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "";

  const lower = message.toLowerCase();
  const errors = {};

  if (lower.includes("code")) {
    errors.subject_code = SUBJECT_VALIDATION_MESSAGES.CODE_DUPLICATE;
  }
  if (lower.includes("name")) {
    errors.subject_name = SUBJECT_VALIDATION_MESSAGES.NAME_DUPLICATE;
  }

  // Fallback: server said "exists" but didn't specify which field —
  // flag both so the user still sees something actionable.
  if (Object.keys(errors).length === 0 && lower.includes("exist")) {
    errors.subject_code = SUBJECT_VALIDATION_MESSAGES.CODE_DUPLICATE;
    errors.subject_name = SUBJECT_VALIDATION_MESSAGES.NAME_DUPLICATE;
  }

  return errors;
}


export const CLASS_VALIDATION_MESSAGES = {
  NAME_REQUIRED: "Class Name required.",
  NAME_DUPLICATE: "Class Name already exists.",
  STREAM_NOTES_REQUIRED: "Please specify the custom stream.",
};

/**
 * Client-side validation, run on submit.
 *
 * @param {Object} form            - { name, stream, streamNotes, ... }
 * @param {Array}  existingClasses - full list of classes already loaded (e.g. `list` in ClassesTab)
 * @param {string|number|null} editUuid - class_uuid currently being edited
 *                                        (excluded from duplicate check); null when creating
 * @returns {Object} errors - { name?: string, streamNotes?: string }
 */
export function validateClassForm(form, existingClasses = [], editUuid = null) {
  const errors = {};

  const name = (form.name ?? "").trim();

  // ---- Required checks ----
  if (!name) {
    errors.name = CLASS_VALIDATION_MESSAGES.NAME_REQUIRED;
  }

  if (form.stream === "Other" && !(form.streamNotes ?? "").trim()) {
    errors.streamNotes = CLASS_VALIDATION_MESSAGES.STREAM_NOTES_REQUIRED;
  }

  // ---- Duplicate check (case-insensitive, ignore the record being edited) ----
  const others = existingClasses.filter((c) => c.class_uuid !== editUuid);

  if (!errors.name && name) {
    const nameExists = others.some(
      (c) => (c.class_name ?? "").trim().toLowerCase() === name.toLowerCase(),
    );
    if (nameExists) errors.name = CLASS_VALIDATION_MESSAGES.NAME_DUPLICATE;
  }

  return errors;
}

export function isClassFormValid(errors) {
  return Object.keys(errors).length === 0;
}

/**
 * Maps a backend error (e.g. 409 conflict from createClass / updateClass)
 * to the same errors shape used by validateClassForm, so server-caught
 * duplicates render with the identical inline error UI as client-side ones.
 *
 * Adjust the string matching below to match your actual API error payload shape.
 */
export function mapApiErrorToClassFieldErrors(err) {
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "";

  const lower = message.toLowerCase();
  const errors = {};

  if (lower.includes("name") || lower.includes("exist")) {
    errors.name = CLASS_VALIDATION_MESSAGES.NAME_DUPLICATE;
  }

  return errors;
}

export const SECTION_VALIDATION_MESSAGES = {
  NAME_REQUIRED: "Section Name required.",
  CLASS_REQUIRED: "Class required.",
  TEACHER_REQUIRED: "Class Teacher required.",
  CAPACITY_REQUIRED: "Total Capacity must be greater than 0.",
  NAME_DUPLICATE: "Section already exists for this class.",
  TEACHER_DUPLICATE: "This teacher is already assigned as Class Teacher of another section.",
  ROOM_DUPLICATE: "This room is already assigned to another section.",
};

/**
 * Client-side validation, run on submit.
 *
 * @param {Object} form              - { name, class_uuid, teacher, room_uuid, total, ... }
 * @param {Array}  existingSections  - raw sections already loaded (must carry class_uuid,
 *                                      section_name, class_teacher_user_id, room_uuid)
 * @param {string|number|null} editUuid - section_uuid currently being edited
 * @returns {Object} errors
 */
export function validateSectionForm(form, existingSections = [], editUuid = null) {
  const errors = {};

  const name = (form.name ?? "").trim();
  const classUuid = form.class_uuid;
  const teacher = form.teacher;
  const roomUuid = form.room_uuid;
  const total = Number(form.total);

  // ---- Required checks ----
  if (!name) errors.name = SECTION_VALIDATION_MESSAGES.NAME_REQUIRED;
  if (!classUuid) errors.class_uuid = SECTION_VALIDATION_MESSAGES.CLASS_REQUIRED;
  if (!teacher) errors.teacher = SECTION_VALIDATION_MESSAGES.TEACHER_REQUIRED;
  if (!total || total <= 0) errors.total = SECTION_VALIDATION_MESSAGES.CAPACITY_REQUIRED;

  const others = existingSections.filter((s) => s.section_uuid !== editUuid);

  // ---- Duplicate section name within the same class ----
  if (!errors.name && !errors.class_uuid && name && classUuid) {
    const dup = others.some(
      (s) =>
        String(s.class_uuid ?? "") === String(classUuid) &&
        (s.section_name ?? "").trim().toLowerCase() === name.toLowerCase(),
    );
    if (dup) errors.name = SECTION_VALIDATION_MESSAGES.NAME_DUPLICATE;
  }

  // ---- Same teacher can't be class teacher of another section ----
  if (!errors.teacher && teacher) {
    const teacherTaken = others.some(
      (s) => String(s.class_teacher_user_id ?? "") === String(teacher),
    );
    if (teacherTaken) errors.teacher = SECTION_VALIDATION_MESSAGES.TEACHER_DUPLICATE;
  }

  // ---- Same room can't be assigned to another section ----
  if (roomUuid) {
    const roomTaken = others.some(
      (s) => String(s.room_uuid ?? "") === String(roomUuid),
    );
    if (roomTaken) errors.room_uuid = SECTION_VALIDATION_MESSAGES.ROOM_DUPLICATE;
  }

  return errors;
}

export function isSectionFormValid(errors) {
  return Object.keys(errors).length === 0;
}

/**
 * Maps a backend error (e.g. the 409 "This teacher is already Class Teacher of I."
 * you're seeing in the Network tab) onto the same errors shape used by
 * validateSectionForm, so server-caught conflicts render inline too.
 */
export function mapApiErrorToSectionFieldErrors(err) {
  const message =
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "";

  const lower = message.toLowerCase();
  const errors = {};

  if (lower.includes("teacher")) {
    errors.teacher = message || SECTION_VALIDATION_MESSAGES.TEACHER_DUPLICATE;
  } else if (lower.includes("room")) {
    errors.room_uuid = message || SECTION_VALIDATION_MESSAGES.ROOM_DUPLICATE;
  } else if (lower.includes("section")) {
    errors.name = message || SECTION_VALIDATION_MESSAGES.NAME_DUPLICATE;
  }

  return errors;
}