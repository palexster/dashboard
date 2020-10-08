import { Rate } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createNewConfig } from '../DashboardConfigUtils';

export default function FavouriteButton(props){
  const [favourite, setFavourite] = useState(false);
  let params = useParams();

  useEffect(() => {
    getDashConfig();
    window.api.DCArrayCallback.current.push(getDashConfig);

    return() => {
      window.api.DCArrayCallback.current = window.api.DCArrayCallback.current.filter(func => {
        return func !== getDashConfig;
      });
    }
  }, [])

  const getDashConfig = () => {
    if(window.api.dashConfigs.current){
      let resourceConfig = window.api.dashConfigs.current.spec.resources.find(resource => {
        return resource.resourcePath === window.location.pathname;
      });

      if(resourceConfig && resourceConfig.favourite)
        setFavourite(true);
    }
  }

  /** Update DashboardConfig with the favourite resource */
  const handleClick_fav = async () => {
    let CRD = window.api.getCRDFromKind('DashboardConfig');

    if(window.api.dashConfigs.current){
      let resourceConfig = window.api.dashConfigs.current.spec.resources.find(resource => {
        return resource.resourcePath === window.location.pathname;
      });

      if(resourceConfig){
        /** A config for this resource exists, update it */
        window.api.dashConfigs.current.spec.resources = window.api.dashConfigs.current.spec.resources.filter(resource =>
          resource.resourcePath !== window.location.pathname
        )
        resourceConfig.favourite = !resourceConfig.favourite;

      } else {
        /** A config for this resource does not exists, create one */
        resourceConfig = createNewConfig(params, props);
        resourceConfig.favourite = true;
      }

      window.api.dashConfigs.current.spec.resources.push(resourceConfig);
      window.api.updateCustomResource(
        CRD.spec.group,
        CRD.spec.version,
        undefined,
        CRD.spec.names.plural,
        window.api.dashConfigs.current.metadata.name,
        window.api.dashConfigs.current
      ).then(res => {
        setFavourite(res.body.spec.resources.find(resource => {
          return resource.resourcePath === window.location.pathname;
        }).favourite);
      }).catch(error => console.log(error))
    }
  }

  return(
    <Rate className="favourite-star" count={1}
          value={!favourite ? 0 : 1}
          onChange={handleClick_fav}
          style={{marginLeft: 10}}
    />
  )
}
