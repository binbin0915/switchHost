import React, { useState, useEffect, useReducer } from 'react';
import * as s from './index.css';
// import fs from 'fs';
// import path from 'path';
const fs = window.require('fs');
const path = window.require('path');
// const fs = require('fs');
// const path = require('path');
import { Form, Input, Switch } from 'antd';

const SPLIT_CHAR = '\r\n';

console.log(fs);
console.log(path);
const FormItem = Form.Item;

function Panel() {
    function objReducer(state, action) {
        //  以前没有空对象，react还是以为是原始对象
        return Object.assign({}, state, action);
    }
    const [infoObj, setInfo] = useReducer(objReducer, {
        textLines: [],
        detailObjArr: [],
    });
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
                }
            } else {
                return {
                    index,
                    isValid
                }
            }
        })
        setInfo({
            textLines: xxx,
            detailObjArr: yyy.filter(item => item.isValid)
        })
        console.log(yyy);
    }, []);
    function showInfo() {
        console.log(infoObj);
    }
    function changeSwitch(item, value) {
        const { index } = item;
        let finalStr = '';
        const cpyLines = infoObj.textLines.slice(0);
        if (!value) {
            finalStr = infoObj.textLines.reduce((old, newItem, sindex) => {
                const newLine = (sindex === index ? '#' : '') + newItem + SPLIT_CHAR;
                cpyLines[sindex] = newLine;
                setInfo({
                    textLines: cpyLines
                });
                return old + newLine;
            }, '')
        } else {
            finalStr = infoObj.textLines.reduce((old, newItem, sindex) => {
                const newLine = newItem.slice(sindex === index ? 1 : 0) + SPLIT_CHAR;
                cpyLines[sindex] = newLine;
                setInfo({
                    textLines: cpyLines
                });
                return old + (old ? '' : SPLIT_CHAR) + newItem.slice(sindex === index ? 1 : 0);
            }, '')
        }
        fs.writeFileSync( path.resolve('D:\\self\\eletron\\testApp', "content.txt"), finalStr);
        console.log(item, value);
    }
    return <div className={s.name}>
        <div onClick={showInfo}>点我测试</div>
        {infoObj.detailObjArr.map((item, index) => {
            const { ip, domain, index: lineNum, able } = item;
            return <FormItem label='开启映射' key={index}>
                <Switch onChange={changeSwitch.bind(null, item)} defaultChecked={able}/>
                {domain}: {ip}
            </FormItem>
        })}
    </div>
}

export default Panel;