import React, { useEffect, useState } from 'react';
import {
  Space, Alert,
  Badge, Button, Layout,
  Typography, Tooltip,
  Popconfirm, Tag, Divider, Descriptions, message
} from 'antd';
import { Link } from 'react-router-dom';
import DragOutlined from '@ant-design/icons/lib/icons/DragOutlined';
import PushpinOutlined from '@ant-design/icons/lib/icons/PushpinOutlined';
import ExclamationCircleOutlined from '@ant-design/icons/lib/icons/ExclamationCircleOutlined';
import DeleteOutlined from '@ant-design/icons/lib/icons/DeleteOutlined';
import ResourceBreadcrumb from './ResourceBreadcrumb';
import FavouriteButton from './buttons/FavouriteButton';

function ResourceHeader(props) {

  const [isPinned, setIsPinned] = useState(false);

  /** Delete the Resource */
  const handleClick_delete = () => {
    let promise = props.deleteFunc(
      props.resource.metadata.name,
      props.resource.metadata.namespace,
    )

    promise
      .then(() => {
        message.success(props.kind + ' deleted');
      })
      .catch(() => {
        message.error('Could not delete the ' + props.kind);
      });
  }

  const editDescription = async (value) => {
    props.resource.metadata.annotations = {...props.resource.metadata.annotations, description: value};

    console.log(props.updateFunc);

    await props.updateFunc(
      props.resource.metadata.name,
      props.resource.metadata.namespace,
      props.resource
    )
  }

  const header = () => {
    return (
      <div>
        <div>
          {!props.onCustomView ? <ResourceBreadcrumb /> : null}
          <Badge color='#1890FF' text={<Link to={{
              pathname: '/' + props.resourceRedirect + '/' + props.resource.metadata.name,
              state: {
                resource: props.resource
              }
            }} >
              <Tooltip title={props.resource.metadata.name} placement={'top'}>
                <Typography.Text strong style={{fontSize: 20}}>
                  {props.altName ? props.altName
                    : props.name}
                </Typography.Text>
              </Tooltip>
            </Link>}
          />
          <FavouriteButton />
          {props.status ? (
            <Tag color={props.status.ok ? 'blue' : 'red'} style={{marginLeft: '1em'}} >
              {props.status.reason}
            </Tag>
          ) : null}
          {
            !props.onCustomView ? (
              <div style={{float: "right"}}>
                <Space align={'center'}>
                  <Tooltip title={'Delete ' + props.name} placement={'bottomRight'}>
                    <Popconfirm
                      placement="topRight"
                      title="Are you sure?"
                      icon={<ExclamationCircleOutlined style={{ color: 'red' }}/>}
                      onConfirm={handleClick_delete}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="primary" danger icon={<DeleteOutlined />}
                              onClick={event => {
                                event.stopPropagation();
                              }}
                      > DELETE
                      </Button>
                    </Popconfirm>
                  </Tooltip>
                </Space>
              </div>
            ) : (
              <div style={{float: 'right'}}>
                <Tooltip title={'Pin'} placement={'top'}>
                  <PushpinOutlined style={isPinned ?
                    {
                      fontSize: '20px',
                      marginRight: 10,
                      marginLeft: 30,
                      color: '#1890FF'
                    }:{
                      fontSize: '20px',
                      marginRight: 10,
                      marginLeft: 30
                    }}
                    onClick={() => {
                      setIsPinned(!isPinned);
                      props.func(props.resource.metadata.name);
                    }}
                  />
                </Tooltip>
                <Tooltip title={'Drag'} placement={'top'}>
                  <DragOutlined className={'draggable'}
                                style={{
                                  fontSize: '20px',
                                  marginLeft: 20
                                }}
                  />
                </Tooltip>
              </div>
            )
          }
        </div>
        <Descriptions style={{marginTop: 15, marginLeft: 15}}>
          <Descriptions.Item>
            <Typography.Paragraph editable={{ onChange: editDescription }} type={'secondary'} style={{marginBottom: 0}}>
              {props.resource.metadata.annotations && props.resource.metadata.annotations.description ?
                props.resource.metadata.annotations.description :
                'No description for this ' + props.kind
              }
            </Typography.Paragraph >
          </Descriptions.Item>
        </Descriptions>
        <Divider style={{marginTop: 0, marginBottom: 15, marginLeft: '-100px', marginRight: '-100px', width: '100vw'}}/>
      </div>
    )
  }

  return (
    <Alert.ErrorBoundary>
      <Layout style={{background: '#fff'}}>
        {header()}
      </Layout>
    </Alert.ErrorBoundary>
  );
}

export default ResourceHeader;
