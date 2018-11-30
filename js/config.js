/**
 * 游戏相关配置
 * @type {Object}
 */
var CONFIG = {
    planeSize: {//飞机大小
        width: 60,
        height: 45
    },
    planeType: 'bluePlaneIcon',//飞机类型默认是蓝色战机
    bulletSize: {//子弹大小
        width: 20,
        height: 20
    },
    enemySpeed: 4,//默认敌人移动距离
    enemyMaxNum: 5,//敌人最大数量
    enemySmallSize: {//小敌机尺寸
        width: 54,
        heigth: 40
    },
    enemyBigSize: {//大敌机尺寸
        width: 130,
        heigth: 100
    },
    bulletSpeed: 10,//默认子弹的移动速度
    resources: {//资源文件
        images: [
            {
                src: './img/plane_1.png',
                name: 'bluePlaneIcon'
            },
            {
                src: './img/plane_2.png',
                name: 'pinkPlaneIcon'
            },
            {
                src: './img/fire.png',
                name: 'fireIcon'
            },
            {
                src: './img/enemy_big.png',
                name: 'enemyBigIcon'
            },
            {
                src: './img/enemy_small.png',
                name: 'enemySmallIcon'
            },
            {
                src: './img/boom_big.png',
                name: 'enemyBigBoomIcon'
            },
            {
                src: './img/boom_small.png',
                name: 'enemySmallBoomIcon'
            }
        ],
        bg_images: [
            {
                src: './img/bg_1.jpg',
                name: 'bg1'
            },
            {
                src: './img/bg_2.jpg',
                name: 'bg2'
            },
            {
                src: './img/bg_3.jpg',
                name: 'bg3'
            },
            {
                src: './img/bg_4.jpg',
                name: 'bg4'
            }
        ]
    }
};