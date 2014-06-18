$(document).ready(function() {
	
	//This file contains some of the article/event code loaded on client side. NPM-stuff for simulation mostly in batch-files instead of called directly.
	
	$('#main-nav li a').on('click', function() {
		$(this).parent().parent().find('.active').removeClass('active');
		$(this).parent().addClass('active').css('font-weight', 'bold');
	});
	Companies = new Meteor.Collection("companies");
	Articles = new Meteor.Collection("articles");
	Segments = new Meteor.Collection("segments");
	Events = new Meteor.Collection("events");
	Rules = new Meteor.Collection("rules");
	Meteor.subscribe("companies");
	Meteor.subscribe("articles");
	Meteor.subscribe("segments");
	Meteor.subscribe("events");
	Meteor.subscribe("rules");
	Days = new Meteor.Collection("days");
	Meteor.subscribe("days");
	// if( Companies.findOne({name: "Statoil"}) ==null) {
		// console.log('its null');
		// Companies.insert({name: "Statoil", ticker: "STL"});
		
	// console.log(Companies.find({name: "Statoil"}).fetch());
	// };
	
	
	
	// Lots of dc.js-stuff based on the template. Needs to be changed a lot based on data.
	var gainOrLossChart = dc.pieChart("#gain-loss-chart");
	var fluctuationChart = dc.barChart("#fluctuation-chart");
	var quarterChart = dc.pieChart("#quarter-chart");
	var dayOfWeekChart = dc.rowChart("#day-of-week-chart");
	var moveChart = dc.lineChart("#monthly-move-chart");
	var volumeChart = dc.barChart("#monthly-volume-chart");
	var yearlyBubbleChart = dc.bubbleChart("#yearly-bubble-chart");
	console.log(Segments.find({month: '04'}).count());
	Meteor.call('getSomeData', null, function(error, data) {
		console.log(data[52]);
		
		
		// var dateFormat = d3.time.format("%m/%d/%Y");
		// var numberFormat = d3.format(".2f");

		// data.forEach(function (d) {
			// d.dd = dateFormat.parse(d.date);
			// d.month = d3.time.month(d.dd); // pre-calculate month for better performance
			// d.close = +d.close; // coerce to number
			// d.open = +d.open;
		// });
			
		var ndx = crossfilter(data);
		var all = ndx.groupAll();
		
		var yearlyPerformanceGroup = yearlyDimension.group().reduce(
        /* callback for when data is added to the current filter results */
        function (p, v) {
            ++p.count;
            p.absGain += v.close - v.open;
            p.fluctuation += Math.abs(v.close - v.open);
            p.sumIndex += (v.open + v.close) / 2;
            p.avgIndex = p.sumIndex / p.count;
            p.percentageGain = (p.absGain / p.avgIndex) * 100;
            p.fluctuationPercentage = (p.fluctuation / p.avgIndex) * 100;
            return p;
        },
        /* callback for when data is removed from the current filter results */
        function (p, v) {
            --p.count;
            p.absGain -= v.close - v.open;
            p.fluctuation -= Math.abs(v.close - v.open);
            p.sumIndex -= (v.open + v.close) / 2;
            p.avgIndex = p.sumIndex / p.count;
            p.percentageGain = (p.absGain / p.avgIndex) * 100;
            p.fluctuationPercentage = (p.fluctuation / p.avgIndex) * 100;
            return p;
        },
        /* initialize p */
        function () {
            return {count: 0, absGain: 0, fluctuation: 0, fluctuationPercentage: 0, sumIndex: 0, avgIndex: 0, percentageGain: 0};
        }
    );
	
	var dateDimension = ndx.dimension(function (d) {
        return d.dd;
    });
	
	var moveMonths = ndx.dimension(function (d) {
        return d.month;
    });
	
	  var monthlyMoveGroup = moveMonths.group().reduceSum(function (d) {
        return Math.abs(d.close - d.open);
    });
	
	 var volumeByMonthGroup = moveMonths.group().reduceSum(function (d) {
        return d.volume / 500000;
    });
    var indexAvgByMonthGroup = moveMonths.group().reduce(
        function (p, v) {
            ++p.days;
            p.total += (v.open + v.close) / 2;
            p.avg = Math.round(p.total / p.days);
            return p;
        },
        function (p, v) {
            --p.days;
            p.total -= (v.open + v.close) / 2;
            p.avg = p.days ? Math.round(p.total / p.days) : 0;
            return p;
        },
        function () {
            return {days: 0, total: 0, avg: 0};
        }
    );
	 var gainOrLoss = ndx.dimension(function (d) {
        return d.open > d.close ? "Loss" : "Gain";
    });
	
	 var gainOrLossGroup = gainOrLoss.group();
	 
	  var fluctuation = ndx.dimension(function (d) {
        return Math.round((d.close - d.open) / d.open * 100);
    });
    var fluctuationGroup = fluctuation.group();
	
	     var month = d.dd.getMonth();
        if (month <= 2)
            return "Q1";
        else if (month > 3 && month <= 5)
            return "Q2";
        else if (month > 5 && month <= 8)
            return "Q3";
        else
            return "Q4";
    });
    var quarterGroup = quarter.group().reduceSum(function (d) {
        return d.volume;
    });
	
	    var dayOfWeek = ndx.dimension(function (d) {
        var day = d.dd.getDay();
        var name=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        return day+"."+name[day];
     });
    var dayOfWeekGroup = dayOfWeek.group();
	
	
	 /* dc.bubbleChart("#yearly-bubble-chart", "chartGroup") */
    yearlyBubbleChart
        .width(990) // (optional) define chart width, :default = 200
        .height(250)  // (optional) define chart height, :default = 200
        .transitionDuration(1500) // (optional) define chart transition duration, :default = 750
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(yearlyDimension)
		
		
		 .group(yearlyPerformanceGroup)
        .colors(colorbrewer.RdYlGn[9]) // (optional) define color function or array for bubbles
        .colorDomain([-500, 500]) //(optional) define color domain to match your data domain if you want to bind data or color
		
		
		 .colorAccessor(function (d) {
            return d.value.absGain;
        })
        .keyAccessor(function (p) {
            return p.value.absGain;
        })
        .valueAccessor(function (p) {
            return p.value.percentageGain;
        })
        .radiusValueAccessor(function (p) {
            return p.value.fluctuationPercentage;
        })
        .maxBubbleRelativeSize(0.3)
        .x(d3.scale.linear().domain([-2500, 2500]))
        .y(d3.scale.linear().domain([-100, 100]))
        .r(d3.scale.linear().domain([0, 4000]))
		
		   .elasticY(true)
        .elasticX(true)
        .yAxisPadding(100)
        .xAxisPadding(500)
        .renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
        .renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false
        .xAxisLabel('Index Gain') // (optional) render an axis label below the x axis
        .yAxisLabel('Index Gain %') // (optional) render a vertical axis lable left of the y axis
		
		   .renderLabel(true) // (optional) whether chart should render labels, :default = true
        .label(function (p) {
            return p.key;
        })
        .renderTitle(true) // (optional) whether chart should render titles, :default = false
        .title(function (p) {
            return [p.key,
                   "Index Gain: " + numberFormat(p.value.absGain),
                   "Index Gain in Percentage: " + numberFormat(p.value.percentageGain) + "%",
                   "Fluctuation / Index Ratio: " + numberFormat(p.value.fluctuationPercentage) + "%"]
                   .join("\n");
        })
		
		
		  .yAxis().tickFormat(function (v) {
            return v + "%";
        });
		
		  gainOrLossChart
        .width(180) // (optional) define chart width, :default = 200
        .height(180) // (optional) define chart height, :default = 200
        .radius(80) // define pie radius
        .dimension(gainOrLoss) // set dimension
        .group(gainOrLossGroup) // set group
        /* (optional) by default pie chart will use group.key as it's label
         * but you can overwrite it with a closure */
        .label(function (d) {
            if (gainOrLossChart.hasFilter() && !gainOrLossChart.hasFilter(d.key))
                return d.key + "(0%)";
            return d.key + "(" + Math.floor(d.value / all.value() * 100) + "%)";
        }) 
		
		
		 quarterChart.width(180)
        .height(180)
        .radius(80)
        .innerRadius(30)
        .dimension(quarter)
        .group(quarterGroup);
		
		  dayOfWeekChart.width(180)
        .height(180)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeek)
		
		
		 /* dc.barChart("#volume-month-chart") */
    fluctuationChart.width(420)
        .height(180)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(fluctuation)
        .group(fluctuationGroup)
        .elasticY(true)
		
		
		
		 fluctuationChart.xAxis().tickFormat(
        function (v) { return v + "%"; });
    fluctuationChart.yAxis().ticks(5);
	
	
	moveChart
        .renderArea(true)
        .width(990)
        .height(200)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
        .dimension(moveMonths)
        .mouseZoomable(true)
		
		
		.rangeChart(volumeChart)
        .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
        .round(d3.time.month.round)
        .xUnits(d3.time.months)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(false)
		
		
		  .group(indexAvgByMonthGroup, "Monthly Index Average")
        .valueAccessor(function (d) {
            return d.value.avg;
        })
		
		 volumeChart.width(990)
        .height(40)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
        .dimension(moveMonths)
        .group(volumeByMonthGroup)
        .centerBar(true)
        .gap(1)
        .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
        .round(d3.time.month.round)
        .alwaysUseRounding(true)
        .xUnits(d3.time.months);
		
		
		dc.dataTable(".dc-data-table")
        .dimension(dateDimension)
	 
		.svg(d3.select("#bubble-overlay svg"))
            .width(990) // (optional) define chart width, :default = 200
            .height(500) // (optional) define chart height, :default = 200
            .transitionDuration(1000) // (optional) define chart transition duration, :default = 1000
            .dimension(states) // set crossfilter dimension, dimension key should match the name retrieved in geo json layer
            .group(stateRaisedSum) // set crossfilter group
	 
	 
		  dc.renderAll("group"); dc.redrawAll();
	});
});

Template.main.helpers({
  route: function () {
    return Session.get("currentPage");
  },
  routeIS: function(routeTemp){
	return Session.get("currentPage") === routeTemp;
  }
});

// Template.main.route = function () {
  // return Session.get("route");
// };
var tempfile;
Template.uploadStock.events({
	"change #files": function (e) {
		console.log(e);
		var files = e.target.files || e.dataTransfer.files;
		for (var i = 0, file; file = files[i]; i++) {
			console.log(file);
			tempfile = file;
			if (file.type.indexOf("application/vnd.ms-excel") == 0) {
				var reader = new FileReader();
				reader.onloadend = function (e) {
				var text = e.target.result;
				// console.log(text);
				// var all = $.csv.toObjects(text);
				all = text.split('\n');
				// console.log(text.split('\n')[0]);
				var vals;
				var dateObjs;
				var date;
				var month;
				var year;
				var price;
				var lastPrice = 0;
				var daySave;
				var gain = 0;
				var file = tempfile;
				_.each(all, function (entry) {
					/* Members.insert(entry); */
					if(entry != "") {
					vals = entry.split(';');
					dateObjs = vals[0].split(',');
					console.log(dateObjs);
					date = dateObjs[0];
					month = dateObjs[1];
					year = dateObjs[2].split(' ')[0];
					price = vals[1];
					// console.log(price);
					price = price.replace(',', '.');
					
					//Making the save-objects
					if(lastPrice == 0){
						gain = 0;
						daySave = { price: price, gain: gain, fluct: gain/price };
					}
					else{
						gain = price - lastPrice;
						daySave = { price: price, gain: gain, fluct: gain/price };
					}					
					// console.log(daySave);
					
					
					//Save stuff
					Meteor.call( 'upsertPrices',year, month, date, file.name, daySave);
					console.log('updated');
					// , function(e, res) {
						// console.log(error+' <e and res> '+res);
					// });
					// if(file.name== "stl.csv") {
						// Segments.upsert({year: year, month: month, day: date}, {$set: { stl: daySave}});
					// }
					// else if(file.name== "sdrl.csv") {
						// Segments.upsert({year: year, month: month, day: date}, {$set: { sdrl: daySave}});
					// }
					// else if(file.name== "akso.csv") {
						// Segments.upsert({year: year, month: month, day: date}, {$set: { akso: daySave}});
					// }
					// else if(file.name== "detnor.csv") {
						// Segments.upsert({year: year, month: month, day: date}, {$set: { detnor: daySave}});
					// }
					// else if(file.name== "dno.csv") {
						// Segments.upsert({year: year, month: month, day: date}, {$set: { dno: daySave}});
					// }
					// else if(file.name== "foe.csv") {
						// Segments.upsert({year: year, month: month, day: date}, {$set: { foe: daySave}});
					// }
					// else if(file.name== "pgs.csv") {
						// Segments.upsert({year: year, month: month, day: date}, {$set: { pgs: daySave}});
					// }
					// else if(file.name== "prs.csv") {
						// Segments.upsert({year: year, month: month, day: date}, {$set: { prs: daySave}});
					// }
					// else if(file.name== "sub.csv") {
						// Segments.upsert({year: year, month: month, day: date}, {$set: { sub: daySave}});
					// }
					// else if(file.name== "tgs.csv") {
						// Segments.upsert({year: year, month: month, day: date}, {$set: { tgs: daySave}});
					// }
					
					//to end..
						lastPrice=price;
					}
				});
				}
				//Read as text
				reader.readAsText(file);
			}
		}
	}
});

Template.uploadArticles.events({
	"change #artfile": function (e) {
	console.log(Companies.find({name: "Statoil"}).fetch());
	// Meteor.call("uploadArticles", "S:\\dl\\Prices-2014-05-22\\Prices\\Korpus\\dn\\2005\\", function(e){
				// console.log(e);
	// });
		console.log(e);
		var files = e.target.files || e.dataTransfer.files;
		for (var i = 0, file; file = files[i]; i++) {
			console.log(e.target.value);
			
			console.log(file);
			// var fs = NPM.require('fs');
			// var path = NPM.require('path');
			// console.log('npms done');
			// var data = fs.readFileSync(e.target.value);
			// console.log('dataread done');
			// console.log(data);
			// var allData = data.split('\n');
			// console.log(allData[1]);
			// if (file.type == "") {
				var reader = new FileReader();
				reader.onloadend = function (e) {
					console.log('onloadend');
					var text = e.target.result;
					text = text.replace(/\\'e5/g, 'å');
					text = text.replace(/\\'e6/g, 'æ');
					text = text.replace(/\\'f8/g, 'ø');
					text = text.replace(/\\'c5/g, 'Å');
					text = text.replace(/\\'d6/g, 'Ø');
					text = text.replace(/\\'d8/g, 'Ø');
					text = text.replace(/\\'c6/g, 'Æ');
					text = text.replace(/\\par/g, '');
					// console.log(text);
					// console.log('\\\'e5');
					// console.log(/\\'e5/g);
					// console.log(e.target.result);
					// console.log(text);
					// var all = $.csv.toObjects(text);
					var all = text.split('##U');
					// console.log(text.split('\n')[0]);
					
					console.log(all[8]);
					console.log(text.search('¶'));
					var vals;
					var dateObjs;
					var day;
					var month;
					var year;
					var price;
					var uri;
					var temp;
					var article;
					var people;
					var companies;
					var type;
					var segInt = 0;
					var doclist = '';
					var articleFile = '';
					var batFile = '';
					var hour;
					var minute;
					var second;
					_.each(all, function (entry) {
						vals = entry.split('\\\'b6');
						articleFile = '';
						companies = null;
						people = null;
						
						
						temp = vals[0].replace(' #', '').replace('##B ', '').replace('##A ', '').replace('##M ', '').replace('##D ', '').replace(/>/g, '');
						// console.log(temp);
						temp = temp.split('\n');
						
						if( temp[0].search('naringsliv') != -1){
							type = 'Næringsliv';
						
						}
						else if( temp[0].search('energi') != -1){
							type = 'Energi';
						
						}
						else if( temp[0].search('bors') != -1){
							type = 'Børs & Marked';
						
						}
						else{
							type = 'Annen';
						
						}
						// console.log(article);
						vals.shift();
						// console.log(vals[1]);
						
						var dateO = new Date(temp[2], temp[3], temp[4], 0, 0, 0, 0); 
						var dayOfWeek = dateO.getDay();
						if(dayOfWeek == 6 || dayOfWeek ==7) {
							dayOfWeek = 5;
						}
						
						
						
						var people = [];
						var companies = [];
						var companypeople = [];
						
						_.each(vals, function(segment) {
							
							//Make lower case to be easier.
							segment = segment.toLowerCase();
							
							//First, though, perform FindPeople. What else is needed?
							//FindCompany. Mark them #PossibleCompany and #PossibleInsider
							if(segment.search('robert adams') != -1) {
								people.push('robert adams');
								companypeople.push('statoil');
								segment.replace('robert adams', '#possibleinsider #cfo');
							}
							if(segment.search('helge lund') != -1) {
								people.push('helge lund');
								companypeople.push('statoil');
								segment.replace('helge lund', '#possibleinsider #ceo');
							}
							if(segment.search('benedikte bjørn') != -1) {
								people.push('benedikte bjørn');
								companypeople.push('statoil');
								segment.replace('benedikte bjørn', '#possibleinsider');
							}
							if(segment.search('tim dodson') != -1) {
								people.push('tim dodson');
								companypeople.push('statoil');
								segment.replace('tim dodson', '#possibleinsider');
							}
							if(segment.search('reidar gjærum') != -1) {
								people.push('reidar gjærum');
								companypeople.push('statoil');
								segment.replace('reidar gjærum', '#possibleinsider');
							}
							if(segment.search('hilde merete nafstad') != -1) {
								people.push('hilde merete nafstad');
								companypeople.push('statoil');
								segment.replace('hilde merete nafstad', '#possibleinsider #relations');
							}
							if(segment.search('nafstad') != -1) {
								people.push('hilde merete nafstad');
								companypeople.push('statoil');
								segment.replace('nafstad', '#possibleinsider #relations');
							}
							if(segment.search('svein skeie') != -1) {
								people.push('svein skeie');
								companypeople.push('statoil');
								segment.replace('svein skeie', '#possibleinsider');
							}
							if(segment.search('statoil') != -1) {
								// people.push('benedikte bjørn');
								// companypeople.push('statoil');
								companies.push('statoil');
								segment.replace('statoil', '#company');
							}
							
							
							
							if(segment.search('alexandra blankenship') != -1) {
								people.push('alexandra blankenship');
								companypeople.push('seadrill');
								segment.replace('alexandra blankenship', '#possibleinsider');
							}
							if(segment.search('john fredriksen') != -1) {
								people.push('john fredriksen');
								companypeople.push('seadrill');
								segment.replace('john fredriksen', '#possibleinsider #ceo');
							}
							if(segment.search('kathrine fredriksen') != -1) {
								people.push('kathrine fredriksen');
								companypeople.push('seadrill');
								segment.replace('kathrine fredriksen', '#possibleinsider');
							}
							if(segment.search('erling lind') != -1) {
								people.push('erling lind');
								companypeople.push('erling lind');
								segment.replace('erling lind', '#possiblelawyer #possibleinsider');
							}
							if(segment.search('lundetræ') != -1) {
								people.push('magnus rune lundetra');
								companypeople.push('seadrill');
								segment.replace('lundetræ', '#possibleinsider #cfo');
							}
							if(segment.search('carl erik steen') != -1) {
								people.push('carl erik steen');
								companypeople.push('seadrill');
								segment.replace('carl erik steen', '#possibleinsider');
							}
							if(segment.search('per winther wullf') != -1) {
								people.push('per winther wullf');
								companypeople.push('seadrill');
								segment.replace('per winther wullf', '#possibleinsider #ceo');
							}
							if(segment.search('seadrill') != -1) {
								// people.push('benedikte bjørn');
								// companypeople.push('statoil');
								companies.push('seadrill');
								segment.replace('seadrill', '#company');
							}
							
							
							if(segment.search('cahuzac') != -1) {
								people.push('jean p. cahuzac');
								companypeople.push('subsea 7');
								segment.replace('cahuzac', '#possibleinsider #ceo');
							}
							if(segment.search('john evans') != -1) {
								people.push('john evans');
								companypeople.push('subsea 7');
								segment.replace('john evans', '#possibleinsider #coo');
							}
							if(segment.search('ricardo rosa') != -1) {
								people.push('ricardo rosa');
								companypeople.push('subsea 7');
								segment.replace('ricardo rosa', '#possibleinsider #cfo');
							}
							if(segment.search('cahuzac') != -1) {
								people.push('jean p. cahuzac');
								companypeople.push('subsea 7');
								segment.replace('cahuzac', '#possibleinsider #ceo');
							}
							if(segment.search('kristian siem') != -1) {
								people.push('kristian siem');
								companypeople.push('subsea 7');
								segment.replace('kristian siem', '#possibleinsider #styreleder');
							}
							if(segment.search('subsea 7') != -1) {
								// people.push('benedikte bjørn');
								// companypeople.push('statoil');
								companies.push('subsea 7');
								segment.replace('subsea 7', '#company');
							}
							
							
							if(segment.search('leif hejø borge') != -1) {
								people.push('leif hejø borge');
								companypeople.push('aker solutions');
								segment.replace('leif hejø borge', '#possibleinsider #cfo');
							}
							if(segment.search('nicoletta giadrossi') != -1) {
								people.push('nicoletta giadrossi');
								companypeople.push('aker solutions');
								segment.replace('nicoletta giadrossi', '#possibleinsider #coo');
							}
							if(segment.search('per harald kongelf') != -1) {
								people.push('per harald kongelf');
								companypeople.push('aker solutions');
								segment.replace('per harald kongelf', '#possibleinsider');
							}
							if(segment.search('bunny nooryani') != -1) {
								people.push('bunny nooryani');
								companypeople.push('aker solutions');
								segment.replace('bunny nooryani', '#possibleinsider #cfo');
							}
							if(segment.search('aker solutions') != -1) {
								// people.push('benedikte bjørn');
								// companypeople.push('statoil');
								companies.push('aker solutions');
								segment.replace('aker solutions', '#company');
							}
							
							
							
							
							if(segment.search('bjørn kenneth dale') != -1) {
								people.push('bjørn kenneth dale');
								companypeople.push('dno international');
								segment.replace('bjørn kenneth dale', '#possibleinsider #ceo');
							}
							if(segment.search('andrew dymond') != -1) {
								people.push('andrew dymond');
								companypeople.push('dno international');
								segment.replace('andrew dymond', '#possibleinsider #relations');
							}
							if(segment.search('haakon sandborg') != -1) {
								people.push('haakon sandborg');
								companypeople.push('dno international');
								segment.replace('haakon sandborg', '#possibleinsider #cfo');
							}
							
							if(segment.search('dno international') != -1) {
								// people.push('benedikte bjørn');
								// companypeople.push('statoil');
								companies.push('dno international');
								segment.replace('dno international', '#company');
							}
							
							
							
							
							if(segment.search('torgeir anda') != -1) {
								people.push('torgeir anda');
								companypeople.push('det norske oljeselskap');
								segment.replace('torgeir anda', '#possibleinsider #communication');
							}
							if(segment.search('karl johnny hersvik') != -1) {
								people.push('karl johnny hersvik');
								companypeople.push('det norske oljeselskap');
								segment.replace('karl johnny hersvik', '#possibleinsider #ceo');
							}
							if(segment.search('sverre skogen') != -1) {
								people.push('sverre skogen');
								companypeople.push('det norske oljeselskap');
								segment.replace('sverre skogen', '#possibleinsider #styreleder');
							}
							if(segment.search('alexander krane') != -1) {
								people.push('alexander krane');
								companypeople.push('det norske oljeselskap');
								segment.replace('alexander krane', '#possibleinsider #cfo');
							}
							if(segment.search('det norske oljeselskap') != -1) {
								// people.push('benedikte bjørn');
								// companypeople.push('statoil');
								companies.push('det norske oljeselskap');
								segment.replace('det norske oljeselskap', '#company');
							}
							
							
							
							if(segment.search('ivar brandvold') != -1) {
								people.push('ivar brandvold');
								companypeople.push('fred. olsen energy');
								segment.replace('ivar brandvold', '#possibleinsider #ceo');
							}
							if(segment.search('hjalmar krogseth moe') != -1) {
								people.push('hjalmar krogseth moe');
								companypeople.push('fred. olsen energy');
								segment.replace('hjalmar krogseth moe', '#possibleinsider #cfo');
							}
							if(segment.search('anette olsen') != -1) {
								people.push('anette olsen');
								companypeople.push('fred. olsen energy');
								segment.replace('anette olsen', '#possibleinsider #styreleder');
							}
							if(segment.search('fred. olsen energy') != -1) {
								// people.push('benedikte bjørn');
								// companypeople.push('statoil');
								companies.push('fred. olsen energy');
								segment.replace('fred. olsen energy', '#company');
							}
							
							
							if(segment.search('jon erik reinhardsen') != -1) {
								people.push('jon erik reinhardsen');
								companypeople.push('petroleum geo-services');
								segment.replace('jon erik reinhardsen', '#possibleinsider #ceo');
							}
							if(segment.search('bård stenberg') != -1) {
								people.push('bård stenberg');
								companypeople.push('petroleum geo-services');
								segment.replace('bård stenberg', '#possibleinsider #relations');
							}
							if(segment.search('gottfred langseth') != -1) {
								people.push('gottfred langseth');
								companypeople.push('petroleum geo-services');
								segment.replace('gottfred langseth', '#possibleinsider #cfo');
							}
							if(segment.search('francis robert gugen') != -1) {
								people.push('francis robert gugen');
								companypeople.push('petroleum geo-services');
								segment.replace('francis robert gugen', '#possibleinsider #styreleder');
							}
							if(segment.search('petroleum geo-services') != -1) {
								// people.push('benedikte bjørn');
								// companypeople.push('statoil');
								companies.push('petroleum geo-services');
								segment.replace('petroleum geo-services', '#company');
							}
							
							
							if(segment.search('georgina georgiou') != -1) {
								people.push('georgina georgiou');
								companypeople.push('prosafe');
								segment.replace('georgina georgiou', '#possibleinsider #ceo');
							}
							if(segment.search('karl ronny klungtvedt') != -1) {
								people.push('karl ronny klungtvedt');
								companypeople.push('prosafe');
								segment.replace('karl ronny klungtvedt', '#possibleinsider #ceo');
							}
							if(segment.search('karl ronny klungtvedt') != -1) {
								people.push('karl ronny klungtvedt');
								companypeople.push('prosafe');
								segment.replace('karl ronny klungtvedt', '#possibleinsider #ceo');
							}						
							if(segment.search('sven børre larsen') != -1) {
								people.push('sven børre larsen');
								companypeople.push('prosafe');
								segment.replace('sven børre larsen', '#possibleinsider #cfo');
							}
							if(segment.search('prosafe') != -1) {
								// people.push('benedikte bjørn');
								// companypeople.push('statoil');
								companies.push('prosafe');
								segment.replace('prosafe', '#company');
							}
							
							
							if(segment.search('henry hamilton') != -1) {
								people.push('henry hamilton');
								companypeople.push('tgs-nopec');
								segment.replace('henry hamilton', '#possibleinsider #styreleder');
							}
							if(segment.search('tgs-nopec') != -1) {
								// people.push('benedikte bjørn');
								// companypeople.push('statoil');
								companies.push('tgs-nopec');
								segment.replace('tgs-nopec', '#company');
							}
							
							
							
							//Sat/sun need elimination, and dayOfWeek saving.
							if(segment.search('publisert: ') != -1) {
								// people.push('Benedikte Bjørn');
								// companyPeople.push('Statoil');
								// companies.push('TGS-NOPEC');
								segment = segment.replace('publisert: ', '');
								// var second =segment.split('.');
								try{
									second = segment.split(' - ')[1].split('oppdatert: ')[0].split(':');
								
								// 
								// console.log(second);
								hour = second[0];
								minute = second[1];
								// console.log(second);
								// console.log(hour+':'+minute);
								segment = '';
								}
								catch(ex){
									console.log(ex);
								}
							}
							
							//Perform stemming, case-insensitivity, removal of signs like .,'-";! and the like, and remove words 3 and under letters. if this is more than 5 words, this is a segment. ArticleId needed.
							segment = segment.replace('.', ' ').replace(',', ' ').replace('\'', ' ').replace('-', ' ').replace('"', ' ').replace(';', ' ').replace('!', ' ');
							// segment = segment.replace(/(\b(\w{1,5})\b(\s|$))/g,'').split(" ");
							segment = segment.split( ' ' ).filter(function ( str ) {
								var word = str.match(/(\w+)/);
								return word && word[0].length > 5;
							}).join( ' ' );
							// console.log(segment);		
					
							
							// if(article.type == "Energi" && segment != ''){
								// segInt++;
								// download('test'+segInt+'.txt', segment);
								// segment = 'segNo'+segInt+' '+segment;
								// segment = segment+ ' my@separator' ;
								// segment.replace(/\r\n|\r|\n/, ' ');
								articleFile = articleFile+segment+'\n';
								// doclist = doclist+'test'+segInt+'.txt\n';
								// batFile = batFile +'findstr /R "'+'segNo'+segInt+'" test.txt > test'+segInt+'.txt\n';
								// console.log(segInt);
								// console.log(segment.split(/\r\n|\r|\n/).length);
							// }
							// download('test.txt', 'Hello world!');
							
							//Stemming req NPM! https://github.com/shibukawa/snowball-stemmer.jsx
							
							// console.log(people);
							// console.log(companies);
							// console.log(companyPeople);
						});
						/* Members.insert(entry); */
						// vals = entry.split(';');
						// dateObjs = vals[0].split(',');
						// date = dateObjs[0];
						// month = dateObjs[1];
						// year = dateObjs[2].split(' ')[0];
						// price = vals[1];
						// console.log(price);
						
						
						
						//ok, let's save the article					
						article = { hour: hour, minute: minute, dow: dayOfWeek, type: type, uri: temp[0], year: '20'+temp[2], month: temp[3], day: temp[4], title: temp[5], segments: articleFile, original: entry, people: people, 
										companies: companies, companypeople: companypeople};
						Meteor.call('upsertArticles', '20'+temp[2], temp[3], temp[4], type, { uri: temp[0], title: temp[5], companies: companies, people: people, companypeople: companypeople}, article);
						console.log(article);
					});
					// download('batfile.bat', batFile);
					// download('test.txt', articleFile);
					// download('2005.doclist', doclist);
				}
				reader.readAsText(file);
			// }
		}
	}
});

function download(filename, text) {
		var pom = document.createElement('a');
		
		pom.setAttribute('download', filename);
		pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		pom.click();
	}
Template.uploadStock.rendered = function(){
/* 	var dd = new dragAndDrop({
        onComplete: function(files) {
            for (var i = 0; i < files.length; i++) {
                // Only process csv files.
                if (!f.type.match('text/csv')) {
                    continue;
                }
                var reader = new FileReader();
                reader.onloadend = function(event) {
                    var all = $.csv.toObjects(event.target.result);
                    // do something with file content
                    _.each(all, function(entry) { 
                         Items.insert(entry);
                    });
                }
             }
        }
     });

     dd.add('upload-div'); */
};

var Router = Backbone.Router.extend({
  routes: {
    "articles":         "articles", //this will be http://your_domain/
    "events":           "events",  // http://your_domain/help
	"settings": 		"settings",
	"predict":			"predict",
	"rules":			"rules",
	"simulate":			"simulate"
  },

  articles: function() {
    // Your homepage code
    // for example: Session.set('currentPage', 'homePage');
	console.log('articles pressed');
	Session.set('currentPage', 'articles');
	
	
	
	
	
  },

  events: function() {
    // Help page
	console.log('events pressed');
	Session.set('currentPage', 'events');
	
  },
  
  settings: function() {
	Session.set('currentPage', 'settings');
  },
  
  predict: function() {
	Session.set('currentPage', 'predict');
  },
  
  rules: function() {
	Session.set('currentPage', 'rules');
  },

  simulate: function(){
	Session.set('currentPage', 'simulate');
  }  
});
var app = new Router;
Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});