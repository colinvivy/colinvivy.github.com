---
layout: post
title: IE中设置name属性的困惑
keywords: javascript name ie
category: Front-end
excerpt: 在IE中给动态创建的元素设置name属性。。。
---

在看源码分析查错的过程中，看到如下一段代码：

    if ($isBrowser('ie')) {
        var ifrm = document.createElement('<iframe name="hidIframe"  />');
    } else {
        var ifrm = document.createElement('iframe');
        ifrm.name = "hidIframe";
    }

第一次看到createElement方法可以把html标记语言作为参数。IE居然可以这样，为什么要这样写呢？

经过一番搜索，在MS官方找到了相关文档：不能通过createElement方法给动态创建的(结合相关文档，把这里的at run time 翻译为动态创建的)元素设置name属性，要创建一个带name属性的元素，需要在使用createElement方法时包含相关属性和属性值。

>The NAME attribute cannot be set at run time on elements dynamically created with the createElement method. To create an element with a name attribute, include the attribute and value when using the createElement method.

有个困惑，在调用createElement方法时包含属性是微软专有的，如果你尝试这样写（`documeng.createElement('<input name="brian">')`），至少有三种问题：

1. 正常情况下，浏览器抛出`<inupt name="brian">`不是合法的元素类型”的异常
2. IE6下，浏览器创建一个带有type="input"和name="brian"属性的元素
3. 在NS7.1和Opera8.5下，浏览器创建一个带有不合法的type属性的元素（感谢
Kristof指出这点）

因此，如果你想动态创建带有name属性的元素，你必须绕个弯儿。不建议首先用正确的方法，因为在IE6上将失败，并没有办法检查你的代码。因此，我首先试图创建带有name属性的元素，并检查接过，如果结果ok，则可能在IE6和其他浏览器也是好的，否则，我会再尝试使用正确的方法去创建元素并设置name属性。

这里我想出的一个方法用来在任意浏览器上创建带有name属性的元素，传递你想要的name和type值即可。我测试过windows下的几种浏览器：IE5~7、FF1和1.5、Mozilla 1.7；NS 7.1 和 8；Opera 7.23 和 8.5 。如果你在其他浏览器上发现问题，请知会我。

    function createNamedElement(type, name) {
        var element = null;
        try {
            element = document.createElement('<'+type+' name="'+name+'">');
        } catch (e) {   }
        if (!element || element.nodeName != type.toUpperCase()) {
            element = document.createElement(type);
            element.name = name;   
        }   
        return element;
    }

这段代码没有使用浏览器探测技术，取而代之的是简单的首先尝试用IE允许的方法创建元素，如果失败，则用标准方法。

##更多的文档描述

注意：在给静态元素设置name属性时依然有些问题。微软JS允许在运行时修改name属性，这不会导致编程模型中元素集的name属性发生改变，但它能改变用于提交的元素（表单元素）的name属性。

当你提交一个form时，使用name绑定控件的值，这个name不是像`input type=button, input type=reset, and input type=submit ` 一样的显示属性，随form提交的是内置属性。

微软Jscript脚本允许你修改动态创建的元素的name属性，这并不会导致元素节点中编程模型中的name属性，但它会改变用于提交的元素的name属性。

IE8+中，动态设置name属性得以实现。在IE8+中，你可以给通过createElement方法动态创建的元素设置name属性，但在之前版本中，你还是只能通过包含attribute以及对应的值来动态创建元素

###More:
http://msdn.microsoft.com/zh-cn/subscriptions/hh780099.aspx
