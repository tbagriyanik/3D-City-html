// Three.js sahnesini oluştur
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Gökyüzü mavisi

scene.fog = new THREE.Fog(0x87CEEB, 30, 300); // Color: light gray, near: 50, far: 300


// Dağlar
function createMountains() {
  const mountainGroup = new THREE.Group();

  // Dağların pozisyonları
  const mountainPositions = [
    { x: -150, z: -150, scale: 1.8 },
    { x: 150, z: -150, scale: 1.5 },
    { x: -150, z: 150, scale: 1.6 },
    { x: 150, z: 150, scale: 1.7 },
    { x: 0, z: -180, scale: 2.0 },
    { x: -180, z: 0, scale: 1.9 },
    { x: 180, z: 0, scale: 1.8 },
    { x: 0, z: 180, scale: 2.1 }
  ];

  mountainPositions.forEach(pos => {
    const mountainGeometry = new THREE.ConeGeometry(30, 60, 5);
    const mountainMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b654b,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true
    });

    const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain.position.set(pos.x, 30, pos.z);
    mountain.scale.set(pos.scale, pos.scale, pos.scale);
    mountain.castShadow = true;
    mountain.receiveShadow = true;

    // Dağın tepesine kar ekle
    const snowGeometry = new THREE.ConeGeometry(15, 10, 5);
    const snowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8
    });

    // Sound effects removed

    // Weather system
    const weatherStates = {
      clear: {
        fogDensity: 0,
        rain: false,
        grip: 1.0
      },
      foggy: {
        fogDensity: 0.03,
        rain: false,
        grip: 0.8
      },
      rainy: {
        fogDensity: 0.01,
        rain: true,
        grip: 0.6
      }
    };

    let currentWeather = 'clear';
    const raindrops = [];

    function createRaindrops() {
      const rainGeometry = new THREE.BufferGeometry();
      const rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.1,
        transparent: true
      });

      const positions = new Float32Array(1000 * 3);
      for (let i = 0; i < 1000; i++) {
        positions[i * 3] = Math.random() * 400 - 200;
        positions[i * 3 + 1] = Math.random() * 100;
        positions[i * 3 + 2] = Math.random() * 400 - 200;
      }

      rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const rainSystem = new THREE.Points(rainGeometry, rainMaterial);
      scene.add(rainSystem);
      return rainSystem;
    }

    function updateWeather(deltaTime) {
      // Random weather changes
      if (Math.random() < 0.001) {
        const weathers = Object.keys(weatherStates);
        currentWeather = weathers[Math.floor(Math.random() * weathers.length)];
        scene.fog = new THREE.Fog(0x555555, 1, 1 / weatherStates[currentWeather].fogDensity);
      }

      // Update rain if active
      if (weatherStates[currentWeather].rain) {
        raindrops.forEach(drop => {
          drop.position.y -= deltaTime * 30;
          if (drop.position.y < 0) {
            drop.position.y = 100;
          }
        });
      }
    }

    // Create initial weather
    const rain = createRaindrops();
    raindrops.push(rain);

    const snow = new THREE.Mesh(snowGeometry, snowMaterial);
    snow.position.y = 30;

    mountain.add(snow);
    mountainGroup.add(mountain);
  });

  scene.add(mountainGroup);
}

// Bulutlar
function createClouds() {
  const cloudGroup = new THREE.Group();

  for (let i = 0; i < 20; i++) {
    const cloudGeometry = new THREE.SphereGeometry(8, 8, 8);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      transparent: true,
      opacity: 0.8
    });

    const cloud = new THREE.Group();

    // Her bulut birkaç küreden oluşsun
    const numSpheres = Math.floor(Math.random() * 3) + 3;
    for (let j = 0; j < numSpheres; j++) {
      const sphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
      sphere.position.set(
        Math.random() * 10 - 5,
        Math.random() * 3,
        Math.random() * 10 - 5
      );
      sphere.scale.set(
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.3 + 0.3,
        Math.random() * 0.5 + 0.5
      );
      cloud.add(sphere);
    }

    // Rasgele pozisyonlar
    cloud.position.set(
      Math.random() * 400 - 200,
      Math.random() * 30 + 60,
      Math.random() * 400 - 200
    );

    // Buluta hareket özellikleri ekle
    cloud.userData = {
      speed: Math.random() * 0.05 + 0.02,
      direction: new THREE.Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).normalize()
    };

    cloudGroup.add(cloud);
  }

  scene.add(cloudGroup);

  // Bulutların hareket fonksiyonu
  function updateClouds(deltaTime) {
    cloudGroup.children.forEach(cloud => {
      cloud.position.x += cloud.userData.direction.x * cloud.userData.speed * deltaTime * 60;
      cloud.position.z += cloud.userData.direction.z * cloud.userData.speed * deltaTime * 60;

      // Haritanın dışına çıkınca diğer tarafa geçir
      if (cloud.position.x > 250) cloud.position.x = -250;
      if (cloud.position.x < -250) cloud.position.x = 250;
      if (cloud.position.z > 250) cloud.position.z = -250;
      if (cloud.position.z < -250) cloud.position.z = 250;

      // Hafif yükselme ve alçalma
      cloud.position.y += Math.sin(Date.now() * 0.0005 + cloud.position.x) * 0.03;
    });
  }

  return updateClouds;
}

// Kuşlar
function createBirds() {
  const birdGroup = new THREE.Group();

  for (let i = 0; i < 15; i++) {
    const bird = new THREE.Group();

    // Kuş gövdesi
    const bodyGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: Math.random() > 0.5 ? 0x333333 : 0x666666,
      roughness: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bird.add(body);

    // Kanatlar
    const wingGeometry = new THREE.PlaneGeometry(1, 0.5);
    const wingMaterial = new THREE.MeshStandardMaterial({
      color: bodyMaterial.color,
      roughness: 0.9,
      side: THREE.DoubleSide
    });

    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-0.5, 0, 0);
    leftWing.rotation.y = Math.PI / 4;
    bird.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(0.5, 0, 0);
    rightWing.rotation.y = -Math.PI / 4;
    bird.add(rightWing);

    // Kuş pozisyonu
    bird.position.set(
      Math.random() * 300 - 150,
      Math.random() * 20 + 40,
      Math.random() * 300 - 150
    );

    // Kuşa uçuş özellikleri ekle
    bird.userData = {
      speed: Math.random() * 0.2 + 0.1,
      direction: new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 0.4 - 0.2,
        Math.random() * 2 - 1
      ).normalize(),
      wingSpeed: Math.random() * 0.2 + 0.2,
      flapTime: 0,
      leftWing: leftWing,
      rightWing: rightWing
    };

    birdGroup.add(bird);
  }

  scene.add(birdGroup);

  // Kuşların hareket fonksiyonu
  function updateBirds(deltaTime) {
    birdGroup.children.forEach(bird => {
      // Kuşu hareket ettir
      bird.position.x += bird.userData.direction.x * bird.userData.speed * deltaTime * 60;
      bird.position.y += bird.userData.direction.y * bird.userData.speed * deltaTime * 60;
      bird.position.z += bird.userData.direction.z * bird.userData.speed * deltaTime * 60;

      // Sınırları kontrol et
      if (bird.position.y < 30) bird.userData.direction.y = Math.abs(bird.userData.direction.y);
      if (bird.position.y > 70) bird.userData.direction.y = -Math.abs(bird.userData.direction.y);

      // Haritanın dışına çıkınca diğer tarafa geçir
      if (bird.position.x > 200) bird.position.x = -200;
      if (bird.position.x < -200) bird.position.x = 200;
      if (bird.position.z > 200) bird.position.z = -200;
      if (bird.position.z < -200) bird.position.z = 200;

      // Uçuş yönüne göre rotasyon
      bird.lookAt(
        bird.position.x + bird.userData.direction.x,
        bird.position.y + bird.userData.direction.y,
        bird.position.z + bird.userData.direction.z
      );

      // Kanat çırpma animasyonu
      bird.userData.flapTime += deltaTime * bird.userData.wingSpeed * 10;
      const flapAngle = Math.sin(bird.userData.flapTime) * Math.PI / 4;

      bird.userData.leftWing.rotation.y = Math.PI / 4 + flapAngle;
      bird.userData.rightWing.rotation.y = -Math.PI / 4 - flapAngle;
    });
  }

  return updateBirds;
}

// Köpekler
function createDogs() {
  const dogGroup = new THREE.Group();

  for (let i = 0; i < 8; i++) {
    const dog = new THREE.Group();

    // Temel renk
    const dogColors = [0x8B4513, 0xD2B48C, 0x808080, 0x000000, 0xFFFACD];
    const dogColor = dogColors[Math.floor(Math.random() * dogColors.length)];

    // Gövde
    const bodyGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: dogColor,
      roughness: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.35;
    dog.add(body);

    // Baş
    const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: dogColor,
      roughness: 0.9
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.5, 0.5);
    dog.add(head);

    // Burun
    const noseGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.2);
    const noseMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.9
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0.45, 0.75);
    dog.add(nose);

    // Kuyruk
    const tailGeometry = new THREE.CylinderGeometry(0.05, 0.1, 0.4, 8);
    const tailMaterial = new THREE.MeshStandardMaterial({
      color: dogColor,
      roughness: 0.9
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0.45, -0.5);
    tail.rotation.x = -Math.PI / 4;
    dog.add(tail);

    // Bacaklar
    const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: dogColor,
      roughness: 0.9
    });

    const legPositions = [
      [-0.2, 0, 0.3],  // Sol ön
      [0.2, 0, 0.3],   // Sağ ön
      [-0.2, 0, -0.3], // Sol arka
      [0.2, 0, -0.3]   // Sağ arka
    ];

    const legs = [];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.position.y = 0.15;
      dog.add(leg);
      legs.push(leg);
    });

    // Köpeği park alanlarına yerleştir
    let isValidPosition = false;
    let x, z;

    while (!isValidPosition) {
      x = (Math.floor(Math.random() * 5) - 2) * 40 + (Math.random() * 30 - 15);
      z = (Math.floor(Math.random() * 5) - 2) * 40 + (Math.random() * 30 - 15);

      // Yollardan uzak tut
      const nearestHorizontalRoad = Math.round(z / 40) * 40;
      const nearestVerticalRoad = Math.round(x / 40) * 40;

      if (Math.abs(z - nearestHorizontalRoad) > 10 && Math.abs(x - nearestVerticalRoad) > 10) {
        isValidPosition = true;
      }
    }

    dog.position.set(x, 0.8, z);
    dog.rotation.y = Math.random() * Math.PI * 2;

    // Köpeğe hareket özellikleri ekle
    dog.userData = {
      speed: Math.random() * 0.05 + 0.02,
      direction: new THREE.Vector3(
        Math.sin(dog.rotation.y),
        0,
        Math.cos(dog.rotation.y)
      ),
      walkTime: 0,
      legs: legs,
      tail: tail,
      stopTime: 0,
      isMoving: true
    };

    dogGroup.add(dog);
  }

  scene.add(dogGroup);

  // Köpeklerin hareket fonksiyonu
  function updateDogs(deltaTime) {
    dogGroup.children.forEach(dog => {
      // Hareket durumunu güncelle
      if (dog.userData.isMoving) {
        // Köpeği hareket ettir
        dog.position.x += dog.userData.direction.x * dog.userData.speed * deltaTime * 60;
        dog.position.z += dog.userData.direction.z * dog.userData.speed * deltaTime * 60;

        // Yürüyüş animasyonu
        dog.userData.walkTime += deltaTime * 5;
        const walkCycle = Math.sin(dog.userData.walkTime * 2);

        dog.userData.legs.forEach((leg, index) => {
          // Çapraz bacakları zıt fazda hareket ettir
          const offset = index === 0 || index === 3 ? 0 : Math.PI;
          leg.position.y = 0.15 + Math.abs(Math.sin(dog.userData.walkTime * 2 + offset)) * 0.05;
        });

        // Kuyruk sallanması
        dog.userData.tail.rotation.z = Math.sin(dog.userData.walkTime) * 0.5;

        // Binalara çarpışma kontrolü
        city.buildings.children.forEach(building => {
          const buildingBox = new THREE.Box3().setFromObject(building);
          const dogBox = new THREE.Box3().setFromObject(dog);

          if (dogBox.intersectsBox(buildingBox)) {
            // Yeni rasgele yön seç
            const newAngle = Math.random() * Math.PI * 2;
            dog.rotation.y = newAngle;
            dog.userData.direction.x = Math.sin(newAngle);
            dog.userData.direction.z = Math.cos(newAngle);

            // Çarpışmadan kurtul
            dog.position.x -= dog.userData.direction.x * 2;
            dog.position.z -= dog.userData.direction.z * 2;

            // Rasgele durma kararı
            if (Math.random() > 0.7) {
              dog.userData.isMoving = false;
              dog.userData.stopTime = Math.random() * 3 + 1; // 1-4 saniye durma
            }
          }
        });

        // Haritanın dışına çıktıysa geri getir
        if (dog.position.x > 100 || dog.position.x < -100 ||
          dog.position.z > 100 || dog.position.z < -100) {
          dog.position.x = Math.sign(dog.position.x) * 95;
          dog.position.z = Math.sign(dog.position.z) * 95;
          // Şehir merkezine dön
          dog.rotation.y = Math.atan2(-dog.position.x, -dog.position.z);
          dog.userData.direction.x = Math.sin(dog.rotation.y);
          dog.userData.direction.z = Math.cos(dog.rotation.y);
        }

        // Rasgele duraksamalar
        if (Math.random() > 0.995) {
          dog.userData.isMoving = false;
          dog.userData.stopTime = Math.random() * 3 + 1; // 1-4 saniye durma
        }
      } else {
        // Durma zamanını güncelle
        dog.userData.stopTime -= deltaTime;

        // Durmayı sonlandır
        if (dog.userData.stopTime <= 0) {
          dog.userData.isMoving = true;

          // Rasgele yeni yön
          const newAngle = Math.random() * Math.PI * 2;
          dog.rotation.y = newAngle;
          dog.userData.direction.x = Math.sin(newAngle);
          dog.userData.direction.z = Math.cos(newAngle);
        }
      }
    });
  }

  return updateDogs;
}

// Çevre unsurlarını ekle
createMountains();
const updateClouds = createClouds();
const updateBirds = createBirds();
const updateDogs = createDogs();

// Kamera oluştur
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Graphics quality settings
const graphicsSettings = {
  low: {
    shadowMapSize: 1024,
    drawDistance: 200,
    maxParticles: 100,
    antialiasing: false
  },
  medium: {
    shadowMapSize: 2048,
    drawDistance: 300,
    maxParticles: 500,
    antialiasing: true
  },
  high: {
    shadowMapSize: 4096,
    drawDistance: 500,
    maxParticles: 1000,
    antialiasing: true
  }
};

let currentQuality = 'medium';

const renderer = new THREE.WebGLRenderer({
  antialias: graphicsSettings[currentQuality].antialiasing,
  powerPreference: "high-performance"
});

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('game-container').appendChild(renderer.domElement);

// Işık ekle
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Şehir nesnelerini tutacak gruplar
const city = {
  buildings: new THREE.Group(),
  roads: new THREE.Group(),
  trafficLights: new THREE.Group(),
  parks: new THREE.Group(),
  vehicles: new THREE.Group(),
  pedestrians: new THREE.Group()
};

// Sahneye ekle
Object.values(city).forEach(group => scene.add(group));

// Zemin oluştur
const groundGeometry = new THREE.PlaneGeometry(500, 500);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x3a913a,
  roughness: 0.8,
  metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Yol ağı oluştur
function createRoads() {
  // Yatay yollar
  for (let i = -80; i <= 80; i += 40) {
    const roadGeometry = new THREE.PlaneGeometry(200, 10);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.1, i);
    city.roads.add(road);

    // Kesikli yol çizgileri
    for (let j = -100; j < 100; j += 4) {
      const lineGeometry = new THREE.PlaneGeometry(2, 0.5);
      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(j, 0.11, i);
      city.roads.add(line);
    }
  }

  // Dikey yollar
  for (let i = -80; i <= 80; i += 40) {
    const roadGeometry = new THREE.PlaneGeometry(10, 200);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(i, 0.1, 0);
    city.roads.add(road);

    // Kesikli yol çizgileri
    for (let j = -100; j < 100; j += 4) {
      const lineGeometry = new THREE.PlaneGeometry(0.5, 2);
      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(i, 0.11, j);
      city.roads.add(line);
    }
  }
}

// Binaları oluştur
function createBuildings() {
  const buildingColors = [0x8c8c8c, 0xa5a5a5, 0x757575, 0x6b6b6b, 0x595959];

  // Her yol bloğu için binalar oluştur
  for (let x = -100; x < 100; x += 20) {
    for (let z = -100; z < 100; z += 20) {
      // Yollar üzerinde bina oluşturma
      if (Math.abs(x) % 40 < 10 || Math.abs(z) % 40 < 10) continue;

      // Rastgele bina kararı
      if (Math.random() > 0.3) {
        const height = Math.random() * 15 + 5;
        const width = Math.random() * 4 + 6;
        const depth = Math.random() * 4 + 6;

        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({
          color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
          roughness: 0.7,
          metalness: 0.2
        });

        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(
          x + (Math.random() * 6 - 3),
          height / 2,
          z + (Math.random() * 6 - 3)
        );
        building.castShadow = true;
        building.receiveShadow = true;
        city.buildings.add(building);
      } else if (Math.random() > 0.5) {
        // Park alanları oluştur
        const parkGeometry = new THREE.PlaneGeometry(15, 15);
        const parkMaterial = new THREE.MeshStandardMaterial({
          color: 0x2d9e2d,
          roughness: 0.9
        });
        const park = new THREE.Mesh(parkGeometry, parkMaterial);
        park.rotation.x = -Math.PI / 2;
        park.position.set(x, 0.11, z);
        city.parks.add(park);

        // Ağaçlar ekle
        for (let i = 0; i < 5; i++) {
          const treeHeight = Math.random() * 2 + 2;

          // Ağaç gövdesi
          const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, treeHeight, 8);
          const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
          const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

          // Ağaç yaprakları
          const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);
          const leavesMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5f2d,
            roughness: 1.0
          });
          const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
          leaves.position.y = treeHeight / 2 + 1;

          const tree = new THREE.Group();
          tree.add(trunk);
          tree.add(leaves);
          tree.position.set(
            x + (Math.random() * 10 - 5),
            treeHeight / 2,
            z + (Math.random() * 10 - 5)
          );
          tree.castShadow = true;
          city.parks.add(tree);
        }
      }
    }
  }
}

// Trafik ışıkları oluştur
function createTrafficLights() {
  const intersections = [];

  // Kavşakları bul
  for (let x = -80; x <= 80; x += 40) {
    for (let z = -80; z <= 80; z += 40) {
      intersections.push({ x, z });
    }
  }

  // Her kavşak için trafik ışığı oluştur
  intersections.forEach(intersection => {
    const { x, z } = intersection;

    // Trafik ışık grubunu oluştur
    const trafficLightGroup = new THREE.Group();

    // Her yön için trafik lambası - dış tarafa dönük
    const directions = [
      { x: -5, z: 0, rot: -Math.PI / 2, group: 'eastWest' },  // Doğu yönü (dışa bakıyor)
      { x: 5, z: 0, rot: Math.PI / 2, group: 'eastWest' },    // Batı yönü (dışa bakıyor)
      { x: 0, z: -5, rot: Math.PI, group: 'northSouth' },   // Kuzey yönü (dışa bakıyor)
      { x: 0, z: 5, rot: 0, group: 'northSouth' }           // Güney yönü (dışa bakıyor)
    ];

    directions.forEach(dir => {
      // Trafik ışığı kutusu (havada asılı)
      const boxGeometry = new THREE.BoxGeometry(1, 2, 0.5);
      const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.set(dir.x, 5.5, dir.z);
      box.rotation.y = dir.rot;

      // Işıklar - dışa dönük
      const redLight = createLight(0xff0000, 0.3);
      redLight.position.set(0, 0.6, 0.26);

      const yellowLight = createLight(0xffff00, 0.3);
      yellowLight.position.set(0, 0, 0.26);

      const greenLight = createLight(0x00ff00, 0.3);
      greenLight.position.set(0, -0.6, 0.26);

      box.add(redLight);
      box.add(yellowLight);
      box.add(greenLight);

      trafficLightGroup.add(box);

      // Başlangıç durumu - eastWest kırmızı, northSouth yeşil
      const initialState = dir.group === 'eastWest' ? 'red' : 'green';

      // Işıkların başlangıç opaklığını ayarla
      redLight.material.opacity = initialState === 'red' ? 0.7 : 0.2;
      yellowLight.material.opacity = 0.2;
      greenLight.material.opacity = initialState === 'green' ? 0.7 : 0.2;

      // Her trafik yönü için durum ve özellikler
      box.userData = {
        lights: { red: redLight, yellow: yellowLight, green: greenLight },
        state: initialState,
        timer: dir.group === 'eastWest' ? 10 : 0, // Kuzey-Güney başlangıçta yeşil
        direction: dir,
        group: dir.group  // Yön grubu bilgisi
      };
    });

    trafficLightGroup.position.set(x, 0, z);

    // Create cables between traffic lights
    const cableGeometry = new THREE.CylinderGeometry(0.05, 0.05, 10, 8);
    const cableMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.7,
      metalness: 0.3
    });

    // Add horizontal and vertical cables
    const horizontalCable = new THREE.Mesh(cableGeometry, cableMaterial);
    horizontalCable.position.set(0, 5.5, 0);
    horizontalCable.rotation.z = Math.PI / 2;
    trafficLightGroup.add(horizontalCable);

    const verticalCable = new THREE.Mesh(cableGeometry, cableMaterial);
    verticalCable.position.set(0, 5.5, 0);
    verticalCable.rotation.x = Math.PI / 2;
    trafficLightGroup.add(verticalCable);

    // Trafik ışığı grubuna intersection bilgisini ekle
    trafficLightGroup.userData = {
      intersection: { x, z },
      lights: trafficLightGroup.children.filter(child => child.userData && child.userData.lights)
    };

    city.trafficLights.add(trafficLightGroup);
  });
}

// Işık oluşturma yardımcı fonksiyonu
function createLight(color, radius) {
  const geometry = new THREE.CircleGeometry(radius, 16);
  const material = new THREE.MeshBasicMaterial({
    color: color,
    opacity: 0.7,
    transparent: true
  });
  return new THREE.Mesh(geometry, material);
}

// Trafik ışıklarını güncelle
function updateTrafficLights(deltaTime) {
  city.trafficLights.children.forEach(trafficLightGroup => {
    // Her kavşakta aynı yöndeki ışıkları senkronize et
    const lights = trafficLightGroup.children.filter(child => child.userData && child.userData.lights);

    // Doğu-Batı ve Kuzey-Güney yönlerini gruplar halinde yönet
    const eastWestLights = lights.filter(light => light.userData.group === 'eastWest');
    const northSouthLights = lights.filter(light => light.userData.group === 'northSouth');

    // İlk ışığı referans al
    if (eastWestLights.length > 0 && northSouthLights.length > 0) {
      const ewLight = eastWestLights[0];

      // Sadece bir zamanlayıcı kullan (Doğu-Batı ışıkları için)
      ewLight.userData.timer -= deltaTime;

      if (ewLight.userData.timer <= 0) {
        // Işık durumuna göre geçiş yap
        if (ewLight.userData.state === 'red') {
          // Doğu-Batı kırmızıdan sarıya geçer
          eastWestLights.forEach(light => {
            light.userData.lights.red.material.opacity = 0.7;
            light.userData.lights.yellow.material.opacity = 0.7;
            light.userData.state = 'yellow_before_green';
          });

          // Kuzey-Güney yeşilden sarıya geçer
          northSouthLights.forEach(light => {
            light.userData.lights.green.material.opacity = 0.2;
            light.userData.lights.yellow.material.opacity = 0.7;
            light.userData.state = 'yellow_before_red';
          });

          ewLight.userData.timer = 3; // Sarı ışık süresi
        }
        else if (ewLight.userData.state === 'yellow_before_green') {
          // Doğu-Batı sarıdan yeşile
          eastWestLights.forEach(light => {
            light.userData.lights.red.material.opacity = 0.2;
            light.userData.lights.yellow.material.opacity = 0.2;
            light.userData.lights.green.material.opacity = 0.7;
            light.userData.state = 'green';
          });

          // Kuzey-Güney sarıdan kırmızıya
          northSouthLights.forEach(light => {
            light.userData.lights.yellow.material.opacity = 0.2;
            light.userData.lights.red.material.opacity = 0.7;
            light.userData.state = 'red';
          });

          ewLight.userData.timer = 10; // Yeşil ışık süresi
        }
        else if (ewLight.userData.state === 'green') {
          // Doğu-Batı yeşilden sarıya
          eastWestLights.forEach(light => {
            light.userData.lights.green.material.opacity = 0.2;
            light.userData.lights.yellow.material.opacity = 0.7;
            light.userData.state = 'yellow_before_red';
          });

          ewLight.userData.timer = 3; // Sarı ışık süresi
        }
        else if (ewLight.userData.state === 'yellow_before_red') {
          // Doğu-Batı sarıdan kırmızıya
          eastWestLights.forEach(light => {
            light.userData.lights.yellow.material.opacity = 0.2;
            light.userData.lights.red.material.opacity = 0.7;
            light.userData.state = 'red';
          });

          // Kuzey-Güney kırmızıdan sarıya
          northSouthLights.forEach(light => {
            light.userData.lights.red.material.opacity = 0.7;
            light.userData.lights.yellow.material.opacity = 0.7;
            light.userData.state = 'yellow_before_green';
          });

          ewLight.userData.timer = 3; // Sarı ışık süresi
        }
        else if (northSouthLights[0].userData.state === 'yellow_before_green') {
          // Kuzey-Güney sarıdan yeşile
          northSouthLights.forEach(light => {
            light.userData.lights.red.material.opacity = 0.2;
            light.userData.lights.yellow.material.opacity = 0.2;
            light.userData.lights.green.material.opacity = 0.7;
            light.userData.state = 'green';
          });

          ewLight.userData.timer = 10; // Yeşil ışık süresi
        }
      }
    }
  });
}

// Diğer araçları oluştur
function createVehicles() {
  const vehicleColors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0x00ffff, 0xff00ff, 0xffffff, 0x000000];
  const vehicleTypes = ['car', 'truck', 'van'];

  for (let i = 0; i < 20; i++) {
    const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const vehicle = createVehicle(vehicleType, vehicleColors[Math.floor(Math.random() * vehicleColors.length)]);

    // Aracı yola yerleştir
    let x, z, rotation;

    // Yatay veya dikey yolda olacağını belirle
    if (Math.random() > 0.5) {
      // Yatay yolda, sağ şeritte
      z = (Math.floor(Math.random() * 5) - 2) * 40 + 2;
      x = Math.random() * 180 - 90;
      rotation = Math.random() > 0.5 ? 0 : Math.PI;
    } else {
      // Dikey yolda, sağ şeritte
      x = (Math.floor(Math.random() * 5) - 2) * 40 + 2;
      z = Math.random() * 180 - 90;
      rotation = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
    }

    vehicle.position.set(x, 0.6, z);
    vehicle.rotation.y = rotation;

    // Araca hareket özellikleri ekle
    vehicle.userData = {
      speed: Math.random() * 0.1 + 0.05,
      direction: new THREE.Vector3(
        Math.sin(rotation),
        0,
        Math.cos(rotation)
      ),
      type: vehicleType
    };

    city.vehicles.add(vehicle);
  }
}

// Araç modeli oluştur
function createVehicle(type, color) {
  const vehicle = new THREE.Group();

  let width, height, length;

  switch (type) {
    case 'truck':
      width = 2.2;
      height = 2.2;
      length = 5;
      break;
    case 'van':
      width = 2;
      height = 2;
      length = 3.5;
      break;
    case 'car':
    default:
      width = 1.8;
      height = 1.2;
      length = 4;
  }

  // Araç gövdesi
  const bodyGeometry = new THREE.BoxGeometry(width, height, length);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.5,
    metalness: 0.7
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = height / 2;
  vehicle.add(body);


  // Tekerlekler
  const wheelPositions = [
    [-width / 2 - 0.2, 0.4, length / 3 - 0.3], // sol ön
    [width / 2 + 0.2, 0.4, length / 3 - 0.3],  // sağ ön
    [-width / 2 - 0.2, 0.4, -length / 3 + 0.3], // sol arka
    [width / 2 + 0.2, 0.4, -length / 3 + 0.3]   // sağ arka
  ];

  const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
  wheelPositions.forEach(position => {
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...position);
    vehicle.add(wheel);

    // Add rim
    const rimGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.42, 16);
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(...position);
    vehicle.add(rim);
  });

  // Farlar (her zaman açık)
  const lightPositions = [
    [-width / 2 + 0.3, 0, length / 2 + 0.1], // sol far
    [width / 2 - 0.3, 0, length / 2 + 0.1]   // sağ far
  ];

  lightPositions.forEach(position => {
    const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc, opacity: 1.0 }); //Opacity set to 1.0 to make lights always on
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.set(...position);
    vehicle.add(light);
  });

  return vehicle;
}

// Diğer araçları hareket ettir
function updateVehicles(deltaTime) {
  city.vehicles.children.forEach(vehicle => {
    const { speed, direction } = vehicle.userData;

    // Check for nearby vehicles and prevent overlap
    const nearbyVehicles = city.vehicles.children.filter(otherVehicle => {
      if (otherVehicle === vehicle) return false;
      const distance = vehicle.position.distanceTo(otherVehicle.position);
      return distance < 3; // 3 units collision check radius
    });

    // Avoid collisions
    if (nearbyVehicles.length > 0) {
      const nearestVehicle = nearbyVehicles[0];
      const distance = vehicle.position.distanceTo(nearestVehicle.position);

      if (distance < 2) {
        // Prevent overlap: Apply pushing away if too close
        const pushBackDistance = 0.5; // Distance to push back
        const pushDirection = new THREE.Vector3().subVectors(vehicle.position, nearestVehicle.position).normalize();
        vehicle.position.add(pushDirection.multiplyScalar(pushBackDistance));
      }
    }

    // Move the vehicle if not paused
    if (!vehicle.userData.isPaused) {
      vehicle.position.x += direction.x * speed * deltaTime * 60;
      vehicle.position.z += direction.z * speed * deltaTime * 60;
    }

    // Wrap around the map
    if (vehicle.position.x > 100) vehicle.position.x = -100;
    if (vehicle.position.x < -100) vehicle.position.x = 100;
    if (vehicle.position.z > 100) vehicle.position.z = -100;
    if (vehicle.position.z < -100) vehicle.position.z = 100;

    // Check traffic lights (existing code)
    checkTrafficLights(vehicle);
  });
}

// Trafik ışıklarını kontrol et
function checkTrafficLights(vehicle) {
  city.trafficLights.children.forEach(light => {
    const intersection = light.userData.intersection;
    const state = light.userData.state;
    const dirX = Math.abs(vehicle.userData.direction.x) > 0.5;
    const dirZ = Math.abs(vehicle.userData.direction.z) > 0.5;

    // Kavşağa yakınlık kontrol et
    const distX = Math.abs(vehicle.position.x - intersection.x);
    const distZ = Math.abs(vehicle.position.z - intersection.z);

    // Aracın yönüne göre trafik ışığını kontrol et
    if (distX < 5 && distZ < 5) {
      if ((dirX && state === 'red') || (dirZ && state === 'red') || (dirX && state === 'yellow') || (dirZ && state === 'yellow')) {
        // Kırmızı veya sarı ışıkta yavaşla ve dur
        vehicle.userData.originalSpeed = vehicle.userData.originalSpeed || vehicle.userData.speed;
        vehicle.userData.speed = 0;
      } else if (vehicle.userData.originalSpeed) {
        // Yeşil ışıkta devam et
        vehicle.userData.speed = vehicle.userData.originalSpeed;
        vehicle.userData.originalSpeed = null;
      }
    }
  });
}

// Yayaları oluştur
function createPedestrians() {
  for (let i = 0; i < 30; i++) {
    const pedestrian = createPedestrian();

    // Yayayı rastgele bir konuma yerleştir (yollarda veya çimenlik alanlarda)
    let x, z, rotation;
    if (Math.random() > 0.3) {
      // Rastgele çimenlik alanlarda
      x = Math.random() * 180 - 90;
      z = Math.random() * 180 - 90;

      // Yollardan uzak tut
      const nearestHorizontalRoad = Math.round(z / 40) * 40;
      const nearestVerticalRoad = Math.round(x / 40) * 40;

      // Eğer yola çok yakınsa, uzaklaştır
      if (Math.abs(z - nearestHorizontalRoad) < 10) {
        z = nearestHorizontalRoad + (Math.random() > 0.5 ? 12 : -12);
      }

      if (Math.abs(x - nearestVerticalRoad) < 10) {
        x = nearestVerticalRoad + (Math.random() > 0.5 ? 12 : -12);
      }

      rotation = Math.random() * Math.PI * 2; // Rastgele yön
    } else {
      // Kaldırımlarda
      if (Math.random() > 0.5) {
        // Yatay kaldırımlarda
        z = (Math.floor(Math.random() * 5) - 2) * 40 + (Math.random() > 0.5 ? 6 : -6);
        x = Math.random() * 180 - 90;
        rotation = Math.random() > 0.5 ? 0 : Math.PI;
      } else {
        // Dikey kaldırımlarda
        x = (Math.floor(Math.random() * 5) - 2) * 40 + (Math.random() > 0.5 ? 6 : -6);
        z = Math.random() * 180 - 90;
        rotation = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
      }
    }

    pedestrian.position.set(x, 1, z);
    pedestrian.rotation.y = rotation;

    // Yayaya hareket özellikleri ekle
    pedestrian.userData = {
      speed: Math.random() * 0.03 + 0.01,
      direction: new THREE.Vector3(
        Math.sin(rotation),
        0,
        Math.cos(rotation)
      ),
      animationTime: 0,
      walkCycle: 0
    };

    city.pedestrians.add(pedestrian);
  }
}

// Yaya modeli oluştur
function createPedestrian() {
  const pedestrian = new THREE.Group();

  // Rastgele kıyafet rengi
  const clothColors = [0x3366ff, 0xff6633, 0x33ff66, 0xff33cc, 0x663399];
  const clothColor = clothColors[Math.floor(Math.random() * clothColors.length)];

  // Vücut
  const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: clothColor });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.5;
  pedestrian.add(body);

  // Kafa
  const headGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.2;
  pedestrian.add(head);

  // Bacaklar
  const legGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.8, 8);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x000099 });

  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.1, -0.4, 0);
  pedestrian.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.1, -0.4, 0);
  pedestrian.add(rightLeg);

  // Kollar
  const armGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.7, 8);
  const armMaterial = new THREE.MeshStandardMaterial({ color: clothColor });

  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.3, 0.5, 0);
  leftArm.rotation.z = Math.PI / 6;
  pedestrian.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.3, 0.5, 0);
  rightArm.rotation.z = -Math.PI / 6;
  pedestrian.add(rightArm);

  // Yürüme animasyonu için referans
  pedestrian.userData = {
    leftLeg: leftLeg,
    rightLeg: rightLeg,
    leftArm: leftArm,
    rightArm: rightArm
  };

  return pedestrian;
}

// Yayaları hareket ettir
function updatePedestrians(deltaTime) {
  city.pedestrians.children.forEach(pedestrian => {
    const { speed, direction, animationTime, leftLeg, rightLeg, leftArm, rightArm } = pedestrian.userData;

    // Ensure pedestrian and userData are defined
    if (!pedestrian || !pedestrian.userData) {
      console.warn('Pedestrian or userData is undefined:', pedestrian);
      return; // Skip this iteration
    }

    // Yayayı hareket ettir
    pedestrian.position.x += direction.x * speed * deltaTime * 60;
    pedestrian.position.z += direction.z * speed * deltaTime * 60;

    // Haritanın dışına çıktıysa karşı tarafa geçir
    if (pedestrian.position.x > 100) pedestrian.position.x = -100;
    if (pedestrian.position.x < -100) pedestrian.position.x = 100;
    if (pedestrian.position.z > 100) pedestrian.position.z = -100;
    if (pedestrian.position.z < -100) pedestrian.position.z = 100;

    // Yürüyüş animasyonu
    pedestrian.userData.animationTime += deltaTime * speed * 30;
    const walkCycle = Math.sin(pedestrian.userData.animationTime);

    // Ensure leg and arm properties exist before accessing them
    if (leftLeg) leftLeg.rotation.x = walkCycle * 0.5;
    if (rightLeg) rightLeg.rotation.x = -walkCycle * 0.5;
    if (leftArm) leftArm.rotation.x = -walkCycle * 0.5;
    if (rightArm) rightArm.rotation.x = walkCycle * 0.5;

    // Trafik ışıklarını kontrol et
    checkPedestrianTrafficLights(pedestrian);
  });
}

// Yayalar için trafik ışıklarını kontrol et
function checkPedestrianTrafficLights(pedestrian) {
  city.trafficLights.children.forEach(light => {
    const intersection = light.userData.intersection;
    const state = light.userData.state;

    // Kavşağa yakınlık kontrol et
    const distX = Math.abs(pedestrian.position.x - intersection.x);
    const distZ = Math.abs(pedestrian.position.z - intersection.z);

    if (distX < 5 && distZ < 5) {
      if (state === 'green') {
        // Yeşil ışıkta yayalar durur (yaya ışığı kırmızıdır)
        pedestrian.userData.originalSpeed = pedestrian.userData.originalSpeed || pedestrian.userData.speed;
        pedestrian.userData.speed = 0;
      } else if (pedestrian.userData.originalSpeed) {
        // Kırmızı ışıkta yayalar geçer (yaya ışığı yeşildir)
        pedestrian.userData.speed = pedestrian.userData.originalSpeed;
        pedestrian.userData.originalSpeed = null;
      }
    }
  });
}

// Oyuncu aracını oluştur
const playerCar = new THREE.Group();
function createPlayerCar() {
  // Araba gövdesi
  const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 0.5,
    metalness: 0.7
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.8;
  playerCar.add(body);

  // Araba üstü (çatı)
  const roofGeometry = new THREE.BoxGeometry(1.8, 0.7, 2);
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0xbb0000,
    roughness: 0.5,
    metalness: 0.7
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.set(0, 1.6, -0.3);
  playerCar.add(roof);


  // Tekerlekler
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 16);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

  const wheelPositions = [
    [-1.1, 0.4, 1.3], // sol ön
    [1.1, 0.4, 1.3],  // sağ ön
    [-1.1, 0.4, -1.3], // sol arka
    [1.1, 0.4, -1.3]   // sağ arka
  ];

  const wheels = [];
  wheelPositions.forEach(position => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...position);
    wheels.push(wheel);
    playerCar.add(wheel);
  });

  // Farlar
  const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc, opacity: 1.0 }); // Farlar her zaman açık

  const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
  leftLight.position.set(-0.7, 0.8, 2.1);
  playerCar.add(leftLight);

  const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
  rightLight.position.set(0.7, 0.8, 2.1);
  playerCar.add(rightLight);

  // Spot ışıkları
  const spotLight1 = new THREE.SpotLight(0xffffcc, 1);
  spotLight1.position.set(-0.7, 0.8, 2.1);
  spotLight1.angle = Math.PI / 6;
  spotLight1.penumbra = 0.2;
  spotLight1.distance = 20;
  spotLight1.castShadow = true;
  spotLight1.target.position.set(-1, 0, 5);
  playerCar.add(spotLight1);
  playerCar.add(spotLight1.target);

  const spotLight2 = new THREE.SpotLight(0xffffcc, 1);
  spotLight2.position.set(0.7, 0.8, 2.1);
  spotLight2.angle = Math.PI / 6;
  spotLight2.penumbra = 0.2;
  spotLight2.distance = 20;
  spotLight2.castShadow = true;
  spotLight2.target.position.set(1, 0, 5);
  playerCar.add(spotLight2);
  playerCar.add(spotLight2.target);

  // Arka stop lambaları
  const tailLightGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.1);
  const tailLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: new THREE.Color(0x330000),
    emissiveIntensity: 0.2
  });

  const leftTailLight = new THREE.Mesh(tailLightGeometry, tailLightMaterial);
  leftTailLight.name = 'leftTailLight';
  leftTailLight.position.set(-0.7, 0.8, -2.1);
  playerCar.add(leftTailLight);

  const rightTailLight = new THREE.Mesh(tailLightGeometry, tailLightMaterial);
  rightTailLight.name = 'rightTailLight';
  rightTailLight.position.set(0.7, 0.8, -2.1);
  playerCar.add(rightTailLight);

  // Oyuncu aracı özellikleri
  playerCar.userData = {
    speed: 0,
    maxSpeed: 0.67,
    turboSpeed: 1.0,
    acceleration: 0.005,
    braking: 0.01,
    handling: 0.03,
    isTurbo: false,
    wheels: wheels,
    currentRotation: 0,
    damage: 0,
    maxDamage: 100
  };

  // Şehir dışında spawn ol
  playerCar.position.set(-120, 0.8, -120);
  playerCar.rotation.y = Math.PI / 4; // 45 derece açıyla şehre doğru bak
  playerCar.castShadow = true;
  scene.add(playerCar);
}

// Kontrol tuşları
const controls = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  brake: false,
  turbo: false,
  viewMode: 'third-person' // 'third-person', 'first-person', 'top-down', 'free'
};

// Mouse olayları
document.addEventListener('mousedown', e => {
  if (controls.viewMode === 'free') {
    currentCamera.userData.isDragging = true;
    currentCamera.userData.lastMouseX = e.clientX;
    currentCamera.userData.lastMouseY = e.clientY;
  }
});

document.addEventListener('mouseup', () => {
  if (controls.viewMode === 'free') {
    currentCamera.userData.isDragging = false;
  }
});

document.addEventListener('mousemove', e => {
  if (controls.viewMode === 'free' && currentCamera.userData.isDragging) {
    currentCamera.userData.mouseDeltaX = e.clientX - currentCamera.userData.lastMouseX;
    currentCamera.userData.mouseDeltaY = e.clientY - currentCamera.userData.lastMouseY;
    currentCamera.userData.lastMouseX = e.clientX;
    currentCamera.userData.lastMouseY = e.clientY;
  }
});

// Tuş olayları
document.addEventListener('keydown', e => {
  switch (e.key.toLowerCase()) {
    case 'w':
    case 'arrowup':
      controls.forward = true;
      break;
    case 's':
    case 'arrowdown':
      controls.backward = true;
      break;
    case 'a':
    case 'arrowleft':
      controls.left = true;
      break;
    case 'd':
    case 'arrowright':
      controls.right = true;
      break;
    case ' ': // boşluk
      controls.brake = true;
      break;
    case 'c': // Kamera modu değiştir (C tuşu)
      switchCameraView();
      break;
    case 'r': // Reset tuşu
      resetPlayer();
      break;
    case 'shift': // Turbo tuşu
      controls.turbo = true;
      break;
    // case 'e': // Araçtan inme/binme (E tuşu) - Removed
    //   toggleFPVMode();
    //   break;
  }
});

document.addEventListener('keyup', e => {
  switch (e.key.toLowerCase()) {
    case 'w':
    case 'arrowup':
      controls.forward = false;
      break;
    case 's':
    case 'arrowdown':
      controls.backward = false;
      break;
    case 'a':
    case 'arrowleft':
      controls.left = false;
      break;
    case 'd':
    case 'arrowright':
      controls.right = false;
      break;
    case ' ': // boşluk      
      controls.brake = false;
      break;
    case 'shift': // Turbo tuşu
      controls.turbo = false;
      break;
  }
});

// Kamera görüş modunu değiştir
function switchCameraView() {
  const viewModes = ['third-person', 'first-person', 'top-down', 'free'];
  const currentIndex = viewModes.indexOf(controls.viewMode);
  controls.viewMode = viewModes[(currentIndex + 1) % viewModes.length];
}

let isFPVMode = false;
let fPVCamera;

// Store the original camera reference
let currentCamera = camera;
const originalCamera = camera;

// function toggleFPVMode() { // Removed
//   isFPVMode = !isFPVMode;
//   if (isFPVMode) {
//     // FPS kamerasını oluştur
//     fPVCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     currentCamera = fPVCamera;
//     // Kamerayı oyuncu aracının içine yerleştir
//     fPVCamera.position.set(0, 1.5, 0);
//     fPVCamera.rotation.x = 0; // Kameranın yatay konumlandırmasını ayarla
//     fPVCamera.rotation.y = playerCar.rotation.y; // Kamerayı araca yönlendir
//     playerCar.add(fPVCamera);
//     controls.viewMode = 'first-person'; // Birinci şahıs görünümüne geç
//   } else {
//     // Üçüncü şahıs kamerasına geri dön
//     currentCamera = originalCamera;
//     playerCar.remove(fPVCamera);
//     fPVCamera = null; // FPS kamerasını temizle
//   }
// }


// Oyuncu aracını güncelle
function updatePlayerCar(deltaTime) {
  const car = playerCar;
  const userData = car.userData;

  // Hızlanma ve yavaşlama
  const currentMaxSpeed = controls.turbo ? userData.turboSpeed : userData.maxSpeed;
  if (controls.turbo) {
    userData.speed += userData.acceleration * 3 * deltaTime * 60;
    if (userData.speed > currentMaxSpeed) {
      userData.speed = currentMaxSpeed;
    }
  } else if (controls.forward) {
    userData.speed += userData.acceleration * deltaTime * 60;
    if (userData.speed > currentMaxSpeed) {
      userData.speed = currentMaxSpeed;
    }
  } else if (controls.backward) {
    userData.speed -= userData.acceleration * deltaTime * 60;
    if (userData.speed < -userData.maxSpeed / 2) {
      userData.speed = -userData.maxSpeed / 2;
    }
  } else {
    // Otomatik yavaşlama
    if (userData.speed > 0) {
      userData.speed -= userData.acceleration / 2 * deltaTime * 60;
      if (userData.speed < 0) userData.speed = 0;
    } else if (userData.speed < 0) {
      userData.speed += userData.acceleration / 2 * deltaTime * 60;
      if (userData.speed > 0) userData.speed = 0;
    }
  }

  // Frenleme
  if (controls.brake) {
    // Tam durdurma mekanizması - yön tuşları ile hareketi izin ver
    if (controls.forward || controls.backward) {
      // Yön tuşları basılıysa, yavaşla ama hareket etmeye devam et
      if (userData.speed > 0) {
        userData.speed -= userData.braking * deltaTime * 30; // Yavaşla ama durma
      } else if (userData.speed < 0) {
        userData.speed += userData.braking * deltaTime * 30; // Yavaşla ama durma
      }
    } else {
      // Yön tuşları basılı değilse, tamamen dur
      if (userData.speed > 0) {
        userData.speed -= userData.braking * deltaTime * 60;
        if (userData.speed < 0) userData.speed = 0;
      } else if (userData.speed < 0) {
        userData.speed += userData.braking * deltaTime * 60;
        if (userData.speed > 0) userData.speed = 0;
      }
    }

    // Arka stop lambalarını yak - daha parlak efekt
    const tailLights = playerCar.children.filter(child =>
      child.name === 'leftTailLight' || child.name === 'rightTailLight');
    tailLights.forEach(light => {
      light.material.emissive = new THREE.Color(0xff0000);
      light.material.emissiveIntensity = 1.5; // Daha parlak
    });
  } else {
    // Arka stop lambalarını kapat
    const tailLights = playerCar.children.filter(child =>
      child.name === 'leftTailLight' || child.name === 'rightTailLight');
    tailLights.forEach(light => {
      light.material.emissive = new THREE.Color(0x330000);
      light.material.emissiveIntensity = 0.2;
    });
  }

  // Dönüş
  if (userData.speed !== 0) {
    const rotationAmount = userData.handling * (userData.speed / userData.maxSpeed) * deltaTime * 60;

    if (controls.left) {
      car.rotation.y += rotationAmount; // Car turns left
      userData.currentRotation = rotationAmount;

      // Rotate front wheels left
      userData.wheels.forEach((wheel, index) => {
        if (index === 0 || index === 1) { // Front wheels
          wheel.rotation.y += rotationAmount; // Adjust the wheel's rotation
        }
      });

    } else if (controls.right) {
      car.rotation.y -= rotationAmount; // Car turns right
      userData.currentRotation = -rotationAmount;

      // Rotate front wheels right
      userData.wheels.forEach((wheel, index) => {
        if (index === 0 || index === 1) { // Front wheels
          wheel.rotation.y -= rotationAmount; // Adjust the wheel's rotation
        }
      });

    } else {
      userData.currentRotation = 0;

      // Reset front wheels to face forward
      userData.wheels.forEach((wheel, index) => {
        if (index === 0 || index === 1) { // Front wheels
          wheel.rotation.y = 0; // Ensure they are aligned
        }
      });
    }
  }

  // Aracı hareket ettir
  car.position.x += Math.sin(car.rotation.y) * userData.speed * deltaTime * 60;
  car.position.z += Math.cos(car.rotation.y) * userData.speed * deltaTime * 60;

  // Çarpışma kontrolü
  checkCollisions();

  // Kamera konumunu güncelle
  updateCamera(deltaTime);
}

// Weather system
const weatherStates = {
  clear: {
    fogDensity: 0,
    rain: false,
    grip: 1.0
  },
  foggy: {
    fogDensity: 0.03,
    rain: false,
    grip: 0.8
  },
  rainy: {
    fogDensity: 0.01,
    rain: true,
    grip: 0.6
  }
};

let currentWeather = 'clear';

// Çarpışma kontrolü
// Optimize collision detection with spatial partitioning
const GRID_SIZE = 40;
const spatialGrid = {};

function updateSpatialGrid() {
  spatialGrid = {};
  
  // Add objects to grid based on position
  city.vehicles.children.forEach(vehicle => {
    const gridX = Math.floor(vehicle.position.x / GRID_SIZE);
    const gridZ = Math.floor(vehicle.position.z / GRID_SIZE);
    const key = `${gridX},${gridZ}`;
    
    if (!spatialGrid[key]) spatialGrid[key] = [];
    spatialGrid[key].push(vehicle);
  });
}

function checkCollisions() {
  const player = playerCar;
  const playerBox = new THREE.Box3().setFromObject(player);
  const gridX = Math.floor(player.position.x / GRID_SIZE);
  const gridZ = Math.floor(player.position.z / GRID_SIZE);
  
  // Check only nearby grid cells
  for (let x = gridX - 1; x <= gridX + 1; x++) {
    for (let z = gridZ - 1; z <= gridZ + 1; z++) {
      const key = `${x},${z}`;
      if (spatialGrid[key]) {
        spatialGrid[key].forEach(object => {
          if (object !== player) {
            const objectBox = new THREE.Box3().setFromObject(object);
            if (playerBox.intersectsBox(objectBox)) {
              handleCollision(player, object);
            }
          }
        });
      }
    }
  }

  // Binalarla çarpışma
  city.buildings.children.forEach(building => {
    const buildingBox = new THREE.Box3().setFromObject(building);
    if (playerBox.intersectsBox(buildingBox)) {
      // Çarpışma oldu, aracı geri it
      const playerSpeed = player.userData.speed;
      player.position.x -= Math.sin(player.rotation.y) * playerSpeed * 2;
      player.position.z -= Math.cos(player.rotation.y) * playerSpeed * 2;
      player.userData.speed = -playerSpeed * 0.5; // Zıplatma efekti
      player.userData.damage += Math.abs(playerSpeed * 10);

      // Hasar kontrolü
      if (player.userData.damage > player.userData.maxDamage) {
        player.userData.damage = player.userData.maxDamage;
        // Oyunu sıfırla
        resetGame();
      }
    }
  });

  // Diğer araçlarla çarpışma
  city.vehicles.children.forEach(vehicle => {
    const vehicleBox = new THREE.Box3().setFromObject(vehicle);
    if (playerBox.intersectsBox(vehicleBox)) {
      // Çarpışma oldu, aracı geri it
      const playerSpeed = player.userData.speed;
      player.position.x -= Math.sin(player.rotation.y) * playerSpeed * 2;
      player.position.z -= Math.cos(player.rotation.y) * playerSpeed * 2;
      player.userData.speed = -playerSpeed * 0.3; // Zıplatma efekti

      // Diğer aracın hareketini değiştir
      vehicle.userData.direction.x = -vehicle.userData.direction.x;
      vehicle.userData.direction.z = -vehicle.userData.direction.z;

      // Yaya çarpışması kontrolü
      const pedestriansToRemove = [];
      city.pedestrians.children.forEach((pedestrian) => {
        const pedestrianBox = new THREE.Box3().setFromObject(pedestrian);
        if (vehicleBox.intersectsBox(pedestrianBox)) {
          // Yaya yok oldu, bu yayayı listeden çıkar
          pedestriansToRemove.push(pedestrian);
        }
      });

      // Yayaları kaldır
      pedestriansToRemove.forEach(pedestrian => {
        city.pedestrians.remove(pedestrian);
        disposeObject(pedestrian); // Temizle
      });

      // Hasar kontrolü
      player.userData.damage += Math.abs(playerSpeed * 15);
      if (player.userData.damage > player.userData.maxDamage) {
        player.userData.damage = player.userData.maxDamage;
        resetGame(); // Oyunu sıfırla
      }
    }
  });
}

// Collision box visualizer
function drawCollisionBox(object) {
  const box = new THREE.Box3().setFromObject(object);
  const boxHelper = new THREE.Box3Helper(box, new THREE.Color(0x00ff00)); // Green color
  scene.add(boxHelper);
}

function resetPlayer() {
  playerCar.position.set(-120, 0.8, -120);
  playerCar.rotation.y = Math.PI / 4;
  playerCar.userData.speed = 0;
  playerCar.userData.damage = 0;
}

// Oyunu sıfırla
// Performance monitoring
let stats;
let frameCount = 0;
let lastFPSUpdate = Date.now();
let currentFPS = 0;

try {
  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb
  document.body.appendChild(stats.dom);
} catch (error) {
  console.warn('Stats initialization failed:', error);
  // Create a dummy stats object to prevent errors
  stats = {
    begin: () => {},
    end: () => {},
    update: () => {}
  };
}

// Object pooling for better performance
const objectPool = {
  vehicles: [],
  pedestrians: [],
  particles: []
};

// Frustum culling for better performance
const frustum = new THREE.Frustum();
const projScreenMatrix = new THREE.Matrix4();

function updateFPS(currentTime) {
  stats.begin();
  frameCount++;
  if (currentTime - lastFPSUpdate > 1000) {
    currentFPS = frameCount;
    frameCount = 0;
    lastFPSUpdate = currentTime;
    //console.log('FPS:', currentFPS);
  }
}

// Asset disposal
function disposeObject(object) {
  if (!object) return;

  if (object.geometry) {
    object.geometry.dispose();
  }

  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach(material => material.dispose());
    } else {
      object.material.dispose();
    }
  }

  if (object.children) {
    object.children.forEach(child => disposeObject(child));
  }
}

function resetGame() {
  // Clean up old objects
  city.vehicles.children.forEach(vehicle => disposeObject(vehicle));
  city.pedestrians.children.forEach(pedestrian => disposeObject(pedestrian));

  // Aracı başlangıç konumuna getir
  playerCar.position.set(-120, 0.8, -120);
  playerCar.rotation.y = Math.PI / 4;
  playerCar.userData.speed = 0;
  playerCar.userData.damage = 0;

  // Diğer araçları yeniden yerleştir
  city.vehicles.children.forEach(vehicle => {
    let x, z, rotation;

    // Yatay veya dikey yolda olacağını belirle
    if (Math.random() > 0.5) {
      // Yatay yolda, sağ şeritte
      z = (Math.floor(Math.random() * 5) - 2) * 40 + 2;
      x = Math.random() * 180 - 90;
      rotation = Math.random() > 0.5 ? 0 : Math.PI;
    } else {
      // Dikey yolda, sağ şeritte
      x = (Math.floor(Math.random() * 5) - 2) * 40 + 2;
      z = Math.random() * 180 - 90;
      rotation = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
    }

    vehicle.position.set(x, 0.6, z);
    vehicle.rotation.y = rotation;
    vehicle.userData.direction = new THREE.Vector3(
      Math.sin(rotation),
      0,
      Math.cos(rotation)
    );
  });

  // Yayaları yeniden oluştur
  while (city.pedestrians.children.length > 0) {
    city.pedestrians.remove(city.pedestrians.children[0]);
  }
  createPedestrians();
}

// Kamera konumunu güncelle
function updateCamera(deltaTime) {
  const car = playerCar;
  const cameraLerpFactor = deltaTime * 5;
  const rotationLerpFactor = deltaTime * 3;

  // FPV modunda kamera güncellemesi yapma
  if (isFPVMode) return;

  switch (controls.viewMode) {
    case 'third-person':
      // Arkadan takip eden kamera
      const cameraOffset = new THREE.Vector3(
        -Math.sin(car.rotation.y) * 8,
        4,
        -Math.cos(car.rotation.y) * 8
      );

      // Yumuşak kamera hareketi
      currentCamera.position.lerp(car.position.clone().add(cameraOffset), 5 * deltaTime);
      currentCamera.lookAt(car.position);
      break;

    case 'first-person':
      // Sürücü bakış açısı
      const firstPersonOffset = new THREE.Vector3(
        0,
        2.3,
        0
      );
      currentCamera.position.copy(car.position.clone().add(firstPersonOffset));

      // Aracın önüne bak
      const lookAtPos = new THREE.Vector3(
        car.position.x + Math.sin(car.rotation.y) * 10,
        car.position.y + 2,
        car.position.z + Math.cos(car.rotation.y) * 10
      );
      currentCamera.lookAt(lookAtPos);
      break;

    case 'top-down':
      // Kuşbakışı görünüm
      currentCamera.position.set(car.position.x, 30, car.position.z);
      currentCamera.lookAt(car.position);
      break;

    case 'free':
      // Mouse ile kontrol edilebilen serbest kamera
      if (!currentCamera.userData.freeCam) {
        currentCamera.userData.freeCam = {
          radius: 50,
          theta: 0,
          phi: Math.PI / 4
        };
      }

      // Mouse hareketi varsa kamerayı güncelle
      if (currentCamera.userData.isDragging) {
        currentCamera.userData.freeCam.theta += currentCamera.userData.mouseDeltaX * 0.01;
        currentCamera.userData.freeCam.phi = Math.max(0.1, Math.min(Math.PI / 2,
          currentCamera.userData.freeCam.phi + currentCamera.userData.mouseDeltaY * 0.01));
      }

      // Küresel koordinatlardan kartezyen koordinatlara dönüştür
      const radius = currentCamera.userData.freeCam.radius;
      const theta = currentCamera.userData.freeCam.theta;
      const phi = currentCamera.userData.freeCam.phi;

      currentCamera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      currentCamera.position.y = radius * Math.cos(phi);
      currentCamera.position.z = radius * Math.sin(phi) * Math.sin(theta);

      currentCamera.lookAt(car.position);
      break;
  }
}

// Add this to your createUI function to include the speed and damage indicators
function createUI() {
  if (document.getElementById('ui-container')) {
    return; // Zaten mevcut, yeni bir tane oluşturma
  }
  const uiContainer = document.createElement('div');
  uiContainer.style.position = 'absolute';
  uiContainer.style.top = '20px'; // Changed from 'bottom' to 'top'
  uiContainer.style.left = '20px';
  uiContainer.style.color = 'white';
  uiContainer.style.fontFamily = 'Arial, sans-serif';
  uiContainer.style.fontSize = '16px';
  uiContainer.style.textShadow = '1px 1px 2px black';
  uiContainer.style.userSelect = 'none';
  uiContainer.style.padding = '10px';
  uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  uiContainer.style.borderRadius = '5px';
  uiContainer.id = 'ui-container';

  document.body.appendChild(uiContainer);

  // Damage indicator
  const damageIndicator = document.createElement('div');
  const damageBar = document.createElement('div');
  damageBar.style.width = '200px';
  damageBar.style.height = '20px';
  damageBar.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
  damageBar.style.position = 'relative';
  damageBar.style.border = '1px solid white';
  damageBar.id = 'damage-bar';

  damageIndicator.appendChild(damageBar);
  uiContainer.appendChild(damageIndicator);

  // Speed indicator
  const speedValue = document.createElement('div');
  speedValue.id = 'speed-value';
  speedValue.innerHTML = "Speed: 0 km/h";
  uiContainer.appendChild(speedValue);

  // Pedestrian counter
  const pedestrianCount = document.createElement('div');
  pedestrianCount.id = 'pedestrian-count';
  pedestrianCount.innerHTML = "Pedestrians: 30";
  uiContainer.appendChild(pedestrianCount);
}

// Arayüzü güncelle
function updateUI() {
  // Hız değerini güncelle
  const speedValue = document.getElementById('speed-value');
  if (speedValue) {
    const speed = Math.abs(playerCar.userData.speed * 150).toFixed(0);
    speedValue.textContent = `Speed: ${speed} km/h`;
  }

  // Hasar barını güncelle
  const damageBar = document.getElementById('damage-bar');
  if (damageBar) {
    const health = 100 - playerCar.userData.damage;
    damageBar.style.width = `${health}%`;
    damageBar.style.backgroundColor = `rgb(${255 - health * 2},${health * 2},0)`;

    if (health <= 1) {
      showGameOver();
    }
  }

  // Yaya sayısını güncelle
  const pedestrianCount = document.getElementById('pedestrian-count');
  if (pedestrianCount) {
    const count = city.pedestrians.children.length;
    pedestrianCount.textContent = `Pedestrians: ${count}`;

    // Tüm yayalar yok edilince oyun tamamlandı
    if (count === 0) {
      showGameCompleted();
    }
  }
}

function showGameOver() {
  const gameOver = document.createElement('div');
  gameOver.style.position = 'absolute';
  gameOver.style.top = '50%';
  gameOver.style.left = '50%';
  gameOver.style.transform = 'translate(-50%, -50%)';
  gameOver.style.color = 'red';
  gameOver.style.fontSize = '48px';
  gameOver.style.fontWeight = 'bold';
  gameOver.style.textShadow = '2px 2px 4px black';
  gameOver.textContent = 'Oyun Bitti';
  document.body.appendChild(gameOver);

  setTimeout(() => {
    document.body.removeChild(gameOver);
    resetGame();
  }, 3000);
}

// Oyun tamamlandı göster
let gameStartTime = Date.now(); // Oyun başlangıç zamanı

function showGameCompleted() {
  const minutesPlayed = ((Date.now() - gameStartTime) / 60000).toFixed(2);

  const gameCompleted = document.createElement('div');
  gameCompleted.style.position = 'absolute';
  gameCompleted.style.top = '50%';
  gameCompleted.style.left = '50%';
  gameCompleted.style.transform = 'translate(-50%, -50%)';
  gameCompleted.style.color = 'green';
  gameCompleted.style.fontSize = '48px';
  gameCompleted.style.fontWeight = 'bold';
  gameCompleted.style.textShadow = '2px 2px 4px black';
  gameCompleted.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  gameCompleted.style.padding = '20px';
  gameCompleted.style.borderRadius = '10px';
  gameCompleted.style.textAlign = 'center';
  gameCompleted.innerHTML = `Oyun Tamamlandı!<br>${minutesPlayed} dakikada oyun tamamlandı`;
  document.body.appendChild(gameCompleted);

  setTimeout(() => {
    document.body.removeChild(gameCompleted);
    resetGame();
    gameStartTime = Date.now(); // Oyun zamanını sıfırla
  }, 5000);
}

function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  // Check for mobile-specific user agents
  return /android|iphone|ipod|blackberry|windows phone|mobile/i.test(userAgent);
}

// Mobil kontroller için dokunmatik arayüz oluştur
function createTouchControls() {
  // Create left side controls (gas/brake)
  const leftContainer = document.createElement('div');
  leftContainer.style.position = 'absolute';
  leftContainer.style.bottom = '20px';
  leftContainer.style.left = '20px';
  leftContainer.style.display = isMobile() ? 'grid' : 'none';
  leftContainer.style.gridTemplateRows = 'repeat(2, 60px)';
  leftContainer.style.gap = '10px';
  leftContainer.id = 'left-touch-controls';

  // Create right side controls (steering)
  const rightContainer = document.createElement('div');
  rightContainer.style.position = 'absolute';
  rightContainer.style.bottom = '20px';
  rightContainer.style.right = '20px';
  rightContainer.style.display = isMobile() ? 'grid' : 'none';
  rightContainer.style.gridTemplateColumns = 'repeat(3, 60px)';
  rightContainer.style.gridTemplateRows = 'repeat(3, 60px)';
  rightContainer.style.gap = '10px';
  rightContainer.id = 'right-touch-controls';

  // Kontrol butonları
  const buttonStyle = `
    width: 60px;
    height: 60px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    user-select: none;
    -webkit-user-select: none;
  `;

  // Yukarı butonu
  const upButton = document.createElement('div');
  upButton.style.cssText = buttonStyle;
  upButton.style.gridColumn = '2';
  upButton.style.gridRow = '1';
  upButton.innerHTML = '&#9650;'; // Yukarı ok
  upButton.id = 'up-button';

  // Sol butonu
  const leftButton = document.createElement('div');
  leftButton.style.cssText = buttonStyle;
  leftButton.style.gridColumn = '1';
  leftButton.style.gridRow = '2';
  leftButton.innerHTML = '&#9664;'; // Sol ok
  leftButton.id = 'left-button';

  // Sağ butonu
  const rightButton = document.createElement('div');
  rightButton.style.cssText = buttonStyle;
  rightButton.style.gridColumn = '3';
  rightButton.style.gridRow = '2';
  rightButton.innerHTML = '&#9654;'; // Sağ ok
  rightButton.id = 'right-button';

  // Aşağı butonu
  const downButton = document.createElement('div');
  downButton.style.cssText = buttonStyle;
  downButton.style.gridColumn = '3';
  downButton.style.gridRow = '2';
  downButton.innerHTML = '&#9660;'; // Aşağı ok
  downButton.id = 'down-button';

  // Fren butonu
  const brakeButton = document.createElement('div');
  brakeButton.style.cssText = buttonStyle;
  brakeButton.style.gridColumn = '2';
  brakeButton.style.gridRow = '3';

  brakeButton.innerHTML = '&#9632;'; // Kare
  brakeButton.id = 'brake-button';
  brakeButton.style.display = 'none';

  // Kamera butonu
  const cameraButton = document.createElement('div');
  cameraButton.style.cssText = buttonStyle;
  cameraButton.style.gridColumn = '3';
  cameraButton.style.gridRow = '1';
  cameraButton.innerHTML = '&#128247;'; // Kamera
  cameraButton.id = 'camera-button';

  // Butonları ekle
  // Turbo button
  const turboButton = document.createElement('div');
  turboButton.style.cssText = buttonStyle;
  turboButton.innerHTML = '🚀'; // Rocket emoji for turbo
  turboButton.id = 'turbo-button';

  // Reverse button
  const reverseButton = document.createElement('div');
  reverseButton.style.cssText = buttonStyle;
  reverseButton.innerHTML = '&#9660;'; // Down arrow for reverse
  reverseButton.id = 'reverse-button';

  // Reset button
  const resetButton = document.createElement('div');
  resetButton.style.cssText = buttonStyle;
  resetButton.innerHTML = '🔄'; // Reset icon
  resetButton.id = 'reset-button';

  // Restart button
  const restartButton = document.createElement('div');
  restartButton.style.cssText = buttonStyle;
  restartButton.innerHTML = '🎮'; // Game controller icon
  restartButton.id = 'restart-button';

  // Add gas/brake/turbo/reverse/reset/restart controls to left side
  leftContainer.appendChild(upButton);      // Gas
  leftContainer.appendChild(brakeButton);   // Brake
  leftContainer.appendChild(reverseButton); // Reverse
  leftContainer.appendChild(resetButton);   // Reset
  leftContainer.appendChild(restartButton); // Restart
  leftContainer.appendChild(turboButton);   // Turbo

  // Add steering controls to right side
  rightContainer.appendChild(leftButton);
  rightContainer.appendChild(rightButton);
  rightContainer.appendChild(cameraButton);

  document.body.appendChild(leftContainer);
  document.body.appendChild(rightContainer);

  // Dokunmatik olayları ekle
  function addTouchEvents(button, controlKey) {
    button.addEventListener('touchstart', e => {
      e.preventDefault();
      controls[controlKey] = true;
    });

    button.addEventListener('touchend', e => {
      e.preventDefault();
      controls[controlKey] = false;
    });
  }

  addTouchEvents(upButton, 'forward');
  addTouchEvents(reverseButton, 'backward');
  addTouchEvents(leftButton, 'left');
  addTouchEvents(rightButton, 'right');
  addTouchEvents(brakeButton, 'brake');
  addTouchEvents(turboButton, 'turbo');

  resetButton.addEventListener('touchstart', e => {
    e.preventDefault();
    resetPlayer();
  });

  restartButton.addEventListener('touchstart', e => {
    e.preventDefault();
    restartGame();
  });

  cameraButton.addEventListener('touchstart', e => {
    e.preventDefault();
    switchCameraView();
  });
}

// Şehir bileşenlerini oluştur
function createCity() {
  createRoads();
  createBuildings();
  createTrafficLights();
  createVehicles();
  createPedestrians();
  createPlayerCar();
  createUI();
  createTouchControls();
}

// Şehri oluştur
createCity();

function createKeyInfoPanel() {
  const keyInfoPanel = document.createElement('div');
  keyInfoPanel.id = 'key-info-panel';
  keyInfoPanel.style.position = 'absolute';
  keyInfoPanel.style.top = '90%';
  keyInfoPanel.style.left = '50%';
  keyInfoPanel.style.transform = 'translate(-50%, -50%)';
  keyInfoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  keyInfoPanel.style.color = 'white';
  keyInfoPanel.style.padding = '20px';
  keyInfoPanel.style.borderRadius = '10px';
  keyInfoPanel.style.textAlign = 'center';
  keyInfoPanel.style.zIndex = '1000';
  keyInfoPanel.innerHTML = 'Use W/A/S/D to drive, Space to brake, C to change views, R to reset car position, Shift for turbo boost';
  document.body.appendChild(keyInfoPanel);

  // Remove the panel after 3 seconds
  setTimeout(() => {
    document.body.removeChild(keyInfoPanel);
  }, 3000);
}
// Call this function in the initial setup
createKeyInfoPanel();

function updateSpeedDisplay() {
  const speedValueElement = document.getElementById('speed-value');
  if (speedValueElement) {
    const speed = Math.abs(playerCar.userData.speed * 150).toFixed(0);
    speedValueElement.innerText = `Speed: ${speed} km/h`;
  }
}

// Zaman takibi
let lastTime = 0;

// Animasyon döngüsü
function animate(currentTime) {
  requestAnimationFrame(animate);

  // Performance monitoring
  updateFPS(currentTime);

  // Delta time hesapla (saniye cinsinden)
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Güvenli bir deltaTime değeri
  const safeDeltaTime = Math.min(deltaTime, 0.1);

  // Oyuncu aracını güncelle
  updatePlayerCar(safeDeltaTime);

  // Diğer araçları güncelle
  updateVehicles(safeDeltaTime);

  // Yayaları güncelle
  updatePedestrians(safeDeltaTime);

  // Trafik ışıklarını güncelle
  updateTrafficLights(safeDeltaTime);

  // Yeni eklenen unsurları güncelle
  updateClouds(safeDeltaTime);
  updateBirds(safeDeltaTime);
  updateDogs(safeDeltaTime);

  // Arayüzü güncelle
  updateUI();

  // Render with current camera
  renderer.render(scene, currentCamera);
}

// Pencere boyutu değiştiğinde güncelle
window.addEventListener('resize', () => {
  currentCamera.aspect = window.innerWidth / window.innerHeight;
  currentCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Tüm kodu DOM hazır olduğunda çalıştır
document.addEventListener('DOMContentLoaded', function() {
  // Animasyonu başlat
  animate(0);
});

function restartGame() {
  // Oyunu tamamen sıfırla
  location.reload(); //Sayfayı yenile
}