/*global chrome*/

import React from "react"
import {Layout, Button} from 'antd'
import AppHeader from "../../../components/Header"
import JsonText from "../../../components/JsonText";
const {Content} = Layout


function CredentialDetail(props) {

    const backup = () => {
        props.history.push('/home')
    }

    return (
        <Layout >
            <AppHeader/>
            <Content >
                <JsonText data={{data:props.location.state.credId, type:1}}/>
                <div style={{textAlign: "center", paddingTop: "10px", background: "white"}}>
                    <Button type="primary" onClick={backup}>返回</Button>
                </div>
            </Content>
        </Layout>
    )

}


export default CredentialDetail