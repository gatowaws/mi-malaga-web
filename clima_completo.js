// clima.js - VERSIÓN COMPLETA CON POLEN REAL PARA MÁLAGA
// Datos: Open-Meteo Forecast + Air Quality (incluye polen)
// Gratis, sin API key, optimizado para GitHub Pages

async function actualizarClimaReal() {
  try {
    // 1. Clima base
    const urlClima = 'https://api.open-meteo.com/v1/forecast?latitude=36.7213&longitude=-4.4214&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Europe/Madrid';
    // 2. Calidad del aire + Polen (olive es CLAVE en Málaga)
    const urlAire = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=36.7213&longitude=-4.4214&current=european_aqi,us_aqi,pm10,pm2_5,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=Europe/Madrid';

    const [resClima, resAire] = await Promise.all([
      fetch(urlClima, { cache: 'no-store' }),
      fetch(urlAire, { cache: 'no-store' })
    ]);

    const dataClima = await resClima.json();
    const dataAire = await resAire.json();

    const temp = Math.round(dataClima.current.temperature_2m);
    const humedad = Math.round(dataClima.current.relative_humidity_2m);
    const aqi = dataAire.current.european_aqi;
    const pm25 = dataAire.current.pm2_5;

    // --- POLEN ---
    const polen = dataAire.current;
    const totalPolen = (polen.alder_pollen || 0) + (polen.birch_pollen || 0) + (polen.grass_pollen || 0) + (polen.olive_pollen || 0) + (polen.ragweed_pollen || 0);
    const olivo = polen.olive_pollen || 0; // El más importante en Málaga
    const gramineas = polen.grass_pollen || 0;

    let nivelPolen = 'Bajo';
    let descPolen = 'Estacional óptimo';
    let colorPolen = '#2ec4b6';

    if (totalPolen > 15 || olivo > 5) { nivelPolen = 'Moderado'; descPolen = 'Precaución alérgicos'; colorPolen = '#ffbf00'; }
    if (totalPolen > 50 || olivo > 30 || gramineas > 20) { nivelPolen = 'Alto'; descPolen = 'Evitar exterior prolongado'; colorPolen = '#ff8c00'; }
    if (totalPolen > 120 || olivo > 100) { nivelPolen = 'Muy Alto'; descPolen = 'Riesgo alérgico alto'; colorPolen = '#ff4d4d'; }

    // --- INYECCIÓN EN TU HTML ORIGINAL (buscando por texto como lo tienes) ---

    // Temperatura
    const elTemp = document.evaluate("//*[contains(text(),'Temperatura Actual')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (elTemp) elTemp.parentElement.innerHTML = `🌡️ <strong>Temperatura Actual:</strong> ${temp}°C`;

    // Humedad
    const elHum = document.evaluate("//*[contains(text(),'Humedad Relativa')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (elHum) elHum.parentElement.innerHTML = `💧 <strong>Humedad Relativa:</strong> ${humedad}%`;

    // ICA
    const elICA = document.evaluate("//*[contains(text(),'Calidad del Aire')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (elICA) {
      let textoICA = 'Bueno'; let colorICA = '#2ec4b6';
      if (aqi > 40) { textoICA = 'Moderado'; colorICA = '#ffbf00'; }
      if (aqi > 60) { textoICA = 'Regular'; colorICA = '#ff8c00'; }
      if (aqi > 80) { textoICA = 'Malo'; colorICA = '#ff4d4d'; }
      
      const parent = elICA.closest('.info-item');
      if (parent) {
        parent.innerHTML = `🍃 <strong>Calidad del Aire (ICA):</strong> <span class="badge-salud" style="background:${colorICA}">${aqi} - ${textoICA}</span><br><small style="color:#555">Estación física: Carranque / El Atabal · PM2.5: ${pm25} µg/m³</small>`;
      }
    }

    // POLEN - ESTO ES LO NUEVO
    const elPolen = document.evaluate("//*[contains(text(),'Nivel de Polen')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (elPolen) {
      const parent = elPolen.closest('.info-item');
      if (parent) {
        parent.innerHTML = `
          🌾 <strong>Nivel de Polen Ambiental:</strong> <span class="badge-salud" style="background:${colorPolen}">${nivelPolen}</span> 
          <span style="font-size:0.9em">(${descPolen})</span><br>
          <small style="color:#555; display:block; margin-top:6px; line-height:1.4">
            Olivo: ${olivo.toFixed(1)} · Gramíneas: ${gramineas.toFixed(1)} · Total: ${totalPolen.toFixed(1)} grains/m³<br>
            Datos: CAMS / Open-Meteo · Málaga Centro
          </small>
        `;
      }
    }

    console.log(`✅ Málaga: ${temp}°C, ${humedad}%, ICA ${aqi}, Polen ${nivelPolen} (${totalPolen.toFixed(1)}) - Olivo ${olivo}`);

  } catch (e) {
    console.error('Error clima:', e);
  }
}

document.addEventListener('DOMContentLoaded', actualizarClimaReal);
setInterval(actualizarClimaReal, 10 * 60 * 1000);

// RELOJ
function actualizarReloj() {
  const relojEl = document.getElementById("reloj");
  if (!relojEl) return;
  relojEl.innerText = new Date().toLocaleTimeString("es-ES");
}
setInterval(actualizarReloj, 1000);
actualizarReloj();
