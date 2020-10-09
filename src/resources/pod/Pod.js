import { Alert, Card, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import ResourceHeader from '../resource/ResourceHeader';
import LoadingIndicator from '../../common/LoadingIndicator';
import Editor from '../../editors/Editor';
import ResourceForm from '../resource/ResourceForm';
import { getPodStatus } from './PodUtils';
import { resourceNotifyEvent } from '../resource/ResourceUtils';

function Pod(props){
  const [loading, setLoading] = useState(true);
  const [pod, setPod] = useState([]);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    loadPod();

    /** When unmounting, eliminate every callback and watch */
    return () => {
      if(props.onCustomView){
        //window.api.abortWatch(props.match.params.crdName.split('.')[0]);
      } else {
        window.api.abortWatch('pods');
      }
    }
  }, [props.match])

  const loadPod = () => {
    /** Get the deployment */
    window.api.getPODsAllNamespaces(props.onCustomView ? props.CRD : 'metadata.name=' + props.match.params.resourceName).then(
      res => {
        setPod(res.body.items);
        window.api.watchResource(
          'api',
          undefined,
          res.body.items[0].metadata.namespace,
          'v1',
          'pods',
          res.body.items[0].metadata.name,
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
    console.log(type);
    resourceNotifyEvent(setPod, type, object);
    if(type === 'DELETED'){
      setDeleted(true);
      console.log(object)
    }
  }

  return(
    <Alert.ErrorBoundary>
      {loading ? <LoadingIndicator /> : (
        !deleted ? (
          <div aria-label={'crd'} key={pod[0].metadata.name}>
            {!props.onCustomView ? (
              <Card className={'crd-container'}
                    style={{margin: 'auto'}}
              >
                <ResourceHeader
                  resourceRedirect={'pods'}
                  resource={pod[0]}
                  name={pod[0].metadata.name}
                  kind={'Pod'}
                  status={{
                    ok: getPodStatus(pod[0]).OK,
                    reason: getPodStatus(pod[0]).status.reason
                  }}
                  deleteFunc={window.api.deletePOD}
                  updateFunc={window.api.updatePOD}
                />
                <div style={{marginLeft: -24}}>
                  <Tabs defaultActiveKey={'form'} tabPosition={'left'} size={'small'}>
                    <Tabs.TabPane tab={'Form'} key={'form'}>
                      <ResourceForm resource={JSON.parse(JSON.stringify(pod[0]))}
                                    updateFunc={window.api.updatePOD}
                                    kind={'Pod'}
                      />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={'JSON'} key={'JSON'}>
                      <Editor value={JSON.stringify(pod[0], null, 2)} />
                    </Tabs.TabPane>
                  </Tabs>
                </div>
              </Card>
            ) : (
              <ResourceHeader
                onCustomView
                resourceRedirect={'pods'}
                resource={pod[0]}
                name={pod[0].metadata.name}
              />
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

export default Pod;
