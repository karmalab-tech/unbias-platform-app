export default function FormError({ message }) {
  if (!message) return null;

  return (
    <p role="alert" className="notice">
      {message}
    </p>
  );
}
