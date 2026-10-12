import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import Stack from 'react-bootstrap/Stack';

export function Message({ type = 'error', children }) {
  if (!children) return null;
  const variant = type === 'error' ? 'danger' : type;
  return <Alert variant={variant}>{children}</Alert>;
}

export function SearchBox({ label, value, onChange, placeholder }) {
  return (
    <Form.Group className="mb-3">
      {label ? <Form.Label className="text-secondary small fw-semibold">{label}</Form.Label> : null}
      <Form.Control value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </Form.Group>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <Stack direction="horizontal" gap={3} className="justify-content-between align-items-start mb-4 flex-wrap">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        {subtitle ? <p className="text-secondary mb-0">{subtitle}</p> : null}
      </div>
      {action}
    </Stack>
  );
}

const badgeVariant = {
  Active: 'success',
  ACTIVE: 'success',
  Approved: 'success',
  APPROVED: 'success',
  Pending: 'warning',
  PENDING: 'warning',
  Rejected: 'danger',
  REJECTED: 'danger',
  Expired: 'secondary',
  EXPIRED: 'secondary',
  BLOCKED: 'danger',
  Blocked: 'danger',
};

export function StatusBadge({ value }) {
  return <Badge bg={badgeVariant[value] || 'secondary'}>{value}</Badge>;
}
