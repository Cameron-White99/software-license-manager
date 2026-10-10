function ok(res, data) {
  return res.json(data);
}

function created(res, data) {
  return res.status(201).json(data);
}

module.exports = { ok, created };
