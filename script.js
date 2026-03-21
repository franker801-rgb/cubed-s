const firebaseConfig = {
    databaseURL: "https://cutting-7e1e9-default-rtdb.firebaseio.com/",
    projectId: "cutting-7e1e9",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const PASS = "cutting786";
let services = [];
let bookings = [];

// Real-time Data Sync
db.ref('services').on('value', (s) => { services = s.val() ? Object.values(s.val()) : []; renderStyles(); });
db.ref('bookings').on('value', (s) => { bookings = s.val() ? Object.values(s.val()) : []; renderAdmin(); });

function enterShop() {
    if(!document.getElementById('uName').value) return alert("Please Enter Your Name");
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('shop-page').classList.add('active');
    document.getElementById('welcome-user').innerText = "Hi, " + document.getElementById('uName').value;
}

function renderStyles() {
    let g = document.getElementById('services-grid');
    if(!g) return;
    g.innerHTML = services.map((s, i) => `
        <div class="card">
            <img src="${s.img}">
            <div class="card-info">
                <h3 style="margin:0; font-family:'Cinzel'">${s.name}</h3>
                <p style="color:var(--gold); font-weight:bold; font-size:18px;">₹${s.price}</p>
                <button class="prime-btn" onclick="alert('Booking feature coming soon with real-time slots!')">BOOK NOW</button>
            </div>
        </div>
    `).join('');
}

function openAdmin() {
    if(prompt("Staff Pass:") === PASS) {
        document.getElementById('login-page').classList.remove('active');
        document.getElementById('admin-page').classList.add('active');
    }
}

function renderAdmin() {
    let list = document.getElementById('admin-booking-list');
    if(!list) return;
    list.innerHTML = bookings.map(b => `
        <div style="background:#f9f9f9; padding:10px; border-radius:10px; margin-bottom:5px;">
            <b>${b.name}</b> - ${b.service} (${b.time})
        </div>
    `).join('') || "No bookings yet.";
}

let b64 = "";
document.getElementById('newSImgFile').addEventListener('change', function(e) {
    let r = new FileReader();
    r.onload = () => { b64 = r.result; document.getElementById('preview').innerHTML = `<img src="${b64}" style="width:80px; margin-top:10px;">`; };
    r.readAsDataURL(e.target.files[0]);
});

function addNewService() {
    let n = document.getElementById('newSName').value, p = document.getElementById('newSPrice').value, t = document.getElementById('newSTime').value;
    if(!n || !p || !t || !b64) return alert("Please fill all fields!");
    let id = Date.now();
    db.ref('services/' + id).set({name:n, price:p, duration:t, img:b64, id:id});
    alert("New Style Added Globally!");
}