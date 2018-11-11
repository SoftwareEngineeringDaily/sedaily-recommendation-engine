import config from '../../config/config';
import ContentIngester from './ContentIngester';
import request from 'request-promise';
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
    getAllTranscripts("40", "1").then(transcripts => {
      downloadAllTranscripts(transcripts, 0, () => {
        console.log('done')
      })
    })
  }
}

export default SEDTranscriptIngester;

