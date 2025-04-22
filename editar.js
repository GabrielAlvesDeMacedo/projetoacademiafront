const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

let alunos = [];
let idAtual = 1;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Página principal
app.get('/', (req, res) => {
  let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Admin Impulso Fit</title>
      <link rel="stylesheet" href="style2.css">
    </head>
    <body>
      <div class="container">
        <h1>Admin Impulso Fit</h1>
        <div class="form-box">
          <h2>Cadastrar aluno</h2>
          <form method="POST" action="/cadastrar">
            <label for="nome">Nome:</label>
            <input type="text" id="nome" name="nome" required>

            <label for="cpf">CPF:</label>
            <input type="text" id="cpf" name="cpf" required>

            <button type="submit" class="btn-add">Cadastrar aluno</button>

            <select class="form-select" id="formato" name="status" required>
              <option value="">Escolha uma opção...</option>
              <option value="Liberado">Liberado</option>
              <option value="Bloqueado">Bloqueado</option>
            </select>
          </form>
        </div>
        <hr>
        <h2>Alunos cadastrados</h2>
  `;

  alunos.forEach(aluno => {
    html += `
      <div class="aluno-card">
        <p><strong>Nome:</strong> ${aluno.nome}</p>
        <p><strong>CPF:</strong> ${aluno.cpf}</p>
        <p><strong>Status:</strong> ${aluno.status}</p>
        <p><strong>ID:</strong> ${aluno.id}</p>
        <div class="actions">
          <button onclick="window.location.href='/editar?id=${aluno.id}'" class="btn-edit">Editar</button>
          <form method="POST" action="/excluir" style="display:inline;">
            <input type="hidden" name="id" value="${aluno.id}">
            <button type="submit" class="btn-delete">Excluir</button>
          </form>
        </div>
      </div>
    `;
  });

  html += `
      </div>
      <script src="https://cdn.jsdelivr.net/npm/inputmask@5.0.8/dist/inputmask.min.js"></script>
      <script>
        Inputmask("999.999.999-99").mask(document.getElementById("cpf"));
      </script>
    </body>
    </html>
  `;

  res.send(html);
});

// Cadastrar aluno
app.post('/cadastrar', (req, res) => {
  const { nome, cpf, status } = req.body;

  if (!nome || !cpf || !status) return res.status(400).send('Preencha todos os campos');

  alunos.push({ id: idAtual++, nome, cpf, status });
  res.redirect('/');
});

// Rota para editar
app.get('/editar', (req, res) => {
  const aluno = alunos.find(a => a.id == req.query.id);
  if (!aluno) return res.status(404).send('Aluno não encontrado');

  res.send(`
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Editar Aluno</title>
        <link rel="stylesheet" href="style2.css">
      </head>
      <body>
        <div class="container">
          <h1>Editar Aluno</h1>
          <form method="POST" action="/salvar">
            <input type="hidden" name="id" value="${aluno.id}">
            <label>Nome:</label>
            <input type="text" name="nome" value="${aluno.nome}" required>
            <label>CPF:</label>
            <input type="text" id="cpf" name="cpf" value="${aluno.cpf}" required>
            <label>Status:</label>
            <select name="status" required>
              <option value="Liberado" ${aluno.status === 'Liberado' ? 'selected' : ''}>Liberado</option>
              <option value="Bloqueado" ${aluno.status === 'Bloqueado' ? 'selected' : ''}>Bloqueado</option>
            </select>
            <button type="submit" class="btn-edit">Salvar alterações</button>
          </form>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/inputmask@5.0.8/dist/inputmask.min.js"></script>
        <script>
          Inputmask("999.999.999-99").mask(document.getElementById("cpf"));
        </script>
      </body>
    </html>
  `);
});

// Salvar edição
app.post('/salvar', (req, res) => {
  const { id, nome, cpf, status } = req.body;
  const aluno = alunos.find(a => a.id == id);

  if (aluno) {
    aluno.nome = nome;
    aluno.cpf = cpf;
    aluno.status = status;
    res.redirect('/');
  } else {
    res.status(404).send('Aluno não encontrado');
  }
});

// Excluir aluno
app.post('/excluir', (req, res) => {
  alunos = alunos.filter(a => a.id != req.body.id);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
