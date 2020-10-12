import { Modal, Button, Col, Row, Typography, Tooltip } from 'antd';
import React, { useState } from 'react';
import ResourceBreadcrumb from '../common/ResourceBreadcrumb';
import { useParams } from 'react-router-dom';
import FavouriteButton from '../common/buttons/FavouriteButton';
import {PlusOutlined, MinusOutlined} from '@ant-design/icons';
import IconButton from '../common/buttons/IconButton';
import { createNewConfig, getResourceConfig, updateResourceConfig } from '../common/DashboardConfigUtils';

export default function ListHeader(props){
  const [onAddColumn, setOnAddColumn] = useState(false);
  const [onAddIcon, setOnAddIcon] = useState(false);

  let params = useParams();
  let title = '';

  if(params.resource)
    title = props.kind.slice(0, -4);
  else {
    if(params.group)
      title = params.group;
    else
      title = window.location.pathname.split('/')[1];
  }

  const setIcon = icon => {
    setOnAddIcon(false);
    updateDashConfig(icon);
  }

  const updateDashConfig = (key) => {
    let tempResourceConfig = getResourceConfig(params);

    if(!_.isEmpty(tempResourceConfig)){
      tempResourceConfig.icon = key;
    } else {
      tempResourceConfig = createNewConfig(params, {kind: props.kind});

      /** The resource doesn't have a config, create one */
      tempResourceConfig.icon = key;
    }

    updateResourceConfig(tempResourceConfig, params);
  }

  const Icon = ({type, ...rest}) => {
    const icons = require(`@ant-design/icons`);
    const Component = icons[type];
    return <Component {...rest} />;
  }

  return(
    <div style={{marginBottom: 16}}>
      <Row align={'middle'}>
        <Col span={12}>
          <Row align={'bottom'}>
            <Col>
              <ResourceBreadcrumb />
            </Col>
            <Col>
              <Row align={'bottom'}>
                <Col>
                  <Tooltip title={'Change Icon'}>
                    <Button onClick={() => setOnAddIcon(true)}
                            loading={onAddIcon}
                            style={{border: 'none', boxShadow: 'none', marginRight: 4, background: 'none'}}
                            icon={<Icon type={getResourceConfig(params).icon ? getResourceConfig(params).icon : 'ApiOutlined'}
                                        style={{fontSize: '28px'}}
                            />}
                    />
                  </Tooltip>
                </Col>
                <Col>
                  <Typography.Title level={3} style={{marginBottom: 0}}>{title}</Typography.Title>
                </Col>
              </Row>
            </Col>
            <Col>
              <FavouriteButton {...props} list={true}
                               favourite={getResourceConfig(params).favourite ?
                               1 : 0}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <div style={{float: 'right'}}>
            <Button style={{minWidth: '5em'}}
                    type={!onAddColumn ? 'primary' : 'danger'}
                    icon={!onAddColumn ? <PlusOutlined/> : <MinusOutlined/>}
                    onClick={() => {
                      setOnAddColumn(prev => {
                        props.addColumn(!prev);
                        //TODO: make this work
                        return /**!*/prev
                      });
                    }}
            >
              {!onAddColumn ? 'ADD COLUMN' : 'RETURN'}
            </Button>
          </div>
        </Col>
      </Row>
      <IconButton setIcon={setIcon} onAddIcon={onAddIcon} setOnAddIcon={setOnAddIcon} />
    </div>
  )
}
