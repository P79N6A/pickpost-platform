/* eslint-disable array-bracket-spacing */
import React from 'react';
import {
  Table, Icon, Button, Input, Popover,
  Tag, Form, Dropdown, Modal, Menu,
  AutoComplete, message, Popconfirm,
} from 'antd';
import { connect } from 'dva';
import ajax from 'xhr-plus';
import { Link } from 'react-router';
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';

import Layout from '../../layout/default.jsx';
import Info from '../../components/Info';
import { getQueryParamByName } from '../../utils/utils';
import { TypeColorMap } from '../../utils/constants';

import './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;

const mySelf = window.context.user;

class Collection extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      activeKey: 'collection',
      showMoreSettings: false,
      showModal: false,
      memberList: [],
    };
  }

  componentDidMount() {
    const { collectionId } = this.props.params;

    // 获取需求信息
    this.props.dispatch({
      type: 'collectionModel/collection',
      id: collectionId,
    });
    // 获取需求内接口列表
    this.props.dispatch({
      type: 'collectionModel/collectionApis',
      id: collectionId,
    });
  }

  apisColumns = [{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: '260px',
  }, {
    title: '类型',
    dataIndex: 'methods',
    key: 'methods',
    render: methods => {
      return methods.map(m => (<Tag key={m} color={TypeColorMap[m]}>{m}</Tag>));
    },
  }, {
    title: '地址',
    dataIndex: 'url',
    key: 'url',
    width: '400px',
  }, {
    title: '所属应用',
    dataIndex: 'projectName',
    key: 'projectName',
  }, {
    title: '最近更新',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: updatedAt => {
      return moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');
    },
  }, {
    title: '创建人',
    dataIndex: 'creater',
    key: 'creater',
  }, {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    render: (_, api) => {
      const DeleteFileButtons = (
        <div className="action-btns">
          <Button type="default" onClick={this.handleRemoveAPI.bind(this, api)}>从需求移除接口</Button>
          <Button type="danger" onClick={this.handleDeleteAPI.bind(this, api)}>从应用删除接口</Button>
        </div>
      );
      return (
        <div className="actions" onClick={e => e.stopPropagation()}>
          <Link target="_blank" to={`/api-detail/${api._id}/doc?belong=collection_${this.props.params.collectionId}`}>文档</Link>
          <Link target="_blank" to={`/api-detail/${api._id}/test?belong=collection_${this.props.params.collectionId}`}>测试</Link>
          <Link target="_blank" to={`/api-detail/${api._id}/mock?belong=collection_${this.props.params.collectionId}`}>Mock</Link>
          <Popover overlayClassName="action-btns-wrapper" trigger="click" content={DeleteFileButtons}>
            <Link target="_blank" to={`/api-detail/${api._id}/mock?belong=collection_${this.props.params.collectionId}`}>删除</Link>
          </Popover>
        </div>
      );
    },
  }];

  memberColumns = [
    {
      dataIndex: 'label',
      width: 200,
      align: 'center',
      render: v => {
        return <p style={{ height: '40px', lineHeight: '40px', margin: 0 }}>{v}</p>;
      },
    },
    {
      dataIndex: 'email',
      align: 'center',
    },
    {
      dataIndex: 'role',
      align: 'center',
      render: (v, api) => {
        if (this.props.collectionModel.collection.owners.map(v => v.key).includes(mySelf.workid)) {
          return (<Dropdown overlay={this.generateMenu(api)} trigger={['click']}>
            <a href="#">
              {v} <Icon type="down" />
            </a>
          </Dropdown>);
        }
        return (<a href="#">
          {v}
        </a>);
      },
    },
    {
      dataIndex: 'index',
      align: 'center',
      render: (v, api) => {
        if (this.props.collectionModel.collection.owners.map(v => v.key).includes(mySelf.workid)) {
          let content = '';
          if (api.key === mySelf.workid) {
            content = <a href="#" style={{ margin: 0, color: 'red' }}>退出</a>;
          } else {
            content = <a href="#" style={{ margin: 0, color: '#40a9ff' }}>删除</a>;
          }
          return <Popconfirm title="确认删除吗?" onConfirm={() => { this.handleDelete(v, api); }} okText="确认" cancelText="取消">
            {content}
          </Popconfirm>;
        }
        return null;
      },
    },
  ];

  generateMenu = api => {
    const _api = api;
    return (
      <Menu onClick={e => { this.changeRole(e, _api); }}>
        <Menu.Item key="1">OWNER</Menu.Item>
        <Menu.Item key="2">MEMBER</Menu.Item>
      </Menu>);
  }

  // 改变成员角色
  changeRole = (e, _api) => {
    const { collectionModel, dispatch } = this.props;
    const { members, owners } = collectionModel.collection;
    const newOwners = cloneDeep(owners);
    const newMembers = cloneDeep(members);
    // console.log(collectionModel.collection, _api, e);

    if (e.key === '2') { // 从Owner -> Member
      owners.map((v, i) => {
        if (_api.key === v.key) {
          newOwners.splice(i, 1);
        }
        return null;
      });
      newMembers.push(_api);
    } else if (e.key === '1') {
      members.map((v, i) => {
        if (_api.key === v.key) {
          newMembers.splice(i, 1);
        }
        return null;
      });
      newOwners.push(_api);
    }

    dispatch({
      type: 'collectionModel/setData',
      data: {
        collection: {
          ...collectionModel.collection,
          owners: newOwners,
          members: newMembers,
        },
      },
    });

    this.handleSaveCollection({
      owners: newOwners,
      members: newMembers,
    });
  }

  // 删除成员/退出
  handleDelete = (v, _api) => {
    const { collectionModel, dispatch } = this.props;
    const { members, owners } = collectionModel.collection;
    const newOwners = cloneDeep(owners);
    const newMembers = cloneDeep(members);
    // console.log(v, _api.key);

    owners.map((v, i) => {
      if (_api.key === v.key) {
        newOwners.splice(i, 1);
      }
      return null;
    });
    members.map((v, i) => {
      if (_api.key === v.key) {
        newMembers.splice(i, 1);
      }
      return null;
    });

    dispatch({
      type: 'collectionModel/setData',
      data: {
        collection: {
          ...collectionModel.collection,
          owners: newOwners,
          members: newMembers,
        },
      },
    });

    this.handleSaveCollection({
      owners: newOwners,
      members: newMembers,
    });
  }

  // 校验表单
  validateForm = e => {
    if (e) e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.handleSaveCollection(values);
      }
    });
  }


  // 更新需求设置
  handleSaveCollection = values => {
    const { collectionId } = this.props.params;
    const collection = {};

    Object.keys(values).map(v => {
      collection[v] = values[v];
      return null;
    });
    this.props.dispatch({
      type: 'collectionModel/saveCollection',
      id: collectionId,
      collection,
    });
  }

  // 废弃需求
  handleAbandon = () => {
    const { collectionId } = this.props.params;
    if (collectionId) {
      this.setState({
        showModal: true,
      });
    }
  }

  // 搜索用户
  handleSearchMembers(keyword) {
    if (keyword === '') {
      return;
    }

    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    this._timeout = setTimeout(() => {
      ajax({
        url: '/api/search',
        method: 'get',
        type: 'json',
        data: { keyword },
      }).then(({ status, data }) => {
        if (status === 'success') {
          const memberList = data.users.map(v => ({
            text: <div>
              {v.avatar_url && <img className="option-user" src={v.avatar_url} width={30} height={30} alt="" />}
              <span style={{ marginLeft: '10px' }}>{v.name} - {v.username || v.empId}</span>
            </div>,
            value: JSON.stringify(v),
            backfill: '',
          }));
          // console.log(memberList);
          this.setState({
            memberList,
          });
        }
      });

    }, 300);
  }

  // 添加用户
  handleSearchSelect(_value) {
    const { collectionModel, dispatch } = this.props;
    const value = JSON.parse(_value);
    const hasSameOne = collectionModel.collection.owners.concat(collectionModel.collection.members).some(v => {
      if (v.key === value.empId) return true;
      return false;
    });

    if (hasSameOne) {
      message.info('请勿重复添加');
      return;
    }
    const newCollection = collectionModel.collection;
    newCollection.members.push({
      email: value.email,
      key: value.empId,
      label: value.name,
      role: 'MEMBER',
    });
    dispatch({
      type: 'collectionModel/setData',
      data: {
        collection: newCollection,
      },
    });
    this.handleSaveCollection({
      owners: newCollection.owners,
      members: newCollection.members,
    });
  }

  handleOk = () => {
    const { collectionId } = this.props.params;
    this.setState({
      showModal: false,
    }, () => {
      this.props.dispatch({
        type: 'collectionModel/deleteCollection',
        id: collectionId,
      });
    });
  }

  handleDeleteAPI = data => {
    const { collectionId } = this.props.params;
    this.props.dispatch({
      type: 'collectionModel/deleteAPI',
      apiId: data._id,
      projectId: data.projectId,
      collectionId,
    });
  }

  handleRemoveAPI = data => {
    const { collectionId } = this.props.params;
    this.props.dispatch({
      type: 'collectionModel/unlinkAPI',
      apiId: data._id,
      projectId: data.projectId,
      collectionId,
    });
  }

  render() {
    window._t_ = this;
    const { params, collectionModel } = this.props;
    const { apis, collection } = collectionModel;
    const { collectionId } = params;
    const { getFieldDecorator } = this.props.form;
    const { memberList } = this.state;
    const currentTab = getQueryParamByName('tab') || 'api';

    const owners = collection.owners ? collection.owners.map(v => {
      v.role = 'OWNER';
      return v;
    }) : [];
    const members = collection.members ? collection.members.map(v => {
      v.role = 'MEMBER';
      return v;
    }) : [];

    const users = (owners).concat(members);

    return (
      <Layout uplevel={'/collections'}>
        <aside>
          <Link to={`/collection/${collectionId}?tab=api`} activeClassName="active">
            <Icon type="bars" />
            <div>接口</div>
          </Link>
          <Link to={`/collection/${collectionId}?tab=member`} activeClassName="active">
            <Icon type="team" />
            <div>成员</div>
          </Link>
          <Link to={`/collection/${collectionId}?tab=setting`} activeClassName="active">
            <Icon type="setting" />
            <div>设置</div>
          </Link>
        </aside>
        <main className="collection-main">
          { // 接口管理
            currentTab === 'api' && (
              <div>
                <div className="c-header">
                  <Info title={collection.name} desc={collection.desc}>
                    <Link to={`/collection/${collectionId}/newapi`}>
                      <Button size="default" className="new-btn pull-right" type="primary" icon="plus">
                        新建接口
                      </Button>
                    </Link>
                  </Info>
                </div>
                <Table
                  dataSource={apis}
                  columns={this.apisColumns}
                  rowKey="_id"
                  locale={{ emptyText: '暂无数据' }}
                  onRow={api => {
                    return {
                      onClick: () => {
                        window.open(`/api-detail/${api._id}/doc?belong=collection_${this.props.params.collectionId}`);
                      },
                    };
                  }}
                />
              </div>
            )
          }
          { // 成员管理
            currentTab === 'member' && (
              <div className="member-wrapper">
                <div className="member-top">
                  <h2 className="title">{`需求成员 ${users.length} 人`}</h2>
                  {users.map(v => v.key).includes(mySelf.workid) &&
                    <AutoComplete
                      className="memeber-search"
                      size="default"
                      dataSource={memberList}
                      optionLabelProp="backfill"
                      onSearch={keyword => { this.handleSearchMembers(keyword); }}
                      onSelect={value => { this.handleSearchSelect(value); }}
                    >
                      <Input placeholder="搜索用户并添加" suffix={<Icon type="search" className="certain-category-icon" />} />
                    </AutoComplete>
                  }
                </div>
                <Table pagination={false} showHeader={false} columns={this.memberColumns} dataSource={users} />
              </div>
            )
          }
          { // 设置
            currentTab === 'setting' && (
              <div className="setting-wrapper">
                <Form className="form-wrapper" layout="vertical" hideRequiredMark={true}>
                  <FormItem label="名称">
                    {
                      getFieldDecorator('name', {
                        initialValue: collection.name,
                        rules: [{ required: true, message: '需求名称不能为空' }],
                      })(<Input className="setting-input" placeholder="请写入需求名称" />)
                    }
                  </FormItem>
                  <FormItem label="描述">
                    {
                      getFieldDecorator('desc', {
                        initialValue: collection.desc,
                      })(<TextArea className="setting-input" placeholder="请写入需求描述" autosize={{ minRows: 3, maxRows: 6 }} />)
                    }
                  </FormItem>
                  <FormItem style={{ paddingTop: '20px' }}>
                    <Button disabled={!users.map(v => v.key).includes(mySelf.workid)} className="submit" type="primary" size="default" htmlType="submit" onClick={this.validateForm}>更新</Button>
                  </FormItem>
                  <FormItem style={{ borderTop: '1px solid #f2f4f5', paddingTop: '20px' }} label="废弃需求">
                    <p>注意，仅需求 Owner 可以进行废弃，废弃后，将不可恢复，请务必慎重</p>
                    <Button disabled={!owners.map(v => v.key).includes(mySelf.workid)} style={{ paddingÎTop: '20px' }} type="danger" size="default" onClick={this.handleAbandon}>废弃</Button>
                  </FormItem>
                </Form>
                <Modal
                  visible={this.state.showModal}
                  title="废弃"
                  okText="确认废弃"
                  cancelText="取消"
                  onOk={this.handleOk}
                  onCancel={() => { this.setState({ showModal: false }); }}
                  okButtonProps={{ type: 'danger' }}
                >
                  <p>废弃后，将不可恢复，请务必慎重 !</p>
                </Modal>
              </div>
            )
          }
        </main>
      </Layout>
    );
  }
}

export default connect(({ collectionModel }) => {
  return {
    collectionModel,
  };
})(Form.create()(Collection));
