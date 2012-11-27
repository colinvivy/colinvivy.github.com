/**
 * sizzle-analySis.js
 *
 * @date 2012-09-30
 * @link   http://icolin.org/
 */

var jQuery ={} ;
var C = {
    i:0,
    j:0,
    k:0,
    S:null
};
// get function definition
var getFnName = function(callee){
    var _callee = callee.toString().replace(/[\s\?]*/g,""),
        comb = _callee.length >= 50 ? 50 :_callee.length;
    _callee = _callee.substring(0,comb);
    var name = _callee.match(/^function([^\(]+?)\(/);
    if(name && name[1]){
        return name[1];
    }

    // find function definition from global scope 
    var G = C.S.toString().replace(/[\s\?]*/g, '')
    var last = G.indexOf(_callee),
        str = G.substring(last-30,last);
    name = str.match(/var([^\=]+?)\=/);
    if(name && name[1]){
        return name[1];
    }
    return "anonymous";
};

// fix console for IE
if (typeof console == 'undefined') {
    var T = {} ;
    var console = {
        log: function (v) {
            alert(v);  
        },
        time: function (v) {
            T[v] = + new Date();
        },
        timeEnd: function (v) {
            this.log(v + ' cost time : '+ (+new Date() - T[v] ));
        },

        group: function () { return  ;   },
        groupEnd: function () {return  ; },
        groupCollapsed : function () { return  ;   }
    };
}

// fix console bug ( lazy evaluation quote Obj)
var clog = function () {
    if (navigator.userAgent.indexOf('MSIE') + 1) {
        return  ;
    }

    var arg = arguments ,
        rArrayLike = /object (?:Array|Object|NodeList)/g,
        toString = Object.prototype.toString ;
    Array.prototype.map.call(arg, function (item, i, o) {
        if (toString.call(item).match(rArrayLike) != null) {
            o[i] = Array.prototype.slice.call(item, 0);
        }
    })
    console.log.apply(console, arg);
};


// sizzle start
(function () {

    var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
        done = 0,
        toString = Object.prototype.toString,
        hasDuplicate = false,
        baseHasDuplicate = true;

    // Here we check if the JavaScript engine is using some sort of
    // optimization where it does not always call our comparision
    // function. If that is the case, discard the hasDuplicate value.
    //   Thus far that includes Google Chrome.
    [0, 0].sort(function () {
        baseHasDuplicate = false;
        return 0;
    });

    var Sizzle = function (selector, context, results, seed) {
        results = results || [];
        context = context || document;

        var origContext = context;

        if (context.nodeType !== 1 && context.nodeType !== 9) {
            return [];
        }

        if (!selector || typeof selector !== "string") {
            return results;
        }

        var m, set, checkSet, extra, ret, cur, pop, i, prune = true, FUCK,
            contextXML = Sizzle.isXML(context),
            parts = [],
            soFar = selector;

        // Reset the position of the chunker regexp (start from head)
        do {
            chunker.exec("");
            m = chunker.exec(soFar);

            if (m) {
                soFar = m[3];

                parts.push(m[1]);

                if (m[2]) {
                    extra = m[3];
                    break;
                }
            }
        } while (m);

        // test 
        var CL = arguments.callee.caller ;
        var callerName = getFnName(CL);

        // reset C.i when User invoke $.find
        (!CL || CL && (callerName == 'eval' || callerName == 'anonymous' || callerName == null)) && (C.i = 0) ;
        clog(['第'+(++C.i)+'次调用Sizzle', CL&&'Caller: '+getFnName(CL), 'parts:'+parts]);

        // A 主干
        // 都是通过posProcess调用B的,大部分实现的细节都是在B里面
        if (parts.length > 1 && origPOS.exec(selector)) {

            // A.a 分支
            // 当pos和+>~选择器一起存在时,调用posProcess让pos滞后处理 + li:eq(2)
            if (parts.length === 2 && Expr.relative[parts[0]]) {
                // test 
                console.group('A.a') ;
                clog('a.a parts: ' + parts) ;
                set = posProcess(parts[0] + parts[1], context);
                // test
                clog('a.a set: ' , set) ;
                console.groupEnd();

            // A.b 分支
            } else {
                // test 
                console.group('A.b') ;
                clog('a.b parts: ' + parts) ;
                // left to right
                // 获取作用域
                set = Expr.relative[parts[0]] ? [context] : Sizzle(parts.shift(), context);
                // test 
                clog('a.b set: ' , set) ;

                while (parts.length) {
                    // test
                    console.group('A.b.loop.' + (++C.j));
                    clog('parts: ' + parts) ;

                    selector = parts.shift();

                    if (Expr.relative[selector]) {
                        selector += parts.shift();
                    }
                    clog('true selector: ' + selector) ;


                    set = posProcess(selector, set);
                    // test
                    clog('A.b loop Processed(filtered) set: ' , set) ;
                    console.groupEnd();
                }

                // reset C.j
                C.j= 0;

                // end A.b
                console.groupEnd();
            }

        // B 主干
        // parts.length <=1 && not pos 
        // parts.length <=1 && pos 
        // parts.length >1 && not pos 
        } else {
            // test 
            console.group('B');
            clog('B parts: ' + parts) ;

            // Take a shortcut and set the context if the root selector is an ID
            // (but not if it'll be faster if the inner selector is an ID)
            if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML && Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {

                // 获取候选集方便后续过滤
                ret = Sizzle.find(parts.shift(), context, contextXML);
                context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0];
            }

            if (context) {
                // test 
                clog('B.a parts: ' + parts, '; context:', [context], ' ; seed:', seed) ;
                // right to left
                // 获取候选集方便后续过滤
                ret = seed ? {
                    expr: parts.pop(),
                    set: makeArray(seed)
                } : Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);

                clog('B.a set UnFilter: ' , ret.expr, ret.set) ;
                // if has seed ??
                set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;

                if (parts.length > 0) {
                    checkSet = makeArray(set);

                // if初始parts.length=1
                } else {
                    prune = false;
                    //test 
                    clog('B.a prune to be False');
                }

                while (parts.length) {
                    console.group('B.a Loop ' + (++C.k))
                    clog('B.a loop parts: ' + parts) ;
                    cur = parts.pop();
                    pop = cur;
                    // test 
                    clog('B.a loop cur/pop: ' + cur) ;

                    if (!Expr.relative[cur]) {
                        cur = "";
                    } else {
                        pop = parts.pop();
                    }

                    if (pop == null) {
                        pop = context;
                    }

                    // invokeRelative relative:
                    clog('B.a true pop: ' , pop);
                    Expr.relative[cur](checkSet, pop, contextXML);
                    // test 
                    clog('B.a loop checkSet: ' , checkSet) ;
                    console.groupEnd();
                }
                //reset C.k
                C.k = 0 ;

            } else {
                // test 
                clog('b.b set checkSet and parts be [] for NoContext' ) ;
                checkSet = parts = [];
            }
            // end B
            console.groupEnd();
        }

        if (!checkSet) {
            checkSet = set;
        }

        if (!checkSet) {
            Sizzle.error(cur || selector);
        }


        if (toString.call(checkSet) === "[object Array]") {
            if (!prune) {
                // 粗略的看 以为直接把cs数组push进去了，注意是apply
                results.push.apply(results, checkSet);

            } else if (context && context.nodeType === 1) {
                for (i = 0; checkSet[i] != null; i++) {
                    if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))) {
                        results.push(set[i]);
                    }
                }

            } else {
                for (i = 0; checkSet[i] != null; i++) {
                    if (checkSet[i] && checkSet[i].nodeType === 1) {
                        results.push(set[i]);
                    }
                }
            }

        } else {
            makeArray(checkSet, results);
        }

        if (extra) {
            Sizzle(extra, origContext, results, seed);
            Sizzle.uniqueSort(results);
        }

        return results;
    };

    Sizzle.uniqueSort = function (results) {
        if (sortOrder) {
            hasDuplicate = baseHasDuplicate;
            results.sort(sortOrder);

            if (hasDuplicate) {
                for (var i = 1; i < results.length; i++) {
                    if (results[i] === results[i - 1]) {
                        results.splice(i--, 1);
                    }
                }
            }
        }

        return results;
    };

    // 在结果集中筛选，貌似没有被调用过
    Sizzle.matches = function (expr, set) {
        return Sizzle(expr, null, null, set);
    };

    // 检查node是否符合expr
    Sizzle.matchesSelector = function (node, expr) {
        return Sizzle(expr, null, null, [node]).length > 0;
    };

    // outter find
    Sizzle.find = function (expr, context, isXML) {
        var set;

        if (!expr) {
            return [];
        }

        for (var i = 0, l = Expr.order.length; i < l; i++) {
            var match, type = Expr.order[i];

            if ((match = Expr.leftMatch[type].exec(expr))) {
                var left = match[1];
                match.splice(1, 1);

                if (left.substr(left.length - 1) !== "\\") {
                    match[1] = (match[1] || "").replace(/\\/g, "");
                    set = Expr.find[type](match, context, isXML);

                    if (set != null) {
                        expr = expr.replace(Expr.match[type], "");
                        break;
                    }
                }
            }
        }

        if (!set) {
            set = context.getElementsByTagName("*");
        }

        return {
            set: set,
            expr: expr
        };
    };

    // outter filter
    Sizzle.filter = function (expr, set, inplace, not) {
        var match, anyFound, old = expr,
            result = [],
            curLoop = set,
            isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

        while (expr && set.length) {
            for (var type in Expr.filter) {
                if ((match = Expr.leftMatch[type].exec(expr)) != null && match[2]) {
                    var found, item, filter = Expr.filter[type],
                        left = match[1];

                    anyFound = false;

                    match.splice(1, 1);

                    if (left.substr(left.length - 1) === "\\") {
                        continue;
                    }

                    // []===[]//false 故下面的语句永远不会执行
                    if (curLoop === result) {
                        result = [];
                    }

                    // 修正表达式（替换转义之类）
                    // preFilter result : PSEUDO 返回布尔，CLASS返回False,其余都是返回修正后的对象
                    if (Expr.preFilter[type]) {
                        match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);

                        if (!match) {
                            anyFound = found = true;

                        // 若是属于pos child 则跳过
                        } else if (match === true) {
                            continue;
                        }
                    }

                    if (match) {
                        for (var i = 0; (item = curLoop[i]) != null; i++) {
                            // 判断多余了吧
                            if (item) {
                                found = filter(item, match, i, curLoop);
                                var pass = not ^ !! found;

                                if (inplace && found != null) {
                                    if (pass) {
                                        anyFound = true;

                                    } else {
                                        curLoop[i] = false;
                                    }

                                // no inplace && no found(not: true)
                                // no inplace && found(not: false)
                                // inplace && no found(not: true) 这种情况应该在上面的判断中处理
                                } else if (pass) {
                                    result.push(item);
                                    anyFound = true;
                                }
                            }
                        }
                    }

                    if (found !== undefined) {
                        if (!inplace) {
                            curLoop = result;
                        }

                        expr = expr.replace(Expr.match[type], "");

                        if (!anyFound) {
                            return [];
                        }

                        break;
                    }
                }
            }

            // Improper expression
            if (expr === old) {
                if (anyFound == null) {
                    Sizzle.error(expr);

                } else {
                    break;
                }
            }

            old = expr;
        }

        return curLoop;
    };

    Sizzle.error = function (msg) {
        throw "Syntax error, unrecognized expression: " + msg;
    };

    // core obj
    var Expr = Sizzle.selectors = {
        order: ["ID", "NAME", "TAG"],

        match: {
            // #(\w)
            ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
            CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
            NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
            // (\w)(^=)(")(\w) 1 2 4 [href^="x"]
            ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
            TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
            // :(only)-child(even) 1 2
            CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/,
            // (eq)(\d) 1 2
            POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
            // :(\w)(")(\w) 1 3 :checked 
            PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
        },

        leftMatch: {},

        attrMap: {
            "class": "className",
            "for": "htmlFor"
        },

        attrHandle: {
            href: function (elem) {
                return elem.getAttribute("href");
            }
        },

        relative: {
            "+": function (checkSet, part) {
                var isPartStr = typeof part === "string",
                    isTag = isPartStr && !/\W/.test(part),
                    isPartStrNotTag = isPartStr && !isTag;

                if (isTag) {
                    part = part.toLowerCase();
                }

                //test
                console.group('Relative +');
                // 非常奇怪 checkSet 是什么arry obj 坑跌倒webkitbug

                clog('origin checkset: ', checkSet);

                for (var i = 0, l = checkSet.length, elem; i < l; i++) {
                    if ((elem = checkSet[i])) {
                        while ((elem = elem.previousSibling) && elem.nodeType !== 1) {}

                        // 等于elem不就ok？为何会有重写为true 的可能
                        // 三元选择器的条件都是针对part为string的判断 expr || string ?
                        checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ? elem || false : elem === part;
                    }
                }
                clog('preDone checkset: ', checkSet);

                if (isPartStrNotTag) {
                    Sizzle.filter(part, checkSet, true);
                    clog('filtered with: "'+ part + '"', checkSet);
                }
                console.groupEnd();
            },

            ">": function (checkSet, part) {
                var elem, isPartStr = typeof part === "string",
                    i = 0,
                    l = checkSet.length;

                //test
                console.group('Relative >');
                clog('origin checkset: ', checkSet);

                if (isPartStr && !/\W/.test(part)) {
                    part = part.toLowerCase();

                    for (; i < l; i++) {
                        elem = checkSet[i];

                        if (elem) {
                            var parent = elem.parentNode;
                            checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
                        }
                    }

                } else {
                    for (; i < l; i++) {
                        elem = checkSet[i];

                        if (elem) {
                            checkSet[i] = isPartStr ? elem.parentNode : elem.parentNode === part;
                        }
                    }

                    if (isPartStr) {
                        Sizzle.filter(part, checkSet, true);
                    }
                }
                console.groupEnd();
            },

            "": function (checkSet, part, isXML) {
                //test
                console.group('Relative grandChild');
                clog('origin checkset: ', checkSet);

                var nodeCheck, doneName = done++,
                    checkFn = dirCheck;

                if (typeof part === "string" && !/\W/.test(part)) {
                    part = part.toLowerCase();
                    nodeCheck = part;
                    checkFn = dirNodeCheck;
                }

                checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);

                console.groupEnd();
            },

            "~": function (checkSet, part, isXML) {
                var nodeCheck, doneName = done++,
                    checkFn = dirCheck;

                //test
                console.group('Relative ~');
                clog('origin checkset: ', checkSet);

                if (typeof part === "string" && !/\W/.test(part)) {
                    part = part.toLowerCase();
                    nodeCheck = part;
                    checkFn = dirNodeCheck;
                }

                checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
                console.groupEnd();
            }
        },

        find: {
            ID: function (match, context, isXML) {
                if (typeof context.getElementById !== "undefined" && !isXML) {
                    var m = context.getElementById(match[1]);
                    // Check parentNode to catch when Blackberry 4.6 returns
                    // nodes that are no longer in the document #6963
                    return m && m.parentNode ? [m] : [];
                }
            },

            NAME: function (match, context) {
                if (typeof context.getElementsByName !== "undefined") {
                    var ret = [],
                        results = context.getElementsByName(match[1]);

                    for (var i = 0, l = results.length; i < l; i++) {
                        if (results[i].getAttribute("name") === match[1]) {
                            ret.push(results[i]);
                        }
                    }

                    return ret.length === 0 ? null : ret;
                }
            },

            TAG: function (match, context) {
                return context.getElementsByTagName(match[1]);
            }
        },
        preFilter: {
            CLASS: function (match, curLoop, inplace, result, not, isXML) {
                match = " " + match[1].replace(/\\/g, "") + " ";

                if (isXML) {
                    return match;
                }

                for (var i = 0, elem;
                (elem = curLoop[i]) != null; i++) {
                    if (elem) {
                        if (not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0)) {
                            if (!inplace) {
                                result.push(elem);
                            }

                        } else if (inplace) {
                            curLoop[i] = false;
                        }
                    }
                }

                return false;
            },

            ID: function (match) {
                return match[1].replace(/\\/g, "");
            },

            TAG: function (match, curLoop) {
                return match[1].toLowerCase();
            },

            CHILD: function (match) {
                if (match[1] === "nth") {
                    // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
                    // 如果match[2]==even then 2n
                    var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec( match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" || !/\D/.test(match[2]) && "0n+" + match[2] || match[2]);

                    // calculate the numbers (first)n+(last) including if they are negative
                    match[2] = (test[1] + (test[2] || 1)) - 0;
                    match[3] = test[3] - 0;
                }

                // TODO: Move to normal caching system
                match[0] = done++;

                return match;
            },

            ATTR: function (match, curLoop, inplace, result, not, isXML) {
                var name = match[1].replace(/\\/g, "");

                if (!isXML && Expr.attrMap[name]) {
                    match[1] = Expr.attrMap[name];
                }

                if (match[2] === "~=") {
                    match[4] = " " + match[4] + " ";
                }

                return match;
            },

            PSEUDO: function (match, curLoop, inplace, result, not) {
                clog('preFilter PSEUDO: ', match);
                if (match[1] === "not") {
                    // If we're dealing with a complex expression, or a simple one
                    // /^\w/.test(undefined)=>true 这个判断是个坑啊
                    if ((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3])) {
                        console.log(['Ext match3 is : ' , match[3]]);
                        match[3] = Sizzle(match[3], null, null, curLoop);
                        console.log(['Ext match3 Szed is : ' , match[3]]);

                    } else {
                        console.log(['pP.b: ' ]);
                        var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

                        if (!inplace) {
                            result.push.apply(result, ret);
                        }

                        return false;
                    }

                } else if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
                    return true;
                }

                return match;
            },

            POS: function (match) {
                match.unshift(true);

                return match;
            }
        },

        filters: {
            enabled: function (elem) {
                return elem.disabled === false && elem.type !== "hidden";
            },

            disabled: function (elem) {
                return elem.disabled === true;
            },

            checked: function (elem) {
                return elem.checked === true;
            },

            selected: function (elem) {
                // Accessing this property makes selected-by-default
                // options in Safari work properly
                elem.parentNode.selectedIndex;

                return elem.selected === true;
            },

            parent: function (elem) {
                return !!elem.firstChild;
            },

            empty: function (elem) {
                return !elem.firstChild;
            },

            has: function (elem, i, match) {
                return !!Sizzle(match[3], elem).length;
            },

            header: function (elem) {
                return (/h\d/i).test(elem.nodeName);
            },

            text: function (elem) {
                return "text" === elem.type;
            },
            radio: function (elem) {
                return "radio" === elem.type;
            },

            checkbox: function (elem) {
                return "checkbox" === elem.type;
            },

            file: function (elem) {
                return "file" === elem.type;
            },
            password: function (elem) {
                return "password" === elem.type;
            },

            submit: function (elem) {
                return "submit" === elem.type;
            },

            image: function (elem) {
                return "image" === elem.type;
            },

            reset: function (elem) {
                return "reset" === elem.type;
            },

            button: function (elem) {
                return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
            },

            input: function (elem) {
                return (/input|select|textarea|button/i).test(elem.nodeName);
            }
        },
        setFilters: {
            first: function (elem, i) {
                return i === 0;
            },

            last: function (elem, i, match, array) {
                return i === array.length - 1;
            },

            even: function (elem, i) {
                return i % 2 === 0;
            },

            odd: function (elem, i) {
                return i % 2 === 1;
            },

            lt: function (elem, i, match) {
                return i < match[3] - 0;
            },

            gt: function (elem, i, match) {
                return i > match[3] - 0;
            },

            nth: function (elem, i, match) {
                return match[3] - 0 === i;
            },

            eq: function (elem, i, match) {
                return match[3] - 0 === i;
            }
        },
        filter: {
            PSEUDO: function (elem, match, i, array) { var name = match[1],
                    filter = Expr.filters[name];

                if (filter) {
                    return filter(elem, i, match, array);

                } else if (name === "contains") {
                    return (elem.textContent || elem.innerText || Sizzle.getText([elem]) || "").indexOf(match[3]) >= 0;

                } else if (name === "not") {
                    var not = match[3];

                    for (var j = 0, l = not.length; j < l; j++) {
                        if (not[j] === elem) {
                            return false;
                        }
                    }

                    return true;

                } else {
                    Sizzle.error("Syntax error, unrecognized expression: " + name);
                }
            },

            CHILD: function (elem, match) {
                var type = match[1],
                    node = elem;

                switch (type) {
                case "only":
                case "first":
                    while ((node = node.previousSibling)) {
                        if (node.nodeType === 1) {
                            return false;
                        }
                    }

                    if (type === "first") {
                        return true;
                    }

                    node = elem;

                case "last":
                    while ((node = node.nextSibling)) {
                        if (node.nodeType === 1) {
                            return false;
                        }
                    }

                    return true;

                case "nth":
                    var first = match[2],
                        last = match[3];

                    if (first === 1 && last === 0) {
                        return true;
                    }

                    var doneName = match[0],
                        parent = elem.parentNode;

                    if (parent && (parent.sizcache !== doneName || !elem.nodeIndex)) {
                        var count = 0;

                        for (node = parent.firstChild; node; node = node.nextSibling) {
                            if (node.nodeType === 1) {
                                node.nodeIndex = ++count;
                            }
                        }

                        parent.sizcache = doneName;
                    }

                    var diff = elem.nodeIndex - last;

                    if (first === 0) {
                        return diff === 0;

                    } else {
                        return (diff % first === 0 && diff / first >= 0);
                    }
                }
            },

            ID: function (elem, match) {
                return elem.nodeType === 1 && elem.getAttribute("id") === match;
            },

            TAG: function (elem, match) {
                return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
            },

            CLASS: function (elem, match) {
                return (" " + (elem.className || elem.getAttribute("class")) + " ").indexOf(match) > -1;
            },

            ATTR: function (elem, match) {
                var name = match[1],
                    result = Expr.attrHandle[name] ? Expr.attrHandle[name](elem) : elem[name] != null ? elem[name] : elem.getAttribute(name),
                    value = result + "",
                    type = match[2],
                    check = match[4];

                return result == null ? type === "!=" :
                    type === "=" ? value === check :
                    type === "*=" ? value.indexOf(check) >= 0 :
                    type === "~=" ? (" " + value + " ").indexOf(check) >= 0 :
                    !check ? value && result !== false :
                    type === "!=" ? value !== check :
                    type === "^=" ? value.indexOf(check) === 0 :
                    type === "$=" ? value.substr(value.length - check.length) === check :
                    type === "|=" ? value === check || value.substr(0, check.length + 1) === check + "-" :
                    false;
            },

            POS: function (elem, match, i, array) {
                var name = match[2],
                    filter = Expr.setFilters[name];

                if (filter) {
                    return filter(elem, i, match, array);
                }
            }
        }
    };

    var origPOS = Expr.match.POS,
        fescape = function (all, num) {
            return "\\" + (num - 0 + 1);
        };

    for (var type in Expr.match) {
        Expr.match[type] = new RegExp(Expr.match[type].source + (/(?![^\[]*\])(?![^\(]*\))/.source));
        Expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[type].source.replace(/\\(\d+)/g, fescape));
    }

    var makeArray = function (array, results) {
        array = Array.prototype.slice.call(array, 0);

        if (results) {
            results.push.apply(results, array);
            return results;
        }

        return array;
    };

    // Perform a simple check to determine if the browser is capable of
    // converting a NodeList to an array using builtin methods.
    // Also verifies that the returned array holds DOM nodes
    // (which is not the case in the Blackberry browser)
    try {
        Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;

        // Provide a fallback method if it does not work
    } catch (e) {
        makeArray = function (array, results) {
            var i = 0,
                ret = results || [];

            if (toString.call(array) === "[object Array]") {
                Array.prototype.push.apply(ret, array);

            } else {
                if (typeof array.length === "number") {
                    for (var l = array.length; i < l; i++) {
                        ret.push(array[i]);
                    }

                } else {
                    for (; array[i]; i++) {
                        ret.push(array[i]);
                    }
                }
            }

            return ret;
        };
    }

    var sortOrder, siblingCheck;

    if (document.documentElement.compareDocumentPosition) {
        sortOrder = function (a, b) {
            if (a === b) {
                hasDuplicate = true;
                return 0;
            }

            if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                return a.compareDocumentPosition ? -1 : 1;
            }

            return a.compareDocumentPosition(b) & 4 ? -1 : 1;
        };

    } else {
        sortOrder = function (a, b) {
            var al, bl, ap = [], bp = [],
                aup = a.parentNode,
                bup = b.parentNode,
                cur = aup;

            // The nodes are identical, we can exit early
            if (a === b) {
                hasDuplicate = true;
                return 0;

                // If the nodes are siblings (or identical) we can do a quick check
            } else if (aup === bup) {
                return siblingCheck(a, b);

                // If no parents were found then the nodes are disconnected
            } else if (!aup) {
                return -1;

            } else if (!bup) {
                return 1;
            }

            // Otherwise they're somewhere else in the tree so we need
            // to build up a full list of the parentNodes for comparison
            while (cur) {
                ap.unshift(cur);
                cur = cur.parentNode;
            }

            cur = bup;

            while (cur) {
                bp.unshift(cur);
                cur = cur.parentNode;
            }

            al = ap.length;
            bl = bp.length;

            // Start walking down the tree looking for a discrepancy
            for (var i = 0; i < al && i < bl; i++) {
                if (ap[i] !== bp[i]) {
                    return siblingCheck(ap[i], bp[i]);
                }
            }

            // We ended someplace up the tree so do a sibling check
            return i === al ? siblingCheck(a, bp[i], -1) : siblingCheck(ap[i], b, 1);
        };

        siblingCheck = function (a, b, ret) {
            if (a === b) {
                return ret;
            }

            var cur = a.nextSibling;

            while (cur) {
                if (cur === b) {
                    return -1;
                }

                cur = cur.nextSibling;
            }

            return 1;
        };
    }

    // Utility function for retreiving the text value of an array of DOM nodes
    Sizzle.getText = function (elems) {
        var ret = "",
            elem;

        for (var i = 0; elems[i]; i++) {
            elem = elems[i];

            // Get the text from text nodes and CDATA nodes
            if (elem.nodeType === 3 || elem.nodeType === 4) {
                ret += elem.nodeValue;

                // Traverse everything else, except comment nodes
            } else if (elem.nodeType !== 8) {
                ret += Sizzle.getText(elem.childNodes);
            }
        }

        return ret;
    };

    // Check to see if the browser returns elements by name when
    // querying by getElementById (and provide a workaround)
    (function () {
        // We're going to inject a fake input element with a specified name
        var form = document.createElement("div"),
            id = "script" + (new Date()).getTime(),
            root = document.documentElement;

        form.innerHTML = "<a name='" + id + "'/>";

        // Inject it into the root element, check its status, and remove it quickly
        root.insertBefore(form, root.firstChild);

        // The workaround has to do additional checks after a getElementById
        // Which slows things down for other browsers (hence the branching)
        if (document.getElementById(id)) {
            Expr.find.ID = function (match, context, isXML) {
                if (typeof context.getElementById !== "undefined" && !isXML) {
                    var m = context.getElementById(match[1]);

                    return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
                }
            };

            Expr.filter.ID = function (elem, match) {
                var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

                return elem.nodeType === 1 && node && node.nodeValue === match;
            };
        }

        root.removeChild(form);

        // release memory in IE
        root = form = null;
    })();

    // Check to see if the browser returns only elements
    (function () {
        // Check to see if the browser returns only elements
        // when doing getElementsByTagName("*")
        // Create a fake element
        var div = document.createElement("div");
        div.appendChild(document.createComment(""));

        // Make sure no comments are found
        if (div.getElementsByTagName("*").length > 0) {
            Expr.find.TAG = function (match, context) {
                var results = context.getElementsByTagName(match[1]);

                // Filter out possible comments
                if (match[1] === "*") {
                    var tmp = [];

                    for (var i = 0; results[i]; i++) {
                        if (results[i].nodeType === 1) {
                            tmp.push(results[i]);
                        }
                    }

                    results = tmp;
                }

                return results;
            };
        }

        // Check to see if an attribute returns normalized href attributes
        div.innerHTML = "<a href='#'></a>";

        if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" && div.firstChild.getAttribute("href") !== "#") {

            Expr.attrHandle.href = function (elem) {
                return elem.getAttribute("href", 2);
            };
        }

        // release memory in IE
        div = null;
    })();

    // Native selector
    // test add !
    if (!document.querySelectorAll) {
        (function () {
            var oldSizzle = Sizzle,
                div = document.createElement("div"),
                id = "__sizzle__";

            div.innerHTML = "<p class='TEST'></p>";

            // Safari can't handle uppercase or unicode characters when
            // in quirks mode.
            if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
                return;
            }

            Sizzle = function (query, context, extra, seed) {
                context = context || document;

                // Make sure that attribute selectors are quoted
                query = query.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

                // Only use querySelectorAll on non-XML documents
                // (ID selectors don't work in non-HTML documents)
                if (!seed && !Sizzle.isXML(context)) {
                    if (context.nodeType === 9) {
                        try {
                            return makeArray(context.querySelectorAll(query), extra);
                        } catch (qsaError) {}

                        // qSA works strangely on Element-rooted queries
                        // We can work around this by specifying an extra ID on the root
                        // and working up from there (Thanks to Andrew Dupont for the technique)
                        // IE 8 doesn't work on object elements
                    } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                        var old = context.getAttribute("id"),
                            nid = old || id;

                        if (!old) {
                            context.setAttribute("id", nid);
                        }

                        try {
                            return makeArray(context.querySelectorAll("#" + nid + " " + query), extra);

                        } catch (pseudoError) {} finally {
                            if (!old) {
                                context.removeAttribute("id");
                            }
                        }
                    }
                }

                return oldSizzle(query, context, extra, seed);
            };

            for (var prop in oldSizzle) {
                Sizzle[prop] = oldSizzle[prop];
            }

            // release memory in IE
            div = null;
        })();
    }

    (function () {
        var html = document.documentElement,
            matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector,
            pseudoWorks = false;

        try {
            // This should fail with an exception
            // Gecko does not error, returns false instead
            matches.call(document.documentElement, "[test!='']:sizzle");

        } catch (pseudoError) {
            pseudoWorks = true;
        }

        if (matches) {
            Sizzle.matchesSelector = function (node, expr) {
                // Make sure that attribute selectors are quoted
                expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

                if (!Sizzle.isXML(node)) {
                    try {
                        if (pseudoWorks || !Expr.match.PSEUDO.test(expr) && !/!=/.test(expr)) {
                            return matches.call(node, expr);
                        }
                    } catch (e) {}
                }

                return Sizzle(expr, null, null, [node]).length > 0;
            };
        }
    })();

    (function () {
        var div = document.createElement("div");

        div.innerHTML = "<div class='test e'></div><div class='test'></div>";

        // Opera can't find a second classname (in 9.6)
        // Also, make sure that getElementsByClassName actually exists
        if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
            return;
        }

        // Safari caches class attributes, doesn't catch changes (in 3.2)
        div.lastChild.className = "e";

        if (div.getElementsByClassName("e").length === 1) {
            return;
        }

        Expr.order.splice(1, 0, "CLASS");
        Expr.find.CLASS = function (match, context, isXML) {
            if (typeof context.getElementsByClassName !== "undefined" && !isXML) {
                return context.getElementsByClassName(match[1]);
            }
        };

        // release memory in IE
        div = null;
    })();

    function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
        for (var i = 0, l = checkSet.length; i < l; i++) {
            var elem = checkSet[i];

            if (elem) {
                var match = false;
                elem = elem[dir];
                while (elem) {
                    if (elem.sizcache === doneName) {
                        match = checkSet[elem.sizset];
                        break;
                    }
                    if (elem.nodeType === 1 && !isXML) {
                        elem.sizcache = doneName;
                        elem.sizset = i;
                    }
                    if (elem.nodeName.toLowerCase() === cur) {
                        match = elem;
                        break;
                    }
                    elem = elem[dir];
                }
                checkSet[i] = match;
            }
        }
    }

    function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
        for (var i = 0, l = checkSet.length; i < l; i++) {
            var elem = checkSet[i];

            if (elem) {
                var match = false;

                elem = elem[dir];

                while (elem) {
                    if (elem.sizcache === doneName) {
                        match = checkSet[elem.sizset];
                        break;
                    }

                    if (elem.nodeType === 1) {
                        if (!isXML) {
                            elem.sizcache = doneName;
                            elem.sizset = i;
                        }

                        if (typeof cur !== "string") {
                            if (elem === cur) {
                                match = true;
                                break;
                            }

                        } else if (Sizzle.filter(cur, [elem]).length > 0) {
                            match = elem;
                            break;
                        }
                    }

                    elem = elem[dir];
                }

                checkSet[i] = match;
            }
        }
    }

    if (document.documentElement.contains) {
        Sizzle.contains = function (a, b) {
            return a !== b && (a.contains ? a.contains(b) : true);
        };

    } else if (document.documentElement.compareDocumentPosition) {
        Sizzle.contains = function (a, b) {
            return !!(a.compareDocumentPosition(b) & 16);
        };

    } else {
        Sizzle.contains = function () {
            return false;
        };
    }

    Sizzle.isXML = function (elem) {
        // documentElement is verified for cases where it doesn't yet exist
        // (such as loading iframes in IE - #4833) 
        var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

        return documentElement ? documentElement.nodeName !== "HTML" : false;
    };

    var posProcess = function (selector, context) {
        var match, tmpSet = [],
            later = "",
            root = context.nodeType ? [context] : context;

        //test
        console.group('Process Loop context');
        clog('Process arg: ', selector, context);

        // Position selectors must be done after the filter
        // And so must :not(positional) so we move all PSEUDOs to the end
        while ((match = Expr.match.PSEUDO.exec(selector))) {
            later += match[0];
            selector = selector.replace(Expr.match.PSEUDO, "");
        }

        selector = Expr.relative[selector] ? selector + "*" : selector;

        for (var i = 0, l = root.length; i < l; i++) {
            Sizzle(selector, root[i], tmpSet);
        }

        clog('Processed unFilter: ' , tmpSet);
        var enixTemp =  Sizzle.filter(later, tmpSet);
        if(later){
            clog('Processed Filtered with : (' + later + ')', enixTemp);
        }
        console.groupEnd();

        return enixTemp ;
        //return Sizzle.filter(later, tmpSet);
    };

    // EXPOSE
    jQuery.find = Sizzle;
    jQuery.expr = Sizzle.selectors;
    jQuery.expr[":"] = jQuery.expr.filters;
    jQuery.unique = Sizzle.uniqueSort;
    jQuery.text = Sizzle.getText;
    jQuery.isXMLDoc = Sizzle.isXML;
    jQuery.contains = Sizzle.contains;

    // for search function definition
    C.S = arguments.callee ;

})();

// add by enix
window.$ = jQuery ;
