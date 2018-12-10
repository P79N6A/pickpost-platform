// import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import dva from 'dva';
import { Router, Route, browserHistory } from 'dva/router';
import './app.less';

// 0. Pages
import APIEditPage from './pages/api-edit-page/index';
import APIDocPage from './pages/api-doc-page/index';
import APITestPage from './pages/api-test-page/index';
import APIMockPage from './pages/api-mock-page/index';
import APISettingPage from './pages/api-setting-page/index';

import CollectionEditPage from './pages/collection-edit-page/index';
import CollectionsPage from './pages/collections-page/index';
import CollectionPage from './pages/collection-page/index';
import CollectionApisPage from './pages/collection-apis-page/index';
import CollectionMemebersPage from './pages/collection-members-page/index';
import CollectionApiListPage from './pages/collection-api-list-page/index';
import CollectionSettingPage from './pages/collection-setting-page/index';

import ProjectEditPage from './pages/project-edit-page/index';
import ProjectPage from './pages/project-page/index';
import ProjectsPage from './pages/projects-page/index';

// 0. Models
import APIEditModel from './pages/api-edit-page/store';
import APIDocModel from './pages/api-doc-page/store';
import APITestModel from './pages/api-test-page/store';
import APIMockModel from './pages/api-mock-page/store';
import APISettingModel from './pages/api-setting-page/store';

import CollectionEditModel from './pages/collection-edit-page/store';
import CollectionModel from './pages/collection-page/store';
import CollectionsModel from './pages/collections-page/store';

import CollectionApisModel from './pages/collection-apis-page/store';
import CollectionMemebersModel from './pages/collection-members-page/store';
import CollectionApiListModel from './pages/collection-api-list-page/store';
import CollectionSettingModel from './pages/collection-setting-page/store';


import ProjectEditModel from './pages/project-edit-page/store';
import ProjectModel from './pages/project-page/store';
import ProjectsModel from './pages/projects-page/store';

// 1. Initialize
const app = dva({
  history: browserHistory,
});

// 2. Plugins
// app.use({});

// 3. Model
app.model(APIEditModel);
app.model(APIDocModel);
app.model(APITestModel);
app.model(APIMockModel);
app.model(APISettingModel);

app.model(CollectionEditModel);
app.model(CollectionModel);
app.model(CollectionsModel);

app.model(CollectionApisModel);
app.model(CollectionMemebersModel);
app.model(CollectionApiListModel);
app.model(CollectionSettingModel);

app.model(ProjectEditModel);
app.model(ProjectModel);
app.model(ProjectsModel);

export default class Container extends React.Component {
  componentDidMount() {
    // 4. Router
    app.router(({ history }) => {
      return (
        <Router history={history}>
          <Route path="/workspace" component={CollectionsPage} context={context} />
          <Route path="/collections" component={CollectionsPage} context={context} />
          <Route path="/projects" component={ProjectsPage} context={context} />
          <Route path="/collection/:collectionId/newapi" component={APIEditPage} context={context} />
          <Route path="/collection/:collectionId/editapi/:apiId" component={APIEditPage} context={context} />
          <Route path="/collections/new" component={CollectionEditPage} context={context} />
          <Route path="/projects/new" component={ProjectEditPage} context={context} />
          <Route path="/project/:projectId" component={ProjectPage} context={context} />
          <Route path="/collection/:collectionId" component={CollectionPage} context={context}>
            <Route path="apis" component={CollectionApisPage} context={context}>
              <Route path="list" component={CollectionApiListPage} context={context} />
              <Route path="doc/:apiId" component={APIDocPage} context={context} />
              <Route path="test/:apiId" component={APITestPage} context={context} />
              <Route path="mock/:apiId" component={APIMockPage} context={context} />
              <Route path="setting/:apiId" component={APISettingPage} context={context} />
            </Route>
            <Route path="members" component={CollectionMemebersPage} context={context} />
            <Route path="setting" component={CollectionSettingPage} context={context} />
          </Route>
        </Router>
      );
    });

    // 5. Start
    app.start(this.container);
  }

  render() {
    return (<div style={{ height: '100%' }} ref={ dom => { this.container = dom; }} />);
  }
}

ReactDOM.render(<Container />, document.getElementById('root'));
