import React from 'react';
//收货人信息
export default function RecipientInfo(props){
  var data = props.data;
  return (
    <td className="text-left">
      <div className="address-detail-td">
        <table className="no-padding">
          <tbody>
            <tr><td className="nowrap">姓名：</td><td>{data.recipient_name}</td></tr>
            <tr><td className="nowrap">电话：</td><td>{data.recipient_mobile}</td></tr>
            <tr><td className="nowrap v-top">地址：</td><td>{data.recipient_address}</td></tr>
            <tr><td className="nowrap">建筑：</td><td>{data.recipient_landmark}</td></tr>
          </tbody>
        </table>
      </div>
    </td>
  )
}