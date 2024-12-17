var allData;
var displayedData
let today = new Date();
let cols;
let numberOfCols = 22;

var itemToGetColsFrom = {}

let rowsToDisplay = 20
let currentPage = 0
let allRowsIntoPages = []

// hide calendar and browsing
$('#calendar').hide()
$('#browse').hide()
$('#resultsCard').hide()
$('#searchBox').hide()
$('#dataTable').hide()


$(window).on('load', function () {
    const key = 'AIzaSyCv-S8EVA4SDGODRacwtNB1TjGIYb-q1nA'
    const spreadID = '1atlVZx6zTu7hU323a2m8-ZymrdeaPlIn8bsfE7Vw5Ak'

    //    Get data from sheets
    $.getJSON(
        
        "https://sheets.googleapis.com/v4/spreadsheets/1atlVZx6zTu7hU323a2m8-ZymrdeaPlIn8bsfE7Vw5Ak/values/Sheet1?key=" + key,

        (data) => {
            // parse data from Sheets API into JSON
            var parsedData = Papa.parse(Papa.unparse(data['values']), { header: true }).data


            // data processing
            parsedData = assignIDs(parsedData)
            // allData = standardiseTypeCol(parsedData)
            // allData = standardiseDataCol(allData)
            // displayedData = allData
            displayedData = parsedData
            allData = parsedData
           //  console.log(displayedData)
        setupFilters()
            
            // Get the keys (column names) of an object with all keys present
        // to do this get item with the number of fields closest to correct
        
        itemToGetColsFrom = allData[allData.findIndex((entry) => Object.keys(entry).length === numberOfCols)]

            // create table
            //createTable(allData)
            createTable(displayedData)
            // createCalendar(currentMonth, currentYear);
        }
    )
    document.getElementById('browse').style.display = 'inline'

    
})

function setupFilters() {
    // create radio buttons for filters
    createRadios('Author Surname', 'authorBtns')
    createRadios('Language', 'languageBtns')
    createRadios('Publisher', 'publisherBtns')

    var acc = document.getElementsByClassName("filtersaccordion");
var i;

for (i = 0; i < acc.length; i++) {
 acc[i].addEventListener("click", function() {
    // if clicked panel is active, hide it
    if (this.classList.contains('active')) {
        this.classList.remove('active')
        var panel = this.nextElementSibling;
        panel.style.display = 'none'
    } else {

    // else hide others and show clicked panel
     // hide all active panels
 
     let active = document.querySelectorAll(".filtersaccordion.active");
     
    for(let j = 0; j < active.length; j++){
      active[j].classList.remove("active");
      var panel = active[j].nextElementSibling;
     
      panel.style.display = "none";
    }
    
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.add("active");

    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    // if (panel.style.display === "block") {
    //   panel.style.display = "none";
    // } else {
      panel.style.display = "block";
    //}
  
}
  });

}
}

// give each table row a unique ID
function assignIDs(data) {
    for (let index = 0; index < data.length; index++) {
        data[index]['ID'] = index
    }
    return data
}

function createTable(dataToDisplay) {

    // Get the container element where the table will be inserted and clear it
    let container = document.getElementById("showData");
    container.replaceChildren()


    // additional info to exlude from main display
    let indexesToHide = []

    // reset pages
    allRowsIntoPages = []

    if (dataToDisplay.length > 0) {

        // Create the table element
        let table = document.createElement("table");
        table.setAttribute('id', 'myTable')
        table.classList.add('table')
        table.classList.add('table-hover')

        

        let cols = Object.keys(itemToGetColsFrom)
        

        // Create the header element
        let thead = document.createElement("thead");
        let tr = document.createElement("tr");

        // Loop through the column names and create header cells
        cols.forEach((item) => {
             // ignore ID  columns
            item = item.trim()
            if (item != 'ID') {
                let th = document.createElement("th");
                th.setAttribute('scope', 'col')
                th.innerText = item; // Set the column name as the text of the header cell
                
                // exclude some additional info cells
                if (item === 'Printer' || item === 'ID' || item === 'Latitude' || item === 'Longitude' || item === 'Format' || item === 'Additional information' || item === 'Available at' || item === 'ESTC' || item === 'Additional authors' || item === 'Full Title' || item === 'Library Holdings' || item === 'Pages' || item === 'Volumes') {    
                    th.style.display = 'none'  
                    
                    indexesToHide.push(cols.indexOf(item))       
                }

                tr.appendChild(th); // Append the header cell to the header row
            }
        });

        thead.appendChild(tr); // Append the header row to the header
        table.append(thead) // Append the header to the table

        let tbody = document.createElement('tbody')
        tbody.setAttribute('id', 'tBodyBrowse')

        // Loop through the JSON data and create table rows
        let allHtmlRows = []
        dataToDisplay.forEach((item) => {
            let tr = document.createElement("tr");

            // Get the values of the current object in the JSON data
            let vals = Object.values(item);


            // get indexes of the columns to hide (excuded above from header)


            // Loop through the values and create table cells other than the excluded columns
            for (let i = 0; i < vals.length; i++) {
                
                let td = document.createElement("td");
                // first column is date and needs styling 
                // if (i === 0) {
                //     var formattedDates = shorternDates(vals[i])
                //     td.innerText = formattedDates.substring(0, 11) + '...' // Set the value as the text of the table cell
                // } else {
                    td.innerText = vals[i]; // Set the value as the text of the table cell
                //}
                // console.log(item)
                // hide everything but date and title
                if (indexesToHide.includes(i)) {
                   
                    td.style.display = 'none'
                }

                tr.appendChild(td); // Append the table cell to the table row
                tr.style.cursor = 'pointer'
                tr.onclick = function () {
                    displayEvent(item['ID'])
                }

            }

            allHtmlRows.push(tr)
           
            // tbody.appendChild(tr); // Append the table row to the table
        });

        // divide rows into pages

        while (allHtmlRows.length > 0) {
            // remove first n elements and add to page
            const nextPage = allHtmlRows.splice(0, rowsToDisplay)
            allRowsIntoPages.push(nextPage)
        }

        // display first page
        allRowsIntoPages[0].forEach((tr) => {
            tbody.appendChild(tr)
        })

        // allHtmlRows.forEach((tr) => {
        //     tbody.appendChild(tr)
        // })

        table.appendChild(tbody)
        container.appendChild(table) // Append the table to the container element

        document.getElementById("dataTable").style.display = "inline"
    }
}



// display single event above table view
function displayEvent(id) {

    // Get the container element where the table will be inserted
    let container = document.getElementById("clickedEntry");

    // clear previous results entry if there is one
    container.replaceChildren()

    // Create the table element
    let table = document.createElement("table");
    table.setAttribute('id', 'resultTable')
    table.classList.add('table')

    // Get the keys (column names) of the first object in the JSON data
    // Create the header element

    let tbody = document.createElement('tbody')
    tbody.setAttribute('id', 'tBodyResult')

    // Loop through the column names and create header cells and data cell
    let item = _.find(allData, function (o) { return o.ID === id })

    Object.keys(item).forEach((key) => {

        // ignore ID and checked by columns
        if (key != 'ID' ) {
            // row per object key
            let tr = document.createElement("tr");
            // header is key
            let th = document.createElement("th");
            th.setAttribute('scope', 'col')
            th.innerText = key; // Set the column name as the text of the header cell
            // contents of next cell is value
            let td = document.createElement("td");
            td.style.textAlign = 'left'
            // first column is date and needs styling 
            // if (key === 'Date') {
            //     var formattedDates = shorternDates(item[key])
            //     td.innerText = formattedDates// Set the value as the text of the table cell
            // } else {
                td.innerText = item[key]; // Set the value as the text of the table cell
            //}
            tr.appendChild(th); // Append the header cell to the header row
            tr.appendChild(td)
            tbody.appendChild(tr)
        }
    });

    table.appendChild(tbody)
    container.appendChild(table) // Append the table to the container element

    // set results card to visible
    $('#resultsCard').show()

    // scroll to results card
    document.getElementById('resultsCard').scrollIntoView()
}



function createRadios(field, containerID) {
    // get all possible authors
    var types = Object.keys(_.countBy(allData, function (data) {
   
        return data[field]

    }))

    // case insensitive alphabetical sort
    var typesSorted = types.sort((a, b) => {
        return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });

    typesSorted.forEach((type) => {
        // exclude blank
        if (type != '' && type != undefined && type != 'undefined') {
            var input = document.createElement('input')
            input.classList.add('form-check-input')
            input.setAttribute('type', 'radio')
            input.setAttribute('name', 'genre')
            input.setAttribute('id', 'radio' + type)
            input.onclick = function () {
                filterRadio(type, field)
            }
            var label = document.createElement('label')
            label.classList.add('form-check-label')
            label.setAttribute('for', 'radio' + type)
            label.innerHTML = type
            var div = document.createElement('div')
            div.classList.add('form-check')
            div.classList.add('ml-4')
            div.appendChild(input)
            div.appendChild(label)
            let container = document.getElementById(containerID);
            container.appendChild(div)
        }
    })
}

function createCalendar(month, year) {

    let selectYear = document.getElementById("year");
    let selectMonth = document.getElementById("month");

    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // create date picker
    var yearPicker = document.getElementById('year')
    for (let yr = earliestYr; yr < latestYr + 1; yr++) {
        var option = document.createElement('option')

        option.setAttribute('value', yr)
        option.innerText = yr
        yearPicker.appendChild(option)
    }

    let monthAndYear = document.getElementById("monthAndYear");
    let firstDay = (new Date(year, month)).getDay();
    let daysInMonth = 32 - new Date(year, month, 32).getDate();
    let tbl = document.getElementById("calendar-body"); // body of the calendar

    // clearing all previous cells
    tbl.innerHTML = "";

    // filing data about month and in the page via DOM.
    monthAndYear.innerHTML = months[month] + " " + year;
    selectYear.value = year;
    selectMonth.value = month;

    // get all events for requested year and month
    var events = getEventsForMonth(month, year)

    // creating all cells
    let date = 1;
    for (let i = 0; i < 6; i++) {
        // creates a table row
        let row = document.createElement("tr");

        //creating individual cells, filing them up with data.
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                let cell = document.createElement("td");
                let cellText = document.createTextNode("");
                cell.appendChild(cellText);
                row.appendChild(cell);
            }
            else if (date > daysInMonth) {
                break;
            }

            else {
                let cell = document.createElement("td");
                let cellText = document.createTextNode(date);


                cell.appendChild(cellText);

                // build full date for cell to compare to events list
                let cellDate = new Date(year, month, date)

                // highlight days with performances
                events.forEach((e) => {

                    if (new Date(Object.keys(e)[0]).toDateString() === cellDate.toDateString()) {

                        var eventID = e[Object.keys(e)[0]]['ID']
                        cell.setAttribute('id', eventID)
                        // add clickable icon to cell
                        var icon = document.createElement('icon')
                        icon.classList.add('fa-solid')
                        icon.classList.add('fa-circle')
                        icon.setAttribute('style', 'color: ' + e[Object.keys(e)[0]]['colour'] + '; cursor: pointer;')

                        icon.onclick = function () {
                            displayEvent(eventID)
                            //     var chosenEvent = _.find(allData, function (o) { return o['ID'] === eventID })
                            //     // build event
                            //     var tbody = document.getElementById('calTableBody')
                            //     // clear current table contents
                            //     tbody.replaceChildren()
                            //     var tr = document.createElement('tr')
                            //     for (let i = 0; i < Object.keys(chosenEvent).length - 4; i++) {
                            //         let td = document.createElement("td");
                            //         // first column is date and needs styling 
                            //         var innerText = chosenEvent[Object.keys(chosenEvent)[i]];
                            //         if (i === 0) {
                            //             var formattedDates = shorternDates(innerText)
                            //             td.innerText = formattedDates; // Set the value as the text of the table cell
                            //         } else {
                            //             td.innerText = innerText; // Set the value as the text of the table cell
                            //         }
                            //         tr.appendChild(td); // Append the table cell to the table row
                            //     }
                            //     tbody.appendChild(tr); // Append the table row to the table
                        }
                        cell.appendChild(icon)
                    }
                })

                row.appendChild(cell);
                date++;
            }
        }

        tbl.appendChild(row); // appending each row into calendar body.
    }

}

// note expects month to be zero indexed e.g. January = 0
function getEventsForMonth(month, year) {
    var events = []

    // colour code events
    var colours = ['#0b3954', '#bfd7ea', '#ff6663', '#cbdf90', '#FFC100', '#353531', '#EC4E20', '#FF9505', '#016FB9', '#000000']
    var currentColour = 0

    allData.forEach((entry) => {
        // get colour for event or go back to beginning of list
        if (!colours[currentColour]) {
            currentColour = 0
        }

        var dates = entry.datesformatted.split(',')

        for (let index = 0; index < dates.length; index++) {
            var date = new Date(dates[index])

            if (date.getFullYear() === year && date.getMonth() === month) {

                var obj = {}
                entry['colour'] = colours[currentColour]
                obj[date] = entry
                events.push(obj)
            }
        }
        // take next colour for next event
        currentColour += 1
    })

    return events
}

function nextTablePage() {
    //add next rows if there are them
    if (allRowsIntoPages[currentPage + 1]) {
        // remove current rows
        var tbody = document.getElementById('tBodyBrowse')
        tbody.replaceChildren()
        currentPage++
        allRowsIntoPages[currentPage].forEach((tr) => {
            tbody.appendChild(tr)
        })
    }
}

function previousTablePage() {
    //add previous rows if there are them
    if (allRowsIntoPages[currentPage - 1]) {
        // remove current rows
        var tbody = document.getElementById('tBodyBrowse')
        tbody.replaceChildren()
        currentPage--
        allRowsIntoPages[currentPage].forEach((tr) => {
            tbody.appendChild(tr)
        })
    }
}

function next() {
    // see if changing year would take it after the earliest
    currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
    if (currentYear > latestYr) {
        //reset
        currentYear = latestYr
    } else {
        // also move month
        currentMonth = (currentMonth + 1) % 12;
    }

    createCalendar(currentMonth, currentYear);
}

function previous() {
    // see if changing year would take it before the earliest
    currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;

    if (currentYear < earliestYr) {
        //reset
        currentYear = earliestYr
    } else {
        // also move month
        currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
    }

    createCalendar(currentMonth, currentYear);
}

function jump() {
    let selectYear = document.getElementById("year");
    let selectMonth = document.getElementById("month");
    currentYear = parseInt(selectYear.value);
    currentMonth = parseInt(selectMonth.value);
    createCalendar(currentMonth, currentYear);
}

// ----- standardising content
function standardiseTypeCol(parsedData) {
    parsedData.forEach((el) => {
        // only first letter should be upper case and remove spaces at start or end
        if (el.Type) {
            el.Type = el.Type.trim()
            el.Type = el.Type.toLowerCase()
            el.Type = el.Type.charAt(0).toUpperCase() + el.Type.slice(1)
        }
    })
    return parsedData
}

function standardiseDataCol(data) {
    // reformat date col to be human readable and create new machine readable column to use for calendar etc.
    data.forEach((el) => {
        // split into list based on ;
        var dates = el.Date.split(";")
        // isolate date and convert to readable format
        var formattedDates = []
        // convert date to readable format but preserve day and matinee information
        var formattedDatesWithStrings = []

        dates.forEach((d) => {

            // remove space
            d = d.trim()
            var dateIsolated = d.substring(0, 9)
            var restOfDate = d.substring(9)

            var yr = dateIsolated.substring(0, 4)
            var month = dateIsolated.substring(4, 6) - 1
            var day = dateIsolated.substring(6, 8)

            if (day[0] === 0) {
                day = day[1]
            }

            var date = new Date(yr, month, day)

            if (!isValidDate(date) || date.toDateString() === 'Invalid Date') {
                console.log(`problem with date: ${d} ${dateIsolated}`)
            } else {

                formattedDates.push(date.toDateString())
                formattedDatesWithStrings.push(date.toDateString() + ' ' + restOfDate)
            }

        })

        el.Date = formattedDatesWithStrings.join(', ')
        el['datesformatted'] = formattedDates.join(', ')
    })
    return data
}

function isValidDate(dateObject) {
    return new Date(dateObject).toString() !== 'Invalid Date';
}

function shorternDates(dates) {
    var formatted = []
    dates.split(',').forEach((d) => {
        let partsOfDate = []
        // dates are either split by en dash (short) or or em dash (long) so replace with simple dashes
        let dTidied = d.replace(/\u2013|\u2014/g, "-")
        partsOfDate = dTidied.split('-')

        if (partsOfDate.length > 0) {
            df = new Date(partsOfDate[0])

            if (!isValidDate(df)) {
                console.log(`problem shortening date ${partsOfDate[0]}`)

                // change to 
            }

            if (partsOfDate[1]) {
                formatted.push(df.toLocaleDateString() + ' - ' + partsOfDate[1])
                console.log('correct date ' + formatted)
            } else {
                formatted.push(df.toLocaleDateString())
            }
        }
    })
    return formatted.join(', ')
}

//  ----- filtering data
function filterRadio(type, filter) {

    var container = document.getElementById('showData')
    container.replaceChildren()

    if (type === 'all') {
        createTable(allData)
    } else {
console.log()
        // select only entries where type is correct
        var filteredData = _.filter(allData, function (o) {
            if (o[filter]) {
                return o[filter].startsWith(type);
            }
        });
        
        console.log(filteredData)
        createTable(filteredData)
    }
}

// -----
function browseAll() {
    // hide calendar etc
    $('#calendar').hide()
    $('#browse').show()
    $('#welcomeText').hide()
    $('#resultsCard').hide()
    $('#searchBox').hide()
    $('#dataTable').show()

    // reset checkbox to displaying all entries
    document.getElementById('all').click()

    // reset data list
    dataToDisplay = allData

    // create table fresh
    createTable(allData)
}

function showCalendar() {
    // hide browsing etc
    $('#calendar').show()
    $('#browse').hide()
    $('#welcomeText').hide()
    $('#resultsCard').hide()
    $('#searchBox').hide()
    $('#dataTable').hide()

    // reset data list
    dataToDisplay = allData
}

function showSearch() {
    // hide browsing etc
    $('#calendar').hide()
    $('#browse').hide()
    $('#welcomeText').hide()
    $('#resultsCard').hide()
    $('#searchBox').show()
    $('#dataTable').show()

    // reset data list
    dataToDisplay = allData

    // create table fresh
    createTable(allData)
}

function closeResultsCard() {
    // clear results table and hide card
    document.getElementById('clickedEntry').replaceChildren()
    $('#resultsCard').hide()
}

function searchIfEnter(e) {
    if (e.keyCode === 13) {
        e.preventDefault()
        searchDisplayedData()
    }
}

function searchDisplayedData() {
    let searchFor = document.getElementById('searchInput').value.toLowerCase()
    displayedData = allData

    // reset to displaying everything?

    let results = []

    // if there is text entered search
    if (searchFor && searchFor.length > 0) {
        // search title, writers, composers, company, director and cast columns
        displayedData.forEach((entry) => {
            var searchText = (entry['Title'] + entry['Writers'] + entry['Composers'] + entry['Company'] + entry['Director'] + entry['Cast'] + entry['Production Team']).toString().toLowerCase()

            if (searchText.includes(searchFor)) {
                results.push(entry)
            }
        })
        displayedData = results

        createTable(results)
    }
    else {
        createTable(allData)
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = ''
    createTable(allData)
}