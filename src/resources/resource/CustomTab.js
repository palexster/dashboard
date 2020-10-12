import { Menu, Dropdown, Button, Alert, Card } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import Utils from '../../services/Utils';
import 'react-resizable/css/styles.css';
import { Responsive, WidthProvider } from 'react-grid-layout';
import './CustomTab.css'
import CustomTabContent from './CustomTabContent';
import _ from 'lodash';
import { pruneLayout } from '../common/LayoutUtils';
import { getResourceConfig, updateResourceConfig } from '../common/DashboardConfigUtils';
import { useParams } from 'react-router-dom';
import {PlusOutlined} from '@ant-design/icons';
import FormViewer from '../../editors/OAPIV3FormGenerator/FormViewer';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function CustomTab(props){
  const [cardList, setCardList] = useState(props.content);
  let params = useParams();

  useEffect(() => {
    setCardList([...props.content])
  }, [props.content])

  const onDeleteContent = (cardName) => {

    let tempResourceConfig = getResourceConfig(params);
    tempResourceConfig.render.tabs.find(item => item.tabName === props.tabName)
      .tabContent =
      tempResourceConfig.render.tabs.find(item => item.tabName === props.tabName)
        .tabContent.filter(item => item.cardTitle !== cardName);

    updateResourceConfig(tempResourceConfig, params);
  }

  const onAddContent = () => {
    let key = cardList.filter(item => item.cardTitle.includes('New Card #')).length;
    let newCard = {
      cardContent: null,
      cardTitle: 'New Card #' + key,
      cardLayout: {
        x: 0,
        y: 500,
        w: 6,
        h: 13
      }
    }

    let tempResourceConfig = getResourceConfig(params);
    tempResourceConfig.render.tabs.find(item => item.tabName === props.tabName).tabContent.push(newCard);
    updateResourceConfig(tempResourceConfig, params);
  }

  const menu = (
    <Menu>
      <Menu.Item key="add"
                 onClick={() => onAddContent()}
                 icon={<PlusOutlined />}
      >Add Content</Menu.Item>
      <Menu.Item key="2">2nd menu item</Menu.Item>
      <Menu.Item key="3">3rd menu item</Menu.Item>
    </Menu>
  );

  const onLayoutChange = layout => {
    /** If a content card is deleted or created, don't save on change of layout,
     * but wait for the confirmation and then it is deleted automatically
     * by the props change
     */
    if(layout.length !== props.content.length){
      return;
    }

    let tabLayout = [];
    props.content.forEach(card => {
      tabLayout.push({
        ...card.cardLayout,
        i: card.cardTitle
      })
    })

    let layoutPruned = pruneLayout(JSON.parse(JSON.stringify(layout)));

    if(props.content && !_.isEqual(layoutPruned, tabLayout)){

      layoutPruned.forEach(card => {
        if(props.content.find(item => item.cardTitle === card.i))
          props.content.find(item => item.cardTitle === card.i).cardLayout = card;
      })

      let tempResourceConfig = getResourceConfig(params);
      tempResourceConfig.render.tabs.find(item => item.tabName === props.tabName).tabContent = props.content;
      updateResourceConfig(tempResourceConfig, params);
    }
  }

  let cards = [];
  cardList.forEach(card => {

    cards.push(
      <div data-grid={{
             w: card.cardLayout ? card.cardLayout.w : 6,
             h: card.cardLayout ? card.cardLayout.h : 15,
             x: card.cardLayout ? card.cardLayout.x : 0,
             y: card.cardLayout ? card.cardLayout.y : 0,
             minW: 2,
             minH: 3
           }}
           key={card.cardTitle + '_' + Math.random()}
           style={{boxShadow: '0 2px 8px #f0f1f2'}}
      >
        <CustomTabContent cardContent={card.cardContent}
                          cardTitle={card.cardTitle}
                          {...props}
                          onDeleteContent={onDeleteContent}
        />
      </div>
    )
  })

  return(
    <div>
      <Dropdown overlay={menu} trigger={['contextMenu']}>
        <Card style={{overflow: 'auto'}}
              bodyStyle={{paddingLeft: 16, paddingRight: 16, minHeight: '72vh'}}
        >
          {!props.content.length < 0 ? (
            <Alert
              closable
              message="Nothing to show here..."
              description="Try adding something."
              type="info"
              showIcon
            />
          ) : (
            <div>
              <ResponsiveGridLayout className="react-grid-layout" margin={[16, 16]}
                                    breakpoints={{lg: 1000, md: 796, sm: 568, xs: 280, xxs: 0}}
                                    cols={{lg: 12, md: 6, sm: 4, xs: 2, xxs: 1}}
                                    rowHeight={1} onLayoutChange={onLayoutChange}
                                    compactType={'vertical'}
              >
                {cards}
              </ResponsiveGridLayout>
            </div>
          )}
        </Card>
      </Dropdown>
    </div>
  )
}
