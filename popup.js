gapi_key = 'AIzaSyCzNVFliR8nnSdCeb4JbuYrLJJvf5Uk3cE';
var stored_results = '';
var stored_address = '';
/**
 * Initialize the API client and make a request.
 */
function load() {
  chrome.storage.sync.get(['voting_address'], function(result) {
     if (undefined != result && result.voting_address != '') {
        stored_address = result.voting_address;
        $('#voting-address').val(stored_address);
        if (stored_address != '') {
            lookup_representatives(stored_address, renderRepresentativeList);
            lookup_voter_info(stored_address, renderVoterInfo);
        }
     }
  });
}

/**
 * Build and execute request to look up elections info for provided 
 * address.
 * @param {string} address Address for which to fetch voter info.
 * @param {function(Object)} callback Function which takes the
 *     response object as a parameter.
 */
 function lookup_voter_info(address, callback) {
  /**
   * Request object for given parameters.
   * @type {gapi.client.HttpRequest}
   */
  var req = gapi.client.request({
      'path' : '/civicinfo/v2/voterinfo?key='+gapi_key,
      'params' : {'electionId' : '2000', 'address' : address}
  });
  req.execute(callback);
}

/**
 * Build and execute request to look up representative info for 
 * provided address.
 * @param {string} address Address for which to fetch voter info.
 * @param {function(Object)} callback Function which takes the
 *     response object as a parameter.
 */
 function lookup_representatives(address, callback) {
 /**
   * Election ID for which to fetch voter info.
   * @type {number}
   */
  var electionId = 2000;

  /**
   * Request object for given parameters.
   * @type {gapi.client.HttpRequest}
   */
  var req = gapi.client.request({
      'path' : '/civicinfo/v2/representatives?key='+gapi_key,
      'params' : {'electionId' : electionId, 'address' : address}
  });
  req.execute(callback);
}

/**
 * Render Voter Info.
 * @param {Object} response Response object returned by the API.
 * @param {Object} rawResponse Raw response from the API.
 */
function renderVoterInfo(response, rawResponse) {
    var el = $('#voting-info');
    el.append($('<p>Please check the console for voter info. TODO: display the voter info here.</p>'));
    console.log(response);
}

/**
 * Render Representative List.
 * @param {Object} response Response object returned by the API.
 * @param {Object} rawResponse Raw response from the API.
 */
function renderRepresentativeList(response, rawResponse) {
  stored_results = response;
  var el = $('#representative-list');
  el.empty();
  for(var propertyName in response.divisions) {
    division = response.divisions[propertyName];
    if(division.officeIndices && division.officeIndices.length > 0) {
        // Render the division header
        var row = document.createElement('div');
        row.classList.add('division-header');
        row.appendChild(document.createTextNode(division.name));
        el.append(row);
        // Render the officials for each division
        for(i=0;i<division.officeIndices.length;i++) {
            office = response.offices[division.officeIndices[i]];
            var officialCount = office.officialIndices.length ? office.officialIndices.length : 0;
            for(j=0;j<officialCount;j++) {
              var index = office.officialIndices[j];
              var official = response.officials[index];
              if(undefined !== typeof official){
                  var row = document.createElement('div');
                  row.classList.add('official-container');
                  var imgc = document.createElement('span');
                  imgc.classList.add('img-container');
                  var party = official.party;
                  switch(party) {
                    case "Democratic":
                      imgc.classList.add('democrat');
                      break;
                    case "Republican":
                      imgc.classList.add('republican');
                      break;
                    default:
                      imgc.classList.add('unknown-party');
                  }
                  var img = document.createElement('img'); 
                  img.src = official.photoUrl ? official.photoUrl : 'blank-person.jpg';
                  imgc.appendChild(img);
                  row.appendChild(imgc);
                  row.appendChild(document.createTextNode(official.name));
                  row.appendChild(document.createElement('br'));
                  row.appendChild(document.createTextNode(office.name));
                  if(official.phones.length > 0) {
                    row.appendChild(document.createElement('br'));
                    row.appendChild(document.createTextNode(official.phones[0]));
                  }
                  if(official.emails) {
                    row.appendChild(document.createElement('br'));
                    row.appendChild(document.createTextNode(official.emails[0]));
                  }
                  row.appendChild(document.createElement('br'));
                  var a = document.createElement('a');
                  a.setAttribute('href','');
                  a.innerHTML = 'More Info';
                  a.classList.add('render-representative');
                  a.setAttribute('data-official-index',index);
                  a.setAttribute('data-office-index',division.officeIndices[i]);
                  row.appendChild(a);
                  el.append(row);
                } // End if official is defined
            } // End Render Offical for loop
        } // End Office Indices for loop
    } // End if office indeces length > 0
  } // End Divisions for loop
  if (!response || response.error) {
    el.appendChild(document.createTextNode('Error while trying to fetch representative information'));
  }
}

function renderOfficial(official,office) {
    var el = $('#representative-info');
    el.empty();
    if(undefined !== typeof official){
      var row = document.createElement('div');
      row.classList.add('official-container');
      var imgc = document.createElement('span');
      imgc.classList.add('img-container');
      var party = official.party;
      switch(party) {
        case "Democratic":
          imgc.classList.add('democrat');
          break;
        case "Republican":
          imgc.classList.add('republican');
          break;
        default:
          imgc.classList.add('unknown-party');
      }
      var img = document.createElement('img'); 
      img.src = official.photoUrl ? official.photoUrl : 'blank-person.jpg';
      imgc.appendChild(img);
      row.appendChild(imgc);
      row.appendChild(document.createTextNode(official.name));
      row.appendChild(document.createElement('br'));
      row.appendChild(document.createTextNode(office.name));
      if(official.address && official.address.length > 0) {
        for(i=0;i<official.address.length;i++){
          address = official.address[i];
          if(address.line1 != '') {
            row.appendChild(document.createElement('br'));
            row.appendChild(document.createTextNode(address.line1));
          }  
          if(address.line2 != '') {
            row.appendChild(document.createElement('br'));
            row.appendChild(document.createTextNode(address.line2));
          }  
          if(address.line3 != '') {
            row.appendChild(document.createElement('br'));
            row.appendChild(document.createTextNode(address.line3));
          }
          row.appendChild(document.createElement('br'));
          row.appendChild(document.createTextNode(address.city+', '+address.state+' '+address.zip));
          
        }
      }
      if(official.phones && official.phones.length > 0) {
        for(i=0;i<official.phones.length;i++) {
            row.appendChild(document.createElement('br'));
            row.appendChild(document.createTextNode(official.phones[i]));
        }
      }
      if(official.emails && official.emails.length > 0) {
        for(i=0;i<official.emails.length;i++) {
            row.appendChild(document.createElement('br'));
            row.appendChild(document.createTextNode(official.emails[i]));
        }
      }
      if(official.channels && official.channels.length > 0) {
        for(i=0;i<official.channels.length;i++) {
            row.appendChild(document.createElement('br'));
            row.appendChild(document.createTextNode(official.channels[i].type+': '+official.channels[i].id));
        }
      }
      if(official.urls && official.urls.length > 0) {
        for(i=0;i<official.urls.length;i++) {
            row.appendChild(document.createElement('br'));
            row.appendChild(document.createTextNode(official.urls[i]));
        }
      }
      row.appendChild(document.createElement('br'));
      var a = document.createElement('a');
      a.setAttribute('href','');
      a.innerHTML = 'Back to List';
      a.classList.add('replist-link');
      row.appendChild(a);
      el.append(row);
    } else {
        row.appendChild(document.createTextNode('We\'re sorry; we couldn\'t find any results for the address you have stored.'));
    } // End if official is defined
}


function show_page(page) {
    // Hide everything
    $('#main-page').hide();
    $('#settings').hide();
    $('#voting-info').hide();
    $('#representative-list').hide();
    $('#representative-info').hide();
    $('#alarm').hide();
    // Show the selected page.
    $(page).show();
}

document.addEventListener('click', function (event) {
    event.preventDefault();
    
    if (event.target.matches('#save-user-info')) {
	    value=$('#voting-address')[0].value;
        if (value != '') {
            chrome.storage.sync.set({'voting_address':value},function(){
                stored_address = value;
                lookup_representatives(stored_address, renderRepresentativeList);
                lookup_voter_info(stored_address, renderVoterInfo);
                show_page('#voter-info');
            });
        }
    }
    
    if (event.target.matches('.render-representative')) {
        officialIndex = event.target.dataset.officialIndex;
        officeIndex = event.target.dataset.officeIndex;
	    official = stored_results.officials[officialIndex];
        office = stored_results.offices[officeIndex];
        renderOfficial(official,office);
        show_page('#representative-info');
    } 
    
    if (event.target.matches('.main-page-link')) {
        show_page('#main-page');
    }
    
    if (event.target.matches('.voting-info-link')) {
        show_page('#voting-info');
    }
    
    if (event.target.matches('.settings-link')) {
        show_page('#settings');
    }
    
    if (event.target.matches('.replist-link')) {
        show_page('#representative-list');
    }
}, false);

show_page('#main-page');
setTimeout(load, 2000);
