 



var allData;
var displayedData

let today = new Date();
let cols;
let numberOfCols = 24;

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
            const modelObj = {
                "Type of Text": "",
                "Author Surname": "",   
                "Author First Name": "",
                "Short Title": "",
                "Language": "",
                "Translator Surname": "",
                "Translator First Name": "",
                "Place of Publication": "",
                "Publisher": "",
                "Printer": "",
                "Latititude": "",
                "Longitude": "",
                "Year of Publication": "",
                "Imprint": "",
                "Format": "",
                "Full Title": "",
                "Edition": "",
                "Volumes": "",
                "Pages": "",
                "Plates": "",
                "Library Holdings": "",
                "STC": "",
                "Additional information"    : ""
            }

            const outputArray = parsedData.map((item) => {
                return { ...modelObj, ...item }
            })
            console.log(outputArray)

            // data processing
           // parsedData = assignIDs(parsedData)
            // displayedData = parsedData
            allData = outputArray
           //  console.log(displayedData)
        setupFilters()
            
            // Get the keys (column names) of an object with all keys present
        // to do this get item with the number of fields closest to correct 
        itemToGetColsFrom = allData[allData.findIndex((entry) => Object.keys(entry).length === numberOfCols)]

            // create table
            createTable(outputArray)
        }
    )
    document.getElementById('browse').style.display = 'inline'
    document.getElementById('searchBox').style.display = 'inline'

    
})





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


function closeResultsCard() {
    // clear results table and hide card
    document.getElementById('clickedEntry').replaceChildren()
    $('#resultsCard').hide()
}
