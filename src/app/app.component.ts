import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {AngularCropperjsModule, CropperComponent} from 'angular-cropperjs';
import {HttpClient, HttpClientModule, HttpHeaders, HttpResponse} from '@angular/common/http';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AngularCropperjsModule, NgOptimizedImage, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent implements AfterViewInit {
  image = 'assets/icon.jpg'
  final: string = ''
  previewImage: any
  res = 'assets/Untitled.png'

  constructor(private http: HttpClient) { }

  @ViewChild('angularCropper') public angularCropper: CropperComponent;

  @ViewChild('step1') public step1: ElementRef
  @ViewChild('step2') public step2: ElementRef
  @ViewChild('step3') public step3: ElementRef
  @ViewChild('step4') public step4: ElementRef
  @ViewChild('step5') public step5: ElementRef

  ngAfterViewInit () {
    this.angularCropper.cropperOptions = {
      aspectRatio: 1,
      responsive: true,
      minContainerWidth: 500,
      minContainerHeight: 500
    }
  }

  selectFile(event: any) {
    if(!event.target.files[0] || event.target.files[0].length == 0) {
      return;
    }

    console.log(event.target.files[0].size)
    if(event.target.files[0].size > 2000000){
      alert("File is too big!");
      return;
    }

    const mimeType = event.target.files[0].type;

    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (_event) => {
      this.previewImage = reader.result;
      this.image = this.previewImage
      this.step2.nativeElement.click()
    }
  }

  cutImage() {
    this.final = this.angularCropper.cropper.getCroppedCanvas({
      width: 820,
      height: 820
    }).toDataURL();
    this.previewImage = this.final;
    this.step3.nativeElement.click();
  };

  finishPreview() {
    this.step4.nativeElement.click();
  }

  addedTexts() {
    this.step5.nativeElement.click();
  }

  postImage() {
    let headers = new HttpHeaders({
      'Content-Type' : 'application/json',
    });
    let data = {
      image: this.final,
      a2: "10"
    }
    this.http.post('https://hrsvkzwzlovrlophkbk4w6fkzq0imhmc.lambda-url.us-east-1.on.aws/', data, { headers,  observe: 'body', responseType: 'text'}).subscribe(data => {
      console.log(data);
      this.res = data
    })
  }

}

