import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('--- Application Bootstrap Successful ---'))
  .catch((err) => console.error('--- Application Bootstrap Failed ---', err));
