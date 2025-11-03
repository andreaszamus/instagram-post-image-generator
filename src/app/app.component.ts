import {AfterViewInit, Component, ElementRef, Inject, Input, ViewChild} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {AngularCropperjsModule, CropperComponent} from 'angular-cropperjs';
import {HttpClient, HttpClientModule, HttpHeaders, HttpResponse} from '@angular/common/http';
import {FormsModule} from "@angular/forms";
import { isDevMode, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AngularCropperjsModule, NgOptimizedImage, HttpClientModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent implements AfterViewInit {

  // image variables
  image = 'assets/icon.png'
  croppedImage: string = ''
  previewImage: any
  res = 'assets/Untitled.png'

  // text variables
  @Input() username: string = 'Andy y Pili'
  @Input() location: string = 'Bogotá'
  @Input() description: string = ''
  @Input() date: string = '05-SEP-2015'

  // button logic
  is_available_for_download: boolean = false

  constructor(private http: HttpClient, @Inject(LOCALE_ID) private locale: string) { }

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

  // drag-and-drop vars
  files: File[] = [];

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        this.files.push(event.dataTransfer.files[i]);
      }
    }
    this.processImage()
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        this.files.push(input.files[i]);
      }
    }
    this.processImage()
  }

  // process image after selected
  processImage(){
    console.log(this.files[0])
    if(this.files[0].size > 5000000){
      alert("File is too big!");
      return;
    }

    const mimeType = this.files[0].type;

    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(this.files[0]);
    reader.onload = (_event) => {
      this.previewImage = reader.result;
      this.image = this.previewImage
      this.step2.nativeElement.click()
    }
  }

  cropImage() {
    this.croppedImage = this.angularCropper.cropper.getCroppedCanvas({
      width: 820,
      height: 820
    }).toDataURL();
    this.previewImage = this.croppedImage;
    this.step3.nativeElement.click();
  };

  finishPreview() {
    this.step4.nativeElement.click();
  }

  addTexts() {
    console.log(this.username)
    this.step5.nativeElement.click();
  }

  postImage() {
    let headers = new HttpHeaders({
      'Content-Type' : 'application/json',
    });
    let data = {
      'image': this.croppedImage,
      'username': this.username,
      'location': this.location,
      'description': this.description,
      'date': this.date
    }

    let backend_url = ""
    if (isDevMode()) {
      backend_url = 'http://localhost:5000/test'
    } else {
      backend_url = ''
    }
    this.http.post(
        backend_url,
        data,
        { headers,  observe: 'body', responseType: 'text'}).subscribe(data => {
      this.res = data
      this.is_available_for_download = true
    })
  }

  downloadImage() {
    const link = document.createElement('a');
    link.href = this.res;
    let currentDateTime: Date = new Date();
    link.download = formatDate(currentDateTime, 'dd-MM-yyyy-hh:mm:ss', this.locale) + ".png"
    link.click();
  }

}
