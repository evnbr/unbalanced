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
  // us: {
  //   url: "http://rss.nytimes.com/services/xml/rss/nyt/US.xml",
  //   helper: news_loaded
  // },
  // politics: {
  //   url: "http://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
  //   helper: news_loaded,
  // },
  // newyork: {
  //   url: "http://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml",
  //   helper: news_loaded,
  // },
  business: {
    url: "http://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
    helper: news_loaded,
  },
  // technology: {
  //   url: "http://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
  //   helper: news_loaded,
  // },
  // sports: {
  //   url: "http://rss.nytimes.com/services/xml/rss/nyt/Sports.xml",
  //   helper: news_loaded,
  // },
  // science: {
  //   url: "http://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
  //   helper: news_loaded,
  // },
  // health: {
  //   url: "http://rss.nytimes.com/services/xml/rss/nyt/Health.xml",
  //   helper: news_loaded,
  // },
  // style: {
  //   url: "http://rss.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml",
  //   helper: news_loaded,
  // },
  // opinion: {
  //   url: "http://topics.nytimes.com/top/opinion/editorialsandoped/editorials/index.html?rss=1",
  //   helper: news_loaded,
  //},
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
  f.video.load(function(dat) {      nyt_loaded(dat, "video")}   );
  f.business.load(function(dat) {   nyt_loaded(dat, "business") });
  f.dealbook.load(function(dat) {   nyt_loaded(dat, "dealbook") });
  f.arts.load(function(dat) {       nyt_loaded(dat, "arts")     });
  f.popular.load(function(dat) {    nyt_loaded(dat, "popular")  });
  f.world.load(function(dat) {      nyt_loaded(dat, "world")    });
}



function news_loaded(result) {
  if (!result.error) {
    // console.log(result.xmlDocument);
    // console.log(result.feed.entries);

    var processed_feed = result.feed.entries.map(function(el){
      el.image = $(el.xmlNode).find("enclosure").attr("url");
      return el;
    });

    feed_data.news = processed_feed;
    async_done();
  }
}



function nyt_loaded(result, name) {
  console.log(name);
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
      url: result.feed.link,
      entries: processed_feed,
    }
    async_done();
  }
}


function async_done() {
  console.log(Object.keys(feed_data).length);
  if ( Object.keys(feed_data).length == Object.keys(feed_url).length ) {
    render_context();
  }
}






function render_context() {
  var context = {
    main: {
      article: feed_data.news[0],
      related: []
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
      left: feed_data.news.slice(4, 14),
      right: feed_data.news.slice(14, 24),
    },
    videos: feed_data.video.entries.slice(0, 6),
    market: feed_data.dealbook.entries.slice(0,3),
    features: {
      row1: feed_data.arts.entries.slice(0, 7),
      row2: feed_data.arts.entries.slice(7, 14),
    },
    popular: feed_data.popular.entries.slice(0,5),
    world: {
      title: "world",
      link: feed_data.world.link,
      first: feed_data.world.entries[0],
      articles: feed_data.world.entries.slice(1,5)
    }
  }
  console.log("context: " + context);
  new_html = Handlebars.templates.fox(context);
  
}


chrome.browserAction.onClicked.addListener(function(tab) {
  var cleaned = addslashes(new_html).replace(/(\r\n|\n|\r)/gm,"");
  console.log('console.log(" ' + cleaned + ' ");');

  chrome.tabs.executeScript({
    code: 'document.getElementById("section").innerHTML = " ' + cleaned + ' ";'
  });
});



function addslashes( str ) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
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
