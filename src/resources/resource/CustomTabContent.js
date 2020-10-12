import { Alert, Row, Col, Button, Card, Input, Tooltip, Divider } from 'antd';
import React, { useState } from 'react';
import FormViewer from '../../editors/OAPIV3FormGenerator/FormViewer';
import './CustomTab.css'
import { useParams } from 'react-router-dom';
import { CloseOutlined, SaveOutlined, LoadingOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import { getResourceConfig, updateResourceConfig } from '../common/DashboardConfigUtils';
import Utils from '../../services/Utils';

export default function CustomTab(props){
  const [deleting, setDeleting] = useState(false);
  const [editTabName, setEditTabName] = useState(false);
  const [cardTitle, setCardTitle] = useState(props.cardTitle);
  const [onContentEdit, setOnContentEdit] = useState(!(props.cardContent && props.cardContent.length !== 0));
  //const [onAddParameter, setOnAddParameter] = useState(false);
  let params = useParams();

  const onDeleteContent = () => {
    setDeleting(true);
    props.onDeleteContent(props.cardTitle)
  }

  const updateTitle = (name) => {
    setEditTabName(false);

    let tempResourceConfig = getResourceConfig(params);
    tempResourceConfig.render.tabs.find(item => item.tabName === props.tabName)
      .tabContent.find(item => item.cardTitle === cardTitle).cardTitle = name;
    updateResourceConfig(tempResourceConfig, params);

    setCardTitle(name);
  }

  const saveParameter = value => {
    let tempResourceConfig = getResourceConfig(params);
    let cardContent = tempResourceConfig.render.tabs.find(item => item.tabName === props.tabName)
      .tabContent.find(item => item.cardTitle === cardTitle).cardContent;

    if(!cardContent){
      cardContent = [];
    }

    cardContent.push({
      parameter: value
    });

    tempResourceConfig.render.tabs.find(item => item.tabName === props.tabName)
      .tabContent.find(item => item.cardTitle === cardTitle).cardContent = cardContent;

    updateResourceConfig(tempResourceConfig, params);
  }

  const deleteParameter = value => {
    let tempResourceConfig = getResourceConfig(params);
    tempResourceConfig.render.tabs.find(item => item.tabName === props.tabName)
      .tabContent.find(item => item.cardTitle === cardTitle).cardContent =
      tempResourceConfig.render.tabs.find(item => item.tabName === props.tabName)
        .tabContent.find(item => item.cardTitle === cardTitle).cardContent.filter(item =>
      item.parameter !== value
    );
    updateResourceConfig(tempResourceConfig, params);
  }

  let content = [];
  let counter = 0;

  if(props.cardContent){
    props.cardContent.forEach(item => {
      let key = item.parameter;

      let parameter = Utils().index(props.resource, item.parameter);

      if(!parameter)
        parameter = 'None';

      let form = {
        [item.parameter]: parameter
      }

      if(form[item.parameter] && typeof form[item.parameter] !== 'object' && !Array.isArray(form[item.parameter])){
        form = {
          form: {
            [item.parameter.split('.').slice(-1)] : form[item.parameter]
          }
        }
        key = 'form';
      }

      content.push(
        <Row key={props.cardTitle + '_' + key + '_' + counter} align={'middle'}>
          <Col span={onContentEdit ? 22 : 24}>
            <FormViewer {...props}
                        resource={JSON.parse(JSON.stringify(form))} show={key}

                        readonly
            />
          </Col>
          {onContentEdit ? (
            <Col style={{textAlign: 'center'}} span={2}>
              <Button type={'danger'}
                      icon={<DeleteOutlined />}
                      onClick={() => deleteParameter(item.parameter)}
              />
            </Col>
          ) : null}
        </Row>
      )

      counter++;
    });
  }


  return(
    <div className={'scrollbar'}>
      <Card title={
               editTabName ? (
                 <Input placeholder={cardTitle} size={'small'} autoFocus
                        defaultValue={cardTitle}
                        onBlur={(e) => {
                          updateTitle(e.target.value)
                        }}
                        onPressEnter={(e) => {
                          updateTitle(e.target.value)
                        }}
                        style={{width: '60%'}}
                 />
               ) : (
                 <div onClick={() => setEditTabName(true)}>
                   {cardTitle}
                 </div>
               )
            }
            size={'small'}
            key={cardTitle}
            type={'inner'}
            style={{overflowY: 'auto', height: '100%', overflowX: 'hidden', backgroundColor: '#fff'}}
            headStyle={{position: 'fixed', zIndex: 20, width: '100%'}}
            bodyStyle={{height: '100%', position: 'relative'}}
            extra={[
              <Tooltip title={'Edit Content'} key={'edit_content'}>
                <EditOutlined onClick={() => setOnContentEdit(prev => !prev)}
                              style={{marginRight: '1em'}}
                />
              </Tooltip>,
              <Tooltip title={'Delete Content'} key={'delete_content'}>
                {deleting ? <LoadingOutlined />
                : <CloseOutlined onClick={onDeleteContent} />}
              </Tooltip>
            ]}
            className={'scrollbar'}
      >
        <div style={{marginTop: 36, height: 'calc(100% - 36px)', position: 'relative'}}>
          {content && content.length !== 0 ? (
            <div>
              {content}
            </div>
          ) : (
            <div>
              <Alert
                closable
                message="Nothing to show here..."
                description="Try adding something."
                type="info"
                showIcon
              />
            </div>
          )}
          {onContentEdit ? (
            <Input placeholder={'New Parameter'} autoFocus
                   style={{width: '100%', marginTop: 4}}
                   onPressEnter={(e) => saveParameter(e.target.value)}
            />
          ) : null}
          {/*{onContentEdit ? (
            <div style={{width: '100%', position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: '#fff'}}>
              <Divider style={{marginTop: 0, marginBottom: 12}} />
              <Row gutter={16}>
                <Col span={12}>
                  <Button style={{width: '100%'}}
                          icon={<PlusOutlined key="plus" />}
                          onClick={() => setOnAddParameter(true)}
                  >Add</Button>
                </Col>
                <Col span={12}>
                  <Button type={'primary'}
                          style={{width: '100%'}}
                          icon={<SaveOutlined key="save" />}
                          onClick={() => console.log('save')}
                  >Save</Button>
                </Col>
              </Row>
            </div>
          ) : null}*/}
        </div>
      </Card>
    </div>
  )
}
