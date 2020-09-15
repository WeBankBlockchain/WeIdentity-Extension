/*global chrome*/

import React from "react";
import {Layout, Tabs, Button} from 'antd';
import AppHeader from "../../../components/Header";
import CredentialList from "../../../components/CredentialList";
import DropDown from "../../../components/DropDown";
import {VerifiedOutlined, SolutionOutlined} from '@ant-design/icons'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import './home.styl'

const {Content} = Layout;
const {TabPane} = Tabs

function Home(props) {

    const getWeIdDetail = () => {
        props.history.push('/weIdDoc')
    }

    const recover = () => {
        props.history.push('/init')
    }

    const turnVerify = () => {
        props.history.push("./verify")
    }

    const turnIssue = () => {
        props.history.push("./issue")
    }

    const copy = () => {
        alert("已经将" + weid + "复制到粘贴板")
    }

    let printweid = ""

    // TODO: check the storage would be deleted if we delete the history in chrome
    const weid = localStorage.getItem("weid")
    const restservice = localStorage.getItem("url")

    if (weid === null || weid.length === 0 || restservice === null || restservice.length === 0) {
        props.history.push('./init')
        return <div></div>
    }
    if (weid.length > 20) {
        printweid = weid.slice(0, 20)
    } else {
        printweid = weid
    }

    const showNotDetails = (res) => {
        alert("所持凭证功能暂未开放")
    }
    const showDetails = (res) => {
        props.history.push({pathname: './credentialDetail', state: {credId: res}})
    }

    const credentials = [
        {id: "1", title: "身份证", click: showNotDetails},
        {id: "2", title: "学生证", click: showNotDetails},
        {id: "3", title: "驾照", click: showNotDetails},
    ]


    const dropdown_data = {
        name: "more",
        funcs: [
            {name: "查看账号", clickfunctions: getWeIdDetail},
            {name: "申请证书", clickfunctions: () => {alert("此功能暂未开放")}},
            {name: "重新设置", clickfunctions: recover}
        ]
    }

    const issueCreds = []
    let issueCredList = JSON.parse(localStorage.getItem("credentialList"))
    if (issueCredList === null) {
        issueCredList = []
    }
    for (let i = 0; i < issueCredList.length; i++) {
        issueCreds.push({id: issueCredList[i], title: issueCredList[i], click: showDetails})
    }


    return (
        <Layout className="layout">
            <AppHeader/>
            <Content className={'weid-content'}>
                <div className={'account-info'}>
                    <div className={'account-detail'}>
                        <div>
                            <CopyToClipboard text={weid}>
                                <Button className={'account-button'} onClick={copy}>
                                    <div style={{marginBottom: '0px'}}><strong>Account</strong></div>
                                    <div style={{marginTop: '0px'}}>{printweid}</div>
                                </Button>
                            </CopyToClipboard>
                        </div>


                    </div>
                    <div className={'dropdown'}>
                        <DropDown data={dropdown_data}></DropDown>
                    </div>
                </div>

                <div className={'buttons'}>
                    <Button type="primary" shape="round" icon={<VerifiedOutlined/>} size={{size: 'large'}}
                            style={{height: '35px'}} onClick={turnVerify}>
                        验证凭证
                    </Button>
                    <Button type="primary" shape="round" icon={<SolutionOutlined/>} size={{size: 'large'}}
                            style={{height: '35px'}} onClick={turnIssue}>
                        发行凭证
                    </Button>
                </div>

                <Tabs defaultActiveKey="1" className={'credential-tabs'} centered>
                    <TabPane tab={<div className={'credential-tab-title'}>持有凭证</div>} key="1"
                             className={'credential-tab-panel'}>
                        <CredentialList data={credentials}/>
                    </TabPane>
                    <TabPane tab={<div className={'credential-tab-title'}>所发行凭证</div>} key="2"
                             className={'credential-tab-panel'}>
                        <CredentialList data={issueCreds}/>
                    </TabPane>
                </Tabs>
            </Content>
        </Layout>
    )
}

export default Home