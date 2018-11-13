/*
- get posts from https://software-enginnering-daily-api.herokuapp.com/api/posts
- for each post
  - get the url of the podcast episode
  - get html of the link
  - find the transcript url
  - download and parse text from transcript
  - upload to big table as unclassified
*/

import config from '../../config/config';
import ContentIngester from './ContentIngester';
import request from 'request-promise';
import url from 'url';
import pdf from 'pdf-parse';
import {JSDOM} from "jsdom";


let TRANSCRIPT_REGEX = /sed([0-9\.]+)/;
let PDF_API_BASE_URL = "https://softwareengineeringdaily.com/wp-json/wp/v2/media?type=attachment&search=.pdf&";
let PODCAST_CATEGORY = 14;
let POSTS_API_BASE_URL = `https://software-enginnering-daily-api.herokuapp.com/api/posts?categories=${PODCAST_CATEGORY}&`;


function getPosts(limit, page) {
  let options = {
    method: "GET",
    uri: `${POSTS_API_BASE_URL}limit=${limit}&page=${page}`
  }
  return request(options).then(response => {
    let allPosts = JSON.parse(response);
    let posts = []
    for (var index in allPosts) {
      posts.push({
        _id: allPosts[index]._id,
        link: allPosts[index].link
      })
    }
    return posts;
  })
}

function getPostTranscriptUrl(postUrl) {
  let options = {
    method: "GET",
    uri: postUrl
  }
  return request(options).then(response => {
    const dom = new JSDOM(response);
    console.log(dom.window.document.getElementsByClassName("post__content"));
  })
}


function pdfToText(filename) {
  let dataBuffer = fs.readFileSync(filename);
  return pdf(dataBuffer)
}

function getAllTranscripts(per_page, page) {
  let options = {
    method: "GET",
    uri: `${PDF_API_BASE_URL}per_page=${per_page}&page=${page}`
  }
  return request(options).then(response => {
    let allPdfs = JSON.parse(response);
    let transcripts = []
    for (var index in allPdfs) {
      if (allPdfs[index].slug.match(TRANSCRIPT_REGEX)) {
        console.log(allPdfs[index])
        transcripts.push(allPdfs[index].guid.rendered)
      }
    }
    return transcripts;
  })
}

function downloadTranscript(file_url) {
  return request({
    method: "GET",
    uri: file_url,
    encoding: null,
    headers: {
      "Content-type": "applcation/pdf"
    }
  }).then(response => {
    return pdf(response)
  })
}

function downloadAllTranscripts(allTranscriptUrls, index, callback) {
  var index = index ? index : 0;
  console.log('index:', index)
  downloadTranscript(allTranscriptUrls[index]).then(result => {
    console.log(result.info.Title)
    // console.log(result.text)
    // send result to big table with associated title and/or id
    if (index < allTranscriptUrls.length) {
      downloadAllTranscripts(allTranscriptUrls, index + 1, callback)
      return null;
    } else {
      callback(null)
    }
  }).catch(err => {
    callback(err)
  })
}

class SEDTranscriptIngester extends ContentIngester {
  constructor() {
    super();
  }

  getContentAll() {
    let allTranscriptUrls = []
    getAllTranscripts("100", "1").then(transcripts => {
      return transcripts;
    })
    .then(t => {
      allTranscriptUrls = allTranscriptUrls.concat(t)
      console.log(allTranscriptUrls.length)
      return getAllTranscripts("100", "2")
    })
    .then(t => {
      allTranscriptUrls = allTranscriptUrls.concat(t)
      console.log(allTranscriptUrls.length)
      return getAllTranscripts("100", "3")
    })
    .then(t => {
      allTranscriptUrls = allTranscriptUrls.concat(t)
      console.log(allTranscriptUrls.length)
      return getAllTranscripts("100", "4")
    })
    .then(t => {
      allTranscriptUrls = allTranscriptUrls.concat(t)
      console.log(allTranscriptUrls.length)
      return getAllTranscripts("100", "5")
    })
    .then(t => {
      allTranscriptUrls = allTranscriptUrls.concat(t)
      console.log(allTranscriptUrls.length)
      downloadAllTranscripts(allTranscriptUrls, 0, () => {
        console.log('done')
      })
    })
  }

  getContentLatest() {
    // getAllTranscripts("4", "1").then(transcripts => {
    //   downloadAllTranscripts(transcripts, 0, () => {
    //     console.log('done')
    //   })
    // })
    getPosts("1", "1").then(posts => {
      posts.forEach(post => {
        getPostTranscriptUrl(post.link)
      })
      
    })
  }
}

export default SEDTranscriptIngester;

