
/*
  后进先出

  创建栈结构时，它应该拥有哪些功能

*/

//创建 栈 类
class Stack{
    constructor(){
        //用来存储栈的数据
        this.items = [];
    }
    //添加数据  push
    push(ele){
        this.items.push(ele);
    }
    //取出并删除数据  pop
    pop(){
        return this.items.pop();
    }
    //返回栈顶数据 peek
    peek(){
        return this.items[this.items.length-1];
    }
    //清空栈   clear
    clear(){
        this.items = [];
    }
    //返回栈中数据长度  size
    size(){
        return this.items.length;
    }
}





let stack = new Stack();

stack.push(123);
stack.push(789);
stack.push(456);


/*console.log(stack.pop());
console.log(stack.size());

console.log(stack.peek());
console.log(stack.size());

stack.clear()
console.log(stack.size());*/




















