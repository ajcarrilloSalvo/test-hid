import { useState } from 'react';
import FirmwareUploader from './FirmwareUploader';
import SendFirmware from './SendFirmware';

function App() {
  const [firmwareFile, setFirmwareFile] = useState<File | null>(null);

  const handleFirmwareSelected = (file: File) => {
    setFirmwareFile(file);
  };

  return (
    <div>
      <h1>Firmware Uploader</h1>
      <FirmwareUploader onFileSelected={handleFirmwareSelected} />
      {
        firmwareFile ? (
          <SendFirmware file={firmwareFile} />
        ) : null
      }
    </div>
  );
}

export default App;
