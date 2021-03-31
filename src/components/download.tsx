import React, { useState, useCallback } from 'react';

const FILE_URL =
  'https://gw.alipayobjects.com/mdn/rms_95cbec/afts/img/A*XZCbTK78DIYAAAAAAAAAAAAAARQnAQ';

export default function Download() {
  const [recv, setRecv] = useState(0);
  const [total, setTotal] = useState(0);
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
      setRecv((oldRecv) => oldRecv + value.length);
      // console.log(`Received ${value.length}`);
    }
  }, []);
  return (
    <div>
      <button onClick={startDownload}>download</button>
      <div>
        {recv} of {total}
      </div>
      <div>{((recv * 100) / total).toFixed(2)}%</div>
    </div>
  );
}
