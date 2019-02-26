
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
        getKey : /[a-z_\$][\da-z_\$]*/ig
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
            this.aysDOM(options.ele,proxy);

            //返回代理对象
            return proxy;
        }

        //解析DOM的f-xxx的关联
        aysDOM(selector,proxy){
            let dom = document.querySelector(selector);
            //获取所有的元素，然后遍历检测标签属性
            let allChild = dom.getElementsByTagName("*");
            for (let i = 0,len=allChild.length; i < len; i++) {
                let item = allChild[i];

                //调用标签数的检测
                this.fTest(item,proxy);
            }
        }

        //标签数的检测汇总
        fTest(item,proxy){
            let arrFn = [
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
                        if( ifNumber && !isNaN(v) )v -= 0;
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
                        let value = node.nodeValue;
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
    }
    window .Fly = Fly;
})();