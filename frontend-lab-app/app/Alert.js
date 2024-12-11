export default function Alert({ message, type }) {
    return (
      <div className={`alert ${type}`}>
        {message}
      </div>
    );
  }
  