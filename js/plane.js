/**
 * 子类 Plane 飞机
 * 1、继承 Element
 * 2、依赖 Bullet
 */
var Plane = function (opts) {
    var opts = opts || {};
    // 调用父类方法
    Element.call(this, opts);
    
    // 特有属性
    this.status = 'normal';
    this.icon = opts.icon;
    // 子弹相关
    this.bullets = [];
    this.bulletSize = opts.bulletSize;
    this.bulletSpeed = opts.bulletSpeed;
    this.bulletIcon = opts.bulletIcon;
    this.effectIcon = opts.effectIcon;// 命中的特效
    this.effect = false;// 是否命中
    this.effectCount = 0;
    this.effectTarget;// 子弹对象
    // this.shootSound = opts.shootSound;
    // 特有属性，爆炸相关
    this.boomIcon = opts.boomIcon;
    this.boomCount = 0;
};

// 继承 Element 的方法
Plane.prototype = new Element();

/**
 * 方法：hasCrash 判断是否撞到当前元素
 * @param {target} target 目标元素实例
 */
Plane.prototype.hasCrash = function(target) {
    var crash = false;
    // 判断四边是否产生碰撞
    // var dx = this.x - target.x;
    // var dy = this.y - target.y;
    // var distance = Math.sqrt((dx * dx) * (dy * dy));
    // if (distance < (this.height + target.height) / 2) {
    //     // 两个圆形碰撞了
    //     crash = true;
    // }
    if(!(this.x + this.width < target.x) && 
    !(target.x + target.width < this.x) && 
    !(this.y + this.height < target.y + 20) && 
    !(target.y + target.height < this.y + 20)) {
        // 物体碰撞了
        crash = true;
    }
    return crash;
};

/**
 * 方法：hasHit 判断是否击中当前元素
 * @param {target} target 目标元素实例
 */
Plane.prototype.hasHit = function(target) {
    var bullets = this.bullets;
    var hasHit = false;
    for(var j = bullets.length - 1; j >= 0; j--){
        // 如果子弹击中的是目标对象范围，则销毁子弹
        if(bullets[j].hasCrash(target)){
            this.effect = true;
            this.effectTarget = bullets[j];
            // 清除子弹实例
            this.bullets.splice(j, 1);
            hasHit = true;
            break;
        }
    }
    return hasHit;
};

/**
 * 方法：setPosition 修改飞机当前位置
 */
Plane.prototype.setPosition = function(newPlaneX, newPlaneY) {
    this.x = newPlaneX;
    this.y = newPlaneY;
    return this;
};

/**
 * 方法：startShoot 方法
 */
Plane.prototype.startShoot = function() {
    var self = this;
    // 定时发射子弹
    this.shootingInterval = setInterval(function() {
        // 创建子弹，子弹位置是居中射出
        var bulletX = self.x + self.width / 2 - self.bulletSize.width / 2;
        var bulletY = self.y - self.bulletSize.height;
        // 创建子弹
        self.bullets.push(new Bullet({
            x: bulletX,
            y: bulletY,
            width: self.bulletSize.width,
            height: self.bulletSize.height,
            speed: self.bulletSpeed,
            icon: self.bulletIcon,
        }));
    }, 150);
};

// 方法：drawBullets 画子弹
Plane.prototype.drawBullets = function() {
    var bullets = this.bullets;
    var i = bullets.length;
    while (i--) {
        var bullet = bullets[i];
        // 更新子弹的位置
        bullet.fly(); // 更新和绘制耦合在一起了
        // 如果子弹对象超出边界则删除
        if(bullet.y <= 0) {
            // 如果子弹实例下降到底部，则需要在drops数组中清除改子弹实例对象
            bullets.splice(i, 1);
        } else {
            // 未超出的则绘制子弹
            bullet.draw();
        }
    }
};

/**
 * 方法：booming 爆炸中
 */
Plane.prototype.booming = function() {
    this.status = 'booming';
    this.boomCount += 1;
    if(this.boomCount > 10) {
        this.status = 'boomed';
        clearInterval(this.shootingInterVal);
    }
    return this;
}

/**
 * 方法：绘制命中效果
 */
Plane.prototype.drawEffectIcon = function(effectIconWidth, effectIconHeight) {
    if(this.effect) {
        this.effectCount += 1;
        if(this.effectCount <= 6) {
            context.drawImage(this.effectIcon, this.effectTarget.x - effectIconWidth / 2 + this.effectTarget.width / 2, this.effectTarget.y - 25, effectIconWidth, effectIconHeight);
        } else {
            this.effectCount = 0;
            this.effect = false;
        }
    }
}

/**
 * 方法：绘制当前分数
 */
Plane.prototype.drawScore = function(score, width, height) {
    context.font = '13px arial';
    context.textAlign = 'left';
    context.fillStyle = '#FFFFFF';
    context.fillText("当前分数：" + score, width * 0.05, height * 0.04);
}

// 方法：draw 方法
Plane.prototype.draw = function(effectIconWidth, effectIconHeight) {
    // 绘制飞机
    switch(this.status) {
        case 'booming':
            context.drawImage(this.boomIcon, this.x, this.y, this.width, this.height);
            break;
        default:
            context.drawImage(this.icon, this.x, this.y, this.width, this.height);
            break;
    }
    this.drawEffectIcon(effectIconWidth, effectIconHeight);
    // 绘制子弹
    this.drawBullets();
    return this;
};