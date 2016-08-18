import React,{Component} from 'react';
import {findDOMNode} from 'react-dom';

import InvoiceApplyPannel from './invoice_create_modal';
import InvoiceEditPannel from './invoice_edit_modal';

export default class InvoiceDetail extends Component{
	render(){
		var {editable} = this.props;
		return (
						editable ?
						<InvoiceEditPannel {...this.props} />
						:
						<InvoiceApplyPannel {...this.props}/>
			)
	}
}