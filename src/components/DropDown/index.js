import React, {Component} from "react";
import { Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';


export default class DropDown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            funcs: props.data.funcs,
            name: props.data.name
        }
    }

    render() {
        const { funcs } = this.state
        const funcPile = [];
        for (let i=0; i<funcs.length; i++) {
            funcPile.push(
                <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" onClick={funcs[i].clickfunctions}>
                        {funcs[i].name}
                    </a>
                </Menu.Item>
            )
        }
        const menu = <Menu> {funcPile} </Menu>
        return (
            <Dropdown overlay={menu}>
                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                    {this.state.name} <DownOutlined />
                </a>
            </Dropdown>
            )
    }
}