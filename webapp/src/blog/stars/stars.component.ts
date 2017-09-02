import { Component, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { StarShape } from './star.shape';

@Component({
  selector: 'stars',
  templateUrl: './stars.component.html',
  styleUrls: ['./stars.component.css']
})
export class StarsComponent implements OnInit {

  @ViewChild('stars_graphics')
  stars_graphics: ElementRef;

  private bgCtx: any;
  private width: number;
  private height: number;
  private stars: Array<StarShape> = [];

  constructor() {
    this.animateStars = this.animateStars.bind(this);
  }

  @HostListener("window:resize", ['$event'])
  resetViewport() {
    this.width = this.stars_graphics.nativeElement.offsetWidth;
    this.height = this.stars_graphics.nativeElement.offsetHeight;
    this.stars_graphics.nativeElement.width = this.width;
    this.stars_graphics.nativeElement.height = this.height;
  }

  ngOnInit() {
    console.log('start drawing');
    this.bgCtx = this.stars_graphics.nativeElement.getContext('2d');
    this.resetViewport();

    let widthHalf = this.width / 2;
    let heightHalf = this.height / 2;

    for (let i = 0; i < 365; i++) {
      this.stars[i] = new StarShape(widthHalf, heightHalf);
    }
    this.animateStars();
  }

  animateStars() {
    this.bgCtx.fillStyle = 'RGBA(0, 0, 0, 0)';
    this.bgCtx.clearRect(0, 0, this.width, this.height);

    let widthHalf = this.width / 2;
    let heightHalf = this.height / 2;

    for (let i = 0; i < this.stars.length; i++) {
      this.stars[i].draw(this.bgCtx, widthHalf, heightHalf);
    }
    requestAnimationFrame(this.animateStars);
  };

}