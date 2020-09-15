/*global chrome*/

import React from "react"
import { Layout } from 'antd'
import AppHeader from "../../../components/Header"
import Step from "../../../components/SetupSteps"
const {Content} = Layout

function Init(props) {

    const complete = () => {
        props.history.push('/home')
    }

    return (
        <Layout >
            <AppHeader/>
            <Content>
                <Step data={complete}></Step>
            </Content>
        </Layout>
    )

}

export default Init