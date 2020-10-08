import { Button, Col, Row, Typography } from 'antd';
import React, { useState } from 'react';
import ResourceBreadcrumb from '../ResourceBreadcrumb';
import { useParams } from 'react-router-dom';
import FavouriteButton from '../buttons/FavouriteButton';
import Icon, {PlusOutlined, MinusOutlined} from '@ant-design/icons';

export default function ListHeader(props){
  const [onAddColumn, setOnAddColumn] = useState(false);
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

  return(
    <div style={{marginBottom: 16}}>
      <Row align={'middle'}>
        <Col span={12}>
          <Row align={'bottom'}>
            <Col>
              <ResourceBreadcrumb />
            </Col>
            <Col>
              <Typography.Title level={3} style={{marginBottom: 0}}>{title}</Typography.Title>
            </Col>
            <Col>
              <div>
                <FavouriteButton {...props} />
              </div>
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
    </div>
  )
}
