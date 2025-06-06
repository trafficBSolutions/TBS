import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

const CancelJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await axios.delete(`https://tbs-server.onrender.com/cancel-job/${id}`);
      setMessage("✅ Your job has been cancelled successfully. Check your email for confirmation.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong while cancelling your job.");
    } finally {
      setLoading(false);
      setConfirmed(true);
    }
  };

  const handleReschedule = () => {
    navigate(`/manage-job/${id}`);
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      {!confirmed && !message && (
        <>
          <h2 style={{ marginBottom: "1rem", color: "#d9534f" }}>
            ⚠️ Are you sure you want to cancel this job?
          </h2>
          <p>This action cannot be undone.</p>
          
          <div style={{ marginTop: "1.5rem" }}>
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
                marginRight: "1rem"
              }}
            >
              {loading ? "Cancelling..." : "Yes, Cancel Job"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CancelJob;
