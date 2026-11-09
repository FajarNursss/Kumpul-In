/**
 * Utility functions for clean Indonesian date and time formatting.
 */

export const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-';
  // Handles ISO strings like "2026-11-09T00:00:00.000000Z"
  const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const year = parts[0];
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    const day = parts[2];
    return `${day} ${month} ${year}`;
  }
  return cleanDate;
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '-';
  const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const year = parts[0];
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    const day = parts[2];
    return `${day} ${month} ${year}`;
  }
  return cleanDate;
};

export const formatTimeClean = (timeStr) => {
  if (!timeStr) return '';
  // Removes trailing seconds: "10:00:00" -> "10:00"
  return timeStr.slice(0, 5);
};
