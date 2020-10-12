import React, { useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/theme-monokai';

export default function Logs(){
  const [log, setLog] = useState('');

  useEffect(() => {
    window.api.getPodLogs(window.location.pathname).then(res => {
      setLog(res);
    })
  }, [])

  return(
    <div>
      <AceEditor
        mode={'markdown'}
        theme="monokai"
        fontSize={16}
        value={log}
        readOnly
        highlightActiveLine
        showLineNumbers
        tabSize={2}
        width={'auto'}
      />
    </div>
  )
}
