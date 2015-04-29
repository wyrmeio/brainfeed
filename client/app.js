if ( Meteor.isClient ) {
	// counter starts at 0
	Meteor.startup(function () {
		Session.set('type',true);
	});

	Template.layout.events(Velociratchet.events);
	Template.layout.helpers(Velociratchet.helpers);

	String.prototype.capitalize = function () {
		return this.toLowerCase().replace(/\b\w/g, function (m) {
			return m.toUpperCase();
		});
	};

	Template.home.helpers({
		timelines: function () {
			return _.map(timeline.get(), function (timeline, index) {
				//timeline.time_ago=time_ago(timeline.created_at);
				if ( timeline.entities.media )
					timeline.media_image_url = timeline.entities.media[0].media_url;
				return timeline;
			});
		},
		screenName: function () {
			//return capitalizeFirstLetter(Meteor.user().profile.name);
			return (Meteor.user().profile.name.capitalize());
		}
	});

	Template.home.events({
		'click .table-view-cell': function (e) {
			Session.set('link', this.entities.urls[0].url);
			Router.go('articles');
		},
		'click #compose': function () {
			Router.go('compose');
		},
		'click #refresh': function () {
			links.set();
			Meteor.call('getArticles', Session.get('link'), function (error, result) {
				links.set(result);
			});
		}
	});

	Template.articles.helpers({
		type: function () {
			var link = links.get();
			if(link!==undefined && link.objects[0].type!=="article")
				Session.set('type',false);
			return Session.get('type');
		},
		title: function () {
			var link = links.get();
			return (link.objects[0].title)?(link.objects[0].title):false;
		},
		data: function () {
			var link = links.get();
			return link.objects[0].html;

		},
		icon: function () {
			var link = links.get();
			return (link.objects[0].icon)?(link.objects[0].icon):false;

		},
		author: function () {
			var link = links.get();
			return (link.objects[0].author)?(link.objects[0].author):false;
		},
		date: function () {
			var link = links.get();
			return (link.objects[0].date)?(link.objects[0].date):false;
		},
		tags: function () {
			var link = links.get();
			return link.objects[0].tags;
		}
	});

	Template.articles.events({
		'click .wiki':function(e){
			e.preventDefault();

			Session.set('wikiLabel',this.label);
			Router.go('wiki');
		}
	});

	Template.wikipedia.helpers({
		title: function () {
			var temp = wiki.get();
			return getValues(temp,'title');
		},
		data: function () {
			var temp = wiki.get();
			return getValues(temp,'extract');
		}
	});

	Template.login.events({
		'click #tw': function (e) {
			//e.preventDefault();
			amplitude.logEvent("login attempted");
			mixpanel.track("login attempted");

			Meteor.loginWithTwitter({
				loginStyle: "redirect"
			}, function () {
				amplitude.logEvent("login success");
				mixpanel.track("login success");

				Router.go('home');

			});
		}
	});

	Template.compose.events({
		'click #tweet': function () {
			console.log("tweet");
			Meteor.call('statusUpdate', $("#status").text(), Meteor.userId(), function (error, result) {

			});
			Router.go('home');
		}
	});

}

function time_ago(time) {

	switch ( typeof time ) {
		case 'number':
			break;
		case 'string':
			time = +new Date(time);
			break;
		case 'object':
			if ( time.constructor === Date ) time = time.getTime();
			break;
		default:
			time = +new Date();
	}
	var time_formats = [
		[60, 'seconds', 1], // 60
		[120, '1 minute ago', '1 minute from now'], // 60*2
		[3600, 'minutes', 60], // 60*60, 60
		[7200, '1 hour ago', '1 hour from now'], // 60*60*2
		[86400, 'hours', 3600], // 60*60*24, 60*60
		[172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
		[604800, 'days', 86400], // 60*60*24*7, 60*60*24
		[1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
		[2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
		[4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
		[29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
		[58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
		[2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
		[5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
		[58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
	];
	var seconds = (+new Date() - time) / 1000,
	    token = 'ago', list_choice = 1;

	if ( seconds == 0 ) {
		return 'Just now'
	}
	if ( seconds < 0 ) {
		seconds = Math.abs(seconds);
		token = 'from now';
		list_choice = 2;
	}
	var i = 0, format;
	while ( format = time_formats[i++] )
		if ( seconds < format[0] ) {
			if ( typeof format[2] == 'string' )
				return format[list_choice];
			else
				return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
		}
	return time;
}

//return an array of values that match on a certain key
function getValues(obj, key) {
	var objects = [];
	for (var i in obj) {
		if (!obj.hasOwnProperty(i)) continue;
		if (typeof obj[i] == 'object') {
			objects = objects.concat(getValues(obj[i], key));
		} else if (i == key) {
			objects.push(obj[i]);
		}
	}
	return objects;
}