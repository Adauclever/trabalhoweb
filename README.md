# Reading Tracker

Aplicação web desenvolvida para organizar uma biblioteca pessoal, permitindo o cadastro e o gerenciamento de livros, autores e registros de leitura.

O projeto foi desenvolvido como atividade acadêmica da disciplina de Desenvolvimento Web, com foco na utilização de HTML, CSS e JavaScript, manipulação do DOM e armazenamento de dados no navegador.

## Funcionalidades

- Cadastro, visualização, edição e exclusão de autores.
- Cadastro, visualização, edição e exclusão de livros.
- Associação de autores existentes aos livros.
- Seleção de temas existentes e criação de novos temas.
- Cadastro de uma primeira leitura junto com o cadastro do livro.
- Gerenciamento de múltiplos registros de leitura para um mesmo livro.
- Controle dos status de leitura.
- Validação dos campos conforme as regras estabelecidas.
- Pesquisa de livros, autores e leituras.
- Ordenação dos registros no histórico de leituras.
- Backup dos dados cadastrados.
- Restauração dos dados iniciais por meio da opção Reset Data.

## Tecnologias utilizadas

- **HTML5:** estruturação das páginas.
- **CSS3:** estilização e responsividade da aplicação.
- **JavaScript:** implementação das funcionalidades e validações.
- **LocalStorage:** armazenamento dos dados no navegador.
- **JSON:** organização e disponibilização dos dados iniciais.
- **Font Awesome:** utilização de ícones na interface.

## Como executar o projeto

1. Faça o download ou clone este repositório:

   ```bash
   git clone https://github.com/GabiCaproni/trabalhoweb.git
   ```

2. Acesse a pasta do projeto:

   ```bash
   cd trabalhoweb
   ```

3. Abra a pasta no Visual Studio Code.

4. Execute o arquivo `index.html` utilizando uma extensão de servidor local, como o Live Server.

5. A aplicação será aberta no navegador.

**Observação:** recomenda-se utilizar um servidor local para executar o projeto, pois os arquivos JSON são carregados por meio de requisições JavaScript. Abrir o HTML diretamente pelo sistema de arquivos pode impedir esse carregamento.

## Organização do projeto

```text
trabalhoweb/
│
├── index.html
├── books.html
├── authors.html
├── readings.html
├── data.html
│
├── style.css
│
├── data/
│   └── seed.json
│
└── js/
    ├── components.js
    ├── home.js
    ├── books.js
    ├── authors.js
    ├── readings.js
    ├── data.js
    ├── store.js
    ├── validation.js
    └── seed.js
```

### Organização dos arquivos JavaScript

- **components.js:** carrega os componentes compartilhados entre as páginas, como o cabeçalho e o menu de navegação.
- **home.js:** controla as informações apresentadas na página inicial.
- **books.js:** implementa as funcionalidades de gerenciamento dos livros.
- **authors.js:** implementa as funcionalidades de gerenciamento dos autores.
- **readings.js:** implementa o gerenciamento e a ordenação dos registros de leitura.
- **data.js:** controla as funcionalidades de backup e restauração dos dados.
- **store.js:** centraliza o acesso, a consulta, a validação e a atualização dos dados armazenados.
- **validation.js:** reúne as regras de validação dos dados.
- **seed.js:** carrega e verifica os dados iniciais disponibilizados no arquivo `seed.json`.

## Armazenamento dos dados

A aplicação utiliza o `LocalStorage` do navegador para armazenar os dados cadastrados.

Na primeira utilização, os dados iniciais do arquivo `seed.json` são carregados e armazenados no navegador. Nas próximas visitas, a aplicação utiliza os dados já salvos, evitando que as alterações realizadas pelo usuário sejam substituídas pelos dados originais.

As informações permanecem armazenadas mesmo após atualizar ou fechar o navegador.

A aplicação também disponibiliza duas funcionalidades para o gerenciamento dos dados:

- **Download Backup:** permite baixar uma cópia dos dados atuais em formato JSON.
- **Reset Data:** restaura os dados originais do arquivo `seed.json`, substituindo os registros atuais. Antes da restauração, uma mensagem de confirmação é apresentada ao usuário.

**Atenção:** os dados ficam armazenados localmente no navegador. Portanto, limpar os dados de navegação ou utilizar outro navegador pode resultar na perda das informações cadastradas. Recomenda-se realizar backups periodicamente.

## Checklist de requisitos

A tabela abaixo apresenta os requisitos funcionais da atividade e o estado de implementação de cada funcionalidade.

| ID | Requisito | O que precisa ser feito | Já está feito? |
|---|---|---|:---:|
| FR-01 | Gerenciar autores | Cadastrar autores. | ✅ |
| FR-01 | Gerenciar autores | Visualizar a lista de autores. | ✅ |
| FR-01 | Gerenciar autores | Editar autores cadastrados. | ✅ |
| FR-01 | Gerenciar autores | Excluir autores. | ✅ |
| FR-01 | Gerenciar autores | Impedir a exclusão de autores associados a livros e informar quais são os livros. | ✅ |
| FR-02 | Gerenciar livros | Cadastrar livros. | ✅ |
| FR-02 | Gerenciar livros | Visualizar a lista de livros. | ✅ |
| FR-02 | Gerenciar livros | Editar livros cadastrados. | ✅ |
| FR-02 | Gerenciar livros | Excluir livros. | ✅ |
| FR-02 | Gerenciar livros | Selecionar autores existentes, sem precisar digitá-los novamente. | ✅ |
| FR-02 | Gerenciar livros | Selecionar temas existentes ou criar novos temas durante o cadastro. | ✅ |
| FR-03 | Gerenciar leituras | Adicionar uma ou mais leituras a um livro. | ✅ |
| FR-03 | Gerenciar leituras | Editar leituras cadastradas. | ✅ |
| FR-03 | Gerenciar leituras | Excluir leituras. | ✅ |
| FR-03 | Gerenciar leituras | Permitir cadastrar um livro e sua primeira leitura no mesmo formulário. | ✅ |
| FR-03 | Gerenciar leituras | Ao excluir um livro, excluir também suas leituras após confirmação. | ✅ |
| FR-03 | Gerenciar leituras | Informar quantas leituras serão excluídas junto com o livro. | ✅ |
| FR-04 | Mudança de status | Permitir os status Want to read, Reading, Paused, Read e Abandoned. | ✅ |
| FR-04 | Mudança de status | Exigir o ano de leitura ao mudar para Read. | ✅ |
| FR-04 | Mudança de status | Apagar a prioridade ao sair de Want to read. | ✅ |
| FR-04 | Mudança de status | Manter recomendação e observações ao mudar de Want to read. | ✅ |
| FR-04 | Mudança de status | Confirmar com o usuário antes de apagar ano ou nota quando deixarem de ser permitidos. | ✅ |
| FR-04 | Mudança de status | Permitir registrar uma nova leitura do mesmo livro sem alterar a leitura anterior. | ✅ |
| FR-05 | Reading Log | Exibir uma lista de leituras com título, autores, status, ano e nota. | ✅ |
| FR-05 | Reading Log | Permitir ordenar por cada uma das colunas. | ✅ |
| FR-05 | Reading Log | Exibir `-` nos campos sem informação. | ✅ |
| FR-05 | Reading Log | Ordenar inicialmente pelo ano de leitura mais recente primeiro e, depois, pelo ID crescente. | ✅ |
| FR-06 | Validações | Validar todos os campos conforme as regras do modelo de dados. | ✅ |
| FR-06 | Validações | Exibir mensagens de erro próximas aos campos inválidos. | ✅ |
| FR-06 | Validações | Impedir o salvamento de dados inválidos. | ✅ |
| FR-07 | Seed e Reset | Carregar automaticamente os dados iniciais na primeira utilização. | ✅ |
| FR-07 | Seed e Reset | Não carregar novamente os dados iniciais nas próximas visitas. | ✅ |
| FR-07 | Seed e Reset | Manter as alterações do usuário após atualizar ou reabrir a página. | ✅ |
| FR-07 | Seed e Reset | Criar uma opção Reset Data. | ✅ |
| FR-07 | Seed e Reset | Solicitar confirmação antes de restaurar os dados. | ✅ |
| FR-07 | Seed e Reset | Apagar os dados atuais e carregar novamente o `seed.json`. | ✅ |

## Utilização de Inteligência Artificial

Durante o desenvolvimento do projeto, foi utilizado o ChatGPT como ferramenta de apoio.

A ferramenta foi utilizada para auxiliar na compreensão de conceitos de desenvolvimento web, esclarecer dúvidas sobre HTML, CSS e JavaScript, identificar possíveis problemas no código, sugerir melhorias na organização e na implementação das funcionalidades e auxiliar na documentação do projeto.

As sugestões foram analisadas e adaptadas ao longo do desenvolvimento, com testes realizados para verificar o funcionamento das funcionalidades implementadas.

## Autoria

Projeto desenvolvido por **Gabriella Caproni**, como atividade acadêmica da disciplina de Desenvolvimento Web.