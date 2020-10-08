import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, Input, Select, Dropdown, Modal, Tooltip } from 'antd';
import { CodeOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { splitCamelCaseAndUp } from '../../services/stringUtils';
import Editor from '../../editors/Editor';
let definitions;

export default function KubernetesSchemaAutocomplete(props){
  let params = useParams();
  const [totItems, setTotItems] = useState([]);
  const [openCode, setOpenCode] = useState(false);
  let tot = [];
  let columnValue = '';

  useEffect(() => {
    getSchema();
  }, [props.kind]);

  const getSchema = () => {
    console.log(props)
    window.api.getKubernetesJSONSchema()
      .then(r => {
        let res = 'io.k8s.api.' +
          (params.group ? params.group.split('.')[0] + '.' : 'core.') +
          params.version + '.' +
          props.kind.slice(0, -4)
        if(props.kind === 'CustomResourceDefinitionList'){
          res = 'io.k8s.apiextensions-apiserver.pkg.apis.apiextensions.v1beta1.CustomResourceDefinition'
        }
        console.log(r.definitions)
        definitions = r.definitions;
        fillItems(r.definitions[res], '', 0);
      })
  }

  const checkIfGood = (key, obj) => {
    return !((definitions['io.k8s.apiextensions-apiserver.pkg.apis.apiextensions.v1.JSONSchemaProps']
        .properties[key] &&
      key !== '$ref' &&
      key !== 'properties' &&
      key !== 'items' &&
      key !== 'type') ||
      key.slice(0, 3) === 'x-k' ||
      key === 'type' && typeof obj[key] === 'string'
    );
  }

  const fillItems = (obj, path, counter) => {
    for (let key in obj) {
      // skip loop if the property is from prototype
      if (obj.hasOwnProperty(key) && checkIfGood(key, obj) && typeof obj === 'object'){
        if(key === 'properties' ||
          key === 'items'
        ){
          fillItems(obj[key], path, counter + 1);
        } else if(key === '$ref' && typeof obj[key] === 'string'){
          //console.log(obj[key]);
          getReferencedSchema(obj[key], path, counter + 1)
        } else {
          tot = [...tot, {
            value: path ? (path + '.' + key + '.') : key + '.',
            label: path ? path.replaceAll('.', '/') : 'root',
            options: [{
              label: key,
              value: path ? (path + '.' + key) : key
            }]
          }];
          fillItems(obj[key], path ? (path + '.' + key) : key, counter + 1);
        }
      }
    }

    if(path === '') {
      console.log(tot);
      setTotItems(tot);
    }
  }

  function getReferencedSchema(ref, path, counter) {
    fillItems(definitions[ref.split('/')[2]], path, counter);
  }

  const onSearch = (value, option) => {

    if(!option.value && !totItems.find(item => item.value === (value + '.'))){
      columnValue = columnValue + value + '%//';
    } else {
      columnValue = columnValue + 'param.' + option.value + '%//';
      /*console.log(2, columnValue, option.value);
      setTotItems(prev => prev.filter(item => item.value !== (value + '.')));
      console.log(value.split('.').slice(0, -1).join('').replaceAll('.', '/'))
      setTotItems(prev => [...prev, {
        value: option.value + '.' + '#',
        label: value.split('.').slice(0, -1).join('').replaceAll('.', '/'),
        options: [{
          label: value.split('.').slice(-1),
          value: option.value + '#'
        }]
      }]);*/
    }
  }

  const onDeselect = (value, option) => {
    if(option.label){
      let key = 'param.' + value + '%//';
      columnValue = columnValue.split(key).join('');
    }else{
      columnValue = columnValue.split(value).join('');
    }
  }

  function onComplete() {
    console.log('yoo', columnValue.slice(0, -3), splitCamelCaseAndUp(columnValue.split('.').splice(-1)[0].slice(0, -3)));

    props.updateFunc(columnValue.slice(0, -3), splitCamelCaseAndUp(columnValue.split('.').splice(-1)[0].slice(0, -3)));
  }

  const onSubmit = item => {
    console.log(item);
    item = item + '%//';
    columnValue = item;
    onComplete();
  }

  return(
    <div aria-label={'autocompletesearch'}>
      <Select
        allowClear
        onDeselect={onDeselect}
        style={{width: '80%'}}
        filterOption={(inputValue, option) => {
          return option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
        }}
        options={totItems}
        onSelect={onSearch}
        showSearch
        mode={'tags'}
      />
      <Tooltip title={'Open editor'}>
        <Button style={{width: '10%'}} icon={<CodeOutlined />}
                onClick={() => setOpenCode(true)}
        />
      </Tooltip>
      <Tooltip title={'Save column'}>
        <Button style={{width: '10%'}} type={'primary'} icon={<SaveOutlined />}
                onClick={onComplete}
        />
      </Tooltip>
      <Modal visible={openCode}
             width={'50%'}
             footer={null}
             title={'Add column code'}
             centered
             onCancel={() => setOpenCode(false)}
      >
        <Editor value={''}
                mode={'javascript'}
                onClick={onSubmit}
        />
      </Modal>
    </div>
  )

}
