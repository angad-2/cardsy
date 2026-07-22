// Tiny helpers so every route returns the same JSON envelope.

function ok(res, data, message = 'success', status = 200) {
  return res.status(status).json({ status: 'success', message, data });
}

function fail(res, message, status = 400) {
  return res.status(status).json({ status: 'fail', message });
}

module.exports = { ok, fail };
