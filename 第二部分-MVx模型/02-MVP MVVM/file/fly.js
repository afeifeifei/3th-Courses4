

(function(){
    //观察者模式
    class Observer{
        constructor(){}
        on(){}
        off(){}
        emit(){}
    }

    //解析DOM
    function aysDOM(selector){
        /*let dom = [...document.querySelectorAll(selector)];
        dom.forEach(ele=>{
            let allDOM = ele.get
        });*/
        let dom = document.querySelector(selector);

        //获取所有的元素，然后遍历检测标签属性
        let allChild = dom.getElementsByTagName("*");
        for (let i = 0,len=allChild.length; i < len; i++) {
            let item = allChild[i];

            //f-model的检测
            (function(){
                let key = item.getAttribute("f-model");
                if( !key )return;
                //将dom节点的value设置为数据对应的值
                item.value = this[key];

                //实现input的value变化引起数据对应的key变化
                item.addEventListener("input",()=>{
                    this[key] = item.value;
                });
            })();


            //f-bind的检测
            (function(){
                let key = item.getAttribute("f-bind");
                if( !key )return;
                //将dom节点的内容设置为数据对应的值
                item.innerText = this[key];
            })();

        }
    }

    let Fly = class{
        constructor(options){
            //将传入的数据，存放到实例上
            for (let [key,value] of Object.entries(options.data)) {
                this[key] = value;
            }
            //调用解析DOM的函数
            aysDOM.call(this,options.ele);
        }
    };

    window.Fly = Fly;
})();















