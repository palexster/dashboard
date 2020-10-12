import Utils from '../../services/Utils';
import React from 'react';

export function columnContentFunction(resource, content){
  let utils = Utils();
  let parameters = content.split('%//');

  if(parameters.length > 1){
    let params = [];
    let index = 0;
    parameters.forEach(param => {
      if(param.slice(0, 6) === 'param.'){
        let object = Utils().index(resource, param.slice(6));
        if(typeof object === 'string')
          object = "'" + object + "'";
        else object = "utils.index(resource, '" + param.slice(6) + "')";
        params.push(object ? object : "''");
      } else{
        if(param.slice(0, 1) === "'" && param.slice(-1) === "'"){
          if(index === 0)
            param = param + ' + ';
          else if(index === parameters.length)
            param = ' + ' + param;
          else
            param = ' + ' + param + ' + '
        }
        params.push(param);
      }
      index++;
    })
    try{
      return eval(params.join(''));
    }catch{
      try{
        let x = new Function('utils, resource', params.join(''));
        return x(Utils(), resource);
      }catch{
        return '';
      }
    }
  } else {
    if(parameters[0].split(' ').length < 2){
      if(parameters[0].slice(0, 6) === 'param.')
        parameters[0] = parameters[0].slice(6)
      return Utils().index(resource, parameters[0]);
    } else {
      let x = new Function('utils, resource', parameters[0]);
      return x(Utils(), resource);
    }
  }
}
