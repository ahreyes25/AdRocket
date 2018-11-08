var loadingFacebook = true;
var loadingGoogle = true;
var currentPage = "google";
var currentPageIndex = 0;

businessInfoAJAX();
facebookAJAX();
googleAJAX();

// p5.js update method
function draw() {
	// Loading Icon
  if (loadingFacebook && currentPage == "facebook") {
    $('div#master-container').addClass('loader');
  }
  else {
    $('div#master-container').removeClass('loader');

    if (currentPage == "facebook") {
      $('[id*="facebook-container-"]').show();
    }
  }
}

// Pagination
function pagination(numberOfPages) {
	// Append tabs for each element
	for (var i = 0; i < numberOfPages; i++) {
  	$('.pagination').append("<li class='page-item drop-shadow'><a class='page-link' href='javascript:void(0)'>" + i + "</a></li>");
  }
  
  // Check for clicks on page tab
	$(".pagination li.page-item").on("click", function() {
	  if ($(this).hasClass('active')) {
  	  return false;
    }
    else {
    	var currentPage = $(this).index();
      currentPageIndex = currentPage;
    	$(".pagination li").removeClass('active');
    	$(this).addClass('active');
      
      // Activate specified one and deactivate others
      for (var j = 0; j < numberOfPages; j++) {
      	if (j == currentPage) {
		      $('div#google-container-' + String(currentPage)).show();
        }
        else {
        	$('div#google-container-' + String(j)).hide();
        }
      }
  	}
	});
}

// Render the json data into the specified container element
function renderData(json, container) {
  $(function() {
  
    const performanceData = json.individual_placement_performances;
    
    // Iterate through performance data
    for (var i = 0; i < performanceData.length; i++) {
    
      var placementPoint = performanceData[i];
      var placementInfo = "| ";
      
      // Create facebook/google div clones
      var dataContainer = document.getElementById('data-template');
      var dataClone = dataContainer.cloneNode(true);
      dataClone.id=container + '-' + String(i);
      dataClone.style.visibility = 'visible !important';
      
      // Append data containers to master div container
      $('div#master-container').append(dataClone);
      
      // Iterate through placement data
      for (var prop in placementPoint) {
     
        if (placementPoint.hasOwnProperty(prop)) {
          if (prop != "placement_id" && prop != "placement_description" && prop != "placement_type_name") {
        
            // Get Card Template and Clone it
            var cardTemplate = document.getElementById('card-template');
            var cardClone = cardTemplate.cloneNode(true);
            cardClone.id="card-clone-" + String(container) + "-" + String(prop) + "-" + String(i);
            cardClone.style.visibility = 'visible';
            
            // Get progress bar and clone it
            var progressTemplate = document.getElementById('progress-template');
            var progressClone = progressTemplate.cloneNode(true);
            progressClone.id="progress-clone-" + String(container) + "-" + String(prop) + "-" + String(i);
            progressClone.style.visibility = 'visible';
            
            // Append new card nodes to container
            $('div#' + String(container) + '-' + String(i) + ' > div#data-cards').append(cardClone);           
            $('div#' + String(container) + '-' + String(i) + ' > div#data-progress').append(progressClone);
            
            // Modify values depending on property
            var cardTextValue = prop;
            var progressPercent = 0;
            // Append data and remove underscores by translating to short hand
            switch(prop) {
              case "cost":
                progressPercent = String(placementPoint[prop]).substr(1);
                break;
              case "impressions":
                progressPercent = placementPoint["reach"] / placementPoint[prop] * 100;
                break;
              case "clicks":
                progressPercent = placementPoint[prop] / placementPoint["reach"] * 100;
                break;
              case "click_through_rate_as_percentage":
                cardTextValue = "ctr";
                progressPercent = parseFloat(String(placementPoint[prop]).slice(0, -1)) * 100;
                break;
              case "cost_per_click":
                progressPercent = parseFloat(String(placementPoint[prop]).substr(1)) / parseFloat(String(placementPoint["cost"]).substr(1)) * 100;
                cardTextValue = "cpc";
                break; 
              case "post_engagements":
                progressPercent = placementPoint[prop] / placementPoint["reach"] * 100;
                cardTextValue = "engagements";
                break;
              case "cost_per_post_engagements":
                progressPercent = String(placementPoint[prop]).substr(1) * 100;
                cardTextValue = "cppe";
                break;
              case "reach":
                progressPercent = placementPoint[prop] / placementPoint["impressions"] * 100;
                break;
              default:
                cardTextValue = prop;
                progressPercent = 0;
                break;
            }
                
            // Get newly created card clone and progress bar clone and add their new modified values
            $('div#card-clone-' + String(container) + "-" + String(prop) + "-" + String(i) + ' > h6#card-title')
              .text(String(cardTextValue));
              
            $('div#card-clone-' + String(container) + "-" + String(prop) + "-" + String(i) + ' > h4#card-value')
              .text(String(placementPoint[prop]));
              
            $('div#progress-clone-' + String(container) + "-" + String(prop) + "-" + String(i) + ' > div#bar')
              .css('width', String(progressPercent) + '%')
              .attr('aria-valuenow', progressPercent);
          }
          else {
            // Add placement info in banner
            placementInfo += String(placementPoint[prop] + " | ");
          }
          
          // Add placement info into container banner
          $('div#' + String(container) + '-' + String(i) + ' > div#data-info').text(placementInfo);
        }
      }
    }
    
    // Setup everything on initial load
    if (container == "google-container") {
	    pagination(performanceData.length);
      
      $('[id*="google-container-"]').show();
      $('[id*="facebook-container-"]').hide();
      $('[id*="pagination"]').show();
      
      // Activate specified one and deactivate others
      for (var j = 0; j < performanceData.length; j++) {
      	if (j == currentPageIndex) {
		      $('div#google-container-' + String(j)).show();
        }
        else {
        	$('div#google-container-' + String(j)).hide();
        }
      }
    }
    else if (container == "facebook-container") {
      $('[id*="facebook-container-"]').hide();
      
      if (currentPage == "facebook") {
	      $('[id*="pagination"]').hide();
      }
    }
    
    // Setup Event Listeners
    $('li#facebook-button').on("click", function() {
    	$('[id*="facebook-container-"]').show();
      $('[id*="google-container-"]').hide();
      $('[id*="pagination"]').hide();
      currentPage = "facebook";
      currentPageIndex = 0;
    });
    
    $('li#google-button').on("click", function() {
    	$('[id*="google-container-"]').show();
      $('[id*="facebook-container-"]').hide();
      $('[id*="pagination"]').show();
      currentPage = "google";
      currentPageIndex = 0;
      
      // Activate specified one and deactivate others
      for (var j = 0; j < performanceData.length; j++) {
      	if (j == currentPageIndex) {
		      $('div#google-container-' + String(j)).show();
        }
        else {
        	$('div#google-container-' + String(j)).hide();
        }
      }
    });
  });
}

function facebookAJAX() {
    var json = {individual_placement_performances:[{"placement_id":"47a8-ba48-c836-2c8b","placement_description":"Facebook Image Ad - 25% Off One Item","placement_type_name":"Facebook Image","cost":"$21.42","impressions":418,"clicks":3,"click_through_rate_as_percentage":"0.72%","cost_per_click":"$7.14","post_engagements":93,"cost_per_post_engagements":"$0.23","reach":365}]};

        $.ajax({
        cache:false,
        type: 'POST',
        url: '/echo/json/',
        data: {
            json:JSON.stringify(json)
        },
        success: function(data) {  
          setTimeout(function() {
          //run code here
          renderData(json, 'facebook-container');
          loadingFacebook = false;
            }, 5000);
        },
        error:function(error){
        },
        dataType: 'json'
    });
}
function googleAJAX() {
    var json = {individual_placement_performances:[{"placement_id":"645d-6a1c-688b-7066","placement_description":"Google Display - Boost - Evergreen","placement_type_name":"Google Display","cost":"$59.10","impressions":10529,"clicks":48,"click_through_rate_as_percentage":"0.46%","cost_per_click":"$1.23","reach":4623},{"placement_id":"6b69-42fd-41d1-51b2","placement_description":"Google Display - Boost - Take 25% Off","placement_type_name":"Google Display","cost":"$52.10","impressions":8411,"clicks":38,"click_through_rate_as_percentage":"0.45%","cost_per_click":"$1.37","reach":3670}]};

        $.ajax({
        cache:false,
        type: 'POST',
        url: '/echo/json/',
        data: {
            json:JSON.stringify(json)
        },
        success: function(data) {
        setTimeout(function() {
        //run code here
        renderData(json, 'google-container');
        loadingGoogle = false;
          }, 100);
        },
        error:function(error){
        },
        dataType: 'json'
    });
}
function businessInfoAJAX() {
    var json = {business_name:"Interview Test Business", business_image_src:"https://www.retailerwebservices.com/adrocket/images/logo.png?ccid=x1c78931"};

        $.ajax({
        cache:false,
        type: 'POST',
        url: '/echo/json/',
        data: {
            json:JSON.stringify(json)
        },
        success: function(data) { 
        setTimeout(function() {
        //run code here
        document.getElementById('navbar-image').src = json.business_image_src;
        document.getElementById('navbar-image').style.visibility = "visible";
          }, 200);        
        },
        error:function(error){
        },
        dataType: 'json'
    });
}