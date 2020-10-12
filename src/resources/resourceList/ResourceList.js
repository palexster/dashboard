import React, { useEffect, useState } from 'react';
import { Input, Table, Rate } from 'antd';
import { withRouter, useLocation, useHistory, useParams } from 'react-router-dom';
import { getColumnSearchProps } from '../../services/TableUtils';
import ListHeader from './ListHeader';
import { calculateAge } from '../../services/TimeUtils';
import { createNewConfig, getResourceConfig, updateResourceConfig } from '../common/DashboardConfigUtils';
import KubernetesSchemaAutocomplete from '../common/KubernetesSchemaAutocomplete';
import { renderResourceList } from './ResourceListRenderer';
import { columnContentFunction } from './columnContentFunction';
import { resourceNotifyEvent } from '../resource/ResourceUtils';
import FavouriteButton from '../common/buttons/FavouriteButton';

function ResourceList(props) {
  /**
   * @param: loading: boolean
   * @param: deploys: array of deploys in the current page
   */

  const [editColumn, setEditColumn] = useState('');
  const [loading, setLoading] = useState(true);
  const [resourceList, setResourceList] = useState([]);
  const [kind, setKind] = useState('');
  const [resourceConfig, setResourceConfig] = useState({});
  const [columnHeaders, setColumnHeaders] = useState([]);
  const [columnContents, setColumnsContents] = useState([]);
  let location = useLocation();
  let history = useHistory();
  let params = useParams();

  useEffect(() => {

    loadResourceList();
    getDashConfig();
    if(params.namespace) window.api.setNamespace(params.namespace);
    window.api.DCArrayCallback.current.push(getDashConfig);
    window.api.NSArrayCallback.current.push(changeNamespace);

    /** Start a watch for the list of resources */
    if(!props.onCustomView)
      window.api.watchResource(
        window.location.pathname.split('/')[1],
        (params.group ? params.group : undefined),
        (params.namespace ? params.namespace : undefined),
        params.version,
        params.resource,
        undefined,
        notifyEvent
      )

    return () => {
      setLoading(true);
      setResourceList([]);
      setResourceConfig({});
      setColumnsContents([]);
      setColumnHeaders([]);
      window.api.abortWatch(params.resource);
      window.api.NSArrayCallback.current = window.api.NSArrayCallback.current.filter(func => {return func !== changeNamespace});
      window.api.DCArrayCallback.current = window.api.DCArrayCallback.current.filter(func => {
        return func !== getDashConfig;
      });
    }
  }, [location]);

  const notifyEvent = (type, object) => {
    resourceNotifyEvent(loadResourceList, type, object)
  }

  useEffect(() => {
    manageColumnHeaders();
    manageColumnContents();
  }, [resourceList, resourceConfig, editColumn])

  const manageColumnHeaders = () => {
    let columns = [
      {
        title: '',
        fixed: 'left',
        dataIndex: 'Favourite',
        width: '1em',
        sortDirections: ['descend'],
        align: 'center',
        ellipsis: true,
        sorter: {
          compare: (a, b) => a.Favourite - b.Favourite,
        },
        render: (text, record) => (
          <FavouriteButton favourite={text} resourceList={resourceList}
                           resourceName={record.Name}
          />
        )
      }
    ]

    if(!_.isEmpty(resourceConfig) && resourceConfig.render && resourceConfig.render.columns){
      let index = 0;
      resourceConfig.render.columns.forEach(column => {
        columns.push({
          dataIndex: column.columnName,
          key: column.columnContent,
          width: '10em',
          ellipsis: true,
          fixed: (index === 0 ? 'left' : false),
          ...getColumnSearchProps(column.columnName, (text, record, dataIndex) =>
            renderResourceList(text, record, dataIndex, resourceList)
          ),
          title: (
            editColumn === column.columnContent ? (
              <div style={{marginLeft: '2em'}} onClick={() => setEditColumn(column.columnContent)}>
                <Input placeholder={'Remove ' + column.columnName} size={'small'} autoFocus
                       defaultValue={column.columnName}
                       onBlur={(e) => {
                         updateDashConfig(column.columnContent, e.target.value)
                       }}
                       onPressEnter={(e) => {
                         updateDashConfig(column.columnContent, e.target.value)
                       }}
                />
              </div>
            ) : (
              <div style={{marginLeft: '2em'}} onClick={() => setEditColumn(column.columnContent)}>
                {column.columnName}
              </div>
            )
          ),
        })
        index++;
      })
    } else {
      columns.push(
        {
          dataIndex: 'Name',
          key: 'Name',
          ellipsis: true,
          fixed: 'left',
          ...getColumnSearchProps('Name', (text, record, dataIndex) =>
            renderResourceList(text, record, dataIndex, resourceList)
          ),
        },
        {
          dataIndex: 'Namespace',
          key: 'Namespace',
          ellipsis: true,
          ...getColumnSearchProps('Namespace', (text, record, dataIndex) =>
            renderResourceList(text, record, dataIndex, resourceList)
          ),
        }
      )
    }

    columns.push({
      dataIndex: 'Age',
      key: 'Age',
      title: 'Age',
      fixed: 'right',
      ellipsis: true,
      width: '5em',
      sorter: {
        compare: (a, b) => a.Age.slice(0, -1) - b.Age.slice(0, -1),
      }
    })

    setColumnHeaders(columns);
  }

  const manageColumnContents = () => {

    const resourceViews = [];
    resourceList.forEach(resource => {
      let favourite = 0;
      if(resource.metadata.annotations){
        if(resource.metadata.annotations.favourite)
          favourite = 1;
      }
      let object = {
        key: resource.metadata.name + '_' + resource.metadata.namespace,
        Favourite: favourite,
        Age: calculateAge(resource.metadata.creationTimestamp)
      }

      if(!_.isEmpty(resourceConfig) && resourceConfig.render && resourceConfig.render.columns) {
        resourceConfig.render.columns.forEach(column => {
          object[column.columnName] = columnContentFunction(resource, column.columnContent);
        })
      } else {
        object['Name'] = resource.metadata.name;
        object['Namespace'] = resource.metadata.namespace ? resource.metadata.namespace : 'Not namespaced';
      }

      resourceViews.push(object);
    });

    setColumnsContents([...resourceViews]);
  }

  const addColumnHeader = (setNew) => {
    if(setNew){
      setColumnHeaders(prev => {
        prev.push({
          dataIndex: 'NewColumn',
          key: 'NewColumn',
          title:
            <KubernetesSchemaAutocomplete kind={kind}
                                          updateFunc={updateDashConfig}
            />,
          fixed: 'right',
          width: '20em'
        })
        return [...prev];
      });
    } else {
      setColumnHeaders(prev => {
        prev.pop();
        return [...prev];
      })
    }

  }

  const updateDashConfig = (value, name) => {
    setEditColumn('');

    if(value === '') return;

    let tempResourceConfig = resourceConfig;

    if(!_.isEmpty(tempResourceConfig)){

      if(!tempResourceConfig.render) tempResourceConfig.render = {};
      if(!tempResourceConfig.render.columns) tempResourceConfig.render.columns = [];

      /** If there is a column render for this parameter, update it */
      let index = tempResourceConfig.render.columns.indexOf(
        tempResourceConfig.render.columns.find(column =>
          column.columnContent === value
        )
      );

      if(index !== -1){
        /** Delete column if no name */
        if(name === '')
          delete tempResourceConfig.render.columns[index];
        else
          tempResourceConfig.render.columns[index] = {
            columnName: name,
            columnContent: value
          }
      } else
        tempResourceConfig.render.columns.push({
          columnName: name,
          columnContent: value
        })
    } else {
      tempResourceConfig = createNewConfig(params, {kind: kind});

      /** The resource doesn't have a config, create one */
      tempResourceConfig.render.columns.push({
        columnName: name,
        columnContent: value
      })
    }

    updateResourceConfig(tempResourceConfig, params);
  }

  const getDashConfig = () => {
    if(window.api.dashConfigs.current){
      setResourceConfig(() => {
        return getResourceConfig(params);
      });
    }
  }

  const changeNamespace = () => {
    let path = '/' + window.location.pathname.split('/')[1] + '/' +
      (params.group ? params.group + '/' : '') +
      params.version + '/' +
      (window.api.namespace.current ? 'namespaces/' + window.api.namespace.current + '/' : '') +
      params.resource;

    history.push(path);
  }

  const loadResourceList = () => {
    window.api.getGenericResource(window.location.pathname)
      .then(res => {
        setKind(res.kind);
        setResourceList(res.items);
        setLoading(false);
      })
      .catch(error => {
        history.push('/error/' + error);
      });
  }

  return (
    <div>
      <ListHeader kind={kind} addColumn={addColumnHeader} />
      <Table columns={columnHeaders} dataSource={columnContents}
             bordered scroll={{ x: 'max-content' }} sticky
             pagination={{ position: ['bottomCenter'],
               hideOnSinglePage: columnContents.length < 11,
               showSizeChanger: true,
             }} showSorterTooltip={false}
             loading={loading}
      />
    </div>
  );
}

export default withRouter(ResourceList);
