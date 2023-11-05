const isFlipped = true;
let kp = [];
const ss = 10; // 腕のオブジェクトの太さ

const canvasW = 1280;
const canvasH = 720;
const centerX = canvasW/2;

const stageW = 400;
const stageH = 500;

const floorOffset = 50;
const wallThikness = 10;
const lWallX = (canvasW-stageW)/2;
const rWallX = (canvasW+stageW)/2;
const wallY = canvasH-floorOffset-stageH/2;
const stageTop = canvasH - stageH - floorOffset;

const wallColor = "skyblue";
const armColor = "limegreen";
const wallStroke = "black";
const armStroke = "black";

const dropOffsetX = 50;
const dropOffsetY = 100;

const nfX = 1000;
const nfY = 150;
const nfR = 150;

let dropSpeed = 20;

let bgm;
let fall;
let pong;

let isGameOver = false;
let enableGameOver = true;

const videoElement = document.getElementsByClassName("input_video")[0];
videoElement.style.display = "none";

function onPoseResults(results) {
  kp = results.poseLandmarks;
}

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  },
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onPoseResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();

let videoImage;
let lx = 0;
let w = 2;
let w2 = 2*w;

let l_uarm;
let l_larm;
let l_shoulder;
let l_elbow;
let l_wrist;
let r_uarm;
let r_larm;
let r_shoulder;
let r_elbow;
let r_wrist;

let fruits;
let dropFruit;
let nextFruit;
let score = 0;
let counter = 0;

let fruitsImg = new Array(10);
const scores = [1,3,6,10,15,21,28,36,45,55,0];
const colorList = ['crimson','red','purple','gold','orange','red','yellow','pink','yellow','yellowgreen','green','white'];
const radiusList = [34,45,63,74,94,118,136,167,187,229,272,1];


function preload(){
  for (let i = 0; i < 11; i++){
    fruitsImg[i] = loadImage("img/"+i+".png");
  }
  bgm = loadSound('assets/Thanks.mp3');
  fall = loadSound('assets/fall.mp3');
  pong = loadSound('assets/pong.mp3');
}

function retry(){
  fruits.remove();
  fruits = new Group();
  score = 0;
  isGameOver = false;
}

function setup() {
  createCanvas(canvasW, canvasH);  
  videoImage = createGraphics(640, 360);
  textSize(32);
    
  l_uarm = new Sprite(1,1,1,1);
  l_uarm.collider = 'static';
  l_larm = new Sprite(1,1,1,1);
  l_larm.collider = 'static';   
  r_uarm = new Sprite(1,1,1,1);
  r_uarm.collider = 'static';
  r_larm = new Sprite(1,1,1,1);
  r_larm.collider = 'static'; 
  
  l_uarm.color = armColor;
  l_larm.color = armColor
  r_uarm.color = armColor;
  r_larm.color = armColor;
  
  l_uarm.stroke = armStroke;
  l_larm.stroke = armStroke
  r_uarm.stroke = armStroke;
  r_larm.stroke = armStroke;
  
  world.gravity.y = 10;
  
  fruits = new Group();
  
  //ステージ枠の作成
  floor = new Sprite(canvasW/2,canvasH-floorOffset,stageW+wallThikness,wallThikness);
  floor.collider = 'static';
  floor.color = wallColor;
  floor.stroke = wallStroke;

  lWall = new Sprite(lWallX,wallY,wallThikness,stageH+wallThikness);
  lWall.collider = 'static';
  lWall.color = wallColor;
  lWall.stroke = wallStroke;
  rWall = new Sprite(rWallX,wallY,wallThikness,stageH+wallThikness);
  rWall.collider = 'static';
  rWall.color = wallColor; 
  rWall.stroke = wallStroke; 
  
  nextCircle = new Sprite(nfX,nfY);
  nextCircle.color = 'white';
  nextCircle.diameter = nfR;
  nextCircle.collider = 'none';

  nextFruit = new Sprite(nfX, nfY);
  let ns = parseInt(random(5));
  nextFruit.textSize = ns;
  nextFruit.color = colorList[ns];
  nextFruit.diameter = radiusList[ns];
  nextFruit.addImage(fruitsImg[ns]);
  nextFruit.collider = 'static';
  
  bgm.loop();
}

function draw() {
  background(255, 255, 255);
  stroke(0,0,255);
  strokeWeight(2);
  fill(0, 255, 0);

  videoImage.drawingContext.drawImage(
    videoElement,
    0,
    0,
    videoImage.width,
    videoImage.height
  );

  push();
  if (isFlipped) {
    translate(width, 0);
    scale(-1, 1);
  }
  displayWidth = width;
  displayHeight = (width * videoImage.height) / videoImage.width;
  image(videoImage, 0, 0, displayWidth, displayHeight);
  pop();
  
  let dw = displayWidth;
  let dh = displayHeight;
  try{
    if (kp[11] && kp[13]) { //左上腕
      l_shoulder = kp[11];
      l_elbow = kp[13];
      l_uarm.x = (2 - l_shoulder.x - l_elbow.x)/2 * dw;
      l_uarm.y = (l_shoulder.y + l_elbow.y)/2 * dh;
      let w = Math.sqrt(Math.pow((l_shoulder.x-l_elbow.x)*dw,2)+Math.pow((l_shoulder.y-l_elbow.y)*dh,2));
      l_uarm.width = w;   
      l_uarm.height = ss;
      let angle =  Math.atan2((l_shoulder.y-l_elbow.y)*dh,(l_elbow.x-l_shoulder.x)* dw)*180/3.14159;
      l_uarm.rotation = angle;
    }

    if (kp[13] && kp[15]) { //左下腕
      l_elbow = kp[13];
      l_wrist = kp[15];
      l_larm.x = (2 - l_elbow.x - l_wrist.x)/2 * dw;
      l_larm.y = (l_elbow.y + l_wrist.y)/2 * dh;
      let w = Math.sqrt(Math.pow((l_elbow.x-l_wrist.x)*dw,2)+Math.pow((l_elbow.y-l_wrist.y)*dh,2));
      l_larm.width = w;   
      l_larm.height = ss;
      let angle = -Math.atan2((l_elbow.y-l_wrist.y)*dh,(l_elbow.x-l_wrist.x)*dw)*180/3.14159;
      l_larm.rotation = angle;
    }

    if (kp[12] && kp[14]) { //右上腕
      r_shoulder = kp[12];
      r_elbow = kp[14];
      r_uarm.x = (2 - r_shoulder.x - r_elbow.x)/2 * dw;
      r_uarm.y = (r_shoulder.y + r_elbow.y)/2 * dh;
      let w = Math.sqrt(Math.pow((r_shoulder.x-r_elbow.x)*dw,2)+Math.pow((r_shoulder.y-r_elbow.y)*dh,2));
      r_uarm.width = w;   
      r_uarm.height = ss;
      let angle =  Math.atan2((r_shoulder.y-r_elbow.y)*dh,(r_elbow.x-r_shoulder.x)* dw)*180/3.14159;
      r_uarm.rotation = angle;
    }

    if (kp[14] && kp[16]) { //右下腕
      r_elbow = kp[14];
      r_wrist = kp[16];
      r_larm.x = (2 - r_elbow.x - r_wrist.x)/2 * dw;
      r_larm.y = (r_elbow.y + r_wrist.y)/2 * dh;
      let w = Math.sqrt(Math.pow((r_elbow.x-r_wrist.x)*dw,2)+Math.pow((r_elbow.y-r_wrist.y)*dh,2));
      r_larm.width = w;   
      r_larm.height = ss;
      let angle = -Math.atan2((r_elbow.y-r_wrist.y)*dh,(r_elbow.x-r_wrist.x)*dw)*180/3.14159;
      r_larm.rotation = angle;
    }

    /* 関節点の表示
    if (kp.length > 0) {
      for (let i=11; i<23; i++){
         indexTip = kp[i];
         let xx = (1-indexTip.x) * displayWidth;
         let yy = indexTip.y * displayHeight;
         ellipse(xx, yy, 20);
      }
    }
    */
  }
  catch (error) {
    console.error(error);
  }
  // ここまで mediapipe
  
  // ここからスイカゲーム
  // 透過背景
  noStroke();
//  fill(153,153,102,196);
  fill(255,255,0,164);
//  fill(0,0,255,164);
  rect(0,0,lWallX,canvasH);
  rect(rWallX,0,canvasW-rWallX,canvasH);
  
  rect(lWallX,0,stageW,stageTop);
  rect(lWallX,canvasH-floorOffset,stageW,floorOffset);
  
  stroke(0);
  fill(255);
  circle(lWallX-200,100,150);
  
  // 文字関連
  stroke(0,0,255); 
  fill(238,120,0);
  textSize(38);
  text("#くだものプール",centerX-150,canvasH-10);
  let ofX = 0;
  if (score > 999){
    ofX = 36;
  } else if (score > 99){
    ofX = 24;
  }  
  else if (score > 9){
    ofX = 12;
  }
  text(score, lWallX-214-ofX,114);
  
  
  noStroke();
  fill(0);
  textSize(16);

  text("Speed： " + dropSpeed, 10,canvasH-85);
  text ("Uキー：スピードアップ　", 10,canvasH-65);
  text ("Dキー：スピードダウン", 10,canvasH-45);
  text ("Rキー：リトライ", 10,canvasH-25);
  let t = "ゲームオーバー： あり （Gキーで変更）";
  if (!enableGameOver){
    t = "ゲームオーバー：なし （Gキーで変更）";
  }
  text (t, 10, canvasH-5);
  
  
  
  fruits.collide(fruits, (a, b) => { //合体したときの処理
    if (!isGameOver){
      let as = a.textSize;
      if (as == b.textSize){
        let ax = a.x;
        let ay = a.y;
        let bx = b.x;
        let by = b.y;
        a.remove();
        b.remove();
        
        let f = new Sprite((ax+bx)/2,(ay+by)/2);
        f.textSize = as+1;
        f.color = colorList[as+1];
        f.diameter = radiusList[as+1];
        f.addImage(fruitsImg[as+1]);
        fruits.add(f);
        
        score += scores[as];
        pong.play();
        }
      }
    }
  );

  counter++;
  if (counter > 500/dropSpeed) {
    if (!isGameOver){
      let fx =　random((canvasW-stageW)/2+dropOffsetX,(canvasW+stageW)/2-dropOffsetX);
      let f = new Sprite(fx, canvasH - floorOffset - stageH);
      let s = nextFruit.textSize;
      //console.log(s);
      f.textSize = s;
      f.color = colorList[s];
      f.addImage(fruitsImg[s]);
      f.diameter = radiusList[s];
      fruits.add(f);
      fall.play();

      let ns = parseInt(random(5));
      nextFruit.textSize = ns;
      nextFruit.color = colorList[ns];
      nextFruit.diameter = radiusList[ns];
      nextFruit.addImage(fruitsImg[ns]);

      counter = 0;
    }
  }
  //ゲームオーバー判定
  if(enableGameOver){
    for (let i=0; i < fruits.length; i++){
      if (fruits[i].y < stageTop - 100){
        isGameOver = true;
      }
    }
    if (isGameOver){
      textSize(60);
      stroke(0);
      fill(255,255,0);
      text("GAME OVER",centerX-190,wallY);
      textSize(48)
      text("Rキーでリトライ",centerX-186,wallY+60);
    }
  }
 
  
  if (kb.presses('r')) {
	retry();
  }
  
  if (kb.presses('g')) {
	enableGameOver = !enableGameOver;
  }
  if (kb.presses('u')) {
	dropSpeed = min(20,dropSpeed+1);
  }
  if (kb.presses('d')) {
	dropSpeed = max(1,dropSpeed-1);
  }
  
  
  
  //console.log(fruits);
}