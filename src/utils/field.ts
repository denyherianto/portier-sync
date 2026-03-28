/** "user.battery_level" → "User Battery Level" */
export function humanizeFieldName(fieldName: string): string {
  return fieldName
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}
