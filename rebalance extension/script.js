var feed_url = {
  news: "http://america.aljazeera.com/content/ajam/articles.rss",
  // news: "http://rss.nytimes.com/services/xml/rss/nyt/InternationalHome.xml",
  video: "http://www.nytimes.com/video/opinion/?rss=1&pagewanted=all",
}

var feed_data = {};



google.load("feeds", "1");
google.setOnLoadCallback(onload_makefeeds);

function onload_makefeeds() {

  news = new google.feeds.Feed(feed_url.news);
  news.includeHistoricalEntries();
  news.setNumEntries(30);
  news.setResultFormat(google.feeds.Feed.MIXED_FORMAT);


  vids = new google.feeds.Feed(feed_url.video);
  vids.includeHistoricalEntries();
  vids.setNumEntries(30);
  vids.setResultFormat(google.feeds.Feed.MIXED_FORMAT);


  // var query = 'site:cnn.com president';
  // google.feeds.findFeeds(query, findDone);

  news.load(news_loaded);
  vids.load(vids_loaded);
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

function vids_loaded(result) {
  if (!result.error) {
    // console.log(result.xmlDocument);
    // console.log(result.feed.entries);

    var processed_feed = result.feed.entries.map(function(el){
      el.image = $(el.xmlNode).find("[url *= jpg]").attr("url");
      return el;
    });

    feed_data.vids = processed_feed;
    async_done();
  }
}

function async_done() {
  if ( feed_data.news && feed_data.vids ) {
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
    videos: feed_data.vids.slice(0, 6),
  }
  var html = Handlebars.templates.fox(context);
  
  chrome.browserAction.onClicked.addListener(function(tab) {
    var cleaned = addslashes(html).replace(/(\r\n|\n|\r)/gm,"");
    console.log('console.log(" ' + cleaned + ' ");');

    chrome.tabs.executeScript({
      code: 'document.getElementById("section").innerHTML = " ' + cleaned + ' ";'
    });
  });
}

function addslashes( str ) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}
