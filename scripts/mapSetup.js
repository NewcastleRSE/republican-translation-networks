$(window).on('load', function() {




    /** Get data from Google Sheet and add markers to map
     */
    $.ajax({
        url:"https://republicantranslationsfunction.azurewebsites.net/api/servesheetskey",
        headers:{ "Access-Control-Allow-Origin": "*" },
        success: function(response) {
            var key = JSON.parse(response).sheets

            // Set tile layer
            var mapKey =  JSON.parse(response).thunder
          L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}', {
              attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              apikey: mapKey
            }).addTo(map);


        //    Get data from sheets
        $.getJSON(
      "https://sheets.googleapis.com/v4/spreadsheets/10hoBLjIu0_qothMvChC8mkiI_QyEh7KCwOs4TFxq0kk/values/Sheet1?key=" + key,
      (data) => {
        console.log('test5')

          // parse data from Sheets API into JSON
          var parsedData = Papa.parse(Papa.unparse(data['values']), {header: true} ).data
          // todo check for errors

          // if needed, call this function to include all data as a table
            // createTable(parsedData)

          var dates = getListOfDates(parsedData)

          // create timeline
          var sliderElement = document.createElement("input");
          sliderElement.type = 'text'
          sliderElement.setAttribute('id', 'timeline')
          var divContainer = document.getElementById("timelineSection");
          divContainer.innerHTML = "";
          divContainer.appendChild(sliderElement);
          var mySlider = new rSlider({
              target: '#timeline',
              values: dates,
              range: false,
              tooltip: true,
              scale: true,
              labels: false,
              set: dates[0],
              disabled: false,
              onChange: function(value) {
                  console.log(value)
                  // remove existing markers
                 clearAllButBaseLayer();

                  // show data for the selected date
                  showDataForDate(value, parsedData);
              }
          });

          // create controls
          var allBtn = document.createElement("button");
          var controlsContainer = document.getElementById("controls");
          allBtn.innerHTML = "View all";
          allBtn.id = "allBtn"
          controlsContainer.appendChild(allBtn);
          allBtn.addEventListener('click', () => {
              // show data for all years

              // clear any markers already visible to avoid duplicates
              clearAllButBaseLayer();

              clusterDataIntoLocations(parsedData);
          })


          // make controls and map visible
          $('#controls').css('visibility', 'visible');
          $('#map').css('visibility', 'visible');
          $('.loader').hide();
      }
      )
        }
    })

    //--------------------- Utility methods
    function clearAllButBaseLayer() {
        map.eachLayer((layer) => {
            // don't remove baselayer
            if (layer instanceof L.TileLayer) {

            } else {
                console.log('remove layer')
                map.removeLayer(layer)
            }
        })
    }

    function showDataForDate(date, data) {
        // limit data to that date
        var selectedData = []
        for (var j = 0; j < data.length; j++) {
           if (data[j]["Year of Publication"] === date) {
               selectedData.push(data[j])
           }
        }
        clusterDataIntoLocations(selectedData)
    }

    // Get list of all dates in data
    function getListOfDates(data) {
        var dates = []
        for (var j = 0; j < data.length; j++) {
            var date = data[j]["Year of Publication"]

            // strip starting c if present
            date = date.replace("c","")

            // convert to number - if can't then move on to next entry
            try {
                date = parseInt(date, 10)
            }
            catch {
                continue;
            }

           dates.push(date)
        }
        // use set to ensure unique
        dates = [...new Set(dates)]

        // if 1640 and 1848 are not present, add to list so slider has them
        dates.indexOf(1640) === -1 ? dates.push(1640) : console.log("This item already exists");
        dates.indexOf(1848) === -1 ? dates.push(1848) : console.log("This item already exists");

        // convert to array to sort numerically
       dates = Array.from(dates).sort();
       return dates
    }

    // cluster data into locations
    function clusterDataIntoLocations(data) {
        // get unique list of all locations
        var locations = []
        for (var j = 0; j < data.length; j++) {
            var location = data[j]["Place of Publication"]
           locations.push(location)
        }
        locations = [...new Set(locations)]

        // group data into clusters per country
        for (var k = 0; k < locations.length; k++) {
            var location = locations[k]
            var entries = _.filter(data, function(o) {return o["Place of Publication"] === location})

            // for each group of entries, create a cluster on the map
            createCluster(entries)
        }
    }

    // create table
    function createTable(jsonData) {
        // EXTRACT VALUE FOR HTML HEADER.
        var col = [];
        for (var i = 0; i < jsonData.length; i++) {
            for (var key in jsonData[i]) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }

        // CREATE DYNAMIC TABLE.
        var table = document.createElement("table");

        // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

        var tr = table.insertRow(-1);                   // TABLE ROW.

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");      // TABLE HEADER.
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i < jsonData.length; i++) {

            tr = table.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = jsonData[i][col[j]];
            }
        }

        // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
        // var divContainer = document.getElementById("showData");
        // divContainer.innerHTML = "";
        // divContainer.appendChild(table);
    }


  // Returns an Awesome marker with specified parameters
    function createMarkerIcon(icon, prefix, markerColor, iconColor) {
        return L.AwesomeMarkers.icon({
            icon: icon,
            prefix: prefix,
            markerColor: markerColor,
            iconColor: iconColor
        });
    }



    // create cluster on map for list of points
    function createCluster(entries) {
      // create markers
        var originalMarker = L.AwesomeMarkers.icon({
            icon: 'fa-file',
            markerColor: '#29328C'
        });
        var transcriptionMarker = L.AwesomeMarkers.icon({
            icon: 'fa-copy',
            markerColor: '#F4A76B'
        });

        // create cluster for this location
        var markers = L.markerClusterGroup();

        for (var i = 0; i < entries.length; i++) {
            if (entries[i]["Type of Text"] === 'translation') {
                var marker = L.marker([entries[i]["Latitude"], entries[i]["Longitude"]], {icon: transcriptionMarker});
                var content = "<h6>" + entries[i]["Short Title"] + "</h6> <p>" + entries[i]["Year of Publication"] + "</p";
                marker.bindPopup(content);
                markers.addLayer(marker);
            } else if (entries[i]["Type of Text"] === 'original') {
                var marker = L.marker([entries[i]["Latitude"], entries[i]["Longitude"]], {icon: originalMarker});
                var content = "<h6>" + entries[i]["Short Title"] + "</h6> <p>" + entries[i]["Year of Publication"] + "</p";
                marker.bindPopup(content);
                markers.addLayer(marker);
            } else {
                var marker = L.marker([entries[i]["Latitude"], entries[i]["Longitude"]]);
                var content = "<h6>" + entries[i]["Short Title"] + "</h6> <p>" + entries[i]["Year of Publication"] + "</p";
                marker.bindPopup(content);
                markers.addLayer(marker);
            }
        }
        map.addLayer(markers);
    }
})
