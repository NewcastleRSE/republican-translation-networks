function setupFilters() {
    // create radio buttons for filters
    createRadios('Author Surname', 'authorBtns')
    createRadios('Language', 'languageBtns')
    createRadios('Publisher', 'publisherBtns')

    var acc = document.getElementsByClassName("filtersaccordion");
var i;

for (i = 0; i < acc.length; i++) {
 acc[i].addEventListener("click", function() {

    // reset displayed data to all data
    createTable(allData)
    // set all accordions to 'all' radio button
    setRadiosToAll()

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

function setRadiosToAll() {
    var radios = document.getElementsByTagName('input')
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked && radios[i].id !== 'all') {
            radios[i].checked = false;
        } else if (radios[i].id === 'all') {
            radios[i].checked = true;
        }
    }

}



//  ----- filtering data
function filterRadio(type, filter) {

    var container = document.getElementById('showData')
    container.replaceChildren()
        var section = 'authorBtns'
        if (filter === 'Language') {
            section = 'languageBtns'
        } 
        else if (filter === 'Publisher') {
            section = 'publisherBtns'
        }
    if (type === 'all') {
        createTable(allData)
        // remove any other radio buttons selected
        
        var radios = document.getElementById(section).getElementsByTagName('input')
        
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked && radios[i].id !== 'all') {
                radios[i].checked = false;
            } 
        }
    } else {
        // clear radio button 'all' if checked
        var radios = document.getElementById(section).getElementsByTagName('input')
        
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].id === 'all') {
                radios[i].checked = false;
            } 
        }

        // select only entries where type is correct
        var filteredData = _.filter(allData, function (o) {
            if (o[filter]) {
                return o[filter].startsWith(type);
            }
        });
        
   
        createTable(filteredData)
    }
}

module.exports = { setupFilters , createRadios, filterRadio }