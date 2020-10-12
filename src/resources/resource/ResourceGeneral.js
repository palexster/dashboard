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
import CustomTab from './CustomTab';
import { createNewConfig, getResourceConfig, updateResourceConfig } from '../common/DashboardConfigUtils';

function ResourceGeneral(props){
  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState([]);
  const [resourceConfig, setResourceConfig] = useState({});
  const [deleted, setDeleted] = useState(false);
  const [currentTab, setCurrentTab] = useState('General');
  const [tabList, setTabList] = useState([])
  const [contentList, setContentList] = useState({});
  const [onEditTabName, setOnEditTabName] = useState('');
  const [onEditTabContent, setOnEditTabContent] = useState('');
  let location = useLocation();
  let history = useHistory();
  let params = useParams();
  const changeTabFlag = useRef(true);

  useEffect(() => {
    loadResource();
    getDashConfig();
    window.api.DCArrayCallback.current.push(getDashConfig);

    /** When unmounting, eliminate every callback and watch */
    return () => {
      window.api.DCArrayCallback.current = window.api.DCArrayCallback.current.filter(func => {
        return func !== getDashConfig;
      });
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
  }, [loading, resourceConfig])

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
                   size={'small'}
                   onPressEnter={(e) =>
                     updateConfigTabs(e.target.value, key)}
                   onBlur={(e) =>
                     updateConfigTabs(e.target.value, key)}
            />
        </span>
        )
      };
      setTabList([...tabList]);
    }
  }, [onEditTabName])


  const getDashConfig = () => {
    if(window.api.dashConfigs.current){
      setResourceConfig(() => {
        return getResourceConfig(params);
      });
    }
  }

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

    if(resourceConfig.render && resourceConfig.render.tabs){
      resourceConfig.render.tabs.forEach(tab => {
        items.push({
          key: tab.tabName,
          tab: (
            <span onDoubleClick={() => setOnEditTabName(tab.tabName)}>
              <PlusOutlined />{tab.tabName}
            </span>
          )
        })
      })
    }

    setTabList([...items]);
  }

  const manageContentList = () => {
    let items = {
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
    }

    if(resourceConfig.render && resourceConfig.render.tabs){
      resourceConfig.render.tabs.forEach(tab => {
        items[tab.tabName] = (
          <CustomTab content={tab.tabContent} resource={resource[0]} tabName={tab.tabName}/>
        )
      })
    }

    setContentList({...items});
  }

  const updateConfigTabs = (name, prevValue) => {
    setOnEditTabName('');

    /** If nothing has changed, exit from the editing mode */
    if(name === prevValue){
      manageTabList();
      return;
    }

    let tempResourceConfig = resourceConfig;

    if(!_.isEmpty(tempResourceConfig)){

      if(!tempResourceConfig.render) tempResourceConfig.render = {};
      if(!tempResourceConfig.render.tabs) tempResourceConfig.render.tabs = [];

      /** If there is a tab render for this parameter, update it */
      let index = tempResourceConfig.render.tabs.indexOf(
        tempResourceConfig.render.tabs.find(tab =>
          tab.tabName === prevValue
        )
      );

      if(index !== -1){
        /** Delete tab if no name */
        if(name === '')
          delete tempResourceConfig.render.tabs[index];
        else
          tempResourceConfig.render.tabs[index].tabName = name;
      } else
        tempResourceConfig.render.tabs.push({
          tabName: name,
          tabContent: []
        })
    } else {
      tempResourceConfig = createNewConfig(params, {kind: resource.kind});

      /** The resource doesn't have a config, create one */
      tempResourceConfig.render.tabs.push({
        tabName: name,
        tabContent: []
      })
    }

    updateResourceConfig(tempResourceConfig, params);

    if(name !== ''){
      setCurrentTab(name);
      changeTabFlag.current = false;
    }
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
          <CustomTab content={[]} resource={resource[0]} tabName={key}/>
        )
      }
    })
    setCurrentTab(key);
    updateConfigTabs(key);
  }

  const removeTab = (targetKey) => {
    setTabList(prev => {
      return prev.filter(tab => tab.key !== targetKey);
    });
    console.log(currentTab, targetKey)
    if(currentTab === targetKey)
      setCurrentTab('General');
    updateConfigTabs('', targetKey);
  }

  const onEditTab = (targetKey, action) => {
    if(action === 'add'){
      addTab();
    } else {
      removeTab(targetKey);
    }
  }

  return(
    <div>
      {/*<div ref={setContainer} style={{height: '80vh', overflow: 'auto'}}>
        <div style={{paddingTop: 160, height: '200vh', backgroundColor: 'red'}}>
          <Affix target={() => container}>
            <Button type="primary">Fixed at the top of container</Button>
          </Affix>
        </div>
      </div>*/}
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
                    deleteFunc={deleteResource}
                    updateFunc={updateResource}
                  />
                </Affix>
                <div>
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
                          animated: true
                        }}
                        tabBarExtraContent={(currentTab !== 'General' && currentTab !== 'JSON') ?
                          <Button icon={<SettingOutlined />} size={'large'}
                                  onClick={() => setOnEditTabContent(currentTab)}
                          />
                           : null}
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
