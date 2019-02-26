
(function(){
    //变量定义
    let observer,
        REG,
        getResult;

    //订阅发布模式
    observer = new class{
        constructor(){
            this.items = {};
        }
        //订阅
        on(name,cb){
            if( !this.items[name] )this.items[name] = [];
            this.items[name].push(cb);
        }
        //退订
        off(name,cb){
            if( !this.items[name] )return;
            let index = this.items[name].indexOf(cb);
            if( index === -1 )return;
            this.items[name].splice(index,1);
        }
        //发布
        emit(name,msg){
            if(!this.items[name])return;
            this.items[name].forEach(fn=>{
                fn(msg);
            });
        }
    };

    //正则
    REG = {
        mustache : /\{\{.*?\}\}/g,
        empty : /\{\{\s*\}\}/,
        getKey : /[a-z_\$][\da-z_\$]*/ig,
        for : /\{\{(.*?)\}\}/g,
        keyName : /([a-z_$][a-z_$\d]*?)\.|^([a-z_$][a-z_$\d]*?)$/,
    };

    //eval取值
    getResult = function(exp){
        let x;
        eval(`x=(()=>{with(this)return ${exp}})()`);
        return x;
    };

    //Fly类
    let Fly = class {
        constructor(options){
            //代理对象
            let proxy = new Proxy(options.data,{
                get(target,key){
                    return Reflect.get(target,key);
                },
                set(target,key,value){
                    Reflect.set(target,key,value);
                    observer.emit(key);
                    return true;
                }
            });

            //调用解析dom的函数
            this.aysDOM(options,proxy);

            //返回代理对象
            return proxy;
        }

        //解析DOM的f-xxx的关联
        aysDOM(options,proxy){
            //遍历元素以及子元素满足条件的进行各种解析
            (function eachChild(parent){
                [...parent.children].forEach(item=>{
                    //调用标签数的检测
                    this.fTest(item,proxy);
                    //调用解析事件绑定的函数
                    this.EventTest(item,options.methods,proxy);
                    if( !item.hasAttribute("f-for") ){
                        eachChild.call(this,item);
                    }
                });
            }).call(
                this,
                document.querySelector(options.ele)
            );
        }

        //标签数的检测汇总
        fTest(item,proxy){
            let arrFn = [
                //f-for的检测
                function fFor(item,proxy){
                    let key = item.getAttribute("f-for");
                    if( !key )return false;
                    let arr = key.split(" in ");
                    //模板项的父级和内容
                    let parent = item.parentNode,
                        html = item.innerHTML;

                    parent.removeChild(item);

                    //console.log(data);

                    let exp = "`"+html.replace(REG.empty,"").replace(REG.for,($0,$1)=>{
                        return "${"+$1+"}";
                    })+"`";

                    let name = arr[1].replace(/\s/g,"").match(REG.keyName);
                    name = name[1] || name[2];


                    updata();
                    observer.on(name,updata);
                    function updata(){
                        let data = getResult.call(proxy,arr[1]);
                        let htmlArr = [];
                        eval(`
                            data.forEach(${arr[0]}=>{
                                htmlArr.push(${exp});
                            });
                        `);
                        parent.innerHTML = "";
                        htmlArr.forEach(v=>{
                            let ele = item.cloneNode();
                            ele.innerHTML = v;
                            parent.appendChild(ele);
                        });
                    }





                    return true;
                },

                //f-model的检测
                function fModel(item,proxy){
                    let key = item.getAttribute("f-model");
                    if( !key )return false;
                    //将dom节点的value设置为数据对应的值
                    let value = proxy[key];
                    item.value = value;
                    let ifNumber = typeof value === "number";

                    //实现input的value变化引起数据对应的key变化
                    item.addEventListener("input",()=>{
                        let v = item.value;
                        if( ifNumber && /^\d+$/.test(v) )v -= 0;
                        proxy[key] = v;
                    });

                    //订阅数据的更新
                    observer.on(key,()=>{
                        item.value = proxy[key];
                    });

                    return true;
                },

                //f-bind的检测
                function fBind(item,proxy){
                    let key = item.getAttribute("f-bind");
                    if( !key )return false;
                    //将dom节点的内容设置为数据对应的值
                    item.innerText = proxy[key];

                    //订阅数据的更新
                    observer.on(key,()=>{
                        item.innerText = proxy[key];
                    });
                    return true;
                },

                //双大括号检测
                function fMustache(item,proxy){
                    let children = item.childNodes;
                    let textChild = [];
                    let reg = REG.mustache;
                    //筛选出所有文本节点
                    for (let i = 0; i < children.length; i++) {
                        if( children[i].nodeType === 3 ){
                            textChild.push(children[i]);
                        }
                    }
                    //遍历文本节点，检测{{}}格式
                    textChild.forEach(node=>{
                        let value = node.nodeValue.replace(REG.empty,"");
                        let keyArr = [];
                        getTrueValue();
                        keyArr.forEach(key=>{
                            observer.on(key,getTrueValue)
                        });
                        function getTrueValue(){
                            node.nodeValue = value.replace(reg,(v)=>{
                                v = v.replace(/(^\{\{)|(\}\})$/g,"");
                                keyArr = v.match(REG.getKey);
                                return getResult.call(proxy, v);
                            });
                        }
                    });
                },
            ];
            for (let i = 0,len = arrFn.length; i < len; i++) {
                if( arrFn[i](item,proxy) ){
                    break;
                }
            }
        }

        //事件的解析
        EventTest(item,methods,proxy){
            [
                //允许的事件列表
                "click","mouseenter","mouseleave","foucs","blur"
            ].forEach(e=>{
                let key = item.getAttribute("f-"+e);
                if(!key || !methods[key])return;
                item.addEventListener(e,()=>{
                    methods[key].call(proxy);
                });
            });
        }
    }
    window .Fly = Fly;
})();










