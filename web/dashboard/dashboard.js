let equipamentos = [];
const lista = document.getElementById('lista-equipamento');
const modal = document.getElementById('modal');
const detalhes = document.getElementById('detalhes');
const fecharModal = document.getElementById('fechar-modal');

const modalNovo = document.getElementById('modal-novo-equip');
const abrirNovoEquip = document.getElementById('abrir-novo-equip');
const fecharNovoEquip = document.getElementById('fechar-novo-equip');
const formNovo = document.getElementById('form-novo-equip');

abrirNovoEquip.addEventListener('click', (e) => {
  e.preventDefault();
  modalNovo.style.display = 'block';
});

fecharNovoEquip.addEventListener('click', () => {
  modalNovo.style.display = 'none';
});

formNovo.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btnEnviar = document.getElementById('btn-enviar-novo');
  btnEnviar.disabled = true;

  const nome = document.getElementById('novo-nome').value.trim();
  const imagem = document.getElementById('novo-imagem').value.trim();
  const descricao = document.getElementById('novo-descricao').value.trim();
  const ativo = document.getElementById('novo-ativo').checked ? 1 : 0;

  if (!nome || !imagem || !descricao) {
    alert('Preencha todos os campos.');
    btnEnviar.disabled = false;
    return;
  }

  try {
    const bodyNovo = { equipamento: nome, imagem, descricao, ativo, data: new Date().toISOString() };
    const resp = await fetch('http://localhost:3000/equipamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyNovo)
    });

    if (!resp.ok) throw new Error('Erro ao adicionar equipamento');

    modalNovo.style.display = 'none';
    formNovo.reset();
    await carregarEquipamentos();
  } catch (err) {
    console.error(err);
    alert('Não foi possível adicionar o equipamento.');
  } finally {
    btnEnviar.disabled = false;
  }
});

async function carregarEquipamentos() {
  try {
    const r = await fetch('http://localhost:3000/equipamento', { headers: { 'Cache-Control': 'no-cache' } });
    if (!r.ok) throw new Error('Erro ao carregar equipamentos');
    const data = await r.json();
    equipamentos = data;

    lista.innerHTML = data.map(eq => `
      <div class="equipamento-box">
        <img src="${eq.imagem}" alt="${eq.equipamento}" class="equipamento-img" />
        <div class="equipamento-info">
          <h2 class="equipamento-titulo"><em>${eq.equipamento}</em></h2>
          <p class="equipamento-desc">${eq.descricao}</p>
          <p><strong>Status:</strong> ${eq.ativo ? 'Ativo' : 'Inativo'}</p> <!-- opcional exibir ativo/inativo -->
          <div class="equipamento-actions">
            <button class="comentario-btn" data-id="${eq.id}" title="Comentários">
              <img src="assets/comentario.png" alt="Comentários" />
            </button>
            <button class="deletar-equip-btn" data-id="${eq.id}" title="Excluir equipamento">
              <img src="assets/deletar.png" alt="Excluir" />
            </button>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error(err);
    alert('Não foi possível carregar os equipamentos. Tente novamente mais tarde.');
  }
}

async function carregarComentarios(equipamentoId) {
  const url = `http://localhost:3000/comentario/equipamento/${encodeURIComponent(equipamentoId)}`;
  const resp = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
  if (!resp.ok) throw new Error('Erro ao carregar comentários');
  return resp.json();
}

lista.addEventListener('click', async (e) => {
  const btnComentario = e.target.closest('.comentario-btn');
  if (btnComentario) {
    const equipamentoId = btnComentario.getAttribute('data-id');
    const equip = equipamentos.find(eq => String(eq.id) === String(equipamentoId));
    if (!equip) return;

    modal.style.display = 'block';
    detalhes.innerHTML = `
      <div id="comentarios"><p>Carregando comentários…</p></div>
      <hr />
      <form id="form-comentario" autocomplete="off">
        <label for="comentario-texto">Novo comentário</label>
        <textarea id="comentario-texto" name="comentario" rows="3" required placeholder="Escreva seu comentário..."></textarea>
        <div style="margin-top:8px;">
          <input type="number" id="comentario-perfil" name="perfil" placeholder="ID do perfil (número)" required />
          <button type="submit" id="btn-enviar-comentario">Adicionar comentário</button>
        </div>
      </form>
    `;

    try {
      const listaComentarios = await carregarComentarios(equipamentoId);
      renderizarComentarios(listaComentarios, equipamentoId);
    } catch (err) {
      console.error(err);
      const comentariosEl = detalhes.querySelector('#comentarios');
      if (comentariosEl) comentariosEl.innerHTML = `<p>Falha ao carregar comentários.</p>`;
    }

    const form = detalhes.querySelector('#form-comentario');
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();

      const btnEnviar = detalhes.querySelector('#btn-enviar-comentario');
      btnEnviar.disabled = true;

      const comentario = detalhes.querySelector('#comentario-texto').value.trim();
      const perfilRaw = detalhes.querySelector('#comentario-perfil').value.trim();
      const perfilNum = Number(perfilRaw);
      const equipamentoNum = Number(equipamentoId);

      if (!comentario || Number.isNaN(perfilNum) || Number.isNaN(equipamentoNum)) {
        alert('Preencha o comentário e IDs numéricos válidos.');
        btnEnviar.disabled = false;
        return;
      }

      try {
        const bodyExato = { comentario, equipamento: equipamentoNum, perfil: perfilNum, data: new Date().toISOString() };
        const urlPost = "http://localhost:3000/comentario";
        const respPost = await fetch(urlPost, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyExato)
        });

        if (!respPost.ok) throw new Error('Erro ao salvar comentário');

        detalhes.querySelector('#comentario-texto').value = '';
        const atualizada = await carregarComentarios(equipamentoId);
        renderizarComentarios(atualizada, equipamentoId);

      } catch (err) {
        console.error(err);
        alert('Não foi possível enviar o comentário.');
      } finally {
        btnEnviar.disabled = false;
      }
    });

    function renderizarComentarios(listaComentarios, equipamentoId) {
      const comentariosEl = detalhes.querySelector('#comentarios');
      if (!Array.isArray(listaComentarios) || listaComentarios.length === 0) {
        comentariosEl.innerHTML = `<p>Nenhum comentário encontrado.</p>`;
        return;
      }
      comentariosEl.innerHTML = `
        <h4>Comentários</h4>
        <ul class="lista-comentarios">
          ${listaComentarios.map(c => {
            const dataFmt = c.data ? new Date(c.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
            return `<li class="comentario-item">
              <p><strong>Perfil:</strong> ${c.perfil ?? 'N/A'}</p>
              <p><strong>Data:</strong> ${dataFmt}</p>
              <p>${c.comentario}</p>
            </li>`;
          }).join('')}
        </ul>
      `;
    }
  }

  const btnExcluirEquip = e.target.closest('.deletar-equip-btn');
  if (btnExcluirEquip) {
    const equipamentoId = btnExcluirEquip.getAttribute('data-id');
    if (!confirm('Tem certeza que deseja excluir este equipamento?')) return;

    try {
      const respDel = await fetch(`http://localhost:3000/equipamento/${equipamentoId}`, { method: "DELETE" });
      if (!respDel.ok) throw new Error('Erro ao excluir equipamento');
      await carregarEquipamentos();
    } catch (err) {
      console.error(err);
      alert('Não foi possível excluir o equipamento.');
    }
  }
});

fecharModal.addEventListener('click', () => { modal.style.display = 'none'; });

carregarEquipamentos();