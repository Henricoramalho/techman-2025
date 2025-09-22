const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

//Importando os dados de arquivo csv para variáveis
const perfisData = fs.readFileSync('./prisma/perfis.csv', 'utf8');
const usuariosData = fs.readFileSync('./prisma/usuarios.csv', 'utf8');
const equipamentosData = fs.readFileSync('./prisma/equipamentos.csv', 'utf8');
const comentariosData = fs.readFileSync('./prisma/comentarios.csv', 'utf8');

async function main() {
    //Extraindo de strings para arrays de objetos ignorando o primeiro elemento que é o cabeçalho
    const perfis = await perfisData.split('\r\n').map((linha, i) => {
        const [id, perfil] = linha.split(';');
        return {
            id: Number(id),
            perfil
        }
    });
    //Extraindo de strings para arrays de objetos ignorando o primeiro elemento que é o cabeçalho
    const usuarios = await usuariosData.split('\r\n').map((linha, i) => {
        const [id, senha, perfil] = linha.split(';');
        return {
            id: Number(id),
            senha,
            perfil: Number(perfil)
        }

    });
    //Extraindo de strings para arrays de objetos ignorando o primeiro elemento que é o cabeçalho
    const equipamentos = equipamentosData.split('\r\n').map((linha, i) => {
        const [id, equipamento, imagem, descricao, ativo, data] = linha.split(';');
        return {
            id: Number(id),
            equipamento,
            imagem,
            descricao,
            ativo: Number(ativo),
            data: new Date(data)
        }
    });
    //Extraindo de strings para arrays de objetos ignorando o primeiro elemento que é o cabeçalho
    const comentarios = comentariosData.split('\r\n').map((linha, i) => {
        const [id, comentario, equipamento, perfil, data] = linha.split(';');
        return {
            id: Number(id),
            comentario,
            equipamento: Number(equipamento),
            perfil: Number(perfil),
            data: new Date(data)
        }
    });

    perfis.shift(); //Removendo o primeiro elemento que é o cabeçalho
    usuarios.shift(); //Removendo o primeiro elemento que é o cabeçalho
    equipamentos.shift(); //Removendo o primeiro elemento que é o cabeçalho
    comentarios.shift(); //Removendo o primeiro elemento que é o cabeçalho

    //Escrevendo os dados no banco de dados
    for (const perfil of perfis) {
        await prisma.perfil.create({
            data: perfil
        });
    }
    //Escrevendo os dados no banco de dados
    for (const usuario of usuarios) {
        await prisma.usuario.create({
            data: usuario
        });
    }
    //Escrevendo os dados no banco de dados
    for (const equipamento of equipamentos) {
        await prisma.equipamento.create({
            data: equipamento
        });
    }
    //Escrevendo os dados no banco de dados
    for (const comentario of comentarios) {
        await prisma.comentario.create({
            data: comentario
        });
    }
}

//Executando a função main
main()
    .then(async () => {
        await prisma.$disconnect()
        console.log('Semente completa!');
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });