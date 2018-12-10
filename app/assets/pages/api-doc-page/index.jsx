import React from 'react';
import { connect } from 'dva';
import { Form, Button, Input } from 'antd';

import Info from '../../components/Info';
import SchemaEditor from '../../components/SchemaEditor';

const createForm = Form.create;
const FormItem = Form.Item;

import './index.less';

class Api extends React.PureComponent {
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      // 新建API
      this.props.dispatch({
        type: 'apiDocModel/saveAPI',
        api: values,
      });
    });
  }

  render() {
    const { collectionApisModel } = this.props;
    const { params: { apiId } } = this.props;
    const { currentAPI } = collectionApisModel;
    if (!currentAPI._id) {
      return null;
    }

    const { getFieldDecorator, getFieldError } = this.props.form;
    const formItemLayoutFull = null;

    return (
      <div>
        <div className="c-header">
          <Info
            title={currentAPI.name}
            desc={currentAPI.desc}
            url={currentAPI.url}
            apiType={currentAPI.apiType}
          >
            <Button size="default" className="new-btn" type="primary" icon="save" onClick={this.handleSave}>保存</Button>
          </Info>
        </div>
        <div className="api-content">
          <Form layout="vertical">
            {getFieldDecorator('_id', {
              initialValue: apiId,
            })(
              <Input type="hidden" />
            )}
            <FormItem
              label="请求参数："
              {...formItemLayoutFull}
              help={getFieldError('desc')}
            >
              {getFieldDecorator('requestSchema', {
                initialValue: currentAPI.requestSchema || {},
              })(
                <SchemaEditor />
              )}
            </FormItem>
            <FormItem
              label="返回数据："
              {...formItemLayoutFull}
              help={getFieldError('desc')}
            >
              {getFieldDecorator('responseSchema', {
                initialValue: currentAPI.responseSchema || {},
              })(
                <SchemaEditor />
              )}
            </FormItem>
          </Form>
        </div>
      </div>
    );
  }
}

export default connect(({ collectionApisModel }) => {
  return {
    collectionApisModel,
  };
})(createForm()(Api));
