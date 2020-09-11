const fs = require('fs');
const path = require('path');
const TEXT_PATH = path.resolve(__dirname, "content.txt"); // 大文件存储目录

const oldContent = fs.readFileSync(TEXT_PATH, 'utf-8');
const regx = /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/g;
//  提取所有ip地址
// const res = oldContent.match(regx);
// console.log(res);

//  提取所有行
const xxx = oldContent.split('\r\n');
//  结果的结构体数组
const yyy = xxx.map(item => {
    //  匹配所有ip，返回数组
    const targetIps = item.match(regx) || [];
    //  根据目标ip,通常是首个，分裂行内容
    const splitRes = item.split(targetIps[0]);
    const first = splitRes[0].trim();
    const isValid = splitRes.length >= 2 && first.length <= 1;
    if (isValid) {
        return {
            isValid,
            able: first.length === 0,
            ip: targetIps[0],
            domain: splitRes[1].split('#')[0].trim()
        }
    } else {
        return {
            isValid
        }
    }
})
console.log(yyy);
const rank = oldContent.indexOf('\n');
// for (let i = 0; i< 20; i++) {
//     console.log(oldContent[i]);
// }
console.log(rank);
//let newContent = oldContent.replace()
fs.writeFileSync(path.resolve(__dirname, 'xxx.txt'), oldContent);
console.log(oldContent);