import config from '../../config/config';
import ContentIngester from './ContentIngester';
import request from 'request-promise';
import fs from 'fs';
import http from 'http';
import url from 'url';
import pdf from 'pdf-parse';

let TRANSCRIPT_REGEX = /sed([0-9\.]+)/;
let PDF_API_BASE_URL = "https://softwareengineeringdaily.com/wp-json/wp/v2/media?type=attachment&search=.pdf&";

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
        transcripts.push(allPdfs[index].guid.rendered)
      }
    }
    return transcripts;
  })
}

function downloadTranscript(file_url) {
  var DOWNLOAD_DIR = './downloads/';
  var options = {
    host: url.parse(file_url).host,
    port: 80,
    path: url.parse(file_url).pathname
  };

  var file_name = url.parse(file_url).pathname.split('/').pop();
  var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);

  return new Promise((resolve, reject) => {
    http.get(options, function(res) {
      res.on('data', function(data) {
        file.write(data);
      }).on('end', function() {
        file.end();
        resolve()
      });
    });
  })
}

function downloadAllTranscripts(allTranscriptUrls, index, callback) {
  var index = index ? index : 0;
  console.log('index:', index)
  downloadTranscript(allTranscriptUrls[index]).then(result => {
    if (index < allTranscriptUrls.length) {
      downloadAllTranscripts(allTranscriptUrls, index + 1, callback)
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
    // loop through pages to get all transcripts
    let allTranscriptUrls = []
    //allTranscriptUrls = allTranscriptUrls.concat(transcripts)
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
    
  }
}

export default SEDTranscriptIngester;

