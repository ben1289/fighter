// 常用元素和变量
var $body = $(document.body);

// 全局音量开关标识、游戏分数、游戏时长、是否正常死亡
var isMusic = true, isDie = false, isHidden = false, isShoot = false;
var score = 0;
var gameTime = 0;
// 战机： 0 蓝色  1 粉色  3 黄色  4 橙色
var mainPalne = [ ['PlaneIcon101','PlaneIcon102','PlaneIcon103','PlaneIcon104'], ['PlaneIcon201','PlaneIcon202','PlaneIcon203','PlaneIcon204'], ['PlaneIcon301','PlaneIcon302','PlaneIcon303','PlaneIcon304'], ['PlaneIcon401','PlaneIcon402','PlaneIcon403','PlaneIcon404'] ];
var planeType = 0;
// 敌机： 0 大型  1 中型  2 小型
var enemyPlane = [ ['enemyBigIcon01','enemyBigIcon02','enemyBigIcon03','enemyBigIcon04','enemyBigIcon05','enemyBigIcon06','enemyBigIcon07'], ['enemyMediumIcon01','enemyMediumIcon02','enemyMediumIcon03'], ['enemySmallIcon01','enemySmallIcon02','enemySmallIcon03','enemySmallIcon04','enemySmallIcon05'] ];
// 子弹
var bullet_icon = new Array('fireIcon01', 'fireIcon02', 'fireIcon03', 'fireIcon04');
// 爆炸
var boom_icon = new Array('enemyBigBoomIcon', 'enemyMediumBoomIcon', 'enemySmallBoomIcon');
// 击中特效
var effect_icon = new Array('effectIcon01', 'effectIcon02', 'effectIcon03', 'effectIcon04');
// 难度： 0 一级  1 二级  2 三级  3 四级
var level = 0, level_bak = level, up;
// 飞机等级  子弹威力
var plane_bullet = new Array(1, 2, 3, 4);
// 子弹大小
var bullet_size = new Array(20, 30, 40, 50);
// 子弹速度: 10 13 17 20
// var bullet_speed = new Array(0, 3, 7, 0);
// 射击频率
// var fire_rate = new Array(150, 145, 140, 135)
// 特效尺寸
var effect_size = [ [16, 16], [40.8, 16], [53.6, 16], [66.4, 16] ];
// 敌机数量： 8{5，2，1}  12{7，4，1}  16{9，5，2}  20{10，6，4}
var enemy_max_num = new Array(0, 4, 8, 12);
// 敌机产出速度： 0 一级  1 二级  2 三级  3 四级
var create_enemy_speed = [ [400, 1300, 4200], [350, 1050, 4200],[300, 720, 3600],[250, 625, 3750] ];
// 敌机移动速度： 0 一级  1 二级  2 三级  3 四级
var enemy_speed = [ [0.5, 0.25, 0.1], [0.6, 0.45, 0.3], [0.7, 0.65, 0.5], [0.8, 0.7, 0.6] ];
// 背景移动速度： 0 一级  1 二级  2 三级  3 四级
var bg_speed = new Array(0.4, 0.6, 0.8, 1);

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
function bindEvent() {
    // 绑定事件
    // var self = this;
    
    // 点击任意按钮
    $body.on('click','button',function(){
        click_btn();
    });

    // 点击开始按钮（重新开始按钮）
    $body.on('click','.js-start',function(){
        $body.attr('data-status','start');
        GAME.init();
        if(isMusic)
            $("#bg_music")[0].src="./sound/game_music.mp3"
        // 开始游戏
        readyInterVal = setInterval(function () {
            ready();
        }, 900);
    });

    // 点击说明按钮
    $body.on('click','.js-rule',function(){
        $body.attr('data-status','rule');
    });

    // 点击设置按钮
    $body.on('click','.js-setting',function(){
        $body.attr('data-status','setting');
    });

    // 点击我知道了按钮
    $body.on('click','.js-confirm-rule',function(){
        $body.attr('data-status','index');
    });

    // 点击返回大厅按钮
    $body.on('click','.js-confirm-back',function(){
        $body.attr('data-status','index');
        GAME.init();
        if(isMusic)
            $("#bg_music")[0].src="./sound/menu_music.mp3";
    });

    // 点击确认设置按钮
    $body.on('click','.js-confirm-setting',function(){
        $body.attr('data-status','index');
        localStorage.setItem("music", isMusic);
        localStorage.setItem("background", $("#background option:selected").val());
        localStorage.setItem("plane", planeType);
    });

    // 后台静音
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            isHidden = true;
            $.each($("audio"),function(i, val) {
                val.pause();
            });
        } else {
            setTimeout(() => {
                if(isMusic) {
                    $("#bg_music")[0].play();
                    isShoot ? $("#biu_music")[0].play() : $("#biu_music")[0].pause();
                }
                isHidden = false;
            }, 0)
        }
    });
}

function showSound(audioSrc) {
    if(isMusic) {
        if(!isHidden) {
        /**因为音效元素是追加的，所以每次生成之前，将原来的删除掉*/
            $(".hint").remove();
            /**创建audio标签的Jquery对象，然后追加到body进行播放即可*/
            let audioJQ = $("<audio src='" + audioSrc + "' autoplay class='hint'/>");
            audioJQ.appendTo("body");
        }
    }
}

// 给点击按钮添加音效
function click_btn() {
    showSound("./sound/button.mp3");
}

// 设置音乐开关
function set_music() {
    click_btn();
    let music = $("#music option:selected").val();
    let audio = $("#bg_music")[0];// [0]是返回DOM对象，注意jQuery返回的是jQuery对象，document.getElementById返回的才是DOM对象。
    if(music == 0)//  0是开  1是关
    {
        audio.play();
        isMusic = true;
    } else {
        audio.pause();
        audio.currentTime = 0;
        isMusic = false;
    }
}

// 设置背景更换
function set_bg() {
    click_btn();
    let background = $("#background option:selected").val();
    $body.css("background-image","url(" + resourceHelper.getImage(background).src + ")");
}

// 设置飞机更换
function set_plane() {
    click_btn();
    planeType = $("#plane option:selected").val();
    GAME.init();
}

var readyCount = 1;
var readyInterVal;
function ready() {
    context.clearRect(0, 0, canvasWidth, canvasHeight / 1.5);
    context.shadowColor = '#080808';
    context.shadowOffsetX = 10;
    context.shadowOffsetY = 10;
    context.shadowBlur = 5;
    context.font = '56px arial';
    context.textAlign = 'center';
    context.fillStyle = '#FFFFFF';
    if(readyCount == 1) {
        showSound("./sound/ready.mp3");
        context.fillText("Ready!", canvasWidth / 2, canvasHeight / 2.3);
    } else if(readyCount == 2) {
        context.fillText("GO!", canvasWidth / 2, canvasHeight / 2.3);
    } else {
        clearInterval(readyInterVal);
        GAME.start();
        readyCount = 1;
        // 绑定手指事件
        GAME.bindTouchAction();
        return;
    }
    readyCount++;
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
        this.planePosY = (canvasHeight - opts.planeSize.height) * 0.8;
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.drawImage(resourceHelper.getImage(mainPalne[planeType][level]), this.planePosX, this.planePosY, 60, 45);
    },
    createEnemyInterVal: function(self) {
        // 随机生成大小敌机
        this.createBigEnemyInterVal = setInterval(function () {
            self.createEnemy('big');
        }, create_enemy_speed[level][2]);
        this.createMediumEnemyInterVal = setInterval(function () {
            self.createEnemy('medium');
        }, create_enemy_speed[level][1]);
        this.createSmallEnemyInterVal = setInterval(function () {
            self.createEnemy('normal');
        }, create_enemy_speed[level][0]);
    },
    clearEnemyInterVal: function() {
        clearInterval(this.createBigEnemyInterVal);
        clearInterval(this.createMediumEnemyInterVal);
        clearInterval(this.createSmallEnemyInterVal);
    },
    /**
     * 游戏开始需要设置
     */
    start: function() {
        // var self = this; // 保存函数调用对象 (即Game)
        up = this;
        var opts = this.opts;
        // 清空射击目标对象数组
        this.enemies = [];
        // 清除画布阴影效果
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
        // 创建敌人
        this.createEnemyInterVal(up);
        // 创建主角战机
        this.plane = new Plane({
            x: this.planePosX,
            y: this.planePosY,
            width: opts.planeSize.width,
            height: opts.planeSize.height,
            // 子弹尺寸速度
            bulletSize: opts.bulletSize,
            bulletSpeed: opts.bulletSpeed,
            // bulletSpeed: opts.bulletSpeed + bullet_speed[level],
            // 图标相关
            icon: resourceHelper.getImage(mainPalne[planeType][level]),
            bulletIcon: resourceHelper.getImage(bullet_icon[level]),
            effectIcon: resourceHelper.getImage(effect_icon[level]),
            boomIcon: resourceHelper.getImage(boom_icon[0])
        });
        // 飞机开始射击
        this.plane.startShoot();
        isShoot = true;
        if(isMusic) {
            if(!isHidden)
                $("#biu_music")[0].play();
        }
        // 开始更新游戏
        this.update();
    },
    /**
     * 方法： 升级
     */
    levelUp: function() {
        if(level != level_bak) {
            this.plane.icon = resourceHelper.getImage(mainPalne[planeType][level]);
            this.plane.bulletIcon = resourceHelper.getImage(bullet_icon[level]);
            this.plane.effectIcon = resourceHelper.getImage(effect_icon[level]);
            this.plane.bulletSize.width = bullet_size[level];
            this.plane.bulletSize.height = bullet_size[level];
            this.clearEnemyInterVal();
            this.createEnemyInterVal(up);
            level_bak = level;
        }
    },
    update: function() {
        var self = this;
        // var opts = this.opts;
        // 根据分数来升级
        level = score >= 10000 ? score >= 20000 ? score >= 30000 ? 3 : 2 : 1 : 0;
        this.levelUp();
        gameTime++;
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
        // var opts = this.opts;
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
                score -= enemy.live * 50;
            } else {
                // 判断飞机状态
                if(plane.status === 'normal') {
                    if(plane.hasCrash(enemy)) {
                        $canvas.off('touchstart');//TODO: off是解绑，可特么吃大亏了。。。。
                        $canvas.off('touchmove');
                        plane.booming();
                        isDie = true;
                        $("#biu_music")[0].pause();
                        showSound("./sound/die.mp3");
                    }
                }
                // 根据敌机状态判断是否被击中
                switch(enemy.status) {
                    case 'normal':
                        if(plane.hasHit(enemy)) {
                            enemy.live -= plane_bullet[level];
                            if(enemy.live <= 0) {
                                enemy.booming();
                                if(enemy.enemyType === 'big') {
                                    score += 1000;
                                } else if(enemy.enemyType === 'medium') {
                                    score += 500;
                                } else {
                                    score += 100;
                                }
                            }
                        }
                        break;
                    case 'booming':
                        showSound("./sound/boom.mp3");
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
            // 记录飞机的初始位置
            startPlaneX = plane.x;
            startPlaneY = plane.y;
            if(startTouchX <= (canvasWidth * 0.89 + 20) 
            && startTouchX >= (canvasWidth * 0.89) 
            && startTouchY <= (canvasHeight * 0.02 + 20) 
            && startTouchY >= (canvasHeight * 0.02)) {
                click_btn();
                $("#biu_music")[0].pause();
                plane.status = 'boomed';
            }
        });
        // 滑动屏幕
        $canvas.on('touchmove', function(e) {
            if(startTouchX != null && startPlaneY != null) {
                var newTouchX = e.touches[0].clientX;
                var newTouchY = e.touches[0].clientY;
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
            }
        });
    },
    
    /**
     * 生成敌机
     */
    createEnemy: function(enemyType) {
        var enemies = this.enemies;
        var opts = this.opts;
        var enemySize = opts.enemySmallSize;
        var enemySpeed = opts.enemySpeed * enemy_speed[level][0];
        var enemyIcon = resourceHelper.getImage(enemyPlane[2][Math.floor(Math.random() * enemyPlane[2].length)]);
        var enemyBoomIcon = resourceHelper.getImage(boom_icon[2]);
        var enemyLive = 2;
        // 大型敌机参数
        if(enemyType === 'big') {
            enemySize = opts.enemyBigSize;
            enemySpeed = opts.enemySpeed * enemy_speed[level][2];
            enemyIcon = resourceHelper.getImage(enemyPlane[0][Math.floor(Math.random() * enemyPlane[0].length)]);
            enemyBoomIcon = resourceHelper.getImage(boom_icon[0]);
            enemyLive = 20;
        } else if(enemyType === 'medium') {
            enemySize = opts.enemyMediumSize;
            enemySpeed = opts.enemySpeed * enemy_speed[level][1];
            enemyIcon = resourceHelper.getImage(enemyPlane[1][Math.floor(Math.random() * enemyPlane[1].length)]);
            enemyBoomIcon = resourceHelper.getImage(boom_icon[1]);
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
        if (enemies.length < opts.enemyMaxNum + enemy_max_num[level]) {
            enemies.push(new Enemy(initOpt));
        }
    },
    end: function() {
        this.clearEnemyInterVal();
        if(isDie) {
            let dps = score / Math.floor(gameTime / 60);
            let evaluate = dps >= 200 ? dps >= 250 ? dps >= 300 ? dps >= 350 ? dps >= 400 ? "SSS" : "SS" : "S" : "A" : "D" : "F";
            $("#score").html("您已阵亡 ! 存活时间 : " + Math.floor(gameTime / 60) + "秒<br/>本次得分 : " + score + "分<br/>评价 : " + evaluate);
            $body.attr('data-status','over');
            isDie = false;
        } else {
            $body.attr('data-status','index');
            GAME.init();
            if(isMusic)
                $("#bg_music")[0].src="./sound/menu_music.mp3";
        }
        level = 0;
        score = 0;
        gameTime = 0;
        isShoot = false;
    },
    draw: function() {
        this.enemies.forEach(function(enemy) {
            enemy.draw();
        });
        this.plane.draw(effect_size[level][0], effect_size[level][1]);
        this.plane.drawScore(score, canvasWidth, canvasHeight);
        context.drawImage(resourceHelper.getImage("home_btn"), canvasWidth * 0.89, canvasHeight * 0.02, 20, 20);
    }
};

// 循环背景
var current = 0;
function scrollBg(){
    current += bg_speed[level];
    if (current == window.innerHeight){
        current = 0;
    }
    $body.css("background-position-y",current);
    requestAnimationFrame(function() {
        scrollBg();
    });
}

function getSetting() {
    if(typeof(Storage)!=="undefined")
    {
        let music = localStorage.getItem("music");
        let background = localStorage.getItem("background");
        let plane = localStorage.getItem("plane");
        if(music != "" && music != null) {
            isMusic = music;
            $('#music').find('option').eq(music == "true" ? 0 : 1).attr('selected', true);
        }
        if(background != "" && background != null) {
            $body.css("background-image","url(" + resourceHelper.getImage(background).src + ")");
            $('#background').find('option').eq(background.substr(-1)-1).attr('selected', true);
        } else {
            $body.css("background-image","url(" + resourceHelper.getImage('bg1').src + ")");
        }
        if(plane != "" && plane != null) {
            planeType = plane;
            $('#plane').find('option').eq(plane).attr('selected', true);
        }
        $('select').trigger('changed.selected.amui');
    } else {
        $body.css("background-image","url(" + resourceHelper.getImage('bg1').src + ")");
    }
}

/**
 * 页面主入口
*/
function init(){
    // 加载图片资源，加载完成才能交互
    resourceHelper.load(CONFIG.resources, function(images){
        // 加载完成
        getSetting();
        GAME.init();
        bindEvent();
        scrollBg();
    });
}

init();