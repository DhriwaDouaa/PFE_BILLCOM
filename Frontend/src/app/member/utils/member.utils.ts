export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 2)}***@${domain}`;
}

export function formatPlate(plate: string): string {
  return plate.toUpperCase().trim();
}
