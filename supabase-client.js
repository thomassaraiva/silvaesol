// --- CONFIGURAÇÃO E CLIENTE SUPABASE - SILVA E SOL ---

const SUPABASE_CONFIG = {
    url: "https://mectakvagdaoygqmbnth.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lY3Rha3ZhZ2Rhb3lncW1ibnRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1OTYxMTksImV4cCI6MjEwNTE3MjExOX0.D8hya7J4d7WeOrOLfPRiQ4cXL5EOmV0ZnFFg_x3SKMc",
    bucket: "midias"
};

// Inicialização segura do cliente Supabase
let supabaseClient = null;

function getSupabase() {
    if (!supabaseClient) {
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        } else if (window.supabase && window.supabase.createClient) {
            supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        } else {
            console.error("Supabase JS SDK não encontrado. Certifique-se de incluir a biblioteca @supabase/supabase-js no HTML.");
        }
    }
    return supabaseClient;
}

// --- FUNÇÃO DE UPLOAD DIRETO PARA O STORAGE (DATABASE STORAGE) ---
// Funciona tanto no Celular (Câmera/Galeria) quanto no Computador
async function uploadImagemSupabase(file, pasta = 'produtos') {
    if (!file) return null;
    const client = getSupabase();
    if (!client) throw new Error("Cliente Supabase não inicializado.");

    // Sanitiza nome do arquivo
    const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt) ? fileExt : 'jpg';
    const fileName = `${pasta}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;

    const { data, error } = await client.storage
        .from(SUPABASE_CONFIG.bucket)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error("Erro no upload para o Supabase Storage:", error);
        throw error;
    }

    const { data: publicData } = client.storage
        .from(SUPABASE_CONFIG.bucket)
        .getPublicUrl(fileName);

    return publicData.publicUrl;
}

// --- MÉTODOS DE PRODUTOS ---

// Formata dados vindos do banco para o padrão usado nos componentes do site
function normalizarProduto(p) {
    const fotos = (Array.isArray(p.fotos) && p.fotos.length > 0)
        ? p.fotos
        : (p.image_url ? [p.image_url] : ['logo.jpg.jpg']);

    return {
        id: p.id,
        nome: p.title || p.nome || 'Produto sem título',
        preco: parseFloat(p.price || p.preco || 0),
        descricao: p.description || p.descricao || '',
        categoria: p.category || p.categoria || 'Promoções',
        img: fotos[0] || 'logo.jpg.jpg',
        fotos: fotos,
        emDestaque: p.em_destaque !== false,
        ativo: p.is_active !== false,
        criadoEm: p.created_at
    };
}

async function buscarProdutosSupabase() {
    const client = getSupabase();
    if (!client) return [];

    const { data, error } = await client
        .from('products')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error("Erro ao carregar produtos:", error);
        return [];
    }

    return (data || []).map(normalizarProduto);
}

async function buscarProdutoPorIdSupabase(id) {
    const client = getSupabase();
    if (!client) return null;

    const { data, error } = await client
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error("Produto não encontrado:", error);
        return null;
    }

    return normalizarProduto(data);
}

async function salvarProdutoSupabase(dados) {
    const client = getSupabase();
    if (!client) throw new Error("Supabase não carregado");

    const payload = {
        title: dados.nome,
        price: parseFloat(dados.preco),
        description: dados.descricao || '',
        category: dados.categoria || 'Promoções',
        image_url: dados.fotos && dados.fotos.length > 0 ? dados.fotos[0] : (dados.img || null),
        fotos: dados.fotos || (dados.img ? [dados.img] : []),
        em_destaque: dados.emDestaque !== undefined ? dados.emDestaque : true,
        is_active: true
    };

    if (dados.id) {
        const { data, error } = await client
            .from('products')
            .update(payload)
            .eq('id', dados.id)
            .select()
            .single();

        if (error) throw error;
        return normalizarProduto(data);
    } else {
        const { data, error } = await client
            .from('products')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return normalizarProduto(data);
    }
}

async function deletarProdutoSupabase(id) {
    const client = getSupabase();
    if (!client) throw new Error("Supabase não carregado");

    const { error } = await client
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

async function alternarDestaqueProdutoSupabase(id, emDestaque) {
    const client = getSupabase();
    if (!client) return;

    const { error } = await client
        .from('products')
        .update({ em_destaque: emDestaque })
        .eq('id', id);

    if (error) console.error("Erro ao atualizar destaque:", error);
}

// --- MÉTODOS DE BANNER ---

async function buscarBannerSupabase() {
    const client = getSupabase();
    if (!client) return null;

    const { data, error } = await client
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) {
        return null;
    }

    const b = data[0];
    return {
        id: b.id,
        img: b.image_url,
        titulo: b.title || '',
        subtitulo: b.subtitle || '',
        descricao: b.description || ''
    };
}

async function salvarBannerSupabase(dados) {
    const client = getSupabase();
    if (!client) throw new Error("Supabase não carregado");

    const payload = {
        title: dados.titulo || '',
        subtitle: dados.subtitulo || '',
        description: dados.descricao || '',
        image_url: dados.img,
        is_active: true
    };

    // Verifica se já existe um banner
    const { data: existente } = await client
        .from('banners')
        .select('id')
        .limit(1);

    if (existente && existente.length > 0) {
        const { data, error } = await client
            .from('banners')
            .update(payload)
            .eq('id', existente[0].id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        const { data, error } = await client
            .from('banners')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

// --- MÉTODOS DE CÍRCULOS DE DESTAQUE ---

const CIRCULOS_PADRAO = [
    { nome: 'Promoções', img: 'logo.jpg.jpg', link: 'produtos.html?cat=Promocoes' },
    { nome: 'Sungas', img: 'logo.jpg.jpg', link: 'produtos.html?cat=Sungas' },
    { nome: 'Regatas', img: 'logo.jpg.jpg', link: 'produtos.html?cat=Regatas' },
    { nome: 'Bolsas', img: 'logo.jpg.jpg', link: 'produtos.html?cat=Bolsas' },
    { nome: 'Kimono', img: 'logo.jpg.jpg', link: 'produtos.html?cat=Kimono' },
    { nome: 'Kits', img: 'logo.jpg.jpg', link: 'produtos.html?cat=Kits' }
];

async function buscarCirculosSupabase() {
    const client = getSupabase();
    if (!client) return CIRCULOS_PADRAO;

    const { data, error } = await client
        .from('circulos_destaque')
        .select('*')
        .order('ordem', { ascending: true })
        .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
        return CIRCULOS_PADRAO;
    }

    return data.map(c => ({
        id: c.id,
        nome: c.nome,
        img: c.img_url || 'logo.jpg.jpg',
        link: c.link || `produtos.html?cat=${encodeURIComponent(c.nome)}`,
        ordem: c.ordem || 0
    }));
}

async function salvarCirculoSupabase(dados) {
    const client = getSupabase();
    if (!client) throw new Error("Supabase não carregado");

    const payload = {
        nome: dados.nome,
        img_url: dados.img,
        link: dados.link || `produtos.html?cat=${encodeURIComponent(dados.nome)}`
    };

    if (dados.id) {
        const { data, error } = await client
            .from('circulos_destaque')
            .update(payload)
            .eq('id', dados.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        const { data, error } = await client
            .from('circulos_destaque')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

async function deletarCirculoSupabase(id) {
    const client = getSupabase();
    if (!client) throw new Error("Supabase não carregado");

    const { error } = await client
        .from('circulos_destaque')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}
