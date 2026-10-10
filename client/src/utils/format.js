export function formatNotificationTime(value) {
  const date = new Date(value);
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const start = (item) => new Date(item.getFullYear(), item.getMonth(), item.getDate());
  const diffDays = Math.round((start(new Date()) - start(date)) / 86400000);
  if (diffDays === 0) return `Today at ${time}`;
  if (diffDays === 1) return `Yesterday at ${time}`;
  const longDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return `${longDate} at ${time}`;
}