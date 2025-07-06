import https from 'https'
import timer from '@szmarczak/http-timer'

const ALLOWED_HOSTS = ['vercel.app'];

function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_HOSTS.some((host) => parsedUrl.hostname.endsWith(host));
  } catch (err) {
    return false;
  }
}

// a wrapper around genAsyncRequest that will retry the request 5 times if it fails
export async function genRetryableRequest(url) {
  if (!isValidUrl(url)) {
    throw new Error(`Invalid URL: ${url}`);
  }
  let retries = 0;
  while (retries < 10) {
    try {
      return await genAsyncRequest(url);
    } catch (err) {}
    retries++;
  }
  throw new Error(`Failed to fetch ${url}, too many retries`);
}

// a wrapper around http.request that is enhanced with timing information
async function genAsyncRequest(url) {
  if (!isValidUrl(url)) {
    throw new Error(`Invalid URL: ${url}`);
  }
  return new Promise((resolve, reject) => {
    const request = https.get(url);
    timer(request)
    request.on('response', (response) => {
      let body = ''
      response.on('data', (data) => {
        body += data
      })
      response.on('end', () => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch ${url}`))
        }
        resolve({
          ...response.timings.phases,
          cold: !body.includes('HOT'),
        })
      })
      response.on('error', (err) => {
        reject(err)
      })
    })
    request.on('error', (err) => {
      reject(err)
    })
  })
}
