# Exercicio 1 - Analise Critica da Arquitetura Atual

## 1) Estrutura de Diretorios

A organizacao atual esta clara para um projeto pequeno e didatico. A separacao em `screens`, `components`, `services`, `types` e `utils` segue uma convencao comum em React Native e facilita encontrar rapidamente:

- telas principais da aplicacao (`screens`);
- blocos visuais reutilizaveis (`components`);
- acesso a API (`services`);
- contratos de dados (`types`);
- funcoes auxiliares (`utils`).

Mesmo funcionando bem neste tamanho, eu faria alguns ajustes para melhorar a escalabilidade:

1. **Agrupar por feature a medio prazo**  
   Hoje os arquivos estao separados por "tipo tecnico". Para poucas telas isso e bom, mas com crescimento pode ficar mais dificil manter coesao de dominio. Eu migraria gradualmente para algo como `features/pokedex/...` e `features/pokemon-detail/...`, mantendo `shared` para componentes/utilitarios comuns.

2. **Padronizar nomenclatura da tela de detalhes**  
   O enunciado cita `PokemonDetailsScreen`, mas no projeto o arquivo esta como `PokemonDetailScreen.tsx`. Nao e erro funcional, mas uma nomenclatura consistente evita confusao em equipe e em documentacao.

3. **Criar subpastas por tela, quando evoluir**  
   Quando a tela cresce, arquivos como estilos, hooks locais e pequenos componentes podem ficar junto da tela:
   - `screens/Pokedex/PokedexScreen.tsx`
   - `screens/Pokedex/components/...`
   - `screens/Pokedex/hooks/...`

## 2) Componentizacao

### O `PokemonCard` e um bom componente reutilizavel?

Sim, em boa parte. Pontos positivos:

- recebe `pokemon` por props (entrada bem definida);
- encapsula visual e interacao de "card";
- pode ser usado em qualquer lista de Pokemons com layout semelhante.

Ponto de atencao:

- o componente navega diretamente (`useNavigation` + `navigate`). Isso acopla o card ao fluxo de navegacao atual.  
  Para aumentar reuso, uma alternativa e aceitar um `onPress` por props e deixar a tela decidir para onde navegar.

### O que extrairia de `PokemonDetailScreen` para componentes reutilizaveis?

Eu extrairia pelo menos estas partes:

1. **`PokemonTypesBadges`**  
   Responsavel por renderizar a lista de tipos (badges coloridos).

2. **`PokemonStatsSummary`**  
   Bloco com altura e peso (incluindo divisoria e formatacao de unidade).

3. **`ScreenStateView` (ou componentes dedicados de estado)**  
   Parte de loading/erro e repetida em telas. Poderia haver um componente reutilizavel para estados comuns (`LoadingState`, `ErrorState` com botao de retry/voltar).

Com isso, a tela ficaria mais legivel e centrada no fluxo da pagina, enquanto os detalhes de UI ficam em componentes menores.

## 3) Gerenciamento de Estado e Logica

### Onde esta a logica de busca e filtragem na `PokedexScreen`?

Dentro da propria tela (`screens/PokedexScreen.tsx`):

- estados locais (`pokemons`, `search`, `offset`, `hasMore`, etc.);
- efeito inicial de carga (`useEffect` com `fetchData`);
- paginacao (`loadMorePokemons`);
- filtro (`pokemons.filter(...)`).

### Onde esta a logica de buscar detalhes na `PokemonDetailScreen`?

Tambem dentro da propria tela (`screens/PokemonDetailScreen.tsx`):

- estado local (`details`, `isLoading`, `error`);
- efeito para buscar dados por `pokemon.id` (`useEffect` + `getPokemonFullDetails`).

### Essa abordagem e sustentavel para um app em crescimento?

Funciona bem agora, mas perde sustentabilidade conforme o app cresce.

**Pros da abordagem atual (logica na tela):**

- implementacao rapida e direta;
- baixo numero de arquivos para manter;
- facilita aprendizado inicial (tudo no mesmo lugar).

**Contras para crescimento:**

- telas acumulam muitas responsabilidades (UI + estado + regra + integracao com API);
- maior dificuldade de testar regras sem renderizar componente;
- repeticao de padroes de loading/erro/fetch em varias telas;
- manutencao mais arriscada (alterar regra de dados pode quebrar UI facilmente).

## 4) Pontos Fortes e Fracos da Arquitetura Atual

### Pontos fortes

1. **Separacao basica por camadas tecnicas**
   - Ha separacao minima entre UI (`screens/components`) e acesso remoto (`services/api.ts`).
   - Isso ja evita chamadas HTTP espalhadas por todo o projeto.

2. **Tipagem TypeScript presente nas entidades**
   - Interfaces (`Pokemon`, `PokemonFullDetails`, `RootStackParamList`) ajudam previsibilidade de dados e navegacao.
   - Reduz erros de integracao entre telas e servicos.

### Pontos fracos

1. **Acoplamento da regra de negocio com a View**
   - `PokedexScreen` e `PokemonDetailScreen` concentram estado, fetch, tratamento de erro, filtro e renderizacao.
   - Isso reduz testabilidade e dificulta evolucao arquitetural.

2. **Baixa modularizacao interna das telas**
   - `PokemonDetailScreen` concentra muitos blocos visuais e regras de apresentacao em um unico arquivo grande.
   - Com novos requisitos (mais atributos, sessoes, acoes), a complexidade tende a crescer rapidamente.

## Conclusao

A arquitetura atual e adequada para o escopo didatico e para uma primeira versao funcional da Pokédex. Para evoluir com mais telas e regras, o proximo passo recomendado e separar responsabilidades de apresentacao e regra (por exemplo, com MVP ou MVVM), alem de modularizar melhor os componentes de cada tela.
