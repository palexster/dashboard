import { Rate } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';
import { createNewConfig, getResourceConfig, updateResourceConfig } from '../DashboardConfigUtils';

export default function FavouriteButton(props){
  let params = useParams();

  /** Update DashboardConfig with the favourite resource */
  const handleClickResourceListFav = () => {

    if(window.api.dashConfigs.current){
      let resourceConfig = getResourceConfig(params);

      if(!_.isEmpty(resourceConfig)){
        /** A config for this resource exists, update it */
        resourceConfig.favourite = !resourceConfig.favourite;
      } else {
        /** A config for this resource does not exists, create one */
        resourceConfig = createNewConfig(params, props);
        resourceConfig.favourite = true;
      }

      updateResourceConfig(resourceConfig, params);
    }
  }


  /** Update Resource with the 'favourite' annotation */
  const handleClickResourceFav = () => {
    let resource = props.resourceList.find(item => {return item.metadata.name === props.resourceName});
    if(!resource.metadata.annotations || !resource.metadata.annotations.favourite){
      resource.metadata.annotations = {favourite: 'true'};
    } else {
      resource.metadata.annotations.favourite = null;
    }
    return window.api.updateGenericResource(
      resource.metadata.selfLink,
      resource
    ).then(res => console.log(res));
  }

  return(
    <Rate className="favourite-star" count={1}
          value={props.favourite === 1 ? 1 : 0}
          onChange={props.list ? handleClickResourceListFav : handleClickResourceFav}
          style={props.list ? {marginLeft: 10} : {marginLeft: 0, marginTop: -16}}
    />
  )
}
