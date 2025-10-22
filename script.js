const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const context = canvas.getContext('2d');
const faceCount = document.getElementById('faceCount');
const title = document.getElementById('title');
const langSelect = document.getElementById('langSelect');

const translations = {
  tr: { title: "Yüz Tanıma Sistemi", count: "Yüz sayısı", age: "Yaş" },
  en: { title: "Face Recognition System", count: "Face count", age: "Age" }
};

let currentLang = 'tr';

// Kamera kurulumu
async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    return new Promise(resolve => {
      video.onloadedmetadata = () => resolve(video);
    });
  } catch (err) {
    alert("Kamera erişimi başarısız: " + err.message);
  }
}

// Modelleri yükle
async function loadModels() {
  const MODEL_URL = './models';
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
}

// Başlat
async function start() {
  await loadModels();
  await setupCamera();
  video.play();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withAgeAndGender();

    const resized = faceapi.resizeResults(detections, displaySize);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    faceCount.textContent = `${translations[currentLang].count}: ${resized.length}`;

    resized.forEach(result => {
      const { age, detection } = result;
      const box = detection.box;

      context.strokeStyle = 'red';
      context.lineWidth = 2;
      context.strokeRect(box.x, box.y, box.width, box.height);

      context.font = '16px Arial';
      context.fillStyle = 'black';
      context.fillText(`${translations[currentLang].age}: ${Math.round(age)}`, box.x, box.y - 10);
    });
  }, 500);
}

// Fotoğraf kaydetme
document.getElementById('saveBtn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'yuz-tahmini.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Tema değiştir
document.getElementById('darkToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Dil değiştir
langSelect.addEventListener('change', (e) => {
  currentLang = e.target.value;
  title.textContent = translations[currentLang].title;
});

start();
