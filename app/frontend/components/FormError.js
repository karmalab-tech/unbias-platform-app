export default function FormError({ message }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="rounded-card bg-surface text-accent px-4 py-3 text-[14px]"
    >
      {message}
    </p>
  );
}
