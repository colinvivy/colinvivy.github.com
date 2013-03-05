---
layout: post
title: Editplus一键同步到FTP
keywords: Javascript edptplus
category: PHP
excerpt: 在Dreamweaver中，可以将正在编辑的文件一键同步到FTP服务器中，很是便利。如果Editplus也能快捷同步就好了，想到在Editplus可以调用外部程序或者命令，于是用php写了个同步到FTP的脚本文件，并作为工具添加到Editplus中。
---

[imgEp1]: /img/editplus-sync1.jpg
[imgEp2]: /img/editplus-sync2.jpg
[imgEp3]: /img/editplus-sync3.jpg

在Dreamweaver中，可以将正在编辑的文件一键同步到FTP服务器中，很是便利。如果Editplus也能快捷同步就好了，想到在Editplus可以调用外部程序或者命令，于是用php写了个同步到FTP的脚本文件，并作为工具添加到Editplus中。

原理很简单：首先定义FTP的相关参数，比如主机名，用户名，密码等；再指定FTP的路径和本地环境的路径，以便于将本地环境中的文件上传到FTP上对应路径，然后通过php的相关函数连接FTP服务器，并上传文件。

脚本配置很简单（脚本地址在文章底部，当然你可以去googleCode上获取）：

    <?php
    // 定义FTP参数
    $ftp_host = '192.168.0.1';
    $ftp_user = 'username';
    $ftp_pass = 'password';
    $ftp_port = 21;
    $pasv_mode = true;

    // 定义开发环境路径
    $remote_root_dir = '/domains/xxx.com/public_html/blog' ;

    // 定义本地上传路径(此路径等价于开发环境路径)
    $local_root_path = 'D:/www/blog' ;

接下来在Editplus中添加这个脚本，点击菜单栏的“工具”——“参数”，添加一个工具（类型选择“程序”）：
1. “菜单文本”这栏填写“Ftp”之类皆可；
2. “命令”这栏选择php.exe的路径；
3. “参数”这栏：<-f d:/ftpUpload.php -- -f $(FilePath)> （尖括号里面的内容，其中d:/ftpUpload.php就是php脚本的放置位置，我放在D盘根目录下的。后面的直接Copy过去）
4. 最后，把下面的“捕获输出”勾上

如图：
![Editplus sync][imgEp1]

配置好之后，来测试下，打开“本地上传路径”下的一个文件，随意修改下，然后按下 ctrl + 1 (工具的位置拍在第一个就是ctrl+1)，如图：

![Editplus sync][imgEp2]

此时在Editplus的输出窗口就可以看到结果“uploaded”，如图：
![Editplus sync][imgEp3]
