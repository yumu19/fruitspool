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
const wallColor = "skyblue";

const dropOffsetX = 50;
const dropOffsetY = 100;

const nfX = 1000;
const nfY = 150;
const nfR = 150;

// const osc1 = new p5.Oscillator('square')
// const osc2 = new p5.Oscillator('square')
// let env = new p5.Envelope();
// env.setADSR(0.001, 0.5, 0.1, 0.5);
// env.setRange(0.8, 0.5);

let bgm;
let fall;
let pong;

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


// スイカゲーム
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

function setup() {
  createCanvas(canvasW, canvasH); 
  //createCanvas(1600, 800); 
  videoImage = createGraphics(640, 360);
  //createCanvas(800, 800);
  textSize(32);
    
  l_uarm = new Sprite(1,1,1,1);
  l_uarm.collider = 'static';
  l_larm = new Sprite(1,1,1,1);
  l_larm.collider = 'static';   
  
  r_uarm = new Sprite(1,1,1,1);
  r_uarm.collider = 'static';
  r_larm = new Sprite(1,1,1,1);
  r_larm.collider = 'static'; 
  
  l_uarm.color = "limegreen";
  l_larm.color = "limegreen"
  r_uarm.color = "limegreen";
  r_larm.color = "limegreen";
  
   
  world.gravity.y = 10;
  
  fruits = new Group();
  

  //ステージ枠の作成
  floor = new Sprite(canvasW/2,canvasH-floorOffset,stageW+wallThikness,wallThikness);
  floor.collider = 'static';
  floor.color = wallColor;
  lWall = new Sprite((canvasW-stageW)/2,canvasH-floorOffset-stageH/2,wallThikness,stageH+wallThikness);
  lWall.collider = 'static';
  lWall.color = wallColor;
  rWall = new Sprite((canvasW+stageW)/2,canvasH-floorOffset-stageH/2,wallThikness,stageH+wallThikness);
  rWall.collider = 'static';
  rWall.color = wallColor; 
   
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

  dropFruit = new Sprite(centerX, dropOffsetY);
  let ds = parseInt(random(5));
  dropFruit.textSize = ds;
  dropFruit.color = colorList[ds];
  dropFruit.diameter = radiusList[ds];
  dropFruit.addImage(fruitsImg[ds]);
  dropFruit.collider = 'static';
  
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

  // ここまで mediapipe
  
  // ここからスイカゲーム
  
  text(score, (canvasW-stageW)/2-100, 50);
  text("#くだものプール",centerX-120,canvasH-10);
  
  //dropFruit.x = centerX;
  
  fruits.collide(fruits, (a, b) => {
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
    );

  counter++;
  if (counter > 100) {
    let f = new Sprite(dropFruit.x, canvasH - floorOffset - stageH);
    let s = dropFruit.textSize;
    //console.log(s);
    f.textSize = s;
    f.color = colorList[s];
    f.addImage(fruitsImg[s]);
    f.diameter = radiusList[s];
    fruits.add(f);
    fall.play();
    
    let ds = nextFruit.textSize;
    dropFruit.x = parseInt(random((canvasW-stageW)/2+dropOffsetX,(canvasW+stageW)/2-dropOffsetX));
    console.log((canvasW-stageW)/2+dropOffsetX);
    console.log((canvasW+stageW)/2-dropOffsetX);
    console.log(random((canvasW-stageW)/2+dropOffsetX,(canvasW+stageW)/2-dropOffsetX));
    
    dropFruit.y = dropOffsetY;
    dropFruit.textSize = ds;
    dropFruit.color = colorList[ds];
    dropFruit.diameter = radiusList[ds];
    dropFruit.addImage(fruitsImg[ds]);   
    
    let ns = parseInt(random(5));
    nextFruit.textSize = ns;
    nextFruit.color = colorList[ns];
    nextFruit.diameter = radiusList[ns];
    nextFruit.addImage(fruitsImg[ns]);
    
    counter = 0;
  }
}