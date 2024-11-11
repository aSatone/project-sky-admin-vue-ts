// src/store/modules/order.ts
import { Module } from 'vuex';

export interface OrderItem {
  dish: {
    id: number;
    name: string;
    price: number;
    image: string; // 添加价格字段
    // 添加其他字段，例如描述等
  };
  quantity: number;
}

export interface OrderState {
  orderList: OrderItem[];
}

const orderModule: Module<OrderState, any> = {
  namespaced: true,  // 确保设置为 true
  state: {
    orderList: []
  },
  mutations: {
    ADD_ORDER_ITEM(state, orderItem: OrderItem) {
      const existingItem = state.orderList.find(item => item.dish.id === orderItem.dish.id);
      if (existingItem) {
        // 修改为只增加数量，而不是相加数量，以避免重复更新时的问题
        existingItem.quantity = orderItem.quantity;
      } else {
        state.orderList.push({ ...orderItem });
      }
    },
    REMOVE_ORDER_ITEM(state, orderItem: OrderItem) {
      state.orderList = state.orderList.filter(item => item.dish.id !== orderItem.dish.id);
    },
    SET_ORDER_LIST(state, orderList: OrderItem[]) {
      state.orderList = [...orderList];
    }
  },
  actions: {
    addOrderItem({ commit }, orderItem: OrderItem) {
      commit('ADD_ORDER_ITEM', orderItem);
    },
    removeOrderItem({ commit }, orderItem: OrderItem) {
      commit('REMOVE_ORDER_ITEM', orderItem);
    },
    setOrderList({ commit }, orderList: OrderItem[]) {
      commit('SET_ORDER_LIST', orderList);
    }
  },
  getters: {
    getOrderList: (state) => state.orderList
  }
};

export default orderModule;
