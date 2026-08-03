import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";

const INITIAL = {
  fullName: "",
  paymentMethod: "",
  bankName: "",
  accountType: "",
  routingNumber: "",
  accountNumber: "",
};

const ErrorText = ({ children }) =>
  children ? <div className="apply-error">{children}</div> : null;

const DirectDeposit = () => {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Required.";
    if (!form.paymentMethod) next.paymentMethod = "Choose a payment method.";
    if (form.paymentMethod === "Direct Deposit") {
      if (!form.bankName.trim()) next.bankName = "Required.";
      if (!form.accountType) next.accountType = "Required.";
      if (!form.routingNumber.trim()) next.routingNumber = "Required.";
      else if (!/^\d{9}$/.test(form.routingNumber))
        next.routingNumber = "Must be exactly 9 digits.";
      if (!form.accountNumber.trim()) next.accountNumber = "Required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const loading = toast.loading("Submitting...");
    try {
      await axios.post("/direct-deposit", form);
      toast.dismiss(loading);
      toast.success("Payroll information submitted.");
      setSubmitted(true);
    } catch (err) {
      toast.dismiss(loading);
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Submission failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <main style={{ maxWidth: 600, margin: "60px auto", padding: "0 20px" }}>
        <h1>Payroll / Direct Deposit</h1>
        <p>Submit your payroll preference to Traffic &amp; Barrier Solutions.</p>

        <div style={{ marginTop: 16, padding: 16, background: "#fffbeb", borderRadius: 8, border: "1px solid #f5d87e" }}>
          <strong>W-9 Required</strong>
          <p style={{ margin: "6px 0 10px" }}>
            Please download and complete the W-9 form, then email the completed form to{" "}
            <a href="mailto:materialworx2@gmail.com">materialworx2@gmail.com</a>.
          </p>
          <a
            href="https://www.irs.gov/pub/irs-pdf/fw9.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "#efad76",
              borderRadius: 6,
              fontWeight: "bold",
              textDecoration: "none",
              color: "#000"
            }}
          >
            Download W-9 (IRS)
          </a>
        </div>

        {submitted ? (
          <div style={{ marginTop: 32, padding: 24, background: "#f0fdf4", borderRadius: 8 }}>
            <strong>✅ Submitted successfully.</strong>
            <p>Your payroll information has been received.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 32 }}
          >
            <label>
              Full Name *
              <input
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                style={{ display: "block", width: "100%", marginTop: 4 }}
              />
              <ErrorText>{errors.fullName}</ErrorText>
            </label>

            <fieldset style={{ border: "1px solid #ccc", borderRadius: 6, padding: 12 }}>
              <legend>Payment Method *</legend>
              {["Direct Deposit", "Check"].map((method) => (
                <label key={method} style={{ marginRight: 20 }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={form.paymentMethod === method}
                    onChange={(e) => update("paymentMethod", e.target.value)}
                    style={{ marginRight: 6 }}
                  />
                  {method}
                </label>
              ))}
              <ErrorText>{errors.paymentMethod}</ErrorText>
            </fieldset>

            {form.paymentMethod === "Direct Deposit" && (
              <>
                <label>
                  Bank Name *
                  <input
                    value={form.bankName}
                    onChange={(e) => update("bankName", e.target.value)}
                    style={{ display: "block", width: "100%", marginTop: 4 }}
                  />
                  <ErrorText>{errors.bankName}</ErrorText>
                </label>

                <label>
                  Account Type *
                  <select
                    value={form.accountType}
                    onChange={(e) => update("accountType", e.target.value)}
                    style={{ display: "block", width: "100%", marginTop: 4 }}
                  >
                    <option value="">Select account type</option>
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                  </select>
                  <ErrorText>{errors.accountType}</ErrorText>
                </label>

                <label>
                  Routing Number *
                  <input
                    inputMode="numeric"
                    maxLength={9}
                    value={form.routingNumber}
                    onChange={(e) =>
                      update("routingNumber", e.target.value.replace(/\D/g, "").slice(0, 9))
                    }
                    style={{ display: "block", width: "100%", marginTop: 4 }}
                  />
                  <ErrorText>{errors.routingNumber}</ErrorText>
                </label>

                <label>
                  Account Number *
                  <input
                    inputMode="numeric"
                    value={form.accountNumber}
                    onChange={(e) =>
                      update("accountNumber", e.target.value.replace(/\D/g, ""))
                    }
                    style={{ display: "block", width: "100%", marginTop: 4 }}
                  />
                  <ErrorText>{errors.accountNumber}</ErrorText>
                </label>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "12px 24px",
                background: "#efad76",
                border: "none",
                borderRadius: 6,
                fontWeight: "bold",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DirectDeposit;
