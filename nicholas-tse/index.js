/**
 * filename.js
 *
 * @author alextang<colinvivy#gmail.com>
 * @date
 * @link   http://icolin.org/
 */

var $id = function (e) {return document.getElementById(e);} ;

function gutter (x) {
    var elGutter = $id('gutter'),
        screenW = window.screen.availWidth ,
        screenH = document.documentElement.clientHeight ,
        niceW = 0 ,
        niceH = 0 ;
    niceW = Math.floor(screenW / 100) * 100 ;
    niceH = Math.ceil(screenH / 100) * 100 ;

    //elGutter.style.width = niceW + 'px' ;
    elGutter.style.height = screenH + 'px' ;

    // content
    //$id('content').style.top = 

    for (var i = 100; i < screenW; i+=100) {
        var tempNode = document.createElement('i');
        tempNode.className = 'gt_v';
        tempNode.style.left = i + 'px' ;
        elGutter.appendChild(tempNode) ;
    };
    var restW = i - screenW ;
    elGutter.style.left = '-' + (restW/2) + 'px';

    for (i = 100; i < niceH; i+=100) {
        var tempNode = document.createElement('i');
        tempNode.className = 'gt_h';
        tempNode.style.top = i + 'px' ;
        elGutter.appendChild(tempNode) ;
    };

    // content
    var elContent = $id('content');
    for (var i = 0; i < 800; i+=100) {
        var tempNode = document.createElement('i');
        tempNode.className = 'gt_v';
        tempNode.style.left = i + 'px' ;
        elContent.appendChild(tempNode) ;
    };
    for (i = 0; i < 400; i+=100) {
        var tempNode = document.createElement('i');
        tempNode.className = 'gt_h';
        tempNode.style.top = i + 'px' ;
        elContent.appendChild(tempNode) ;
    };

}

// show img
function imgRun() {
    var elTrigger = $id('imgTrigger'),
        elImg = $id('imgShow');

    elTrigger.onmousemove = function (e) {
        e = window.event || e ;
        var evt = e.srcElement || e.target ;
        elImg.src = evt.src.replace('-thumb', '') ;
    }
}


$(document).ready(function () {
    gutter();
    imgRun();

    $("ul[data-liffect] li").each(function (i) {
        $(this).attr("style", "-webkit-animation-delay:" + i * 200 + "ms");
        if (i == $("ul[data-liffect] li").size() -1) {
            $("ul[data-liffect]").addClass("play")
        }
    });
});

