import React, { useState } from 'react';
import {
  Row, Col,
  Space, Alert,
  Button, Divider,
  Typography, Tooltip,
  Popconfirm, Descriptions, message, PageHeader
} from 'antd';
import { Link } from 'react-router-dom';
import DragOutlined from '@ant-design/icons/lib/icons/DragOutlined';
import PushpinOutlined from '@ant-design/icons/lib/icons/PushpinOutlined';
import ExclamationCircleOutlined from '@ant-design/icons/lib/icons/ExclamationCircleOutlined';
import DeleteOutlined from '@ant-design/icons/lib/icons/DeleteOutlined';
import ResourceBreadcrumb from '../common/ResourceBreadcrumb';
import FavouriteButton from '../common/buttons/FavouriteButton';
import { getResourceConfig } from '../DashboardConfigUtils';

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

  return (
    <Alert.ErrorBoundary>
      <div style={{width: '100%'}}>
        <Row align={'bottom'}>
          <Col span={12}>
            <Row align={'bottom'}>
              <Col>
                {!props.onCustomView ? <ResourceBreadcrumb /> : null}
              </Col>
              <Col>
                <Link to={{
                  pathname: '/' + props.resourceRedirect + '/' + props.resource.metadata.name,
                  state: {
                    resource: props.resource
                  }
                }} >
                  <Tooltip title={props.resource.metadata.name} placement={'top'}>
                    <Typography.Title level={3} style={{marginBottom: 0}}>
                      {props.altName ? props.altName
                        : props.name}
                    </Typography.Title>
                  </Tooltip>
                </Link>
              </Col>
              <Col>
                <span style={{marginLeft: 10}}>
                  <FavouriteButton resourceName={props.resource.metadata.name}
                                   favourite={(props.resource.metadata.annotations &&
                                     props.resource.metadata.annotations.favourite) ? 1 : 0
                                   }
                                   resourceList={[props.resource]}
                  />
                </span>
              </Col>
            </Row>
          </Col>
          <Col span={12}>
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
          </Col>
        </Row>
      </div>
        {/*<Row>
          <Col>
            <Descriptions style={{marginTop: 10, marginLeft: 15}}>
              <Descriptions.Item>
                <Typography.Paragraph editable={{ onChange: editDescription }} type={'secondary'} style={{marginBottom: 0}}>
                  {props.resource.metadata.annotations && props.resource.metadata.annotations.description ?
                    props.resource.metadata.annotations.description :
                    'No description for this CRD'
                  }
                </Typography.Paragraph >
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
        <Divider style={{marginTop: 0, marginBottom: 15}} />*/}
    </Alert.ErrorBoundary>
  );
}

export default ResourceHeader;
