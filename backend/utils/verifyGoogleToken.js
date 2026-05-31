const { OAuth2Client } = require('google-auth-library');

async function verifyGoogleIdToken(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const err = new Error('Google sign-in is not configured on the server');
    err.statusCode = 500;
    throw err;
  }

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload?.email) {
    const err = new Error('Invalid Google token');
    err.statusCode = 401;
    throw err;
  }

  return payload;
}

module.exports = verifyGoogleIdToken;
