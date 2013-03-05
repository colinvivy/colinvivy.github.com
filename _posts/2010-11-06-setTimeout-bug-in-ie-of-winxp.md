---
layout: post
title: IE下setTimeout 的bug
keywords: javascript settimeout ie
category: Front-end
excerpt: 用Js封装了一个常用的动画组件 (googleCode) ，发现动画完成所需的时间在IE和在其他浏览器下有很大的差别。
---

用Js封装了一个常用的动画组件 ([googleCode](http://code.google.com/p/animalex "view on GoogleCode"))  ，发现动画完成所需的时间在IE和在其他浏览器下有很大的差别。

开始以为是组件中调用的函数过于复杂，导致IE计算太耗时，拖延了整个动画的完成时间。于是选择了最简单的函数来实现动画，但问题依旧存在。排除了函数的复杂性，那就只可能是setTimeout的问题了。

>setTimeout(code, millisec); 在指定的毫秒数后调用函数或者表达式。(我在后面将称“指定的毫秒数”为调用间隔)

###疑问：IE是否在我指定的毫秒数之后执行了函数呢？

把代码精简到最少，继续测试，下面的的一段代码用来连续10次调用run函数（调用间隔是10ms），执行完后弹出的结果是调用10次函数耗费的总毫秒数：

    <script type="text/javascript">
    //<![CDATA[
    var animAlex = function (d) {
        var t = 0 ;
        var run = function () {
            if (t < d){
                t++;
                //尝试修改这里的参数 从0到15 都会按15计算
                setTimeout(run, 10);
            }else {
                alert(+ new Date() - s );
            }
        } ;
        run();
    } ;
    var s = + new Date() ;
    animAlex(10);
    //]]>
    </script>

忽略函数执行时间(这里，函数的执行时间确实可忽略)，调用10次函数所需时间的理论值等于调用间隔和执行次数的乘积，这里调用间隔是10ms ， 执行了10次，则总需时间 10×10 = 100ms ，当然浏览器不可能完全精准。但误差也应该保证在正负10ms以内。

面对现实，执行结果是：
1. IE下，调用10次函数所需时间平均值为 156ms
2. FF下，调用10次函数所需时间平均值为 102ms
3. chrome下，调用10次函数所需时间平均值为 110ms
4. opera下，调用10次函数所需时间平均值为 110ms

看来IE杯具了，测试继续在上面代码基础上测试，尝试改变调用间隔(time)，经过多次折腾，发现一个不稳定规律：
1. 当time >= 0 && time < 16 时， 按time = 15计算
2. 当time = 16 ，按 time = 25计算
3. 当time >=17 && time <=31 时， 按time = 31计算
4. 当time = 32 ，按 time = 42计算
5. 当time >=33 && time <=46 时， 按time = 46计算
...
很纠结。如果不看中间两个特殊值，姑且可认为IE下setTimeout的调用间隔是根据参数的范围来决定取某个值的

当然只是我个人在本本上测试，测试结果难免有所纰漏，欢迎指正。

最后，当你需要连续调用setTimeout时，为了IE，调用间隔的取值可以是：15ms、 31ms ...

只是通过暴力测试得出IE下有15~16ms的精度问题，后来Omiga给我看了这篇文字([再谈JavaScript时钟中的16ms精度问题](http://blog.csdn.net/aimingoo/article/details/1451556))，才知道自己只看到了表象。
