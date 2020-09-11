import React from 'react';
import ReactDom from 'react-dom';
import Entry from './widgets';

//  挂载组件
const mountNode = document.getElementById('main');

//  原始前端渲染 在html的节点上挂载组件
// ReactDom.render((
//     <Com />
// ),mountNode);

ReactDom.render(
    <Entry />,
    mountNode
);