import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {AngularCropperjsModule} from "angular-cropperjs";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};
