import React, { useEffect } from 'react';
import './Login.css';
import { Button, Form, Input, Typography } from 'antd';
import ApiInterface from '../services/api/ApiInterface';
import AppFooter from '../common/AppFooter';

function Login(props){

  const onFinish = values => {
    props.func(values.token);
  }

  const validator = (rule, value) => {
    let api = ApiInterface({id_token: value}, props)
    return api.getNodes().then(() => {
      return Promise.resolve();
    }).catch(() => {
      return Promise.reject('Token is not valid');
    })
  }

  return (
    <div className={'login-container'}>
      <Typography.Title style={{marginBottom: 50, fontSize: 50}}>
        Liqo Login
      </Typography.Title>
      <Form onFinish={onFinish} className="login-form">
        <Form.Item
          validateTrigger={'onSubmit'}
          name="token"
          rules={[
            { required: true, message: 'Please input your token!' },
            { validator: async (rule, value) => validator(rule, value)}
          ]}>
          <Input.Password aria-label={'lab'}  placeholder={'Please input your secret token'}/>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" className="login-form-button" >Login</Button>
        </Form.Item>
      </Form>
    </div>
  );
}


export default Login;
