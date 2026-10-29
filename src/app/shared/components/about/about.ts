import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {
  
  // الأرقام اللي بتظهر على الشاشة (هتبدأ من 0)
  displayClients = 0;
  displayProducts = 0;
  displayYears = 0;

  // الأرقام النهائية اللي عايز توصلها
  targetClients = 40;
  targetProducts = 100;
  targetYears = 2;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.startCountUp();
  }

  startCountUp() {
    const duration = 2000; 
    const steps = 50;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      
      this.displayClients = Math.floor((this.targetClients / steps) * currentStep);
      this.displayProducts = Math.floor((this.targetProducts / steps) * currentStep);
      this.displayYears = Math.floor((this.targetYears / steps) * currentStep);

      this.cdr.detectChanges();

      if (currentStep >= steps) {
        clearInterval(timer);
        this.displayClients = this.targetClients;
        this.displayProducts = this.targetProducts;
        this.displayYears = this.targetYears;
        this.cdr.detectChanges(); 
      }
    }, stepTime);
  }
}