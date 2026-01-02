import './style.css'
import { gsap } from 'gsap'

// --- Data & Config ---
const locations = {
    osa: { name: '大阪關西 (KIX)', x: 690, y: 175, color: '#ffaaaa' },
    fuk: { name: '福岡 (FUK)', x: 680, y: 180, color: '#ffbbbb' },
    cts: { name: '札幌新千歲 (CTS)', x: 710, y: 155, color: '#eeeeff' },
    oka: { name: '沖繩那霸 (OKA)', x: 670, y: 190, color: '#44aaff' },
    tpe: { name: '台北桃園 (TPE)', x: 675, y: 185, color: '#4a9eff' },
    nrt: { name: '東京成田 (NRT)', x: 705, y: 168, color: '#ffffff' },
    hnd: { name: '東京羽田 (HND)', x: 702, y: 170, color: '#ffffff' },
    kix: { name: '大阪 (KIX)', x: 690, y: 175, color: '#ffaaaa' },
    icn: { name: '首爾仁川 (ICN)', x: 685, y: 170, color: '#ff4444' },
    cdg: { name: '巴黎戴高樂 (CDG)', x: 400, y: 155, color: '#ff8800' },
    jfk: { name: '紐約甘迺迪 (JFK)', x: 230, y: 175, color: '#ff6b4a' }
};

const prices = {
    basePerKm: 2.5,
    weightRate_Body: 100,
    weightRate_Luggage: 150,
    volumeRate: 50,
    cabinMultipliers: { seat: 2.5, 'comfort-stand': 1.2, 'hangshi-stand': 0.6 },
    addons: {
        food: { 'none': { name: '不需餐點', price: 0 }, 'beef-noodle': { name: '夯實紅燒牛肉麵', price: 380 }, 'chicken-rice': { name: '夯實海南雞飯', price: 320 } },
        drink: { 'none': { name: '不需飲料', price: 0 }, 'water': { name: '夯實礦泉水', price: 50 }, 'tea': { name: '阿里山高山青茶', price: 120 } },
        essentials: { 'blanket': { name: '舒適毛毯', price: 150 }, 'insurance': { name: '航程防撞保險', price: 1200 } }
    }
};

// Global State for Booking
let bookingState = {
    tripType: 'one-way',
    outbound: { flight: null, cabin: 'seat', passengers: 1, seats: [], addons: [] },
    inbound: { flight: null, cabin: 'seat', passengers: 1, seats: [], addons: [] }
};

document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Homepage Booking Widget Logic ---
    const widgetForm = document.getElementById('hero-booking-form');
    if (widgetForm) {
        // Populate Homepage Dropdowns
        const heroOrigin = document.getElementById('hero-origin');
        const heroDest = document.getElementById('hero-dest');
        if (heroOrigin && heroDest) {
            const sortedLocs = Object.entries(locations).sort((a, b) => a[1].name.localeCompare(b[1].name, 'zh-TW'));
            const optionsHTML = sortedLocs.map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('');
            heroOrigin.innerHTML = optionsHTML;
            heroDest.innerHTML = optionsHTML;

            // Set Defaults
            heroOrigin.value = 'tpe';
            heroDest.value = 'nrt';
        }

        const tabRound = document.getElementById('tab-round');
        const tabOne = document.getElementById('tab-one');
        const returnDateInput = document.getElementById('date-return');
        let tripType = 'round-trip';

        if (tabRound && tabOne) {
            tabRound.addEventListener('click', () => {
                tripType = 'round-trip';
                tabRound.classList.add('bg-tech-gold/20', 'border-tech-gold', 'text-tech-gold');
                tabRound.classList.remove('bg-transparent', 'border-white/30', 'text-gray-300');
                tabOne.classList.remove('bg-tech-gold/20', 'border-tech-gold', 'text-tech-gold');
                tabOne.classList.add('bg-transparent', 'border-white/30', 'text-gray-300');
                if (returnDateInput) {
                    returnDateInput.disabled = false;
                    returnDateInput.parentElement.classList.remove('opacity-50');
                    if (returnDateInput._flatpickr) {
                        returnDateInput._flatpickr.set('clickOpens', true);
                        returnDateInput._flatpickr.input.disabled = false;
                    }
                }
            });

            tabOne.addEventListener('click', () => {
                tripType = 'one-way';
                tabOne.classList.add('bg-tech-gold/20', 'border-tech-gold', 'text-tech-gold');
                tabOne.classList.remove('bg-transparent', 'border-white/30', 'text-gray-300');
                tabRound.classList.remove('bg-tech-gold/20', 'border-tech-gold', 'text-tech-gold');
                tabRound.classList.add('bg-transparent', 'border-white/30', 'text-gray-300');
                if (returnDateInput) {
                    returnDateInput.disabled = true;
                    returnDateInput.parentElement.classList.add('opacity-50');
                    returnDateInput.value = '';
                    if (returnDateInput._flatpickr) {
                        returnDateInput._flatpickr.clear();
                        returnDateInput._flatpickr.set('clickOpens', false);
                        returnDateInput._flatpickr.input.disabled = true;
                    }
                }
            });
        }

        widgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(widgetForm);
            const params = new URLSearchParams();
            params.append('origin', formData.get('origin'));
            params.append('destination', formData.get('destination'));
            params.append('date', formData.get('date'));
            if (tripType === 'round-trip') params.append('returnDate', formData.get('returnDate'));
            params.append('tripType', tripType);
            window.location.href = `booking.html?${params.toString()}`;
        });
    }

    // --- 1. Global Helpers & Animations ---
    const mainNav = document.getElementById('main-nav');
    if (mainNav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainNav.classList.add('bg-space-grey/80', 'backdrop-blur-md', 'shadow-lg', 'py-2');
                mainNav.classList.remove('py-4');
            } else {
                mainNav.classList.remove('bg-space-grey/80', 'backdrop-blur-md', 'shadow-lg', 'py-2');
                mainNav.classList.add('py-4');
            }
        });
    }

    const fleetCards = document.querySelectorAll('.fleet-card');
    fleetCards.forEach(card => {
        card.addEventListener('click', () => {
            const isActive = card.classList.contains('active-card');
            fleetCards.forEach(c => {
                c.classList.remove('active-card', 'ring-2', 'ring-tech-gold');
                const specs = c.querySelector('.fleet-specs');
                if (specs) { specs.style.height = '0px'; specs.style.opacity = '0'; }
            });
            if (!isActive) {
                card.classList.add('active-card', 'ring-2', 'ring-tech-gold');
                const specs = card.querySelector('.fleet-specs');
                if (specs) { specs.style.height = specs.scrollHeight + 'px'; specs.style.opacity = '1'; }
            }
        });
    });

    // --- 2. Booking Page Logic ---
    const ticketForm = document.getElementById('ticket-calculator');
    if (ticketForm) {
        initBookingPage();
    }
});

// --- Data & Config ---


function initBookingPage() {
    window.bookingState = bookingState; // Global for debugging
    console.log("[Init] Booking Page started");
    // 1. Initialize Flatpickr Logic
    const fpOut = flatpickr("#date-outbound", { minDate: "today", dateFormat: "Y-m-d", theme: "dark", allowInput: false, clickOpens: true, onChange: updateUI });
    const fpIn = flatpickr("#date-inbound", { minDate: "today", dateFormat: "Y-m-d", theme: "dark", allowInput: false, clickOpens: true, onChange: updateUI });

    // 2. Trip Type Toggles
    const btnOneWay = document.getElementById('btn-one-way');
    const btnRoundTrip = document.getElementById('btn-round-trip');

    if (btnOneWay && btnRoundTrip) {
        btnOneWay.addEventListener('click', () => {
            bookingState.tripType = 'one-way';
            btnOneWay.className = "trip-toggle px-4 py-2 border border-tech-gold bg-tech-gold/10 text-tech-gold rounded text-xs uppercase tracking-widest transition-all";
            btnRoundTrip.className = "trip-toggle px-4 py-2 border border-white/20 rounded text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-all";
            updateUI();
        });
        btnRoundTrip.addEventListener('click', () => {
            bookingState.tripType = 'round-trip';
            btnRoundTrip.className = "trip-toggle px-4 py-2 border border-tech-gold bg-tech-gold/10 text-tech-gold rounded text-xs uppercase tracking-widest transition-all";
            btnOneWay.className = "trip-toggle px-4 py-2 border border-white/20 rounded text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-all";
            updateUI();
        });
    }

    // 3. Search triggers
    ['origin', 'destination'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', updateUI);
    });

    // 4. Init Phases
    initPhaseHelpers('outbound');
    initPhaseHelpers('inbound');

    // 5. Connect Finish Outbound Button
    document.getElementById('btn-finish-outbound')?.addEventListener('click', () => {
        console.log("[Flow] Finish Outbound button clicked");
        if (!bookingState.outbound.flight) return alert('請選擇去程航班');
        // Validate seats
        const needed = bookingState.outbound.passengers;
        const current = bookingState.outbound.seats.length;
        if (bookingState.outbound.cabin !== 'hangshi-stand' && current !== needed) {
            return alert(`請為所有乘客 (${needed} 位) 選位`);
        }

        if (bookingState.tripType === 'round-trip') {
            document.getElementById('inbound-phase')?.classList.remove('hidden');
            const di = document.getElementById('date-inbound');
            if (di && !di.value && di._flatpickr) di._flatpickr.open();
            document.getElementById('inbound-phase')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            document.querySelector('.sticky-invoice')?.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // 6. Connect Proceed to Confirmation
    document.getElementById('proceed-to-confirmation')?.addEventListener('click', () => {
        const originVal = document.getElementById('origin')?.value;
        const destVal = document.getElementById('destination')?.value;
        const originName = locations[originVal]?.name || originVal;
        const destName = locations[destVal]?.name || destVal;

        const distStr = document.getElementById('distance-display')?.innerText.replace(/[^\d]/g, '') || "0";
        const finalData = {
            origin: originVal?.toUpperCase(),
            destination: destVal?.toUpperCase(),
            originName: originName?.split('(')[0].trim(),
            destName: destName?.split('(')[0].trim(),
            passengerCount: bookingState.outbound.passengers,
            duration: "3h 30m",
            distance: parseInt(distStr),
            cabin: bookingState.outbound.cabin,
            selectedSeats: bookingState.outbound.seats,
            totalAmount: parseInt(document.getElementById('total-price').innerText.replace(/[^\d]/g, '') || "0"),
            tripType: bookingState.tripType,
            outbound: bookingState.outbound,
            inbound: bookingState.tripType === 'round-trip' ? bookingState.inbound : null
        };

        sessionStorage.setItem('bookingData', JSON.stringify(finalData));
        window.location.href = 'confirmation.html';
    });

    // Populate Selects
    const sortedLocs = Object.entries(locations).sort((a, b) => a[1].name.localeCompare(b[1].name, 'zh-TW'));
    ['origin', 'destination'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const val = el.value;
            el.innerHTML = sortedLocs.map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('');
            if (val && locations[val]) el.value = val;
            else el.value = id === 'origin' ? 'tpe' : 'nrt';
        }
    });

    // Determine initial state from URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('tripType') === 'round-trip') btnRoundTrip?.click();
    if (params.get('origin')) {
        setTimeout(() => {
            const elO = document.getElementById('origin');
            const elD = document.getElementById('destination');
            const elDate = document.getElementById('date-outbound');
            if (elO) elO.value = params.get('origin');
            if (elD) elD.value = params.get('destination');
            if (elDate && params.get('date')) {
                elDate.value = params.get('date');
                if (elDate._flatpickr) elDate._flatpickr.setDate(params.get('date'));
            }
            updateUI();
        }, 500);
    }
}

function initPhaseHelpers(phase) {
    const cabinSel = document.getElementById(`cabin-${phase}`);
    const passInput = document.getElementById(`passengers-${phase}`);
    const incBtn = document.getElementById(`inc-passengers-${phase}`);
    const decBtn = document.getElementById(`dec-passengers-${phase}`);

    cabinSel?.addEventListener('change', () => {
        bookingState[phase].cabin = cabinSel.value;
        bookingState[phase].seats = [];
        renderPhaseDetails(phase);
        renderSeatMap(phase);
        updateInvoice();
    });

    incBtn?.addEventListener('click', () => {
        let val = parseInt(passInput.value) || 1;
        if (val < 10) {
            passInput.value = val + 1;
            bookingState[phase].passengers = val + 1;
            renderPhaseDetails(phase);
            renderSeatMap(phase);
            updateInvoice();
        }
    });

    decBtn?.addEventListener('click', () => {
        let val = parseInt(passInput.value) || 1;
        if (val > 1) {
            passInput.value = val - 1;
            bookingState[phase].passengers = val - 1;
            if (bookingState[phase].seats.length > val - 1) bookingState[phase].seats = bookingState[phase].seats.slice(0, val - 1);
            renderPhaseDetails(phase);
            renderSeatMap(phase);
            updateInvoice();
        }
    });
}

function renderFlights(type, origin, dest, date) {
    const list = document.getElementById(`${type}-flights-list`);
    const label = document.getElementById(`lbl-route-${type === 'outbound' ? 'out' : 'in'}`);
    if (label) label.innerText = `${origin} ➝ ${dest} (${date})`;
    if (!list) return;
    list.innerHTML = '';

    const flights = [
        { id: type === 'outbound' ? 'HS801' : 'HS901', dep: '09:30', arr: '13:55' },
        { id: type === 'outbound' ? 'HS803' : 'HS903', dep: '14:40', arr: '19:05' },
        { id: type === 'outbound' ? 'HS805' : 'HS905', dep: '20:20', arr: '23:45' }
    ];

    flights.forEach(f => {
        const isSelected = bookingState[type].flight?.id === f.id;
        const div = document.createElement('div');
        div.className = `p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${isSelected ? 'border-tech-gold bg-tech-gold/10' : 'border-white/10 hover:bg-white/5'}`;
        div.innerHTML = `
            <div><div class="text-xl font-bold text-white">${f.dep} - ${f.arr}</div><div class="text-xs text-gray-500">${f.id}</div></div>
            <div class="text-tech-gold font-bold">TWD 12,500</div>
        `;
        div.onclick = () => {
            console.log(`[Flow] ${type} flight clicked:`, f.id);
            bookingState[type].flight = f;
            document.getElementById(`${type}-config`)?.classList.remove('hidden');
            renderFlights(type, origin, dest, date);
            renderPhaseDetails(type);
            renderSeatMap(type);
            updateInvoice();
        };
        list.appendChild(div);
    });
}

function renderPhaseDetails(phase) {
    const container = document.getElementById(`passenger-details-container-${phase}`);
    if (!container) return;
    container.innerHTML = '';
    const count = bookingState[phase].passengers;

    for (let i = 1; i <= count; i++) {
        const div = document.createElement('div');
        div.className = 'p-4 border border-white/10 rounded mb-4 bg-white/5';
        div.innerHTML = `
            <div class="text-xs text-gray-400 mb-2">乘客 ${i} (${phase === 'outbound' ? '去程' : '回程'})</div>
            <div class="grid grid-cols-2 gap-4">
               <div><label class="text-[10px] text-gray-500">體重 (KG)</label><input type="number" class="w-full bg-black/50 border border-white/20 text-white text-xs p-2 rounded p-weight" value="70"></div>
               <div><label class="text-[10px] text-gray-500">行李 (KG)</label><input type="number" class="w-full bg-black/50 border border-white/20 text-white text-xs p-2 rounded p-luggage" value="10"></div>
            </div>
        `;
        div.querySelectorAll('input').forEach(inp => inp.addEventListener('input', updateInvoice));
        container.appendChild(div);
    }
}

function updateUI() {
    const origin = document.getElementById('origin')?.value;
    const dest = document.getElementById('destination')?.value;
    const dateOut = document.getElementById('date-outbound')?.value;

    console.log("[UpdateUI] state:", { origin, dest, dateOut, type: bookingState.tripType });

    if (origin && dest && dateOut) {
        document.getElementById('outbound-phase')?.classList.remove('hidden');
        renderFlights('outbound', origin, dest, dateOut);
    }

    if (bookingState.tripType === 'round-trip') {
        const inPhase = document.getElementById('inbound-phase');
        if (inPhase) {
            inPhase.classList.remove('hidden');
            // Ensure child container is shown if date selected
            const dateIn = document.getElementById('date-inbound')?.value;
            if (dateIn) {
                document.getElementById('inbound-container')?.classList.remove('hidden');
                renderFlights('inbound', dest, origin, dateIn);
            }
        }
    } else {
        document.getElementById('inbound-phase')?.classList.add('hidden');
    }

    renderMap();
}

function renderMap() {
    const canvas = document.getElementById('space-map');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const origin = document.getElementById('origin')?.value;
    const dest = document.getElementById('destination')?.value;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Points
    Object.entries(locations).forEach(([k, loc]) => {
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = (k === origin || k === dest) ? '#D4AF37' : '#ffffff22';
        ctx.fill();

        if (k === origin || k === dest) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#D4AF37';
            ctx.beginPath();
            ctx.arc(loc.x, loc.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = '10px Montserrat';
            ctx.fillText(loc.name.split(' ')[0], loc.x + 10, loc.y + 5);
        }
    });

    if (origin && dest && origin !== dest) {
        const o = locations[origin];
        const d = locations[dest];

        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        ctx.lineTo(d.x, d.y);
        ctx.strokeStyle = '#D4AF3788';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        const dist = Math.sqrt(Math.pow(o.x - d.x, 2) + Math.pow(o.y - d.y, 2)) * 12;
        const distEl = document.getElementById('distance-display');
        if (distEl) distEl.innerText = `${Math.round(dist).toLocaleString()} km`;
    }
}

function renderSeatMap(phase) {
    const container = document.getElementById(`seat-map-container-${phase}`);
    if (!container) return;
    const cabin = bookingState[phase].cabin;
    const count = bookingState[phase].passengers;

    console.log(`[Render] Seat Map for ${phase}, cabin: ${cabin}, count: ${count}`);

    const updateLabel = document.getElementById(`seats-needed-${phase}`);
    if (updateLabel) updateLabel.innerText = count;

    container.innerHTML = '';
    if (cabin === 'hangshi-stand') {
        container.innerHTML = '<div class="text-xs text-gray-500">此艙等不需選位</div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-5 gap-2 max-w-[300px] mx-auto';
    for (let i = 1; i <= 20; i++) {
        const seatId = `S${i}`;
        const isSelected = bookingState[phase].seats.includes(seatId);
        const cell = document.createElement('div');
        cell.className = `h-8 rounded flex items-center justify-center text-xs cursor-pointer ${isSelected ? 'bg-tech-gold text-black' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`;
        cell.innerText = seatId;
        cell.onclick = () => {
            const s = bookingState[phase].seats;
            if (s.includes(seatId)) bookingState[phase].seats = s.filter(x => x !== seatId);
            else {
                if (s.length < count) bookingState[phase].seats.push(seatId);
                else { s.shift(); s.push(seatId); }
            }
            renderSeatMap(phase);
        };
        grid.appendChild(cell);
    }
    container.appendChild(grid);
}

function updateInvoice() {
    let total = 0;

    // Base Price Calculation
    const calcPhase = (phase) => {
        if (!bookingState[phase].flight) return;

        // Base Flight Cost (Approx based on distance/mock)
        let baseFlightPrice = 12500;

        // Cabin Multiplier
        const cabinMult = prices.cabinMultipliers[bookingState[phase].cabin] || 1;

        // Pax Count
        const pax = bookingState[phase].passengers;

        let phaseTotal = baseFlightPrice * cabinMult * pax;

        // Weight Costs (Body + Luggage)
        document.querySelectorAll(`#passenger-details-container-${phase} input.p-weight`).forEach(i => {
            const w = parseInt(i.value) || 0;
            phaseTotal += w * prices.weightRate_Body;
        });

        document.querySelectorAll(`#passenger-details-container-${phase} input.p-luggage`).forEach(i => {
            const w = parseInt(i.value) || 0;
            phaseTotal += w * prices.weightRate_Luggage;
        });

        total += phaseTotal;
    };

    calcPhase('outbound');
    if (bookingState.tripType === 'round-trip') calcPhase('inbound');

    const tax = Math.round(total * 0.05);
    const final = total + tax;

    document.getElementById('invoice-total').innerText = `NT$ ${final.toLocaleString()}`;
    document.getElementById('tax-amount').innerText = `NT$ ${tax.toLocaleString()}`;
    document.getElementById('total-price').innerText = `NT$ ${final.toLocaleString()}`;

    // Update Button State
    const btnParams = {
        outbound: !!bookingState.outbound.flight && (bookingState.outbound.cabin === 'hangshi-stand' || bookingState.outbound.seats.length === bookingState.outbound.passengers),
        inbound: bookingState.tripType === 'one-way' || (!!bookingState.inbound.flight && (bookingState.inbound.cabin === 'hangshi-stand' || bookingState.inbound.seats.length === bookingState.inbound.passengers))
    };

    const confirmBtn = document.getElementById('proceed-to-confirmation');
    if (confirmBtn) {
        if (btnParams.outbound && btnParams.inbound) {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            confirmBtn.classList.add('hover:scale-[1.02]', 'active:scale-[0.98]');
        } else {
            confirmBtn.disabled = true;
            confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
            confirmBtn.classList.remove('hover:scale-[1.02]', 'active:scale-[0.98]');
        }
    }
}
