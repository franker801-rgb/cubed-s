const DB_URL = "https://aad-garments-default-rtdb.firebaseio.com"; // Aapka Link
const PASS = "AAD786";

let products = [];
let banners = [];
let bIdx = 0;

// 1. Firebase Sync
async function syncCloud(method, data = null) {
    try {
        const url = `${DB_URL}/store.json`;
        if (method === "GET") {
            const res = await fetch(url);
            return await res.json() || { products: [], banners: [] };
        } else {
            await fetch(url, { method: 'PUT', body: JSON.stringify(data) });
        }
    } catch (e) { console.error("Cloud Error", e); }
}

async function init() {
    const data = await syncCloud("GET");
    products = data.products || [];
    banners = data.banners || [];
    render();
}

// 2. Admin & Upload
function loginAdmin() {
    if (prompt("Security Key:") === PASS) {
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('entryBtn').style.display = 'none';
        document.getElementById('exitBtn').style.display = 'block';
        render();
    }
}

async function uploadProduct() {
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    const category = document.getElementById('pCategory').value;
    const files = document.getElementById('pFiles').files;
    let imgs = [];
    
    if(name && price && files.length > 0) {
        const toBase = f => new Promise(res => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result);
            fr.readAsDataURL(f);
        });
        for(let f of files) imgs.push(await toBase(f));
        products.push({ name, price, category, imgs, stock: true });
        await syncCloud("SAVE", { products, banners });
        alert("Published to Cloud!");
        init();
    }
}

// 3. Search & Filter Logic
function toggleFilter() {
    const m = document.getElementById('filterMenu');
    m.style.display = m.style.display === 'none' ? 'block' : 'none';
}

function filterProducts() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const f = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    render(f);
}

function filterByCategory(cat) {
    document.querySelectorAll('.f-btn').forEach(b => b.classList.toggle('active', b.innerText.includes(cat) || (cat==='All' && b.innerText==='All')));
    const f = cat === 'All' ? products : products.filter(p => p.category === cat);
    render(f);
}

// 4. Render Grid
function render(data = products) {
    document.getElementById('heroWrapper').innerHTML = banners.map(b => `<img src="${b}" class="banner-slide">`).join('');
    const grid = document.getElementById('productGrid');
    const isAdmin = document.getElementById('adminPanel').style.display === 'block';

    grid.innerHTML = data.map((p) => {
        const i = products.indexOf(p);
        return `
        <div class="card" onclick="openProduct(${i})">
            ${!p.stock ? '<div style="position:absolute;top:10px;left:10px;background:red;color:white;padding:3px 8px;font-size:10px;z-index:2;">SOLD OUT</div>' : ''}
            <img src="${p.imgs[0]}">
            <div style="padding:10px; text-align:center;">
                <span style="font-size:10px; color:gray;">${p.category}</span>
                <h4 style="font-size:13px; text-transform:uppercase;">${p.name}</h4>
                <p style="color:var(--gold); font-weight:bold;">₹${p.price}</p>
            </div>
            ${isAdmin ? `
                <div class="admin-actions">
                    <button style="background:#dcfce7;" onclick="event.stopPropagation(); toggleStock(${i})">Stock</button>
                    <button style="background:#fee2e2;color:red;" onclick="event.stopPropagation(); deleteProduct(${i})">Delete</button>
                </div>
            ` : ''}
        </div>`;
    }).join('');
}

// 9 Sec Auto Banner
setInterval(() => {
    if(banners.length > 1) {
        bIdx = (bIdx + 1) % banners.length;
        document.getElementById('heroWrapper').style.transform = `translateX(-${bIdx * 100}%)`;
    }
}, 9000);

async function deleteProduct(i) { if(confirm("Delete?")) { products.splice(i, 1); await syncCloud("SAVE", { products, banners }); init(); } }
async function toggleStock(i) { products[i].stock = !products[i].stock; await syncCloud("SAVE", { products, banners }); init(); }
function logout() { location.reload(); }
init();