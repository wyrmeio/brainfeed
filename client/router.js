/**
 * Created by idris on 24/4/15.
 */

Router.configure({
	layoutTemplate: 'layout'

});

Router.route('home',  {
	action: function () {
		if ( Meteor.userId() ) {
			this.render('home');
		}
		else {
			this.render('login');
		}
	}
});

HomeController = RouteController.extend({
	onBeforeAction: function () {

        Session.set('videoId', null);
         video.set();

        Meteor.call('getVideos', function (error, result) {
            Session.set('videoId', result[0].id.videoId);
            video.set(result);
        });

		Meteor.call('getTimeline',Meteor.userId() ,function (error, result) {
			timeline.set(result);
		});

		this.next();
	}
});

Router.route('login', {
	path: '/',
	action: function () {
		if ( Meteor.userId() ) {
			Router.go('home');
		}
		else {
			this.render('login');
		}
	}
});

Router.route('articles', function () {
	this.render('articles');
});

Router.route('wiki', function () {
	this.render('wikipedia');
});

ArticlesController = RouteController.extend({
	onBeforeAction: function () {
		links.set();
		Meteor.call('getArticles',Session.get('link') ,function (error, result) {
			links.set(result);
		});

		this.next();
	}
});

WikiController = RouteController.extend({
	onBeforeAction: function () {
		wiki.set();
		Meteor.call('getWiki',Session.get('wikiLabel') ,function (error, result) {
			wiki.set(result);
		});
		this.next();
	}
});

Router.route('compose', function () {
	this.render('compose');
});
