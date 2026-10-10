import Alert from 'react-bootstrap/Alert';

export function Message({ type = 'error', children }) {
  if (!children) return null;
  const variant = type === 'error' ? 'danger' : type;
  return <Alert variant={variant}>{children}</Alert>;
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