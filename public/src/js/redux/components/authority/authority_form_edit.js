import initAuthorityrForm from './authority_form';

export default initAuthorityrForm( state => ({
    //赋初始值
    initialValues: state.SystemAuthorityManage.systemAccessManage.active_authority_info
  })
)
