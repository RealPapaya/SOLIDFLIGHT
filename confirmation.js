import './style.css'
import { gsap } from 'gsap'

document.addEventListener('DOMContentLoaded', () => {
    // Get booking data from sessionStorage
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData') || '{}');

    if (!bookingData.origin) {
        // No booking data, redirect back
        window.location.href = 'booking.html';
        return;
    }

    // Generate booking reference
    const bookingRef = `HS-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    document.getElementById('booking-ref').textContent = bookingRef;

    // Populate flight info
    document.getElementById('origin-code').textContent = bookingData.origin.toUpperCase();
    document.getElementById('origin-name').textContent = bookingData.originName;
    document.getElementById('dest-code').textContent = bookingData.destination.toUpperCase();
    document.getElementById('dest-name').textContent = bookingData.destName;
    document.getElementById('distance-km').textContent = `${bookingData.distance.toLocaleString()} km`;

    // Calculate flight duration (rough estimate: distance / 800 km/h average speed)
    // Calculate flight duration (rough estimate or use provided)
    const durationHours = bookingData.distance / 800; // Keep for fallback calculation logic if needed for arrival
    document.getElementById('flight-duration').textContent = bookingData.duration || `${Math.floor(durationHours)} 小時 ${Math.round((durationHours % 1) * 60)} 分鐘`;
    document.getElementById('est-flight-time').textContent = bookingData.duration ? bookingData.duration.replace('小時', 'h').replace('分鐘', 'm') : `${Math.floor(durationHours)}h ${Math.round((durationHours % 1) * 60)}m`;

    // Set departure/arrival times from Selected Flight
    let depTime = '--:--';
    let arrTime = '--:--';
    let flightId = 'HS-XXX';

    if (bookingData.outbound && bookingData.outbound.flight) {
        depTime = bookingData.outbound.flight.dep;
        arrTime = bookingData.outbound.flight.arr;
        flightId = bookingData.outbound.flight.id;
    } else {
        // Fallback
        depTime = '10:30';
        arrTime = '14:55';
        flightId = 'HS-801';
    }

    document.getElementById('departure-time').textContent = depTime;
    document.getElementById('arrival-time').textContent = arrTime;

    // Update Booking Ref to include Flight ID or similar if desired, or random ref is fine.
    // Ensure Flight ID is shown? The UI might not have a specific slot for Flight ID other than the abstract boarding pass header.
    // The current UI shows "電子登機證" at top. Let's add Flight ID somewhere prominent or replace route text.
    // Let's look at the HTML structure: 
    // <div class="text-xs text-gray-500 mt-1" id="departure-time">--:--</div>

    // We can inject Flight ID next to the plane icon or route.
    // Logic: 
    // <div class="flex flex-col items-center">
    //    <div class="text-tech-gold text-xs mb-2">✈️</div> 
    // Let's modify the plane icon to show Flight ID.

    const planeIconDiv = document.querySelector('.ticket-main .text-tech-gold.text-xs.mb-2');
    if (planeIconDiv) {
        planeIconDiv.innerHTML = `✈️ ${flightId}`;
    }

    // Populate passenger & cabin info
    document.getElementById('passenger-count').textContent = bookingData.passengerCount || 1;

    const cabinNames = {
        'seat': '標準坐票',
        'standard': '標準坐票',
        'comfort-stand': '舒適站票',
        'hangshi-stand': '夯實站票'
    };
    document.getElementById('cabin-class').textContent = cabinNames[bookingData.cabin] || '標準坐票';

    // Populate Seat Info
    const seats = bookingData.selectedSeats && bookingData.selectedSeats.length > 0
        ? bookingData.selectedSeats.join(', ')
        : (bookingData.cabin === 'hangshi-stand' ? '體積計費區' : '未指定');
    document.getElementById('seat-assignment').textContent = seats;

    // Generate QR Code (using public API for realism)
    const qrData = JSON.stringify({
        ref: bookingRef,
        flight: flightId,
        route: `${bookingData.origin}-${bookingData.destination}`,
        seats: seats,
        dep: depTime
    });
    document.getElementById('ticket-qr').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&color=000000&bgcolor=ffffff`;

    // Populate add-ons
    // Populate add-ons
    const addonsListEl = document.getElementById('addons-list');
    const addonsSection = document.getElementById('addons-section');

    if (bookingData.addons && bookingData.addons.length > 0) {
        addonsSection.style.display = 'block';
        addonsListEl.innerHTML = bookingData.addons.map(addon => `
            <div class="flex justify-between items-center text-sm py-2 border-b border-white/5 last:border-0">
                <div class="flex items-center space-x-3">
                    <span class="text-xl">${addon.icon || '➕'}</span>
                    <span class="text-gray-300">${addon.name}</span>
                </div>
                <span class="text-tech-gold font-mono">NT$ ${addon.price.toLocaleString()}</span>
            </div>
        `).join('');
    } else {
        if (addonsSection) addonsSection.style.display = 'none';
    }

    // NEW: Passenger Manifest (Detailed Stats)
    if (bookingData.passengerDetails && bookingData.passengerDetails.length > 0) {
        const manifestHTML = `
            <div class="relative z-10 border-t border-white/10 pt-6 mb-6">
                <h3 class="text-white font-bold mb-4 flex items-center">
                    <span class="text-tech-gold mr-2">◈</span> 乘客詳細資料 (Manifest)
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${bookingData.passengerDetails.map((p, i) => {
            let details = '';
            if (p.type === 'stand') {
                details = `
                                <span class="bg-gray-800 text-xs px-2 py-0.5 rounded text-gray-300">夯實站票</span>
                                <div class="mt-1 text-sm text-gray-400">
                                    <span class="text-white">${p.gender === 'F' ? '女性' : '男性'}</span> | 
                                    H: <span class="text-tech-gold">${p.height}cm</span> | 
                                    W: <span class="text-tech-gold">${p.weight}kg</span>
                                    ${p.luggage > 0 ? `| 🧳 ${p.luggage}kg` : ''}
                                </div>
                            `;
            } else {
                details = `
                                <span class="bg-gray-800 text-xs px-2 py-0.5 rounded text-gray-300">標準配置</span>
                                <div class="mt-1 text-sm text-gray-400">
                                    W: <span class="text-tech-gold">${p.weight}kg</span> | 
                                    Luggage: <span class="text-tech-gold">${p.luggage}kg</span>
                                </div>
                            `;
            }
            return `
                            <div class="bg-white/5 p-3 rounded-lg border border-white/10">
                                <div class="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Passenger ${i + 1} (${p.phase === 'outbound' ? '去程' : '回程'})</div>
                                ${details}
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;

        // Insert before Addons Section
        if (addonsSection) {
            addonsSection.insertAdjacentHTML('beforebegin', manifestHTML);
        }
    }

    // Populate price breakdown
    const priceBreakdownEl = document.getElementById('price-breakdown');
    const breakdown = bookingData.priceBreakdown || {};
    // Fallback if breakdown is missing (legacy data)
    if (!breakdown.baseFare && bookingData.totalAmount) {
        breakdown.baseFare = bookingData.totalAmount;
    }

    const breakdownItems = [
        { label: '基本票價 (Base Fare)', value: breakdown.baseFare || 0 },
        { label: '乘客載重附加費 (Passenger Weight)', value: breakdown.passengerWeight || 0 },
        { label: '人體體積費 (Body Volume Charge)', value: breakdown.volumeCost || 0 },
        { label: '行李託運附加費 (Luggage Weight)', value: breakdown.luggageWeight || 0 },
        { label: '加購服務總計 (Add-ons)', value: breakdown.addonsCost || 0 },
        { label: '稅金 (Tax 5%)', value: breakdown.tax || 0 },
        { label: '總金額 (Total)', value: (bookingData.totalAmount || 0), isTotal: true }
    ];

    priceBreakdownEl.innerHTML = `
        ${breakdownItems.map(item => {
        const isTotal = item.isTotal;
        return `
            <div class="flex justify-between items-center text-sm ${isTotal ? 'pt-4 mt-2 border-t border-white/20 font-bold text-lg' : 'mb-1'}">
                <span class="${isTotal ? 'text-white' : 'text-gray-400'}">${item.label}</span>
                <span class="${isTotal ? 'text-tech-gold' : 'text-white'}">NT$ ${item.value.toLocaleString()}</span>
            </div>`;
    }).join('')}
        
        <!-- Refund Policy Note -->
        <div class="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-red-400">
            <span>退票手續費 (Refund Fee / Non-refundable)</span>
            <span>NT$ ${(breakdown.refundFee || 3000).toLocaleString()}</span>
        </div>
    `;

    // Set total amount
    document.getElementById('total-amount').textContent = `NT$ ${(bookingData.totalAmount || 0).toLocaleString()}`;

    // Entrance animation
    gsap.from('.ticket-main', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        delay: 0.3
    });

    // Payment button
    const paymentBtn = document.getElementById('confirm-payment-btn');
    paymentBtn.addEventListener('click', () => {
        // Simulate payment processing
        paymentBtn.innerHTML = '<span class="relative z-10">處理中...</span>';
        paymentBtn.disabled = true;

        setTimeout(() => {
            alert(`✅ 付款成功！\n訂單編號: ${bookingRef}\n總金額: NT$ ${(bookingData.totalAmount || 0).toLocaleString()}\n\n感謝您選擇夯實航空！`);
            sessionStorage.removeItem('bookingData');
            window.location.href = 'index.html';
        }, 2000);
    });

    // Magnetic button effect
    paymentBtn.addEventListener('mousemove', (e) => {
        const rect = paymentBtn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(paymentBtn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: 'power2.out' });
    });

    paymentBtn.addEventListener('mouseleave', () => {
        gsap.to(paymentBtn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    });
});
