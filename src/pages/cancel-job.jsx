import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

const CancelJob = () => {
  const { id } = useParams();
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8000/cancel-job/${id}`);
      setMessage("✅ Your job has been cancelled successfully. Check your email for confirmation.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong while cancelling your job.");
    } finally {
      setLoading(false);
      setConfirmed(true);
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      {!confirmed && !message && (
        <>
          <h2 style={{ marginBottom: "1rem", color: "#d9534f" }}>
            ⚠️ Are you sure you want to cancel this job?
          </h2>
          <p>This action cannot be undone. However,
            you can reschedule the job by resubmitting back on our website.
          </p>
          <button
            onClick={handleCancel}
            style={{
              padding: "0.7rem 1.5rem",
              backgroundColor: "#d9534f",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              cursor: "pointer",
              marginTop: "1rem"
            }}
          >
            {loading ? "Cancelling..." : "Yes, Cancel Job"}
          </button>
        </>
      )}

      {message && (
        <h2 style={{ color: message.includes("✅") ? "green" : "red" }}>{message}</h2>
      )}
    </div>
  );
};

export default CancelJob;
