import { Routes } from '@angular/router';
import { AlunoComponent } from './aluno-component/aluno-component';
import { MenuComponent } from './menu-component/menu-component';

export const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'alunos', component: AlunoComponent },
  { path: '**', redirectTo: '' }
];
