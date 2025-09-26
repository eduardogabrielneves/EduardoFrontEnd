import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlunoService } from '../services/aluno.service';
import { AlunoModel } from '../models/alunoModel';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-aluno-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './aluno-component.html',
  styleUrls: ['./aluno-component.css']
})
export class AlunoComponent implements OnInit, AfterViewInit {

  @ViewChild('alunoModal') alunoModalElement!: ElementRef;
  private alunoModal: any;

  alunos: AlunoModel[] = [];
  alunoSelecionado: AlunoModel = { nome: '', curso: '', telefone: '' };
  modoEdicao: boolean = false;
  
  buscaNome: string = '';
  buscaCurso: string = '';

  formMessage: string | null = null;
  formMessageType: 'success' | 'error' = 'success';

  listMessage: string | null = null;
  listMessageType: 'success' | 'error' | 'info' = 'info';

  constructor(private alunoService: AlunoService) {}

  ngOnInit(): void {
    this.listarAlunos();
  }

  ngAfterViewInit(): void {
    this.alunoModal = new bootstrap.Modal(this.alunoModalElement.nativeElement);
  }

  listarAlunos(): void {
    this.listMessage = 'Carregando alunos...';
    this.listMessageType = 'info';
    this.alunoService.listar().subscribe({
      next: (data: AlunoModel[]) => {
        this.alunos = data;
        this.listMessage = null;
      },
      error: (err) => {
        console.error('Erro ao listar alunos:', err);
        this.listMessage = 'Erro ao carregar a lista de alunos. Tente novamente mais tarde.';
        this.listMessageType = 'error';
      }
    });
  }

  salvarAluno(): void {
    this.formMessage = null;
    
    const onSaveSuccess = (message: string) => {
      this.listarAlunos();
      this.alunoModal.hide();
      this.resetForm();
      this.listMessage = message;
      this.listMessageType = 'success';
      setTimeout(() => this.listMessage = null, 5000);
    };

    const onSaveError = (err: any, action: string) => {
      this.formMessage = `Erro ao ${action} aluno: ` + (err.error?.message || err.message || 'Erro desconhecido.');
      this.formMessageType = 'error';
    };

    if (this.modoEdicao && this.alunoSelecionado.id) {
      this.alunoService.editar(this.alunoSelecionado.id, this.alunoSelecionado).subscribe({
        next: () => onSaveSuccess('Aluno atualizado com sucesso!'),
        error: (err) => onSaveError(err, 'atualizar')
      });
    } else {
      const { id, ...alunoSemId } = this.alunoSelecionado;
      this.alunoService.adicionar(alunoSemId).subscribe({
        next: () => onSaveSuccess('Aluno adicionado com sucesso!'),
        error: (err) => onSaveError(err, 'adicionar')
      });
    }
  }

  abrirModal(): void {
    this.resetForm();
    this.modoEdicao = false;
    this.alunoModal.show();
  }
  
  editarAluno(aluno: AlunoModel): void {
    this.alunoSelecionado = { ...aluno };
    this.modoEdicao = true;
    this.formMessage = null;
    this.alunoModal.show();
  }

  apagarAluno(id?: string): void {
    if (!id) return;
    if (confirm('Tem certeza que deseja apagar este aluno? Esta ação não pode ser desfeita.')) {
      this.alunoService.remover(id).subscribe({
        next: () => {
          this.listarAlunos();
          this.listMessage = 'Aluno apagado com sucesso!';
          this.listMessageType = 'success';
          setTimeout(() => this.listMessage = null, 5000);
        },
        error: (err) => {
          console.error('Erro ao apagar aluno:', err);
          this.listMessage = 'Erro ao apagar aluno: ' + (err.error?.message || err.message || 'Erro desconhecido.');
          this.listMessageType = 'error';
        }
      });
    }
  }

  buscarAlunos(tipo: 'nome' | 'curso'): void {
    this.listMessage = 'Buscando alunos...';
    this.listMessageType = 'info';
    this.alunos = [];

    const busca = tipo === 'nome' ? this.buscaNome : this.buscaCurso;
    if (!busca.trim()) {
      this.listarAlunos();
      return;
    }

    const buscaObservable = tipo === 'nome' ? this.alunoService.buscarPorNome(busca) : this.alunoService.buscarPorCurso(busca);

    buscaObservable.subscribe({
      next: (data: AlunoModel[]) => {
        this.alunos = data;
        if (data.length === 0) {
          this.listMessage = `Nenhum aluno encontrado para a busca: '${busca}'.`;
          this.listMessageType = 'info';
        } else {
          this.listMessage = null;
        }
      },
      error: (err) => {
        console.error('Erro na busca:', err);
        this.listMessage = 'Erro ao realizar a busca.';
        this.listMessageType = 'error';
        this.alunos = [];
      }
    });
  }

  resetForm(): void {
    this.alunoSelecionado = { nome: '', curso: '', telefone: '' };
    this.modoEdicao = false;
    this.formMessage = null;
  }
}