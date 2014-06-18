Companies = new Meteor.Collection("companies");
Articles = new Meteor.Collection("articles");
Segments = new Meteor.Collection("segments");
Events = new Meteor.Collection("events");
Rules = new Meteor.Collection("rules");
Days = new Meteor.Collection("days");
// console.log(Companies.find({name: "Statoil"}).fetch());
console.log(Segments.find({ month: '02'}).count());
// console.log(Segments.find({}).fetch());

if( Companies.findOne({name: "Statoil"}) ==null) {
	console.log('its null');
	Companies.insert({name: "Statoil", ticker: "STL"});
	
};

if( Companies.findOne({name: "Det norske oljeselskap"}) ==null) {
	console.log('its null');
	Companies.insert({name: "Det norske oljeselskap", ticker: "DETNO"});
	
};


if( Companies.findOne({name: "Subsea 7"}) ==null) {
	console.log('its null');
	Companies.insert({name: "Subsea 7", ticker: "SUBC"});
	
};
if( Companies.findOne({name: "Aker Solutions"}) ==null) {
	console.log('its null');
	Companies.insert({name: "Aker Solutions", ticker: "AKSO"});
	
};
if( Companies.findOne({name: "DNO International"}) ==null) {
	console.log('its null');
	Companies.insert({name: "DNO International", ticker: "DNO"});
	
};
if( Companies.findOne({name: "TGS-NOPEC"}) ==null) {
	console.log('its null');
	Companies.insert({name: "TGS-NOPEC", ticker: "TGS"});
	
};
if( Companies.findOne({name: "Petroleum Geo-Services"}) ==null) {
	console.log('its null');
	Companies.insert({name: "Petroleum Geo-Services", ticker: "PGS"});
	
};
if( Companies.findOne({name: "Fred. Olsen Energy"}) ==null) {
	console.log('its null');
	Companies.insert({name: "Fred. Olsen Energy", ticker: "FOE"});
	
};
if( Companies.findOne({name: "Prosafe"}) ==null) {
	console.log('its null');
	Companies.insert({name: "Prosafe", ticker: "PRS"});
	
};
if( Companies.findOne({name: "Seadrill"}) ==null) {
	console.log('its null');
	Companies.insert({name: "Seadrill", ticker: "SDRL"});
	
};

if( Companies.find({name: "Statoil"}).fetch()[1] != null) {
	console.log('More than one Statoil; removing all but one');
	var onlyOne = Companies.findOne({name: "Statoil"});
	Companies.remove({name: "Statoil"}, function(e){
		Companies.insert(onlyOne);
		console.log('done removing all but one.');
		console.log(Companies.find({name: "Statoil"}).fetch());
		console.log(e);
		
	});
}
// console.log("S:\\dl\\Prices-2014-05-22\\Prices\\Korpus\\dn\\2005\\");
var loadArticles = function(filepath) {
		console.log('uploadArticles at server: '+filepath);
		// var fs = NPM.require('fs');
		//var path = NPM.require('path');
		console.log('npms done');
		var data = fs.readFileSync(filepath+"20050418.html4");
		console.log('dataread done');
		console.log(data);
		var allData = data.split('\n');
		console.log(allData[1]);

}
// loadArticles("S:\\dl\\Prices-2014-05-22\\Prices\\Korpus\\dn\\2005\\");
Meteor.methods({
	uploadArticles: function(filepath) {
		console.log('uploadArticles at server: '+filepath);
		console.log('npms done');
		var data = fs.readFileSync(filepath+"20050418.html4");
		console.log('dataread done');
		console.log(data);
		var allData = data.split('\n');
		console.log(allData[1]);
	},
	upsertPrices: function(year, month, date, comp, daySave) {
		var file = {};
		file.name = comp;
		if(file.name== "stl.csv") {
			Segments.upsert({year: year, month: month, day: date}, {$set: { stl: daySave}}, true, function(err, no) {
				console.log(err+no);
			});
		}
		else if(file.name== "sdrl.csv") {
			Segments.upsert({year: year, month: month, day: date}, {$set: { sdrl: daySave}});
		}
		else if(file.name== "akso.csv") {
			Segments.upsert({year: year, month: month, day: date}, {$set: { akso: daySave}}, true, function(err, no) {
				console.log(err+no);
			});
		}
		else if(file.name== "detnor.csv") {
			Segments.upsert({year: year, month: month, day: date}, {$set: { detnor: daySave}});
		}
		else if(file.name== "dno.csv") {
			Segments.upsert({year: year, month: month, day: date}, {$set: { dno: daySave}});
		}
		else if(file.name== "foe.csv") {
			Segments.upsert({year: year, month: month, day: date}, {$set: { foe: daySave}});
		}
		else if(file.name== "pgs.csv") {
			Segments.upsert({year: year, month: month, day: date}, {$set: { pgs: daySave}});
		}
		else if(file.name== "prs.csv") {
			Segments.upsert({year: year, month: month, day: date}, {$set: { prs: daySave}});
		}
		else if(file.name== "sub.csv") {
			Segments.upsert({year: year, month: month, day: date}, {$set: { sub: daySave}});
		}
		else if(file.name== "tgs.csv") {
			Segments.upsert({year: year, month: month, day: date}, {$set: { tgs: daySave}});
		}
					
		console.log('updated '+ file.name+ ' for ' +date+month+year);
	},
	upsertArticles: function(year, month, date, type, article, fullArticle) {
					if(type == "Energi") {
						Segments.upsert({year: year, month: month, day: date}, {$push: { energi: article}});
						
					}
					else if(type == "Børs & Marked") {
						Segments.upsert({year: year, month: month, day: date}, {$push: { bors: article}});
					}
					else if(type == "Næringsliv") {
						Segments.upsert({year: year, month: month, day: date}, {$push: { naring: article}});
					}
					else if(type == "Annet") {
						Segments.upsert({year: year, month: month, day: date}, {$push: { annet: article}});
					}
					Articles.insert(fullArticle);
					console.log('Article inserted on: '+date+month+year);
					 
	},
	getSomeData: function(selector) {
		var count = Segments.find({ month: '02'}).count();
		console.log(count);
		var days = Segments.find( {year: '2007'}).fetch();
		return days; 
	}
});
