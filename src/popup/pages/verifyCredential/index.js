/*global chrome*/

import React from "react"
import { Layout, Button } from 'antd'
import AppHeader from "../../../components/Header"
import WI from "../../../weidentity/WeIdentity"
import './verifyCredential.styl'
const {Content} = Layout

function VerifyCredential(props) {

    const backup = () => {
        props.history.push('/home')
    }

    const verify = () => {
        let credIdElement = document.getElementById("lite-credential")
        if (credIdElement.value.length<=0){
            try{
                const credObj = JSON.parse(credIdElement.value)
                const wi = new WI()
                const publicKey = localStorage.getItem("privateKey")
                const result = wi.CredentialService.verifyCredential(publicKey, credObj)
                if (result.error.code === 0) {
                    alert("验证成功")
                } else {
                    alert("验证失败："+result.error.description)
                }
            } catch (e) {
                alert(e)
            }
        }
    }

    return (
        <Layout >
            <AppHeader/>
            <Content>
                <div className={"credential-text"}>
                    <p style={{marginLeft: "20px"}}>请输入验证的证书：</p>
                    <textarea style={{marginLeft:"20px", width: "85%", height: "300px"}} id="lite-credential"/>
                </div>
                <div className={"buttons"} style={{paddingTop: "20px"}}>
                    <Button type="primary" onClick={verify}>验证</Button>
                    <Button type="primary" onClick={backup}>返回</Button>
                </div>
            </Content>
        </Layout>
    )

}

export default VerifyCredential