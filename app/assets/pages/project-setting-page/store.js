import ajax from 'xhr-plus';
import { message } from 'antd';

export default {
  namespace: 'projectSettingModel',
  state: {
    apis: [],
    project: {},
  },
  effects: {
    *project({ projectId }, { call, put }) {
      try {
        const { status, data } = yield call(ajax, {
          url: `/api/projects/${projectId}`,
          method: 'get',
          type: 'json',
          data: {},
        });

        if (status === 'success') {
          yield put({
            type: 'setData',
            data: {
              project: data,
            },
          });
        }
      } catch (e) {
        message.error('系统异常');
      }
    },

    *projectUpdate({ id, project }, { call }) {
      try {
        const { status } = yield call(ajax, {
          url: `/api/projects/${id}`,
          method: 'put',
          type: 'json',
          data: {
            project: JSON.stringify(project),
          },
        });

        if (status === 'success') {
          message.success('更新应用成功');
        }
      } catch (e) {
        message.error('系统异常');
      }
    },

    *getApis({ projectId }, { call, put }) {
      try {
        const { status, data } = yield call(ajax, {
          url: '/api/apis',
          method: 'get',
          type: 'json',
          data: {
            projectId,
          },
        });
        if (status === 'success') {
          yield put({
            type: 'setData',
            data: {
              apis: data.apis,
            },
          });
        }
      } catch (e) {
        message.error('系统异常');
      }
    },

    // 物理删除API，要删除关联该API的CollectionAPI
    *deleteAPI({ apiId, projectId }, { call, put }) { // 如果删除的是当前展示的
      try {
        const { status } = yield call(ajax, {
          url: `/api/apis/${apiId}`,
          method: 'DELETE',
          type: 'json',
        });
        if (status === 'success') {
          message.success('删除成功');
          yield put({ type: 'getApis', projectId });
        }
      } catch (e) {
        message.error('删除失败');
      }
    },
  },

  reducers: {
    setData(state, { data }) {
      return { ...state, ...data };
    },
  },
};
