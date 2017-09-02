export class StarShape {

  r: number;
  x: number;
  y: number;
  rotation: number;
  speed: number;

  constructor(halfW, halfH) {
    this.r = this.random(10, 20);
    this.x = this.random(0, this.distance(halfW, halfH));
    this.y = 0;
    this.rotation = this.random(0, 360) * Math.PI / 180;
    this.speed = this.random(0, .5) * Math.PI / 180;
  }

  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  distance(x, y) {
    var hypotenuse = Math.round(Math.sqrt(x * x + y * y));
    return hypotenuse;
  }

  draw(ctx, halfW, halfH) {
    var grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    grd.addColorStop(0, '#fff');
    grd.addColorStop(0.3, '#bbf');
    grd.addColorStop(0.36, 'rgba(234, 234, 234, 1)');
    grd.addColorStop(1, 'rgba(234, 234, 234, 0)');
    ctx.save();
    ctx.translate(halfW, halfH);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.fillStyle = grd;
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.restore();

    this.rotation += this.speed / 50;
  };

}