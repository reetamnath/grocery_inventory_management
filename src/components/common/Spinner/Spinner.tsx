import "./Spinner.css";

interface SpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export function Spinner({ size = "medium", className = "" }: SpinnerProps) {
  const sizeClass = `spinner-${size}`;
  return <div className={`spinner ${sizeClass} ${className}`}></div>;
}

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({
  isLoading,
  message = "Loading...",
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Spinner size="large" />
        <p>{message}</p>
      </div>
    </div>
  );
}
