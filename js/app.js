const API_KEY = CONFIG.API_KEY; 

// Elementos del DOM
const horaElement = document.getElementById('hora');
const ciudadInput = document.getElementById('ciudadInput');
const buscarBtn = document.getElementById('buscarBtn');
const climaCard = document.getElementById('clima-card');
const errorMsg = document.getElementById('errorMsg');
const loading = document.getElementById('loading');

// Elementos para mostrar datos del clima
const ciudadNombre = document.getElementById('ciudadNombre');
const tempElement = document.getElementById('temp');
const descripcionElement = document.getElementById('descripcion');
const humedadElement = document.getElementById('humedad');
const vientoElement = document.getElementById('viento');
const sensacionElement = document.getElementById('sensacion');

// 1. RELOJ
function actualizarReloj() {
    const ahora = new Date();
    
    // Formato: 14:30:45
    const hora = ahora.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    horaElement.textContent = hora;
}

// Iniciar el reloj
actualizarReloj();
setInterval(actualizarReloj, 1000);

// 2. FUNCIÓN PARA MOSTRAR ERRORES 
function mostrarError(mensaje) {
    errorMsg.textContent = mensaje;
    errorMsg.style.display = 'block';
    climaCard.style.display = 'none';
    
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 3000);
}

// 3. FUNCIÓN PARA OBTENER ICONO SEGÚN EL CLIMA 
function getIconoClima(clima) {
    const iconos = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Smoke': '💨',
        'Haze': '🌫️',
        'Dust': '🏜️',
        'Fog': '🌫️'
    };
    return iconos[clima] || '🌡️';
}

// 4. FUNCIÓN PARA MOSTRAR EL CLIMA 
function mostrarClima(data) {
    ciudadNombre.textContent = `${data.name}, ${data.sys.country}`;
    tempElement.textContent = `${Math.round(data.main.temp)}°C`;
    descripcionElement.textContent = data.weather[0].description;
    humedadElement.textContent = data.main.humidity;
    vientoElement.textContent = data.wind.speed;
    sensacionElement.textContent = Math.round(data.main.feels_like);
    
    // Añadir icono del clima 
    const icono = getIconoClima(data.weather[0].main);
    
    climaCard.style.display = 'block';
}

// 5. FUNCIÓN PARA BUSCAR CLIMA POR CIUDAD 
async function buscarClima(ciudad) {
    if (!ciudad.trim()) {
        mostrarError('Por favor, escribe una ciudad');
        return;
    }
    
    loading.style.display = 'block';
    climaCard.style.display = 'none';
    errorMsg.style.display = 'none';
    
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)}&appid=${API_KEY}&units=metric&lang=es`;
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Ciudad no encontrada. Verifica el nombre.');
            } else if (response.status === 401) {
                throw new Error('Error de API key. Verifica tu clave.');
            } else {
                throw new Error('Error al obtener el clima. Intenta de nuevo.');
            }
        }
        
        const data = await response.json();
        mostrarClima(data);
    } catch (error) {
        mostrarError(error.message);
    } finally {
        loading.style.display = 'none';
    }
}

// 6. FUNCIÓN PARA BUSCAR POR UBICACIÓN
function buscarPorUbicacion() {
    if (!navigator.geolocation) {
        mostrarError('Tu navegador no soporta geolocalización');
        return;
    }
    
    loading.style.display = 'block';
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=es`;
                const response = await fetch(url);
                
                if (!response.ok) throw new Error('Error al obtener el clima');
                
                const data = await response.json();
                mostrarClima(data);
                ciudadInput.value = data.name;
            } catch (error) {
                mostrarError(error.message);
            } finally {
                loading.style.display = 'none';
            }
        },
        (error) => {
            loading.style.display = 'none';
            if (error.code === 1) {
                mostrarError('Permite la ubicación para usarla automáticamente');
            } else {
                mostrarError('Error al obtener tu ubicación');
            }
        }
    );
}

// 7. EVENTOS 
// Evento de clic en el botón buscar
buscarBtn.addEventListener('click', () => {
    buscarClima(ciudadInput.value);
});

// Evento de presionar Enter en el input
ciudadInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        buscarClima(ciudadInput.value);
    }
});

// 8. CARGA INICIAL 
// Intentar cargar el clima de la ubicación automáticamente
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=es`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    mostrarClima(data);
                    ciudadInput.value = data.name;
                }
            } catch (error) {
                console.error('Error al cargar ubicación automática:', error);
            }
        },
        () => {
            // Si no permite ubicación, mostrar un mensaje amigable
            console.log('Usuario no permitió la ubicación');
        }
    );
}