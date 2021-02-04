const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d");
const gameButton = document.getElementById("strt_game");
const modalEl = document.getElementById("ModalEl");
var score = 0;

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor(x, y, radius, color){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  
  draw(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
    
  draw(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
    
  update(){
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
    
  draw(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
    
  update(){
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Particle {
  constructor(x, y, radius, color, velocity){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
    
  draw(){
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
    
  update(){
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}

const x = canvas.width/2;
const y = canvas.height/2;

const player = new Player(x, y, 10, 'white');
player.draw();

let projectiles = [];
let enemies = [];
let particles = [];

function init(){
  projectiles = [];
  enemies = [];
  particles = [];
  animate();
  spawnEnemies();
  modalEl.style.display = "none";
  score = 0;
}

function spawnEnemies(){
  setInterval(() => {
    const radius = Math.random() * (30 - 8) + 8;
    
    let x;
    let y;
    if(Math.random()<0.5){
      x = Math.random() < 0.5 ? 0 - radius : canvas.width+radius;
      y = Math.random() * canvas.height;
    } else{
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height+radius;
    }
    const color = `hsl(${Math.random()*360}, 50%, 50%)`;
    const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x);
    const velocity = {
      x: Math.cos(angle) * 1.5,
      y: Math.sin(angle) * 1.5
    }
     
    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1000);
}

let animateId;
function animate(){
  animateId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "blue";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30); 
  player.draw();
  particles.forEach((particle, index) => {
    if(particle.alpha <= 0){
       particles.splice(index, 1);
    } else{
      particle.update();
    }
  });
  projectiles.forEach((projectile, index) => {
    projectile.update();
    if(projectile.x + projectile.radius<0 || projectile.x - projectile.radius>canvas.width){
       setTimeout(() => {
         projectiles.splice(index, 1);
       }, 0);
    }
  })
  enemies.forEach((enemy, index) => {
    enemy.update();
    
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if(dist - enemy.radius - player.radius<1){
      cancelAnimationFrame(animateId);
      ModalEl.style.display = "flex";
      document.querySelector("#score").innerHTML = score;
    }
      
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if(dist - enemy.radius - projectile.radius<1){
         for(let i = 0; i<enemy.radius*2; i++){
           particles.push(new Particle(projectile.x, projectile.y, Math.random()*2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 5),y: (Math.random() - 0.5) * (Math.random() * 5)}))
         }
         if(enemy.radius - 10 > 10){
           enemy.radius-=10;
           score+=50;
           console.log(score);
           projectiles.splice(projectileIndex, 1);
         } else{
           setTimeout(() => {
             score+=50;
             enemies.splice(index, 1);
             projectiles.splice(projectileIndex, 1);
           }, 0);
         }
      }
    })
  })
}

addEventListener("click", (e) => {
  const angle = Math.atan2(e.clientY - canvas.height/2, e.clientX - canvas.width/2);
  const velocity = {
    x: Math.cos(angle)*2,
    y: Math.sin(angle)*2
  }
  projectiles.push(new Projectile(x, y, 5, "white", velocity));
})

gameButton.addEventListener("click", () => {
  init();
});