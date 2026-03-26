const DB_URL = "https://aad-garments-default-rtdb.firebaseio.com"; 
const PASS = "fashionwala574"; // Naya password yahan set kar diya hai

let products = [];
let banners = [];
let bIdx = 0;
let isAdmin = false;

async function initStore() {
    try {
        const res = await fetch(`${DB_URL}/store.json`);
        const data = await res.json();
        if(data) {
            products = data.products || [];
            banners = data.banners || [];
            render();
            if(banners.length > 1) startSlider();
        }
    } catch (e) { console.error("Sync Error"); }
}

function loginAdmin() {
    const entry = prompt("Security Key:");
    if (entry === PASS) {
        isAdmin = true;
        document.getElementById('adminPanel').style.display = 'flex';
        render(); 
    } else if (entry !== null) {
        alert("Galat Password!");
    }
}

function closeAdminModal() {
    document.getElementById('adminPanel').style.display = 'none';
    render(); 
}

function render(data = products) {
    const track = document.getElementById('heroWrapper');
    if(track && banners.length > 0) {
        track.innerHTML = banners.map(b => `<img src="${b}" class="banner-slide">`).join('');
    }

    const grid = document.getElementById('productGrid');
    grid.innerHTML = data.map((p, i) => {
        const idx = products.indexOf(p);
        return `
        <div class="card">
            ${!p.stock ? '<div class="stock-badge">SOLD OUT</div>' : ''}
            <img src="${p.imgs[0]}" loading="lazy">
            <div class="card-info">
                <p style="font-size:9px; color:#999; text-transform:uppercase;">${p.category}</p>
                <h4>${p.name}</h4>
                <p class="price">₹${p.price}</p>
            </div>
            ${isAdmin ? `
            <div class="admin-controls">
                <button class="btn-stock" onclick="event.stopPropagation(); toggleStock(${idx})">
                    ${p.stock ? 'Unavailable' : 'Available'}
                </button>
                <button class="btn-delete" onclick="event.stopPropagation(); deleteItem(${idx})">Delete</button>
            </div>` : ''}
        </div>`;
    }).join('');
}

function startSlider() {
    setInterval(() => {
        bIdx = (bIdx + 1) % banners.length;
        const track = document.getElementById('heroWrapper');
        if(track) track.style.transform = `translateX(-${bIdx * 100}%)`;
    }, 9000);
}

async function sync() {
    return await fetch(`${DB_URL}/store.json`, { 
        method: 'PUT', 
        body: JSON.stringify({ products, banners }) 
    });
}

async function toggleStock(i) {
    products[i].stock = !products[i].stock;
    await sync();
    render();
}

async function deleteItem(i) {
    if(confirm("Kya aap sach mein is product ko nikalna chahte hain?")) {
        products.splice(i, 1);
        const response = await sync();
        if(response.ok) {
            alert("Product Delete ho gaya!");
            location.reload(); 
        } else {
            alert("Delete karne mein error aaya, dobara try karein.");
        }
    }
}

function filterProducts() {
    const val = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(val) || 
        p.category.toLowerCase().includes(val)
    );
    render(filtered);
}

function filterByCategory(cat) {
    const filtered = cat === 'All' ? products : products.filter(p => p.category === cat);
    render(filtered);
    document.querySelectorAll('.cat-chip').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.includes(cat));
    });
}

const toBase = f => new Promise(r => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(f);
});

async function uploadProduct() {
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    const cat = document.getElementById('pCategory').value;
    const files = document.getElementById('pFiles').files;
    if(name && price && files.length > 0) {
        alert("Saving...");
        let imgs = [];
        for(let f of files) imgs.push(await toBase(f));
        products.push({ name, price, category: cat, imgs, stock: true });
        await sync();
        location.reload();
    }
}

async function uploadBanner() {
    const f = document.getElementById('bFile').files[0];
    if(f) {
        banners.push(await toBase(f));
        await sync();
        location.reload();
    }
}

function switchTab(tab) {
    document.getElementById('pTab').style.display = tab === 'pTab' ? 'block' : 'none';
    document.getElementById('bTab').style.display = tab === 'bTab' ? 'block' : 'none';
}

initStore();