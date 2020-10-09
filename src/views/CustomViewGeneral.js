import React, { useState, useEffect, useRef } from 'react';
import './CustomView.css';
import _, { isEmpty } from 'lodash';
import LoadingIndicator from '../common/LoadingIndicator';
import 'react-resizable/css/styles.css';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { onDrag, onResize, resizeDetector } from './CustomViewUtils';
import { Alert } from 'antd';
import ResourceGeneral from '../resources/resource/ResourceGeneral';

const ResponsiveGridLayout = WidthProvider(Responsive);

function CustomViewGeneral(props) {

  const resourcesCV = useRef([]);
  const customView = useRef();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true)
  const [layout, setLayout] = useState({ lg: [] });
  const [resourceView, setResourceView] = useState([]);
  const [newBr, setNewBr] = useState('lg');
  const flag = useRef(false);

  useEffect(() => {
    window.api.CVArrayCallback.current.push(getCustomViews);
    customView.current = window.api.customViews.current.find(item => {
      return item.metadata.name === props.match.params.viewName;
    })
    if (customView.current) {
      if (customView.current.spec.layout) {
        setLayout(customView.current.spec.layout);
      }
      resourcesCV.current = customView.current.spec.crds;
      loadResource();
    }

    return () => {
      /** Cancel all callback for the resources */
      window.api.CVArrayCallback.current = window.api.CVArrayCallback.current.filter(func => {
        return func !== getCustomViews;
      });
    }
  }, [props.match])

  useEffect(() => {
    generateResourceView();
    generateLayout();
  }, [resources, newBr])

  useEffect(() => {
    return () => {
      /**
       * Save the layout
       */

      if(!flag.current){
        flag.current = true;
        return;
      }

      if(!isEmpty(layout) && customView.current){
        customView.current.spec.layout = layout;
        let array = customView.current.metadata.selfLink.split('/');
        window.api.updateCustomResource(
          array[2],
          array[3],
          customView.current.metadata.namespace,
          array[6],
          customView.current.metadata.name,
          customView.current
        ).catch(error => console.log(error))
      }
    }
  }, [layout])

  const pruneLayout = l => {
    Object.keys(l).forEach(br => {
      l[br].forEach(item => {
        delete item.isDraggable;
        delete item.moved;
        delete item.static;
        delete item.isBounded;
        delete item.isResizable;
        delete item.maxH;
        delete item.maxW;
        delete item.minH;
        delete item.minW;
      })
    })
    return l;
  }

  const updateResource = (CV, load) => {
    let changeLayout = load;
    if(!load && CV.spec.layout &&
      !_.isEqual(pruneLayout(customView.current.spec.layout), CV.spec.layout))
      changeLayout = true

    if(changeLayout) {
      flag.current = false;
      setLayout(CV.spec.layout);
    }

    customView.current = CV;
    if(!_.isEqual(resourcesCV.current, CV.spec.crds)){
      resourcesCV.current = CV.spec.crds;
      loadResource();
    }
  }

  /** Update the custom views */
  const getCustomViews = () => {
    let CV = window.api.customViews.current.find(item => {
      return item.metadata.name === props.match.params.viewName;
    })
    if(!CV){
      props.history.push('/')
    } else {
      if(!customView.current){
        updateResource(CV, true);
      } else {
        /** Update layout only if something really changed */
        if(!_.isEqual(customView.current, CV)) {
          updateResource(CV);
        }
      }
    }
  }

  const loadResource = () => {
    setLoading(true);

    let _resources = [];

    if(!resourcesCV.current){
      resourcesCV.current = [];
      setResources([]);
      setLoading(false);
    } else {
      resourcesCV.current.forEach(item => {
        let res = {metadata: {name: item.crdName}}
        /** If a template is defined in the CR, use that one */
        if(item.template){
          res.altTemplate = item.template;
        }
        /** If a custom name is defined, use that one */
        if(item.crdAltName){
          res.altName = item.crdAltName;
        }
        _resources.push(res);

        /** if there's a layout for this resource, set it */
        let resourceLayout = null;
        if (!isEmpty(customView.current.spec.layout) && customView.current.spec.layout[newBr]) {
          resourceLayout = customView.current.spec.layout[newBr].find(item => {return item.i === _resources[_resources.length - 1].metadata.name})
          if(resourceLayout){
            _resources[_resources.length - 1].x = resourceLayout.x;
            _resources[_resources.length - 1].y = resourceLayout.y;
            _resources[_resources.length - 1].height = resourceLayout.h;
            _resources[_resources.length - 1].width = resourceLayout.w;
            _resources[_resources.length - 1].static = false;
          }
        }

        if(_resources.length === resourcesCV.current.length)
          setResources(_resources);
      });
    }
  }

  /** Create the resource cards */
  const generateResourceView = () => {
    let _resourceView = [];

    resources.forEach(item => {
      window.api.getGenericResource(item.metadata.name).then(res => {
        console.log(res);
        _resourceView.push(
          <div key={item.metadata.name} className="crd-content" aria-label={'crd_custom_view'} >
            <div className="inner-crd" >
              <ResourceGeneral
                onCustomView
                pathname={res.metadata.selfLink}
              />
            </div>
          </div>
        );
        setResourceView([..._resourceView]);
      });
    })
  }

  /** (Re)Generate the layout based on the user preferences */
  const generateLayout = () => {
    let _layout = [];

    if(resources.length !== resourcesCV.current.length || resourcesCV.current.length === 0) return;

    for(let i = 0; i < resources.length; i++) {
      let resourceLayout = null;
      if (layout[newBr]) {
        resourceLayout = layout[newBr].find(item => {return item.i === resources[i].metadata.name})
      }
      /** Stay where I put you even when the layout is regenerated */
      _layout.push({
        i: resources[i].metadata.name,
        x: resourceLayout ? resourceLayout.x : i,
        y: resourceLayout ? resourceLayout.y : 0,
        w: resources[i].width ? resources[i].width : 1,
        h: resources[i].height ? resources[i].height : 1,
        isDraggable: resources[i].static ? !resources[i].static : true,
        static: resources[i].static ? resources[i].static : false
      });
    }
    let layouts = JSON.parse(JSON.stringify(layout));
    layouts[newBr] = _layout;
    setLoading(false);
    setLayout(layouts);
  }

  const childLogic = id => {
    setResources(prev => {
      prev.find(item => {return item.metadata.name === id}).static = !prev.find(item => {return item.metadata.name === id}).static;
      return [...prev];
    });
  }

  const onBreakpointChange = br => {
    setNewBr(br);
  }

  if(loading)
    return <LoadingIndicator />
  else if(resources.length === 0)
    return <Alert
             closable
             message="No resource to show"
             description="Please select some resources."
             type="info"
             showIcon
           />
  else
    return (
      <div>
        { resizeDetector() }
        <ResponsiveGridLayout className="react-grid-layout" layouts={layout} margin={[20, 20]}
                              breakpoints={{lg: 1000, md: 796, sm: 568, xs: 280, xxs: 0}}
                              cols={{lg: 3, md: 2, sm: 1, xs: 1, xxs: 1}}
                              compactType={'vertical'} rowHeight={350}
                              onResizeStop={(_layout, oldLayoutItem, layoutItem) => onResize(_layout, oldLayoutItem, layoutItem, resources, setResources, layout, setLayout, newBr)}
                              onBreakpointChange={onBreakpointChange}
                              onDragStop={(_layout, oldLayoutItem, layoutItem) => onDrag(_layout, oldLayoutItem, layoutItem, resources, setResources, layout, setLayout, newBr)}
                              draggableHandle={'.draggable'} >
          {resourceView}
        </ResponsiveGridLayout>
      </div>
    );
}

export default CustomViewGeneral;
