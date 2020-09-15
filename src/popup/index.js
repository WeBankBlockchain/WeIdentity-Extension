import React, { Fragment } from 'react'
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom'
import Home from './pages/home'
import Init from "./pages/init"
import VerifyCredential from "./pages/verifyCredential";
import IssueCredential from "./pages/issueCredential"
import weIdDoc from "./pages/weIdDocument"
import CredentialDetail from "./pages/credentialDetail"
import './popup.styl'
// import '@/content'

function Popup() {
    return (
        <Fragment>
            <HashRouter>
                <Switch>
                    <Route path="/home" component={Home} />
                    <Route path="/init" component={Init} />
                    <Route path="/verify" component={VerifyCredential}/>
                    <Route path="/issue" component={IssueCredential}/>
                    <Route path="/weIdDoc" component={weIdDoc}/>
                    <Route path="/credentialDetail" component={CredentialDetail}/>
                    <Redirect to={'/home'} />
                </Switch>
            </HashRouter>
        </Fragment>
    )
}

export default Popup
