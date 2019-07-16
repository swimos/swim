// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.http;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.Writer;
import swim.util.Murmur3;

public final class HttpStatus extends HttpPart implements Debug {
  final int code;
  final String phrase;

  HttpStatus(int code, String phrase) {
    this.code = code;
    this.phrase = phrase;
  }

  public int code() {
    return this.code;
  }

  public String phrase() {
    return this.phrase;
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.statusWriter(this.code, this.phrase);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeStatus(this.code, this.phrase, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpStatus) {
      final HttpStatus that = (HttpStatus) other;
      return this.code == that.code && this.phrase.equals(that.phrase);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(HttpStatus.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed, this.code), this.phrase.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("HttpStatus").write('.').write("from").write('(')
        .debug(this.code).write(", ").debug(this.phrase).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static final HttpStatus CONTINUE                      = new HttpStatus(100, "Continue");
  public static final HttpStatus SWITCHING_PROTOCOLS           = new HttpStatus(101, "Switching Protocols");

  public static final HttpStatus OK                            = new HttpStatus(200, "OK");
  public static final HttpStatus CREATED                       = new HttpStatus(201, "Created");
  public static final HttpStatus ACCEPTED                      = new HttpStatus(202, "Accepted");
  public static final HttpStatus NON_AUTHORITATIVE_INFORMATION = new HttpStatus(203, "Non-Authoritative Information");
  public static final HttpStatus NO_CONTENT                    = new HttpStatus(204, "No Content");
  public static final HttpStatus RESET_CONTENT                 = new HttpStatus(205, "Reset Content");
  public static final HttpStatus PARTIAL_CONTENT               = new HttpStatus(206, "Partial Content");

  public static final HttpStatus MULTIPLE_CHOICES              = new HttpStatus(300, "Multiple Choices");
  public static final HttpStatus MOVED_PERMANENTLY             = new HttpStatus(301, "Moved Permanently");
  public static final HttpStatus FOUND                         = new HttpStatus(302, "Found");
  public static final HttpStatus SEE_OTHER                     = new HttpStatus(303, "See Other");
  public static final HttpStatus NOT_MODIFIED                  = new HttpStatus(304, "Not Modified");
  public static final HttpStatus USE_PROXY                     = new HttpStatus(305, "Use Proxy");
  public static final HttpStatus TEMPORARY_REDIRECT            = new HttpStatus(307, "Temporary Redirect");

  public static final HttpStatus BAD_REQUEST                   = new HttpStatus(400, "Bad Request");
  public static final HttpStatus UNAUTHORIZED                  = new HttpStatus(401, "Unauthorized");
  public static final HttpStatus PAYMENT_REQUIRED              = new HttpStatus(402, "Payment Required");
  public static final HttpStatus FORBIDDEN                     = new HttpStatus(403, "Forbidden");
  public static final HttpStatus NOT_FOUND                     = new HttpStatus(404, "Not Found");
  public static final HttpStatus METHOD_NOT_ALLOWED            = new HttpStatus(405, "Method Not Allowed");
  public static final HttpStatus NOT_ACCEPTABLE                = new HttpStatus(406, "Not Acceptable");
  public static final HttpStatus PROXY_AUTHENTICATION_REQUIRED = new HttpStatus(407, "Proxy Authentication Required");
  public static final HttpStatus REQUEST_TIMEOUT               = new HttpStatus(408, "Request Timeout");
  public static final HttpStatus CONFLICT                      = new HttpStatus(409, "Conflict");
  public static final HttpStatus GONE                          = new HttpStatus(410, "Gone");
  public static final HttpStatus LENGTH_REQUIRED               = new HttpStatus(411, "Length Required");
  public static final HttpStatus PRECONDITION_FAILED           = new HttpStatus(412, "Precondition Failed");
  public static final HttpStatus PAYLOAD_TOO_LARGE             = new HttpStatus(413, "Payload Too Large");
  public static final HttpStatus URI_TOO_LONG                  = new HttpStatus(414, "URI Too Long");
  public static final HttpStatus UNSUPPORTED_MEDIA_TYPE        = new HttpStatus(415, "Unsupported Media Type");
  public static final HttpStatus RANGE_NOT_SATISFIABLE         = new HttpStatus(416, "Range Not Satisfiable");
  public static final HttpStatus EXPECTATION_FAILED            = new HttpStatus(417, "Expectation Failed");
  public static final HttpStatus UPGRADE_REQUIRED              = new HttpStatus(426, "Upgrade Required");

  public static final HttpStatus INTERNAL_SERVER_ERROR         = new HttpStatus(500, "Internal Server Error");
  public static final HttpStatus NOT_IMPLEMENTED               = new HttpStatus(501, "Not Implemented");
  public static final HttpStatus BAD_GATEWAY                   = new HttpStatus(502, "Bad Gateway");
  public static final HttpStatus SERVICE_UNAVAILABLE           = new HttpStatus(503, "Service Unavailable");
  public static final HttpStatus GATEWAY_TIMEOUT               = new HttpStatus(504, "Gateway Timeout");
  public static final HttpStatus HTTP_VERSION_NOT_SUPPORTED    = new HttpStatus(505, "HTTP Version Not Supported");

  public static HttpStatus from(int code) {
    switch (code) {
      case 100: return CONTINUE;
      case 101: return SWITCHING_PROTOCOLS;
      case 200: return OK;
      case 201: return CREATED;
      case 202: return ACCEPTED;
      case 203: return NON_AUTHORITATIVE_INFORMATION;
      case 204: return NO_CONTENT;
      case 205: return RESET_CONTENT;
      case 206: return PARTIAL_CONTENT;
      case 300: return MULTIPLE_CHOICES;
      case 301: return MOVED_PERMANENTLY;
      case 302: return FOUND;
      case 303: return SEE_OTHER;
      case 304: return NOT_MODIFIED;
      case 305: return USE_PROXY;
      case 307: return TEMPORARY_REDIRECT;
      case 400: return BAD_REQUEST;
      case 401: return UNAUTHORIZED;
      case 402: return PAYMENT_REQUIRED;
      case 403: return FORBIDDEN;
      case 404: return NOT_FOUND;
      case 405: return METHOD_NOT_ALLOWED;
      case 406: return NOT_ACCEPTABLE;
      case 407: return PROXY_AUTHENTICATION_REQUIRED;
      case 408: return REQUEST_TIMEOUT;
      case 409: return CONFLICT;
      case 410: return GONE;
      case 411: return LENGTH_REQUIRED;
      case 412: return PRECONDITION_FAILED;
      case 413: return PAYLOAD_TOO_LARGE;
      case 414: return URI_TOO_LONG;
      case 415: return UNSUPPORTED_MEDIA_TYPE;
      case 416: return RANGE_NOT_SATISFIABLE;
      case 417: return EXPECTATION_FAILED;
      case 426: return UPGRADE_REQUIRED;
      case 500: return INTERNAL_SERVER_ERROR;
      case 501: return NOT_IMPLEMENTED;
      case 502: return BAD_GATEWAY;
      case 503: return SERVICE_UNAVAILABLE;
      case 504: return GATEWAY_TIMEOUT;
      case 505: return HTTP_VERSION_NOT_SUPPORTED;
      default: return new HttpStatus(code, "");
    }
  }

  public static HttpStatus from(int code, String phrase) {
    if (code == 100 && phrase.equals("Continue")) {
      return CONTINUE;
    } else if (code == 101 && phrase.equals("Switching Protocols")) {
      return SWITCHING_PROTOCOLS;
    } else if (code == 200 && phrase.equals("OK")) {
      return OK;
    } else if (code == 201 && phrase.equals("Created")) {
      return CREATED;
    } else if (code == 202 && phrase.equals("Accepted")) {
      return ACCEPTED;
    } else if (code == 203 && phrase.equals("Non-Authoritative Information")) {
      return NON_AUTHORITATIVE_INFORMATION;
    } else if (code == 204 && phrase.equals("No Content")) {
      return NO_CONTENT;
    } else if (code == 205 && phrase.equals("Reset Content")) {
      return RESET_CONTENT;
    } else if (code == 206 && phrase.equals("Partial Content")) {
      return PARTIAL_CONTENT;
    } else if (code == 300 && phrase.equals("Multiple Choices")) {
      return MULTIPLE_CHOICES;
    } else if (code == 301 && phrase.equals("Moved Permanently")) {
      return MOVED_PERMANENTLY;
    } else if (code == 302 && phrase.equals("Found")) {
      return FOUND;
    } else if (code == 303 && phrase.equals("See Other")) {
      return SEE_OTHER;
    } else if (code == 304 && phrase.equals("Not Modified")) {
      return NOT_MODIFIED;
    } else if (code == 305 && phrase.equals("Use Proxy")) {
      return USE_PROXY;
    } else if (code == 307 && phrase.equals("Temporary Redirect")) {
      return TEMPORARY_REDIRECT;
    } else if (code == 400 && phrase.equals("Bad Request")) {
      return BAD_REQUEST;
    } else if (code == 401 && phrase.equals("Unauthorized")) {
      return UNAUTHORIZED;
    } else if (code == 402 && phrase.equals("Payment Required")) {
      return PAYMENT_REQUIRED;
    } else if (code == 403 && phrase.equals("Forbidden")) {
      return FORBIDDEN;
    } else if (code == 404 && phrase.equals("Not Found")) {
      return NOT_FOUND;
    } else if (code == 405 && phrase.equals("Method Not Allowed")) {
      return METHOD_NOT_ALLOWED;
    } else if (code == 406 && phrase.equals("Not Acceptable")) {
      return NOT_ACCEPTABLE;
    } else if (code == 407 && phrase.equals("Proxy Authentication Required")) {
      return PROXY_AUTHENTICATION_REQUIRED;
    } else if (code == 408 && phrase.equals("Request Timeout")) {
      return REQUEST_TIMEOUT;
    } else if (code == 409 && phrase.equals("Conflict")) {
      return CONFLICT;
    } else if (code == 410 && phrase.equals("Gone")) {
      return GONE;
    } else if (code == 411 && phrase.equals("Length Required")) {
      return LENGTH_REQUIRED;
    } else if (code == 412 && phrase.equals("Precondition Failed")) {
      return PRECONDITION_FAILED;
    } else if (code == 413 && phrase.equals("Payload Too Large")) {
      return PAYLOAD_TOO_LARGE;
    } else if (code == 414 && phrase.equals("URI Too Long")) {
      return URI_TOO_LONG;
    } else if (code == 415 && phrase.equals("Unsupported Media Type")) {
      return UNSUPPORTED_MEDIA_TYPE;
    } else if (code == 416 && phrase.equals("Range Not Satisfiable")) {
      return RANGE_NOT_SATISFIABLE;
    } else if (code == 417 && phrase.equals("Expectation Failed")) {
      return EXPECTATION_FAILED;
    } else if (code == 426 && phrase.equals("Upgrade Required")) {
      return UPGRADE_REQUIRED;
    } else if (code == 500 && phrase.equals("Internal Server Error")) {
      return INTERNAL_SERVER_ERROR;
    } else if (code == 501 && phrase.equals("Not Implemented")) {
      return NOT_IMPLEMENTED;
    } else if (code == 502 && phrase.equals("Bad Gateway")) {
      return BAD_GATEWAY;
    } else if (code == 503 && phrase.equals("Service Unavailable")) {
      return SERVICE_UNAVAILABLE;
    } else if (code == 504 && phrase.equals("Gateway Timeout")) {
      return GATEWAY_TIMEOUT;
    } else if (code == 505 && phrase.equals("HTTP Version Not Supported")) {
      return HTTP_VERSION_NOT_SUPPORTED;
    } else {
      return new HttpStatus(code, phrase);
    }
  }

  public static HttpStatus parseHttp(String string) {
    return Http.standardParser().parseStatusString(string);
  }
}
