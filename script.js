window.addEventListener('DOMContentLoaded', () => {
  const df = document.getElementById('stations');
  stations.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    df.appendChild(opt);
  });
});

function addVia() {
  const viaInput = document.getElementById('viaInput').value;
  const viaField = document.getElementById('via').value;
  if (viaInput) {
    document.getElementById('via').value = viaField === '' ? viaInput : `${viaField} / ${viaInput}`;
    document.getElementById('viaInput').value = '';
  }
}

function clearVia() {
  document.getElementById('via').value = '';
}

function addTrain() {
  const type = document.getElementById('trainType').value;
  const number = document.getElementById('trainNumber').value;
  if (!number) return;
  const trainEntry = `${type} ${parseInt(number, 10)}`;
  const trainField = document.getElementById('train').value;
  document.getElementById('train').value = trainField === '' ? trainEntry : `${trainField} / ${trainEntry}`;
  document.getElementById('trainNumber').value = '';
  generateReservationFields();
}

function clearTrains() {
  document.getElementById('train').value = '';
  document.getElementById('reservationSeats').innerHTML = '';
}

function generateReservationFields() {
  const reservationDiv = document.getElementById('reservationSeats');
  reservationDiv.innerHTML = '';
  const trainList = document.getElementById('train').value.split(' / ');
  const reservableTypes = ['R', 'IC', 'EC', 'Sc', 'rj', 'rjx', 'ICE'];

  trainList.forEach(train => {
    const parts = train.split(' ');
    const type = parts[0];
    const number = parts[1];
    if (reservableTypes.includes(type)) {
      const container = document.createElement('div');
      container.className = 'reservation-entry';
      const label = document.createElement('span');
      label.textContent = `${type} ${number}: `;
      label.style.cursor = 'pointer';
      label.onclick = () => reservationDiv.removeChild(container);

      const seat1 = document.createElement('input');
      seat1.type = 'number';
      seat1.min = 1;
      seat1.max = 999;
      seat1.placeholder = 'Vůz';

      const seat2 = document.createElement('input');
      seat2.type = 'number';
      seat2.min = 1;
      seat2.max = 999;
      seat2.placeholder = 'Místo';

      container.appendChild(label);
      container.appendChild(seat1);
      container.appendChild(document.createTextNode(', '));
      container.appendChild(seat2);
      reservationDiv.appendChild(container);
    }
  });
}

function saveSeats() {
  const reservationDiv = document.getElementById('reservationSeats');
  const entries = reservationDiv.getElementsByClassName('reservation-entry');
  let result = [];

  for (let entry of entries) {
    const label = entry.querySelector('span').textContent.trim();
    const inputs = entry.querySelectorAll('input');
    const seat1 = inputs[0].value;
    const seat2 = inputs[1].value;
    if (seat1 && seat2) {
      result.push(`${label} ${seat1}, ${seat2}`);
    }
  }

  document.getElementById('seat').value = result.join(' / ');
}

function generateTicket() {
  const name = document.getElementById('name').value;
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const via = document.getElementById('via').value;
  const dateVal = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const arrivalTime = document.getElementById('arrivalTime').value;
  const trainClass = document.getElementById('class').value;
  const reservation = document.getElementById('reservation').value;
  const train = document.getElementById('train').value;
  const seat = document.getElementById('seat').value;
  const price = document.getElementById('price').value;
  const priceDisplay = price ? `${price} Kč` : '';

  const dateStr = dateVal ? formatDate(dateVal) : '';

  document.getElementById('outName').innerText = name;
  document.getElementById('outFrom').innerText = from;
  document.getElementById('outTo').innerText = to;
  document.getElementById('outVia').innerText = via;
  document.getElementById('outDate').innerText = dateStr;
  document.getElementById('outTime').innerText = time;
  document.getElementById('outArrivalTime').innerText = arrivalTime;
  document.getElementById('outClass').innerText = trainClass;
  document.getElementById('outReservation').innerText = reservation;
  document.getElementById('outTrain').innerText = train;
  document.getElementById('outSeat').innerText = seat;
  document.getElementById('outPrice').innerText = priceDisplay;

  if (dateVal) {
    const nextDate = new Date(dateVal);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextStr = formatDate(nextDate.toISOString().split('T')[0]);
    document.getElementById('validFrom').innerText = `${dateStr} ${time}`;
    document.getElementById('validTo').innerText = `${nextStr} 00:00`;
  } else {
    document.getElementById('validFrom').innerText = '-';
    document.getElementById('validTo').innerText = '-';
  }

  const dokladCislo = generateDokladCislo();
  const kodTransakce = generateKodTransakce();
  document.getElementById('dokladCislo').innerText = dokladCislo;
  document.getElementById('kodTransakce').innerText = kodTransakce;
  document.getElementById('barcodeCode').innerText = `Kód: ${kodTransakce}`;

  new QRious({
    element: document.getElementById('qrcode'),
    value: 'https://www.cd.cz',
    size: 200
  });

  document.getElementById('ticket').style.display = 'block';
  savePDF();
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function generateDokladCislo() {
  return `${getRandomInt(10, 99)}-${getRandomInt(1000, 9999)}-${getRandomInt(100, 999)}`;
}

function generateKodTransakce() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function savePDF() {
  const element = document.getElementById('ticket');
  html2pdf().from(element).set({
    filename: 'jizdenka.pdf',
    margin: 0,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).save();
}
