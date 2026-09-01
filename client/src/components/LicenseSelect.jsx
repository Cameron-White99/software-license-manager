// Shared license dropdown.
//
// Extracted from the R5 Active Assignments filter, which had this markup inline,
// so the R1 Submit Request screen can use the same control rather than a second
// hand-rolled <select>.
//
// Two layouts, because the same control appears in two shapes:
//   variant="filter" - horizontal label + select, as on R5-ActiveAssignments
//   variant="field"  - stacked form field matching the other .field inputs,
//                      as on R1-SubmitRequest
//
// Callers map their own data to { value, label } options, so this stays a
// presentation component and does not care where the licenses came from: the
// Admin screen has full records, the User screen only names + availability.
export default function LicenseSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  invalid = false,
  variant = "field",
}) {
  const isFilter = variant === "filter";

  return (
    <div className={isFilter ? "filter-row" : "field"}>
      <label className={isFilter ? "filter-label" : undefined} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={`filter-select${isFilter ? "" : " field-select"}${invalid ? " error" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
