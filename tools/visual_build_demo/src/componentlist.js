import cat from './static/images/cat.jpg';

let componentList = [{
    component:"Text",//对应组件class
    label:'文字',//组件列表中显示的名字
    propV:'xxx',// 传给组件用的值
    key:1,
    havePoint:false,
    style:{
        // position: 'absolute',
        // top: 0,
        // left: 0,
        color:'#24a5ff',
        fontSize:20
    }
},
{
    component:"Button",
    label:'按钮',
    propV:'click',
    key:2,
    havePoint:true,
    style:{
        // position: 'absolute',
        // top: 0,
        // left: 0,
        color:'#ff0000',
        width: 50,
        height:30
    }
},
{
    component:"Image",
    label:'图片',
    propV:cat,
    havePoint:true,
    key:3,
    style:{
        // position: 'absolute',
        // top: 0,
        // left: 0,
        width: 50,
        height:50
    }
}]; 

export default componentList;