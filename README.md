![alt text](https://github.com/DiegoWebwork/estrutura-de-dados/blob/main/universidade%20de%20vassouras%20Vertical.png)

# Curso: Engenharia de Software
# Aluno: Diego Rios dos Santos (202010774)
# Disciplina: ENGENHARIA DE SOFTWARE CONTINUA 8º Periodo
# Professor: Fabricio Dias

# Plataforma EduNotes

Um aplicativo web para gerenciamento de cursos, matrículas e progresso dos alunos.

## Pré-requisitos

- Node.js

## Instalação

1. Clone o repositório no Replit
2. Instale as dependências:
```bash
npm install
```

## Executando o Aplicativo

1. Clique no botão "Run" no Replit, ou execute:
```bash
npm run dev
```

2. O aplicativo estará disponível na porta 5000

## Funcionalidades

- Autenticação de usuários (alunos e administradores)
- Gerenciamento de cursos
- Matrícula de alunos
- Acompanhamento de progresso
- Sistema de notas

## Estrutura do Projeto

- `client/`: Aplicativo frontend em React
- `server/`: Servidor backend em Express
- `shared/`: Tipos e esquemas compartilhados

## Rotas da API

- `/api/auth`: Endpoints de autenticação
- `/api/courses`: Gerenciamento de cursos
- `/api/enrollments`: Gerenciamento de matrículas
- `/api/users`: Gerenciamento de usuários

## Stack Tecnológico

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Express.js, PostgreSQL
- Autenticação: Passport.js
- API: REST

## Diagrama UML
![alt text](https://github.com/DiegoWebwork/EduNotes-P1/blob/main/uml.png)

## Modelo relacional
![alt text](https://github.com/DiegoWebwork/EduNotes-P1/blob/main/relacionamentos.png)
