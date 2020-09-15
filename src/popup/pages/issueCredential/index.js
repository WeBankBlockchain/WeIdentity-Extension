/*global chrome*/

import React from "react"
import {Layout, Button, Input, DatePicker} from 'antd'
import AppHeader from "../../../components/Header"
import WI from "../../../weidentity/WeIdentity"
const {Content} = Layout

function IssueCredential(props) {

    const backup = () => {
        props.history.push('/home')
    }

    const issue = () => {
        let cptIdElement = document.getElementById("cptId")
        if (cptIdElement.value.length<=0){
            alert("请输入cptId")
            return
        }
        let expirationElement = document.getElementById("expiration")
        if (expirationElement.value.length<=0){
            alert("请输入过期时间")
            return
        }
        let claimElement = document.getElementById("lite-credential")
        if (claimElement.value.length <=0 ){
            alert("请输入claim")
            return
        }
        try {
            const claim = JSON.parse(claimElement.value)
            const cptId = parseInt(cptIdElement.value)
            const expiration = new Date(expirationElement.value).getTime()
            const issueDate = new Date().getTime()
            let wi = new WI('', '')
            const weid = localStorage.getItem('weid')
            const privateKey = localStorage.getItem('privateKey')
            const cred = wi.CredentialService.createCredential(cptId, issueDate, expiration, weid, privateKey, 'lite1', claim)
            if (cred.error.code === 0) {
                localStorage.setItem(cred.respbody.id, JSON.stringify(cred.respbody))
                const credentialListJson = localStorage.getItem("credentialList")
                let credentialList
                if (credentialListJson === null || credentialListJson.length === 0) {
                    credentialList=[]
                } else {
                    credentialList = JSON.parse(credentialListJson)
                }
                credentialList.push(cred.respbody.id)
                localStorage.setItem("credentialList", JSON.stringify(credentialList))
                alert("创建成功")
            } else {
                alert("创建数字证书失败 " + cred.error.description)
            }
        } catch (e) {
            alert("创建数字证书失败 "+ e)
        }
    }

    return (
        <Layout >
            <AppHeader/>
            <Content>
                <div style={{background: "white"}}>
                    <p style={{marginLeft: "20px", marginTop: "10px", marginBottom: "5px"}}>1.请输入cptId</p>
                    <Input id="cptId" style={{marginLeft: "25px", width: "60%"}}/>
                    <p style={{marginLeft: "20px", marginTop: "10px", marginBottom: "5px"}}>2.请选择过期时间</p>
                    <DatePicker id="expiration" style={{marginLeft: "25px", width: "60%"}}></DatePicker>
                    <p style={{marginLeft: "20px", marginTop: "10px", marginBottom: "5px"}}>3.请输入Claim字段：</p>
                    <textarea style={{marginLeft:"20px", width: "85%", height: "200px", resize: "none"}} id="lite-credential"/>
                </div>
                <div className={"buttons"} style={{paddingTop: "20px"}}>
                    <Button type="primary" onClick={issue}>发行</Button>
                    <Button type="primary" onClick={backup}>返回</Button>
                </div>
            </Content>
        </Layout>
    )

}

export default IssueCredential