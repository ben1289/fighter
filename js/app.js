// 常用元素和变量
var $body = $(document.body);

// 全局音量开关标识、主角类型、分数
var isMusic = true;
var planeType = "bluePlaneIcon";
var score = 0;

// 画布相关
var $canvas = $('#game');
var canvas = $canvas.get(0);
var context = canvas.getContext("2d");
// 设置画布的宽度和高度
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// 获取画布相关信息
var canvasWidth = canvas.clientWidth;
var canvasHeight = canvas.clientHeight;

// 判断浏览器是否兼容requestAnimationFrame方法，如果不兼容则模拟实现
window.requestAnimFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function(callback){
    window.setTimeout(callback, 1000 / 60);
};

/**
 * 基本事件绑定
 */
function bindEvent(){
    // 绑定事件
    var self = this;
    
    // 点击任意按钮
    $body.on('click','button',function(){
        click_btn();
    });

    // 点击开始按钮（重新开始按钮）
    $body.on('click','.js-start',function(){
        $body.attr('data-status','start');
        if(isMusic)
            $("#bg_music")[0].src="./sound/game_music.mp3"
        // 开始游戏
        GAME.start();
        // 绑定手指事件
        GAME.bindTouchAction();
    });

    // 点击说明按钮
    $body.on('click','.js-rule',function(){
        $body.attr('data-status','rule');
    });

    // 点击设置按钮
    $body.on('click','.js-setting',function(){
        $body.attr('data-status','setting');
    });

    // 点击我知道了按钮（返回大厅按钮）
    $body.on('click','.js-confirm-rule',function(){
        $body.attr('data-status','index');
    });

    // 点击确认设置按钮
    $body.on('click','.js-confirm-setting',function(){
        $body.attr('data-status','index');
        var plane = $("#plane option:selected").val();
        if(plane === 0) {
            planeType = "bluePlaneIcon";
        } else {
            planeType = "pinkPlaneIcon";
        }
        //确认设置
        GAME.init();
    });
}

// 给点击按钮添加音效
function click_btn()
{
    if(isMusic)
        $("#btn_music")[0].play();
        //$("#temp_music").attr("src", "./sound/button.mp3");
}

// 设置音乐开关
function set_music()
{
    var music = $("#music option:selected").val();
    // [0]是返回DOM对象，注意jQuery返回的是jQuery对象，document.getElementById返回的才是DOM对象。
    var audio = $("#bg_music")[0];
    if(music == 0)//  0是开  1是关
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
    click_btn();
}

// 设置背景更换
function set_bg()
{
    var background = $("#background option:selected").val();
    var arr = CONFIG.resources.bg_images;
    $.each(arr,function(i,val)
    {
        if(val.name == background)
            $body.css("background-image","url("+val.src+")");
    });
    click_btn();
}

/**
 * 游戏对象
 */
var GAME = {
    /**
     * 游戏初始化
     */
    init: function(opts){
        // 设置opts
        var opts = Object.assign({}, opts, CONFIG);
        this.opts = opts;

        // 计算飞机初始坐标
        this.planePosX = canvasWidth / 2 - opts.planeSize.width / 2;
        this.planePosY = canvasHeight - opts.planeSize.height - 50;
    },
    /**
     * 游戏开始需要设置
     */
    start: function() {
        // 获取游戏初始化 level
        var self = this; // 保存函数调用对象 (即Game)
        var opts = this.opts;
        var images = this.images;
        // 清空射击目标对象数组和分数设置为 0
        this.enemies = [];
        this.score = 0;
        // 随机生成大小敌机
        this.createBigEnemyInterVal = setInterval(function () {
            self.createEnemy('big');
        }, 4500);
        this.createSmallEnemyInterVal = setInterval(function () {
            self.createEnemy('normal');
        }, 300);

        // 创建主角战机
        this.plane = new Plane({
            x: this.planePosX,
            y: this.planePosY,
            width: opts.planeSize.width,
            height: opts.planeSize.height,
            // 子弹尺寸速度
            bulletSize: opts.bulletSize,
            bulletSpeed: opts.bulletSpeed,
            // 图标相关
            icon: resourceHelper.getImage(planeType),
            bulletIcon: resourceHelper.getImage('fireIcon'),
            boomIcon: resourceHelper.getImage('enemyBigBoomIcon')
        });
        // 飞机开始射击
        this.plane.startShoot();

        // 开始更新游戏
        this.update();
    },
    update: function() {
        var self = this;
        var opts = this.opts;
        // 更新飞机、敌人
        this.updateElement();
        // 先清理画布
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        if(this.plane.status === 'boomed') {
            this.end();
            return;
        }

        // 绘制画布
        this.draw();
        // 不断循环 update
        requestAnimationFrame(function(){
            self.update();
        });
    },
    /**
     * 更新当前所有敌机状态
     */
    updateElement: function() {
        var opts = this.opts;
        var enemySize = opts.enemySize;
        var enemies = this.enemies;
        var plane = this.plane;
        var i = enemies.length;

        if(plane.status === 'booming') {
            plane.booming();
            return;
        }

        // 循环更新敌机
        while (i--) {
            var enemy = enemies[i];
            enemy.down();
            if(enemy.y >= canvasHeight) {
                this.enemies.splice(i, 1);
            } else {
                // 判断飞机状态
                if(plane.status === 'normal') {
                    if(plane.hasCrash(enemy)) {
                        plane.booming();
                    }
                }
                // 根据敌机状态判断是否被击中
                switch(enemy.status) {
                    case 'normal':
                        if(plane.hasHit(enemy)) {
                            enemy.live -= 1;
                            if(enemy.live === 0) {
                                enemy.booming();
                                if(enemy.enemyType === 'big') {
                                    score += 1000;
                                } else {
                                    score += 100;
                                }
                            }
                        }
                        break;
                    case 'booming':
                        enemy.booming();
                        break;
                    case 'boomed':
                        enemies.splice(i, 1);
                        break;
                }
            }
        }
    },

    /**
     * 绑定手指触摸
     */
    bindTouchAction: function() {
        var opts = this.opts;
        var self = this;
        // 飞机极限横纵坐标
        var palneMinX = 0;
        var palneMinY = 0;
        var planeMaxX = canvasWidth - opts.planeSize.width;
        var planeMaxY = canvasHeight - opts.planeSize.height;
        // 手指初始位置坐标
        var startTouchX;
        var startTouchY;
        // 飞机初始位置
        var startPlaneX;
        var startPlaneY;

        // 首次触屏
        $canvas.on('touchstart', function(e) {
            var plane = self.plane;
            // 记录首次触摸位置
            startTouchX = e.touches[0].clientX;
            startTouchY = e.touches[0].clientY;
            // console.log('touchstart', startTouchX, startTouchY);
            // 记录飞机的初始位置
            startPlaneX = plane.x;
            startPlaneY = plane.y;
        });
        // 滑动屏幕
        $canvas.on('touchmove', function(e) {
            var newTouchX = e.touches[0].clientX;
            var newTouchY = e.touches[0].clientY;
            // console.log('touchmove', newTouchX, newTouchY);
            // 新的飞机坐标等于手指滑动的距离加上飞机初始位置
            var newPlaneX = startPlaneX + newTouchX - startTouchX;
            var newPlaneY = startPlaneY + newTouchY - startTouchY;
            // 判断是否超出位置
            if(newPlaneX < palneMinX)
                newPlaneX = palneMinX;
            if(newPlaneY < palneMinY)
                newPlaneY = palneMinY;
            if(newPlaneX > planeMaxX)
                newPlaneX = planeMaxX;
            if(newPlaneY > planeMaxY)
                newPlaneY = planeMaxY;
            // 更新飞机的位置
            self.plane.setPosition(newPlaneX, newPlaneY);
            // 禁止默认事件，防止滚动屏幕
            e.preventDefault();
        });
    },
    
    /**
     * 生成敌机
     */
    createEnemy: function(enemyType) {
        var enemies = this.enemies;
        var opts = this.opts;
        var images = this.images || {};
        var enemySize = opts.enemySmallSize;
        var enemySpeed = opts.enemySpeed;
        var enemyIcon = resourceHelper.getImage('enemySmallIcon');
        var enemyBoomIcon = resourceHelper.getImage('enemySmallBoomIcon');
        var enemyLive = 1;
        // 大型敌机参数
        if(enemyType === 'big') {
            enemySize = opts.enemyBigSize;
            enemySpeed = opts.enemySpeed * 0.6;
            enemyIcon = resourceHelper.getImage('enemyBigIcon');
            enemyBoomIcon = resourceHelper.getImage('enemyBigBoomIcon');
            enemyLive = 10;
        }
        // 综合元素的参数
        var initOpt = {
            x: Math.floor(Math.random() * (canvasWidth - enemySize.width)),
            y: -enemySize.height,
            enemyType: enemyType,
            live: enemyLive,
            width: enemySize.width,
            height: enemySize.height,
            speed: enemySpeed,
            icon: enemyIcon,
            boomIcon: enemyBoomIcon
        }
        // 敌机的数量不大于最大值则新增
        if (enemies.length < opts.enemyMaxNum) {
            enemies.push(new Enemy(initOpt));
        }
        // console.log(enemies);
    },
    end:function() {
        clearInterval(this.createBigEnemyInterVal);
        clearInterval(this.createSmallEnemyInterVal);
        //TODO: 待加分
        $("#score").html("您已阵亡 !<br/>本次得分 : " + score);
        $body.attr('data-status','over');
    },
    draw:function() {
        this.enemies.forEach(function(enemy) {
            enemy.draw();
        });
        this.plane.draw();
    }
};

/**
 * 页面主入口
*/
function init(){
    // 加载图片资源，加载完成才能交互
    resourceHelper.load(CONFIG.resources, function(resources){
        // 加载完成
        GAME.init();
        bindEvent();
    });
}

init();