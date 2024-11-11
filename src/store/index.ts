import Vue from 'vue';
import Vuex from 'vuex';
import { IAppState } from './modules/app';
import { IUserState } from './modules/user';
import order, { OrderState } from './modules/order';

Vue.use(Vuex);

export interface IRootState {
  app: IAppState;
  user: IUserState;
  order: OrderState;  // 添加 order 模块的类型定义
}

export default new Vuex.Store<IRootState>({
  modules: {
    order: order
  }
});
