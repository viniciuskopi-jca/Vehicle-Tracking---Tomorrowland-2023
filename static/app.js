// Token Mapbox
var token = 'pk.eyJ1IjoidmluaWNpdXNrb3BpamNhIiwiYSI6ImNsbGdycm4wazExYTkzcnJ5Zms0d2t4c2MifQ.eLzHigwiUzuqHIx4CgAegA';

// Estilo do Mapa
var mapStyle = 'mapbox://styles/mapbox/dark-v11';

// Coordenadas iniciais do mapa e do marcador personalizado
var initialCoords = [-47.344762, -23.346528]; // Coordenadas iniciais do mapa
var markerCoords = [-47.344762, -23.346528]; // Coordenadas do marcador

// Configuração do mapa
mapboxgl.accessToken = token;
var map = new mapboxgl.Map({
    container: 'map',
    style: mapStyle,
    center: initialCoords, // Coordenadas iniciais do mapa
    zoom: 10 // Nível de zoom inicial
});

// Adicionar marcador personalizado no mapa com ícone personalizado
var customMarker = new mapboxgl.Marker({
    element: createCustomMarker()
})
    .setLngLat(markerCoords)
    .addTo(map);

// Função para aplicar zoom após um atraso de 2 segundos
function applyZoom() {
    // Calcular os limites (bounding box) com base nas coordenadas das marcações
    var bounds = new mapboxgl.LngLatBounds();
    vehicleData.forEach(function (vehicle) {
        bounds.extend([vehicle.longitude, vehicle.latitude]);
        addMarker(vehicle);
    });

    // Preencher a tabela com os dados dos veículos
    fillTable(vehicleData);

    // Ajustar o zoom do mapa para abranger os limites calculados
    map.fitBounds(bounds, { padding: 50 });
}

// Esperar 2 segundos antes de aplicar o zoom
setTimeout(applyZoom, 2000);

// Função para criar o ícone personalizado
function createCustomMarker() {
    var markerElement = document.createElement('div');
    markerElement.style.backgroundImage = 'url("/static/icons/tomorrowland.svg")'; // URL do ícone personalizado
    markerElement.style.width = '32px'; // Largura do ícone
    markerElement.style.height = '32px'; // Altura do ícone

    return markerElement;
}

// Função para adicionar marcador no mapa
function addMarker(vehicle) {
    new mapboxgl.Marker()
        .setLngLat([vehicle.longitude, vehicle.latitude])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Placa: ' + vehicle.Placa + '</h3><p>Última Atualização: ' + vehicle.time_write + '</p>'))
        .addTo(map);
}

// Função para preencher a tabela com os dados dos veículos
function fillTable() {
    var tableBody = document.querySelector('#vehicle-table tbody');
    tableBody.innerHTML = ''; // Limpar o conteúdo da tabela

    vehicleData.forEach(function (vehicle) {
        var row = document.createElement('tr');
        row.innerHTML = `
            <td>${vehicle.Prefixo}</td>
            <td>${vehicle.Placa}</td>
            <td>${vehicle.endereco}</td>
            <td>${vehicle.time_write}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Função para atualizar os dados do mapa e da tabela
function updateData() {
    // Fazer uma solicitação AJAX para obter os dados do Flask
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/data'); // Rota no Flask para obter os dados

    xhr.onload = function () {
        if (xhr.status === 200) {
            vehicleData = JSON.parse(xhr.responseText);

            // Limpar os marcadores no mapa
            map.remove();
            map = new mapboxgl.Map({
                container: 'map',
                style: mapStyle,
                center: initialCoords, // Coordenadas iniciais do mapa
                zoom: 10 // Nível de zoom inicial
            });

            // Recriar o marcador personalizado
            var customMarker = new mapboxgl.Marker({
                element: createCustomMarker()
            })
                .setLngLat(initialCoords)
                .addTo(map);

            // Calcular os limites (bounding box) com base nas coordenadas das marcações
            var bounds = new mapboxgl.LngLatBounds();
            vehicleData.forEach(function (vehicle) {
                bounds.extend([vehicle.longitude, vehicle.latitude]);
                addMarker(vehicle);
            });

            // Preencher a tabela com os dados dos veículos
            fillTable();

            // Ajustar o zoom do mapa para abranger os limites calculados
            map.fitBounds(bounds, { padding: 50 });

            // Atualizar a data e hora da última atualização
            var lastUpdatedElement = document.getElementById('last-updated');
            var now = new Date();
            var formattedDate = now.toLocaleDateString();
            var formattedTime = now.toLocaleTimeString();
            lastUpdatedElement.textContent = 'Última verificação no banco de dados: ' + formattedDate + ' às ' + formattedTime;
        } else {
            console.error('Falha ao carregar os dados do servidor.');
        }
    };
    xhr.send();
}

// Atualizar os dados a cada 30 segundos (30,000 milissegundos)
setInterval(updateData, 30000);

// Fazer uma solicitação AJAX para obter os dados do Flask ao carregar a página
var xhr = new XMLHttpRequest();
xhr.open('GET', '/data'); // Rota no Flask para obter os dados
xhr.onload = function () {
    if (xhr.status === 200) {
        vehicleData = JSON.parse(xhr.responseText);

        // Calcular os limites (bounding box) com base nas coordenadas das marcações
        var bounds = new mapboxgl.LngLatBounds();
        vehicleData.forEach(function (vehicle) {
            bounds.extend([vehicle.longitude, vehicle.latitude]);
            addMarker(vehicle);
        });

        // Preencher a tabela com os dados dos veículos
        fillTable();

        // Ajustar o zoom do mapa para abranger os limites calculados
        map.fitBounds(bounds, { padding: 50 });
    } else {
        console.error('Falha ao carregar os dados do servidor.');
    }
};
xhr.send();
