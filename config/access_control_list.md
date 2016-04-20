> tips：其中带有“+”号字样的表示相对上一个版本新增的

###1.1 订单管理
* 页面访问：OrderManageAccess
* 编辑：OrderManageEdit
* 取消：OrderManageCancel
* 异常：OrderManageException
* 查看：OrderManageView
* 修改配送：OrderManageAlterDelivery
* 修改配送站：OrderManageAlterStation
* 按地区筛选：OrderManageAddressFilter
* +添加订单: OrderManageAddOrder

###2.1 订单转送货单
* 页面访问：DeliveryChangeAccess
* 按配送中心筛选：DeliveryManageChangeStationFilter
* 按地区筛选：DeliveryManageChangeAddressFilter
* 订单转换: DeliveryManageChangeChange

###2.2 送货单管理
* 页面访问：DeliveryManageAccess
* 按地区筛选：DeliveryManageDeliveryAddressFilter
* 编辑配送员：DeliveryManageDeliveryAllocateDeliveryman
* 批量编辑配送员：DeliveryManageDeliveryBatchAllocateDeliveryman
* 打印：DeliveryManageDeliveryPrint
* 批量打印：DeliveryManageDeliveryBatchPrint
* 扫描：DeliveryManageDeliveryScan

###2.3 配送单管理
* 页面访问：DistributeManageAccess
* 按配送中心筛选：DeliveryManageDistributeStationFilter
* 按地区筛选：DeliveryManageDistributeAddressFilter
* 签收：DeliveryManageDistributeSigninOrder
* 未签收：DeliveryManageDistributeUnSigninOrder
* 扫描: DeliveryManageDistributeScan
 
###2.4 打印审核
* 页面访问：PrintReviewAccess

###3.1 配送站管理
* +页面访问：StationManageAccess
* +添加配送站：StationManageAdd
* +编辑配送区域：StationManageEditScope
* +查看：StationManageViewRemark
* +编辑：StationManageEdit
* +删除：StationManageDelete

###3.2 配送区域管理
* +页面访问：StationScopeManageAccess
* +添加配送区域：StationScopeManageAdd

###4.1 用户管理
* +页面访问：UserManageAccess
* +按用户名/姓名筛选：UserManageUnameOrNameFilter
* +添加用户： UserManageAddUser
* +编辑：UserManageUserEdit
* +修改用户状态：UserManageUserStatusModify
* +删除用户：UserManageUserRemove

###4.2 部门角色管理
* +页面访问：DeptRoleManageAccess
* +添加部门：DeptRoleManageAddDept
* +添加角色：DeptRoleManageAddRole
* +角色编辑：DeptRoleManageRoleEdit
* +角色删除：DeptRoleManageRoleRemove

### 5.1 渠道管理
* +页面访问: SrcChannelManageAccess


###8.角色权限管理
* +页面访问：RoleAuthorityManageAccess
* +模块筛选：RoleAuthorityManageModuleFilter
* +角色权限编辑：RoleAuthorityManageAuthEdit


###9.系统权限管理
* +页面访问：SystemAuthorityManageAccess
* +模块筛选：SystemAuthorityManageModuleFilter
* +添加对话框：SystemAuthorityManageAddDialog
* +添加模块：SystemAuthorityManageAddModule
* +添加权限：SystemAuthorityManageAddAuth
* +编辑权限：SystemAuthorityManageAuthEdit
* +删除权限：SystemAuthorityManageAuthRemove
