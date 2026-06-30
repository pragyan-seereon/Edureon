// ── Infrastructure form validation helpers ──────────────────────────────────
// Shared validation functions used by Building / Block / Floor / Room dialogs.

/** True if the string contains at least one digit. */
export const hasNumber = (str) => /\d/.test(str || "");

/** True if the string contains at least one letter. */
export const hasLetter = (str) => /[a-zA-Z]/.test(str || "");

/** Trim + lowercase, safe for null/undefined. */
export const norm = (str) => (str || "").trim().toLowerCase();

/**
 * Validates a "name" field (Building Name, Block Name, Floor Name, Room Name).
 * Rules:
 *  - required
 *  - cannot be purely numeric — must contain at least one letter
 *    (e.g. "Block A", "A1", "Room 12B" are valid; "123" is not)
 *
 * @param {string} value
 * @param {string} label - human readable field label used in the error message
 * @returns {string|null} error message, or null if valid
 */
export function validateNameField(value, label) {
  if (!value || !value.trim()) return `${label} is required.`;
  if (!hasLetter(value)) return `${label} cannot be only numbers.`;
  return null;
}

/**
 * Validates a "code" field (Building Code, Block Code).
 * Rules:
 *  - required
 *  - must contain at least one number
 *    (e.g. "MAB1", "BLK-A2" are valid; "MAB" alone is not)
 *
 * @param {string} value
 * @param {string} label - human readable field label used in the error message
 * @returns {string|null} error message, or null if valid
 */
export function validateCodeField(value, label) {
  if (!value || !value.trim()) return `${label} is required.`;
  if (!hasNumber(value)) return `${label} must contain at least one number.`;
  return null;
}

/**
 * Checks whether `value` already exists (case/whitespace-insensitive) among
 * a list of sibling records, optionally excluding the record currently being
 * edited.
 *
 * @param {string} value - the value being validated
 * @param {Array<object>} list - sibling records, e.g. [{ uuid, name, code }]
 * @param {string} field - which key on each record to compare against ("name" | "code")
 * @param {string|undefined} excludeUuid - uuid to exclude (when editing)
 * @returns {boolean}
 */
export function isDuplicate(value, list, field, excludeUuid) {
  if (!value || !value.trim()) return false;
  return (list || []).some(
    (item) => item.uuid !== excludeUuid && norm(item[field]) === norm(value),
  );
}

/**
 * Checks whether `value` already exists among an array of plain values
 * (used for in-form duplicate checks, e.g. comparing rooms being added in
 * the same submission, where there's no uuid yet).
 *
 * @param {string} value
 * @param {Array<string>} values
 * @param {number} ownIndex - index of `value` within `values`, excluded from the check
 * @returns {boolean}
 */
export function isDuplicateInArray(value, values, ownIndex) {
  if (!value || !value.trim()) return false;
  return values.some(
    (other, i) => i !== ownIndex && norm(other) === norm(value),
  );
}

/**
 * Combines required + format + duplicate checks for a name field in one call.
 *
 * @param {string} value
 * @param {string} label
 * @param {object} opts
 * @param {Array<object>} [opts.existing] - sibling records [{ uuid, name }]
 * @param {string} [opts.excludeUuid]
 * @param {string} [opts.duplicateMessage]
 * @returns {string|null}
 */
export function validateUniqueName(value, label, opts = {}) {
  const requiredOrFormatError = validateNameField(value, label);
  if (requiredOrFormatError) return requiredOrFormatError;

  const { existing = [], excludeUuid, duplicateMessage } = opts;
  if (isDuplicate(value, existing, "name", excludeUuid)) {
    return duplicateMessage || `${label} already exists.`;
  }
  return null;
}

/**
 * Combines required + format + duplicate checks for a code field in one call.
 *
 * @param {string} value
 * @param {string} label
 * @param {object} opts
 * @param {Array<object>} [opts.existing] - sibling records [{ uuid, code }]
 * @param {string} [opts.excludeUuid]
 * @param {string} [opts.duplicateMessage]
 * @returns {string|null}
 */
export function validateUniqueCode(value, label, opts = {}) {
  const requiredOrFormatError = validateCodeField(value, label);
  if (requiredOrFormatError) return requiredOrFormatError;

  const { existing = [], excludeUuid, duplicateMessage } = opts;
  if (isDuplicate(value, existing, "code", excludeUuid)) {
    return duplicateMessage || `${label} already exists.`;
  }
  return null;
}