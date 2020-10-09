import { Tabs, Alert, Card, message } from 'antd';
import React, { useEffect, useState } from 'react';
import ResourceHeader from '../resource/ResourceHeader';
import LoadingIndicator from '../../common/LoadingIndicator';
import Editor from '../../editors/Editor';
import ResourceForm from '../resource/ResourceForm';
import { getDeployStatus } from './DeployUtils';
import { resourceNotifyEvent } from '../resource/ResourceUtils';

function Deploy(props){
  const [loading, setLoading] = useState(true);
  const [deploy, setDeploy] = useState([]);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    loadDeploy();

    /** When unmounting, eliminate every callback and watch */
    return () => {
      if(props.onCustomView){
        //window.api.abortWatch(props.match.params.crdName.split('.')[0]);
      } else {
        window.api.abortWatch('deployments');
      }
    }
  }, [props.match])

  const notifyEvent = (type, object) => {
    resourceNotifyEvent(setDeploy, type, object);
    if(type === 'DELETED')
      setDeleted(true);
  }

  const loadDeploy = () => {
    /** Get the deployment */
    window.api.getDeploymentsAllNamespaces(props.onCustomView ? props.CRD : 'metadata.name=' + props.match.params.resourceName).then(
      res => {
        setDeploy(res.body.items);
        window.api.watchResource(
          'apis',
          'apps',
          res.body.items[0].metadata.namespace,
          'v1',
          'deployments',
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

  return(
    <Alert.ErrorBoundary>
      {loading ? <LoadingIndicator /> : (
        !deleted ? (
          <div aria-label={'crd'} key={deploy[0].metadata.name}>
            {!props.onCustomView ? (
              <Card className={'crd-container'}
                    style={{margin: 'auto'}}
              >
                <ResourceHeader
                  resourceRedirect={'deployments'}
                  resource={deploy[0]}
                  name={deploy[0].metadata.name}
                  kind={'Deployment'}
                  status={{
                    ok: getDeployStatus(deploy[0]).OK,
                    reason: (getDeployStatus(deploy[0]).OK ? 'Available ' : 'Not Available ') + getDeployStatus(deploy[0]).available
                  }}
                  deleteFunc={window.api.deleteDeployment}
                  updateFunc={window.api.updateDeployment}
                />
                <div style={{marginLeft: -24}}>
                  <Tabs defaultActiveKey={'form'} tabPosition={'left'} size={'small'}>
                    <Tabs.TabPane tab={'Form'} key={'form'}>
                      <ResourceForm resource={JSON.parse(JSON.stringify(deploy[0]))}
                                    updateFunc={window.api.updateDeployment}
                      />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={'JSON'} key={'JSON'}>
                      <Editor value={JSON.stringify(deploy[0], null, 2)} />
                    </Tabs.TabPane>
                  </Tabs>
                </div>
              </Card>
            ) : (
              <ResourceHeader
                onCustomView
                resourceRedirect={'deployments'}
                resource={deploy[0]}
                name={deploy[0].metadata.name}
                kind={'Deployment'}
                status={{
                  ok: getDeployStatus(deploy[0]).OK,
                  reason: getDeployStatus(deploy[0]).OK ? 'Available ' : 'Not Available ' + getDeployStatus(deploy[0]).available
                }}
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

export default Deploy;
