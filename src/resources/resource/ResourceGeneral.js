import { Button, Affix, Alert, Card, Input } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import ResourceHeader from './ResourceHeader';
import LoadingIndicator from '../../common/LoadingIndicator';
import Editor from '../../editors/Editor';
import ResourceForm from './ResourceForm';
import { resourceNotifyEvent } from './ResourceUtils';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import './ResourceGeneral.css';
import { CodeOutlined, InfoCircleOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';

function ResourceGeneral(props){
  const [container, setContainer] = useState(null);
  const [deleted, setDeleted] = useState(false)
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState([]);
  const [currentTab, setCurrentTab] = useState('General');
  const [tabList, setTabList] = useState([])
  const [contentList, setContentList] = useState({});
  let location = useLocation();
  let history = useHistory();
  let params = useParams();
  const changeTabFlag = useRef(true);

  useEffect(() => {
    loadResource();

    /** When unmounting, eliminate every callback and watch */
    return () => {
      if(props.onCustomView){
        //window.api.abortWatch(params.crdName.split('.')[0]);
      } else {
        window.api.abortWatch(params.resource);
      }
    }
  }, [location])

  useEffect(() => {
    if(!loading){
      manageTabList();
      manageContentList();
    }
  }, [loading])

  const manageTabList = () => {
    let items = [
        {
        key: 'General',
        tab: (
          <span>
            <InfoCircleOutlined />General
          </span>
        )
      },
      {
        key: 'JSON',
        tab: (
          <span>
            <CodeOutlined />JSON
          </span>
        )
      }
    ]

    setTabList([...items]);
  }

  const manageContentList = () => {
    let items = {
      General: (
        <div>
          <ResourceForm resource={JSON.parse(JSON.stringify(resource[0]))}
                        kind={resource[0].kind}
          />
        </div>
      ),
      JSON: (
        <div style={{padding: 12}}>
          <Editor value={JSON.stringify(resource[0], null, 2)}
          />
        </div>
      )
    }

    setContentList({...items});
  }

  const loadResource = () => {
    /** Get the resource */
    window.api.getGenericResource(!props.onCustomView ? location.pathname : props.pathname).then(
      res => {
        let resArray = [];
        resArray.push(res);
        setResource(resArray);
        /** Start a watch for this resource */
        if(!props.onCustomView)
          window.api.watchResource(
            location.pathname.split('/')[1],
            (params.group ? params.group : undefined),
            (params.namespace ? params.namespace : undefined),
            params.version,
            params.resource,
            params.resourceName,
            notifyEvent
          )
        setLoading(false);
      }
    ).catch(error => {
      console.log(error);
      setDeleted(true);
      setLoading(false);
    });
  }

  const notifyEvent = (type, object) => {
    resourceNotifyEvent(setResource, type, object);
    if(type === 'DELETED'){
      setDeleted(true);
    }
  }

  return(
    <div>
      <Alert.ErrorBoundary>
      {loading ? <LoadingIndicator /> : (
        !deleted ? (
          <div aria-label={'crd'} key={resource[0].metadata.name} ref={setContainer}
               style={{height: '92vh', overflow: 'auto', marginLeft: -20, marginRight: -20, marginTop: -20}}
          >
            {!props.onCustomView ? (
              <div style={{marginLeft: 20, marginRight: 20}}>
                <Affix target={() => container}>
                  <ResourceHeader
                    onCustomView={props.onCustomView}
                    resourceRedirect={'resources'}
                    resource={resource[0]}
                    name={resource[0].metadata.name}
                    kind={resource[0].kind}
                  />
                </Affix>
                <div>
                  <Card bodyStyle={{paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: 0}}
                        headStyle={{marginLeft: -12, marginRight: -12}}
                        tabList={tabList}
                        tabProps={{
                          tabBarStyle: {
                            backgroundColor: '#f0f2f5'
                          },
                          type: 'editable-card',
                          size: 'small',
                          animated: true
                        }}
                        size={'small'}
                        type={'inner'}
                        activeTabKey={currentTab}
                        onTabChange={key => {if(changeTabFlag.current) setCurrentTab(key); else changeTabFlag.current = true}}
                        style={{overflow: 'hidden'}}
                  >
                    {contentList[currentTab]}
                  </Card>
                </div>
              </div>
            ) : (
              <div>
                {contentList[currentTab]}
              </div>
            )}
          </div>
        ) : (
          <Alert
            message="Resource could not be found"
            description="The resource you are looking for is currently unavailable or could be deleted."
            type="warning"
            showIcon
          />
        )
      )}
    </Alert.ErrorBoundary>
    </div>
  )
}

export default ResourceGeneral;
