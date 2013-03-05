---
layout: post
title: 关于reflow和repaint
keywords: Javascript reflow repaint
category: Front-end
excerpt: 最近又重新查阅了一些关于reflow(回流)、repaint(重绘)的资料，整理如下
---

最近又重新查阅了一些关于reflow(回流)、repaint(重绘)的资料，整理成笔记：

###什么是reflow和repaint

>“Repaint is what happens whenever something is made visible when it was not previously visible, or vice versa, without altering the layout of the document. ”
>“Reflow is a more significant change. It is the name of the web browser process for re-calculating the positions and geometries of elements in the document”

Repaint发生在当某些元素由不可见变为可见，或由可见变为可见的情况下，前提是不改变文档的layout模型。Reflow是一个更加明显的改变，它是浏览器重新计算文档元素的尺寸和位置的一个过程。

###什么情况下会发生reflow和repaint

####Repaint

- Adding an outline to a element //增加outline属性
- Changing the background color //改变背景色
- Changing the visibility style //改变visibility属性

####Reflow

- Resize the window //调整浏览器窗口大小
- A script manipulating DOM tree //脚本操作DOM
- Manipulating the className property of an element //操纵className属性
- Style changed that affect the layout //修改影响layout的样式
- Adding or removing a stylesheet //添加一处样式表
- Calculating offsetWidth and offsetHeight //计算offsetWidth和offsetHeight
- Contents changed,such as typing text in an input box //内容改变，比如在文本框内输入文本
- Activation of CSS pseudo classes  //激活伪类

###reflow和repaint带来什么影响

过多Reflow和Repaint会导致DOM渲染变慢，甚至破坏layout模型

>Repaint requires the engine to search through all elements to determine what is visible, and what should be displayed. 
>The engine must reflow the relevant element to work out where the various parts of it should now be displayed. Its children will also be reflowed to take the new layout of their parent into account. Elements that appear after the element in the DOM will also be reflowed to calculate their new layout, as they may have been moved by the initial reflows. Ancestor elements will also reflow, to account for the changes in size of their children. Finally, everything is repainted.

对于Repaint，需要浏览器引擎搜索整个DOM节点，然后决定各部分该如何呈现。
对于Reflow，引擎需要reflow相关的元素来计算各部分的现实方式，该元素的子节点也要根据新的layout模型reflow，出现在该元素之后的元素也需要reflow来计算新的layout模型，因为他们可
能被初始化reflow移除掉，并且该元素的祖先元素也要reflow来计算这些子级元素的改变，总之，所有的都被repaint了。


###如何避免reflow

- Reduce unnecessary DOM depth //减少不必要的DOM层级
- Making several style changes at once //一次修改多个样式
- Avoid tables for layout //避免使用table布局
- Avoid css expression //避免使用cssExpression
- Apply animations to elements that are position fixed or absolute //让动画元素绝对或者固定定位
- Trading smoothness for speed //牺牲流畅度来换取速度
- Avoid inspecting large numbers of nodes //避免大规模操作节点
- Avoid modifications while traversing the DOM //避免边渲染DOM边改变DOM
- Cache DOM values in script variables //缓存DOM信息

###实例

Bug描述：winxp的IE7/8浏览器中，搜索页面会在页面加载后异步载入部分DOM结构，
此时后面的DOM内容位置偏离了原始位置（见红框部分DOM内容）。


分析：javascript脚本操作DOM时引起的reflow导致祖先节点reflow和同一个祖先节点下的临近节点的reflow。在reflow时，layout模型发生了变化，部分浏览器引擎重新计算DOM的位置发生了
一些错误。

###参考文献

- http://code.google.com/intl/zh-CN/speed/articles/reflow.html
- http://code.google.com/intl/zh-CN/speed/tools.html
- https://developer.mozilla.org/en/Notes_on_HTML_Reflow
- http://dev.opera.com/articles/view/efficient-javascript/?page=3#reflow
- http://www.stubbornella.org/content/2009/03/27/reflows-repaints-css-performance-making-your-javascript-slow/
