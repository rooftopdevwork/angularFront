import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { NotFoundComponent } from './Parts/not-found/not-found.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent, outlet: 'content'
  },
  { path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  { path: '**', component: NotFoundComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
