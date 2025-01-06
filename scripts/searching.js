
function searchIfEnter(e) {
    if (e.keyCode === 13) {
        e.preventDefault()
        searchDisplayedData()
    }
}

function searchDisplayedData() {
    let searchFor = document.getElementById('searchInput').value.toLowerCase()
    // displayedData = allData

    // reset to displaying everything?

    let results = []

    // if there is text entered search
    if (searchFor && searchFor.length > 0) {
        // search title, writers, composers, company, director and cast columns
        displayedData.forEach((entry) => {
            var searchText = (entry['Author Surname'] + entry['Author First Name'] + entry['Full Title'] + entry['Language'] + entry['Translator Surname'] + entry['Translator First Name'] + entry['Publisher'] + entry['Place of Publication'] + entry['Year of Publication']).toString().toLowerCase()

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

module.exports = { searchIfEnter, searchDisplayedData, clearSearch }