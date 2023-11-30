const express = require('express')
const router = express.Router()
const cheerio = require('cheerio');
const Url = require('url')
const Queue = require('../queue/queue'); // Replace with the actual library you are using for Queue
const redisClient = require('./db/redis');

router.post("/start", async(req,res) =>{
  const {maxDepth, maxLinks,stringToSearch,startUrl} = req.body
  const redisChannel = JSON.stringify(req.body)

  const alreadyUsedUrls = [startUrl];
  const queueLinks = new Queue();

  const searchWordAndLinks = async ({ url, depth, parentUrl}) => {
    try {
        const $ = await loadData(url)

        const title = $('title').text();

        const highlightedContext = findHighlightContext($, stringToSearch)
        if(!highlightedContext) {
            if(depth === 1)
                publishCrawledData("not found", redisChannel)
            return
        }
            
        const result = {
          depth,
          url,
          title,
          highlightedContext,
          parentUrl
        };

        publishCrawledData(result, redisChannel)

        if (depth >= maxDepth)
          return

        findUrls($,url, alreadyUsedUrls, queueLinks, maxLinks, depth)
    } catch (error) {
      console.error('Error during crawling:', error.message);
      publishCrawledData("url error", redisChannel)
    }
  };

  const crawl = async () => {
    queueLinks.enqueue({ url: startUrl, depth: 1, parentUrl:null });

    while (queueLinks.size !== 0) {
      const newLink = queueLinks.dequeue();
      await searchWordAndLinks(newLink);
    }
    publishCrawledData("finished", redisChannel)
    res.send("done")
  };

  crawl();
});

const findHighlightContext = ($,stringToSearch ) =>{
    const textContent = $('body').clone().find('script,noscript, style').remove().end().text();

    const index = textContent.toLowerCase().indexOf(" " +stringToSearch.toLowerCase()+ " ")
    if (index === -1)
        return null

    return findSentence(textContent, stringToSearch, index+1)
}

const findSentence = (text, stringToSearch, index)=>{
    const words = text.slice(0, index).split(/\s+/).slice(-5);
    const originalString = text.slice(index, index+stringToSearch.length)
    const wordsAfter = text.slice(index + stringToSearch.length+1).split(/\s+/).slice(0, 5);
    const result = words.concat(originalString, wordsAfter).join(' ');
    return result;
  }
  
  const loadData = async (url) =>{
      const response = await fetch(url);
      const htmlText = await response.text();
      const $ = cheerio.load(htmlText);
      return $
  }
  
  const findUrls = ($,url, alreadyUsedUrls, queueLinks, maxLinks, depth) =>{
    let i = 0;
    const links = $('a');
    for (let link of links) {
      let currentUrl = $(link).attr('href')?.trim();
  
      if (!currentUrl || currentUrl.startsWith('#')) continue;

      currentUrl = Url.resolve(url, currentUrl);

      if (!alreadyUsedUrls.includes(currentUrl)) {
        alreadyUsedUrls.push(currentUrl);
        queueLinks.enqueue({ url: currentUrl, depth: depth + 1, parentUrl:url});
        i++;
      }
      if (i >= maxLinks) break;
    }
  }

  const publishCrawledData = (data,channel) => {
    redisClient.publish(channel, JSON.stringify(data));
  };


  router.post("/set-string", async(req,res)=>{
    try{
        await redisClient.set(req.body.key, req.body.value)

        res.send()
    }catch(err){
        console.log(err);
    }
})

router.get("/get-string/:key", async(req,res)=>{
    try{
        const value = await redisClient.get(req.params.key)
        if(!value)
          throw new Error("lm")
          res.send({value, a:"fds"})
    }catch(err){
      res.status(404).send(err)
        console.log(err);
    }
})

module.exports = router