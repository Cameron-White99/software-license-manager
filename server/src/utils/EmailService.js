class EmailService {
  accountFound() {
    return 'Account found. Choose a new password.';
  }

  passwordUpdated() {
    return 'Password updated. You can sign in.';
  }
}

export default new EmailService();
