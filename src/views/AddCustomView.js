import { Alert, Modal, Select, Input, Typography, Row, Col, Badge, message } from 'antd';
import React, { useRef, useState } from 'react';
import PlusSquareOutlined from '@ant-design/icons/lib/icons/PlusSquareOutlined';
import PlusSquareTwoTone from '@ant-design/icons/lib/icons/PlusSquareTwoTone';
import { dashLowercase } from '../services/stringUtils';

function AddCustomView(props){
  const [showAddCV, setShowAddCV] = useState(false);
  const [selectedCRDs, setSelectedCRDs] = useState(() => {
    if(props.selected)
      return [props.selected];
    else return [];
  });
  const [noNameAlert, setNoNameAlert] = useState(false);
  let viewName = useRef('');

  let options = [];

  window.api.CRDs.current.forEach(CRD => options.push(CRD.metadata.name));

  const filteredOptions = options.filter(CRD => !selectedCRDs.includes(CRD));

  const handleChange = items => {
    setSelectedCRDs(items);
  };

  const handleSubmit = () => {
    if(viewName.current === '')
      setNoNameAlert(true);
    else {
      let namespace = 'default';
      let CRD = window.api.getCRDFromKind('View');

      let crds = [];
      selectedCRDs.forEach(crd => {
        crds.push({
          crdName: crd
        });
      })

      let item = {
        apiVersion: CRD.spec.group + '/' + CRD.spec.version,
        kind: CRD.spec.names.kind,
        metadata: {
          name: dashLowercase(viewName.current),
          namespace: namespace
        },
        spec: {
          crds: crds,
          viewName: viewName.current
        }
      }

      window.api.createCustomResource(
        CRD.spec.group,
        CRD.spec.version,
        namespace,
        CRD.spec.names.plural,
        item
      ).then(() => {
        setSelectedCRDs([]);
        setShowAddCV(false);
      }).catch(error => {
        console.log(error);
        message.error('Could not create custom view');
      });
    }
  }

  return(
    <div>
      <div onClick={() => setShowAddCV(true)}>
        {props.selected ? (
          <Row align={'middle'}>
            <PlusSquareTwoTone style={{ fontSize: '20px', marginRight: '8px' }} />
            <a>New Custom View</a>
          </Row>
        ) : (
          <div>
            <PlusSquareOutlined style={{ fontSize: '20px' }} />
            <span>New Custom View</span>
          </div>
        )}
      </div>
      <Modal
        destroyOnClose
        title={'New Custom View'}
        visible={showAddCV}
        onOk={handleSubmit}
        onCancel={() => { setSelectedCRDs([]); setShowAddCV(false)}}
      >
        { noNameAlert ? (
          <Alert message="Please choose a name for your custom view" type="error" showIcon style={{marginBottom: 16}} />
        ) : null }
        <Row align={'middle'} gutter={[16, 16]}>
          <Col span={6}>
            <Badge text={<Typography.Text strong>View Name</Typography.Text>} status={'processing'} />
          </Col>
          <Col span={18}>
            <Input placeholder={'Insert name'} role={'input'}
                   onChange={e => {viewName.current = e.target.value}}
            />
          </Col>
        </Row>
        <Row align={'middle'} gutter={[16, 16]}>
          <Col span={6}>
            <Badge text={<Typography.Text strong>CRDs</Typography.Text>} status={'processing'} />
          </Col>
          <Col span={18}>
            <Select
              aria-label={'select'}
              mode={'multiple'}
              placeholder={'Select CRDs'}
              value={selectedCRDs}
              style={{ width: '100%' }}
              onChange={handleChange}
            >
              {filteredOptions.map(CRD => (
                <Select.Option key={CRD} value={CRD}>
                  {CRD}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Modal>
    </div>
  )
}

export default AddCustomView;
