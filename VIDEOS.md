# Onde colocar o arquivo de vídeo

## Caminho correto

Coloque o arquivo de vídeo neste local dentro da pasta do site:

```
firework/
└── assets/
    └── videos/
        └── aula.mp4   ← arquivo de vídeo aqui
```

**Caminho completo:** `assets/videos/aula.mp4`

---

## Formatos suportados

| Formato | Extensão | Compatibilidade |
|---------|----------|-----------------|
| MP4 (H.264) | `.mp4` | ✅ Todos os navegadores modernos |
| WebM | `.webm` | ✅ Chrome, Firefox, Edge |
| Ogg | `.ogv` | Chrome, Firefox |

> **Recomendação:** use sempre `.mp4` com codec H.264. É o formato com maior compatibilidade.

---

## Imagem de capa (opcional)

Para exibir uma imagem enquanto o vídeo não está sendo reproduzido, coloque uma imagem em:

```
firework/
└── assets/
    └── images/
        └── video-poster.png   ← imagem de capa aqui
```

- **Tamanho recomendado:** 1280 × 720 px (proporção 16:9)
- Se não existir, o player exibirá o fundo escuro da seção

---

## Como trocar o vídeo

Se quiser substituir `aula.mp4` por outro arquivo:

1. Coloque o novo arquivo em `assets/videos/`
2. Abra `index.html` e localize as duas linhas com `aula.mp4`:

```html
<video id="vidPlayer"
  src="assets/videos/aula.mp4"   ← troque o nome aqui
  ...
  poster="assets/images/video-poster.png">
```

e mais acima, no card de preview:

```html
<video id="vidPlayer"
  src="assets/videos/aula.mp4"   ← e aqui também
```

3. Salve e envie para o servidor.

---

## Como funciona o player

- O vídeo fica embutido na seção **Cursos EAD** como um card clicável
- Ao clicar, abre um **modal em quase tela cheia** com o fundo do site borrado
- O vídeo inicia automaticamente ao abrir o modal
- Para fechar: clique fora do vídeo, clique no **X** ou pressione **Esc**

---

## Tamanho recomendado do arquivo

Para garantir boa velocidade de carregamento:

- Até **200 MB** para vídeos longos
- Resolução: **1280 × 720 px** (HD)
- Compressão: use [HandBrake](https://handbrake.fr/) (gratuito) para comprimir sem perder qualidade

---

*Dúvidas? Entre em contato: contato@grupofirework.com.br*
