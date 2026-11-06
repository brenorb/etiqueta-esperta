# Calculadora de preco por medida

Uma pagina estatica para comparar custo por unidade, metro, grama, litro ou qualquer outra medida que voce quiser usar nas compras.

O ranking compara itens com a mesma moeda e a mesma unidade de medida. A base de comparação muda só a apresentação do preço.

Tambem salva historico local no navegador para lembrar quanto voce pagou da ultima vez, sem backend e sem banco de dados.

## Como usar

Abra `index.html` direto no navegador ou rode um servidor local simples:

```bash
python3 -m http.server 4173
```

Depois acesse `http://localhost:4173`.

## Testes

```bash
node --test
```

## Publicacao

O projeto foi estruturado para publicar direto no GitHub Pages sem etapa de build.
