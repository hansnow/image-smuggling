import React, { useState, useCallback, useRef } from 'react';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * demo files
 * 6.5M PDF
 * https://gw.alipayobjects.com/mdn/rms_95cbec/afts/img/A*XZCbTK78DIYAAAAAAAAAAAAAARQnAQ
 * 62.2M Sketch
 * https://gw.alipayobjects.com/mdn/rms_95cbec/afts/img/A*OuurRLk4tFYAAAAAAAAAAAAAARQnAQ
 * 70.4M Keynot
 * https://gw.alipayobjects.com/mdn/rms_95cbec/afts/img/A*wwcISrVUHK4AAAAAAAAAAAAAARQnAQ
 */

const FILE_URL =
  'https://gw.alipayobjects.com/mdn/rms_95cbec/afts/img/A*OuurRLk4tFYAAAAAAAAAAAAAARQnAQ';
const fetchController = new AbortController();
const { signal } = fetchController;

export default function Download() {
  const file = useRef(new Uint8Array());
  const [recv, setRecv] = useState(0);
  const [total, setTotal] = useState(0);
  const [unzipProgress, setUnzipProgress] = useState(0);
  const startDownload = useCallback(async () => {
    const response = await fetch(FILE_URL, { signal });
    const reader = response.body?.getReader();
    const contentLength = +(response.headers.get('content-length') ?? 0);
    // 重新初始化一个 Uint8Array
    file.current = new Uint8Array(contentLength);
    setTotal(contentLength);
    let offset = 0;
    while (reader) {
      const { done, value } = await reader.read();
      if (done || !value) {
        break;
      }
      file.current.set(value, offset);
      offset += value.length;
      setRecv((oldRecv) => oldRecv + value.length);
    }
  }, []);
  const unzip = useCallback(async () => {
    const zip = await JSZip.loadAsync(file.current);
    zip.forEach((path, f) => {
      f.async('blob', (info) => {
        setUnzipProgress(info.percent);
      }).then((blob) => {
        saveAs(blob, path);
      });
    });
  }, [file]);
  const cancelFetch = useCallback(() => {
    fetchController.abort();
  }, []);
  return (
    <div>
      <button onClick={startDownload}>download</button>
      <div>
        {recv} of {total}
      </div>
      <div>download {((recv * 100) / (total || Infinity)).toFixed(2)}%</div>
      <button onClick={unzip}>unzip</button>
      <div>unzip {unzipProgress.toFixed(2)}%</div>
      <button onClick={cancelFetch}>cancel fetch</button>
    </div>
  );
}
