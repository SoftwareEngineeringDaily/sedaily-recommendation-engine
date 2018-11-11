import { MethodNotImplemented } from '../APIError';

class ContentIngester {
  getContentLatest() {
    throw MethodNotImplemented();
  }

  getContentAll() {
    throw MethodNotImplemented();
  }
}

export default ContentIngester;
