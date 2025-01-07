

// give each table row a unique ID
function assignIDs(data) {
    for (let index = 0; index < data.length; index++) {
        data[index]['ID'] = index
    }
    return data
}

function createTable(dataToDisplay) {
    displayedData = dataToDisplay
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
                if (item === 'Latititude' || item === 'Edition' || item === 'Plates' || item === 'STC' || item === 'Printer' || item === 'ID' || item === 'Latitude' || item === 'Longitude' || item === 'Format' || item === 'Additional information' || item === 'Available at' || item === 'ESTC' || item === 'Additional authors' || item === 'Full Title' || item === 'Library Holdings' || item === 'Pages' || item === 'Volumes') {    
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

        setCurrentPage(1)

        // set total page number
       
        const els = document.getElementsByClassName('totalPages')
        for (let i = 0; i < els.length; i++) {
            els[i].innerText = allRowsIntoPages.length
        }
        

        // allHtmlRows.forEach((tr) => {
        //     tbody.appendChild(tr)
        // })

        table.appendChild(tbody)
        container.appendChild(table) // Append the table to the container element

        document.getElementById("dataTable").style.display = "inline"
    }
}

function setCurrentPage(num) {
    const els = document.getElementsByClassName('currentPage')
    for (let i = 0; i < els.length; i++) {
        els[i].innerText = num
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

function nextTablePage() {
    //add next rows if there are them
    if (allRowsIntoPages[currentPage + 1]) {
        // remove current rows
        var tbody = document.getElementById('tBodyBrowse')
        tbody.replaceChildren()
        currentPage++
        setCurrentPage(currentPage + 1)
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
        setCurrentPage(currentPage + 1)
        allRowsIntoPages[currentPage].forEach((tr) => {
            tbody.appendChild(tr)
        })
    }
}

module.exports = { createTable, assignIDs, nextTablePage, previousTablePage }