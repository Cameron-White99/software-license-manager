import Alert from 'react-bootstrap/Alert';

export function Message({ type = 'error', children }) {
  if (!children) return null;
  const variant = type === 'error' ? 'danger' : type;
  return <Alert variant={variant}>{children}</Alert>;
}
