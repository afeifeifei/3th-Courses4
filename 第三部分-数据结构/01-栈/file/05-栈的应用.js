let Stack = (function(){
    let sym = Symbol();
    return class {
        constructor(){
            //用来存储栈的数据
            this[sym] = [];
        }
        //添加数据  push
        push(ele){
            this[sym].push(ele);
        }
        //取出并删除数据  pop
        pop(){
            return this[sym].pop();
        }
        //返回栈顶数据 peek
        peek(){
            return this[sym][this[sym].length-1];
        }
        //清空栈   clear
        clear(){
            this[sym] = [];
        }
        //返回栈中数据长度  size
        size(){
            return this[sym].length;
        }
    }
})();


//2进制转换
function baseConverter2(number){
    let stack = new Stack();
    let result = "";
    //取所有余数
    while ( number > 0 ){
        //余数入栈
        stack.push( number % 2 );
        //每次取商
        number = Math.floor(number/2);
    }
    //余数出栈
    while (stack.size()){
        result += stack.pop();
    }
    return result;
}

//指定进制转换
function baseConverter(number,base=2){
    let stack = new Stack();
    let sign = "0123456789abcdef";
    let result = "";
    //取所有余数
    while ( number > 0 ){
        //余数入栈
        stack.push( sign[number % base] );
        //每次取商
        number = Math.floor(number/base);
    }
    //余数出栈
    while (stack.size()){
        result += stack.pop();
    }
    return result;
}

//


console.log(baseConverter2(3));
console.log(baseConverter(255, 16));

















