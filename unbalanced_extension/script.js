var feed_url = {
  news: {
    url: "http://america.aljazeera.com/content/ajam/articles.rss",
    helper: news_loaded,
  },
  video: {
    url: "http://www.nytimes.com/video/opinion/?rss=1&pagewanted=all",
    helper: nyt_loaded,
  },
  dealbook: {
    url: "http://dealbook.nytimes.com/feed/?pagewanted=all",
    helper: news_loaded,
  },
  arts: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/Arts.xml",
    helper: news_loaded,
  },
  popular: {
    url: "http://www.nytimes.com/services/xml/rss/nyt/pop_top.xml",
    helper: news_loaded,
  },
  world: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    helper: news_loaded,
  },
  us: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/US.xml",
    helper: news_loaded
  },
  politics: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
    helper: news_loaded,
  },
  newyork: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml",
    helper: news_loaded,
  },
  business: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
    helper: news_loaded,
  },
  technology: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    helper: news_loaded,
  },
  sports: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/Sports.xml",
    helper: news_loaded,
  },
  science: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
    helper: news_loaded,
  },
  health: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/Health.xml",
    helper: news_loaded,
  },
  style: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml",
    helper: news_loaded,
  },
  style: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml",
    helper: news_loaded,
  },
  opinion: {
    url: "http://topics.nytimes.com/top/opinion/editorialsandoped/oped/contributors/index.html?rss=1",
    helper: news_loaded,
  },
}
// news: "http://rss.nytimes.com/services/xml/rss/nyt/InternationalHome.xml",

var feed_data = {};
var new_html = "";

add_handlebar_helper();


google.load("feeds", "1");
google.setOnLoadCallback(onload_makefeeds);

function onload_makefeeds() {

  var f = {};

  for(prop in feed_url) {
    var newfeed = new google.feeds.Feed(feed_url[prop].url);
    newfeed.includeHistoricalEntries();
    newfeed.setNumEntries(30);
    newfeed.setResultFormat(google.feeds.Feed.MIXED_FORMAT);
    f[prop] = newfeed; 
  }

  f.news.load(news_loaded);
  f.video.load(function(dat) {      nyt_loaded(dat, "video")      });
  f.business.load(function(dat) {   nyt_loaded(dat, "business")   });
  f.dealbook.load(function(dat) {   nyt_loaded(dat, "dealbook")   });
  f.arts.load(function(dat) {       nyt_loaded(dat, "arts")       });
  f.popular.load(function(dat) {    nyt_loaded(dat, "popular")    });
  f.world.load(function(dat) {      nyt_loaded(dat, "world")      });
  f.us.load(function(dat) {         nyt_loaded(dat, "us")         });
  f.politics.load(function(dat) {   nyt_loaded(dat, "politics")   });
  f.newyork.load(function(dat) {    nyt_loaded(dat, "newyork")    });
  f.technology.load(function(dat) { nyt_loaded(dat, "technology") });
  f.sports.load(function(dat) {     nyt_loaded(dat, "sports")     });
  f.science.load(function(dat) {    nyt_loaded(dat, "science")    });
  f.health.load(function(dat) {     nyt_loaded(dat, "health")     });
  f.style.load(function(dat) {      nyt_loaded(dat, "style")      });
  f.opinion.load(function(dat) {    nyt_loaded(dat, "opinion")    });
}



function news_loaded(result) {
  if (!result.error) {
    // console.log(result.xmlDocument);
    // console.log(result.feed.entries);

    var processed_feed = result.feed.entries.map(function(el){
      el.image = $(el.xmlNode).find("enclosure").attr("url");
      return el;
    });

    // Require images for the beginning of the news category (--> The top 4 stories)
    processed_feed = processed_feed.filter(function(a, i){
      if (i < 3) return (undefined != a.image);
      else return true;
    });

    feed_data.news = processed_feed;
    async_done();
  }
}



function nyt_loaded(result, name) {
  // console.log(name);
  if (!result.error) {
    // console.log(result.xmlDocument);
    // console.log(result.feed.entries);

    var processed_feed = result.feed.entries.map(function(el){
      el.image = $(el.xmlNode).find("[url *= jpg]").attr("url");
      return el;
    });

    // Require images for Arts category (--> Features & Faces in template)
    if (name =="arts") {
      processed_feed = processed_feed.filter(function(a){
        return (undefined != a.image);
      });
    }

    feed_data[name] = {
      link: result.feed.link,
      entries: processed_feed,
    }
    async_done();
  }
}


function async_done() {
  // console.log(Object.keys(feed_data).length);
  if ( Object.keys(feed_data).length == Object.keys(feed_url).length ) {
    render_context();
  }
}






function render_context() {
  var context = {
    main: {
      article: feed_data.news[0],
      related: [
        feed_data.news[4].title,
        feed_data.news[5].title,
        feed_data.news[6].title,
        feed_data.news[7].title,
      ],
    }, 
    secondary: [
      {
        article: feed_data.news[1],
        related: []
      },
      {
        article: feed_data.news[2],
        related: []
      },
      {
        article: feed_data.news[3],
        related: []
      },
    ],
    latest: {
      left: feed_data.news.slice(8, 18),
      right: feed_data.news.slice(18, 28),
    },
    videos: feed_data.video.entries.slice(0, 6),
    dontmiss: feed_data.video.entries.slice(6, 8),
    market: feed_data.dealbook.entries.slice(0,3),
    features: {
      row1: feed_data.arts.entries.slice(0, 7),
      row2: feed_data.arts.entries.slice(7, 14),
    },
    popular: feed_data.popular.entries.slice(0,5),
    regional: feed_data.newyork.entries.slice(4, 8),
    sections: [
      {
        title: "World",
        link: feed_data.world.link,
        first: get_story_with_image(feed_data.world.entries),
        articles: feed_data.world.entries.slice(0,4)
      },
      {
        title: "U.S.",
        link: feed_data.us.link,
        first: get_story_with_image(feed_data.us.entries),
        articles: feed_data.us.entries.slice(0,4)
      },
      {
        title: "Politics",
        link: feed_data.politics.link,
        first: get_story_with_image(feed_data.politics.entries),
        articles: feed_data.politics.entries.slice(0,4)
      },
      {
        title: "New York",
        link: feed_data.newyork.link,
        first: get_story_with_image(feed_data.newyork.entries),
        articles: feed_data.newyork.entries.slice(0,4)
      },
      {
        title: "Technology",
        link: feed_data.technology.link,
        first: get_story_with_image(feed_data.technology.entries),
        articles: feed_data.technology.entries.slice(0,4)
      },
      {
        title: "Sports",
        link: feed_data.sports.link,
        first: get_story_with_image(feed_data.sports.entries),
        articles: feed_data.sports.entries.slice(0,4)
      },
      {
        title: "Science",
        link: feed_data.science.link,
        first: get_story_with_image(feed_data.science.entries),
        articles: feed_data.science.entries.slice(0,4)
      },
      {
        title: "Health",
        link: feed_data.health.link,
        first: get_story_with_image(feed_data.health.entries),
        articles: feed_data.health.entries.slice(0,4)
      },
      {
        title: "Arts",
        link: feed_data.arts.link,
        first: get_story_with_image(feed_data.arts.entries),
        articles: feed_data.arts.entries.slice(0,4)
      },
      {
        title: "Style",
        link: feed_data.style.link,
        first: get_story_with_image(feed_data.style.entries),
        articles: feed_data.style.entries.slice(0,4)
      },
      {
        title: "Opinion",
        link: feed_data.opinion.link,
        first: get_story_with_image(feed_data.opinion.entries),
        articles: feed_data.opinion.entries.slice(0,4)
      },
    ],
  }
  console.log("context: " + context);
  new_html = Handlebars.templates.fox(context);
  
  var cleaned = addslashes(new_html).replace(/(\r\n|\n|\r)/gm,"");

  chrome.tabs.executeScript({
    code: 'document.getElementById("section").innerHTML = " ' + cleaned + ' ";'
  });
}


// chrome.browserAction.onClicked.addListener(function(tab) {
//   var cleaned = addslashes(new_html).replace(/(\r\n|\n|\r)/gm,"");
//   // console.log('console.log(" ' + cleaned + ' ");');

//   chrome.tabs.executeScript({
//     code: 'document.getElementById("section").innerHTML = " ' + cleaned + ' ";'
//   });
// });


// Detect when page has loaded
// --------
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tab.url.indexOf("foxnews.com/") !== -1) {
    var cleaned = addslashes(new_html).replace(/(\r\n|\n|\r)/gm,"");
    console.log("Fox refreshed, injecting");

    chrome.tabs.executeScript({
      code: 'document.getElementById("section").innerHTML = " ' + cleaned + ' ";'
    });
  }
});



function addslashes( str ) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}



function get_story_with_image(arr) {
  // console.log(arr);
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].image) {
      return arr.splice(i, 1)[0];
    }
  }
  return null;
}





function add_handlebar_helper() {
  Handlebars.registerHelper("foreach",function(arr,options) {
    if(options.inverse && !arr.length)
        return options.inverse(this);

    return arr.map(function(item,index) {
        item.$index = index;
        item.$indexhuman = index + 1;
        item.$first = index === 0;
        item.$last  = index === arr.length-1;
        return options.fn(item);
    }).join('');
  });
}
