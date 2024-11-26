// Importação de pacote para entrada de dados
const input = require('readline-sync');
// Importação do cliente HTTP AXIOS
const axios = require('axios');
// Importação das classes (Embora Fornecedor não será usada)
const Produto = require('../classes/produto');
const Fornecedor = require('../classes/fornecedor');
//FUNÇÕES CRUD para consumo da API
async function listarFornecedores() {
    // Lista fornecedores cadastrados
    console.log('------------------------------');
    console.log(' FORNECEDORES');
    console.log('------------------------------');
    console.log('ID NOME');
    console.log('------------------------------');
    try {
        await axios.get('http://localhost:3000/fornecedores').then(
            (result) => {
                result.data.forEach(({ _id, nome }) => console.log(_id + '- ' + nome))
            }
        );
        console.log('------------------------------');
    } catch (error) {
        console.log('ERRO: ' + error);
    }
}
async function listarProdutosComFornecedores() {
    // Lista fornecedores cadastrados
    console.log('--------------------------------------------');
    console.log(' PRODUTOS COM FORNECEDORES');
    console.log('--------------------------------------------');
    console.log(' PRODUTO');
    console.log('ID - NOME (NOME FORNECEDOR)');
    console.log('--------------------------------------------');
    await Promise.all([
        axios.get('http://localhost:3000/produtos'),
        axios.get('http://localhost:3000/fornecedores')
    ])
        .then((results) => {
            const produtos = results[0].data; // Array de produtos
            const fornecedores = results[1].data; // Array de fornecedores
            //const fornecedor = fornecedores.find(elemento => elemento._id === id);
            let produtosComFornecedor = results[0].data.map((elemProduto) => ({
                _id: elemProduto._id,
                nome: elemProduto.nome,
                qtdeEstoque: elemProduto.qtdeEstoque,
                preco: elemProduto.preco,
                _idFornFK: elemProduto._idFornFK,
                nomeForn: fornecedores.find(elemForn => elemForn._id === elemProduto.
                    _idFornFK).nome
            })
            );
            produtosComFornecedor.forEach((elemento) => {
                console.log(`${elemento._id} - ${elemento.nome} (${elemento.nomeForn}
    )`);
            });
            console.log('--------------------------------------------');
        }
        )
        .catch((error) => console.log('ERRO: ' + error));
}
async function adicionarProduto() {
    const produto = new Produto();
    produto.nome = input.question('Digite o nome do produto: ');
    produto.qtdeEstoque = parseInt(input.question('Digite a quantidade em estoque: ')
    );
    produto.preco = parseFloat(input.question('Digite o preço: '));
    try {
        // Lista fornecedores para obter o _id do fornecedor que fornece o produto
        // que está sendo cadastrado
        await axios.get('http://localhost:3000/fornecedores').then((result) => {
            const vetFornecedores = result.data.map((elemForn) => elemForn.nome)
            console.log('Selecione abaixo o fornecedor para o produto:')
            const opcao = parseInt(input.keyInSelect(vetFornecedores, 'Digite a opção: ', { cancel: 'null' })); // CANCEL = -1
            produto._idFornFK = opcao >= 0 ? opcao + 1 : null;
            console.log(`Fornecedor selecionado: ${produto._idFornFK}${produto._idFornFK ? '-' + vetFornecedores[produto._idFornFK - 1] : ''}`);
        });
        // Cadastra o produto
        await axios.post('http://localhost:3000/produtos', produto).then((result) =>
            console.log(result.data.message));
    } catch (error) {
        console.log('ERRO: ' + error);
    }
}
async function listarEditarProdutos() {
    // Lista produtos cadastrados
    console.log('Selecione abaixo o produto para Alterar/Excluir:')
    try {
        let opcao, produtoId, produto
        await axios.get('http://localhost:3000/produtos').then(
            (result) => {
                const vetProdutos = result.data.map(({ _id, nome }) => `-> ${_id} - ${nome}`)
                console.log('----------------------------------');
                console.log(' PRODUTOS');
                console.log('----------------------------------');
                console.log('[ ] ID NOME');
                console.log('----------------------------------');
                opcao = parseInt(input.keyInSelect(vetProdutos, 'Digite a opção: ', {
                    cancel: 'Sair'
                })); // CANCEL = -1
                produtoId = opcao >= 0 ? opcao + 1 : null;
                //console.clear();
            });
        if (opcao !== -1) { // -1 -> Sairconsole.clear();
            await axios.get(`http://localhost:3000/produtos/${produtoId}`).then(result => {
                    produto = result.data;
                    console.log('-----------------------------------');
                    console.log(' DETALHE DO PRODUTO');
                    console.log('-----------------------------------');
                    console.log(`ID: ${result.data._id}`);
                    console.log(`NOME: ${result.data.nome}`);
                    console.log(`QTDE: ${result.data.qtdeEstoque} PREÇO: ${result.data.preco} ID_FORN: ${ result.data._idFornFK }`);
            console.log('-----------------------------------');
            });
            opcao = parseInt(input.keyInSelect(['Alterar', 'Excluir'], 'Digite a opção: ', { cancel: 'Sair' })); // CANCEL = -1
            switch (opcao) {
            case 0: // Alterar
            produto.nome = input.question('NOME: ');
            produto.qtdeEstoque = parseInt(input.question('QTDE ESTOQUE: '));
            produto.preco = parseFloat(input.question('PREÇO: '));
            produto._idFornFK = parseInt(input.question('ID FORNECEDOR: '));
            await axios.put(`http://localhost:3000/produtos/${produto._id}`,
                produto).then((result) => console.log(result.data.message));
            break;
            case 1: // Excluir
            const excluir = input.keyInYN(`Deseja excluir o produto "${produto._id} -${ produto.nome } " (y=sim / n=não)?`)
        if (excluir)
            await axios.delete(`http://localhost:3000/produtos/${produto.
                _id}`).then((result) => console.log(result.data.message));
        break;
            case -1:
        console.log('Operação de "Alteração/Exclusão" CANCELADA!');
        break;
    }
            } else { console.log('Operação de "Alteração/Exclusão" CANCELADA!') }
            } catch (error) {
    console.log('ERRO: ' + error);
}
            }
module.exports = {
    listarFornecedores,
    listarProdutosComFornecedores,
    adicionarProduto,
    listarEditarProdutos
};