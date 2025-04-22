async function validarCPF() {
  const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
  const msg = document.getElementById('mensagem');

  if (cpf.length !== 11) {
      msg.textContent = 'CPF inválido.';
      msg.style.color = 'red';
      return;
  }

  try {
      const response = await fetch(`projetoacademiabackend.vercel.app/admin/consultar_cpf?cpf=${cpf}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      });

      if (response.ok) {
          const data = await response.json();
          if (data && data.nome) {
              msg.textContent = `Bem-vindo(a) à academia, ${data.nome}!`;
              msg.style.color = 'green';
          } else {
              msg.textContent = 'CPF encontrado, mas sem informações de nome.';
              msg.style.color = 'orange';
              console.warn('Resposta do backend sem o campo "nome":', data);
          }
      } else if (response.status === 404) {
          msg.textContent = 'CPF não encontrado. Consulte a secretaria.';
          msg.style.color = 'red';
      } else {
          msg.textContent = `Erro ao consultar o CPF: ${response.status}`;
          msg.style.color = 'red';
          console.error('Erro na requisição:', response.status, response.statusText);
          try {
              const errorData = await response.json();
              console.error('Detalhes do erro:', errorData);
              if (errorData && errorData.mensagem) {
                  msg.textContent = errorData.mensagem;
              }
          } catch (jsonError) {
              console.error('Erro ao parsear JSON de erro:', jsonError);
          }
      }

  } catch (error) {
      msg.textContent = 'Erro de conexão com o servidor.';
      msg.style.color = 'red';
      console.error('Erro de fetch:', error);
  }
}

function addDigit(num) {
  const input = document.getElementById('cpf');
  const current = input.value.replace(/\D/g, '');

  if (current.length < 11) {
      input.value += num;
  }
}

function clearCPF() {
  const input = document.getElementById('cpf');
  input.value = input.value.slice(0, -1);
}