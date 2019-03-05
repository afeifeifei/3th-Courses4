# MV*模式

## 1. MVC模式

M（model）模型 —— V（view）视图 —— C（controller）控制器，一种将业务逻辑、数据、视图分离的模式。

首先我们通过一个例子来看看为什么要使用这种结构的模式：[点击预览](https://afeifeifei.github.io/class-demo/MVX/01-demo.html)

```js
//不使用模式的代码
let aButBuy = document.querySelectorAll(".buy input"),
    aButEat = document.querySelectorAll(".eat input"),
    aSpanTotal = document.querySelectorAll(".total span"),
    numArr = [0,0];

[...aButBuy].forEach((item,index)=>{
    item.onclick = function(){
        numArr[index] ++;
        aSpanTotal[index].innerHTML = numArr[index];
    };
});
[...aButEat].forEach((item,index)=>{
    item.onclick = function(){
        numArr[index] --;
        if( numArr[index] < 0 ){
            numArr[index] = 0;
            alert("都没了还吃！！");
        }
        aSpanTotal[index].innerHTML = numArr[index];
    };
});
```

需求更变，现在需要加上一个总和：[点击预览](https://afeifeifei.github.io/class-demo/MVX/02-demo.html)

```js
let aButBuy = document.querySelectorAll(".buy input"),
    aButEat = document.querySelectorAll(".eat input"),
    aSpanTotal = document.querySelectorAll(".count span"),
    oTotalSpan = document.querySelector(".total span"),
    numArr = [0,0];

[...aButBuy].forEach((item,index)=>{
    item.onclick = function(){
        numArr[index] ++;
        aSpanTotal[index].innerHTML = numArr[index];
        oTotalSpan.innerHTML = numArr.reduce((a,b)=>a+b);
    };
});
[...aButEat].forEach((item,index)=>{
    item.onclick = function(){
        numArr[index] --;
        if( numArr[index] < 0 ){
            numArr[index] = 0;
            alert("都没了还吃！！");
        }
        aSpanTotal[index].innerHTML = numArr[index];
        oTotalSpan.innerHTML = numArr.reduce((a,b)=>a+b);
    };
});
```

很显然，如果代码结构这么写的话，每一个需求的更变，都需要改变多个地方，显得很臃肿并且很容易就会漏掉犯错。通过我们以前的学习，我们可以封装一个单独的改变HTML结构的函数，像这样：

```js
//单独列出改变HTML内容的所有操作，这个模块相对独立，只需要数据（numArr）的支撑
function changeHTML(){
    numArr.forEach((item,index)=>{
        aSpanTotal[index].innerHTML = item;
    });
    oTotalSpan.innerHTML = numArr.reduce((a,b)=>a+b);
}

[...aButBuy].forEach((item,index)=>{
    item.onclick = function(){
        numArr[index] ++;
        changeHTML();
    };
});

[...aButEat].forEach((item,index)=>{
    item.onclick = function(){
        numArr[index] --;
        if( numArr[index] < 0 ){
            numArr[index] = 0;
            alert("都没了还吃！！");
            return;
        }
        changeHTML();
    };
});
```

其实，到这一步，我们已经可以看到单独列出某个模块的好处了，我们不妨继续将各个模块继续单列出来：

```js
//单独列出改变HTML内容的所有操作，这个模块只需要数据（numArr）的支撑
function changeHTML(){
    numArr.forEach((item,index)=>{
        aSpanTotal[index].innerHTML = item;
    });
    oTotalSpan.innerHTML = numArr.reduce((a,b)=>a+b);
}

//单独列出计数器的变化，这个模块需要和事件操作联系起来
function dataModel(bool,index){
    if( bool ){
        numArr[index]++;
    }else{
        numArr[index]--;
        if( numArr[index] < 0 ){
            numArr[index] = 0;
            alert("都没了还吃！");
        }
    }
}

[...aButBuy].forEach((item,index)=>{
    item.onclick = function(){
        dataModel(true,index);
        changeHTML();
    };
});

[...aButEat].forEach((item,index)=>{
    item.onclick = function(){
        dataModel(false,index);
        changeHTML();
    };
});
```

好了，M（model）和 V（view）的雏形已经有了。控制器C在前端中主要是放置一些用户出发的事件相关代码，就像上面的点击，但是上述的代码中，视图和数据模型其实还是全部耦合在控制器里面的。所以这还仅仅只是一个封装得稍微好一点的代码。

接下来，我们以MVC模式来实现这个需求。先来看一个关于MVC的简图：

![MVC](https://afeifeifei.github.io/class-demo/MVX/MVC.png)

> 1. 用户在 V 上与程序进行交互
> 2. C 触发相应的事件，根据情况让 M 做出对应的改变
> 3. M 变化之后会要求 V 根据数据做出对应的更新

先再关键点在于 3 这一步，M模型数据的变化，会引起V视图的变化，回想一下之前学过的知识点，监听数据set与观察者模式就可以非常好的做到这一点：

```js
let MVC = (function(){
    //Model
    let M = (function(){
        let data = [5,4,3]; //[nApple,nPear,nBanana]
        //返回一些相关的操作接口
        return {
            //数据更新接口
            update(i,b){
                b?data[i]++:data[i]--;
                this.validate();
                M.observer.emit([...data]);
            },
            //数据验证接口
            validate(){
                data.forEach((v,i)=>{
                    //不得小于0
                    if( v < 0 ){
                        data[i] = 0;
                        alert("都没了还吃！");
                    }
                    //不得大于99
                    if( v > 99 ){
                        data[i] = 99;
                        alert("家里有矿啊？买这么多！");
                    }
                });
            },
            //提供观察者接口
            observer : (function(){
                let arr =[];
                return {
                    on(cb){
                        arr.push(cb);
                    },
                    emit(d){
                        arr.forEach(v=>v(d));
                    }
                }
            })(),
            //获取数据接口
            getData(){
                return [...data];
            }
        };
    })();
    //View
    let V = (function(){
        //对应的DOM的获取
        let aCount = [...document.querySelectorAll(".count span")],
            oTotal = document.querySelector(".total span");
        return {
            //视图的更新代码
            update(data){
                aCount.forEach((v,i)=>{
                    v.innerText = data[i];
                });
                oTotal.innerText = data.reduce((a,b)=>a+b);
            }
        };
    })();
    //Controller
    let C = function(){
        //对应DOM的获取
        let aBuy = document.querySelectorAll(".buy input"),
            aEat = document.querySelectorAll(".eat input");
        //事件的添加
        [...aBuy].forEach((v,i)=>{
            v.onclick = function(){
                M.update(i,true);
            };
        });
        [...aEat].forEach((v,i)=>{
            v.onclick = function(){
                M.update(i,false);
            };
        });
    };
    return{
        init(){
            //初始化视图
            V.update(M.getData());
            //添加控制器
            C();
            //定于View的更新
            M.observer.on(V.update);
        }
    };
})();

//执行
MVC.init();
```

**总结：**

> *MVC模式的优点：*
>
> 将每个逻辑分开，降低了耦合，可以各个模块分别开发，降低了开发和后期维护的成本。
>
> *MVC模式的缺点：*
>
> 1 结构的分离带来的结果还有代码更多更复杂，所以小型的需求使用MVC是没有必要的，这样写起来反而会更难受。
>
> 2 控制层和视图层其实是没有真正的分离的，假设我们点击的案例也会变化的话，就还需要在view再获取按钮等等操作。但是这个问题是可以被解决的，也就是后面衍生出的各种 MV* ，都是在MVC的原理基础上扩展出来的。

## 2. MVP模式

M（model）模型 —— V（view）视图 —— P（presenter）管理者，基于MVC模式衍生出的一种结构分离模式。

学过了MVC模式之后再看MVP就很容易理解了，我们先来看MVP的示意图：

![MVP](https://afeifeifei.github.io/class-demo/MVX/MVP.png)

> 与MVC不同在于，Model不再与View直接联系了，也就是说数据更新之后是告知Presenter的，然后P再通知V进行视图的改变。
>
> 这样的结构可以完全的解开 M 和 V 的耦合，当数据和view的交互比较复杂的时候使用这种模式会更好，同时也更加的便于数据和视图的单独维护。

**具体代码请看视频讲解**

## 3. MVVM模式

M（Model）模型 —— V（View）视图 —— VM（ViewModel）视图模型。MVVM模式的工作特定和MVP比较类型，作用也是通过 VM 实现 M 与 V 的关联。与MVP不同的是，MVP中所有的主动权全部掌握在 P 中，合理调用 P 中的方法以控制视图更新与数据更新，而 MVVM 中，直接通过视图html内容实现视图与数据的绑定，并且也能保证 V 和 M 的分离。示意图：

![MVVM](https://afeifeifei.github.io/class-demo/MVX/MVVM.png)

MVVM的关键点在于，双向数据绑定 与 服务于V的定制的VM。

**这是目前最常用的模式，具体代码请看视频讲解**













