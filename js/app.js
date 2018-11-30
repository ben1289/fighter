//常用元素和变量
var $body = $(document.body);

//全局音量开关标识
var isMusic = true;

//画布相关
var $canvas = $('#game');
var canvas = $canvas.get(0);
var context = canvas.getContext("2d");
//设置画布的宽度和高度
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//获取画布相关信息
var canvasWidth = canvas.clientWidth;
var canvasHeight = canvas.clientHeight;

//判断是否有requestAnimationFrame方法，如果有则模拟实现
window.requestAnimFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function(callback){
    window.setTimeout(callback, 1000 / 30);
};

/**
 * 基本事件绑定
 */
function bindEvent(){
    //绑定事件
    var self = this;
    
    //点击任意按钮
    $body.on('click','button',function(){
        click_btn();
    });

    //点击开始按钮
    $body.on('click','.js-start',function(){
        $body.attr('data-status','start');
        if(isMusic)
            $("#bg_music")[0].src="./sound/game_music.mp3"
        //开始游戏
        //GAME.start();
    });

    //点击说明按钮
    $body.on('click','.js-rule',function(){
        $body.attr('data-status','rule');
    });

    //点击设置按钮
    $body.on('click','.js-setting',function(){
        $body.attr('data-status','setting');
    });

    //点击我知道了按钮
    $body.on('click','.js-confirm-rule',function(){
        $body.attr('data-status','index');
    });

    //点击确认设置按钮
    $body.on('click','.js-confirm-setting',function(){
        $body.attr('data-status','index');
        var music = $("#music option:selected");
        var background = $("#background option:selected");//获取选中的选项
        var plane = $("#plane option:selected");
        set_music(music.val());
        set_bg(background.val());
        //确认设置
        //GAME.init();
    });
}

//给点击按钮添加音效
function click_btn()
{
    if(isMusic)
        $("#temp_music").attr("src", "./sound/button.mp3");
}

//设置音乐开关
function set_music(flag)
{
    //[0]是返回DOM对象，注意jQuery返回的是jQuery对象，document.getElementById返回的才是DOM对象。
    var audio = $("#bg_music")[0];
    if(flag == 0)//  0是开  1是关
    {
        audio.play();
        isMusic = true;
    }
    else
    {
        audio.pause();
        audio.currentTime = 0;
        isMusic = false;
    }
}

//设置背景更换
function set_bg(opt)
{
    var arr = CONFIG.resources.bg_images;
    $.each(arr,function(i,val)
    {
        if(val.name == opt)
            $body.css("background-image","url("+val.src+")");
    });
}

/**
 * 游戏对象
 */
var GAME = {
    /**
     * 游戏初始化
     */
    init: function(opts){
        //设置opts
        var opts = Object.assign({}, opts, CONFIG);
        this.opts = opts;

        //计算飞机初始坐标
        this.planePosX = canvasWidth / 2 - opts.planeSize.width / 2;
        this.planePosY = canvasHeight - opts.planeSize.height - 50;
    },
    /**
     * 游戏开始需要设置
     */
    start:function(){

    },
    update:function(){

    },
    end:function(){

    },
    draw:function(){

    }
};

/**
 * 页面主入口
*/
function init(){
    GAME.init();
    bindEvent();
}

init();