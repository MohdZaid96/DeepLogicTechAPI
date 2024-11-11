const https = require('https');
const http = require('http');

const parseItems = (data) => {
    const items = [];
  
    const storyRegex = /<li class="latest-stories__item">([\s\S]*?)<\/li>/g;
    let storyMatch;
    
    while ((storyMatch = storyRegex.exec(data)) !== null) {
      const storyHtml = storyMatch[1];
      console.log(storyHtml)
      const titleMatch = storyHtml.match(/<h3 class="latest-stories__item-headline">(.*?)<\/h3>/);
      const title = titleMatch ? titleMatch[1].trim() : 'Nothing';
      console.log(title)
    
      const linkMatch = storyHtml.match(/<a href="(.*?)">/);
      const link = linkMatch ? `https://time.com${linkMatch[1].trim()}` : 'Nothing';
      console.log(link)
      items.push({ title, link });
    }
  
    return items;
  };
  
  const getItems = () => {
    return new Promise((resolve, reject) => {
  
      const req = https.request({
          hostname: 'time.com',
          path: '/',
          method: 'GET'
        }, (res) => {
        let data = '';
  
        res.on('data', (bulk) => {
          data += bulk;
        });
  
        res.on('end', () => {
          const items = parseItems(data);
          resolve(items);
        });
      });
  
      req.on('error', (error) => {
        reject(error);
      });
  
      req.end();
    });
  };


const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    getItems().then(item => {
      res.end(JSON.stringify(item));
    }).catch(error => {
      res.end(JSON.stringify({ error: 'Failed to get stories' }));
    });
  } else {
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(3000, () => console.log(`Server running on port ${3000}`));
