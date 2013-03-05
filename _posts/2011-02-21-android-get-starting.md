---
layout: post
title: Android开发环境搭建
keywords: android 
category: Other
excerpt: 零基础开始搭建Android开发环境，我们开始吧...
---

零基础开始搭建Android开发环境，我们开始吧：

###先理解这些名词

JDK：Java Development Kit（Java开发工具包）
SDK：Software Development Kit（软件开发工具包）
下载必备软件

下载JDK
下载Eclipse
下载Android SDK 1.6，可能需要翻墙
下载Android SDK Setup，可能需要翻墙
安装并配置JDK

双击Java安装文件，可以安装到默认路径，亦可自己选择路径，我这里安装到C:/Java/jdk/目录下。然后配置环境变量：

1. 设置JAVA路径

打开“控制面板”-“系统”-“高级”-“环境变量”，在打开的对话框中的”系统变量”下方点”新建”，在对话框
中的“变量名”中填写“JAVA_HOME”，值为”C:\Java\jkd\”，点“确定”。

2. 设置CLASS路径

再新建一个系统变量，变量名为CLASSPATH，值为.;%JAVA_HOME%\lib;%JAVA_HOME%\lib\toojs.jar;。

3. 设置PATH路径

PATH变量一般系统中已存在，所以选择PATH变量，点击“编辑”，在变量值的最后面加上;%JAVA_HOME%\bin;%JAVA_HOME\jre\bin;。

JDK配置完毕，测试下，在命令行中输入“java -verison”，即可看到当前Java的版本信息。

###安装并配置SDK 1.6

先解释下这里为什么要安装SDK1.6，而不是SDK2.2或者更高。据测试官方提供的SDK2.2的安装包缺少adb.exe文件，因此在eclipse中无法指定SDK的位置。所以只能先
安装SDK 1.6，然后再升级到所需要的版本(后面步骤会有提到)。

解压SDK到D:\SDK\(任意目录皆可)，配置环境变量：

1. 设置Android路径

如配置JAVA环境变量的步骤一样，新建一个系统变量，变量名为Android_home，变量值为SDK的路径，D:\SDK\

2. 设置PATH路径

编辑PATH变量，在值后面加上;%Android_home%\tools。

SDK配置完毕，在命令行中输入“Android -help”就能看到相关帮助信息。

解压Eclipse，安装ADT，关联SDK

解压Eclipse，双击eclipse.exe

安装ADT：在菜单栏，选择”help”-”install new software”，在打开的对话框中点击Add按钮，在名称处输入
ADT，在地址中输入http://dl-ssl.google.com/android/eclipse/ ，执行install操作安装ADT插件

关联SDK：重启Eclipse，在菜单栏选择”Window”-”Preferences”，在对话框中点击Android，点击右侧的
Browse按钮选择SDK的目录(D:\SDK\)，点击”确定”。

通过SDK Setup更新SDK

把SDK Setup解压到SDK的根目录下(D:\SDK\)，双击SDK setup.exe，启动Andriod SDK and AVD Manager，选中左侧setting，在右侧选择”Force `https://xxx` to be fetched using `http://”`，选择”save & apply”，选择所需要的更新内容，比如我这里选了3项

1. Android SDK Tools, revision 5
2. SDK Platform Android 2.1, API 7 revision 1
3. Sapmles for SDK API 7, revision 1

若更新中有提示目录被占用，请尝试关闭杀毒软件再进行更新。更新完毕之后，Android开发环境就搭建好了。
