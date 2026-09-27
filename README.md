# E-commerce Silva e Sol 🌴☀️

Plataforma de e-commerce da marca **Silva e Sol**, moderna, responsiva (otimizada para celular e computador) e integrada com o **Supabase** para Banco de Dados e Storage de Imagens.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3 moderno com gradientes e animações suaves, JavaScript Vanilla (ES6+).
- **Banco de Dados (Database):** [Supabase](https://supabase.com) (PostgreSQL).
- **Armazenamento de Imagens (Storage):** Supabase Storage (Bucket público `midias` com upload direto via celular e PC).
- **Checkout:** Envio automatizado do pedido detalhado (itens, tamanhos, cores, modelos, preços e totais) diretamente para o WhatsApp de vendas.

---

## 🚀 Passo a Passo: Configuração no Supabase (Única vez)

Para que o banco de dados e o upload de fotos funcionem:

1. Acesse o seu projeto no **[Supabase Dashboard](https://supabase.com/dashboard)** (`https://mectakvagdaoygqmbnth.supabase.co`).
2. No menu lateral esquerdo, clique no ícone **SQL Editor** (ou acesse diretamente pelo link: `https://supabase.com/dashboard/project/mectakvagdaoygqmbnth/sql/new`).
3. Abra o arquivo [`supabase_setup.sql`](supabase_setup.sql), copie todo o seu conteúdo e cole na caixa de texto do SQL Editor.
4. Clique no botão verde **Run** (Executar) no canto inferior direito.
5. Pronto! O script criará:
   - A tabela `products` com suporte a múltiplas fotos (`fotos text[]`) e controle de destaque.
   - A tabela `banners` para personalização dinâmica da capa da página inicial.
   - A tabela `circulos_destaque` para os destaques circulares da home.
   - O bucket de Storage `midias` com permissões públicas para você subir fotos de qualquer dispositivo.

---

## 📸 Como Funciona o Gerenciamento e Upload de Fotos

1. Acesse `admin.html` no seu navegador (pelo celular ou computador).
2. Faça login com as credenciais administrativas (`admin` / `silva123`).
3. **Upload de Fotos de Produtos:**
   - Você pode selecionar até 4 fotos por produto.
   - No celular, ao tocar no campo de foto, você pode escolher **Tirar Foto na hora** ou **Escolher da Galeria**.
   - No computador, abrirá a janela de arquivos do Windows/Mac.
   - Ao clicar em "Salvar Produto", as imagens são enviadas automaticamente para o Supabase Storage e os links públicos são gravados no banco.
4. **Banner & Destaques:**
   - O banner principal e as fotos dos círculos de categorias também sobem direto para o Supabase Storage sem estourar limites do navegador.

---

## 📱 Estrutura dos Arquivos

- `index.html`: Página inicial com banner dinâmico, círculos de destaque e seções por categoria.
- `produto.html`: Catálogo completo com filtros de categoria e visualização de grade.
- `produtos.html`: Página de detalhes da peça, galeria de miniaturas interativas e seleção de variações (Modelo, Tamanho, Cor).
- `admin.html`: Painel administrativo com gerenciamento completo integrado ao Supabase.
- `supabase-client.js`: Cliente de conexão e funções de banco de dados e upload para o Storage.
- `supabase_setup.sql`: Script de criação das tabelas e permissões no Supabase.
- `script.js`: Gerenciador do carrinho de compras e renderizador de componentes.
