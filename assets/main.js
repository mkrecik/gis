var map = L.map('map', {
    maxZoom: 18,
    a11yPlugin : true
}).setView([17.0, 0.0], 3);

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {
    foo: 'bar',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm.addTo(map);

var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});


// pasmo kolorów
function getColor(d) {
    return d > 120 ? '#800026' :
        d > 100 ? '#BD0026' :
            d > 80 ? '#E31A1C' :
                d > 60 ? '#FC4E2A' :
                    d > 40 ? '#FD8D3C' :
                        d > 20 ? '#FEB24C' :
                            d > 0 ? '#FED976' :
                                '#FFFFFF';
}

function styleHappiness23(feature) {
    return {
        fillColor: getColor(feature.properties.HappiestCountriesWorldHappiessReportRankings2023),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6
    }
}

function styleHappiness22(feature) {
    return {
        fillColor: getColor(feature.properties.HappiestCountriesWorldHappiessReportRankings2022),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6
    }
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 1
    });

    layer.bringToFront();
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    happinessLayer23.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    if (feature.properties) {
        layer.bindPopup(
            '<b>' + feature.properties.ADMIN +
            '</b><br>Ranking 2023: <b>' + feature.properties.HappiestCountriesWorldHappiessReportRankings2023 +
            '</b><br>Wynik 2023: <b>' + feature.properties.HappiestCountriesWorldHappiessReportScore2023 +
            '</b><br>Ranking 2022: <b>' + feature.properties.HappiestCountriesWorldHappiessReportRankings2022 +
            '</b><br>Wynik 2022: <b>' + feature.properties.HappiestCountriesWorldHappiessReportScore2022,
            {
                permanent: true,
                direction: 'center',
                className: 'countryLabel'
            });
    }
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// warstwa 2023
var happinessLayer23 = L.geoJson(countries_happiness, {
    style: styleHappiness23,
    onEachFeature: onEachFeature
})
map.addLayer(happinessLayer23);

// warstwa 2022
var happinessLayer22 = L.geoJson(countries_happiness, {
    style: styleHappiness22,
    onEachFeature: onEachFeature
})

// skala
var scale = L.control.scale({
    position: 'bottomleft',
    imperial: false
});
scale.addTo(map);

//legenda
var legend = L.control({ 
    position: 'bottomright' 
});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend'),
        grades = [0, 20, 40, 60, 80, 100, 120]
    
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        div.title = 'Legenda';
    }

    return div;
};

legend.addTo(map);

// info
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>Poziom szczęścia na rok 2023 w 149 państwach</h4>' + (props ?
        '<b>' + props.ADMIN + '</b><br /> nr w rankingu: ' + '<b>' + props.HappiestCountriesWorldHappiessReportRankings2023 + '</b>'
        : 'Najedź na państwo');
    this._div.title = 'Najedź na państwo aby zobaczyć szczegóły';
};

info.addTo(map);

// wyszukiwarka
var searchControl = new L.Control.Search({
    layer: happinessLayer23,
    propertyName: 'ADMIN',
    marker: false,
    moveToLocation: function (latlng, title, map) {
        var zoom = map.getBoundsZoom(latlng.layer.getBounds());
        map.setView(latlng, zoom);
    }
});

searchControl.on('search:locationfound', function (e) {

    //map.removeLayer(this._markerSearch)

    e.layer.setStyle({ fillOpacity: 1, dashArray: '0', color: '#666', weight: 5 });

}).on('search:collapsed', function (e) {

    happinessLayer23.eachLayer(function (layer) {
        happinessLayer23.resetStyle(layer);
    });
});

map.addControl(searchControl); 

// reset widoku
L.Control.ResetView = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'reset');

        container.style.backgroundImage = "url('assets/reset.png')";
        container.style.cursor = 'pointer';
        container.title = 'Resetuj widok'

        container.onclick = function(){
            map.setView([17.0, 0.0], 3);
        };

        return container;
    }
});

map.addControl(new L.Control.ResetView());

// parametry oceny
L.Control.InfoButton = L.Control.extend({
    options: {
        position: 'topleft',
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'source');
        container.style.cursor = 'pointer';
        container.style.backgroundImage = "url('assets/question.png')";

        container.onmouseover = function(){
            var params = L.DomUtil.create('div', 'params');
            container.innerHTML =
                '<b>Parametry oceny: </b><br>' +
                '- PKB per capita <br>' +
                '- średnia długość życia <br>' +
                '- wolność wyboru<br>' +
                '- hojność społeczeństwa<br>' +
                '- postrzeganie poziomu korupcji wewnętrznej i zewnętrznej';
            container.style.backgroundImage = "none";
        };

        container.onmouseout = function(){
            container.innerHTML = '';
            container.style.backgroundImage = "url('assets/question.png')";
        }

        return container;
    }
});

map.addControl(new L.Control.InfoButton());

//opacity slider
var slider = L.control({
    position: 'topright'
});

slider.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'slider');
    div.innerHTML = ' <b>Przezroczystość warstwy</b><br>' +
    '<input type="range" min="0" max="100" value="70" id="myRange">';
    div.title = 'Przezroczystość warstwy'

    return div;
};

slider.addTo(map);

var slider_value = document.getElementById("myRange").value;
document.getElementById("myRange").oninput = function () {
    slider_value = this.value;
    happinessLayer23.setStyle({ fillOpacity: slider_value / 100 });
    happinessLayer22.setStyle({ fillOpacity: slider_value / 100 });
}

// warstwy bazowe
var baseLayers = {
    "OpenStreetMap": osm,
    "Google Tearrain": googleTerrain,
    "Google Streets": googleStreets
};

// warstwy dodatkowe
var overlays = {
    "Poziom szczęścia 2023": happinessLayer23,
    "Poziom szczęścia 2022": happinessLayer22
};

var layerControl = L.control.layers(baseLayers, overlays, {
    position: 'topright'
}).addTo(map);

map.attributionControl.setPrefix('<a href = "http://leafletjs.com">Leaflet</a> | Moj geoportal');
