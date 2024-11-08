// store/modules/order.ts

import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

@Module({ namespaced: true })
class Order extends VuexModule {
  public cart: Array<{ tableNumber: number; dish: any; quantity: number }> = [];

  // 添加菜品到订单
  @Mutation
  public ADD_TO_CART(payload: { tableNumber: number; dish: any; quantity: number }): void {
    const existingItem = this.cart.find(item => item.dish.id === payload.dish.id && item.tableNumber === payload.tableNumber);
    if (existingItem) {
      existingItem.quantity += payload.quantity;
    } else {
      this.cart.push(payload);
    }
  }

  // 更新菜品数量
  @Mutation
  public UPDATE_QUANTITY(payload: { dishId: number; tableNumber: number; quantity: number }): void {
    const item = this.cart.find(cartItem => cartItem.dish.id === payload.dishId && cartItem.tableNumber === payload.tableNumber);
    if (item) {
      item.quantity = payload.quantity;
    }
  }

  // 清空购物车
  @Mutation
  public CLEAR_CART(): void {
    this.cart = [];
  }
}

export default Order;
