import './style.css'
import { gsap } from 'gsap'

// Global State for Booking
let bookingState = {
    tripType: 'one-way', // 'one-way' or 'round-trip'
    outboundDate: null,
    inboundDate: null,
    selectedOutboundFlight: null,
    selectedInboundFlight: null
};

document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Homepage Booking Widget Logic ---
    const widgetForm = document.getElementById('hero-booking-form');
    if (widgetForm) {
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
            if (tripType === 'round-trip') {
                params.append('returnDate', formData.get('returnDate'));
            }
            params.append('tripType', tripType); // Pass the toggle state

            window.location.href = `booking.html?${params.toString()}`;
        });
    }

    // --- 0.5 Flight Status Modal ---
    const statusModal = document.getElementById('flight-status-modal');
    const closeStatusBtn = document.getElementById('close-status-modal');
    const checkStatusBtn = document.getElementById('btn-check-status');

    // Bind to a Nav Link (We need to find "班機動態" link - assuming it's the 4th one or added)
    // Let's create a specific ID for it in next step or query by text
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (link.textContent.includes('機隊展示')) {
            // Reuse or add new? Original request said "Add new". 
            // For now, let's assume we add a button or link.
            // I'll add a listener to document body delegating to .nav-status-link
        }
    });

    // Quick Fix: Add a trigger button to Navbar in HTML? Or just Keybind?
    // Let's assume there is a link. I will add one via JS insertion to be safe and fast.
    const navContainer = document.querySelector('nav div.hidden');
    if (navContainer && !document.getElementById('nav-status-btn')) {
        const link = document.createElement('a');
        link.id = 'nav-status-btn';
        link.textContent = '班機動態';
        link.className = 'text-aurora-white hover:text-tech-gold transition-colors text-sm uppercase tracking-wider cursor-pointer ml-8';
        navContainer.appendChild(link);

        link.addEventListener('click', (e) => {
            e.preventDefault();
            statusModal.classList.remove('hidden');
        });
    }

    if (closeStatusBtn) {
        closeStatusBtn.addEventListener('click', () => statusModal.classList.add('hidden'));
    }

    if (checkStatusBtn) {
        checkStatusBtn.addEventListener('click', () => {
            const o = document.getElementById('status-origin').value;
            const d = document.getElementById('status-dest').value;
            const resultsDiv = document.getElementById('status-results');

            // Mock Data
            const statuses = ['On Time', 'Delayed', 'Boarding', 'Landed'];
            const times = ['08:30', '12:15', '16:40', '21:00'];

            let html = '';
            for (let i = 0; i < 3; i++) {
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const color = status === 'Delayed' ? 'text-red-500' : 'text-green-500';
                html += `
                    <div class="flex justify-between items-center bg-black/40 p-4 rounded border border-white/10">
                        <div>
                            <div class="font-bold text-white text-lg">HS${800 + i * 2}</div>
                            <div class="text-xs text-gray-400">${o} ➝ ${d}</div>
                        </div>
                        <div class="text-right">
                             <div class="text-white font-mono">${times[i]}</div>
                             <div class="text-sm font-bold ${color}">${status}</div>
                        </div>
                    </div>
                 `;
            }
            resultsDiv.innerHTML = html;
        });
    }

    // --- 1. Global Helpers ---
    const magneticBtns = document.querySelectorAll('.magnetic-btn');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        });
    });

    // --- 2. Navbar Scroll Effect ---
    const nav = document.getElementById('main-nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('bg-space-grey/80', 'backdrop-blur-md', 'shadow-lg', 'py-2');
                nav.classList.remove('py-4');
            } else {
                nav.classList.remove('bg-space-grey/80', 'backdrop-blur-md', 'shadow-lg', 'py-2');
                nav.classList.add('py-4');
            }
        });
    }

    // --- 3. Hero & Ambient Animations ---
    const heroTl = gsap.timeline({ defaults: { ease: "expo.out", duration: 2 } });
    if (document.getElementById('hero-text')) {
        heroTl.to("#hero-text", { y: 0, opacity: 1, delay: 0.5 })
            .to("#hero-subtitle", { y: 0, opacity: 1 }, "-=1.5")
            .to("#hero-cta", { y: 0, opacity: 1 }, "-=1.4");

        // Ambient movement
        gsap.to(".ambient-dot", {
            x: "random(-50, 50)",
            y: "random(-50, 50)",
            duration: "random(10, 20)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 2
        });
    }

    // --- 4. Scroll Reveal & Split Text ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                gsap.to(entry.target, { y: 0, opacity: 1, duration: 1, ease: "power3.out" });
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));

    const splitTextElements = document.querySelectorAll('.split-text');
    const splitObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const spans = entry.target.querySelectorAll('span');
                gsap.to(spans, { y: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: "back.out(1.7)" });
                splitObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    splitTextElements.forEach(el => {
        const text = el.innerText;
        el.innerHTML = text.split('').map(char => `<span class="inline-block opacity-0 translate-y-4">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
        splitObserver.observe(el);
    });

    // --- 5. Fleet Interactions ---
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

    // --- 5. Booking Calculator & Map ---
    const ticketForm = document.getElementById('ticket-calculator');
    const canvas = document.getElementById('space-map');

    if (ticketForm && canvas) {
        const originSelect = document.getElementById('origin');
        const destSelect = document.getElementById('destination');
        const cabinSelect = document.getElementById('cabin');
        const passInput = document.getElementById('passengers');
        const passContainer = document.getElementById('passenger-details-container');
        const totalPriceEl = document.getElementById('total-price');
        const distanceEl = document.getElementById('distance-display');
        const invoiceContent = document.getElementById('invoice-content');
        const taxAmountEl = document.getElementById('tax-amount');
        const invoiceTotalEl = document.getElementById('invoice-total');
        const cabinNote = document.getElementById('cabin-note');
        const seatSection = document.getElementById('seat-selection-section');
        const seatMapContainer = document.getElementById('seat-map-container');
        const seatsNeededEl = document.getElementById('seats-needed');
        const seatErrorMsg = document.getElementById('seat-error-msg');
        const ctx = canvas.getContext('2d');

        let selectedSeats = [];

        const mapImage = new Image();
        mapImage.src = '/world-map.png';

        const locations = {
            osa: { name: '大阪關西 (KIX)', x: 690, y: 175, color: '#ffaaaa' },
            fuk: { name: '福岡 (FUK)', x: 680, y: 180, color: '#ffbbbb' },
            cts: { name: '札幌新千歲 (CTS)', x: 710, y: 155, color: '#eeeeff' },
            oka: { name: '沖繩那霸 (OKA)', x: 670, y: 190, color: '#44aaff' },
            gmp: { name: '首爾金浦 (GMP)', x: 682, y: 170, color: '#ff5555' },
            pus: { name: '釜山金海 (PUS)', x: 685, y: 175, color: '#ff6666' },
            mfm: { name: '澳門 (MFM)', x: 650, y: 195, color: '#ddaa00' },
            tpe: { name: '台北桃園 (TPE)', x: 675, y: 185, color: '#4a9eff' },
            nrt: { name: '東京成田 (NRT)', x: 705, y: 168, color: '#ffffff' },
            hnd: { name: '東京羽田 (HND)', x: 702, y: 170, color: '#ffffff' },
            lhr: { name: '倫敦希斯洛 (LHR)', x: 390, y: 145, color: '#d1d1d1' },
            jfk: { name: '紐約甘迺迪 (JFK)', x: 230, y: 175, color: '#ff6b4a' },
            lax: { name: '洛杉磯 (LAX)', x: 140, y: 185, color: '#aaffaa' },
            hkg: { name: '香港國際 (HKG)', x: 655, y: 195, color: '#ffcc00' },
            sin: { name: '新加坡樟宜 (SIN)', x: 640, y: 240, color: '#00ffcc' },
            bkk: { name: '曼谷蘇凡納布 (BKK)', x: 645, y: 210, color: '#ff00ff' },
            cdg: { name: '巴黎戴高樂 (CDG)', x: 400, y: 155, color: '#ff8800' },
            sfo: { name: '舊金山 (SFO)', x: 145, y: 178, color: '#4affff' },
            sea: { name: '西雅圖 (SEA)', x: 155, y: 160, color: '#4affaa' },
            ord: { name: '芝加哥 (ORD)', x: 205, y: 170, color: '#ff88ff' },
            yyz: { name: '多倫多 (YYZ)', x: 220, y: 165, color: '#ffaa88' },
            fra: { name: '法蘭克福 (FRA)', x: 410, y: 155, color: '#aaaaaa' },
            ams: { name: '阿姆斯特丹 (AMS)', x: 405, y: 150, color: '#aaaaff' },
            dxb: { name: '杜拜 (DXB)', x: 520, y: 205, color: '#ffd700' },
            doh: { name: '杜哈 (DOH)', x: 515, y: 207, color: '#800000' },
            icn: { name: '首爾仁川 (ICN)', x: 685, y: 170, color: '#ff4444' },
            pek: { name: '北京首都 (PEK)', x: 665, y: 165, color: '#ff0000' },
            pvg: { name: '上海浦東 (PVG)', x: 678, y: 178, color: '#ff5555' },
            can: { name: '廣州白雲 (CAN)', x: 658, y: 190, color: '#ff6666' },
            syd: { name: '雪梨 (SYD)', x: 740, y: 320, color: '#00ccff' },
            mel: { name: '墨爾本 (MEL)', x: 725, y: 330, color: '#00aaaa' },
            akl: { name: '奧克蘭 (AKL)', x: 785, y: 335, color: '#00dd88' },
            kul: { name: '吉隆坡 (KUL)', x: 645, y: 245, color: '#dddd00' },
            mnl: { name: '馬尼拉 (MNL)', x: 680, y: 210, color: '#ffff00' },
            cgn: { name: '科隆 (CGN)', x: 412, y: 153, color: '#999999' },
            mad: { name: '馬德里 (MAD)', x: 385, y: 175, color: '#ffcc33' },
            fco: { name: '羅馬菲烏米奇諾 (FCO)', x: 415, y: 173, color: '#ff9966' },
            ist: { name: '伊斯坦堡 (IST)', x: 460, y: 175, color: '#cc3333' },
            del: { name: '德里 (DEL)', x: 575, y: 205, color: '#ff9900' },
            bom: { name: '孟買 (BOM)', x: 570, y: 220, color: '#ffaa00' },
            gru: { name: '聖保羅 (GRU)', x: 290, y: 310, color: '#009900' },
            mex: { name: '墨西哥城 (MEX)', x: 190, y: 215, color: '#ffcc00' },
            yvr: { name: '溫哥華 (YVR)', x: 148, y: 162, color: '#aaeeff' },
            zrh: { name: '蘇黎世 (ZRH)', x: 412, y: 163, color: '#ffffff' },
            vie: { name: '維也納 (VIE)', x: 423, y: 163, color: '#d4af37' },
            cpt: { name: '開普敦 (CPT)', x: 415, y: 325, color: '#ff44aa' },
            jnb: { name: '約翰尼斯堡 (JNB)', x: 435, y: 310, color: '#aa44ff' }
        };

        // Populate Dropdowns
        const sortedLocs = Object.entries(locations).sort((a, b) => a[1].name.localeCompare(b[1].name, 'zh-TW'));
        [originSelect, destSelect].forEach(sel => {
            const currentVal = sel.value;
            sel.innerHTML = sortedLocs.map(([id, data]) => `<option value="${id}">${data.name}</option>`).join('');
            if (currentVal && locations[currentVal]) sel.value = currentVal;
            else if (sel.id === 'destination') sel.value = 'nrt';
            else sel.value = 'tpe';
        });

        const prices = {
            basePerKm: 2.5,
            weightRate_Body: 100,
            weightRate_Luggage: 150,
            volumeRate: 50,
            cabinMultipliers: {
                seat: 2.5,
                'comfort-stand': 1.2,
                'hangshi-stand': 0.6
            },
            addons: {
                food: {
                    'none': { name: '不需餐點', price: 0 },
                    'beef-noodle': { name: '夯實紅燒牛肉麵', price: 380, icon: '🍜' },
                    'chicken-rice': { name: '夯實海南雞飯', price: 320, icon: '🍗' },
                    'pork-chop': { name: '精選排骨便當', price: 280, icon: '🍱' },
                    'pasta': { name: '松露奶油義大利麵', price: 450, icon: '🍝' },
                    'sushi': { name: '極上握壽司盛合', price: 680, icon: '🍣' },
                    'steak': { name: '戰斧豬排佐時蔬', price: 550, icon: '🥩' },
                    'vegan': { name: '田園野菇素食餐', price: 250, icon: '🥗' },
                    'dimsum': { name: '港式點心拼盤', price: 360, icon: '🥟' },
                    'burger': { name: '夯實厚牛起司堡', price: 300, icon: '🍔' },
                    'ramen': { name: '博多風豚骨拉麵', price: 340, icon: '🍜' },
                    'curry': { name: '熟成咖哩炸雞飯', price: 320, icon: '🍛' },
                    'salad': { name: '凱薩燻雞沙拉盒', price: 220, icon: '🥗' },
                    'taco': { name: '墨西哥辣味捲餅', price: 260, icon: '🌮' },
                    'lobster': { name: '波士頓龍蝦濃湯餐', price: 880, icon: '🦞' },
                    'unagi': { name: '蒲燒鰻魚飯', price: 620, icon: '🍱' },
                    'pizza': { name: '義式臘腸手工披薩', price: 350, icon: '🍕' },
                    'snack-box': { name: '豪華零食大禮包', price: 180, icon: '🍿' },
                    'sandwich': { name: '三層總匯三明治', price: 240, icon: '🥪' },
                    'dessert': { name: '法式甜點午茶組', price: 380, icon: '🍰' }
                },
                drink: {
                    'none': { name: '不需飲料', price: 0 },
                    'water': { name: '夯實礦泉水', price: 50, icon: '💧' },
                    'coke': { name: '可口可樂', price: 60, icon: '🥤' },
                    'sprite': { name: '雪碧', price: 60, icon: '🥤' },
                    'tea': { name: '阿里山高山青茶', price: 120, icon: '🍵' },
                    'coffee': { name: '現磨精品拿鐵', price: 150, icon: '☕' },
                    'latte': { name: '燕麥奶拿鐵', price: 180, icon: '☕' },
                    'orange': { name: '鮮榨柳橙汁', price: 130, icon: '🍹' },
                    'apple': { name: '青森蘋果汁', price: 140, icon: '🍹' },
                    'wine-red': { name: '法國紅葡萄酒', price: 450, icon: '🍷' },
                    'wine-white': { name: '紐西蘭白蘇維翁', price: 420, icon: '🥂' },
                    'beer': { name: '夯實手工精釀啤酒', price: 180, icon: '🍺' },
                    'whisky': { name: '蘇格蘭單一麥芽威士忌', price: 580, icon: '🥃' },
                    'sake': { name: '獺祭純米大吟釀 (180ml)', price: 850, icon: '🍶' },
                    'milk-tea': { name: '手作珍珠奶茶', price: 140, icon: '🧋' },
                    'matcha': { name: '宇治抹茶歐蕾', price: 160, icon: '🍵' },
                    'sparkling': { name: '香氛氣泡水 (檸檬)', price: 90, icon: '🧼' },
                    'chocolate': { name: '濃郁醇黑熱巧克力', price: 150, icon: '☕' },
                    'lemonade': { name: '新鮮薄荷雷夢汁', price: 120, icon: '🍹' },
                    'smoothie': { name: '季節限定芒果冰沙', price: 200, icon: '🥤' },
                    'champagne': { name: '頂級年份香檳 (單杯)', price: 750, icon: '🥂' }
                },
                essentials: {
                    'blanket': { name: '舒適毛毯', price: 150, icon: '🛋️' },
                    'eyemask': { name: '遮光眼罩', price: 80, icon: '🌒' },
                    'insurance': { name: '航程防撞保險', price: 1200, icon: '🛡️' },
                    'urine-bag': { name: '拋棄式尿袋', price: 40, icon: '🚽' },
                    'poop-bag': { name: '除臭屎袋', price: 60, icon: '💩' },
                    'vomit-bag': { name: '強化嘔吐袋', price: 30, icon: '🤮' }
                }
            }
        };

        function calculateDistance(o, d) {
            const dx = o.x - d.x;
            const dy = o.y - d.y;
            return Math.round(Math.sqrt(dx * dx + dy * dy) * 45);
        }

        function getWeightMultiplier(distance) {
            if (distance < 3000) return 0.9;
            if (distance < 6000) return 1.05;
            if (distance < 15000) return 1.1;
            return 1.2;
        }

        function createPassengerInputs(count) {
            const currentCabin = cabinSelect.value;
            passContainer.innerHTML = '';

            for (let i = 1; i <= count; i++) {
                const isHangshi = currentCabin === 'hangshi-stand';
                const div = document.createElement('div');
                div.className = "p-8 bg-white/5 border border-white/10 rounded-2xl space-y-8 relative overflow-hidden group hover:border-tech-gold/30 transition-all";

                div.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div class="text-white font-heading font-bold uppercase tracking-wider">乘客 P${i}</div>
                        ${isHangshi ? '<span class="text-[10px] text-tech-gold border border-tech-gold/30 px-2 py-0.5 rounded">體積計算模式</span>' : ''}
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div class="space-y-3">
                             <div class="flex justify-between items-center">
                                <label class="text-[10px] text-gray-400 uppercase tracking-widest">體重 (KG)</label>
                                <span class="text-tech-gold font-mono text-sm weight-val">70 kg</span>
                             </div>
                             <input type="range" class="p-weight w-full" value="70" min="40" max="150" step="1">
                        </div>
                        <div class="space-y-3">
                             <div class="flex justify-between items-center">
                                <label class="text-[10px] text-gray-400 uppercase tracking-widest">行李 (KG)</label>
                                <span class="text-tech-gold font-mono text-sm luggage-val">10 kg</span>
                             </div>
                             <input type="range" class="p-luggage w-full" value="10" min="0" max="40" step="1">
                        </div>
                        ${isHangshi ? `
                        <div class="space-y-3">
                             <div class="flex justify-between items-center">
                                <label class="text-[10px] text-gray-400 uppercase tracking-widest">身高 (CM)</label>
                                <span class="text-tech-gold font-mono text-sm height-val">175 cm</span>
                             </div>
                             <input type="range" class="p-height w-full" value="175" min="140" max="210" step="1">
                        </div>
                        <div class="space-y-3">
                             <label class="text-[10px] text-gray-400 uppercase tracking-widest block">性別</label>
                             <div class="flex space-x-4">
                                <label class="flex-1 flex items-center justify-center p-3 border border-white/10 rounded cursor-pointer hover:bg-white/5 transition-colors">
                                    <input type="radio" name="gender-${i}" value="male" checked class="hidden p-gender">
                                    <span class="text-xs">男性</span>
                                </label>
                                <label class="flex-1 flex items-center justify-center p-3 border border-white/10 rounded cursor-pointer hover:bg-white/5 transition-colors">
                                    <input type="radio" name="gender-${i}" value="female" class="hidden p-gender">
                                    <span class="text-xs">女性</span>
                                </label>
                             </div>
                        </div>
                        ` : ''}
                    </div>

                    <!-- Food & Drink Selects -->
                    <div class="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-3">
                            <label class="block text-[10px] text-gray-500 uppercase tracking-widest">夯美食選購</label>
                            <select class="p-food w-full bg-black/40 border border-white/10 text-white p-3 text-sm focus:ring-0 focus:border-tech-gold rounded-lg">
                                ${Object.entries(prices.addons.food).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name} (NT$ ${v.price})</option>`).join('')}
                            </select>
                        </div>
                        <div class="space-y-3">
                            <label class="block text-[10px] text-gray-500 uppercase tracking-widest">夯飲飲選購</label>
                            <select class="p-drink w-full bg-black/40 border border-white/10 text-white p-3 text-sm focus:ring-0 focus:border-tech-gold rounded-lg">
                                ${Object.entries(prices.addons.drink).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name} (NT$ ${v.price})</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Wheel/Carousel Add-ons -->
                    <div class="pt-6 border-t border-white/5 space-y-4">
                        <div class="flex justify-between items-end">
                            <label class="text-[10px] text-tech-gold uppercase tracking-widest">必備加購服務 (Wheel Select)</label>
                            <span class="text-[9px] text-gray-500 italic">左右滑動選擇</span>
                        </div>
                        <div class="addon-wheel">
                            ${Object.entries(prices.addons.essentials).map(([k, v]) => `
                                <div class="addon-card" data-key="${k}">
                                    <div class="text-3xl mb-2">${v.icon}</div>
                                    <div class="text-[10px] text-white font-bold mb-1">${v.name}</div>
                                    <div class="text-[9px] text-tech-gold">NT$ ${v.price}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    ${isHangshi ? `
                    <div class="absolute right-0 bottom-0 opacity-10 pointer-events-none p-4 body-vis">
                        <svg width="80" height="120" viewBox="0 0 100 200" fill="white">
                            <path d="M50 20c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10zM35 50h30l5 40-10 10-5 60h-10l-5-60-10-10 5-40z"/>
                        </svg>
                    </div>
                    ` : ''}
                `;
                passContainer.appendChild(div);

                // Add card click toggle
                const addonCards = div.querySelectorAll('.addon-card');
                addonCards.forEach(card => {
                    card.addEventListener('click', () => {
                        card.classList.toggle('active');
                        updateAll();
                    });
                });

                const radios = div.querySelectorAll('input[type="radio"]');
                radios.forEach(r => {
                    r.addEventListener('change', () => {
                        div.querySelectorAll('.p-gender').forEach(g => g.parentElement.classList.remove('border-tech-gold', 'bg-tech-gold/10'));
                        if (r.checked) r.parentElement.classList.add('border-tech-gold', 'bg-tech-gold/10');
                        updateAll();
                    });
                });
                div.querySelector('input[type="radio"]:checked')?.parentElement.classList.add('border-tech-gold', 'bg-tech-gold/10');

                div.querySelectorAll('select').forEach(input => {
                    input.addEventListener('change', updateAll);
                });
            }

            passContainer.querySelectorAll('input[type="range"]').forEach(input => {
                input.addEventListener('input', (e) => {
                    const valEl = e.target.parentElement.querySelector('span');
                    if (valEl) valEl.innerText = `${e.target.value} ${e.target.classList.contains('p-height') ? 'cm' : 'kg'}`;
                    if (currentCabin === 'hangshi-stand') {
                        const card = e.target.closest('.group');
                        const h = card.querySelector('.p-height')?.value || 175;
                        const w = card.querySelector('.p-weight')?.value || 70;
                        const svg = card.querySelector('svg');
                        if (svg) {
                            const scaleX = 0.5 + (w / 150);
                            const scaleY = 0.5 + (h / 210);
                            svg.style.transform = `scale(${scaleX}, ${scaleY})`;
                        }
                    }
                    updateAll();
                });
            });
        }

        function drawMap(origin, dest, progress = 1) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (mapImage.complete) {
                // Draw map but crop the bottom 15% (Hide Antarctica)
                // Source: sx=0, sy=0, sw=width, sh=height*0.85
                // Dest: dx=0, dy=0, dw=width, dh=height
                const sh = mapImage.naturalHeight * 0.85;
                ctx.drawImage(mapImage, 0, 0, mapImage.naturalWidth, sh, 0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = '#0d0d0d';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y * 1.15);
            const currentX = origin.x + (dest.x - origin.x) * progress;
            const currentY = origin.y + (dest.y - origin.y) * progress;
            ctx.lineTo(currentX, currentY * 1.15);
            ctx.stroke();

            Object.values(locations).forEach(loc => {
                const isSelected = loc === origin || loc === dest;
                const plotY = loc.y * 1.15; // Adjustment for map cropping (bottom 15% removed)

                ctx.fillStyle = loc.color;
                if (isSelected) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = loc.color;
                    ctx.beginPath(); ctx.arc(loc.x, plotY, 5, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = 'white'; ctx.font = '700 9px Montserrat'; ctx.fillText(loc.name, loc.x + 8, plotY + 4);
                } else {
                    ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(loc.x, plotY, 2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
                }
            });
            if (progress < 1) {
                // Also adjust the plane path
                const currentY_Adj = (origin.y + (dest.y - origin.y) * progress) * 1.15;
                ctx.fillStyle = '#D4AF37'; ctx.shadowBlur = 10; ctx.shadowColor = '#D4AF37';
                ctx.beginPath(); ctx.arc(currentX, currentY_Adj, 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
            }
        }

        let animation = { progress: 0 };
        function updateAll() {
            const o = locations[originSelect.value];
            const d = locations[destSelect.value];
            const distance = calculateDistance(o, d);
            const passengers = parseInt(passInput.value) || 1;
            const cabinType = cabinSelect.value;
            const multiplier = prices.cabinMultipliers[cabinType];
            const weightMultiplier = getWeightMultiplier(distance);

            distanceEl.innerText = `${distance.toLocaleString()} km`;

            // Calculate Duration (Assuming 800 km/h avg speed + 30m taxi)
            const durationHours = Math.floor(distance / 800);
            const durationMins = Math.round(((distance % 800) / 800) * 60) + 30;
            const finalHours = durationHours + Math.floor(durationMins / 60);
            const finalMins = durationMins % 60;

            const timeDisplay = document.getElementById('duration-display');
            if (timeDisplay) {
                timeDisplay.innerText = `${finalHours} 小時 ${finalMins} 分鐘`;
            } else {
                // Determine where to inject if missing, or just append to distance for now
                if (!document.getElementById('duration-span')) {
                    const span = document.createElement('span');
                    span.id = 'duration-span';
                    span.className = 'ml-4 text-tech-gold';
                    distanceEl.appendChild(span);
                }
                document.getElementById('duration-span').innerText = `${finalHours} 小時 ${finalMins} 分鐘`;
            }

            cabinNote.innerText = cabinType === 'seat' ? '含舒適座椅、餐飲服務' :
                cabinType === 'comfort-stand' ? '含加厚立式軟墊、手扶把' :
                    '極度精簡空間，依人體累積體積精準計費';

            let totalBodyWeight = 0;
            let totalLuggageWeight = 0;
            let totalVolumeCost = 0;
            let totalAddonsCost = 0;
            let volumeBreakdown = '';

            const pCards = passContainer.querySelectorAll('.group');
            pCards.forEach((card, idx) => {
                const w = parseFloat(card.querySelector('.p-weight').value);
                const l = parseFloat(card.querySelector('.p-luggage').value);
                totalBodyWeight += w;
                totalLuggageWeight += l;

                const foodVal = card.querySelector('.p-food').value;
                const drinkVal = card.querySelector('.p-drink').value;
                totalAddonsCost += (prices.addons.food[foodVal]?.price || 0);
                totalAddonsCost += (prices.addons.drink[drinkVal]?.price || 0);

                card.querySelectorAll('.addon-card.active').forEach(activeCard => {
                    const key = activeCard.dataset.key;
                    totalAddonsCost += (prices.addons.essentials[key]?.price || 0);
                });

                if (cabinType === 'hangshi-stand') {
                    const h = parseFloat(card.querySelector('.p-height').value);
                    const gender = card.querySelector('input[type="radio"]:checked')?.value || 'male';
                    const genderFactor = gender === 'male' ? 1.05 : 0.95;
                    const volumeLiters = (w / 1.01) * (h / 170) * genderFactor;
                    const vCost = Math.round(volumeLiters * prices.volumeRate * weightMultiplier);
                    totalVolumeCost += vCost;
                    volumeBreakdown += `<div class="flex justify-between text-[10px] text-gray-500 italic pl-4">
                        <span>P${idx + 1} 體積試算 (${volumeLiters.toFixed(1)}L)</span>
                        <span>NT$ ${vCost.toLocaleString()}</span>
                    </div>`;
                }
            });

            const baseTicketPrice = Math.round(distance * prices.basePerKm * multiplier * passengers);
            const bodyWeightCost = Math.round(totalBodyWeight * prices.weightRate_Body * weightMultiplier);
            const luggageWeightCost = Math.round(totalLuggageWeight * prices.weightRate_Luggage * weightMultiplier);

            const subtotal = baseTicketPrice + bodyWeightCost + luggageWeightCost + totalVolumeCost + totalAddonsCost;
            const tax = Math.round(subtotal * 0.05);
            const total = subtotal + tax;

            if (totalPriceEl) totalPriceEl.innerText = `NT$ ${total.toLocaleString()}`;
            if (taxAmountEl) taxAmountEl.innerText = `NT$ ${tax.toLocaleString()}`;
            if (invoiceTotalEl) invoiceTotalEl.innerText = `NT$ ${total.toLocaleString()}`;

            invoiceContent.innerHTML = `
                <div class="space-y-4">
                    <div class="flex justify-between border-b border-white/5 pb-2">
                        <span>航線基礎費 (KM/Cabin)</span>
                        <span class="text-white">NT$ ${baseTicketPrice.toLocaleString()}</span>
                    </div>
                    ${totalAddonsCost > 0 ? `
                        <div class="flex justify-between">
                            <span>加價購服務 (Add-ons)</span>
                            <span class="text-white">NT$ ${totalAddonsCost.toLocaleString()}</span>
                        </div>
                    ` : ''}
                    ${cabinType === 'hangshi-stand' ? `
                        <div class="space-y-1">
                            <div class="flex justify-between">
                                <span>體積占用費 (Volume)</span>
                                <span class="text-white">NT$ ${totalVolumeCost.toLocaleString()}</span>
                            </div>
                            ${volumeBreakdown}
                        </div>
                    ` : ''}
                    <div class="flex justify-between">
                        <span>載重加收 - 體重</span>
                        <span class="text-white">NT$ ${bodyWeightCost.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>載重加收 - 行李</span>
                        <span class="text-white">NT$ ${luggageWeightCost.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between pt-2 border-t border-white/10 mt-2 text-tech-gold uppercase text-[10px]">
                        <span>里程調節係數 (Distance Multiplier)</span>
                        <span>× ${weightMultiplier}</span>
                    </div>
                </div>
            `;

            gsap.killTweensOf(animation);
            animation.progress = 0;
            gsap.to(animation, {
                progress: 1, duration: 1.5, ease: "power2.inOut",
                onUpdate: () => drawMap(o, d, animation.progress)
            });
        }

        function renderSeatMap(cabinType, passengerCount) {
            seatMapContainer.innerHTML = '';
            selectedSeats = [];
            seatsNeededEl.innerText = passengerCount;
            seatErrorMsg.classList.add('hidden');

            if (cabinType === 'hangshi-stand') {
                seatSection.classList.add('hidden');
                return;
            }

            seatSection.classList.remove('hidden');
            const grid = document.createElement('div');
            grid.className = `seat-grid ${cabinType === 'seat' ? 'cabin-standard' : 'cabin-standing'}`;

            // Standard: 20 seats. 5 cols. Col 3 is aisle.
            // Standing: 50 spots. 11 cols. Col 6 is aisle.

            const isSeat = cabinType === 'seat';
            const rows = 5;
            const cols = isSeat ? 5 : 11;
            const totalCells = rows * cols;

            const takenSeats = ['A2', 'B4', 'C1', 'S-5', 'S-12', 'S-48'];

            let seatCounter = 0;

            for (let i = 0; i < totalCells; i++) {
                const colIndex = i % cols;
                // Seat (5 cols): Middle is index 2
                // Standing (11 cols): Middle is index 5
                const isAisle = isSeat ? (colIndex === 2) : (colIndex === 5);

                if (isAisle) {
                    const aisle = document.createElement('div');
                    aisle.className = 'seat-aisle';
                    grid.appendChild(aisle);
                    continue;
                }

                seatCounter++;
                const seatId = isSeat
                    ? `${String.fromCharCode(65 + Math.floor((seatCounter - 1) / 4))}${(seatCounter - 1) % 4 + 1}`
                    : `S-${seatCounter}`;

                const isTaken = takenSeats.includes(seatId);
                const seat = document.createElement('div');
                seat.className = `seat-item ${isSeat ? 'type-seat' : 'type-standing'} ${isTaken ? 'taken' : ''}`;
                seat.innerText = seatId;

                if (!isTaken) {
                    seat.addEventListener('click', () => {
                        if (selectedSeats.includes(seatId)) {
                            selectedSeats = selectedSeats.filter(s => s !== seatId);
                            seat.classList.remove('selected');
                        } else {
                            if (selectedSeats.length < parseInt(passInput.value)) {
                                selectedSeats.push(seatId);
                                seat.classList.add('selected');
                            } else {
                                const first = selectedSeats.shift();
                                const firstEl = Array.from(grid.children).find(el => el.innerText === first);
                                if (firstEl) firstEl.classList.remove('selected');

                                selectedSeats.push(seatId);
                                seat.classList.add('selected');
                            }
                        }
                        seatErrorMsg.classList.add('hidden');
                    });
                }
                grid.appendChild(seat);
            }
            seatMapContainer.appendChild(grid);
        }


        [originSelect, destSelect, cabinSelect].forEach(el => el.addEventListener('change', () => {
            if (el === cabinSelect) {
                const count = parseInt(passInput.value);
                createPassengerInputs(count);
                renderSeatMap(cabinSelect.value, count);
            }
            updateAll();
        }));

        document.getElementById('inc-passengers').addEventListener('click', () => {
            if (parseInt(passInput.value) < 10) {
                passInput.value = parseInt(passInput.value) + 1;
                const count = parseInt(passInput.value);
                createPassengerInputs(count);
                renderSeatMap(cabinSelect.value, count);
                updateAll();
            }
        });
        document.getElementById('dec-passengers').addEventListener('click', () => {
            if (parseInt(passInput.value) > 1) {
                passInput.value = parseInt(passInput.value) - 1;
                const count = parseInt(passInput.value);
                createPassengerInputs(count);
                renderSeatMap(cabinSelect.value, count);
                updateAll();
            }
        });

        mapImage.onload = updateAll;
        mapImage.onload = updateAll;
        createPassengerInputs(1);
        renderSeatMap('seat', 1); // Default Init
        updateAll();

        // Proceed to Confirmation Page
        const proceedBtn = document.getElementById('proceed-to-confirmation');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                const origin = originSelect.value;
                const destination = destSelect.value;
                const cabin = cabinSelect.value;
                const passengerCount = parseInt(passInput.value);

                if (!origin || !destination) {
                    alert('請選擇出發地與目的地');
                    return;
                }

                if (bookingState.tripType === 'round-trip') {
                    if (!bookingState.selectedOutboundFlight || !bookingState.selectedInboundFlight) {
                        alert('請選擇去程與回程航班');
                        document.getElementById('flight-selection-section').scrollIntoView({ behavior: 'smooth' });
                        return;
                    }
                } else {
                    if (!bookingState.selectedOutboundFlight) {
                        alert('請選擇去程航班');
                        document.getElementById('flight-selection-section').scrollIntoView({ behavior: 'smooth' });
                        return;
                    }
                }

                if (cabin !== 'hangshi-stand' && (!selectedSeats || selectedSeats.length !== passengerCount)) {
                    seatErrorMsg.classList.remove('hidden');
                    document.getElementById('seat-selection-section').scrollIntoView({ behavior: 'smooth' });
                    return;
                }

                // Collect all add-ons safely
                const addons = [];
                try {
                    document.querySelectorAll('.addon-card.active').forEach(card => {
                        // Structure: 0:Icon, 1:Name, 2:Price
                        if (card.children.length >= 3) {
                            const icon = card.children[0].textContent.trim();
                            const name = card.children[1].textContent.trim();
                            const priceText = card.children[2].textContent;
                            const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
                            addons.push({ name, price, icon });
                        }
                    });
                } catch (e) {
                    console.error("Error collecting addons", e);
                }

                // Get price breakdown from invoice
                const baseFare = parseFloat(document.querySelector('[data-price="base"]')?.textContent.replace(/[^0-9.]/g, '') || 0);
                const passengerWeight = parseFloat(document.querySelector('[data-price="passenger"]')?.textContent.replace(/[^0-9.]/g, '') || 0);
                const luggageWeight = parseFloat(document.querySelector('[data-price="luggage"]')?.textContent.replace(/[^0-9.]/g, '') || 0);
                const volumeFee = parseFloat(document.querySelector('[data-price="volume"]')?.textContent.replace(/[^0-9.]/g, '') || 0);
                const addonsCost = parseFloat(document.querySelector('[data-price="addons"]')?.textContent.replace(/[^0-9.]/g, '') || 0);
                const tax = parseFloat(taxAmountEl.textContent.replace(/[^0-9.]/g, ''));
                const totalAmount = parseFloat(invoiceTotalEl.textContent.replace(/[^0-9.]/g, ''));

                // Calculate distance & duration
                const o = locations[origin];
                const d = locations[destination];
                let distance = 2000;
                if (o && d) distance = calculateDistance(o, d);

                // Use Flight Duration from Selected Flight or calculation
                const flightDuration = bookingState.selectedOutboundFlight ? calculateDurationStr('3h 30m') : '3h 30m'; // Simplification for now

                // Store booking data
                const bookingData = {
                    origin: origin || 'TPE',
                    destination: destination || 'NRT',
                    originName: locations[origin]?.name || '台北桃園',
                    destName: locations[destination]?.name || '東京成田',
                    flightOut: bookingState.selectedOutboundFlight,
                    flightIn: bookingState.selectedInboundFlight,
                    cabin,
                    passengerCount: passengerCount || 1,
                    selectedSeats: selectedSeats || [],
                    distance,
                    duration: flightDuration,
                    addons,
                    priceBreakdown: {
                        baseFare,
                        passengerWeight,
                        luggageWeight,
                        volumeFee,
                        addonsCost,
                        tax
                    },
                    totalAmount
                };

                sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
                window.location.href = 'confirmation.html';
            });
        }
    }
    // --- 6. Booking Logic Initialization ---
    initBookingSystem();

});



function initBookingSystem() {
    // URL Param Parsing
    const params = new URLSearchParams(window.location.search);
    const originParam = params.get('origin');
    const destParam = params.get('destination');
    const dateParam = params.get('date');
    const returnDateParam = params.get('returnDate');

    // Trip Type Toggles
    const btnOneWay = document.getElementById('btn-one-way');
    const btnRoundTrip = document.getElementById('btn-round-trip');
    const returnDateInput = document.getElementById('date-inbound');
    const returnDateContainer = document.getElementById('return-date-container');

    if (btnOneWay && btnRoundTrip) {
        btnOneWay.addEventListener('click', () => {
            setTripType('one-way');
            btnOneWay.classList.add('bg-tech-gold/10', 'border-tech-gold', 'text-tech-gold');
            btnOneWay.classList.remove('border-white/20', 'text-gray-400');
            btnRoundTrip.classList.remove('bg-tech-gold/10', 'border-tech-gold', 'text-tech-gold');
            btnRoundTrip.classList.add('border-white/20', 'text-gray-400');
            returnDateContainer.classList.add('opacity-50');
            returnDateInput.disabled = true;
        });

        btnRoundTrip.addEventListener('click', () => {
            setTripType('round-trip');
            btnRoundTrip.classList.add('bg-tech-gold/10', 'border-tech-gold', 'text-tech-gold');
            btnRoundTrip.classList.remove('border-white/20', 'text-gray-400');
            btnOneWay.classList.remove('bg-tech-gold/10', 'border-tech-gold', 'text-tech-gold');
            btnOneWay.classList.add('border-white/20', 'text-gray-400');
            returnDateContainer.classList.remove('opacity-50');
            returnDateInput.disabled = false;
        });

        // Initialize from URL if return date exists
        if (returnDateParam) {
            btnRoundTrip.click();
            returnDateInput.value = returnDateParam;
        } else {
            if (dateParam) document.getElementById('date-outbound').value = dateParam;
        }
    }

    // Initialize Flatpickr for booking page
    if (window.flatpickr) {
        flatpickr("#date-outbound", { minDate: "today", dateFormat: "Y-m-d", theme: "dark", defaultDate: dateParam });
        flatpickr("#date-inbound", { minDate: "today", dateFormat: "Y-m-d", theme: "dark", defaultDate: returnDateParam });
    }

    // Trigger initial flight search if params exist
    if (originParam && destParam && dateParam) {
        // Wait for locations to load? They are usually hardcoded or loaded fast.
        // We'll trust the select elements will be populated by main logic then we set values
        setTimeout(() => {
            const originSelect = document.getElementById('origin');
            const destSelect = document.getElementById('destination');
            if (originSelect && destSelect) {
                originSelect.value = originParam;
                destSelect.value = destParam;
                originSelect.dispatchEvent(new Event('change'));
                destSelect.dispatchEvent(new Event('change'));
                updateFlightSelectionUI();
            }
        }, 500);
    }

    // Listen for changes to update flight list
    ['origin', 'destination', 'date-outbound', 'date-inbound'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', updateFlightSelectionUI);
    });
}

function setTripType(type) {
    bookingState.tripType = type;
    updateFlightSelectionUI();
}

// Mock Flight Generator
function generateMockFlights(origin, dest, date) {
    if (!origin || !dest) return [];
    if (origin === dest) return [];

    // Randomize slightly based on date string hash or just random
    // We create fixed slots: Morning, Afternoon, Evening
    const flights = [
        { id: 'HS801', dep: '09:30', arr: '13:55', priceMod: 1.0 },
        { id: 'HS803', dep: '14:40', arr: '19:05', priceMod: 1.15 },
        { id: 'HS805', dep: '20:20', arr: '23:45', priceMod: 0.95 }
    ];

    return flights.map(f => ({
        ...f,
        origin,
        dest,
        date,
        priceDisplay: `TWD ${Math.floor(12500 * f.priceMod).toLocaleString()}`
    }));
}

function updateFlightSelectionUI() {
    const originVal = document.getElementById('origin')?.value;
    const destVal = document.getElementById('destination')?.value;
    const dateOut = document.getElementById('date-outbound')?.value;
    const dateIn = document.getElementById('date-inbound')?.value;

    const flightSection = document.getElementById('flight-selection-section');
    if (!flightSection) return;

    if (originVal && destVal && dateOut && originVal !== destVal) {
        flightSection.classList.remove('hidden');
        renderFlights('outbound', originVal, destVal, dateOut);

        if (bookingState.tripType === 'round-trip' && dateIn) {
            document.getElementById('inbound-flights-list').classList.remove('hidden');
            renderFlights('inbound', destVal, originVal, dateIn);
        } else {
            document.getElementById('inbound-flights-list').classList.add('hidden');
        }
    } else {
        flightSection.classList.add('hidden');
    }
}

function renderFlights(type, origin, dest, date) {
    const container = document.getElementById(`${type}-flights-list`);
    const label = document.getElementById(`lbl-route-${type === 'outbound' ? 'out' : 'in'}`);
    if (label) label.innerText = `${origin} ➝ ${dest} (${date})`;

    // Clear existing (except header) - simpler: keep header, remove others
    // Actually easiest is to clear all and re-add header, or just append to a content div.
    // Let's assume the HTML structure has a container div or we just querySelectorAll to remove items.
    // The current structure has h3 then items.

    // Remove all divs that look like flight cards
    const cards = container.querySelectorAll('.flight-card');
    cards.forEach(c => c.remove());

    const flights = generateMockFlights(origin, dest, date);
    flights.forEach(f => {
        const el = document.createElement('div');
        el.className = `flight-card p-6 border border-white/10 rounded-xl hover:bg-white/5 cursor-pointer transition-all flex justify-between items-center ${(type === 'outbound' && bookingState.selectedOutboundFlight?.id === f.id) ||
            (type === 'inbound' && bookingState.selectedInboundFlight?.id === f.id)
            ? 'bg-tech-gold/10 border-tech-gold ring-1 ring-tech-gold' : 'bg-black/20'
            }`;

        el.innerHTML = `
            <div class="flex items-center gap-6">
                <div class="text-center">
                    <div class="text-2xl font-bold text-white font-heading">${f.dep}</div>
                    <div class="text-xs text-gray-500">${origin}</div>
                </div>
                <div class="flex flex-col items-center">
                    <div class="text-[10px] text-gray-500 mb-1">${calculateDurationStr('3h 30m')}</div>
                    <div class="w-24 h-px bg-white/20 relative">
                        <div class="absolute right-0 -top-[3px] w-1 h-1 bg-white rounded-full"></div>
                        <div class="absolute left-0 -top-[3px] w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    <div class="text-[10px] text-tech-gold mt-1">${f.id}</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-white font-heading">${f.arr}</div>
                    <div class="text-xs text-gray-500">${dest}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="text-xl font-bold text-tech-gold">${f.priceDisplay}</div>
                <div class="text-xs text-gray-400">經濟艙 / 每人</div>
            </div>
        `;
        el.onclick = () => selectFlight(type, f);
        container.appendChild(el);
    });
}

function calculateDurationStr(str) { return str; } // Placeholder

function selectFlight(type, flight) {
    if (type === 'outbound') bookingState.selectedOutboundFlight = flight;
    else bookingState.selectedInboundFlight = flight;

    updateFlightSelectionUI(); // Re-render to show selection state
}
