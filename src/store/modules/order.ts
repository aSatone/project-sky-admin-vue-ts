/* eslint-disable vue/camelcase */
// eslint-disable-next-line vue/brace-style
import { Module } from 'vuex';

// 定义 OrderItem 类型，用于表示订单中的每一项
export interface OrderItem {
  dish: {
    id: number; // 菜品ID
    name: string; // 菜品名称
    price: number; // 菜品价格
    image: string; // 菜品图片
    // 可以添加其他属性，如描述等
  };
  quantity: number; // 菜品的数量
}

// 定义 OrderState 类型，用于表示订单状态的结构
export interface OrderState {
  orderList: OrderItem[]; // 订单中的菜品列表
  payStatus: number; // 支付状态，0表示未支付，1表示已支付
  tableId: number; // 桌号
  orderId: number; // 订单ID
}

// 定义 Vuex 模块，使用 Vuex 中的 Module 类型
const orderModule: Module<OrderState, any> = {
  namespaced: true, // 确保该模块启用命名空间，使其在多个模块中独立

  // 模块的状态数据
  state: {
    orderList: [], // 初始的订单菜品列表为空
    payStatus: 1, // 初始支付状态为未支付
    tableId: 1, // 初始桌号为空
    orderId: 1 // 初始订单ID为空
  },

  // 定义 mutations，用于改变 state 的状态
  mutations: {
    // 添加订单项
    ADD_ORDER_ITEM(state, orderItem: OrderItem) {
      // 检查订单中是否已存在相同的菜品
      const existingItem = state.orderList.find(item => item.dish.id === orderItem.dish.id);
      if (existingItem) {
        // 如果已存在，更新数量（防止重复添加）
        existingItem.quantity = orderItem.quantity;
      } else {
        // 如果没有该菜品，则将该订单项添加到 orderList
        state.orderList.push({ ...orderItem });
      }
    },

    // 删除订单项
    REMOVE_ORDER_ITEM(state, orderItem: OrderItem) {
      // 从订单列表中移除指定的菜品项
      state.orderList = state.orderList.filter(item => item.dish.id !== orderItem.dish.id);
    },

    // 设置整个订单列表（用于批量设置）
    SET_ORDER_LIST(state, orderList: OrderItem[]) {
      state.orderList = [...orderList];
    },

    // 更新支付状态
    UPDATE_PAY_STATE(state,paystatus) {
      // 示例：暂时将支付状态设置为已支付（1），具体逻辑待后续补充
      state.payStatus = paystatus;
    },

    // 设置订单ID
    SET_ORDER_ID(state, id: number) {
      state.orderId = id;
    },
    SET_TABLE_ID(state, id: number) {
      state.tableId = id;
    },
  },

  // 定义 actions，用于执行异步操作或提交 mutations
  actions: {
    // 添加一个订单项
    addOrderItem({ commit }, orderItem: OrderItem) {
      commit('ADD_ORDER_ITEM', orderItem); // 提交 ADD_ORDER_ITEM mutation
    },

    // 删除一个订单项
    removeOrderItem({ commit }, orderItem: OrderItem) {
      commit('REMOVE_ORDER_ITEM', orderItem); // 提交 REMOVE_ORDER_ITEM mutation
    },

    // 设置订单列表（批量设置）
    setOrderList({ commit }, orderList: OrderItem[]) {
      commit('SET_ORDER_LIST', orderList); // 提交 SET_ORDER_LIST mutation
    },

    // 设置订单ID（应该使用 SET_ORDER_ID mutation，而不是 SET_ORDER_LIST）
    setOrderId({ commit }, id: number) {
      commit('SET_ORDER_ID', id); // 提交 SET_ORDER_ID mutation
    },
    setTableId({ commit }, id: number) {
      commit('SET_TABLE_ID', id); // 提交 SET_ORDER_ID mutation
    },

    // 更新支付状态
    updatePayState({ commit }, Status) {
      commit('UPDATE_PAY_STATE', Status); // 提交 UPDATE_PAY_STATE mutation
    },

    // 清空订单列表
    clearOrderList({ commit }) {
      commit('SET_ORDER_LIST', []); // 提交 SET_ORDER_LIST mutation，设置为空数组
    }
  },

  // 定义 getters，用于获取 state 的数据
  getters: {
    // 获取订单项列表
    getOrderList: (state) => state.orderList,

    // 获取支付状态
    getPayStatus: (state) => state.payStatus,

    // 获取桌号
    getTableId: (state) => state.tableId,

    // 获取订单ID
    getOrderId: (state) => state.orderId
  }
};

// 导出该模块，供 Vuex 使用
export default orderModule;
