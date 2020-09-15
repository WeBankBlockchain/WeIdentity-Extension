import React, {Component} from "react";
import {Button, Card} from "antd";
import { ArrowRightOutlined } from '@ant-design/icons';
import './credentialList.styl'

export default class CredentialList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            credentials: props.data
        }
    }

    render () {
        const { credentials } = this.state
        const CardPile = [];
        if (credentials.length === 0) {
            CardPile.push(<p className={'alert-word'} > 没有凭证 </p>)
        } else {
            for (let i = 0; i < credentials.length; i += 1) {
                CardPile.push(
                    <Card title={credentials[i].title} bordered={false} className={'credential'}
                          extra={<Button shape="circle" id={credentials[i].id} onClick={() => {credentials[i].click(credentials[i].id)}} icon={<ArrowRightOutlined/>}/>}>
                    </Card>
                );
            }
        }
        return (
            <div className={'credential-list'}>
                {CardPile}
            </div>
        )
    }
}