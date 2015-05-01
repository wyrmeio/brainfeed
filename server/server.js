/**
 * Created by idris on 24/4/15.
 */
var consumer_key;
var consumer_secret;
var stream_started = false;
var Fiber = Npm.require('fibers');

Meteor.startup(function () {
    return Meteor.Mandrill.config({
        username: "shivani@wyrme.io",
        key: "PWc5ZiH4hEB7ZuMddoDmIA"
    });
});


var inProduction = function () {
    return process.env.NODE_ENV === "production";
};

if (inProduction()) {

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
        var self = this;
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
            if (!error) {
                //console.log(tweets);
                Fiber(function () {
                    _.map(tweets, function (value, index) {
                        Tweets.insert({uid: id, tweet: value});
                    });
                }).run();
                myFuture.return(tweets);
            }
            else {
                console.log(error);
            }
        });

        if (true) {
            self.unblock();
            twitterStream(client, id);
            stream_started = true;
        }

        return myFuture.wait();
    },

    getVideos: function () {


        var result = HTTP.get("https://www.googleapis.com/youtube/v3/search", {query: "order=date&part=snippet&channelId=UCPQ1nqIgM_yUiQVJBg_RR6Q&maxResults=50&key=AIzaSyDN1qT_tTDoQbxmuP0A5QRveOnFsPSqhT8"});

        //console.log(result.data.items);
        return result.data.items;

    },

    getArticles: function (link) {

        var result = HTTP.get("http://api.diffbot.com/v3/analyze", {
            query: "token=0270f11fa0d8f19cf2f8360e5cb90f19&url=" + link
        });
        console.log(result.data);
        return result.data;

    },

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
            if (!error) {
                console.log(tweets);
                console.log(response);
                myFuture.return(tweets);
            }
        });
        return myFuture.wait();
    },

    getEmail: function (id) {
        var temp = Meteor.users.find({_id: id}).fetch();
        // var email = temp[0].services.twitter.accessToken;
        return "idris@wyrme.io";
    },

    sendEmail: function (id) {

        return Meteor.Mandrill.send({
            to: "idris@wyrme.io",
            from: "app@brainfeed.io",
            subject: "Welcome Message",
            html: "<h1>Welcome to brainfeed.</h1><br><p>We are thrilled to have you with us.</p>"
        });

    },

    chargeCard: function (stripeToken, price, stripeEmail) {
        var Stripe = StripeAPI('sk_test_weYszsKrOxQB952IBECHyrLE'); //test stripe secret key


        // load Future
        Future = Npm.require('fibers/future');
        var myFuture = new Future();


        Stripe.charges.create({
            amount: price,
            currency: 'usd',
            card: stripeToken,
            description: "Charge for " + stripeEmail, //An arbitrary string which you can attach to a charge object. It is displayed when in the web interface alongside the charge. Note that if you use Stripe to send automatic email receipts to your customers, your receipt emails will include the description of the charge(s) that they are describing.
            receipt_email: stripeEmail //The email address to send this charge's receipt to.
        }, function (err, res) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(res);
                myFuture.return(res);
            }

        });
        return myFuture.wait();
    }
});

Meteor.publish('Tweets', function (id) {

    return Tweets.find({uid: id});

});

Meteor.publish('Tweets', function (id) {

    return Tweets.find({uid: id});

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


twitterStream = function (client, id) {

    client.stream('user', {with: 'followings'}, function (stream) {
        stream.on('data', Meteor.bindEnvironment(function (data) {
            Fiber(function () {
                Tweets.insert({uid: id, tweet: data});
                //console.log(data);
            }).run();
        }));
    });

};






