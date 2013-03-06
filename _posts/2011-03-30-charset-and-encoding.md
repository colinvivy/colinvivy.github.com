---
layout: post
title: 字符集和编码方式
keywords: Javascript charset encoding
category: Front-end
excerpt: 什么是字符集和字符编码,根据wiki对现代字符集的定义，字符集是一个字符序列，将一个字符集对应到一指定集合中某一东西（比如自然数序列）的过程称之为字符集编码（比如将拉丁字母编码成ASCII字符集），这样的一个字符集和对应的自然数序列叫做编码字符集。比如字母“A”对应的整数是65，“B”对应的整数为66。通常将字符集通俗的理解为字符和数字的对应表。
---

根据wiki对现代字符集的定义，字符集是一个字符序列，将一个字符集对应到一指定集合中某一东西（比如自然数序列）的过程称之为字符集编码（比如将拉丁字母编码成ASCII字符集），这样的一个
字符集和对应的自然数序列叫做编码字符集。比如字母“A”对应的整数是65，“B”对应的整数为66。通常将字符集通俗的理解为字符和数字的对应表。

###字符集的历史

为了更形象描述字符集，这里引用一部分资料上的历史：

###起源及ASCII的诞生

很久以前，一群人用八个可以开合的晶体管来组成不同状态来表示万物，这样的一个字节(byte)就可以表示256种字符(2^8)，他们把前32种状态叫做控制码，控制码有特殊的用途，比如打印机遇
到0×10就输出换行等。这样，他们继续把大小写字母、数字和标点符号都用字节的各种状态来表示，一直排到了127位，这样计算机就可以用存储英文数据。当时计算机普及率很低，这样的方案
看起来很不错，于是大家把这种方案叫做ANSI的ASCII(Aemerican Standard Code for Information Interchange)编码。

随后，世界上其他国家的人也开始使用计算机，他们发现ASCII里面没有想要的字符，于是把127位之后的空位来表示他们所需的新字符和符号，这样一直排到了255号，128-255之间的字符称为扩展字符集。

###GB2312字符集

到中国人开始使用计算机时，已经没有位置来表示中文字符，于是亲们把127位以后的字符废除掉，并规定：127位之前和ASCII字符集一样，127位后，每两个字节表示一个汉字（前后两字节叫做高字节和低字节），这样大部分简体汉字都可以表示了，另外还把字母、数字和标点符号都重新收编了一次，这就是所谓的“全角字符”。这种字符集叫做GB2312，它是对ASCII的中文扩展。（以
前常听程序员默念：一个汉字的长度等于2个英文字符的长度）

###GBK和GB18030字符集的由来

随着计算机的普及，中国人发现还有好多繁体字没法表示呢！于是再次取消低字节大于127位的限制，只要是第一个字节大于127位就表示这是一个汉字的开始，这种方案叫做GBK字符集，它完整包含了GB2312字符集，还增加了很多繁体字和特殊符号。再后来，少数民族也用电脑了，还得给照顾他们，于是在GBK的基础上又增加了很多少数民族的文字，这样GB18030字符集便诞生了。GB2312，GBK，GB18030通称DBCS(Double Byte Character Set双字节字符集)

###想一统宇宙的Unicode

当时，很多国家都搞出一套自己的字符集方案，这就给信息交换带来了不少麻烦。于是ISO决定解决这个问题：废除所有地区性字符集，制定了一套囊括所有字符的字符集。即Universal Multiple-Octet Coded Character Set，简称UCS，俗称Unicode。

###关于Unicode字符集

Unicode规定：统一使用双字节(16位)来表示一个字符，对于ASCII的字符，编码序号保持不变，只是由原来的8位扩展到16位(在存储海量数据时有浪费空间的诟病)，其他的文字和符号全部重新
编码。Unicode用UTF(Unicode Transformation Format)来实现，UTF-8即每次编码8个字节。

###关于UTF-8

UTF-8（8-bit Unicode Transformation Format）是一种针对Unicode的可变长度字符编码，关于UTF-8编码方式，可以通过下面的表描述：

    U+00000000 – U+0000007F:    0xxxxxxx
    U+00000080 – U+000007FF:    110xxxxx 10xxxxxx
    U+00000800 – U+0000FFFF:    1110xxxx 10xxxxxx 10xxxxxx
    U+00010000 – U+001FFFFF:    11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
    U+00200000 – U+03FFFFFF:    111110xx 10xxxxxx 10xxxxxx 10xxxxxx  10xxxxxx
    U+04000000 – U+7FFFFFFF:    1111110x 10xxxxxx 10xxxxxx 10xxxxxx  10xxxxxx 10xxxxxx
    //ps: Unicode在范围D800-DFFF中不存在任何字符

第一行的意思是：如果遇到0xxxxxxx(以0开头)的UTF8编码，则说明这是单字节表示的ASCII字符（0×00-0×7F）。

在一长串二进制中，有可能2-6个字节来表示一个字符，这样的话就需要额外的信息来描述多字节字符
的起始位置(starter)，以及字节的长度(length)

接下来的几行表明：如果遇到10xxxxxx(以10开头)的字节，说明这是一个非ASCII字符中的一个字节，并且不是该字符的第一个字节编码。那么，除去以0和10开头的字节都是字符的首字节了。如果字节是110开头就表示这是一个两字节字符，如果是1110，就表示这是一个三字节字符…以此类推，可以看出首字节的1的个数就表示这个字符占有的字节个数(length)。

###UTF-8编码示例

看明白这个表以后，举例说明下字符的UTF-8编码。以“零”这个汉字为例：

“零”的unicode码是38646，对应十六进制码是ox96f6。转换成二进制为1001011011110110。根据上面的理论，“零”（0×96f6）在U+0800-U+FFFF区间内，需要用三个字节编码，把这些二进制码拆分放到“1110xxxx 10xxxxxx 10xxxxxx”各个x处（从低位往高位放，高位不足补0），组合得11101001 10011011 10110110，“零”就是以这样的二进制字节流存储和传输的。

把上面得到的三个二进制数转换成十六进制，可得：0xE9,0×9B,0xB6，然后我们在javascript中用encodeURI方法对“零”编码，得到%E9%9B%B6，很眼熟吧，就是前面的3个二进制数的十六进制表示。（encodeURI是一种percent encoding，ECMA262上有记载，但据说该编码没有通过w3标准）

    // 说明：零的unicode为38646， 38646 == ox96F6 == 1001011011110110
    var z = '零' ;
    console.log(parseInt('11101001', 2).toString(16)); //输出 e9
    console.log(parseInt('10011011', 2).toString(16)); //输出 9b
    console.log(parseInt('10110110', 2).toString(16)); //输出 b6

    console.log(encodeURI(z).replace(/%/gi, '  ')); //输出 e9 9b b6

###HTML和Javascript中使用Unicode

HTML和Javascript都是支持Unicode字符集的，所以你可以在HTML中直接使用Unicode码来表示字符，符号实体就是这样的应用。比如我们用">"或者">"来表示">"，前一种方式叫做符号实体，后一种方式叫做实体编号。

    // 说明：零的unicode为38646， 38646 == ox96F6 == 1001011011110110
    // 以下HTML语言在浏览器中会输出两个 零
    <strong>&#38646;</strong>
    <strong>&#x96f6;</strong>
    // use unicode character in CSS
    .test {color:\25c6 ;}

    var z = '零' ;
    // 在javascript也可以直接是用unicode码来表示字符
    console.log('\u96f6') ;  //输出 零
    console.log(String.fromCharCode('38646')); //输出 零

    // 查看“零”的Unicode码和十六进制码
    console.log(z.charCodeAt(0)); //输出 38646
    console.log(z.charCodeAt(0).toString(16)); //输出 96f6

    // escape编码——percent encoding，返回百分比格式的十六进制
    console.log(escape(z)); //输出 %u96f6


###参考：

- http://en.wikipedia.org/wiki/Charset
- http://en.wikipedia.org/wiki/Character
- http://en.wikipedia.org/wiki/Unicode
- http://en.wikipedia.org/wiki/Utf-8
- http://stauren.net/log/fpev3c89q.html
