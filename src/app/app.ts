import { Component, OnInit, signal } from '@angular/core';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { Product } from './features/Product/Component/product/product';
import { RouterOutlet } from '@angular/router';





@Component({
  imports: [Navbar, Footer, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('my-app');
  categ:any;

ngOnInit(): void {

}



}









