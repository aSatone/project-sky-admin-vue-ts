import request from '@/utils/request'

// 查询列表页接口
export const getOrderDetailPage = (params: any) => {
  return request({
    url: '/order/conditionSearch',
    method: 'get',
    params
  })
}

// 查看接口
export const queryOrderDetailById = (params: any) => {
  return request({
    url: `/order/details/${params.orderId}`,
    method: 'get'
  })
}

// 派送接口
export const deliveryOrder = (params: any) => {
  return request({
    url: `/order/delivery/${params.id}`,
    method: 'put' /*  */
  })
}
//完成接口
export const completeOrder = (params: any) => {
  return request({
    url: `/order/complete/${params.id}`,
    method: 'put' /*  */
  })
}

//订单取消
export const orderCancel = (params: any) => {
  return request({
    url: '/order/cancel',
    method: 'put' /*  */,
    data: { ...params }
  })
}

//接单
export const orderAccept = (params: any) => {
  return request({
    url: '/order/confirm',
    method: 'put' /*  */,
    data: { ...params }
  })
}

//拒单
export const orderReject = (params: any) => {
  return request({
    url: '/order/rejection',
    method: 'put' /*  */,
    data: { ...params }
  })
}

//获取待处理，待派送，派送中数量
export const getOrderListBy = (params: any) => {
  return request({
    url: '/order/statistics',
    method: 'get' /*  */
  })
}
//订单接口
export const putOrderList = (params: any) =>
  request({
    'url': '/order/orderList',
    'method': 'put',
    'data': params
  })
//获取当前订单
export const getOrders = (params: any) =>
  request({
    'url': '/order/getList',
    'method': 'get',
  })
export const deleteKitchenItem = (id: number) =>
  request({
    url: `/order/deleteKitchenList/${id}`, // 使用路径参数传递 id
    method: 'delete',
  });

export const updateOrderStatus = (params: any) => {
  return request({
    url: `/order/delivery/${params.id}`,
    method: 'put' /*  */
  })
}
export const getOrder = (tableId: any) => {
  return request({
    url: `/order/order/${tableId}`, // 后端的接口路径
    method: 'get',
  })
}
export const updatePayStatus = (orderId: any) => {
  return request({
    url: `/order/payStatus/${orderId}`,
    method: 'post' /*  */
  })
}
export const getListByOrderId = (orderId: any) =>
  request({
    'url': `/order/getList/${orderId}`, // 使用订单号来获取具体订单数据
    'method': 'get'
  });

// export function updateOrderStatus(orderId: number, data: { status: string }) {
//   return request({
//       url: `/orders/${orderId}/status`,
//       method: 'PUT',
//       data,
//   })
// }
