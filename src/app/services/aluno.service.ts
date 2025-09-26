import { inject, Injectable } from '@angular/core';
import { AlunoModel } from '../models/alunoModel';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {
  private http = inject(HttpClient);
  private baseApiUrl = 'http://localhost:8080/alunos';
  private alunos: AlunoModel[] = [];

  listar(): Observable<AlunoModel[]> {
    return this.http.get<AlunoModel[]>(`${this.baseApiUrl}/listar`).pipe(catchError(this.handle));
  }

  adicionar(aluno: AlunoModel): Observable<AlunoModel> {
    return this.http.post<AlunoModel>(`${this.baseApiUrl}/salvar`, aluno).pipe(catchError(this.handle));
  }

  remover(id: string): Observable<string> {
    return this.http.delete(`${this.baseApiUrl}/apagar/${id}`, { responseType: 'text' })
      .pipe(catchError(this.handle));
  }

  editar(id: string, aluno: AlunoModel): Observable<AlunoModel> {
    return this.http.put<AlunoModel>(`${this.baseApiUrl}/editar/${id}`, aluno)
      .pipe(catchError(this.handle));
  }

  buscarPorNome(nomeBusca: string): Observable<AlunoModel[]> {
    return this.http.get<AlunoModel[]>(`${this.baseApiUrl}/buscar-por-nome?nomeBusca=${nomeBusca}`)
      .pipe(catchError(this.handle));
  }

  buscarPorCurso(cursoBusca: string): Observable<AlunoModel[]> {
    return this.http.get<AlunoModel[]>(`${this.baseApiUrl}/buscar-por-curso?cursoBusca=${cursoBusca}`)
      .pipe(catchError(this.handle));
  }

  private handle(err: HttpErrorResponse) {
    const msg = err.error?.message || err.error?.erro || err.message || 'Erro inesperado';
    return throwError(() => new Error(msg));
  }
}
