/**
 * Created by idris on 24/4/15.
 */
var consumer_key;
var consumer_secret;

var inProduction = function () {
	return process.env.NODE_ENV === "production";
};

if ( inProduction() ) {

	consumer_key = "4P6AVZSzBXMafX44pQUclUzF1";
	consumer_secret = "U7jeLv5GxWS3tRH3p45K9VRA2Lrpo6rL2kZlIWuZU5wxFK8LcA";

	ServiceConfiguration.configurations.upsert(
		{service: "twitter"},
		{
			$set: {
				consumerKey: "4P6AVZSzBXMafX44pQUclUzF1",
				secret: "U7jeLv5GxWS3tRH3p45K9VRA2Lrpo6rL2kZlIWuZU5wxFK8LcA"

			}
		}
	);

}
else {

	consumer_key = "KqdiMZvhY3lkpYLoUlAnX0vDH";
	consumer_secret = "gD6TPazP1Z3vqcvdG7LHMXeQISbhEaxZbpW4fM3F1zeAGf9vfI";

	ServiceConfiguration.configurations.upsert(
		{service: "twitter"},
		{
			$set: {
				consumerKey: "KqdiMZvhY3lkpYLoUlAnX0vDH",
				secret: "gD6TPazP1Z3vqcvdG7LHMXeQISbhEaxZbpW4fM3F1zeAGf9vfI"

			}
		}
	);
}

Meteor.methods({

	getTimeline: function (id) {
        var self=this;
		var temp = Meteor.users.find({_id: id}).fetch();
		var token = temp[0].services.twitter.accessToken;
		var secret = temp[0].services.twitter.accessTokenSecret;

		var Twitter = Meteor.npmRequire('twitter');
		var client = new Twitter({
			consumer_key: consumer_key,
			consumer_secret: consumer_secret,
			access_token_key: token,
			access_token_secret: secret
		});

		var params = {count: 50};

		// load Future
		Future = Npm.require('fibers/future');
		var myFuture = new Future();

		client.get('statuses/home_timeline', params, function (error, tweets, response) {
			if ( !error ) {
				//console.log(tweets);
                _.map(tweets,function(value,index){
                    Tweets.insert({uid:id,tweet: value});
                })
				myFuture.return(tweets);
			}
			else{
				console.log(error);
			}
		});

        var Fiber = Npm.require('fibers');


        Fiber( function() {
        client.stream('user',{with: 'followings'}, function (stream) {
            stream.on('data', function (data) {
                self.unblock();
                    if(!getValues(data,"friends"))
                        Tweets.insert({uid:id,tweet: data});
                    console.log(data);

            });
        });
        }).run();

        return myFuture.wait();
	},

	getArticles: function (link) {

		var result = HTTP.get("http://api.diffbot.com/v3/analyze", {
			query: "token=0270f11fa0d8f19cf2f8360e5cb90f19&url=" + link
		});


		console.log(result.data);
		return result.data;

	},
	/*getRead: function (link) {
		var result = HTTP.get("https://readability.com/api/content/v1/parser?url=" + link + "&token=6fe237ed2fdde391a4e125f292d35ca51b36f63e");
		console.log(result.data.content);
		return result.data.content;
	},*/
	getWiki: function (label) {
		//https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=Stack%20Overflow

		var result = HTTP.get("https://en.wikipedia.org/w/api.php", {
			query: "format=json&action=query&prop=extracts&titles=" + label
		});
		//console.log(result);
		console.log(result.data);
		return result.data;
	},
	statusUpdate: function (status, id) {


		var temp = Meteor.users.find({_id: id}).fetch();
		var token = temp[0].services.twitter.accessToken;
		var secret = temp[0].services.twitter.accessTokenSecret;

		var Twitter = Meteor.npmRequire('twitter');
		var client = new Twitter({
			consumer_key: consumer_key,
			consumer_secret: consumer_secret,
			access_token_key: token,
			access_token_secret: secret
		});

		var params = {status: status};

		// load Future
		Future = Npm.require('fibers/future');
		var myFuture = new Future();

		client.post('statuses/update', params, function (error, tweets, response) {
			if ( !error ) {
				console.log(tweets);
				console.log(response);
				myFuture.return(tweets);
			}
		});
		return myFuture.wait();
	}

});

Meteor.publish('Tweets', function (id) {

    return Tweets.find({uid:id});

});


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








