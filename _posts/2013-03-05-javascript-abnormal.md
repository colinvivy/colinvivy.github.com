---
layout: post
title: Javascript生僻问题集锦
keywords: Javascript
category: Front-end
excerpt: Javascript生僻问题集锦，不断更新中。。。
---


    var f = function g(){ return 23; };
    typeof g();
    //引用错误 g is not defined

1. 根据标准：命名函数表达式的函数名只对函数体可见

    (function (f){
        return typeof f();
    })(function(){ return 1; });
    //typeof 1 ---> "number"

    // another
    (function f(f){
        return typeof f();
    })(function(){ return 1; });
    //typeof 1 ---> "number"

2. 函数名被优先级更高的参数名覆盖了

    alert((1,2,3));
    // 3 

3. 首先要理解分组选择符，返回最后一个元素

    var x = 1;
    if (function f(){}) {
        x += typeof f;
    }
    x;
    //1object in chrome

4. 函数声明只能裸露于全局作用域下或位于函数体中。
从句法上讲，它们不能出现在块中，例如不能出现在if、while 或 for 语句中。因为块只能包含语句，因此if()中的f函数不能当做函数声明，当成表达式使用 可能在预编译阶段做了如下处理: `if((XXX = function(){}))` , 因此我们是找不到f的

    typeof typeof "xxx" 
    //string

5. 注意：
typeof 返回的一定是string格式的


