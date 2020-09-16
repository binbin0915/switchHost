import React, { useState, useEffect, useReducer } from 'react';
import * as s from './index.css';
// import fs from 'fs';
// import path from 'path';
const fs = window.require('fs');
const path = window.require('path');
// const fs = require('fs');
// const path = require('path');
import { Form, Input, Switch, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, FileAddOutlined } from '@ant-design/icons';

const SPLIT_CHAR = '\r\n';
const FormItem = Form.Item;

interface detailObj {
    isValid: boolean,
    index: number,
    able: boolean,
    ip: string,
    domain: string,
}

interface T_infoObj {
    textLines?: Array<string>,
    detailObjArr?: Array<detailObj>
}

function Panel() {
    function objReducer(state: T_infoObj, action: T_infoObj) {
        //  以前没有空对象，react还是以为是原始对象
        return Object.assign({}, state, action);
    }
    const [infoObj, setInfo] = useReducer(objReducer, {
        textLines: [],
        detailObjArr: [] as Array<detailObj>,
    } as T_infoObj);
    useEffect(() => {
        const TEXT_PATH = path.resolve('D:\\self\\eletron\\testApp', "content.txt"); // 大文件存储目录

        const oldContent = fs.readFileSync(TEXT_PATH, 'utf-8');
        const regx = /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/g;
        //  提取所有ip地址
        // const res = oldContent.match(regx);
        // console.log(res);

        //  提取所有行
        const xxx = oldContent.split(SPLIT_CHAR);
        //  结果的结构体数组
        const yyy = xxx.map((item, index) => {
            //  匹配所有ip，返回数组
            const targetIps = item.match(regx) || [];
            //  根据目标ip,通常是首个，分裂行内容
            const splitRes = item.split(targetIps[0]);
            const first = splitRes[0].trim();
            const isValid = splitRes.length >= 2 && first.length <= 1;
            if (isValid) {
                return {
                    isValid,
                    index,
                    able: first.length === 0,
                    ip: targetIps[0],
                    domain: splitRes[1].split('#')[0].trim()
                } as detailObj
            } else {
                return {
                    index,
                    isValid
                } as detailObj;
            }
        })
        setInfo({
            textLines: xxx,
            detailObjArr: yyy.filter(item => item.isValid) as Array<detailObj>
        })
        console.log(yyy);
    }, []);
    function showInfo() {
        console.log(infoObj);
    }
    function changeSwitch(item, value) {
        const { index } = item;
        let finalStr = '';
        let cpyLines = infoObj.textLines.slice(0);
        const allLength = infoObj.textLines.length;
        finalStr = infoObj.textLines.reduce((old, newItem, sindex) => {
            let newLine = newItem;
            if (sindex === index) {
                const originContent = value ? newItem.slice(1) : ('#' + newItem);
                newLine = originContent + SPLIT_CHAR;
                cpyLines[index] = originContent;
            } else if (sindex !== (allLength - 1)) {
                newLine = newLine + SPLIT_CHAR;
            }
            return old + newLine;
        }, '')
        setInfo({
            textLines: cpyLines
        })
        fs.writeFileSync( path.resolve('D:\\self\\eletron\\testApp', "content.txt"), finalStr);
    };
    function editConfig(item) {
        const layout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 16 },
          };
        let newObj = {
            ip: item.ip,
            domain: item.domain
        };
        function changInfo(key, e) {
            newObj[key] = e.target.value;
        }
        Modal.confirm({
            title: '修改配置',
            content: (
              <div>
                  <Form {...layout}>
                    <FormItem label='域名' >
                        <Input defaultValue={item.domain} onChange={changInfo.bind(null, 'domain')}/>
                    </FormItem>
                    <FormItem label='ip' >
                        <Input defaultValue={item.ip} onChange={changInfo.bind(null, 'ip')}/>
                    </FormItem>
                  </Form>
              </div>
            ),
            onCancel() {
            },
            onOk() {
                console.log(newObj);
            },
        })
    }
    return <div className={s.name}>
        <div onClick={showInfo}>点我测试</div>
        <FileAddOutlined />
        {infoObj.detailObjArr.map((item, index) => {
            const { ip, domain, index: lineNum, able } = item;
            return (
                <div key={index} className={s.formWrapper}>
                    <FormItem label='开启映射' >
                            <Switch onChange={changeSwitch.bind(null, item)} defaultChecked={able}/>
                            <span className={s.domainAndIp}>{domain}: {ip}</span>
                    </FormItem>
                    <div className={s.iconGroup}>
                        <EditOutlined onClick={editConfig.bind(null, item)}/>
                        <DeleteOutlined />
                    </div>
                </div>
            );
        })}
    </div>
}

export default Panel;