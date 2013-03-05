---
layout: post
title: “衣长比较”项目总结
keywords: canvas javascript
category: Front-end
excerpt: 目前，用户在网上购买衣服时，很难通过页面中冰冷的尺码数字来判断衣服是否合身。
---

[dresscanvas-structure]: /img/dresscanvas-structure.png
[dresscanvas-crood]: /img/dresscanvas-crood.png

###项目背景
目前，用户在网上购买衣服时，很难通过页面中冰冷的尺码数字来判断衣服是否合身。

数字只是一个理性的度量体现，用户想要的是更直观的感受，想更清晰的感受到衣服长短是否适合，腰围是大还是小，衣袖是否在可接受范围等等。

我们可以通过数据可视化来帮用户比较衣服。首先根据用户输入的尺码信息绘制出用户合身的衣服模型A，然后根据当前商品的尺码信息绘制出当前服饰的模型，并叠加到之前建立的模型A上，
同时提供对比数据和建议。以此将衣服的尺码比较信息更直观的展示给用户，帮助其选择更合身的服饰。

###方案调研
数据可视化可以使用canvas或svg等技术。较新的现代浏览器都支持canvas和svg，这两类绘图技术各有优劣，查询了相关资料，列表如下：

<table >
    <caption> Canvas和SVG的比较 </caption>
    <thead>
        <tr>
            <th>Canvas</th>
            <th>SVG</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>基于像素（canvas 实质上是一种带有绘图 API 的图像元素）</td>
            <td>基于对象模型（SVG 元素类似于 HTML 元素）</td>
        </tr>
        <tr>
            <td>单个HTML元素，其行为类似于img标签</td>
            <td>多个图形元素，是文档对象模型(DOM) 的一部分</td>
        </tr>
        <tr>
             <td>通过脚本以编程方式创建和修改视觉呈现</td>
             <td>使用标记创建视觉呈现，并通过 CSS 或通过脚本以编程方式修改视觉呈现 </td>
        </tr>
        <tr>
             <td>事件模型/用户交互是粗粒度的—仅在canvas 元素级别；必须通过鼠标坐标对交互进行手动编程设置</td>
             <td>事件模型/用户交互是基于对象的，在最基本的图像元素级别进行——线条、矩形、路径 </td>
        </tr>
        <tr>
            <td>
            Canvas 是一种位图，采用直接模式 (immediate mode)的图形应用程序编程接口 (API) 在其上进行绘图。 它是一种“发后不理”(Fire and Forget) 模型，在这种模式下，将直接向位图呈现其图形，之后对绘制的形状并不知晓；最后只呈现生成的位图。 
            </td>
            <td>
            SVG 是一种保留模式 (retained mode)的图形模型，是一种在内存中进行持久处理的模型。类似于 HTML，SVG 构建了包含图元、属性和样式的对象模型。在 HTML5 文档中出现SVG 元素时，它的作用类似于一个内联块，并且是HTML文档树的一部分。
            </td>
        </tr>
    </tbody>
</table>

在衣长比较的场景中，主要是需要对衣服模式的绘制 ，使用canvas和svg都不难实现。但考虑到后续可能有的扩展和维护成本，以及兼容性，我们最终选择用canvas来实现。 

###About canvas

Canvas是HTML5中的新特性，它没有自己的行为，但是定义了一个API支持脚本化客户端绘图操作。简而言之，我们可以使用JavaScript语言在canvas标签上绘制图形。


结合前面的方案，大致整理出我们需要的资源：

- a. 数据模型，用来保存各类服饰的参数以及相关参数
- b. canvas建模，包含**数据转换**，**绘制路径**，定义绘图样式，渲染图形，对比图形
- c. 用户操作界面，如尺寸调整事件处理等。

![dress canvas structure][dresscanvas-structure]


###数据模型
数据模型中包含各类服饰的默认尺码和最大尺码信息。

    //上衣数据
    // ...
    size: {
        // for save user base data
        base: { },
        max: {
            nagasa: 100,
            shoulder:50,
            hip: 60,
            sleeve: 80
        },
        // default user data
        custom: {
            nagasa: 100,
            shoulder:50,
            sleeveWidth: 30,
            waist: 45,
            hip: 60,
            sleeve: 80
        }
    },
    // ...

###数据转换

由于数据转换和衣服的数据紧密相关，所以紧接着处理数据转换。将服饰的物理尺码信息（衣长、袖长、腰围等）转换为每个点的坐标参数，为了方便后续的扩展和维护，将坐标点的定义以及对应转换一一列在图中：

![dress canvas crood][dresscanvas-crood]

我们在图中的二维坐标系中用一系列字母标注了一件普通上衣的部分关键坐标点（字母顺序和位置没有特定的对应关系）。红色字母是普通点（绘制一件衣服的关键点，类似于flash中的关键帧），蓝色字母（C1，C2等）表示是曲线的控制点。其中贝塞尔曲线有两个控制点，为了减少冗余变量和代码可读性，我把其对应的两对坐标放入到一个控制点数组中。曲线部分的弧度后续会考虑到根据衣服的其他尺码信息动态调整。

由图可知，一件非常简单的上衣模型就标注了多个坐标点并要对这些点进行坐标转换，后续若是对模型修改，打磨优化，带来的坐标改动、路径重绘的工作量可不小。考虑到我们绘制的服饰模型都是以服饰中线的轴对称图形，所以在程序中，我们将只计算出对称轴左侧的坐标，对称部分的坐标可通过公式翻转X坐标获取。


    /**
     * 翻转x轴坐标
     *
     * @param {Number} v 指定点的x坐标
     * @return 返回以竖直中心轴对称的x坐标
     **/
    flipX: function (v) {
        return 2*this.center[0] - v ;
    },
    
###坐标转换和绘图路径

就如前面所说的自动计算对称部分的坐标，在绘制路径的时候，我们也构造了方法自动化生成对称部分的路径，这样便可节省了一半的路径绘制工作。为了实现自动绘制对称部分的路径，我们把路径绘制的操作先抽离出来。待全部路径绘制好再将其传递给canvas绘图引擎处理。


依照前面图中提到的坐标图和公式进行坐标转换，并同时将其保存到绘图路径的数组。如：

    //坐标转换
    crood.A = [center[0]-size.shoulder/2, center[1]];
    crood.F = [crood.A[0] + 15, crood.A[1]];
    //路径绘制
    path.push({type: 'moveTo', v: crood.F}) ;

    crood.A1 = [crood.A[0] + 10, crood.A[1]];
    path.push({type: 'lineTo', v: crood.A1}) ;

    crood.A2 = [crood.A[0] - 20, crood.A[1] + 20];
    crood.C4 = [crood.A1[0] - 10, crood.A1[1], crood.A2[0], crood.A2[1], crood.A2[0], crood.A2[1]];
    path.push({type: 'bezierCurveTo', v: crood.C4}) ;

处理完左侧部分的坐标和路径之后，现在自动生成对称部分的路径：

    // 反转中心对称的坐标
    var pathFlip = [] ,
        tempCrood ;
    for (var i = path.length - 1, k; i >= 0; i--) {
        k = path[i] ;
        // 处理贝塞尔曲线
        if (k.type === 'bezierCurveTo') {
            // 1. 将第三点设置为当前坐标
            // 2. 重新设置bezier坐标,交换两个控制点坐标
            // 3. 并获取下一个点的坐标作为终点坐标

        }else if (k.type === 'moveTo'){
            tempCrood = [this.flipX(k.v[0]), k.v[1]] ;
            pathFlip.push({type: 'lineTo', v: tempCrood});
        }else {
            tempCrood = [this.flipX(k.v[0]), k.v[1]] ;
            pathFlip.push({type: k.type, v: tempCrood});
        }
    };

这样便绘制完了一件上衣的所需的全部路径（保存在path数组中）。接下来顺便计算两类衣服的尺码差别，并绘制出对应的尺码比较信息。这个过程比较简单，只需要绘制简单的“比较线段”和要显示的文案。如：

    // compare path 
    // compare length
    crood.compareLong1 = [this.flipX(crood.D[0]) + 12 , center[1]] ;
    pathCompare.push({type: 'moveTo', v: crood.compareLong1});

    crood.compareLong2 = [crood.compareLong1[0] + compareLineHeight, crood.compareLong1[1]] ;
    pathCompare.push({type: 'lineTo', v: crood.compareLong2});

    pathCompare.push({type: 'stroke'});
    pathCompare.push({type: 'beginPath'});

    [[//...]]

    pathCompare.push({type: 'fillText', v: [i18n.dressName.nagasa + ' + '+ (size.nagasa - sizeBase.nagasa) , crood.compareLong3[0] + 10, crood.compareLong3[1] + size.nagasa/2]});
    

###canvas绘图
    
在这个步骤中，我们将前面完成的路径在canvas中绘制出来。
首先，初始化路径的样式，比如颜色，笔触厚度等。不同的服饰类型有可配置不同的样式参数

    // 定义好各种情况的衣服样式
    styleConfig: {
        base: {
            fillStyle: '#5E5755',
            strokeStyle: '#5E5755'
        },
        custom: {
            fillStyle: 'rgba(242, 96, 128, 0.2)',
            strokeStyle: '#f26080'
        },
        compare: {
            lineWidth: 2,
            fillStyle: '#f26080',
            strokeStyle: '#f26080'
        }
    },

接下来，我们在render中渲染前面保存好的路径数组。由于前面的路径数组中都包含了路径的类型，所以这里的渲染本质上非常简单：

    for (i = 0, k = null; k = oPath.path[i] ; i++ ) {
        c[k.type] && (c[k.type].apply(c, k.v || []));
    }

在渲染过程中，如果检测到是渲染当前商品模型时，在渲染完毕之后，自动将两件服饰模型进行对比（compare）。并给出详细的对比数据描述。

由于canvas绘图是immediate mode，所以想在对比结果上监听mouseover事件不是很方便。所以，在衣长比较项目中，我在绘图过程中将需要响应mouseover事件的区域坐标和大小保存下来，并在对比方法调用完毕之后，在对应的区域创建透明的DOM节点，并监听其mouseover事件（尽管不是那么优雅，但优先解决实际问题 ^_^）。

至此整个方案的实现呈现完毕。

###i18n 

人们常把I18N作为“国际化”的简称，其来源是英文单词 internationalization的首末字符i和n。18为中间的字符数。在Web应用中，常用于让同样的页面在不同的语言环境下需要显示不同的效果。

衣长比较前期的文案可能有蛮多需要完善和改进的地方，所以，我们把需要用到的交互措辞写入到i18n对象中，后续需要对文案优化是，只需要更改i18n对象就可以了。

###后记
1.若能推动商品详情的衣服尺码数据标准化，那将大大降低用户的使用门槛和操作成本，让用户更方便的使用。
2.由于对canvas的使用还处于小白阶段，虽然能画出想要的模型，但其中实现的代码肯定大有改善的空间，后续会对绘图部分的代码进行持续改进和优化。

