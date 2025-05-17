const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const COLS = 6;
const ROWS = 12;
const BLOCK = 30;
const COLORS = ['red','green','blue','yellow'];

let board = [];
for(let r=0;r<ROWS;r++){
  board[r]=Array(COLS).fill(null);
}

let pair = null;
let dropInterval = 500;
let dropTimer = null;

function randomColor(){
  return COLORS[Math.floor(Math.random()*COLORS.length)];
}

function spawnPair(){
  pair = {
    x:2,
    y:0,
    blocks:[randomColor(),randomColor()],
    dir:0 //0:vertical second below,1:right,2:up,3:left
  };
  if(collision(pair.x,pair.y,pair.dir)){
    alert('Game Over');
    reset();
  }
}

function reset(){
  for(let r=0;r<ROWS;r++) board[r].fill(null);
  spawnPair();
}

function collision(x,y,dir){
  const coords=getCoords(x,y,dir);
  for(let c of coords){
    if(c.x<0||c.x>=COLS||c.y>=ROWS) return true;
    if(c.y>=0 && board[c.y][c.x]) return true;
  }
  return false;
}

function getCoords(x,y,dir){
  const c1={x:x,y:y};
  let c2;
  switch(dir){
    case 0: c2={x:x,y:y-1}; break;
    case 1: c2={x:x+1,y:y}; break;
    case 2: c2={x:x,y:y+1}; break;
    case 3: c2={x:x-1,y:y}; break;
  }
  return [c1,c2];
}

function mergePair(){
  const coords=getCoords(pair.x,pair.y,pair.dir);
  coords.forEach((c,i)=>{
    if(c.y>=0) board[c.y][c.x]=pair.blocks[i];
  });
}

function drop(){
  if(!pair) return;
  if(!collision(pair.x,pair.y+1,pair.dir)){
    pair.y++;
  }else{
    mergePair();
    clearMatches();
    spawnPair();
  }
}

function clearMatches(){
  let visited=Array.from({length:ROWS},()=>Array(COLS).fill(false));
  for(let y=0;y<ROWS;y++){
    for(let x=0;x<COLS;x++){
      const color=board[y][x];
      if(!color||visited[y][x]) continue;
      let stack=[[x,y]];
      let group=[];
      visited[y][x]=true;
      while(stack.length){
        const [cx,cy]=stack.pop();
        group.push([cx,cy]);
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
          const nx=cx+dx, ny=cy+dy;
          if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS&&!visited[ny][nx]&&board[ny][nx]==color){
            visited[ny][nx]=true;
            stack.push([nx,ny]);
          }
        });
      }
      if(group.length>=4){
        group.forEach(([gx,gy])=>{board[gy][gx]=null;});
      }
    }
  }
  applyGravity();
}

function applyGravity(){
  for(let x=0;x<COLS;x++){
    for(let y=ROWS-1;y>=0;y--){
      if(!board[y][x]){
        for(let ny=y-1;ny>=0;ny--){
          if(board[ny][x]){
            board[y][x]=board[ny][x];
            board[ny][x]=null;
            break;
          }
        }
      }
    }
  }
}

function rotate(){
  let newDir=(pair.dir+1)%4;
  if(!collision(pair.x,pair.y,newDir)) pair.dir=newDir;
}

function move(dir){
  let nx=pair.x+dir;
  if(!collision(nx,pair.y,pair.dir)) pair.x=nx;
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<ROWS;y++){
    for(let x=0;x<COLS;x++){
      const color=board[y][x];
      if(color){
        ctx.fillStyle=color;
        ctx.fillRect(x*BLOCK,y*BLOCK,BLOCK,BLOCK);
      }
    }
  }
  if(pair){
    const coords=getCoords(pair.x,pair.y,pair.dir);
    coords.forEach((c,i)=>{
      if(c.y>=0){
        ctx.fillStyle=pair.blocks[i];
        ctx.fillRect(c.x*BLOCK,c.y*BLOCK,BLOCK,BLOCK);
      }
    });
  }
}

function gameLoop(){
  drop();
  draw();
}

function start(){
  reset();
  if(dropTimer) clearInterval(dropTimer);
  dropTimer=setInterval(gameLoop,dropInterval);
}

window.addEventListener('keydown',e=>{
  switch(e.key){
    case 'ArrowLeft': move(-1); break;
    case 'ArrowRight': move(1); break;
    case 'ArrowUp': rotate(); break;
    case 'ArrowDown': drop(); break;
  }
  draw();
});

start();
