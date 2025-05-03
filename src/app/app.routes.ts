import { Routes } from '@angular/router';
import { RoleSelectorComponent } from './components/role-selector/role-selector.component';
import { FileListComponent } from './components/file-list/file-list.component';
import { ImageGalleryComponent } from './components/image-gallery/image-gallery.component';
import { HostPageComponent } from './pages/host-page.component';
import { ConsumerPageComponent } from './pages/consumer-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/role-selector', pathMatch: 'full' },
  { path: 'role-selector', component: RoleSelectorComponent },
  { path: 'host', component: HostPageComponent },
  { path: 'consumer', component: ConsumerPageComponent },
]; 