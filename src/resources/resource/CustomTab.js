import { Alert, Card } from 'antd';
import React, { useState } from 'react';

export default function CustomTab(props){
  const [views, setViews] = useState([])

  return(
    <Card style={{overflow: 'hidden', minHeight: '72vh'}}>
      {views.length === 0 ? (
        <Alert
          closable
          message="Nothing to show here..."
          description="Try adding something."
          type="info"
          showIcon
        />
      ) : (
        <div/>
      )}
    </Card>
  )
}
