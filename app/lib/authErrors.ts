const SIGNUP_EXACT = {
  invalidEmail: 'Invalid email format',
  emailInUse: 'Email already in use',
} as const;

const LOGIN_EXACT = {
  invalidEmail: 'Invalid email address',
  incorrectPassword: 'Incorrect password',
} as const;

export function getSignupErrorMessage(status: number, message?: string): string {
  if (message === SIGNUP_EXACT.invalidEmail || message === SIGNUP_EXACT.emailInUse) {
    return message;
  }

  const text = (message || '').toLowerCase();

  if (status === 400 && (text.includes('invalid email') || text.includes('email format'))) {
    return SIGNUP_EXACT.invalidEmail;
  }

  if (status === 409 || text.includes('already in use') || text.includes('already exists')) {
    return SIGNUP_EXACT.emailInUse;
  }

  if (message?.trim()) return message.trim();
  return 'Sign up failed. Please check your details and try again.';
}

export function getLoginErrorMessage(status: number, message?: string): string {
  if (message === LOGIN_EXACT.invalidEmail || message === LOGIN_EXACT.incorrectPassword) {
    return message;
  }

  const text = (message || '').toLowerCase();

  if (text.includes('invalid email address')) {
    return LOGIN_EXACT.invalidEmail;
  }

  if (text.includes('incorrect password')) {
    return LOGIN_EXACT.incorrectPassword;
  }

  if (text.includes('verify your email')) {
    return message || 'Please verify your email before logging in.';
  }

  if (message?.trim()) return message.trim();

  if (status === 401) {
    return 'Authentication failed. Please check your email and password.';
  }

  if (status === 403) {
    return 'You do not have permission to sign in with these credentials.';
  }

  return 'Unable to log in. Please try again.';
}