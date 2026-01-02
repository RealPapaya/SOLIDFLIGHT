import './style.css'
import { gsap } from 'gsap'

const bgMap = new Image();
bgMap.src = 'world-map.png';

// --- Data & Config ---
const locations = {
    // Japan
    nrt: { name: '東京成田 (NRT)', x: 720, y: 190, color: '#ffffff' },
    hnd: { name: '東京羽田 (HND)', x: 715, y: 195, color: '#ffffff' },
    kix: { name: '大阪關西 (KIX)', x: 700, y: 205, color: '#ffaaaa' },
    osa: { name: '大阪伊丹 (ITM)', x: 698, y: 205, color: '#ffaaaa' },
    fuk: { name: '福岡 (FUK)', x: 685, y: 215, color: '#ffbbbb' },
    cts: { name: '札幌新千歲 (CTS)', x: 730, y: 155, color: '#eeeeff' },
    oka: { name: '沖繩那霸 (OKA)', x: 680, y: 235, color: '#44aaff' },

    // Taiwan
    tpe: { name: '台北桃園 (TPE)', x: 655, y: 235, color: '#4a9eff' },

    // Korea
    icn: { name: '首爾仁川 (ICN)', x: 665, y: 195, color: '#ff4444' },

    // Long Haul
    cdg: { name: '巴黎戴高樂 (CDG)', x: 395, y: 160, color: '#ff8800' },
    jfk: { name: '紐約甘迺迪 (JFK)', x: 210, y: 175, color: '#ff6b4a' }
};

const prices = {
    basePerKm: 2.5,
    weightRate_Body: 10, // per kg
    weightRate_Luggage: 15, // per kg
    volumeRate: 2, // per cm3 (approx) for Hangshi Stand
    cabinMultipliers: {
        seat: 2.5,
        'comfort-stand': 1.2,
        'hangshi-stand': 0.6 // Base factor, but mainly volume charged
    },
    addons: {
        food: { 'none': { name: '不需餐點', price: 0 }, 'beef-noodle': { name: '夯實紅燒牛肉麵', price: 380 }, 'chicken-rice': { name: '夯實海南雞飯', price: 320 } },
        drink: { 'none': { name: '不需飲料', price: 0 }, 'water': { name: '夯實礦泉水', price: 50 }, 'tea': { name: '阿里山高山青茶', price: 120 } },
        essentials: {
            'blanket': { name: '舒適毛毯', price: 150 },
            'urine-bag': { name: '應急尿袋', price: 50 },
            'vomit-bag': { name: '嘔吐袋', price: 30 },
            'feces-bag': { name: '強效屎袋', price: 80 },
            'insurance': { name: '航程防撞保險', price: 1200 }
        }
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
        console.log("[Flow] Finish Button Clicked. Current Outbound Flight:", bookingState.outbound.flight);

        if (!bookingState.outbound.flight) {
            alert('請先選擇去程航班');
            document.getElementById('outbound-container')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const needed = bookingState.outbound.passengers;
        const current = bookingState.outbound.seats.length;
        // Hangshi Stand does not require seat selection (volume based)
        if (bookingState.outbound.cabin !== 'hangshi-stand' && current !== needed) {
            return alert(`請為所有乘客 (${needed} 位) 完成選座`);
        }

        if (bookingState.tripType === 'round-trip') {
            const inPhase = document.getElementById('inbound-phase');
            if (inPhase) {
                inPhase.classList.remove('hidden');
                document.getElementById('inbound-container')?.classList.remove('hidden');

                // Auto trigger inbound rendering if date exists
                const di = document.getElementById('date-inbound');
                if (di && di.value) {
                    updateUI();
                } else if (di && di._flatpickr) {
                    di._flatpickr.open();
                }

                setTimeout(() => inPhase.scrollIntoView({ behavior: 'smooth' }), 100);
            }
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
            inbound: bookingState.tripType === 'round-trip' ? bookingState.inbound : null,
            outbound: bookingState.outbound,
            inbound: bookingState.tripType === 'round-trip' ? bookingState.inbound : null,
            addons: [], // Populated below
            passengerDetails: [] // New: Detailed passenger stats
        };

        // Collect Passenger Details (Weight/Height/Gender/Luggage)
        const collectPassengerStats = (phase) => {
            if (!bookingState[phase].flight) return;
            const container = document.getElementById(`passenger-details-container-${phase}`);
            if (!container) return;

            const pDivs = container.querySelectorAll('.p-5'); // Passenger blocks
            pDivs.forEach((div, idx) => {
                let stats = { phase, index: idx + 1 };
                if (bookingState[phase].cabin === 'hangshi-stand') {
                    stats.type = 'stand';
                    stats.gender = div.querySelector('.p-vol-gender')?.value;
                    stats.height = div.querySelector('.p-vol-h')?.value;
                    stats.weight = div.querySelector('.p-vol-w')?.value;
                    stats.luggage = div.querySelector('.p-vol-l')?.value;
                } else {
                    stats.type = 'seat';
                    stats.weight = div.querySelector('.p-weight')?.value;
                    stats.luggage = div.querySelector('.p-luggage')?.value;
                }
                finalData.passengerDetails.push(stats);
            });
        };
        collectPassengerStats('outbound');
        if (bookingState.tripType === 'round-trip') collectPassengerStats('inbound');

        // Collect Addons for Confirmation Page Display
        let collectedAddons = [];

        const collectPhaseAddons = (phase) => {
            if (!bookingState[phase].flight) return;
            const container = document.getElementById(`passenger-details-container-${phase}`);
            if (!container) return;

            // Food
            container.querySelectorAll('.p-addon-food').forEach(sel => {
                const val = sel.value;
                if (val !== 'none' && prices.addons.food[val]) {
                    collectedAddons.push({
                        name: `${prices.addons.food[val].name} (${phase === 'outbound' ? '去程' : '回程'})`,
                        price: prices.addons.food[val].price,
                        icon: '🍜'
                    });
                }
            });

            // Drink
            container.querySelectorAll('.p-addon-drink').forEach(sel => {
                const val = sel.value;
                if (val !== 'none' && prices.addons.drink[val]) {
                    collectedAddons.push({
                        name: `${prices.addons.drink[val].name} (${phase === 'outbound' ? '去程' : '回程'})`,
                        price: prices.addons.drink[val].price,
                        icon: '🥤'
                    });
                }
            });

            // Essentials
            container.querySelectorAll('.p-addon-essential:checked').forEach(cb => {
                const val = cb.value;
                if (prices.addons.essentials[val]) {
                    collectedAddons.push({
                        name: `${prices.addons.essentials[val].name} (${phase === 'outbound' ? '去程' : '回程'})`,
                        price: prices.addons.essentials[val].price,
                        icon: '🛡️'
                    });
                }
            });
        };

        collectPhaseAddons('outbound');
        if (bookingState.tripType === 'round-trip') collectPhaseAddons('inbound');

        finalData.addons = collectedAddons;

        // Calculate detailed breakdown
        const basePrice = (finalData.distance * prices.basePerKm) * prices.cabinMultipliers[bookingState.outbound.cabin] * finalData.passengerCount;

        let weightCost = 0;
        let luggageCost = 0;
        let volumeCost = 0;

        // Iterate outbound passengers to get accurate weight/volume costs
        const outboundPassengerDetails = document.querySelectorAll('#passenger-details-container-outbound > div');
        outboundPassengerDetails.forEach(passengerDiv => {
            if (bookingState.outbound.cabin === 'hangshi-stand') {
                const w = parseInt(passengerDiv.querySelector('.p-vol-w')?.value || "60"); // Weight
                const h = parseInt(passengerDiv.querySelector('.p-vol-h')?.value || "170"); // Height
                const g = passengerDiv.querySelector('.p-vol-gender')?.value || "M"; // Gender
                const l = parseInt(passengerDiv.querySelector('.p-vol-l')?.value || "0"); // Luggage

                // Formula: (Weight * 12 + Height * 5) * (Female ? 1.1 : 1.0)
                let baseVol = (w * 12) + (h * 5);
                if (g === 'F') baseVol *= 1.1;

                volumeCost += Math.round(baseVol * 4); // x4 scaling
                luggageCost += l * prices.weightRate_Luggage; // Add luggage cost
            } else {
                weightCost += (parseInt(passengerDiv.querySelector('.p-weight')?.value || "0") - 60) * prices.weightRate_Body; // Assuming 60kg free
                luggageCost += parseInt(passengerDiv.querySelector('.p-luggage')?.value || "0") * prices.weightRate_Luggage;
            }
        });
        if (weightCost < 0) weightCost = 0; // Ensure weight cost doesn't go negative

        const addonsCost = collectedAddons.reduce((sum, item) => sum + item.price, 0);
        const subtotal = basePrice + weightCost + luggageCost + volumeCost + addonsCost;
        const tax = Math.round(subtotal * 0.05);

        // Also add breakdown for confirmation page
        finalData.priceBreakdown = {
            baseFare: Math.round(basePrice),
            passengerWeight: Math.round(weightCost),
            luggageWeight: Math.round(luggageCost),
            volumeCost: Math.round(volumeCost),
            addonsCost: addonsCost,
            tax: tax,
            refundFee: 3000 // Fixed fee
        };
        finalData.totalAmount = subtotal + tax; // Recalculate to be precise

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

    // Calculate base distance for price
    const locO = locations[origin] || locations['tpe'];
    const locD = locations[dest] || locations['nrt'];
    const dist = Math.sqrt(Math.pow(locO.x - locD.x, 2) + Math.pow(locO.y - locD.y, 2)) * 4;

    const flights = [
        { id: type === 'outbound' ? 'HS801' : 'HS901', dep: '09:30', arr: '13:55', factor: 1.0 },
        { id: type === 'outbound' ? 'HS803' : 'HS903', dep: '14:40', arr: '19:05', factor: 1.2 },
        { id: type === 'outbound' ? 'HS805' : 'HS905', dep: '20:20', arr: '23:45', factor: 0.9 }
    ];

    flights.forEach(f => {
        // Dynamic price calculation: Base * Distance * Factor + Random Fluctuation
        const basePrice = Math.round(dist * prices.basePerKm * f.factor);
        // Add some "floating" randomness +/- 500
        const randomVar = Math.floor(Math.random() * 10) * 50;
        const finalPrice = basePrice + randomVar;
        f.price = finalPrice; // Store for invoice

        const isSelected = bookingState[type].flight?.id === f.id;
        const div = document.createElement('div');
        div.className = `p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${isSelected ? 'border-tech-gold bg-tech-gold/10' : 'border-white/10 hover:bg-white/5'}`;
        div.innerHTML = `
            <div><div class="text-xl font-bold text-white">${f.dep} - ${f.arr}</div><div class="text-xs text-gray-500">${f.id}</div></div>
            <div class="text-tech-gold font-bold">TWD ${finalPrice.toLocaleString()}</div>
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
        div.className = 'p-5 border border-white/10 rounded-xl mb-4 bg-white/5 backdrop-blur-sm';
        let inputsHtml = '';

        if (bookingState[phase].cabin === 'hangshi-stand') {
            inputsHtml = `
                <div class="space-y-4">
                    <div class="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">
                        <span>人體體積估算 (Body Volume Est.)</span>
                        <span class="text-tech-gold font-mono text-xs"><span class="vol-total-disp">--</span> units</span>
                    </div>
                    
                    <!-- Gender -->
                    <div class="space-y-1">
                        <label class="text-[9px] text-gray-400 block">生理性別 (Gender)</label>
                        <select class="p-vol-gender w-full bg-black/40 border border-white/10 text-white text-[10px] p-2 rounded focus:border-tech-gold appearance-none">
                            <option value="M">男性 (Male)</option>
                            <option value="F">女性 (Female - Volume +10%)</option>
                        </select>
                    </div>

                    <!-- Height -->
                    <div class="space-y-2">
                        <div class="flex justify-between items-center text-[10px] text-gray-500">
                            <span>身高 (Height)</span>
                            <span class="text-tech-gold font-mono text-xs"><span class="h-vol-val">170</span> cm</span>
                        </div>
                        <input type="range" min="140" max="210" value="170" class="w-full p-vol-h accent-tech-gold cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none">
                    </div>

                    <!-- Weight -->
                    <div class="space-y-2">
                        <div class="flex justify-between items-center text-[10px] text-gray-500">
                            <span>體重 (Weight)</span>
                            <span class="text-tech-gold font-mono text-xs"><span class="w-vol-val">60</span> kg</span>
                        </div>
                        <input type="range" min="30" max="150" value="60" class="w-full p-vol-w accent-tech-gold cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none">
                    </div>

                    <!-- Luggage for Stand -->
                    <div class="space-y-2 pt-2 border-t border-white/5">
                        <div class="flex justify-between items-center text-[10px] text-gray-500">
                            <span>行李 (Luggage)</span>
                            <span class="text-tech-gold font-mono text-xs"><span class="l-vol-val">0</span> kg</span>
                        </div>
                        <input type="range" min="0" max="50" value="0" class="w-full p-vol-l accent-tech-gold cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none">
                    </div>
                </div>
            `;
        } else {
            inputsHtml = `
                <div class="space-y-6">
                    <div class="space-y-2">
                        <div class="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            <span>體重 (Weight)</span>
                            <span class="text-tech-gold font-mono text-xs"><span class="w-val">70</span> KG</span>
                        </div>
                        <input type="range" min="30" max="150" value="70" class="w-full p-weight accent-tech-gold cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none">
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            <span>行李 (Luggage)</span>
                            <span class="text-tech-gold font-mono text-xs"><span class="l-val">10</span> KG</span>
                        </div>
                        <input type="range" min="0" max="50" value="10" class="w-full p-luggage accent-tech-gold cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none">
                    </div>
                </div>
            `;
        }

        div.innerHTML = `
            <div class="text-xs text-gray-400 mb-4 flex justify-between items-center">
                <span class="font-bold uppercase tracking-widest text-[#D4AF37]">乘客 ${i} (${phase === 'outbound' ? '去程' : '回程'})</span>
            </div>
            ${inputsHtml}
            
            <!-- Add-ons Section (Hybrid) -->
            <div class="mt-4 pt-4 border-t border-white/10 space-y-4">
                <div class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">加購服務 (Add-ons)</div>
                
                <!-- Food & Drink Dropdowns -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <label class="text-[9px] text-gray-400 block">餐點 (Food)</label>
                        <select class="p-addon-food w-full bg-black/40 border border-white/10 text-white text-[10px] p-2 rounded focus:border-tech-gold appearance-none">
                            <option value="none">不需餐點</option>
                            <option value="beef-noodle">夯實紅燒牛肉麵 (NT$380)</option>
                            <option value="chicken-rice">夯實海南雞飯 (NT$320)</option>
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-[9px] text-gray-400 block">飲料 (Drink)</label>
                        <select class="p-addon-drink w-full bg-black/40 border border-white/10 text-white text-[10px] p-2 rounded focus:border-tech-gold appearance-none">
                            <option value="none">不需飲料</option>
                            <option value="water">夯實礦泉水 (NT$50)</option>
                            <option value="tea">阿里山高山青茶 (NT$120)</option>
                        </select>
                    </div>
                </div>

                <!-- Essentials Grid (Interactive Blocks) -->
                <div>
                    <label class="text-[9px] text-gray-400 block mb-2">機上必備 (Essentials)</label>
                    <div class="hidden">
                        <input type="checkbox" class="p-addon-essential" value="blanket" data-passenger="${i}">
                        <input type="checkbox" class="p-addon-essential" value="urine-bag" data-passenger="${i}">
                        <input type="checkbox" class="p-addon-essential" value="vomit-bag" data-passenger="${i}">
                        <input type="checkbox" class="p-addon-essential" value="feces-bag" data-passenger="${i}">
                        <input type="checkbox" class="p-addon-essential" value="insurance" data-passenger="${i}">
                    </div>
                    <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
                         ${[
                { val: 'blanket', name: '毛毯', price: 150, icon: '🧣' },
                { val: 'urine-bag', name: '尿袋', price: 50, icon: '🚽' },
                { val: 'vomit-bag', name: '嘔吐袋', price: 30, icon: '🤮' },
                { val: 'feces-bag', name: '屎袋', price: 80, icon: '💩' },
                { val: 'insurance', name: '保險', price: 1200, icon: '🛡️' }
            ].map(item => `
                            <div class="addon-card group relative h-20 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 hover:border-tech-gold/50 transition-all flex flex-col items-center justify-center gap-1 select-none"
                                 data-type="essential" data-val="${item.val}">
                                <div class="text-xl filter drop-shadow-lg group-hover:scale-110 transition-transform">${item.icon}</div>
                                <div class="text-[9px] text-gray-300 font-bold">${item.name}</div>
                                <div class="text-[8px] text-tech-gold">NT$${item.price}</div>
                                <div class="absolute inset-0 border-2 border-tech-gold rounded-lg opacity-0 scale-95 transition-all indicator"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        if (bookingState[phase].cabin === 'hangshi-stand') {
            const wVol = div.querySelector('.p-vol-w'); // reusing as weight
            const hVol = div.querySelector('.p-vol-h'); // height
            const gVol = div.querySelector('.p-vol-gender'); // gender
            const lVol = div.querySelector('.p-vol-l'); // luggage

            const wTxt = div.querySelector('.w-vol-val');
            const hTxt = div.querySelector('.h-vol-val');
            const lTxt = div.querySelector('.l-vol-val');
            const vTotal = div.querySelector('.vol-total-disp');

            const upInv = () => {
                wTxt.innerText = wVol.value;
                hTxt.innerText = hVol.value;
                lTxt.innerText = lVol.value;

                // Real-time calculation display
                let vol = (parseInt(wVol.value) * 12) + (parseInt(hVol.value) * 5);
                if (gVol.value === 'F') vol *= 1.1;
                vTotal.innerText = Math.round(vol);

                updateInvoice();
            };
            wVol.oninput = upInv;
            hVol.oninput = upInv;
            lVol.oninput = upInv;
            gVol.onchange = upInv;

            // Trigger once for init
            upInv();
        } else {
            const wInp = div.querySelector('.p-weight');
            const lInp = div.querySelector('.p-luggage');
            const wVal = div.querySelector('.w-val');
            const lVal = div.querySelector('.l-val');

            wInp.oninput = () => { wVal.innerText = wInp.value; updateInvoice(); };
            lInp.oninput = () => { lVal.innerText = lInp.value; updateInvoice(); };
        }

        // Bind Essentials Grid Logic
        const hiddenEssentials = div.querySelectorAll('.p-addon-essential');

        div.querySelectorAll('.addon-card').forEach(card => {
            card.onclick = () => {
                const val = card.dataset.val;

                // Toggle Logic for Essentials (Checkbox)
                const cb = Array.from(hiddenEssentials).find(c => c.value === val);
                if (cb) {
                    cb.checked = !cb.checked;
                    if (cb.checked) {
                        card.classList.add('active-card');
                        card.querySelector('.indicator').classList.remove('opacity-0', 'scale-95');
                        card.querySelector('.indicator').classList.add('opacity-100', 'scale-100');
                    } else {
                        card.classList.remove('active-card');
                        card.querySelector('.indicator').classList.remove('opacity-100', 'scale-100');
                        card.querySelector('.indicator').classList.add('opacity-0', 'scale-95');
                    }
                }
                updateInvoice();
            };
        });

        // Bind Dropdown Logic
        div.querySelectorAll('select').forEach(el => {
            el.addEventListener('change', updateInvoice);
        });

        container.appendChild(div);
    }
}

function updateUI() {
    const origin = document.getElementById('origin')?.value?.toLowerCase();
    const dest = document.getElementById('destination')?.value?.toLowerCase();
    const dateOut = document.getElementById('date-outbound')?.value;

    console.log("[UpdateUI] state:", { origin, dest, dateOut, type: bookingState.tripType });

    if (origin && dest && dateOut) {
        document.getElementById('outbound-phase')?.classList.remove('hidden');
        renderFlights('outbound', origin, dest, dateOut);
    }

    if (bookingState.tripType === 'round-trip') {
        const inPhase = document.getElementById('inbound-phase');
        document.getElementById('btn-finish-outbound')?.classList.remove('hidden'); // Show for Round Trip
        if (inPhase) {
            inPhase.classList.remove('hidden');
            const dateIn = document.getElementById('date-inbound')?.value;
            if (dateIn) {
                document.getElementById('inbound-container')?.classList.remove('hidden');
                renderFlights('inbound', dest, origin, dateIn);
            }
        }
    } else {
        document.getElementById('inbound-phase')?.classList.add('hidden');
        document.getElementById('btn-finish-outbound')?.classList.add('hidden'); // Hide for One Way
    }

    if (!window.mapLoopStarted) {
        window.mapLoopStarted = true;
        const animate = () => {
            renderMap();
            requestAnimationFrame(animate);
        };
        animate();
    }
}

function renderMap() {
    const canvas = document.getElementById('space-map');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const origin = document.getElementById('origin')?.value?.toLowerCase();
    const dest = document.getElementById('destination')?.value?.toLowerCase();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = Date.now() * 0.002;

    // Draw World Map Image
    if (bgMap.complete && bgMap.naturalWidth > 0) {
        ctx.globalAlpha = 0.8; // Slightly dim the map for better text contrast
        ctx.drawImage(bgMap, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    } else {
        // Fallback if loading
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ffffff05';
        for (let i = 0; i < canvas.width; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
        for (let i = 0; i < canvas.height; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }
    }

    // Stars
    ctx.fillStyle = '#ffffff20';
    for (let i = 0; i < 60; i++) {
        const x = (Math.sin(i * 456.78) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 123.45) * 0.5 + 0.5) * canvas.height;
        ctx.beginPath(); ctx.arc(x, y, 0.8, 0, Math.PI * 2); ctx.fill();
    }



    // Points
    Object.entries(locations).forEach(([k, loc]) => {
        const isSelected = (k === origin || k === dest);

        if (isSelected) {
            const pulse = Math.sin(time * 3) * 3 + 6;
            const grad = ctx.createRadialGradient(loc.x, loc.y, 0, loc.x, loc.y, pulse * 2);
            grad.addColorStop(0, '#D4AF3733');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(loc.x, loc.y, pulse * 2, 0, Math.PI * 2); ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(loc.x, loc.y, isSelected ? 8 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#D4AF37' : '#ffffff44';
        ctx.fill();

        if (isSelected) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#D4AF37';
            ctx.fillStyle = '#fff';
            ctx.font = '700 12px Montserrat';
            ctx.fillText(loc.name.split(' ')[0], loc.x + 12, loc.y + 5);
            ctx.shadowBlur = 0;
        }
    });

    if (origin && dest && origin !== dest) {
        const o = locations[origin];
        const d = locations[dest];

        // Animated line - Base
        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        ctx.lineTo(d.x, d.y);
        ctx.strokeStyle = '#D4AF3766'; // 40% opacity
        ctx.lineWidth = 4;
        ctx.stroke();

        // Inner highlight
        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        ctx.lineTo(d.x, d.y);
        ctx.strokeStyle = '#D4AF37'; // 100% opacity
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dash animation
        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        ctx.lineTo(d.x, d.y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([10, 30]);
        ctx.lineDashOffset = -time * 50;
        ctx.stroke();
        ctx.setLineDash([]);

        const dist = Math.sqrt(Math.pow(o.x - d.x, 2) + Math.pow(o.y - d.y, 2)) * 4;
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
        container.innerHTML = '<div class="text-xs text-gray-500 py-10">此艙等不需選位 (體積計費)</div>';
        return;
    }

    const maxSeats = cabin === 'comfort-stand' ? 50 : 20;
    const grid = document.createElement('div');
    // 5 columns: [Seat][Seat][Aisle][Seat][Seat]
    grid.className = 'grid grid-cols-5 gap-2 max-w-[320px] mx-auto';

    let seatNum = 1;
    let itemsCount = 0;

    while (seatNum <= maxSeats) {
        itemsCount++;
        // Every 3rd item in a 5-column row is the aisle
        if (itemsCount % 5 === 3) {
            const aisle = document.createElement('div');
            aisle.className = 'h-8 flex items-center justify-center text-[8px] text-white/20 font-bold tracking-tighter uppercase';
            aisle.innerText = 'AISLE';
            grid.appendChild(aisle);
            continue;
        }

        const currentSeatId = `S${seatNum}`;
        const isSelected = bookingState[phase].seats.includes(currentSeatId);
        const cell = document.createElement('div');
        cell.className = `h-8 rounded flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all ${isSelected ? 'bg-tech-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-gray-500 hover:bg-white/10 border border-white/5'}`;
        cell.innerText = currentSeatId;

        cell.onclick = () => {
            const s = bookingState[phase].seats;
            if (s.includes(currentSeatId)) {
                bookingState[phase].seats = s.filter(x => x !== currentSeatId);
            } else {
                if (s.length < count) {
                    bookingState[phase].seats.push(currentSeatId);
                } else {
                    // Shift out the first and add new (auto-replace)
                    bookingState[phase].seats.shift();
                    bookingState[phase].seats.push(currentSeatId);
                }
            }
            renderSeatMap(phase);
            updateInvoice();
        };
        grid.appendChild(cell);
        seatNum++;
    }

    container.appendChild(grid);
}

function updateInvoice() {
    let total = 0;
    let detailsHTML = '';
    const invoiceContent = document.getElementById('invoice-content');

    // Base Price Calculation
    const calcPhase = (phase) => {
        if (!bookingState[phase].flight) return;

        const pName = phase === 'outbound' ? '去程' : '回程';

        // Base Flight Cost (Approx based on distance/mock)
        let baseFlightPrice = 12500;

        // Cabin Multiplier
        const cabinType = bookingState[phase].cabin;
        const cabinMult = prices.cabinMultipliers[cabinType] || 1;
        const cabinLabel = cabinType === 'comfort-stand' ? '舒適站票' : (cabinType === 'hangshi-stand' ? '夯實站票' : '標準坐票');

        // Pax Count
        const pax = bookingState[phase].passengers;

        let flightCost = baseFlightPrice * cabinMult * pax;

        detailsHTML += `
            <div class="border-b border-white/5 pb-4 mb-4">
                <div class="flex justify-between text-white font-bold mb-2">
                    <span class="text-tech-gold">${pName} 航班 (${bookingState[phase].flight.id})</span>
                    <span>NT$ ${flightCost.toLocaleString()}</span>
                </div>
                <div class="flex justify-between text-gray-500 pl-2 text-[10px] uppercase tracking-wider mb-2">
                    <span>${cabinLabel} x ${pax} 人</span>
                    <span>基礎票價</span>
                </div>

                <!-- Weight & Luggage -->
        `;

        let weightTotal = 0;
        let bodyTotal = 0;
        let luggageTotal = 0;
        let volumeTotal = 0;

        if (bookingState[phase].cabin === 'hangshi-stand') {
            // Volume Calc based on W/H/Gender
            const container = document.getElementById(`passenger-details-container-${phase}`);
            if (container) {
                const ws = container.querySelectorAll('.p-vol-w'); // Weight
                const hs = container.querySelectorAll('.p-vol-h'); // Height
                const gs = container.querySelectorAll('.p-vol-gender'); // Gender

                ws.forEach((_, i) => {
                    const w = parseInt(ws[i].value) || 60;
                    const h = parseInt(hs[i].value) || 170;
                    const g = gs[i].value || 'M';

                    let volUnits = (w * 12) + (h * 5);
                    if (g === 'F') volUnits *= 1.1;

                    volumeTotal += Math.round(volUnits * 4); // x4 Price Factor
                });
            }
            detailsHTML += `
                <div class="flex justify-between pl-2 text-sm mb-1 text-gray-300">
                    <span>人體佔用費 (Body Volume)</span>
                    <span>+ NT$ ${volumeTotal.toLocaleString()}</span>
                </div>`;

            // Luggage line for Stand (Luggage total is global variable modified in loop above for standard, but we need to ensure it includes Stand Luggage)
            // Wait, luggageTotal is computed in the loop? 
            // The loop at line 841 (original file) handles weight/luggage for standard.
            // We need to add a loop for stand luggage or integrate it. 
            // In the Interest of clean code, let's fix the logic flow in next step or assume the main loop handles it.
            // Actually, in updateInvoice, calculating costs is split.
            // Let's add the luggage cost for stand here explicitly simply for display or total calc if not captured.

            const standLuggageInputs = document.querySelectorAll(`#passenger-details-container-${phase} input.p-vol-l`);
            let standLugCost = 0;
            standLuggageInputs.forEach(inp => {
                standLugCost += (parseInt(inp.value) || 0) * prices.weightRate_Luggage;
            });
            // Add to total
            total += volumeTotal + standLugCost;
            if (standLugCost > 0) detailsHTML += `<div class="flex justify-between pl-2 text-sm mb-1 text-gray-300"><span>行李費用</span><span>+ NT$ ${standLugCost.toLocaleString()}</span></div>`;

        } else {
            // Standard Weight Logic
            // Weight Costs (Body + Luggage)
            document.querySelectorAll(`#passenger-details-container-${phase} input.p-weight`).forEach(i => {
                const w = parseInt(i.value) || 0;
                bodyTotal += (Math.max(0, w - 60)) * prices.weightRate_Body; // 60kg allowance
            });

            document.querySelectorAll(`#passenger-details-container-${phase} input.p-luggage`).forEach(i => {
                const w = parseInt(i.value) || 0;
                luggageTotal += w * prices.weightRate_Luggage;
            });

            if (bodyTotal > 0) detailsHTML += `<div class="flex justify-between pl-2 text-sm mb-1 text-gray-300"><span>超重費用</span><span>+ NT$ ${bodyTotal.toLocaleString()}</span></div>`;
            if (luggageTotal > 0) detailsHTML += `<div class="flex justify-between pl-2 text-sm mb-1 text-gray-300"><span>行李費用</span><span>+ NT$ ${luggageTotal.toLocaleString()}</span></div>`;

            total += bodyTotal + luggageTotal;
        }

        weightTotal = bodyTotal + luggageTotal;

        // Add-ons Calculation
        let addonsTotal = 0;
        let addonItems = [];

        // Food
        document.querySelectorAll(`#passenger-details-container-${phase} select.p-addon-food`).forEach(s => {
            if (prices.addons.food[s.value]) {
                addonsTotal += prices.addons.food[s.value].price;
                if (s.value !== 'none') addonItems.push(prices.addons.food[s.value].name);
            }
        });
        // Drink
        document.querySelectorAll(`#passenger-details-container-${phase} select.p-addon-drink`).forEach(s => {
            if (prices.addons.drink[s.value]) {
                addonsTotal += prices.addons.drink[s.value].price;
                if (s.value !== 'none') addonItems.push(prices.addons.drink[s.value].name);
            }
        });
        // Essentials
        document.querySelectorAll(`#passenger-details-container-${phase} input.p-addon-essential:checked`).forEach(c => {
            if (prices.addons.essentials[c.value]) {
                addonsTotal += prices.addons.essentials[c.value].price;
                addonItems.push(prices.addons.essentials[c.value].name);
            }
        });

        if (addonsTotal > 0) {
            detailsHTML += `
                <div class="flex justify-between pl-2 text-sm mb-1 text-gray-300 mt-2 pt-2 border-t border-white/5">
                    <span>加購服務</span>
                    <span>+ NT$ ${addonsTotal.toLocaleString()}</span>
                </div>
                <div class="text-[9px] text-gray-500 leading-tight pl-2">${addonItems.join(', ')}</div>
            `;
            total += addonsTotal;
        }

        // Add Base Flight Cost to Total
        total += flightCost;

        detailsHTML += `</div>`;
    };

    calcPhase('outbound');
    if (bookingState.tripType === 'round-trip') calcPhase('inbound');

    if (invoiceContent) {
        invoiceContent.innerHTML = detailsHTML || '<div class="text-center py-10 opacity-30 text-xs tracking-widest uppercase">等待航程配置...</div>';
    }

    const tax = Math.round(total * 0.05);
    const final = total + tax;

    document.getElementById('invoice-total').innerText = `NT$ ${final.toLocaleString()}`;
    const taxEl = document.getElementById('tax-amount');
    if (taxEl) taxEl.innerText = `NT$ ${tax.toLocaleString()}`;

    // Also update mobile total
    const mobTotal = document.getElementById('total-price');
    if (mobTotal) mobTotal.innerText = `NT$ ${final.toLocaleString()}`;

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
