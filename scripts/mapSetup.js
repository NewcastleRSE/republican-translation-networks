$(window).on('load', function() {

    var mySlider;

    // // Returns a Promise that resolves after "ms" Milliseconds - to pause for loop
    // const timer = ms => new Promise(res => setTimeout(res, ms))

    var playTimer;

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

          // parse data from Sheets API into JSON
          var parsedData = Papa.parse(Papa.unparse(data['values']), {header: true} ).data
          // todo check for errors


          // if needed, call this function to include all data as a table
            // createTable(parsedData)

          var dates = getListOfDates(parsedData)

          // create legend
          // createLegend()

          // create timeline
          var sliderElement = document.createElement("input");
          sliderElement.type = 'text'
          sliderElement.setAttribute('id', 'timeline')
          var divContainer = document.getElementById("timelineSection");
          divContainer.innerHTML = "";
          divContainer.appendChild(sliderElement);
          mySlider = new rSlider({
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

                  // clear data outside map
                  clearDataOutsideMap()

                  // show data for the selected date
                  showDataForDate(value, parsedData);
              }
          });

          // create controls

            // animate timeline button
          var playBtn = document.createElement("button");
          var controlsContainer = document.getElementById("controls");
          var playIcon = document.createElement("i")
          playIcon.className = 'fa fa-play'
          playBtn.appendChild(playIcon)
          playBtn.id = "playBtn"
          controlsContainer.appendChild(playBtn);
          playBtn.addEventListener('click', () => {
              var currentDate = mySlider.getValue()
              stepThroughTimeline(currentDate, dates);
          })
          // stop animate timeline button
          var stopBtn = document.createElement("button");
          var controlsContainer = document.getElementById("controls");
          var stopIcon = document.createElement("i")
          stopIcon.className = 'fa fa-pause'
          stopBtn.appendChild(stopIcon)
          stopBtn.id = "stopBtn"
          controlsContainer.appendChild(stopBtn);
          stopBtn.addEventListener('click', () => {
              stopSteppingThroughTimeline();
          })

          // view all button
          var allBtn = document.createElement("button");
          var controlsContainer = document.getElementById("controls");
          allBtn.innerHTML = "View all";
          allBtn.id = "allBtn"
          controlsContainer.appendChild(allBtn);
          allBtn.addEventListener('click', () => {
              // clear any markers already visible to avoid duplicates
              clearAllButBaseLayer();

              // clear and display data without years
              clearDataOutsideMap()

              var withLocation = [];
              var withoutLocation = [];

              // put markers on map for data with location and add to list outside map for data without location
              for ( var i = 0; i < parsedData.length; i++) {
                  if (parsedData[i]["Latitude"] === ""  || parsedData[i]["Longitude"] === "") {
                      withoutLocation.push(parsedData[i])
                  } else {
                      withLocation.push(parsedData[i])
                  }
              }
              clusterDataIntoLocations(withLocation)
              displayDataOutsideMap(withoutLocation)

          })

          // make controls and map visible
          // make controls and map visible
          $('#controls').css('visibility', 'visible');
          $('#map').css('visibility', 'visible');
          $('#legend').css('visibility', 'visible');
          $('.loader').hide();
      }
      )
        }
    })

    //--------------------- Utility methods

    function createLegend() {
        var legendList = [
            {name: 'Imprint', icon: 'fa fa-italic', colour: ''},
            {name: 'Not imprint', icon: 'fa fa-times', colour: ''},
            {name: 'Original', icon: 'fa fa-italic', colour: '#29328C'},
            {name: 'Transcription', icon: 'fa fa-italic', colour: '#F4A76B'}

            // {name: 'Unknown imprint', icon: '', colour: ''},

        ]

        var container = document.getElementById('legend');

        legendList.forEach((entry) => {
            var boxContainer = document.createElement("DIV");
            var box = document.createElement("DIV");
            var label = document.createElement("SPAN");

            label.innerHTML = entry.name;
            box.className = "box";
            box.style.backgroundColor = entry.colour;

            var icon = document.createElement("i")
            icon.className = entry.icon
            box.appendChild(icon)

            boxContainer.appendChild(box);
            boxContainer.appendChild(label);

            container.appendChild(boxContainer);
        })

    }

    async function stepThroughTimeline(startingDate, dates) {
        // for (var index = 0; index < dates.length; index++) {
        //     console.log(dates[index])
        //     // for each date, set date on slider
        //     mySlider.setValues(dates[index])
        //     await timer(3000)
        // }
        console.log('playClicked')
        // start at index of starting date and start from next date
        var index = dates.indexOf(parseInt(startingDate))+1

        if (index < 0) {
            console.log('Unable to get index of date')
        } else {
            playTimer = setInterval(() => {
                console.log(dates[index])
                mySlider.setValues(dates[index])

                // stop at last date
                if (index === dates.length) {
                    clearInterval(playTimer)
                }

                index++
            }, 3000)
        }
    }

    function stopSteppingThroughTimeline() {
        clearInterval(playTimer)
    }

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

        var withLocation = [];
        var withoutLocation = [];

        // put markers on map for data with location and add to list outside map for data without location
        for ( var i = 0; i < selectedData.length; i++) {
            if (selectedData[i]["Latitude"] === ""  || selectedData[i]["Longitude"] === "") {
                withoutLocation.push(selectedData[i])
            } else {
                withLocation.push(selectedData[i])
            }
        }
        clusterDataIntoLocations(withLocation)
        displayDataOutsideMap(withoutLocation)
    }

    function displayDataOutsideMap(data) {
        var container  = document.getElementById('dataOutsideMap')

        // add title
        if (data.length > 0) {
            var element = document.createElement('p')
            element.style.fontWeight = 'bold'
            element.innerHTML = "Works with unknown location:"
            container.appendChild(element)
        }

        data.forEach((entry) => {
            var element = document.createElement('p')
            var content = "<p>" + entry["Author Surname"] + ", " + entry["Short Title"] + ", " + entry["Language"] + ", " + entry["Printer/Publisher"] + ", " + entry["Year of Publication"] + "</p";
            element.innerHTML = content

            container.appendChild(element);
        })
    }

    function clearDataOutsideMap() {
        $('#dataOutsideMap').empty();
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
        // add 1640 and 1848 as bounds of project
        dates.push(1640);
        dates.push(1848);

        // use set to ensure unique
        dates = [...new Set(dates)]


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



    // create cluster on map for list of points
    function createCluster(entries) {
        // create markers
        var originalImprint = L.AwesomeMarkers.icon({
            icon: 'fa-italic',
            markerColor: '#29328C'
        });
        var transcriptionImprint = L.AwesomeMarkers.icon({
            icon: 'fa-italic',
            markerColor: '#F4A76B'
        });
        var originalNotImprint = L.AwesomeMarkers.icon({
            icon: 'fa-times',
            markerColor: '#29328C'
        });
        var transcriptionNotImprint = L.AwesomeMarkers.icon({
            icon: 'fa-times',
            markerColor: '#F4A76B'
        });
        var originalMaybeImprint = L.AwesomeMarkers.icon({
            icon: '',
            markerColor: '#29328C'
        });
        var transcriptionMaybeImprint = L.AwesomeMarkers.icon({
            icon: '',
            markerColor: '#F4A76B'
        });

        // create cluster for this location
        var markers = L.markerClusterGroup();
        // author surname, short title, language, publisher, year of publication
        for (var i = 0; i < entries.length; i++) {
            var content = "<h6>" + entries[i]["Author Surname"] + ", " + entries[i]["Short Title"] + "</h6><p>" + entries[i]["Language"] + "</p> <p>" + entries[i]["Printer/Publisher"] + ", " + entries[i]["Place of Publication"] + "</p> <p>" + entries[i]["Year of Publication"] + "</p";

            // translations
            if (entries[i]["Type of Text"] === 'translation') {
                // imprints
                if (entries[i]["Imprint"] === 't') {
                    var marker = L.marker([entries[i]["Latitude"], entries[i]["Longitude"]], {icon: transcriptionImprint});
                    marker.bindPopup(content);
                    markers.addLayer(marker);
                }
                // not imprints
                if (entries[i]["Imprint"] === 'n') {
                    var marker = L.marker([entries[i]["Latitude"], entries[i]["Longitude"]], {icon: transcriptionNotImprint});
                    marker.bindPopup(content);
                    markers.addLayer(marker);
                    // maybe imprints
                } else {
                    var marker = L.marker([entries[i]["Latitude"], entries[i]["Longitude"]], {icon: transcriptionMaybeImprint});
                    marker.bindPopup(content);
                    markers.addLayer(marker);
                }
                // originals
            } else if (entries[i]["Type of Text"] === 'original') {
                // imprints
                if (entries[i]["Imprint"] === 't') {
                    var marker = L.marker([entries[i]["Latitude"], entries[i]["Longitude"]], {icon: originalImprint});
                    marker.bindPopup(content);
                    markers.addLayer(marker);
                }
                // not imprints
                if (entries[i]["Imprint"] === 'n') {
                    var marker = L.marker([entries[i]["Latitude"], entries[i]["Longitude"]], {icon: originalNotImprint});
                    marker.bindPopup(content);
                    markers.addLayer(marker);
                    // maybe imprints
                } else {
                    var marker = L.marker([entries[i]["Latitude"], entries[i]["Longitude"]], {icon: originalMaybeImprint});
                    marker.bindPopup(content);
                    markers.addLayer(marker);
                }
            }
            map.addLayer(markers);
        }
    }
})
