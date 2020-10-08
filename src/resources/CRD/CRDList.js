import React, { useEffect, useState } from 'react';
import { Rate, Typography, Table } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import './CRDList.css';
import './CRD.css';
import { getColumnSearchProps } from '../../services/TableUtils';
import { calculateAge } from '../../services/TimeUtils';
import ListHeader from '../resourceList/ListHeader';

function CRDList() {
  /**
   * @param: isLoading: boolean
   * @param: CRDshown: array of CRDs in the current page
   */

  const [loading, setLoading] = useState(true);
  const [CRDs, setCRDs] = useState([]);

  /**
   * Given a set (or subset) of CRD it generates the layout
   */
  const loadCustomResourceDefinitions = () => {
    setCRDs(window.api.CRDs.current);
    setLoading(false);
  }

  useEffect(() => {
    window.api.CRDListCallback.current = loadCustomResourceDefinitions;
    loadCustomResourceDefinitions();

    return () => {
      window.api.CRDListCallback.current = null;
    }
  }, []);

  /** Update CRD with the 'favourite' annotation */
  const handleClick_fav = async (CRD) => {
    CRD = CRDs.find(item => {return item.metadata.name === CRD});
    if(!CRD.metadata.annotations || !CRD.metadata.annotations.favourite){
      CRD.metadata.annotations = {favourite: 'true'};
    } else {
      CRD.metadata.annotations.favourite = null;
    }
    await window.api.updateCustomResourceDefinition(
      CRD.metadata.name,
      CRD
    )
  }

  const renderCRDs = (text, record, dataIndex) => {
    let CRD = window.api.CRDs.current.find(item => {return item.metadata.name === record.key});
    return (
      dataIndex === 'Kind' ? (
        <Link style={{ color: 'rgba(0, 0, 0, 0.85)'}} to={{
          pathname: '/customresources/' + CRD.metadata.name,
          state: {
            CRD: CRD
          }
        }} >
          <Typography.Text strong>{text}</Typography.Text>
        </Link>
      ) : (
        <div>{text}</div>
      )
    )
  }

  const CRDViews = [];
  CRDs.forEach(CRD => {
    let favourite = 0;
    let description = 'This CRD has no description';
    if(CRD.metadata.annotations){
      if(CRD.metadata.annotations.favourite)
        favourite = 1;
      if(CRD.metadata.annotations.description)
        description = CRD.metadata.annotations.description
    }
    CRDViews.push({
      key: CRD.metadata.name,
      Kind: CRD.spec.names.kind,
      Favourite: favourite,
      Group: CRD.spec.group,
      Description: description,
      Age: calculateAge(CRD.metadata.creationTimestamp)
    });
  });

  const columns = [
    {
      title: '',
      fixed: 'left',
      dataIndex: 'Favourite',
      width: '4em',
      sortDirections: ['descend'],
      sorter: {
        compare: (a, b) => a.Favourite - b.Favourite,
      },
      ellipsis: true,
      render: (text, record) => (
        <Rate className="crd-fav" count={1} defaultValue={text === 1 ? 1 : 0}
              value={text === 1 ? 1 : 0}
              onChange={async () => {await handleClick_fav(record.key)}}
              style={{marginLeft: 0, marginTop: -16}}
        />
      )
    },
    {
      dataIndex: 'Kind',
      key: 'Kind',
      fixed: true,
      ...getColumnSearchProps('Kind', renderCRDs)
    },
    {
      dataIndex: 'Description',
      key: 'Description',
      fixed: true,
      ...getColumnSearchProps('Description', renderCRDs)
    },
    {
      dataIndex: 'Group',
      key: 'Group',
      fixed: true,
      ...getColumnSearchProps('Group', renderCRDs)
    },
    {
      dataIndex: 'Age',
      key: 'Age',
      title: 'Age',
      fixed: 'right',
      width: '5em'
    }
  ]

  return (
    <div>
      <ListHeader kind={'Custom Resource Definitions'} />
      <Table columns={columns} dataSource={CRDViews}
             pagination={{ position: ['bottomCenter'],
               hideOnSinglePage: window.api.CRDs.current.length < 11,
               showSizeChanger: true,
             }} showSorterTooltip={false}
             loading={loading}
      />
    </div>
  );
}

export default withRouter(CRDList);
