
$(document).on('pagecreate',function(){
		const API_KEY = '8f6120ab5f4b328efa714467eb461276';

		init();

		function init(){
			$('.ui-content').hide();
			getPreferredCities();
			loadHistory();
			if(navigator.geolocation)
			navigator.geolocation.getCurrentPosition(showPosition, showErr);
			else
				console.log("Geolocation is not supported");
		}

		//function to pass in city by name
		function getWeatherDataForMyCity(city){
			getWealtherInfo({cityName: city});
			getForecastInfo({cityName: city});
			$('.ui-content').show();
		}

		//Functions for getting geo locations
		function showPosition(position){
			let myLocation= {};
			myLocation.lat = position.coords.latitude;
			myLocation.lng = position.coords.longitude;
			console.log(position.coords.latitude + "," + position.coords.longitude);
			getWealtherInfo({cords: myLocation});
			getForecastInfo({cords: myLocation});

			$('.ui-content').show();
		}

		function showErr(){
			alert("Location should be turned on for accurate results")
		}

		function resetTable() {
			$("#heading").text('');
			$("#row").text('');
			$("#descrip").text('');
			$("#img").text('');
		}

		/**
		* Weather and Forecast
		* APIs
		* UI updates
		**/
		//Data parsing using ES6
		function parseWeather(weatherInfo){
	 	console.log(weatherInfo);

		let {name, main, weather} = weatherInfo;
		let icon = `http://openweathermap.org/img/w/${weather[0].icon}.png`;

		$('#city').text(name);
		$('#temp').text(main.temp);
		$('#temp').append(' &deg;C');
		$("#forecast").attr('src', icon);
		$('#condition').text(weather[0].description);

	}

		function getWealtherInfo({cords, cityName}){
		let apiUrl = cityName ?
					`http://api.openweathermap.org/data/2.5/weather?
					q=${cityName}
					&appid=${API_KEY}&&units=metric`:
					`http://api.openweathermap.org/data/2.5/weather?
					lat=${cords.lat}&lon=${cords.lng}
					&appid=${API_KEY}&&units=metric`;
		$.ajax({
			url:apiUrl,
			type:'GET',
			datatype: 'json',
			success: parseWeather
		});
	}

		function parseForecast(data){

		let [...forecastList] = data.list;

        for(forecast of forecastList){
        	let[date, time] = forecast.dt_txt.split(" ");
        	forecast.date = date;
    		forecast.time = time;
        }
        // For Next 5 days

		resetTable();

		for(var i=7; i<100; i++){
			if(forecastList[i]){

				let icon = `http://openweathermap.org/img/w/${forecastList[i].weather[0].icon}.png`;
				let image = $('<img></img>').attr("src",icon);

				$("#heading").append('<th>'+forecastList[i].date+'</th>');
				var temperature = $('<td></td>').append(data.list[i].main.temp,'&deg;C');
				$("#row").append(temperature);
				$("#descrip").append('<td>'+forecastList[0].weather[0].description+'</td>');
				$('<td></td>').html(image).appendTo("#img");
			}

			i = i+7;
    }
        //Chart for next 7 hour intervals
        let ctx = document.getElementById("forecastChart").getContext('2d');
        let myChart = new Chart(ctx, {
              type: 'line',
	              data: {
	                  labels: [forecastList[0].time,forecastList[1].time,forecastList[2].time,
	                  forecastList[3].time,forecastList[4].time,forecastList[5].time,forecastList[6].time],
		                datasets: [{
		                  label: 'Temperature in Celsius',
		                  data: [forecastList[0].main.temp, forecastList[1].main.temp,
		                  forecastList[2].main.temp, forecastList[3].main.temp, forecastList[4].main.temp, forecastList[5].main.temp,
		                   forecastList[6].main.temp, forecastList[7].main.temp],
		                  borderWidth: 1,
		                  fill: false
		            	}]
	     		 },
			      options: {
			          scales: {
			            yAxes: [{
			              ticks: {
			                beginAtZero:true
			              }
         			    }]
        			  }
    			  }
        });

	}

		function getForecastInfo({cords, cityName}){
			let apiUrl = cityName ? `http://api.openweathermap.org/data/2.5/forecast?
						q=${cityName}
						&appid=${API_KEY}&&units=metric`
						: `http://api.openweathermap.org/data/2.5/forecast?
						lat=${cords.lat}&lon=${cords.lng}
						&appid=${API_KEY}&&units=metric`;
			$.ajax({
				url:apiUrl,
				type:'GET',
				datatype: 'json',
				success: parseForecast
			});
		}

		/**
		*Preffered City List
		* on click event handler
		**/
		function parseCities(cityData){

			//array destructuring ES6
			let [...preferred] = cityData.preferred;

			for (prefCity of preferred){
				$('#cities').append(`<li><a href="#" data-transition="slide">${prefCity.city}, ${prefCity.country}</a></li>`);
			}

		}

		function getPreferredCities(){
			$.ajax({
				url:'data/preferredCities.json',
				type:'GET',
				datatype: 'json',
				success: parseCities,
				complete: function() {
							$('#cities').listview('refresh');
					}
			});
		}

		$('#cities a').on('click', function(){
			console.log($(this).text());
			getWeatherDataForMyCity($(element.target).text());
		});

		/**
		* Auto Complete feature for city lookup
		* on click event handler
		**/

		$( "#autocomplete" ).on( "filterablebeforefilter", function ( e, data ) {
        var $ul = $( this ),
            $input = $( data.input ),
            value = $input.val(),
            html = "";
        $ul.html( "" );
        if ( value && value.length > 2 ) {
            $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
            $ul.listview( "refresh" );
            $.ajax({
                url: "http://gd.geobytes.com/AutoCompleteCity",
                dataType: "jsonp",
                crossDomain: true,
                data: {
                    q: $input.val()
                }
            })
            .then( function ( response ) {
                $.each( response, function ( i, val ) {
                    html += '<li><a href="#" data-transition="slide">' + val + '</a></li>';
                });
                $ul.html( html );
                $ul.listview( "refresh" );
                $ul.trigger( "updatelayout");
            });
        }
    });

		$(document).on("click", "#autocomplete a", function () {
					let searchResult = $(this).text();
					getWeatherDataForMyCity(searchResult);
					$(this).closest("ul").prev("form").find("input").val('');
					historySearch(searchResult);
		});

		/**
		* Local storage get/set and on click
		**/

		function historySearch(searchResult){
			if(localStorage.getItem("history") === null){
				localStorage.setItem("history", JSON.stringify([]));
			}

			let [cityName, ...country] = searchResult.split(',');

			let city = {
				 "city": cityName,
				 "country": country[country.length - 1]
			};
			let searchHistory = JSON.parse(localStorage.getItem("history"));
			searchHistory.push(city);
			// store the data
			localStorage.setItem("history", JSON.stringify(searchHistory));

			//reload list
			loadHistory();
		}

		function loadHistory(){
			$('#history').text('');

			$('#history').append(`<li> Recent Searches </li>`);

			let preferred = JSON.parse(localStorage.getItem("history"));

			for (prefCity of preferred){
				$('#history').append(`<li><a href="#" data-transition="slide">${prefCity.city}, ${prefCity.country}</a></li>`);
			}

			$('#history').listview('refresh');
		}

		$(document).on("click", "#history a", function () {
					getWeatherDataForMyCity($(this).text());
		});

	});
