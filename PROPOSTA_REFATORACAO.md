# Exercicio 2 - Proposta de Refatoracao (MVVM)

## 1) Padrao Escolhido

Escolhi o **MVVM (Model-View-ViewModel)**.

Para este app em React Native com hooks, o MVVM se encaixa bem porque:
- separa a camada de interface (`View`) da logica de estado e comportamento (`ViewModel`);
- permite reaproveitar e testar a logica de busca/paginacao/filtro sem depender da renderizacao da tela;
- reduz o tamanho e a complexidade de `PokedexScreen`, que hoje acumula multiplas responsabilidades.

Em resumo, o MVVM melhora manutencao e evolucao sem exigir mudanca radical de stack.

## 2) Nova Estrutura de Arquivos (foco na Pokedex)

```text
PokedexApp/
├─ screens/
│  └─ Pokedex/
│     ├─ PokedexScreen.tsx                 (View)
│     ├─ hooks/
│     │  └─ usePokedexViewModel.ts         (ViewModel)
│     ├─ components/
│     │  ├─ PokedexSearchInput.tsx
│     │  └─ PokedexListState.tsx
│     └─ types/
│        └─ PokedexViewState.ts
├─ services/
│  └─ api.ts                               (Model/Data source)
├─ components/
│  └─ PokemonCard.tsx                      (reutilizavel)
├─ types/
│  └─ Pokemon.ts
└─ utils/
   └─ format.ts
```

Observacao: `services/api.ts` continua sendo a camada de acesso aos dados (Model). O ViewModel apenas orquestra chamadas e transforma estado para a View.

## 3) Divisao de Responsabilidades

## View (`PokedexScreen.tsx`)

A View deve ficar "magra", com foco em renderizacao e eventos de interface:

- renderizar `TextInput`, `FlatList`, loading, erro e estado vazio;
- consumir estados expostos pelo ViewModel;
- repassar eventos do usuario para funcoes do ViewModel.

Exemplo de consumo:

- `value={searchQuery}`
- `onChangeText={setSearchQuery}`
- `data={filteredPokemons}`
- `onEndReached={loadMore}`

Nao deve conter:

- chamada direta de API;
- regra de paginacao/filtro;
- regras de tratamento de erro de rede alem da exibicao.

## ViewModel (`usePokedexViewModel.ts`)

Concentra estado e logica de comportamento da tela.

### Estados expostos

- `pokemons: Pokemon[]`
- `filteredPokemons: Pokemon[]`
- `searchQuery: string`
- `isLoading: boolean`
- `isLoadingMore: boolean`
- `error: string | null`
- `hasMore: boolean`

### Funcoes expostas

- `initialize()` (opcional, se nao inicializar automaticamente no hook)
- `setSearchQuery(query: string)`
- `loadMore()`
- `retryInitialLoad()`

### Regras internas do ViewModel

- carregar primeira pagina da PokeAPI;
- carregar detalhes em paralelo para cada item;
- aplicar filtro por nome com base em `searchQuery`;
- bloquear paginacao quando estiver em busca ativa;
- controlar estados de loading/erro para a View;
- encapsular regras de offset/limit.

## 4) Fluxo de Dados (interacao de busca)

### Cenario: usuario digita no campo de busca

1. Usuario digita no `TextInput` da `PokedexScreen`.
2. O `onChangeText` da View chama `setSearchQuery(text)` do ViewModel.
3. O ViewModel atualiza o estado `searchQuery`.
4. Um `useMemo` (ou `useEffect`) no ViewModel recalcula `filteredPokemons` com base em `pokemons` e `searchQuery`.
5. O hook retorna o novo estado para a View.
6. A `FlatList` re-renderiza automaticamente com `filteredPokemons`.
7. Se a busca estiver preenchida, `loadMore()` ignora novas paginas para evitar inconsistencias entre lista filtrada e paginada.

## 5) Beneficios Esperados da Refatoracao

- **Maior clareza arquitetural:** tela foca em UI; ViewModel foca em comportamento.
- **Melhor testabilidade:** regras de filtro/paginacao podem ser testadas isoladamente.
- **Evolucao mais segura:** novas features (ordenacao, favoritos, debounce de busca) entram no ViewModel com menor impacto visual.
- **Reuso de logica:** outras views podem reutilizar partes de estado/comportamento via hooks.

## Conclusao

A adocao de MVVM para a `PokedexScreen` e um passo natural para evoluir o projeto. A proposta mantem a base atual (React Native + hooks + servicos existentes), mas organiza responsabilidades para suportar crescimento do aplicativo com menos acoplamento e maior manutencao.
