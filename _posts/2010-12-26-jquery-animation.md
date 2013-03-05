---
layout: post
title: jQuery 动画组件(Animate)浅析
keywords: Javascript jquery animation
category: Front-end
excerpt: 之前自己在做js动画组件时遇到了JS时钟精度问题，遂去参考下jQuery的处理方式，顺便把jQuery的动画组件部分简要分析了一遍。
---

之前自己在做js动画组件时遇到了JS时钟精度问题，遂去参考下jQuery的处理方式，顺便把jQuery的动画组件部分简要分析了一遍。

jQuery组件都是由一个API接口函数暴露给用户的，组件的核心功能由有底层函数去完成。JQuery动画组件的接口函数就是animate。在了解animate之前，先了解到jQuery中动画相关的几个属性：

    // 用来设置定时器的变量
    var timerId ;
     
    jQuery.extend({
        // 修正一些参数，比如在回调函数中加入队列控制，并把这些修正后的参数放置一个对象里面返回
        speed: function( speed, easing, fn ) {},
     
        // 缓冲函数，决定动画运行方式
        easing: {},
     
        // 用来存储 执行动画实例单步的方法 的数组（有点拗口）
        timers: [],
     
        // 动画构造函数
        fx: function( elem, options, prop ) {}
     
    });

结合我在源码中加的一些注释，简要描述jQuery的动画过程：
- animate方法，首先调用speed方法去修正参数，然后用枚举或者队列的方式去执行多个动画接下来，遍历动画中要修改的属性，修正属性值，并将每个属性生成一个动画实例。调用实例custom方法将属性从开始值过渡到结束值。

- custom方法，把动画的单步操作(step方法)压入到前面提到的timers数组中，并调用tick遍历执行所有动画。

- step方法——动画的单步操作，计算动画的逝去时间，并将逝去时间与预定动画时长的比值作为动画的变化比值，将比比值结合动画缓冲函数，计算出动画变化值。如果动画逝去时间超过预定动画时长，则将属性更新到最后一帧，并调用预定的回调函数。返回false，表示该动画实例已完成。

- tick方法——定时遍历执行所有动画实例的step方法。如果step方法返回为false（该动画实例已完成），则将包含执行step方法的函数从timers数组中移除，如果timers数组为空（全部动画实例都运行完毕），执行stop方法。

- stop方法——终止动画，停止定时器，并清空定时器变量timerId

看完jQuery源码，自己也改造了一个。满足最基本的功能呢 查看Demo

下面是JQuery动画组件的大部分源码（我加了一些注释）：

    jQuery.fn.extend({
        // 动画组件接口函数（四个参数分别是要变化的属性以及属性值， 动画时长， 动画缓冲方法， 动画完成的回调函数）
        animate: function( prop, speed, easing, callback ) {
            // 调用speed方法修正参数
            var optall = jQuery.speed(speed, easing, callback);
     
            // 如果属性是空对象，则调用回调函数
            if ( jQuery.isEmptyObject( prop ) ) {
                return this.each( optall.complete );
            }
     
            // 枚举或者队列的方式来执行多个动画
            return this[ optall.queue === false ? "each" : "queue" ](function() {
     
                var opt = jQuery.extend({}, optall), p,
                    isElement = this.nodeType === 1,
                    hidden = isElement &amp;&amp; jQuery(this).is(":hidden"),
                    self = this;
     
                // 遍历属性 修正参数
                for ( p in prop ) {
                    // 将属性名修改为驼峰命名
                    var name = jQuery.camelCase( p );
                    if ( p !== name ) {
                        prop[ name ] = prop[ p ];
                        delete prop[ p ];
                        p = name;
                    }
     
                    // 如果当前状态已经是目标状态 则调用回调函数
                    if ( prop[p] === "hide" &amp;&amp; hidden || prop[p] === "show" &amp;&amp; !hidden ) {
                        return opt.complete.call(this);
                    }
     
                    // 如果修改DOM的高度或者宽度属性，则添加相应的css属性 (比如overflow，display等)
                    // 太智能了，算不算过渡设计？
                    if ( isElement &amp;&amp; ( p === "height" || p === "width" ) ) {
                        opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];
     
                        if ( jQuery.css( this, "display" ) === "inline" &amp;&amp;
                                jQuery.css( this, "float" ) === "none" ) {
                            if ( !jQuery.support.inlineBlockNeedsLayout ) {
                                this.style.display = "inline-block";
                            } else {
                                var display = defaultDisplay(this.nodeName);
                                if ( display === "inline" ) {
                                    this.style.display = "inline-block";
                                } else {
                                    this.style.display = "inline";
                                    this.style.zoom = 1;
                                }
                            }
                        }
                    }
     
                    // 属性为数组? 我是土人，没见到css属性为数组的。或者我领悟错了
                    if ( jQuery.isArray( prop[p] ) ) {
                        (opt.specialEasing = opt.specialEasing || {})[p] = prop[p][1];
                        prop[p] = prop[p][0];
                    }
                }
     
                if ( opt.overflow != null ) {
                    this.style.overflow = "hidden";
                }
     
                // 把属性对象作为opt的一个属性存储起来
                opt.curAnim = jQuery.extend({}, prop);
     
                // 遍历属性 执行每个属性的动画
                jQuery.each( prop, function( name, val ) {
                    // 为每个属性生成一个动画实例
                    var e = new jQuery.fx( self, opt, name );
     
                    // 如果是使用预定义的动画比如 toggle，show或者hide的，直接调用对应的方法
                    if ( rfxtypes.test(val) ) {
                        e[ val === "toggle" ? hidden ? "show" : "hide" : val ]( prop );
     
                    } else {
                        // 修正变化值
                        var parts = rfxnum.exec(val),
                        // 获取当前属性值
                            start = e.cur() || 0;
     
                        if ( parts ) {
                            var end = parseFloat( parts[2] ),
                                unit = parts[3] || "px";
     
                            if ( unit !== "px" ) {
                                jQuery.style( self, name, (end || 1) + unit);
                                start = ((end || 1) / e.cur()) * start;
                                jQuery.style( self, name, start + unit);
                            }
     
                            // 处理相对动画
                            if ( parts[1] ) {
                                end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
                            }
     
                            // 调用动画实例的custom方法（使属性从开始值变化到最终值）
                            e.custom( start, end, unit );
     
                        } else {
                            e.custom( start, val, "" );
                        }
                    }
                });
     
                return true;
            });
        }
    });
     
    jQuery.extend({
        // 修正参数
        speed: function( speed, easing, fn ) {
            // 把参数放入一个对象
            var opt = speed &amp;&amp; typeof speed === "object" ? jQuery.extend({}, speed) : {
                complete: fn || !fn &amp;&amp; easing ||
                    jQuery.isFunction( speed ) &amp;&amp; speed,
                duration: speed,
                easing: fn &amp;&amp; easing || easing &amp;&amp; !jQuery.isFunction(easing) &amp;&amp; easing
            };
     
            // 修正easing参数
            opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
                opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;
     
            // 在回调函数中加入队列控制
            opt.old = opt.complete;
            opt.complete = function() {
                if ( opt.queue !== false ) {
                    jQuery(this).dequeue();
                }
                if ( jQuery.isFunction( opt.old ) ) {
                    opt.old.call( this );
                }
            };
     
            // 返回包含各种参数的对象
            return opt;
        },
     
        // 动画缓冲函数
        easing: {
            // 线性
            linear: function( p, n, firstNum, diff ) {
                // 匀速直线运动 s = s0 + vt
                return firstNum + diff * p;
            },
            swing: function( p, n, firstNum, diff ) {
                return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
            }
        },
     
        // 用来存储 执行动画实例单步的方法 的数组（有点拗口）
        timers: [],
     
        // 动画构造函数
        fx: function( elem, options, prop ) {
            this.options = options;
            this.elem = elem;
            this.prop = prop;
     
            if ( !options.orig ) {
                options.orig = {};
            }
        }
     
    });
     
    jQuery.fx.prototype = {
        // 更新css属性
        update: function() {
            if ( this.options.step ) {
                this.options.step.call( this.elem, this.now, this );
            }
     
            (jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );
        },
     
        // 获取当前属性值
        cur: function() {
            if ( this.elem[this.prop] != null &amp;&amp; (!this.elem.style || this.elem.style[this.prop] == null) ) {
                return this.elem[ this.prop ];
            }
     
            var r = parseFloat( jQuery.css( this.elem, this.prop ) );
            return r &amp;&amp; r &gt; -10000 ? r : 0;
        },
     
        // 使属性从开始值变化到最终值
        custom: function( from, to, unit ) {
            var self = this,
                fx = jQuery.fx;
     
            // 把当前时间储存起来
            this.startTime = jQuery.now();
     
            this.start = from;
            this.end = to;
            this.unit = unit || this.unit || "px";
            this.now = this.start;
            this.pos = this.state = 0;
     
            function t( gotoEnd ) {
                // 调用动画实现的单步处理方法
                return self.step(gotoEnd);
            }
     
            t.elem = this.elem;
     
            // 初次执行动画实例的单步
            // 并将执行单步的方法压入timers数组(前面有解释过timers的作用)
            // 设置动画定时器，定时调用tick方法（一个动画中有且只能有一个定时器）
            if ( t() &amp;&amp; jQuery.timers.push(t) &amp;&amp; !timerId ) {
                timerId = setInterval(fx.tick, fx.interval);
            }
        },
     
        // 动画单步
        step: function( gotoEnd ) {
            // 获取当前时间
            var t = jQuery.now(), done = true;
     
            // 如果手动结束动画 或者 动画逝去时间大于等于预定动画时长，则结束动画
            if ( gotoEnd || t &gt;= this.options.duration + this.startTime ) {
                // 将动画更新到最后一步
                this.now = this.end;
                this.pos = this.state = 1;
                this.update();
     
                // 设置当前动画实例结束的标志
                this.options.curAnim[ this.prop ] = true;
     
                for ( var i in this.options.curAnim ) {
                    if ( this.options.curAnim[i] !== true ) {
                        done = false;
                    }
                }
     
                // 如果全部动画实例都结束了 则重置相应css属性（比如overflow等），并调用回调函数
                if ( done ) {
                    if ( this.options.overflow != null &amp;&amp; !jQuery.support.shrinkWrapBlocks ) {
                        var elem = this.elem,
                            options = this.options;
     
                        jQuery.each( [ "", "X", "Y" ], function (index, value) {
                            elem.style[ "overflow" + value ] = options.overflow[index];
                        } );
                    }
     
                    if ( this.options.hide ) {
                        jQuery(this.elem).hide();
                    }
     
                    if ( this.options.hide || this.options.show ) {
                        for ( var p in this.options.curAnim ) {
                            jQuery.style( this.elem, p, this.options.orig[p] );
                        }
                    }
     
                    this.options.complete.call( this.elem );
                }
     
                // 返回false
                return false;
     
            } else {
                // 计算动画逝去时间
                var n = t - this.startTime;
     
                // 计算动画变化比值
                // JQuery每一步的变化值是根据动画逝去时间来计算的，这样来弥补XP系统IE下JS时钟精度问题
                this.state = n / this.options.duration;
     
                // 根据变化比值，结合动画缓冲函数计算出本帧变化值
                var specialEasing = this.options.specialEasing &amp;&amp; this.options.specialEasing[this.prop];
                var defaultEasing = this.options.easing || (jQuery.easing.swing ? "swing" : "linear");
                this.pos = jQuery.easing[specialEasing || defaultEasing](this.state, n, 0, 1, this.options.duration);
                this.now = this.start + ((this.end - this.start) * this.pos);
     
                // 更新css属性
                this.update();
            }
     
            return true;
        }
    };
     
    jQuery.extend( jQuery.fx, {
        // 执行动画
        tick: function() {
            var timers = jQuery.timers;
     
            // 遍历执行动画实例的单步方法
            for ( var i = 0; i &lt; timers.length; i++ ) {
                // timers[i]就是custom中定义的函数t，用来执行动画实例的单步
                // 如果单步返回为false（表明该动画实例已运行完毕），则将其从timers数组中移除
                if ( !timers[i]() ) {
                    timers.splice(i--, 1);
                }
            }
     
            // 如果timers数组为空（表明全部动画实例都运行完毕了），执行stop
            if ( !timers.length ) {
                jQuery.fx.stop();
            }
        },
     
        interval: 13,
     
        // 停止定时器，并清空定时器变量
        stop: function() {
            clearInterval( timerId );
            timerId = null;
        },
     
        // 预设的speed取值
        speeds: {
            slow: 600,
            fast: 200,
            _default: 400
        }
    });

