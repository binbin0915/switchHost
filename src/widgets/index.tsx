import React, { useState, useEffect, useReducer } from 'react';
import * as s from './index.css';
const fs = window.require('fs');
const path = window.require('path');
import { Form, Input, Switch, Modal, message, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadFile, UploadChangeParam } from 'antd/lib/upload/interface';
import { EditOutlined, DeleteOutlined, FileAddOutlined } from '@ant-design/icons';

const SPLIT_CHAR = '\r\n';
const FormItem = Form.Item;
const EDIT_CONFIG = 'edit';
const ADD_CONFIG = 'add';

interface detailObj {
    isValid: boolean,
    index: number,
    objIndex: number,
    able: boolean,
    ip: string,
    domain: string,
}

interface T_infoObj {
    textLines?: Array<string>,
    detailObjArr?: Array<detailObj>
}

interface modalStatus {
    showModal?: boolean,
    modalType?: 'edit' | 'add',
    curIndex?: number,
}

interface myUpFile extends File {
    path?: string;
}

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
};

const emptyIpDomainObj = {
    ip: '',
    domain: ''
}

const regx = /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/g;
const singleReg = /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/g;
const CONFIG_PATH = 'configPath';

function Panel() {
    //  读取配置文件路径
    //  const configPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
    const configPath = path.resolve('D:\\self\\eletron\\testApp', "content.txt");

    function objReducer(state: T_infoObj, action: T_infoObj) {
        //  以前没有空对象，react还是以为是原始对象
        return Object.assign({}, state, action);
    }
    const [infoObj, setInfo] = useReducer(objReducer, {
        textLines: [],
        detailObjArr: [] as Array<detailObj>,
    } as T_infoObj);

    function setMSReducer(state: modalStatus, action: modalStatus) {
        return Object.assign({}, state, action);
    }
    const [modStatus, setMS] = useReducer(setMSReducer, {
        showModal: false,
        modalType: EDIT_CONFIG,
        curIndex: 0,
    } as modalStatus);
    //  path.resolve('D:\\self\\eletron\\testApp', "content.txt");
    useEffect(() => {
        const TEXT_PATH = configPath; // 大文件存储目录
        const oldContent = fs.readFileSync(TEXT_PATH, 'utf-8');
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
                    objIndex: 0,
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
            detailObjArr: yyy.filter(item => item.isValid).map((item, index) => Object.assign(item, { objIndex: index })) as Array<detailObj>
        })
    }, []);
    function showInfo() {
        console.log(infoObj);
    }
    function changeSwitch(item: detailObj, value) {
        const { index, objIndex } = item;
        let finalStr = '';
        let cpyLines = infoObj.textLines.slice(0);
        const allLength = infoObj.textLines.length;
        //  更新原始string
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
        }, '');
        //  更新objArr
        const cpObjArr = infoObj.detailObjArr.slice();
        cpObjArr[objIndex].able = value;
        setInfo({
            textLines: cpyLines,
            detailObjArr: cpObjArr,
        })
        writeFile(finalStr);
    };
    function writeFile(content) {
        fs.writeFileSync(configPath, content);
    }
    function validateNewObj(obj) {
        const { ip, domain } = obj;
        return domain && ip.match(singleReg);
    }
    async function handleChange(info: UploadChangeParam<UploadFile<any>>) {
        const { file: { originFileObj } } = info;
        const originFile = originFileObj as myUpFile;
        localStorage.setItem(CONFIG_PATH, originFile.path)
    }
    function deleteConfig(index) {
        Modal.confirm({
            title: '删除配置',
            content: (
              <div>确认删除本条配置?</div>
            ),
            onCancel() {},
            onOk() {
                const copyLines = infoObj.textLines.slice();
                const copyObjArray = infoObj.detailObjArr.slice();
                copyLines.splice(infoObj.detailObjArr[index].index, 1);
                copyObjArray.splice(index, 1);
                writeFile(copyLines.join(SPLIT_CHAR));
                setInfo({
                    textLines: copyLines,
                    detailObjArr: copyObjArray,
                })
            }
        })
    }
    let newObj = emptyIpDomainObj;
    function changInfo(key, e) {
        newObj[key] = e.target.value;
    }
    function handleOk() {
        if (!validateNewObj(newObj)) {
            message.error('输入有误，请检查');
            return;
        }
        //  获得新字符串
        const newLines = infoObj.textLines.slice();
        //  获得新对象
        const newObjArray= infoObj.detailObjArr.slice();
        if (modStatus.modalType === ADD_CONFIG) {
            newLines.push(`${newObj.ip}    ${newObj.domain}`);
            newObjArray.push({
                isValid: true,
                index: newLines.length - 1,
                able: true,
                ip: newObj.ip,
                objIndex: newObjArray.length,
                domain: newObj.domain,
            })

        } else {
            const { index, domain, ip } = infoObj.detailObjArr[modStatus.curIndex];
            const newContent = newLines[index].replace(domain, newObj.domain).replace(ip, newObj.ip);
            newLines[index] = newContent;
            const targetObj = newObjArray[index];
            Object.assign(targetObj, newObj);
        }
        writeFile(newLines.join(SPLIT_CHAR));
        setInfo({
            textLines: newLines,
            detailObjArr: newObjArray,
        })
        setMS({
            showModal: false
        })
    }
    function handleCancel() {
        setMS({
            showModal: false
        })
    }
    function showModalFuc(type, index = -1) {
        setMS({
            showModal: true,
            modalType: type,
            curIndex: index,
        })
    }
    function getModal() {
        const { modalType, curIndex } = modStatus;
        newObj = { domain: infoObj.detailObjArr[curIndex]?.domain || '', ip: infoObj.detailObjArr[curIndex]?.ip || ''};
        return <Modal
            title={ modalType === EDIT_CONFIG ? '修改配置' : '新增配置'}
            visible={modStatus.showModal}
            onOk={handleOk}
            onCancel={handleCancel}
        >
            <Form {...layout} key={JSON.stringify(newObj)} initialValues={{ domain: newObj.domain, ip: newObj.ip }}>
                <FormItem label='域名' name='domain' rules={[{ required: true }]}>
                    <Input key={'domain'} onChange={changInfo.bind(null, 'domain')}/>
                </FormItem>
                <FormItem label='ip' name='ip' rules={[{ pattern: singleReg, message: '请输入正确的ip'}]}>
                    <Input onChange={changInfo.bind(null, 'ip')}/>
                </FormItem>
            </Form>
        </Modal>;
    }
    return <div className={s.name}>
        {/* <div onClick={showInfo}>点我测试</div> */}
        {/* <Upload
            customRequest={() => {}}
            onChange={handleChange}
            showUploadList={false}
        >
            <Button>
                <UploadOutlined />选择配置文件
            </Button>
        </Upload> */}
        <div className={s.addWrapper}>
            <div className={s.aWord}>新增配置</div><FileAddOutlined onClick={showModalFuc.bind(null, ADD_CONFIG)}/>
        </div>

        {infoObj.detailObjArr.map((item, index) => {
            const { ip, domain, index: lineNum, able } = item;
            return (
                <div key={index} className={s.formWrapper}>
                    <FormItem label={`${able ? '关闭' : '开启'}映射`} >
                            <Switch onChange={changeSwitch.bind(null, item)} defaultChecked={able}/>
                            <span className={s.domainAndIp}>{domain}: {ip}</span>
                    </FormItem>
                    <div className={s.iconGroup}>
                        <EditOutlined onClick={showModalFuc.bind(null, EDIT_CONFIG, index)}/>
                        <div className={s.iSpan}/>
                        <DeleteOutlined onClick={deleteConfig.bind(null, index)}/>
                    </div>
                </div>
            );
        })}
        {getModal()}
    </div>
}

export default Panel;