$(window).on('load', function() {


    /** Get data from Google Sheet and add markers to map
     */
    $.ajax({
        url:"https://republicantranslationsfunction.azurewebsites.net/api/servesheetskey",
        headers:{ "Access-Control-Allow-Origin": "*" },
        success: function(key) {
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

          getListOfDates(parsedData)

          clusterDataIntoLocations(parsedData)

          $('#map').css('visibility', 'visible');
          $('.loader').hide();
      }
      )
        }
    })

    //--------------------- Utility methods

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
        // convert to array to sort numerically
       dates = Array.from(dates).sort();
        console.log(dates)
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
            markerColor: 'blue'
        });
        var transcriptionMarker = L.AwesomeMarkers.icon({
            icon: 'fa-copy',
            markerColor: 'orange'
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
