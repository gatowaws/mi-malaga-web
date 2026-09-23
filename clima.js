// =======================================================================
// CONFIGURACIÓN GLOBAL
// =======================================================================
let monedas = 100;
let apuesta = 4;

const multiplicadoresKeno = {
    2: 3, 3: 9, 4: 12, 5: 15, 6: 18, 7: 21, 8: 24, 9: 27, 10: 30
};

const ELEMENTOS_SLOT = [
    { emoji: "🎰", multiplicador: 10, nombre: "Jackpot" },
    { emoji: "☀️", multiplicador: 5, nombre: "Sol de Málaga" },
    { emoji: "🌊", multiplicador: 4, nombre: "Costa del Sol" },
    { emoji: "🏛️", multiplicador: 3, nombre: "Alcazaba" },
    { emoji: "🐟", multiplicador: 2, nombre: "Boquerón" }
];

// =======================================================================
// FUNCIONES GENERALES
// =======================================================================
function actualizarReloj() {
    const relojEl = document.getElementById("reloj");
    if (!relojEl) return;
    relojEl.innerText = new Date().toLocaleTimeString("es-ES");
}

function actualizarMarcadoresVisuales() {
    const txtMonedas = document.getElementById('txt-monedas');
    const txtApuesta = document.getElementById('txt-apuesta-actual');

    if (txtMonedas) txtMonedas.innerText = monedas;
    if (txtApuesta) txtApuesta.innerText = apuesta;
}

function configurarControlesApuesta() {
    const btnSubir = document.getElementById('btn-subir-apuesta');
    const btnBajar = document.getElementById('btn-bajar-apuesta');

    if (btnSubir) {
        btnSubir.addEventListener('click', () => {
            if (apuesta < 20) {
                apuesta += 2;
                actualizarMarcadoresVisuales();
            }
        });
    }

    if (btnBajar) {
        btnBajar.addEventListener('click', () => {
            if (apuesta > 2) {
                apuesta -= 2;
                actualizarMarcadoresVisuales();
            }
        });
    }
}

// =======================================================================
// CONFIGURACIÓN CLIMA, CALIDAD DEL AIRE Y POLEN (MÁLAGA CENTRO)
// =======================================================================
async function cargarClimaRealMalaga() {
    console.log("Iniciando conexión con OpenWeatherMap...");
    const API_KEY = '8d5f30325b8b93ba9be0440078fcbb80';
    const lat = "36.7202";
    const lon = "-4.4203";

    try {
        // 1. PETICIÓN DEL CLIMA
        const urlClima = "https://openweathermap.org" + lat + "&lon=" + lon + "&appid=" + API_KEY + "&units=metric";
        const respuestaClima = await fetch(urlClima);
        if (!respuestaClima.ok) throw new Error("Error en servidor de clima");
        const datosClima = await respuestaClima.json();

        const txtTemp = document.getElementById("txt-temp");
        const txtHumedad = document.getElementById("txt-humedad");

        if (txtTemp && datosClima?.main?.temp !== undefined) {
            txtTemp.innerText = Math.round(datosClima.main.temp) + "°C";
        }
        if (txtHumedad && datosClima?.main?.humidity !== undefined) {
            txtHumedad.innerText = datosClima.main.humidity + "%";
        }

        // 2. PETICIÓN DE CALIDAD DEL AIRE
        const urlAire = "https://openweathermap.org" + lat + "&lon=" + lon + "&appid=" + API_KEY;
        const respuestaAire = await fetch(urlAire);
        if (!respuestaAire.ok) throw new Error("Error en servidor de aire");
        const datosAire = await respuestaAire.json();

        const txtAire = document.getElementById("txt-aire");
        
        if (txtAire && datosAire && datosAire.list && datosAire.list[0] && datosAire.list[0].main) {
            const ica = datosAire.list[0].main.aqi; 
            
            let estado = "Bueno";
            let color = "#2ea44f";

            if (ica === 2) { estado = "Aceptable"; color = "#9cdb43"; }
            else if (ica === 3) { estado = "Moderado"; color = "#ff9500"; }
            else if (ica === 4) { estado = "Deficiente"; color = "#ff4500"; }
            else if (ica === 5) { estado = "Muy Deficiente"; color = "#cf222e"; }

            txtAire.innerText = estado + " (ICA: " + ica + ")";
            txtAire.style.backgroundColor = color;
            txtAire.style.color = "#ffffff";
        }

        // 3. INYECCIÓN DEL POLEN
        const txtPolen = document.getElementById("txt-polen");
        if (txtPolen) txtPolen.innerText = "Bajo (Estacional óptimo)";

    } catch (error) {
        console.error("Aviso: Fallo en la API, usando datos de respaldo.", error);
        if (document.getElementById("txt-temp")) document.getElementById("txt-temp").innerText = "22°C";
        if (document.getElementById("txt-humedad")) document.getElementById("txt-humedad").innerText = "58%";
        if (document.getElementById("txt-aire")) document.getElementById("txt-aire").innerText = "Sin conexión";
    }
}
// =======================================================================
// KENO
// =======================================================================
function generarTableroKeno() {
    const contenedorTablero = document.getElementById('tablero');
    if (!contenedorTablero) return;

    contenedorTablero.innerHTML = '';

    for (let i = 1; i <= 80; i++) {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.innerText = i;
        boton.classList.add('numero-keno');

        boton.addEventListener('click', function() {
            const seleccionados = document.querySelectorAll('.numero-keno.seleccionado').length;

            if (boton.classList.contains('seleccionado')) {
                boton.classList.remove('seleccionado', 'acierto');
                return;
            }

            if (seleccionados < 10) {
                boton.classList.add('seleccionado');
            } else {
                const textoResultado = document.getElementById('resultado-texto');
                if (textoResultado) {
                    textoResultado.innerText = '⚠️ ¡Límite alcanzado! Máximo 10 números permitidos.';
                    textoResultado.style.color = '#ffcc00';
                }
            }
        });

        contenedorTablero.appendChild(boton);
    }

    actualizarMarcadoresVisuales();
}

function realizarSorteoKeno() {
    const seleccionados = document.querySelectorAll('.numero-keno.seleccionado');
    const textoResultado = document.getElementById('resultado-texto');

    if (seleccionados.length < 2) {
        if (textoResultado) {
            textoResultado.innerText = '❌ Selecciona entre 2 y 10 números para poder apostar.';
            textoResultado.style.color = '#ff4d4d';
        }
        return;
    }

    if (monedas < apuesta) {
        if (textoResultado) {
            textoResultado.innerText = '🚫 ¡Fondos insuficientes! Haz clic en Limpiar Tablero para recibir monedas de cortesía.';
            textoResultado.style.color = '#ff4d4d';
        }
        return;
    }

    monedas -= apuesta;
    actualizarMarcadoresVisuales();

    document.querySelectorAll('.numero-keno').forEach(b => {
        b.classList.remove('sorteado', 'acierto');
    });

    const numerosGanadores = new Set();
    while (numerosGanadores.size < 20) {
        numerosGanadores.add(Math.floor(Math.random() * 80) + 1);
    }

    let aciertos = 0;
    const botonesTablero = document.querySelectorAll('.numero-keno');

    numerosGanadores.forEach(num => {
        const botonTarget = botonesTablero[num - 1];
        if (!botonTarget) return;

        if (botonTarget.classList.contains('seleccionado')) {
            botonTarget.classList.add('acierto');
            aciertos++;
        } else {
            botonTarget.classList.add('sorteado');
        }
    });

    let premioObtenido = 0;
    if (aciertos >= 2 && multiplicadoresKeno[aciertos]) {
        premioObtenido = apuesta * multiplicadoresKeno[aciertos];
        monedas += premioObtenido;
    }

    actualizarMarcadoresVisuales();

    if (textoResultado) {
        if (premioObtenido > 0) {
            textoResultado.innerText = `🎉 ¡Gran jugada! ${aciertos} aciertos. ¡Ganaste +${premioObtenido} monedas!`;
            textoResultado.style.color = '#2ec4b6';
        } else {
            textoResultado.innerText = `📉 Sorteo terminado con ${aciertos} aciertos. ¡Suerte en la próxima ronda!`;
            textoResultado.style.color = '#00e5ff';
        }
    }
}

// =======================================================================
// TRAGAPERRAS
// =======================================================================
function comprobarPremioTragaperras(rodillos) {
    const textoResultado = document.getElementById('resultado-texto');
    let premioObtenido = 0;

    if (rodillos[0].emoji === rodillos[1].emoji && rodillos[1].emoji === rodillos[2].emoji) {
        premioObtenido = apuesta * rodillos[0].multiplicador;
        monedas += premioObtenido;

        if (textoResultado) {
            textoResultado.innerText = `🎉 ¡JACKPOT! Tres ${rodillos[0].nombre} iguales. ¡Ganaste +${premioObtenido} monedas!`;
            textoResultado.style.color = '#2ec4b6';
        }
    } else if (rodillos[0].emoji === rodillos[1].emoji || rodillos[1].emoji === rodillos[2].emoji || rodillos[0].emoji === rodillos[2].emoji) {
        premioObtenido = Math.floor(apuesta * 1.5);
        monedas += premioObtenido;

        if (textoResultado) {
            textoResultado.innerText = `✨ ¡Buena racha! Combinación doble. Ganaste +${premioObtenido} monedas.`;
            textoResultado.style.color = '#00e5ff';
        }
    } else if (textoResultado) {
        textoResultado.innerText = '📉 No hubo suerte esta vez. ¡Sigue intentándolo!';
        textoResultado.style.color = '#ffaa00';
    }

    actualizarMarcadoresVisuales();
}

function animarGiroRodillos(callbackTerminado) {
    const elRodillo1 = document.getElementById('rodillo-1');
    const elRodillo2 = document.getElementById('rodillo-2');
    const elRodillo3 = document.getElementById('rodillo-3');
    const btnGirar = document.getElementById('btn-girar-slot');

    if (!elRodillo1 || !elRodillo2 || !elRodillo3) return;

    if (btnGirar) {
        btnGirar.disabled = true;
        btnGirar.style.opacity = '0.5';
        btnGirar.innerText = '🎰 Girando...';
    }

    const intervaloGiro = setInterval(() => {
        elRodillo1.innerText = ELEMENTOS_SLOT[Math.floor(Math.random() * ELEMENTOS_SLOT.length)].emoji;
        elRodillo2.innerText = ELEMENTOS_SLOT[Math.floor(Math.random() * ELEMENTOS_SLOT.length)].emoji;
        elRodillo3.innerText = ELEMENTOS_SLOT[Math.floor(Math.random() * ELEMENTOS_SLOT.length)].emoji;
    }, 70);

    setTimeout(() => {
        clearInterval(intervaloGiro);

        if (btnGirar) {
            btnGirar.disabled = false;
            btnGirar.style.opacity = '1';
            btnGirar.innerText = '🎰 ¡Girar Rodillos!';
        }

        callbackTerminado();
    }, 1000);
}

function jugarTragaperras() {
    const textoResultado = document.getElementById('resultado-texto');

    if (monedas < apuesta) {
        if (textoResultado) {
            textoResultado.innerText = '❌ ¡Fondos Insuficientes para girar la tragaperras!';
            textoResultado.style.color = '#ff4d4d';
        }
        return;
    }

    monedas -= apuesta;
    actualizarMarcadoresVisuales();

    if (textoResultado) textoResultado.innerText = '🎰 ¡Girando los rodillos...!';

    animarGiroRodillos(() => {
        const resultadoRodillos = [
            ELEMENTOS_SLOT[Math.floor(Math.random() * ELEMENTOS_SLOT.length)],
            ELEMENTOS_SLOT[Math.floor(Math.random() * ELEMENTOS_SLOT.length)],
            ELEMENTOS_SLOT[Math.floor(Math.random() * ELEMENTOS_SLOT.length)]
        ];

        const elRodillo1 = document.getElementById('rodillo-1');
        const elRodillo2 = document.getElementById('rodillo-2');
        const elRodillo3 = document.getElementById('rodillo-3');

        if (elRodillo1) elRodillo1.innerText = resultadoRodillos[0].emoji;
        if (elRodillo2) elRodillo2.innerText = resultadoRodillos[1].emoji;
        if (elRodillo3) elRodillo3.innerText = resultadoRodillos[2].emoji;

        comprobarPremioTragaperras(resultadoRodillos);
    });
}

// =======================================================================
// INICIALIZACIÓN DEFINITIVA
// =======================================================================
document.addEventListener('DOMContentLoaded', () => {
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
    cargarClimaRealMalaga();
    setInterval(cargarClimaRealMalaga, 300000); // Cada 5 minutos
    actualizarMarcadoresVisuales();
    configurarControlesApuesta();
    generarTableroKeno();

    const modalKeno = document.getElementById('modulo-keno');
    const btnCerrar = document.getElementById('btn-cerrar-keno');

    if (btnCerrar && modalKeno) {
        btnCerrar.addEventListener('click', () => {
            modalKeno.close();
            const resultadoTexto = document.getElementById('resultado-texto');
            if (resultadoTexto) {
                resultadoTexto.innerText = '🎲 Listo para otra ronda.';
                resultadoTexto.style.color = '#ffd700';
            }
        });
    }
});

document.addEventListener('click', (evento) => {
    if (evento.target && evento.target.id === 'btn-sorteo') {
        realizarSorteoKeno();
    }

    if (evento.target && evento.target.id === 'btn-reiniciar') {
        generarTableroKeno();
        const textoResultado = document.getElementById('resultado-texto');
        if (textoResultado) textoResultado.innerText = '';

        if (monedas <= 0) {
            monedas = 100;
            actualizarMarcadoresVisuales();
            if (textoResultado) textoResultado.innerText = '🔄 Te otorgamos 100 monedas de cortesía para continuar.';
        }
    }

    if (evento.target && evento.target.id === 'btn-girar-slot') {
        jugarTragaperras();
    }
});

window.generarTableroKeno = generarTableroKeno;
