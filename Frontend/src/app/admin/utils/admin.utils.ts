export function getSensorStatusClass(status?: string): string {
  switch (status) {
    case 'NORMAL': return 'bg-success';
    case 'WARNING': return 'bg-warning text-dark';
    case 'CRITICAL': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
