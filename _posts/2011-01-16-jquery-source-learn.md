---
layout: post
title: jQuery源码阅读笔记(1)
keywords: Javascript jquery
category: Front-end
excerpt: “阅读jQuery源码”，在2010年尾时，我写下了这个plan。该是执行的时候了。
---


“阅读jQuery源码”，在2010年尾时，我写下了这个plan。该是执行的时候了。

我选择的jQuery版本是1.4.4，在逐行阅读分析jQuery代码前，我首先快速阅读了jQuery的全部代码，大致了解了jQuery源码的结构：整个jQuery源码是一个自执行的匿名函数。给匿名函数有个传递一个window参数，这样做便于压缩源码内的window字符串。在源码中，通过自执行函数来将jQuery和$变量保留给全局作用域供用户使用（#898）。

在接下来的时间，我将jQuery源码分成几大块进行逐行阅读分析。本文记录了第一部分的一些笔记。

###构造jQuery对象（#20-#898）

jQuery对象并不是new jQuery()生成的，而是实例化构造函数jQuery.fn.init()生成的，看看源码中这几个关系：

    jQuery.prototype = jQuery.fn #99
    //  jQuery的fn属性和其原型是指向同一个对象
     
    jQuery.fn.init.prototype = jQuery.fn  #327
    // 把jQuery的原型挂在jQuery.fn.init的原型链上，以便于外部的jQuery对象能访问jQuery原型链上的所有方法
     
    jQuery.extend = jQuery.fn.extend #329
    // 他们指向同一个扩展方法

这个部分伊始定义了很多正则，比如判断查询器字符类型的，判断JSON数据相关的，判断浏览器userAgent等待。还有定义一些Object方法的别名。

###jQuery的原型函数

在#99开始定义jQuery的原型，jQuery大部分功能都是通过其的静态方法来实现的，原型中的方法只是暴露给外部的API接口，其中：

- init方法根据传递的selector参数查询出对应的对象并返回；
- get方法会根据传递参数返回指定的对象元素；
- pushStack方法将传递的对象压入jQuery对象中；
- each 你懂的；
- ready 判断DOM是否加载完毕；
- eq 根据参数获取指定位置的数组元素；

###扩展函数——extend

这是jQuery源码用得最为频繁的一个方法了，很多jQuery的方法都是通过此函数扩展来的。extend方法可以将几个对象扩展到一个空对象上（对象合并），也可以将对象扩展到jQuery本身。而且支持深度克隆。

关于extend方法，有个疑问：

    clone = src &amp;&amp; jQuery.isArray(src) ? src : []  #371
    // 深度克隆对象时必须保证对象类型一致
    ...
    target[name] = jQuery.extend(deep, clone, copy); #378
    ...
    // 如果目标对象的a属性是一个字符串，而源对象的a属性是一个数组
    // 那么扩展后岂不是改变了目标对象a属性的类型了？

###jQuery的静态方法——ready

ready方法用来判断DOM是否加载完毕，jQuery会把onDOMReady后要执行的函数放入一个列表中，对于支持W3C标准事件的浏览器，使用DOMContentLoaded事件来完成这一任务。对于不支持DOMContentLoaded的浏览器，比如IE，使用doScrollCheck方法来判断DOM是否加载完毕（doScrollCheck，即反复执行document.documentElement的doScroll方法，如果执行成功则表示DOM完全加载，业界大部分js库使用这种方法判断IE中DOM是否加载完毕。）

###jQuery的静态方法——each

遍历对象元素，执行callback方法，如果执行结果为false，则返回。最终返回初始传入的对象，便于链式调用。

###jQuery的静态方法——inArray

inArray开始判断了Array对象本身是否具有indexOf方法，如果没有的话才重写inArray。估计John Resig认为在Array对象就应该要有indexOf方法的。不知道ES5的规范中有无给Array对象加入这个便捷的方法呢。

###jQuery的静态方法——access

仔细看过源码才知道，access方法是在调用函数前修正参数的。整个源码中就用到了两次。

    // value 可以是一个回调函数哦，这样的话在写js时会很方便了
    // write less , do more , and learn more
    access: function (elems, key, value, exec, fn, pass) {
        ...
    }
其中一些比较基础的静态方法就没有记录了。你懂的~
