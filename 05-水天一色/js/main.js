import * as THREE from "three";
//导入控制器
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js'

//导入水面
import { Water } from '../node_modules/three/examples/jsm/objects/Water2.js'

//导入gltf载入库
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js'
//导入解压库
import { DRACOLoader } from '../node_modules/three/examples/jsm/loaders/DRACOLoader.js'
//导入环境纹理hdr
import { RGBELoader } from '../node_modules/three/examples/jsm/loaders/RGBELoader.js'

const _w = window.innerWidth
const _h = window.innerHeight

//初始化场景
const scene = new THREE.Scene();

//初始化相机
const camera = new THREE.PerspectiveCamera(75, _w / _h, 0.1, 2000);

//设置相机位置
camera.position.set(-50, 50, 130);

//更新摄像头宽高比
camera.aspect = _w / _h;

//更新摄像头投影矩阵
camera.updateProjectionMatrix();

scene.add(camera);

//初始化渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 设置抗锯齿
  logarithmicDepthBuffer: true//对数深度缓冲区
});
//GLTFLoader将可以正确地自动配置从.gltf或.glb文件中引用的纹理
renderer.outputEncoding = THREE.sRGBEncoding;

// 设置渲染器宽高
renderer.setSize(_w, _h);

// 监听屏幕的大小改变，修改渲染器的宽高，相机的比例
window.addEventListener("resize", () => {
  const _w = window.innerWidth;
  const _h = window.innerHeight;
  camera.aspect = _w / _h;
  camera.updateProjectionMatrix();
  renderer.setSize(_w, _h);
});

document.body.appendChild(renderer.domElement);

//实例化控制器
const controls = new OrbitControls(camera, renderer.domElement)

function render() {
  //渲染场景
  renderer.render(scene, camera);
  //引擎自动更新渲染器
  requestAnimationFrame(render);
}

render();

//添加平面
// const planeGeometry = new THREE.PlaneGeometry(100, 100);
// const planeMaterial = new THREE.MeshBasicMaterial({
//   color: 0xffffff,
// });
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// scene.add(plane);

//创建一个巨大的天空球体
let texture = new THREE.TextureLoader().load('./textures/sky.jpg')
const skyGeometry = new THREE.SphereGeometry(1000, 60, 60)
const skyMaterial = new THREE.MeshBasicMaterial({
    map: texture
})
skyGeometry.scale(1, 1, -1)
const sky = new THREE.Mesh(skyGeometry, skyMaterial)
scene.add(sky)


//创建视频纹理
const video = document.createElement('video')
video.src = './textures/sky.mp4'
video.loop = true 

window.addEventListener('click', () => {
    if(video.paused){
        video.play()
        let texture = new THREE.VideoTexture(video)
        skyMaterial.map = texture
        skyMaterial.map.needsUpdate = true //更新材质(material)的贴图(map)
        scene.background = texture //最先渲染 纹理将会被覆盖到canvas上
        scene.environment = texture //默认null,当设置为Texture时，该纹理将会被设置为场景中所有物理材质的环境贴图，如果物体有自己的环境贴图，将不会被覆盖。

    }
})

//载入环境纹理hdr
const hdrLoader = new RGBELoader()
hdrLoader.loadAsync('./assets/050.hdr').then((texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping,
    scene.background = texture
    scene.environment = texture
})
//添加平行光
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(-100, 100, 10)
scene.add(light)



//创建水面  //圆形缓冲几何体
const waterGeometry = new THREE.CircleBufferGeometry(300, 64)
const water = new Water(waterGeometry, {
    textureWidth: 1024,
    textureHeight: 1024,
    color: 0xeeeeff,//水面颜色
    flowDirection: new THREE.Vector2(1, 1), //水流方向
    scale: 1 //水面波纹大小
})
water.position.y =3
//水面旋转至水平
water.rotation.x = -Math.PI / 2

scene.add(water)


//添加小岛模型
//实例化gltf载入库
const loader = new GLTFLoader()
//实例化draco载入库
const dracoLoader = new DRACOLoader()

dracoLoader.setDecoderPath('./draco/')

loader.setDRACOLoader(dracoLoader)

loader.load('./model/island2.glb', (gltf) => {
    scene.add(gltf.scene)
})