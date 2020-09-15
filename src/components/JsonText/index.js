import React from 'react'
import ReactJson from "react-json-view";
import WI from "../../weidentity/WeIdentity";
import {fetch_type} from '../../common/config'

export default class WeIdDocument extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            jsonData: null,
            data: props.data.data,
            type: props.data.type
        }
        this.url = localStorage.getItem("url")
    }

    getData() {
        if(this.state.type === 0) {
            let wi = new WI(this.url, fetch_type)
            wi.WeIdService.getWeIdDocument(this.state.data).then((res) => {
                if (res.data.respBody === null) {
                    return
                }
                if(this.state.jsonData === null) {
                    this.setState({
                        jsonData: res.data.respBody
                    })
                }
            }).catch(error => {
                alert(error)
            })
        }
        if(this.state.type === 1) {
            try{
                let result = JSON.parse(localStorage.getItem(this.state.data))
                if(this.state.jsonData === null) {
                    this.setState({
                        jsonData: result
                    })
                }
            } catch (e) {
                alert(e)
            }
        }
    }


    render() {
        return (
            <div onLoad={this.getData()} style={{ width: '100%' , maxHeight: '480px' , overflow: 'auto'}}>
                <ReactJson  src={this.state.jsonData} collapseStringsAfterLength={10} collapsed={true} onEdit={false}/>
            </div>
        )
    }

}