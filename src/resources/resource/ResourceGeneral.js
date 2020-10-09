import { Alert, Card, Input } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import ResourceHeader from './ResourceHeader';
import LoadingIndicator from '../../common/LoadingIndicator';
import Editor from '../../editors/Editor';
import ResourceForm from './ResourceForm';
import { resourceNotifyEvent } from './ResourceUtils';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import './ResourceGeneral.css';
import { CodeOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import CustomTab from './CustomTab';

function ResourceGeneral(props){
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState([]);
  const [deleted, setDeleted] = useState(false);
  const [currentTab, setCurrentTab] = useState('General');
  const [tabList, setTabList] = useState([{
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
      }]
  )
  const [contentList, setContentList] = useState({});
  const [onEditTabName, setOnEditTabName] = useState('');
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
      setContentList({
        General: (
          <div>
            <ResourceForm resource={JSON.parse(JSON.stringify(resource[0]))}
                          updateFunc={updateResource} kind={resource[0].kind}
            />
          </div>
        ),
        JSON: (
          <div style={{padding: 12}}>
            <Editor value={JSON.stringify(resource[0], null, 2)}
                    onClick={submit}
            />
          </div>
        )
      });
    }
  }, [loading])

  useEffect(() => {
    if(onEditTabName !== ''){
      let index = tabList.indexOf(tabList.find(tab => tab.key === onEditTabName));
      const key = tabList[index].key;
      tabList[index] = {
        key: key,
        tab: (
          <span onDoubleClick={() => setOnEditTabName(key)}>
          <PlusOutlined/>
            <Input bordered={false} defaultValue={key} placeholder={key}
                   size={'small'} onPressEnter={(e) => editTabName(e.target.value, index, key)}
                   onBlur={(e) => editTabName(e.target.value, index, key)}
            />
        </span>
        )
      };
      setTabList([...tabList]);
    }
  }, [onEditTabName])

  const editTabName = (value, index, key) => {
    tabList[index].key = value;
    tabList[index].tab = (
      <span onDoubleClick={() => setOnEditTabName(value)}>
        <PlusOutlined />{value}
      </span>
    )
    setTabList([...tabList]);
    contentList[value] = contentList[key];
    delete contentList[key];
    setContentList({...contentList});
    setCurrentTab(value);
    changeTabFlag.current = false;
    setOnEditTabName('');
  }

  const loadResource = () => {
    /** Get the resource */
    window.api.getGenericResource(!props.onCustomView ? window.location.pathname : props.pathname).then(
      res => {
        let resArray = [];
        resArray.push(res);
        setResource(resArray);
        /** Start a watch for this resource */
        if(!props.onCustomView)
          window.api.watchResource(
            window.location.pathname.split('/')[1],
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

  const updateResource = (name, namespace, item) => {
    return window.api.updateGenericResource(window.location.pathname, item);
  }

  const deleteResource = () => {
    return window.api.deleteGenericResource(window.location.pathname);
  }

  const submit = item => {
    updateResource(item.metadata.name, item.metadata.namespace, item);
  }

  const addTab = () => {
    const key = 'NewTab'
    const newPane = {
      key: key,
      tab: (
        <span onDoubleClick={() => setOnEditTabName(key)}>
          <PlusOutlined />{key}
        </span>
      )
    };
    setTabList(prev => [...prev, newPane]);
    setContentList(prev => {
      return {
        ...prev,
        [key]: (
          <CustomTab />
        )
      }
    })
    setCurrentTab('NewTab');
  }

  const removeTab = (targetKey) => {
    setTabList(prev => {
      return prev.filter(tab => tab.key !== targetKey);
    });
    setCurrentTab('General');
  }

  const onEditTab = (targetKey, action) => {
    if(action === 'add'){
      addTab();
    } else {
      removeTab(targetKey);
    }
  }

  return(
    <Alert.ErrorBoundary>
      {loading ? <LoadingIndicator /> : (
        !deleted ? (
          <div aria-label={'crd'} key={resource[0].metadata.name}>
            {!props.onCustomView ? (
              <div>
                <div>
                  <ResourceHeader
                    onCustomView={props.onCustomView}
                    resourceRedirect={'resources'}
                    resource={resource[0]}
                    name={resource[0].metadata.name}
                    kind={resource[0].kind}
                    deleteFunc={deleteResource}
                    updateFunc={updateResource}
                  />
                </div>
                <div style={{marginTop: 16}}>
                  <Card bodyStyle={{paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: 0}}
                        headStyle={{marginLeft: -12, marginRight: -12}}
                        tabList={tabList}
                        tabProps={{
                          onEdit: onEditTab,
                          tabBarStyle: {
                            backgroundColor: '#f0f2f5'
                          },
                          type: 'editable-card',
                          size: 'small',
                        }}
                        //tabBarExtraContent={<Input size={'small'} onPressEnter={searchProperty} placeholder={'Search'} allowClear />}
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
  )
}

export default ResourceGeneral;
