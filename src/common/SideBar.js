import React, { useEffect, useState } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import DesktopOutlined from '@ant-design/icons/lib/icons/DesktopOutlined';
import './SideBar.css';
import {
  ApiOutlined, DashboardOutlined, SettingOutlined,
  LayoutOutlined, StarOutlined
} from '@ant-design/icons'
import AddCustomView from '../views/AddCustomView';

const Sider = Layout.Sider;

function SideBar() {

  const [CV, setCV] = useState([]);
  const [favouritesCRD, setFavouritesCRD] = useState(window.api.CRDs.current.filter(item => {
    return item.metadata.annotations && item.metadata.annotations.favourite;
  }));
  const [favouritesResource, setFavouriteResource] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    window.api.CVArrayCallback.current.push(getCustomViews);
    window.api.DCArrayCallback.current.push(getFavouriteResources);
    window.api.sidebarCallback.current = getFavourite;
  }, [])

  const getFavourite = CRDs => {
    setFavouritesCRD(CRDs);
  }

  const getFavouriteResources = () => {
    setFavouriteResource([...window.api.dashConfigs.current.spec.resources.filter(resource => {
      return resource.favourite;
    })]);
  }

  const getCustomViews = () => {
    setCV([...window.api.customViews.current]);
  }

  const onCollapse = collapsed => {
    setCollapsed(collapsed);
  }

  let cv = [];
  let fav = [];
  let favR = [];

  /** If there are custom views, show them in the sider */
  if(CV.length !== 0) {
    CV.forEach(item => {
      cv.push(
        <Menu.Item key={item.metadata.name} style={{ marginTop: 8}}>
          <Link to={{
            pathname: '/customview/' +  item.metadata.name,
          }}>
            <LayoutOutlined style={{ fontSize: '20px' }} />
            {
              item.spec.viewName ? (
                <span>{ item.spec.viewName }</span>
              ) : (
                <span>{ item.metadata.name }</span>
              )
            }
          </Link>
        </Menu.Item>
      )
    });
  }

  /** If there are favourite CRDs, show them in the sider */
  if(favouritesCRD.length !== 0) {
    favouritesCRD.forEach(item => {
      fav.push(
        <Menu.Item key={item.metadata.name} style={{ marginTop: 8}}>
          <Link to={{
            pathname: '/customresources/' +  item.metadata.name}}
          >
            <span>{item.spec.names.kind}</span>
          </Link>
        </Menu.Item>
      )
    });
  }

  const Icon = ({type, ...rest}) => {
    const icons = require(`@ant-design/icons`);
    const Component = icons[type];
    return <Component {...rest} />;
  }

  /** If there are favourite Resources, show them in the sider */
  if(favouritesResource.length !== 0) {
    favouritesResource.forEach(item => {
      favR.push(
        <Menu.Item key={item.resourceName} style={{ marginTop: 8}}>
          <Link to={{
            pathname: item.resourcePath}}
          >
            <Icon type={item.icon ? item.icon : 'ApiOutlined'} style={{fontSize: '20px'}} />
            <span>{item.resourceName}</span>
          </Link>
        </Menu.Item>
      )
    });
  }

  return (
    <div>
      <Sider className="sidebar" width={250}
             theme={'light'}
             collapsible collapsed={collapsed}
             onCollapse={onCollapse}
             breakpoint="lg"
      >
        <div className="app-title" align="middle">
          <img src={require('../assets/logo_4.png')}
               className="image" alt="image"
               style={collapsed ? {marginLeft: 22} : null}
          />
          {!collapsed ? (
            <Link to="/">
              <img src={require('../assets/name.png')}
                   alt="image"
                   style={{height: 30, width: 120}}
              />
            </Link>
          ) : null}
        </div>
        <Menu mode="inline" defaultOpenKeys={['sub_fav']}
              defaultSelectedKeys={'1'} style={{ marginTop: 16}}>
          <Menu.Item key="home">
            <Link to="/">
              <DashboardOutlined style={{ fontSize: '20px' }} />
              <span>Home</span>
            </Link>
          </Menu.Item>
          <Menu.Divider/>
          {cv}
          <Menu.Item key="addCV" style={{ marginTop: 8}}>
            <AddCustomView  />
          </Menu.Item>
          <Menu.Divider/>
          <Menu.Item key="apis">
            <Link to="/apis">
              <ApiOutlined style={{ fontSize: '20px' }} />
              <span>Apis</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="api">
            <Link to="/api/v1">
              <ApiOutlined style={{ fontSize: '20px' }} />
              <span>Api</span>
            </Link>
          </Menu.Item>
          <Menu.Divider/>
          {favR}
          <Menu.Divider/>
          <Menu.SubMenu key={"sub_fav"}
                        icon={<StarOutlined style={{ fontSize: '20px' }} />}
                        title={'Favourites'}
          >
            {fav}
          </Menu.SubMenu>
          <Menu.Divider/>
          <Menu.Item key="settings" style={{ marginTop: 8}}>
            <Link to="/settings">
              <SettingOutlined style={{ fontSize: '20px' }} />
              <span>Settings</span>
            </Link>
          </Menu.Item>
        </Menu>
      </Sider>
    </div>
  );
}

export default withRouter(SideBar);
