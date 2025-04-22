// Configuração inicial e constantes globais

// URL's da nossa API (Backend)
const ENDPOINT_CADASTRO = 'projetoacademiabackend.vercel.app/admin'; // POST para cadastrar e PUT para atualizar
const ENDPOINT_LISTA_TODOS = "projetoacademiabackend.vercel.app/admin"; // GET para listar todos
const ENDPOINT_EXCLUIR = "projetoacademiabackend.vercel.app/admin/"; // DELETE para excluir (o ID será adicionado)

// Ligando com os elementos HTML

// Ligando os formulários

// Formulário de criação
let formularioCriacao = document.getElementById('create-form');
let inputCpfCriacao = document.getElementById('create-cpf');
let inputNomeCriacao = document.getElementById('create-nome');

// Formulário de Atualização (edição)
let formularioAtualizacao = document.getElementById('update-form');
let inputAtualizacaoId = document.getElementById('update-id');
let inputCpfAtualizacao = document.getElementById('update-cpf');
let inputNomeAtualizacao = document.getElementById('update-nome');
let botaoCancelarAtualizacao = document.getElementById('cancel-update');

// Lista (elementos <div>) onde os cadastros serão exibidos
let listaCadastrosElemento = document.getElementById('item-list');

// ===========================================================
// FUNÇÕES PARA INTERAGIR COM API
// ===========================================================

// READ (Listar os cadastros no elemento lista)

async function buscarListarCadastros() {
    console.log("Buscando cadastros na API....");
    listaCadastrosElemento.innerHTML = '<p>Carregando cadastros...</p>';

    try {
        const respostaHttp = await fetch(ENDPOINT_LISTA_TODOS);

        if(!respostaHttp.ok){
            throw new Error(`Erro na API: ${respostaHttp.status} ${respostaHttp.statusText}`);
        }

        const cadastros = await respostaHttp.json();

        console.log("Cadastros recebidos: ", cadastros);

        exibirCadastrosNaTela(cadastros);

    } catch (erro) {
        console.error(`Falha ao buscar cadastros: ${erro}`);
        listaCadastrosElemento.innerHTML = `
        <p style="color: red;">Erro ao carregar cadastros: ${erro.message}</p>`;
    }
}

// --- CREATE (Criar um novo cadastro) ---
async function criarCadastro(evento) {
    evento.preventDefault(); // Previne o comportamento padrão do formulário (que é recarregar a página)
    console.log("Tentando criar novo cadastro...");

    const cpf = inputCpfCriacao.value;
    const nome = inputNomeCriacao.value;

    if (!cpf || !nome) {
        alert("Por favor, preencha o CPF e o nome.");
        return;
    }

    const novoCadastro = {
        cpf: cpf,
        nome: nome
    };

    try {
        const respostaHttp = await fetch(ENDPOINT_CADASTRO, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(novoCadastro)
        });

        const resultadoApi = await respostaHttp.json();

        if (!respostaHttp.ok) {
            throw new Error(resultadoApi.mensagem || `Erro ao criar cadastro: ${respostaHttp.status}`);
        }

        console.log("Cadastro realizado com sucesso!", resultadoApi);
        alert(resultadoApi.mensagem);

        inputCpfCriacao.value = '';
        inputNomeCriacao.value = '';

        await buscarListarCadastros();

    } catch (erro) {
        console.error("Falha ao criar cadastro:", erro);
        alert(`Erro ao criar cadastro: ${erro.message}`);
    }
}

// --- UPDATE (Atualizar um cadastro existente) ---
async function atualizarCadastro(evento) {
    evento.preventDefault();
    console.log("Tentando atualizar cadastro...");

    const id = inputAtualizacaoId.value;
    const cpf = inputCpfAtualizacao.value;
    const nome = inputNomeAtualizacao.value;

    const dadosCadastroAtualizado = {
        id: parseInt(id), // Certifique-se que o ID seja um número inteiro
        cpf: cpf,
        nome: nome
    };

    if (!id) {
        console.error("ID do cadastro para atualização não encontrado!");
        alert("Erro interno: ID do cadastro não encontrado para atualizar.");
        return;
    }

    if (!cpf || !nome) {
        alert("Por favor, preencha o CPF e o nome para atualizar.");
        return;
    }

    try {
        const respostaHttp = await fetch(ENDPOINT_CADASTRO, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosCadastroAtualizado)
        });

        const resultadoApi = await respostaHttp.json();

        if (!respostaHttp.ok) {
            throw new Error(resultadoApi.mensagem || `Erro ao atualizar cadastro: ${respostaHttp.status}`);
        }

        console.log("Cadastro atualizado com sucesso! ID:", id);
        alert(resultadoApi.mensagem);

        esconderFormularioAtualizacao();
        await buscarListarCadastros();

    } catch (erro) {
        console.error("Falha ao atualizar cadastro:", erro);
        alert(`Erro ao atualizar cadastro: ${erro.message}`);
    }
}

// --- DELETE (Excluir um cadastro) ---
async function excluirCadastro(id) {
    console.log(`Tentando excluir cadastro com ID: ${id}`);

    if (!confirm(`Tem certeza que deseja excluir o cadastro com ID ${id}? Esta ação não pode ser desfeita.`)) {
        console.log("Exclusão cancelada pelo usuário.");
        return;
    }

    try {
        const respostaHttp = await fetch(`${ENDPOINT_EXCLUIR}${id}`, {
            method: 'DELETE'
        });

        const resultadoApi = await respostaHttp.json();

        if (!respostaHttp.ok) {
            throw new Error(resultadoApi.mensagem || `Erro ao excluir cadastro: ${respostaHttp.status}`);
        }

        console.log("Cadastro excluído com sucesso!", id);
        alert(resultadoApi.mensagem);

        await buscarListarCadastros();

    } catch (erro) {
        console.error("Falha ao excluir cadastro:", erro);
        alert(`Erro ao excluir cadastro: ${erro.message}`);
    }
}

// ============================================================
// FUNÇÕES PARA MANIPULAR O HTML (Atualizar a Página)
// ============================================================

// --- Mostrar os cadastros na lista ---
function exibirCadastrosNaTela(cadastros) {
    console.log("Atualizando a lista de cadastros na tela...");
    listaCadastrosElemento.innerHTML = '';

    if (!cadastros || cadastros.length === 0) {
        listaCadastrosElemento.innerHTML = '<p>Nenhum cadastro encontrado ainda.</p>';
        return;
    }

    for (const cadastro of cadastros) {
        const elementoCadastroDiv = document.createElement('div');
        elementoCadastroDiv.classList.add('border', 'border-gray-300', 'p-2', 'mb-3', 'rounded', 'flex', 'justify-between', 'items-center');
        elementoCadastroDiv.id = `cadastro-${cadastro.id}`;

        elementoCadastroDiv.innerHTML = `
            <div class="flex-grow mr-3">
                <strong>${cadastro.nome}</strong>
                <p><small>CPF: ${cadastro.cpf}</small></p>
                <p><small>ID: ${cadastro.id}</small></p>
            </div>
            <div>
                <button class="edit-btn bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-1 px-2 rounded text-sm ml-1">Editar</button>
                <button class="delete-btn bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm ml-1">Excluir</button>
            </div>
        `;

        const botaoEditar = elementoCadastroDiv.querySelector('.edit-btn');
        botaoEditar.addEventListener('click', function() {
            console.log(`Botão Editar clicado para o cadastro ID: ${cadastro.id}`);
            exibirFormularioAtualizacao(cadastro.id, cadastro.cpf, cadastro.nome);
        });

        const botaoExcluir = elementoCadastroDiv.querySelector('.delete-btn');
        botaoExcluir.addEventListener('click', function() {
            console.log(`Botão Excluir clicado para o cadastro ID: ${cadastro.id}`);
            excluirCadastro(cadastro.id);
        });

        listaCadastrosElemento.appendChild(elementoCadastroDiv);
    }
}

// --- Mostrar o formulário de atualização (edição) ---
function exibirFormularioAtualizacao(id, cpf, nome) {
    console.log("Mostrando formulário de atualização para o cadastro ID:", id);
    inputAtualizacaoId.value = id;
    inputCpfAtualizacao.value = cpf;
    inputNomeAtualizacao.value = nome;

    formularioAtualizacao.classList.remove('hidden');
    formularioCriacao.classList.add('hidden');

    formularioAtualizacao.scrollIntoView({ behavior: 'smooth' });
}

// --- Esconder o formulário de atualização ---
function esconderFormularioAtualizacao() {
    console.log("Escondendo formulário de atualização.");
    formularioAtualizacao.classList.add('hidden');
    formularioCriacao.classList.remove('hidden');

    inputAtualizacaoId.value = '';
    inputCpfAtualizacao.value = '';
    inputNomeAtualizacao.value = '';
}


// ==============================================================
// EVENT LISTENERS GLOBAIS (Campainhas principais da página)
// ==============================================================

formularioCriacao.addEventListener('submit', criarCadastro);
formularioAtualizacao.addEventListener('submit', atualizarCadastro);
botaoCancelarAtualizacao.addEventListener('click', esconderFormularioAtualizacao);

// INICIALIZAÇÃO DA PÁGINA

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM completamente carregado. Iniciando busca de cadastros...");
    buscarListarCadastros();
});