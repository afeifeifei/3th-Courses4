

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

let stack = new Stack();
stack.push(123);
stack.push(789);
stack.push(456);


let stack2 = new Stack();
stack2.push(111);


console.log(stack.pop());
console.log(stack2.pop());

console.log(stack[Symbol()]);


/*let a = {}
let b = {}

let sym = Symbol()

a[sym] = 10;
b[sym] = 20;*/














