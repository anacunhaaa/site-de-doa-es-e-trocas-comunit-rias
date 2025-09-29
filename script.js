// =======================================================
// 1. GESTÃO DE UI E NAVEGAÇÃO
// =======================================================

function showSection(sectionId) {
    // 1. Esconde todas as seções
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    // 2. Mostra a seção desejada
    document.getElementById(sectionId).classList.add('active');
    
    // 3. Atualiza o estado ativo no menu lateral
    document.querySelectorAll('.sidebar li').forEach(li => {
        li.classList.remove('active');
        if (li.getAttribute('onclick').includes(sectionId)) {
            li.classList.add('active');
        }
    });
}

// Inicialização: Mostra o dashboard ao carregar
document.addEventListener('DOMContentLoaded', () => {
    showSection('dashboard');
    // Chama a função de carregamento de dados
    loadAllData();
});

// Oculta o campo de interesse de troca se o tipo for Doação
document.getElementById('tipo-publicacao').addEventListener('change', (event) => {
    const group = document.getElementById('troca-interesse-group');
    if (event.target.value === 'troca') {
        group.style.display = 'block';
        document.getElementById('interesse-troca').setAttribute('required', 'required');
    } else {
        group.style.display = 'none';
        document.getElementById('interesse-troca').removeAttribute('required');
    }
});


// =======================================================
// 2. GESTÃO DE DADOS (LocalStorage)
// =======================================================

let itens = JSON.parse(localStorage.getItem('community_itens')) || [];
let userProfile = JSON.parse(localStorage.getItem('user_profile')) || {
    name: 'Usuário Comunitário',
    points: 100,
    donations: 0,
    trades: 0,
    location: null // Para geolocalização
};

function saveAllData() {
    localStorage.setItem('community_itens', JSON.stringify(itens));
    localStorage.setItem('user_profile', JSON.stringify(userProfile));
    updateGamificationUI();
}

function loadAllData() {
    updateGamificationUI();
    renderCatalogo();
    // Inicia a geolocalização ao carregar
    getInitialLocation();
}


// =======================================================
// 3. CADASTRO DE ITEM AVANÇADO
// =======================================================

document.getElementById('form-cadastro-avancado').addEventListener('submit', (event) => {
    event.preventDefault();

    const tipo = document.getElementById('tipo-publicacao').value;
    const nome = document.getElementById('nome-item').value;
    const descricao = document.getElementById('descricao-item').value;
    const categoria = document.getElementById('categoria').value;
    const interesseTroca = (tipo === 'troca') ? document.getElementById('interesse-troca').value : '';
    const fotoFile = document.getElementById('foto-item').files[0]; // Pega o primeiro arquivo

    // Simulação de URL de foto (em um projeto real, você faria o upload para um servidor)
    const fotoUrl = fotoFile ? URL.createObjectURL(fotoFile) : 'placeholder.jpg'; 

    const newItem = {
        id: Date.now(),
        tipo,
        nome,
        descricao,
        categoria,
        interesseTroca,
        fotoUrl,
        data: new Date().toLocaleDateString('pt-BR'),
        // Simulando localização do usuário no momento do cadastro
        latitude: userProfile.location ? userProfile.location.lat : null,
        longitude: userProfile.location ? userProfile.location.lon : null
    };

    itens.unshift(newItem); // Adiciona ao início
    
    // ATUALIZAÇÃO DA GAMIFICAÇÃO
    userProfile.points += 10; // +10 pontos por publicar
    
    saveAllData();
    renderCatalogo();
    document.getElementById('form-cadastro-avancado').reset();
    showSection('catalogo');
    alert('Item publicado! Você ganhou 10 pontos.');
});


// =======================================================
// 4. CATÁLOGO E FILTROS
// =======================================================

function renderCatalogo(filteredItens = itens) {
    const container = document.getElementById('catalogo-container');
    container.innerHTML = '';

    if (filteredItens.length === 0) {
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-style: italic;">Não há itens disponíveis com esses filtros.</p>';
        return;
    }

    filteredItens.forEach(item => {
        const card = document.createElement('div');
        const tagClass = item.tipo === 'doacao' ? 'tag-doacao' : 'tag-troca';
        
        card.classList.add('item-card');
        card.innerHTML = `
            <span class="tag-tipo ${tagClass}">${item.tipo === 'doacao' ? 'DOAÇÃO' : 'TROCA'}</span>
            <h4>${item.nome}</h4>
            <p><strong>Categoria:</strong> ${item.categoria}</p>
            <p>${item.descricao.substring(0, 80)}...</p>
            ${item.tipo === 'troca' ? `<p class="text-troca">Deseja: <em>${item.interesseTroca}</em></p>` : ''}
            <img src="${item.fotoUrl}" alt="${item.nome}" style="width:100%; height:150px; object-fit:cover; border-radius:4px; margin-top:10px;">
            <button class="btn-primary" style="margin-top:10px; width:100%;">Tenho Interesse!</button>
        `;
        container.appendChild(card);
    });
}

// Lógica de Filtragem e Busca (a ser completada em um projeto real)
// document.getElementById('search-input').addEventListener('input', applyFilters);
// document.getElementById('filter-tipo').addEventListener('change', applyFilters);
// ...


// =======================================================
// 5. GEOLOCALIZAÇÃO E MAPA (Simulação)
// =======================================================

function getInitialLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userProfile.location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                console.log("Localização obtida:", userProfile.location);
                // Aqui você chamaria uma função para carregar o mapa com os itens
                // loadMap(itens, userProfile.location);
                saveAllData();
            },
            (error) => {
                console.error("Erro na geolocalização:", error.message);
                // Define uma localização padrão se falhar
                userProfile.location = { lat: -25.42, lon: -49.27 }; // Curitiba, PR
                saveAllData();
            }
        );
    } else {
        console.error("Geolocalização não suportada pelo navegador.");
    }
}


// =======================================================
// 6. GAMIFICAÇÃO E PERFIL
// =======================================================

function updateGamificationUI() {
    const level = Math.floor(userProfile.points / 100) + 1; // Nível a cada 100 pontos
    document.getElementById('user-name').textContent = userProfile.name;
    document.getElementById('user-points').textContent = `🪙 ${userProfile.points} Pontos`;
    document.getElementById('donations-count').textContent = userProfile.donations;
    document.getElementById('trades-count').textContent = userProfile.trades;
    document.getElementById('user-level').textContent = `Nível ${level}`;
}

// Salvar perfil
document.getElementById('form-perfil').addEventListener('submit', (event) => {
    event.preventDefault();
    userProfile.name = document.getElementById('perfil-nome').value;
    // ... atualiza outros campos do perfil
    saveAllData();
    updateGamificationUI();
    alert('Perfil atualizado com sucesso!');
});

// Exemplo de como marcar uma doação concluída:
/*
function completeDonation() {
    userProfile.donations += 1;
    userProfile.points += 50; // Recompensa extra
    saveAllData();
    alert('Parabéns pela sua doação! +50 pontos!');
}
*/