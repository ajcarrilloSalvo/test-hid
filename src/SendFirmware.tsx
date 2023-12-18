import React, { useEffect, useState } from "react";

const SendFirmware: React.FC<{ file: File }> = ({ file }) => {
  const [uint8Array, setUint8Array] = useState<Uint8Array | null>(null);
  const [device, setDevice] = useState(null);

  const getUint8Array = async () => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    setUint8Array(uint8Array);
  };

  const handleClickSendFirmware = async () => {
    /*const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const fwSize = uint8Array.length;
    const fwCrc = uint8Array.reduce((acc, b) => acc + b, 0);

    console.log(`fw_size = ${fwSize}`);
    console.log(`fw_crc = ${fwCrc}`);

    const deviceFilter = {
      vendorId: 13932,
      productId: 2,
    };
    const requestParams = { filters: [deviceFilter] };
    const [device] = await navigator.hid.requestDevice(requestParams);

    const maxDataSize = 61;
    const firstChunkDataSize = 43;
    const chunkDataSize = 59;
    const magicWord = 659837149;
    const fwUploadAddress = 0x0800a000;
    const vendorId = 13932;
    const productId = 2;

    let seq = 0;

    const firmwareInfo = packFirmwareInfo(
      magicWord,
      fwUploadAddress,
      fwSize,
      fwCrc
    );

    let report = new Uint8Array([
      255,
      4,
      6,
      seq,
      ...firmwareInfo,
      ...new Uint8Array(firstChunkDataSize), // Esto crea un array de bytes con ceros si necesitas relleno
    ]);

    await sendReport(device, report[0], report);

    seq = 1;
    let fwIndex = 0;

    while (fwIndex < fwSize) {
      const remainingSize = Math.min(chunkDataSize, fwSize - fwIndex);
      const chunkData = new Uint8Array(remainingSize);
      for (let i = 0; i < remainingSize; ++i) {
        chunkData[i] = uint8Array[fwIndex++];
      }

      report = new Uint8Array([255, 4, 6, seq, ...chunkData]);
      await sendReport(device, report[0], report);

      if (remainingSize < chunkDataSize) {
        break; // Si el chunk es más pequeño que el tamaño máximo, hemos terminado
      }

      seq++;
    }*/
    /*const deviceFilter = {
      vendorId: 13932,
      productId: 2,
    };
    const requestParams = { filters: [deviceFilter] };
    const [device] = await navigator.hid.requestDevice(requestParams);
    device.addEventListener("inputreport", handleHIDControllerInputReport);
    await device!.open();*/

    /*device!.addEventListener("inputreport", (event) => {
      console.log("HID REPORT RESPONSE");
      const { data, device, reportId } = event;

      // Procesar los datos recibidos aquí
      console.log(`Report ID: ${reportId}`);

      // Puedes convertir 'data' a un formato más útil si es necesario
      // Por ejemplo, un Uint8Array
      const dataArray = new Uint8Array(data.buffer);
      console.log(dataArray);
    });*/
    let emptyba = new Uint8Array(61);
    sendReport(device, 255, 4, 1, []);
  };

  const sendReport = async (
    device,
    reportId,
    reportType,
    reportSubtype,
    payload
  ) => {
    //const report = new Uint8Array([reportId, ...data]);
    //console.log("send report: ", report.slice(1));
    //device.sendReport(reportId, report.slice(1));
    const decimalArray = [reportId, reportType, reportSubtype].concat(payload);
    const hexArr = padHidOutputReport(decimalArray);
    const data = parseHexArray(hexArr.join(" "));
    const reportData = new Uint8Array(data!.buffer).slice(1);
    console.log("sending hid report", hexArr.join(","));
    device.sendReport(reportId, reportData);
  };

  function handleHIDControllerInputReport(evt) {
    const { data, device, reportId } = evt;
    console.log("handleHIDControllerInputReport: ", { reportId, data });
    const dataArray = new Uint8Array(data.buffer);
    console.log("handleHIDControllerInputReport: ", dataArray);
  }

  function packFirmwareInfo(magicWord, fwUploadAddress, fwSize, fwCrc) {
    const buffer = new ArrayBuffer(16); // 4 valores * 4 bytes cada uno
    const view = new DataView(buffer);
    view.setUint32(0, magicWord, true); // true para Little Endian
    view.setUint32(4, fwUploadAddress, true);
    view.setUint32(8, fwSize, true);
    view.setUint32(12, fwCrc, true);
    return new Uint8Array(buffer);
  }

  const connectHidDevice = async (pairedDevice) => {
    const connection = {
      hidConnected: false,
      serialConnected: false,
    };
    const deviceFilter = {
      vendorId: 13932,
      productId: 2,
    };
    const requestParams = { filters: [deviceFilter] };

    try {
      let connectedDevice = undefined;
      if (pairedDevice) {
        connectedDevice = pairedDevice;
      } else {
        const [device] = await navigator.hid.requestDevice(requestParams);
        connectedDevice = device;
      }

      if (connectedDevice) {
        await connectedDevice.open();
        connection.hidDevice = connectedDevice;
        connection.hidConnected = true;
      } else {
        throw new Error("UNKOWN_ERROR");
      }

      return connection;
    } catch (e) {
      return connection;
    }
  };

  async function connect() {
    const deviceFilter = {
      vendorId: 13932,
      productId: 2,
    };
    const requestParams = { filters: [deviceFilter] };
    const [device] = await navigator.hid.requestDevice(requestParams);
    await device.open();

    device.addEventListener("inputreport", (event) => {
      console.log("HID REPORT RESPONSE");
      const { data, device, reportId } = event;

      // Procesar los datos recibidos aquí
      console.log(`Report ID: ${reportId}`);
      console.log(`Data: ${data}`);

      // Puedes convertir 'data' a un formato más útil si es necesario
      // Por ejemplo, un Uint8Array
      const dataArray = new Uint8Array(data.buffer);
      console.log(dataArray);
    });

    setDevice(device);
  }

  const parseHexArray = (hexString: string) => {
    // Remove non-hex characters
    hexString = hexString.replace(/[^0-9a-fA-F]/g, "");
    if (hexString.length % 2) return null;

    // Parse each character pair as a hex byte value
    const u8 = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2)
      u8[i / 2] = parseInt(hexString.substr(i, 2), 16);

    return new DataView(u8.buffer);
  };

  const padHidOutputReport = (decimalArray: number[]) => {
    const bytesToPad = 64 - decimalArray.length;
    for (let d = 0; d < bytesToPad; d++) {
      decimalArray.push(0);
    }
    const hexArr: string[] = [];
    for (let h = 0; h < decimalArray.length; h++) {
      hexArr.push(decimalArray[h].toString(16).padStart(2, "0"));
    }
    return hexArr;
  };

  return (
    <>
      <div>
        <h2>File Details</h2>
        <div>Name: {file.name}</div>
        <div>Size: {file.size}</div>
        <div>Type: {file.type}</div>
      </div>
      <div>
        <button onClick={connect}>Connect</button>
        <button onClick={handleClickSendFirmware}>Send Firmware</button>
      </div>
    </>
  );
};

export default SendFirmware;
