import React, { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../css/apply-wizard.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const STEPS = [
  "Applicant",
  "Education",
  "Employment",
  "Background",
  "Documents",
  "Drug Screening",
  "Payroll",
  "Review"
];

const INITIAL_DATA = {
  first: "",
  last: "",
  email: "",
  phone: "",
  position: "",
  wantsDriver: "",
  location: "",
  languages: "",
  skills: "",
  message: ""
};

const INITIAL_FILES = {
  ssnCard: null,
  driversLicense: null,
  drivingRecordFile: null,
  civilianRequest: null,
  cover: null
};

const INITIAL_DRIVING_RECORD = {
  speedingTickets: "0",
  trafficViolations: "0",
  duis: "0",
  otherViolations: ""
};

const INITIAL_DRUG_SCREENING = {
  fullName: "",
  dob: "",
  collectionDate: "",
  specimenId: "",
  testReason: "",
  signature: ""
};

const INITIAL_PAYROLL = {
  bankName: "",
  accountType: "",
  routingNumber: "",
  accountNumber: "",
  paymentMethod: ""
};

const EMPTY_EDUCATION = {
  school: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: ""
};

const EMPTY_WORK = {
  employerName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  duties: "",
  currentlyEmployed: false,
  reasonForLeaving: "",
  mayContact: ""
};

const EMPTY_BACKGROUND = {
  type: "Misdemeanor",
  charge: "",
  date: "",
  explanation: ""
};

const POSITIONS = [
  "Traffic Control Safety Advisor",
  "Foreman",
  "Traffic Control Flagger",
  "Traffic Control CDL Driver"
];

const LOCATIONS = ["Calhoun GA", "Atlanta GA", "Valdosta GA"];
const LANGUAGES = [
  "English (Inglés)",
  "Spanish (Español)",
  "Both (English & Spanish)"
];

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const ErrorText = ({ children }) =>
  children ? <div className="apply-error">{children}</div> : null;

const ApplyNow = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL_DATA);
  const [files, setFiles] = useState(INITIAL_FILES);
  const [drivingRecord, setDrivingRecord] = useState(INITIAL_DRIVING_RECORD);
  const [drugScreening, setDrugScreening] = useState(INITIAL_DRUG_SCREENING);

  const [educationEntries, setEducationEntries] = useState([]);
  const [educationDraft, setEducationDraft] = useState(EMPTY_EDUCATION);

  const [workHistory, setWorkHistory] = useState([]);
  const [workDraft, setWorkDraft] = useState(EMPTY_WORK);
  const [hasWorkHistory, setHasWorkHistory] = useState("");

  const [background, setBackground] = useState([]);
  const [backgroundDraft, setBackgroundDraft] = useState(EMPTY_BACKGROUND);
  const [hasBackground, setHasBackground] = useState("");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = useMemo(
    () => Math.round(((step + 1) / STEPS.length) * 100),
    [step]
  );

  const updateData = (field, value) => {
    setData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const updateFile = (field, file) => {
    setFiles((current) => ({ ...current, [field]: file || null }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const addEducation = () => {
    const nextErrors = {};
    Object.entries(educationDraft).forEach(([key, value]) => {
      if (!String(value).trim()) nextErrors[`education_${key}`] = "Required";
    });

    if (Object.keys(nextErrors).length) {
      setErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }

    setEducationEntries((current) => [...current, educationDraft]);
    setEducationDraft(EMPTY_EDUCATION);
    setErrors((current) => ({ ...current, education: "" }));
  };

  const addWork = () => {
    const required = [
      "employerName", "address", "city", "state", "zip",
      "phone", "duties", "mayContact"
    ];
    const nextErrors = {};

    required.forEach((field) => {
      if (!String(workDraft[field] ?? "").trim()) {
        nextErrors[`work_${field}`] = "Required";
      }
    });

    if (!workDraft.currentlyEmployed && !workDraft.reasonForLeaving.trim()) {
      nextErrors.work_reasonForLeaving = "Required";
    }

    if (Object.keys(nextErrors).length) {
      setErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }

    setWorkHistory((current) => [...current, workDraft]);
    setWorkDraft(EMPTY_WORK);
    setErrors((current) => ({ ...current, workHistory: "" }));
  };

  const addBackground = () => {
    const nextErrors = {};
    ["charge", "date", "explanation"].forEach((field) => {
      if (!backgroundDraft[field].trim()) {
        nextErrors[`background_${field}`] = "Required";
      }
    });

    if (Object.keys(nextErrors).length) {
      setErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }

    setBackground((current) => [...current, backgroundDraft]);
    setBackgroundDraft(EMPTY_BACKGROUND);
    setErrors((current) => ({ ...current, background: "" }));
  };

  const validateStep = (stepIndex, { silent = false } = {}) => {
    const nextErrors = {};

    if (stepIndex === 0) {
      ["first", "last", "email", "phone", "position", "wantsDriver",
       "location", "languages", "skills", "message"].forEach((field) => {
        if (!String(data[field]).trim()) nextErrors[field] = "This field is required.";
      });

      if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
        nextErrors.email = "Enter a valid email address.";
      }

      if (data.phone.replace(/\D/g, "").length !== 10) {
        nextErrors.phone = "Enter a valid 10-digit phone number.";
      }
    }

    if (stepIndex === 1 && educationEntries.length === 0) {
      nextErrors.education = "Add at least one education entry.";
    }

    if (stepIndex === 2) {
      if (!hasWorkHistory) nextErrors.hasWorkHistory = "Choose Yes or No.";
      if (hasWorkHistory === "Yes" && workHistory.length === 0) {
        nextErrors.workHistory = "Add at least one employer.";
      }
    }

    if (stepIndex === 3) {
      if (!hasBackground) nextErrors.hasBackground = "Choose Yes or No.";
      if (hasBackground === "Yes" && background.length === 0) {
        nextErrors.background = "Add at least one background entry.";
      }
    }

    if (stepIndex === 4) {
      ["ssnCard", "driversLicense", "drivingRecordFile", "civilianRequest"]
        .forEach((field) => {
          if (!files[field]) nextErrors[field] = "This document is required.";
        });
    }

    if (stepIndex === 5) {
      ["fullName", "dob", "collectionDate", "specimenId", "testReason", "signature"]
        .forEach((field) => {
          if (!drugScreening[field].trim()) {
            nextErrors[`drug_${field}`] = "Required";
          }
        });
    }


    if (!silent) setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setStep((current) => Math.min(current + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const previousStep = () => {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const findFirstInvalidStep = () => {
    for (let index = 0; index < STEPS.length - 1; index += 1) {
      if (!validateStep(index, { silent: true })) return index;
    }
    return -1;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const invalidStep = findFirstInvalidStep();
    if (invalidStep !== -1) {
      setStep(invalidStep);
      toast.error(`Please complete the ${STEPS[invalidStep]} section.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const payload = new FormData();

    Object.entries(data).forEach(([key, value]) => payload.append(key, value));
    payload.append("education", JSON.stringify(educationEntries));
    payload.append("background", JSON.stringify(background));
    payload.append("workHistory", JSON.stringify(workHistory));
    payload.append("drivingRecord", JSON.stringify(
      data.wantsDriver === "Yes" ? drivingRecord : {}
    ));
    payload.append("drugScreening", JSON.stringify(drugScreening));

    Object.entries(files).forEach(([key, file]) => {
      if (file) payload.append(key, file);
    });

    setIsSubmitting(true);
    const loadingToast = toast.loading("Submitting application...");

    try {
      await axios.post("/applynow", payload);
      toast.dismiss(loadingToast);
      toast.success("Application submitted successfully.");
      setStep(STEPS.length - 1);
    } catch (error) {
      toast.dismiss(loadingToast);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "The application could not be submitted.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderApplicantStep = () => (
    <section className="wizard-card">
      <h2>Applicant Information</h2>

      <div className="wizard-grid two">
        <label>
          First Name *
          <input
            value={data.first}
            onChange={(e) => updateData("first", e.target.value)}
          />
          <ErrorText>{errors.first}</ErrorText>
        </label>

        <label>
          Last Name *
          <input
            value={data.last}
            onChange={(e) => updateData("last", e.target.value)}
          />
          <ErrorText>{errors.last}</ErrorText>
        </label>

        <label>
          Email *
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateData("email", e.target.value)}
          />
          <ErrorText>{errors.email}</ErrorText>
        </label>

        <label>
          Phone *
          <input
            value={data.phone}
            onChange={(e) => updateData("phone", formatPhone(e.target.value))}
          />
          <ErrorText>{errors.phone}</ErrorText>
        </label>

        <label>
          Position *
          <select
            value={data.position}
            onChange={(e) => updateData("position", e.target.value)}
          >
            <option value="">Select a position</option>
            {POSITIONS.map((position) => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
          <ErrorText>{errors.position}</ErrorText>
        </label>

        <label>
          Work Location *
          <select
            value={data.location}
            onChange={(e) => updateData("location", e.target.value)}
          >
            <option value="">Select a location</option>
            {LOCATIONS.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          <ErrorText>{errors.location}</ErrorText>
        </label>

        <label>
          Languages *
          <select
            value={data.languages}
            onChange={(e) => updateData("languages", e.target.value)}
          >
            <option value="">Select languages</option>
            {LANGUAGES.map((language) => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
          <ErrorText>{errors.languages}</ErrorText>
        </label>

        <fieldset>
          <legend>Would you like to be a driver? *</legend>
          <label className="inline-choice">
            <input
              type="radio"
              name="wantsDriver"
              value="Yes"
              checked={data.wantsDriver === "Yes"}
              onChange={(e) => updateData("wantsDriver", e.target.value)}
            />
            Yes
          </label>
          <label className="inline-choice">
            <input
              type="radio"
              name="wantsDriver"
              value="No"
              checked={data.wantsDriver === "No"}
              onChange={(e) => updateData("wantsDriver", e.target.value)}
            />
            No
          </label>
          <ErrorText>{errors.wantsDriver}</ErrorText>
        </fieldset>
      </div>

      {data.wantsDriver === "Yes" && (
        <div className="wizard-subcard">
          <h3>Driving Record</h3>
          <div className="wizard-grid two">
            <label>
              Speeding Tickets
              <input
                type="number"
                min="0"
                value={drivingRecord.speedingTickets}
                onChange={(e) =>
                  setDrivingRecord((current) => ({
                    ...current,
                    speedingTickets: e.target.value
                  }))
                }
              />
            </label>

            <label>
              Traffic Violations
              <input
                type="number"
                min="0"
                value={drivingRecord.trafficViolations}
                onChange={(e) =>
                  setDrivingRecord((current) => ({
                    ...current,
                    trafficViolations: e.target.value
                  }))
                }
              />
            </label>

            <label>
              DUIs
              <input
                type="number"
                min="0"
                value={drivingRecord.duis}
                onChange={(e) =>
                  setDrivingRecord((current) => ({
                    ...current,
                    duis: e.target.value
                  }))
                }
              />
            </label>

            <label>
              Other Violations
              <textarea
                value={drivingRecord.otherViolations}
                onChange={(e) =>
                  setDrivingRecord((current) => ({
                    ...current,
                    otherViolations: e.target.value
                  }))
                }
              />
            </label>
          </div>
        </div>
      )}

      <label>
        Professional Skills *
        <textarea
          value={data.skills}
          onChange={(e) => updateData("skills", e.target.value)}
        />
        <ErrorText>{errors.skills}</ErrorText>
      </label>

      <label>
        Why do you want to work for TBS? *
        <textarea
          value={data.message}
          onChange={(e) => updateData("message", e.target.value)}
        />
        <ErrorText>{errors.message}</ErrorText>
      </label>
    </section>
  );

  const renderEducationStep = () => (
    <section className="wizard-card">
      <h2>Education History</h2>

      <div className="wizard-grid five">
        <label>
          School *
          <input
            value={educationDraft.school}
            onChange={(e) =>
              setEducationDraft((current) => ({
                ...current,
                school: e.target.value
              }))
            }
          />
          <ErrorText>{errors.education_school}</ErrorText>
        </label>

        <label>
          Start Month *
          <select
            value={educationDraft.startMonth}
            onChange={(e) =>
              setEducationDraft((current) => ({
                ...current,
                startMonth: e.target.value
              }))
            }
          >
            <option value="">Month</option>
            {MONTHS.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <ErrorText>{errors.education_startMonth}</ErrorText>
        </label>

        <label>
          Start Year *
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={educationDraft.startYear}
            onChange={(e) =>
              setEducationDraft((current) => ({
                ...current,
                startYear: e.target.value
              }))
            }
          />
          <ErrorText>{errors.education_startYear}</ErrorText>
        </label>

        <label>
          End Month *
          <select
            value={educationDraft.endMonth}
            onChange={(e) =>
              setEducationDraft((current) => ({
                ...current,
                endMonth: e.target.value
              }))
            }
          >
            <option value="">Month</option>
            {MONTHS.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <ErrorText>{errors.education_endMonth}</ErrorText>
        </label>

        <label>
          End Year *
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear() + 10}
            value={educationDraft.endYear}
            onChange={(e) =>
              setEducationDraft((current) => ({
                ...current,
                endYear: e.target.value
              }))
            }
          />
          <ErrorText>{errors.education_endYear}</ErrorText>
        </label>
      </div>

      <button type="button" className="wizard-add" onClick={addEducation}>
        Add Education
      </button>

      <ErrorText>{errors.education}</ErrorText>

      <div className="entry-list">
        {educationEntries.map((entry, index) => (
          <article key={`${entry.school}-${index}`} className="entry-card">
            <div>
              <strong>{entry.school}</strong>
              <p>
                {entry.startMonth} {entry.startYear} – {entry.endMonth} {entry.endYear}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEducationEntries((current) =>
                  current.filter((_, itemIndex) => itemIndex !== index)
                )
              }
            >
              Remove
            </button>
          </article>
        ))}
      </div>
    </section>
  );

  const renderEmploymentStep = () => (
    <section className="wizard-card">
      <h2>Employment History</h2>

      <fieldset>
        <legend>Do you have previous employment history? *</legend>
        {["Yes", "No"].map((answer) => (
          <label key={answer} className="inline-choice">
            <input
              type="radio"
              name="hasWorkHistory"
              value={answer}
              checked={hasWorkHistory === answer}
              onChange={(e) => {
                setHasWorkHistory(e.target.value);
                if (e.target.value === "No") setWorkHistory([]);
              }}
            />
            {answer}
          </label>
        ))}
        <ErrorText>{errors.hasWorkHistory}</ErrorText>
      </fieldset>

      {hasWorkHistory === "Yes" && (
        <>
          <div className="wizard-grid two">
            {[
              ["employerName", "Employer Name"],
              ["address", "Address"],
              ["city", "City"],
              ["state", "State"],
              ["zip", "ZIP Code"],
              ["phone", "Phone"]
            ].map(([field, label]) => (
              <label key={field}>
                {label} *
                <input
                  value={workDraft[field]}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (field === "zip") value = value.replace(/\D/g, "").slice(0, 5);
                    if (field === "phone") value = formatPhone(value);
                    setWorkDraft((current) => ({ ...current, [field]: value }));
                  }}
                />
                <ErrorText>{errors[`work_${field}`]}</ErrorText>
              </label>
            ))}
          </div>

          <label>
            Duties *
            <textarea
              value={workDraft.duties}
              onChange={(e) =>
                setWorkDraft((current) => ({
                  ...current,
                  duties: e.target.value
                }))
              }
            />
            <ErrorText>{errors.work_duties}</ErrorText>
          </label>

          <label className="inline-choice">
            <input
              type="checkbox"
              checked={workDraft.currentlyEmployed}
              onChange={(e) =>
                setWorkDraft((current) => ({
                  ...current,
                  currentlyEmployed: e.target.checked,
                  reasonForLeaving: e.target.checked
                    ? ""
                    : current.reasonForLeaving
                }))
              }
            />
            Currently employed
          </label>

          {!workDraft.currentlyEmployed && (
            <label>
              Reason for Leaving *
              <textarea
                value={workDraft.reasonForLeaving}
                onChange={(e) =>
                  setWorkDraft((current) => ({
                    ...current,
                    reasonForLeaving: e.target.value
                  }))
                }
              />
              <ErrorText>{errors.work_reasonForLeaving}</ErrorText>
            </label>
          )}

          <fieldset>
            <legend>May we contact this employer? *</legend>
            {["Yes", "No"].map((answer) => (
              <label key={answer} className="inline-choice">
                <input
                  type="radio"
                  name="mayContact"
                  value={answer}
                  checked={workDraft.mayContact === answer}
                  onChange={(e) =>
                    setWorkDraft((current) => ({
                      ...current,
                      mayContact: e.target.value
                    }))
                  }
                />
                {answer}
              </label>
            ))}
            <ErrorText>{errors.work_mayContact}</ErrorText>
          </fieldset>

          <button type="button" className="wizard-add" onClick={addWork}>
            Add Employer
          </button>

          <ErrorText>{errors.workHistory}</ErrorText>

          <div className="entry-list">
            {workHistory.map((entry, index) => (
              <article key={`${entry.employerName}-${index}`} className="entry-card">
                <div>
                  <strong>{entry.employerName}</strong>
                  <p>{entry.address}, {entry.city}, {entry.state} {entry.zip}</p>
                  <p>{entry.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setWorkHistory((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );

  const renderBackgroundStep = () => (
    <section className="wizard-card">
      <h2>Background History</h2>

      <fieldset>
        <legend>Do you have convictions to report? *</legend>
        {["Yes", "No"].map((answer) => (
          <label key={answer} className="inline-choice">
            <input
              type="radio"
              name="hasBackground"
              value={answer}
              checked={hasBackground === answer}
              onChange={(e) => {
                setHasBackground(e.target.value);
                if (e.target.value === "No") setBackground([]);
              }}
            />
            {answer}
          </label>
        ))}
        <ErrorText>{errors.hasBackground}</ErrorText>
      </fieldset>

      {hasBackground === "Yes" && (
        <>
          <div className="wizard-grid two">
            <label>
              Type *
              <select
                value={backgroundDraft.type}
                onChange={(e) =>
                  setBackgroundDraft((current) => ({
                    ...current,
                    type: e.target.value
                  }))
                }
              >
                <option value="Misdemeanor">Misdemeanor</option>
                <option value="Felony">Felony</option>
              </select>
            </label>

            <label>
              Charge *
              <input
                value={backgroundDraft.charge}
                onChange={(e) =>
                  setBackgroundDraft((current) => ({
                    ...current,
                    charge: e.target.value
                  }))
                }
              />
              <ErrorText>{errors.background_charge}</ErrorText>
            </label>

            <label>
              Date *
              <input
                type="date"
                value={backgroundDraft.date}
                onChange={(e) =>
                  setBackgroundDraft((current) => ({
                    ...current,
                    date: e.target.value
                  }))
                }
              />
              <ErrorText>{errors.background_date}</ErrorText>
            </label>
          </div>

          <label>
            Explanation *
            <textarea
              value={backgroundDraft.explanation}
              onChange={(e) =>
                setBackgroundDraft((current) => ({
                  ...current,
                  explanation: e.target.value
                }))
              }
            />
            <ErrorText>{errors.background_explanation}</ErrorText>
          </label>

          <button type="button" className="wizard-add" onClick={addBackground}>
            Add Background Entry
          </button>

          <ErrorText>{errors.background}</ErrorText>

          <div className="entry-list">
            {background.map((entry, index) => (
              <article key={`${entry.charge}-${index}`} className="entry-card">
                <div>
                  <strong>{entry.type}: {entry.charge}</strong>
                  <p>{entry.date}</p>
                  <p>{entry.explanation}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setBackground((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );

  const renderDocumentsStep = () => {
    const requiredUploads = [
      ["ssnCard", "Social Security Card"],
      ["driversLicense", "Driver's License"],
      ["drivingRecordFile", "7-Year Driving Record"],
      ["civilianRequest", "Sheriff's Department Civilian Request"]
    ];

    return (
      <section className="wizard-card">
        <h2>Required Documents</h2>
        <p className="wizard-note">
          Upload PDF, JPG, JPEG, PNG, HEIC, or HEIF files. Each file may be
          up to 10 MB.
        </p>

        <div className="upload-list">
          {requiredUploads.map(([field, label]) => (
            <label key={field} className="upload-card">
              <span>{label} *</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,image/*"
                onChange={(e) => updateFile(field, e.target.files?.[0])}
              />
              {files[field] && <small>{files[field].name}</small>}
              <ErrorText>{errors[field]}</ErrorText>
            </label>
          ))}

          <label className="upload-card">
            <span>Cover Letter (Optional)</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={(e) => updateFile("cover", e.target.files?.[0])}
            />
            {files.cover && <small>{files.cover.name}</small>}
          </label>
        </div>
      </section>
    );
  };

  const renderDrugStep = () => (
    <section className="wizard-card">
      <h2>Drug Screening Information</h2>

      <div className="wizard-grid two">
        {[
          ["fullName", "Full Name"],
          ["dob", "Date of Birth", "date"],
          ["collectionDate", "Collection Date", "date"],
          ["specimenId", "Specimen ID"],
          ["testReason", "Reason for Test"],
          ["signature", "Typed Signature"]
        ].map(([field, label, type = "text"]) => (
          <label key={field}>
            {label} *
            <input
              type={type}
              value={drugScreening[field]}
              onChange={(e) =>
                setDrugScreening((current) => ({
                  ...current,
                  [field]: e.target.value
                }))
              }
            />
            <ErrorText>{errors[`drug_${field}`]}</ErrorText>
          </label>
        ))}
      </div>
    </section>
  );


  const renderReviewStep = () => (
    <section className="wizard-card">
      <h2>Review and Submit</h2>

      <div className="review-grid">
        <article>
          <h3>Applicant</h3>
          <p>{data.first} {data.last}</p>
          <p>{data.email}</p>
          <p>{data.phone}</p>
          <p>{data.position}</p>
          <p>{data.location}</p>
        </article>

        <article>
          <h3>Entries</h3>
          <p>Education: {educationEntries.length}</p>
          <p>Employers: {workHistory.length}</p>
          <p>Background entries: {background.length}</p>
        </article>

        <article>
          <h3>Documents</h3>
          {Object.entries(files).map(([key, file]) => (
            <p key={key}>
              {key}: {file ? file.name : "Not uploaded"}
            </p>
          ))}
        </article>

      </div>

      <p className="wizard-warning">
        By submitting, the applicant confirms that the information supplied is
        accurate and authorizes TBS to review the submitted employment documents.
      </p>
    </section>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 0: return renderApplicantStep();
      case 1: return renderEducationStep();
      case 2: return renderEmploymentStep();
      case 3: return renderBackgroundStep();
      case 4: return renderDocumentsStep();
      case 5: return renderDrugStep();
      case 7: return renderReviewStep();
      default: return null;
    }
  };

  return (
    <div>
      <Header activePage="/applynow" />

      <main className="apply-wizard-page">
        <div className="apply-wizard-shell">
          <header className="wizard-header">
            <p className="wizard-eyebrow">Traffic & Barrier Solutions</p>
            <h1>Job Application</h1>
            <p>
              Complete each section. Required information must be finished
              before you can continue.
            </p>
          </header>

          <div className="wizard-progress">
            <div className="wizard-progress-row">
              <strong>Step {step + 1} of {STEPS.length}</strong>
              <span>{STEPS[step]}</span>
            </div>
            <div className="wizard-progress-track">
              <div
                className="wizard-progress-value"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            onKeyDown={(e) => {
              if (e.key === "Enter" && step < STEPS.length - 1) e.preventDefault();
            }}
          >
            {renderCurrentStep()}

            <div className="wizard-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="wizard-back"
                  onClick={previousStep}
                  disabled={isSubmitting}
                >
                  ← Previous
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  className="wizard-next"
                  onClick={nextStep}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="wizard-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApplyNow;
