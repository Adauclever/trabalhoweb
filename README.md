# Reading Tracker – Entrega 1 (Frontend)

Aplicação web que substitui um registro de leituras feito em um documento Word por dados estruturados, entrada validada e telas que se atualizam sozinhas. Esta é a **Entrega 1** do trabalho semestral de Desenvolvimento Web: interface completa em HTML, CSS e JavaScript puros, com os dados guardados no navegador (`localStorage`).

A interface e os valores controlados (formas, modos, status, prioridades) estão em inglês dos EUA. Títulos de livros e nomes de autores ficam como foram registrados, no idioma original.

- Repositório: https://github.com/Adauclever/trabalhoweb
- Tag da entrega: `delivery-1`

---

## 1. Equipe

> A composição da equipe não pode mudar na Entrega 2.

| Nome | Matrícula |
|---|---|
| Adauclever Pacheco Lino | 2025.1.08.001 |
| Danilo Carvalho Firme | 2025.1.08.038 |
| Gabriella Caproni | 2025.1.08.008 |
| Guilherme Pereira Falcucci| 2025.1.08.027 |


---

## 2. Como executar

**Requisitos:** um navegador atual e o Visual Studio Code com a extensão **Live Server**. Java não é necessário nesta entrega (ele só entra na Entrega 2).

1. Clone o repositório:
   ```bash
   git clone https://github.com/Adauclever/trabalhoweb.git
   cd trabalhoweb
   ```
2. Abra a pasta no VS Code.
3. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.
4. O navegador abrirá a aplicação. Na primeira visita, os dados do `data/seed.json` são carregados automaticamente.

> **Por que Live Server?** O navegador bloqueia `fetch` em páginas abertas direto do disco (`file://`). Como o `seed.json` e o `header.html` são carregados com `fetch`, a pasta precisa ser servida por um servidor local.

---

## 3. Checklist de requisitos

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


## 4. Organização do projeto

```text
trabalhoweb/
├── index.html        Página inicial: resumo, backup e reset
├── books.html        Livros (cadastro, lista, primeira leitura)
├── authors.html      Autores
├── readings.html     Reading Log (leituras)
├── header.html       Cabeçalho e menu, compartilhado entre as páginas
├── footer.html       Rodapé
├── style.css         Estilos e responsividade
├── data/
│   └── seed.json     Dados iniciais fornecidos pelo professor
└── js/
    ├── components.js Carrega o cabeçalho nas páginas
    ├── home.js       Página inicial: contadores, backup e reset
    ├── books.js      Tela de livros
    ├── authors.js    Tela de autores
    ├── readings.js   Tela do Reading Log
    ├── store.js      ÚNICO ponto de acesso aos dados (localStorage)
    ├── validation.js Regras de validação
    ├── messages.js   Textos de mensagens da interface
    └── seed.js       Leitura e verificação do seed.json
```

### O que cada arquivo JavaScript faz

| Arquivo | Responsabilidade |
|---|---|
| `store.js` | Lê e grava os dados. Toda função é `async`, como pede o enunciado. Valida antes de salvar e, em caso de erro, lança um objeto `{status, message, errors}`, o mesmo formato que a API terá na Entrega 2. |
| `validation.js` | Contém as regras do modelo de dados: obrigatoriedade, anos (negativos valem como a.C., o ano 0 é inválido), notas de 0 a 10 em passos de 0,5, datas, relação entre status e campos. Não acessa a tela nem o armazenamento. |
| `messages.js` | Reúne os textos gerados pelo JavaScript (erros, confirmações, mensagens de sucesso), para que a interface possa ser traduzida depois mexendo em um único lugar. |
| `seed.js` | Faz `fetch` do `seed.json` e confere a estrutura (IDs únicos, referências entre registros) antes de aceitá-lo. |
| `authors.js`, `books.js`, `readings.js` | Cuidam de cada tela: leem o formulário, chamam a validação e o `store.js`, e desenham a lista. Não acessam o `localStorage` diretamente. |
| `home.js` | Contadores da página inicial, Download Backup e Reset Data. |
| `components.js` | Carrega `header.html` dentro de cada página e liga o botão do menu no celular. |

### Preparação para a Entrega 2

Todo acesso a dados passa pelo `store.js`, e os dados têm o mesmo formato do `seed.json`. Na Entrega 2, apenas esse módulo será reescrito para chamar a API (`fetch("/api/...")`). As telas não devem precisar de mudança.

---

## 5. Como os dados são guardados

- Os dados ficam no `localStorage` do navegador, sob a chave `readingTrackerData`, como um único JSON com cinco listas: `countries`, `authors`, `themes`, `books` e `readings`.
- **Primeira visita:** a chave não existe, então o `seed.json` é carregado e gravado.
- **Próximas visitas:** o app lê apenas o `localStorage`. As alterações do usuário nunca são sobrescritas pelo seed.
- **Novos registros** recebem o próximo ID inteiro depois do maior existente.
- **Download Backup** baixa uma cópia dos dados atuais em JSON.
- **Reset Data** pede confirmação, apaga os dados atuais e carrega o `seed.json` de novo (os IDs voltam aos originais).

> Os dados ficam só neste navegador. Limpar os dados de navegação ou trocar de navegador apaga o que foi cadastrado.

---

## 6. Regras de validação (resumo)

| Registro | Regra |
|---|---|
| Autor | Nome obrigatório e único (ignora maiúsculas/minúsculas); nacionalidade escolhida na lista fixa de países; nascimento não pode estar no futuro; morte deve ser depois do nascimento. |
| Livro | Só o título é obrigatório; autores escolhidos entre os existentes; ano de publicação não futuro, negativo = a.C., zero inválido; forma, modo e conteúdo vêm de listas; temas sem duplicata. |
| Leitura | Livro e status obrigatórios; ano de leitura obrigatório em Read, opcional em Abandoned e vazio nos demais, nunca no futuro nem antes da publicação; nota de 0 a 10 em passos de 0,5, só em Read ou Abandoned; prioridade só em Want to read. |

### Fluxo de status

`Want to read ⇄ Reading ⇄ Paused ⇄ Read ⇄ Abandoned`

- Ao sair de Want to read, a prioridade é limpa; recomendação e notas são mantidas.
- Ao ir para um status que não permite ano ou nota, o usuário confirma antes de eles serem apagados.
- Para registrar uma segunda leitura do mesmo livro, adiciona-se uma nova leitura em vez de mudar a antiga.

---

## 7. Guia de estudo: ferramentas e conceitos usados

Esta seção explica o que cada ferramenta faz, para quem for entender ou apresentar o projeto.

| Ferramenta / conceito | O que é | Onde aparece no projeto |
|---|---|---|
| **HTML semântico** | Estrutura da página com tags que descrevem o conteúdo (`header`, `nav`, `main`, `form`, `table`). | Arquivos `.html` |
| **CSS e responsividade** | Aparência da página; `@media` adapta o layout ao celular. | `style.css` |
| **DOM** | A árvore de elementos da página, que o JavaScript lê e altera. | `getElementById`, `createElement`, `textContent` |
| **`addEventListener`** | Liga uma ação (clique, envio de formulário) a um elemento, sem `onclick` dentro do HTML. | Todos os arquivos `js/` das telas |
| **ES Modules** (`import`/`export`) | Divide o JavaScript em arquivos que compartilham funções, sem conflito de nomes. | `<script type="module">` e os `import` em `js/` |
| **`async`/`await` e Promises** | Forma de esperar operações assíncronas (como `fetch`) sem travar a página. As funções do `store.js` são `async` para a troca por API na Entrega 2. | `store.js`, `seed.js` |
| **`fetch`** | Faz requisições HTTP. Aqui lê o `seed.json` e o `header.html`. | `seed.js`, `components.js` |
| **JSON** | Formato de texto para dados estruturados. O seed e o backup usam JSON. | `data/seed.json` |
| **`localStorage`** | Armazenamento de texto no navegador, que persiste entre visitas. Guarda só strings, por isso se usa `JSON.stringify`/`JSON.parse`. | `store.js` |
| **Live Server** | Extensão do VS Code que serve a pasta por HTTP local. | Execução do projeto |
| **Font Awesome** | Biblioteca de ícones carregada por CDN (permitida pelo enunciado). | `header.html`, páginas |
| **Git e GitHub** | Controle de versão (histórico de commits) e hospedagem do repositório. | Repositório |
| **Git tag** | Marca um commit específico. O professor corrige o commit da tag `delivery-1`. | `git tag delivery-1` |
| **DevTools** (F12) | Ferramentas do navegador. Em *Application → Local Storage* dá para ver e apagar a chave `readingTrackerData`. | Depuração |

### Como inspecionar e testar

1. Pressione **F12** e abra **Application → Local Storage** para ver os dados salvos.
2. Para simular "primeira visita", apague a chave `readingTrackerData` e recarregue a página.
3. Casos úteis para testar manualmente:
   - excluir um autor com livros (deve aparecer a lista dos livros);
   - editar *Édipo Rei*, de -429 (ano a.C. deve ser aceito);
   - mudar uma leitura de Read para Reading (deve pedir confirmação);
   - ordenar o Reading Log por cada coluna;
   - usar Reset Data.

---

## 8. Declaração de uso de Inteligência Artificial

| Ferramenta | Usada para | Partes afetadas |
|---|---|---|
| ChatGPT | As ferramentas foram utilizadas para auxiliar na compreensão de conceitos de desenvolvimento web, esclarecer dúvidas sobre HTML, CSS e JavaScript, identificar possíveis problemas no código, sugerir melhorias na organização e na implementação das funcionalidades e auxiliar na documentação do projeto. As sugestões foram analisadas e adaptadas ao longo do desenvolvimento, com testes realizados para verificar o funcionamento das funcionalidades implementadas.|
| Claude | Revisão do código contra os requisitos da Entrega 1; correção da validação de anos a.C.; padronização dos erros 404 e 409 no formato da API; criação do `messages.js`; troca de `style.display` por `classList`; remoção de regra CSS duplicada; apoio na escrita deste README. | `js/validation.js`, `js/store.js`, `js/authors.js`, `js/books.js`, `js/readings.js`, `js/home.js`, `js/messages.js`, `style.css`, `README.md` |

As sugestões das ferramentas foram analisadas e testadas. Todos os integrantes devem ser capazes de explicar o código entregue.

---

## 10. Autoria

Trabalho desenvolvido para a disciplina de Desenvolvimento Web (UNIFAL-MG), sob orientação do prof. Rodrigo Martins Pagliares.

Equipe: ver a seção 1.