import {Layout} from "antd";
import React from "react";
import "./header.styl"
const { Header } = Layout;

function AppHeader(props) {

    return (
        <div className={'weid--header'}>
            <img className={'weid-logo'} src={require('../../common/images/logo.png')} />
        </div>
    )
}

export default AppHeader