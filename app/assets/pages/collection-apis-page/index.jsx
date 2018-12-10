import React from 'react';
import { connect } from 'dva';
import { Input, Menu, Dropdown, Button, Icon } from 'antd';
import { browserHistory, Link } from 'dva/router';
import Folder from '../../components/folder';
import File from '../../components/file';
import FolderCreate from './components/folder-create';

import './index.less';

class Api extends React.PureComponent {
  componentDidMount() {
    const { params: { collectionId, apiId } } = this.props;

    if (apiId) {
      this.props.dispatch({
        type: 'collectionApisModel/detail',
        apiId,
      });
    }

    this.props.dispatch({
      type: 'collectionApisModel/setData',
      payload: {
        collectionId,
      },
    });

    this.props.dispatch({
      type: 'collectionApisModel/getApisTree',
      collectionId,
    });

    this.handleFilterDebounced = e => {
      this.props.dispatch({
        type: 'collectionApisModel/changeKeywords',
        keywords: e.target.value,
      });
    };

    // this.handleFilterDebounced = debounce(e => {
    //   e.persist();
    //   this.props.dispatch({
    //     type: 'collectionApisModel/changeKeywords',
    //     keywords: e.target.value,
    //   });
    // }, 300);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.apiId !== nextProps.params.apiId && nextProps.params.apiId) {
      this.props.dispatch({
        type: 'collectionApisModel/detail',
        apiId: nextProps.params.apiId,
      });
    }
  }

  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      this.props.dispatch({
        type: 'collectionApisModel/saveAPI',
        api: values,
      });
    });
  }

  getTypeByMethods(methods) {
    if (!Array.isArray(methods)) {
      return 'HTTP';
    }

    if (methods.indexOf('RPC') >= 0) {
      return 'RPC';
    } else if (methods.indexOf('SPI') >= 0) {
      return 'SPI';
    }
    return 'HTTP';
  }

  getBelongQuery() {
    const { belong } = this.props.location.query;
    return belong || '';
  }

  getBelong() {
    let { belong } = this.props.location.query;
    const { currentAPI: { projectId } } = this.props.collectionApisModel;
    belong = belong || `project_${projectId}`;
    return belong;
  }

  getUplevel() {
    return '/' + this.getBelong().replace('_', '/') + '?tab=api';
  }

  handleChangeAPIPage = item => {
    const belong = this.getBelongQuery();

    browserHistory.push({
      pathname: `/api-detail/${item[0]}/doc`,
      query: {
        belong,
      },
    });
  }

  handleMenuClick = e => {
    if (e.key === 'file') {
      const { collectionId } = this.props.collectionApisModel;
      const url = `/collection/${collectionId}/newapi`;

      browserHistory.push({
        pathname: url,
      });
    } else if (e.key === 'folder') {
      this.props.dispatch({
        type: 'collectionApisModel/setFolderModal',
        visible: true,
      });
    }
  }

  saveFormRef = formRef => {
    this.formRef = formRef;
  }

  handleCancel = () => {
    this.props.dispatch({
      type: 'collectionApisModel/setFolderModal',
      visible: false,
    });
  }

  handleCreateFolder = () => {
    const form = this.formRef.props.form;
    const { collectionId } = this.props.collectionApisModel;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      this.props.dispatch({
        type: 'collectionApisModel/createFolder',
        form,
        parentId: '',
        collectionId,
        name: values.title,
      });
    });
  }

  handleToggleCollection = (id, collapsed) => {
    const { collectionApis } = this.props.collectionApisModel;
    this.props.dispatch({
      type: 'collectionApisModel/setData',
      payload: {
        collectionApis: collectionApis.map(item => ({
          ...item,
          isCollapsed: item._id === id ? !!collapsed : !!item.isCollapsed,
        })),
      },
    });
  }

  render() {
    const { collectionApisModel, collectionModel, params: { collectionId } } = this.props;
    const { filterApis, keywords, showFolderModal, collectionApis } = collectionApisModel;

    const showApis = keywords ? filterApis : collectionModel.apis;
    const folder = {
      name: '默认接口',
      apis: showApis,
    };

    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="file"><Icon type="plus-circle" theme="twoTone" />新增接口</Menu.Item>
        <Menu.Item key="folder"><Icon type="folder" theme="twoTone" />新增分组</Menu.Item>
      </Menu>
    );

    return (
      <div>
        <div className="folder-tree">
          <div className="search-row">
            <Input style={{ marginBottom: 8 }} placeholder="Search" onChange={this.handleFilterDebounced} />
            <Dropdown overlay={menu} placement="bottomRight">
              <Button className="dropdown-btn" type="dashed">
                <Icon className="add-entrance" type="plus-circle" theme="twoTone" />
                <Icon className="dropdown-icon" type="caret-down" />
              </Button>
            </Dropdown>
          </div>
          <Link className="help-tips" to={`/collection/${collectionId}/apis/list`}>全部接口</Link>
          {
            collectionApis.map(folder => (
              <Folder
                key={folder._id}
                folder={folder}
                isCollapsed={folder.isCollapsed}
                handleToggleFolder={this.handleToggleCollection}
                handleEditFolder={this.handleEditCollection}
                handleDeleteFolder={this.handleDeleteCollection}
                handleAddFile={this.handleAddFile}
                handleSetFolder={this.handleSetFolder}
              >
                {
                  (folder.children || []).map(api => (
                    <File key={api._id} file={api} linkUrl={`/collection/${collectionId}/apis/doc/${api.apiId}`} />
                  ))
                }
              </Folder>
            ))
          }
        </div>
        <main className="api-main">
          {this.props.children}
        </main>
        <FolderCreate
          wrappedComponentRef={this.saveFormRef}
          visible={showFolderModal}
          onCancel={this.handleCancel}
          onCreate={this.handleCreateFolder}
        />
      </div>
    );
  }
}

export default connect(({ collectionModel, collectionApisModel }) => {
  return {
    collectionApisModel,
    collectionModel,
  };
})(Api);
