import React from 'react';

interface Props {
  onFileSelected: (file: File) => void;
}

const FirmwareUploader: React.FC<Props> = ({ onFileSelected }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
};

export default FirmwareUploader;
