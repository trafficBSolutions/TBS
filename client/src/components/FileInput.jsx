import React, { useState } from 'react';
import '../css/FileInput.css';

const FileInput = ({ type, onChange }) => {
  const [fileNames, setFileNames] = useState([]);

  const updateFileNames = (event) => {
    const files = event.target.files;
    if (files) {
      const names = Array.from(files).map(file => file.name);
      setFileNames(names);
      onChange(files[0]); // Pass the selected file to the parent component
    }
  };

  return (
    <div className="file-input-container">
      <label htmlFor="fileInput" className="file-label">
        {fileNames.length > 0 ? fileNames.join(', ') : 'Choose a file...'}
      </label>
      <input
        type={type}
        id="fileInput"
        className="fileInput"
        onChange={(e) => updateFileNames(e.target.files)}
        multiple={type === 'file' && true} // Allow multiple file selection if type is file
      />
    </div>
  );
};

export default FileInput;