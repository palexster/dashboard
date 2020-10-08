import { CheckCircleTwoTone, ExclamationCircleTwoTone } from '@ant-design/icons';
import { Row, Col, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import React from 'react';
import { useParams } from 'react-router-dom';

export const renderResourceList = (text, record, dataIndex, resourceList) => {
  let params = useParams();

  let resource = resourceList.find(item => {return item.metadata.name === record.Name});

  if(Array.isArray(text)){
    let items = [];

    if(typeof text[0] === 'object'){
      items.push(text.length);
    }else{
      text.forEach(item => {
        if (typeof item === "boolean"){
          items.push(
            item ? <CheckCircleTwoTone key={'array_' + record.Name + '_' + item + Math.random()}
                                       twoToneColor="#52c41a"
            /> : <ExclamationCircleTwoTone key={'array_' + record.Name + '_' + item + Math.random()}
                                           twoToneColor="#f5222d"
            />
          );
        }
        else {
          items.push(<Tag key={'array_' + record.Name + '_' + item + Math.random()}>{item}</Tag>);
        }
      })
    }

    return(
      <div>
        {items}
      </div>
    )
  } else if(typeof text === "boolean"){
    return (
      text ? <CheckCircleTwoTone twoToneColor="#52c41a" /> :
        <ExclamationCircleTwoTone twoToneColor="#f5222d" />
    )
  } else if(typeof text === 'object'){
    console.log(text)
    let items = [];

    for (let key in text) {
      if(text.hasOwnProperty(key)){
        items.push(
          <Row style={{maxWidth: '30em'}}>
            <Col span={12}>
              <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {key}:
              </div>
            </Col>
            <Col span={12}>
              {(typeof text[key] === 'object' || Array.isArray(text[key])) ?
                <Tag>...</Tag> :
                <Tag style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{text[key]}</Tag>
              }
            </Col>
          </Row>
        )
      }
    }

    return(
      <div>{items}</div>
    )
  }

  return (
    dataIndex === 'Name' ? (
      <Link style={{ color: 'rgba(0, 0, 0, 0.85)'}} to={{
        pathname: '/' + window.location.pathname.split('/')[1] + '/' +
          (params.group ? params.group + '/' : '') +
          params.version + '/' +
          (resource.metadata.namespace ? 'namespaces/' + resource.metadata.namespace + '/' : '') +
          params.resource + '/' +
          resource.metadata.name
      }} >
        <Typography.Text strong>{text}</Typography.Text>
      </Link>
    ) : (
      <div>{text}</div>
    )
  )
}
