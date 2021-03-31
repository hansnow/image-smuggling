import React, { useState, useCallback } from 'react';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * demo files
 * 6.5M PDF
 * https://gw.alipayobjects.com/mdn/rms_95cbec/afts/img/A*XZCbTK78DIYAAAAAAAAAAAAAARQnAQ
 * 62.2M Sketch
 * https://gw.alipayobjects.com/mdn/rms_95cbec/afts/img/A*OuurRLk4tFYAAAAAAAAAAAAAARQnAQ
 */

const FILE_URL =
  'https://gw.alipayobjects.com/mdn/rms_95cbec/afts/img/A*XZCbTK78DIYAAAAAAAAAAAAAARQnAQ';

export default function Download() {
  const [file, setFile] = useState(new Uint8Array());
  const [recv, setRecv] = useState(0);
  const [total, setTotal] = useState(0);
  const [unzipProgress, setUnzipProgress] = useState(0);
  const startDownload = useCallback(async () => {
    const response = await fetch(FILE_URL);
    const reader = response.body?.getReader();
    const contentLength = +(response.headers.get('content-length') ?? 0);
    setTotal(contentLength);
    while (reader) {
      const { done, value } = await reader.read();
      if (done || !value) {
        break;
      }
      setFile((oldFile) => new Uint8Array([...oldFile, ...value]));
      setRecv((oldRecv) => oldRecv + value.length);
      // console.log(`Received ${value.length}`);
    }
  }, []);
  const unzip = useCallback(async () => {
    const zip = await JSZip.loadAsync(file);
    zip.forEach((path, f) => {
      f.async('blob', (info) => {
        setUnzipProgress(info.percent);
      }).then((blob) => {
        saveAs(blob, path);
      });
    });
  }, [file]);
  return (
    <div>
      <button onClick={startDownload}>download</button>
      <div>
        {recv} of {total}
      </div>
      <div>download {((recv * 100) / (total || Infinity)).toFixed(2)}%</div>
      <button onClick={unzip}>unzip</button>
      <div>unzip {unzipProgress.toFixed(2)}%</div>
    </div>
  );
}
