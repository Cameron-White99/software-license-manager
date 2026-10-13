export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  let response;
  try {
    response = await fetch('http://localhost:5000'+path, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    throw new Error('Cannot reach the server. Start the backend and MongoDB.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}
