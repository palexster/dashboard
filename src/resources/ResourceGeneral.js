import { Row, Col, Alert, Card, Descriptions, Tabs, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import ResourceHeader from './ResourceHeader';
import LoadingIndicator from '../common/LoadingIndicator';
import Editor from '../editors/Editor';
import ResourceForm from './ResourceForm';
import { resourceNotifyEvent } from './ResourceUtils';
import { useHistory, useLocation, useParams } from 'react-router-dom';

function ResourceGeneral(props){
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState([]);
  const [deleted, setDeleted] = useState(false);
  let location = useLocation();
  let history = useHistory();
  let params = useParams();

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

  const loadResource = () => {
    /** Get the resource */
    window.api.getGenericResource(!props.onCustomView ? window.location.pathname : props.pathname).then(
      res => {
        console.log(res);
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
    console.log('submit', item);
    updateResource(item.metadata.name, item.metadata.namespace, item);
  }

  const content = () => {
    return (
      <>
        <ResourceHeader
          onCustomView={props.onCustomView}
          resourceRedirect={'resources'}
          resource={resource[0]}
          name={resource[0].metadata.name}
          kind={resource[0].kind}
          deleteFunc={deleteResource}
          updateFunc={updateResource}
        />
        <div style={{marginLeft: -24}}>
          <Tabs defaultActiveKey={'form'} tabPosition={'left'} size={'small'}>
            <Tabs.TabPane tab={'Form'} key={'form'}>
              <ResourceForm resource={JSON.parse(JSON.stringify(resource[0]))}
                            updateFunc={updateResource} kind={resource[0].kind}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={'JSON'} key={'JSON'}>
              <Editor value={JSON.stringify(resource[0], null, 2)}
                      onClick={submit}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </>
    )
  }

  return(
    <Alert.ErrorBoundary>
      {loading ? <LoadingIndicator /> : (
        !deleted ? (
          <div aria-label={'crd'} key={resource[0].metadata.name}>
            {!props.onCustomView ? (
              <Card className={'crd-container'}
                    style={{margin: 'auto'}}
              >
                {content()}
              </Card>
            ) : (
              <div>
                {content()}
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
