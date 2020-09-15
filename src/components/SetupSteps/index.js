import React from "react"
import { Steps, Button, Form, Input } from 'antd';
import {fetch_type} from '../../common/config'
import WI from "../../weidentity/WeIdentity"
import './steps.styl'
const { Step } = Steps;


export default class SetupSteps extends React.Component {
    constructor(props) {
        super(props);
        this.returnPage = props.data
        this.state = {
            current: 0,
        }
        this.mnemonic =''
        this.publicKey = ''
        this.privateKey = ''
        this.weid = ''
        this.steps = [
            {
                title: '配置网络',
                content:
                    <Form
                        name="basic"
                        initialValues={{ remember: true }}>
                            <Form.Item
                                label="RestService网络配置"
                                name="restService"
                                rules={[{ required: true, message: '请输入restService配置信息!' }]}
                                style={{marginLeft: "15%", marginRight: "15%"}}
                            >
                                < Input id="restService" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" onClick={() => this.toKey()}>
                                    下一步
                                </Button>
                            </Form.Item>

                    </Form>
            },
            {
                title: '生成公私钥',
                content: <Form
                    name="basic"
                    initialValues={{ remember: true }}>
                    <Form.Item
                        label="请输入助记词"
                        rules={[{ required: true, message: '请输入助记词!' }]}
                        style={{marginLeft: "5%", marginRight: "5%", marginBottom: "0px"}}>
                        < textarea id="mnemonic" style={{width: "100%", height: "100px"}}/>
                    </Form.Item>
                    < Button style={{marginTop: "5px", marginBottom: "10px"}} onClick={() => this.createMnemonic()}> 创建助记词 </Button>

                    <Form.Item>
                        <Button type="primary"  onClick={() => this.prev()}>
                            上一步
                        </Button>
                        <Button type="primary" htmlType="submit" onClick={() => this.toWeId()}>
                            下一步
                        </Button>
                    </Form.Item>

                </Form>,
            },
            {
                title: '注册weid',
                content:
                <div style={{marginTop: "20px"}}>
                    <Button type="primary"  onClick={() => this.prev()}>
                        上一步
                    </Button>
                    <Button type="primary" htmlType="submit" onClick={() => this.next()}>
                        完成
                    </Button>
                </div>,
            },
        ];
        this.wi = new WI('', 'normal')
    }

    async toKey() {
        if(this.state.current === 0){
            let restService = document.getElementById('restService')
            if (restService.value.length <= 0) {
                return
            }
            const url = restService.value
            localStorage.setItem("url", url)
            this.wi = new WI(url, "normal")
        }
        const current = this.state.current + 1;
        this.setState({ current });
    }

    async toWeId() {
        if (this.state.current === 1) {
            let mnemonic = document.getElementById('mnemonic')
            if (mnemonic.value.length <= 0) {
                return
            }
            const keyPairs = this.wi.Utils.createKeyPairWithM(mnemonic.value)
            if (keyPairs === null){
                alert("创建公私钥不符合标准，请重新生成助记词")
                return
            } else {
                this.mnemonic = mnemonic.value
                this.publicKey = keyPairs.publicKey
                this.privateKey = keyPairs.privateKey
            }
        }
        const current = this.state.current + 1;
        this.setState({current});
    }

    prev() {
        const current = this.state.current - 1;
        this.setState({ current });
    }

    async next() {
        if(this.wi.api.url.length === 0) {
            alert("未设置url")
            return
        }
        this.wi.WeIdService.createWeId(this.publicKey).then((res) => {
            if(res.data.errorCode === 0){
                localStorage.setItem("publicKey", this.publicKey)
                localStorage.setItem("privateKey", this.privateKey)
                localStorage.setItem("weid", res.data.respBody)
                this.returnPage()
            } else {
                alert('出现错误:'+res.data.errorMessage)
            }
        }).catch(error => {
            alert(error)
        })
    }

    createMnemonic() {
        let mnemonicDom = document.getElementById('mnemonic')
        let wi = new WI('', '')
        const keyPair = wi.Utils.createKeyPair()
        mnemonicDom.value = keyPair.mnemonic
    }

    render() {
        const { current } = this.state;
        return (
            <div className={'setup-content'}>
                <Steps current={current} progressDot size="small" style={{paddingTop: "20px"}} >
                    {this.steps.map(item => (
                        <Step  key={item.title} title={item.title} />
                    ))}
                </Steps>
                {this.steps[current].content}
            </div>
        );
    }
}