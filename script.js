// Firebase Configuration using your ID
const firebaseConfig = {
    databaseURL: "https://cutting-7e1e9-default-rtdb.firebaseio.com/",
    projectId: "cutting-7e1e9",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const PASS = "cutting786";
let services = [];
let bookings = [];

// Sync Services from Firebase
db.ref('services').on('value', (snap) => {
    let data = snap.val();
    services = data ? Object.values(data) : [];
    renderStyles();
});

// Sync Bookings
db.ref('bookings').on('value', (snap) => {
    let data = snap.val();
    bookings = data ? Object.values(data) : [];
    renderAdmin();
});

function enterShop() {
    let n = document.getElementById('uName').value;
    if(!n) return alert("Enter Name!");
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('shop-page').classList.add('active');
    document.getElementById('welcome-user').innerText = "Hi, " + n;
}

function renderStyles() {
    let g = document.getElementById('services-grid');
    if(!g) return;
    g.innerHTML = services.map((s, i) => `
        <div class="card">
            <img src="${s.img}">
            <div class="card-info">
                <h4 style="margin:0;">${s.name}</h4>
                <div style="color:var(--gold); font-weight:bold;">₹${s.price} | ${s.duration} min</div>
                <input type="date" class="d-val">
                <input type="time" class="t-val">
                <button class="prime-btn" onclick="bookNow(${i}, this)">BOOK NOW</button>
            </div>
        </div>
    `).join('');
}

function bookNow(idx, btn) {
    let d = btn.parentElement.querySelector('.d-val').value;
    let t = btn.parentElement.querySelector('.t-val').value;
    if(!d || !t) return alert("Select Date & Time!");

    let startReq = new Date(d + " " + t);
    let endReq = new Date(startReq.getTime() + parseInt(services[idx].duration) * 60000);

    window.temp = {
        name: document.getElementById('uName').value,
        service: services[idx].name,
        price: services[idx].price,
        date: d,
        time: startReq.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        endTime: endReq.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        rawTime: t,
        confirmed: false,
        id: Date.now()
    };
    
    document.getElementById('style-name-modal').innerText = services[idx].name;
    document.getElementById('style-details-modal').innerText = `${window.temp.time} - ${window.temp.endTime}`;
    document.getElementById('pay-modal').style.display = 'flex';
}

function payWith() {
    // UPI ID yahan tab dalna jab aap decide kar lo
    window.location.href = `upi://pay?pa=YOUR_ID@upi&pn=Eleven7&am=${window.temp.price}&cu=INR`;
    setTimeout(() => { document.getElementById('after-pay-check').style.display = 'block'; }, 2000);
}

function finalSubmit() {
    db.ref('bookings/' + window.temp.id).set(window.temp);
    alert("Booking Saved on Server!");
    location.reload();
}

function togglePublicList() {
    let m = document.getElementById('public-booking-modal');
    m.style.display = (m.style.display === 'block') ? 'none' : 'block';
    if(m.style.display === 'block') {
        let active = bookings.filter(b => !b.confirmed);
        document.getElementById('public-list-items').innerHTML = active.map(b => `
            <div class="slot-item">
                <b style="color:var(--gold)">${b.name}</b>: ${b.time} to ${b.endTime}
            </div>
        `).join('') || "No active slots.";
    }
}

function openAdmin() {
    if(prompt("Pass:") === PASS) {
        document.getElementById('login-page').classList.remove('active');
        document.getElementById('admin-page').classList.add('active');
        renderAdmin();
    }
}

function renderAdmin() {
    let l = document.getElementById('admin-booking-list');
    if(!l) return;
    l.innerHTML = bookings.map((b) => `
        <div style="padding:10px; border-bottom:1px solid #ddd; ${b.confirmed ? 'display:none' : ''}">
            <b>${b.name}</b> (${b.service})<br>${b.time} - ${b.endTime}<br>
            <button onclick="confirmB('${b.id}')" style="background:green; color:white; border:none; padding:5px; border-radius:5px;">Confirm</button>
        </div>
    `).join('');
}

function confirmB(id) {
    db.ref('bookings/' + id).update({confirmed: true});
}

let b64 = "";
document.getElementById('newSImgFile').addEventListener('change', function(e) {
    let r = new FileReader();
    r.onload = () => { b64 = r.result; document.getElementById('preview').innerHTML = `<img src="${b64}" style="width:50px;">`; };
    r.readAsDataURL(e.target.files[0]);
});

function addNewService() {
    let n = document.getElementById('newSName').value, p = document.getElementById('newSPrice').value, t = document.getElementById('newSTime').value;
    if(!n || !p || !t || !b64) return alert("Fill all fields!");
    let id = Date.now();
    db.ref('services/' + id).set({name:n, price:p, duration:t, img:b64, id:id});
    alert("New Style Added Globally!");
}

function closeModal() { document.getElementById('pay-modal').style.display = 'none'; }