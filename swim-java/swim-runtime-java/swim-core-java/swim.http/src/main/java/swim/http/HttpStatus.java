// Copyright 2015-2021 Swim Inc.
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
    return http.writeStatus(output, this.code, this.phrase);
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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HttpStatus.hashSeed == 0) {
      HttpStatus.hashSeed = Murmur3.seed(HttpStatus.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HttpStatus.hashSeed, this.code), this.phrase.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HttpStatus").write('.').write("create").write('(')
                   .debug(this.code).write(", ").debug(this.phrase).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static final HttpStatus CONTINUE = new HttpStatus(100, "Continue");
  public static final HttpStatus SWITCHING_PROTOCOLS = new HttpStatus(101, "Switching Protocols");
  public static final HttpStatus OK = new HttpStatus(200, "OK");
  public static final HttpStatus CREATED = new HttpStatus(201, "Created");
  public static final HttpStatus ACCEPTED = new HttpStatus(202, "Accepted");
  public static final HttpStatus NON_AUTHORITATIVE_INFORMATION = new HttpStatus(203, "Non-Authoritative Information");
  public static final HttpStatus NO_CONTENT = new HttpStatus(204, "No Content");
  public static final HttpStatus RESET_CONTENT = new HttpStatus(205, "Reset Content");
  public static final HttpStatus PARTIAL_CONTENT = new HttpStatus(206, "Partial Content");
  public static final HttpStatus MULTIPLE_CHOICES = new HttpStatus(300, "Multiple Choices");
  public static final HttpStatus MOVED_PERMANENTLY = new HttpStatus(301, "Moved Permanently");
  public static final HttpStatus FOUND = new HttpStatus(302, "Found");
  public static final HttpStatus SEE_OTHER = new HttpStatus(303, "See Other");
  public static final HttpStatus NOT_MODIFIED = new HttpStatus(304, "Not Modified");
  public static final HttpStatus USE_PROXY = new HttpStatus(305, "Use Proxy");
  public static final HttpStatus TEMPORARY_REDIRECT = new HttpStatus(307, "Temporary Redirect");
  public static final HttpStatus BAD_REQUEST = new HttpStatus(400, "Bad Request");
  public static final HttpStatus UNAUTHORIZED = new HttpStatus(401, "Unauthorized");
  public static final HttpStatus PAYMENT_REQUIRED = new HttpStatus(402, "Payment Required");
  public static final HttpStatus FORBIDDEN = new HttpStatus(403, "Forbidden");
  public static final HttpStatus NOT_FOUND = new HttpStatus(404, "Not Found");
  public static final HttpStatus METHOD_NOT_ALLOWED = new HttpStatus(405, "Method Not Allowed");
  public static final HttpStatus NOT_ACCEPTABLE = new HttpStatus(406, "Not Acceptable");
  public static final HttpStatus PROXY_AUTHENTICATION_REQUIRED = new HttpStatus(407, "Proxy Authentication Required");
  public static final HttpStatus REQUEST_TIMEOUT = new HttpStatus(408, "Request Timeout");
  public static final HttpStatus CONFLICT = new HttpStatus(409, "Conflict");
  public static final HttpStatus GONE = new HttpStatus(410, "Gone");
  public static final HttpStatus LENGTH_REQUIRED = new HttpStatus(411, "Length Required");
  public static final HttpStatus PRECONDITION_FAILED = new HttpStatus(412, "Precondition Failed");
  public static final HttpStatus PAYLOAD_TOO_LARGE = new HttpStatus(413, "Payload Too Large");
  public static final HttpStatus URI_TOO_LONG = new HttpStatus(414, "URI Too Long");
  public static final HttpStatus UNSUPPORTED_MEDIA_TYPE = new HttpStatus(415, "Unsupported Media Type");
  public static final HttpStatus RANGE_NOT_SATISFIABLE = new HttpStatus(416, "Range Not Satisfiable");
  public static final HttpStatus EXPECTATION_FAILED = new HttpStatus(417, "Expectation Failed");
  public static final HttpStatus UPGRADE_REQUIRED = new HttpStatus(426, "Upgrade Required");
  public static final HttpStatus INTERNAL_SERVER_ERROR = new HttpStatus(500, "Internal Server Error");
  public static final HttpStatus NOT_IMPLEMENTED = new HttpStatus(501, "Not Implemented");
  public static final HttpStatus BAD_GATEWAY = new HttpStatus(502, "Bad Gateway");
  public static final HttpStatus SERVICE_UNAVAILABLE = new HttpStatus(503, "Service Unavailable");
  public static final HttpStatus GATEWAY_TIMEOUT = new HttpStatus(504, "Gateway Timeout");
  public static final HttpStatus HTTP_VERSION_NOT_SUPPORTED = new HttpStatus(505, "HTTP Version Not Supported");

  public static HttpStatus from(int code) {
    switch (code) {
      case 100: return HttpStatus.CONTINUE;
      case 101: return HttpStatus.SWITCHING_PROTOCOLS;
      case 200: return HttpStatus.OK;
      case 201: return HttpStatus.CREATED;
      case 202: return HttpStatus.ACCEPTED;
      case 203: return HttpStatus.NON_AUTHORITATIVE_INFORMATION;
      case 204: return HttpStatus.NO_CONTENT;
      case 205: return HttpStatus.RESET_CONTENT;
      case 206: return HttpStatus.PARTIAL_CONTENT;
      case 300: return HttpStatus.MULTIPLE_CHOICES;
      case 301: return HttpStatus.MOVED_PERMANENTLY;
      case 302: return HttpStatus.FOUND;
      case 303: return HttpStatus.SEE_OTHER;
      case 304: return HttpStatus.NOT_MODIFIED;
      case 305: return HttpStatus.USE_PROXY;
      case 307: return HttpStatus.TEMPORARY_REDIRECT;
      case 400: return HttpStatus.BAD_REQUEST;
      case 401: return HttpStatus.UNAUTHORIZED;
      case 402: return HttpStatus.PAYMENT_REQUIRED;
      case 403: return HttpStatus.FORBIDDEN;
      case 404: return HttpStatus.NOT_FOUND;
      case 405: return HttpStatus.METHOD_NOT_ALLOWED;
      case 406: return HttpStatus.NOT_ACCEPTABLE;
      case 407: return HttpStatus.PROXY_AUTHENTICATION_REQUIRED;
      case 408: return HttpStatus.REQUEST_TIMEOUT;
      case 409: return HttpStatus.CONFLICT;
      case 410: return HttpStatus.GONE;
      case 411: return HttpStatus.LENGTH_REQUIRED;
      case 412: return HttpStatus.PRECONDITION_FAILED;
      case 413: return HttpStatus.PAYLOAD_TOO_LARGE;
      case 414: return HttpStatus.URI_TOO_LONG;
      case 415: return HttpStatus.UNSUPPORTED_MEDIA_TYPE;
      case 416: return HttpStatus.RANGE_NOT_SATISFIABLE;
      case 417: return HttpStatus.EXPECTATION_FAILED;
      case 426: return HttpStatus.UPGRADE_REQUIRED;
      case 500: return HttpStatus.INTERNAL_SERVER_ERROR;
      case 501: return HttpStatus.NOT_IMPLEMENTED;
      case 502: return HttpStatus.BAD_GATEWAY;
      case 503: return HttpStatus.SERVICE_UNAVAILABLE;
      case 504: return HttpStatus.GATEWAY_TIMEOUT;
      case 505: return HTTP_VERSION_NOT_SUPPORTED;
      default: return new HttpStatus(code, "");
    }
  }

  public static HttpStatus create(int code, String phrase) {
    if (code == 100 && (phrase == null || phrase.equals("Continue"))) {
      return HttpStatus.CONTINUE;
    } else if (code == 101 && (phrase == null || phrase.equals("Switching Protocols"))) {
      return HttpStatus.SWITCHING_PROTOCOLS;
    } else if (code == 200 && (phrase == null || phrase.equals("OK"))) {
      return HttpStatus.OK;
    } else if (code == 201 && (phrase == null || phrase.equals("Created"))) {
      return HttpStatus.CREATED;
    } else if (code == 202 && (phrase == null || phrase.equals("Accepted"))) {
      return HttpStatus.ACCEPTED;
    } else if (code == 203 && (phrase == null || phrase.equals("Non-Authoritative Information"))) {
      return HttpStatus.NON_AUTHORITATIVE_INFORMATION;
    } else if (code == 204 && (phrase == null || phrase.equals("No Content"))) {
      return HttpStatus.NO_CONTENT;
    } else if (code == 205 && (phrase == null || phrase.equals("Reset Content"))) {
      return HttpStatus.RESET_CONTENT;
    } else if (code == 206 && (phrase == null || phrase.equals("Partial Content"))) {
      return HttpStatus.PARTIAL_CONTENT;
    } else if (code == 300 && (phrase == null || phrase.equals("Multiple Choices"))) {
      return HttpStatus.MULTIPLE_CHOICES;
    } else if (code == 301 && (phrase == null || phrase.equals("Moved Permanently"))) {
      return HttpStatus.MOVED_PERMANENTLY;
    } else if (code == 302 && (phrase == null || phrase.equals("Found"))) {
      return HttpStatus.FOUND;
    } else if (code == 303 && (phrase == null || phrase.equals("See Other"))) {
      return HttpStatus.SEE_OTHER;
    } else if (code == 304 && (phrase == null || phrase.equals("Not Modified"))) {
      return HttpStatus.NOT_MODIFIED;
    } else if (code == 305 && (phrase == null || phrase.equals("Use Proxy"))) {
      return HttpStatus.USE_PROXY;
    } else if (code == 307 && (phrase == null || phrase.equals("Temporary Redirect"))) {
      return HttpStatus.TEMPORARY_REDIRECT;
    } else if (code == 400 && (phrase == null || phrase.equals("Bad Request"))) {
      return HttpStatus.BAD_REQUEST;
    } else if (code == 401 && (phrase == null || phrase.equals("Unauthorized"))) {
      return HttpStatus.UNAUTHORIZED;
    } else if (code == 402 && (phrase == null || phrase.equals("Payment Required"))) {
      return HttpStatus.PAYMENT_REQUIRED;
    } else if (code == 403 && (phrase == null || phrase.equals("Forbidden"))) {
      return HttpStatus.FORBIDDEN;
    } else if (code == 404 && (phrase == null || phrase.equals("Not Found"))) {
      return HttpStatus.NOT_FOUND;
    } else if (code == 405 && (phrase == null || phrase.equals("Method Not Allowed"))) {
      return HttpStatus.METHOD_NOT_ALLOWED;
    } else if (code == 406 && (phrase == null || phrase.equals("Not Acceptable"))) {
      return HttpStatus.NOT_ACCEPTABLE;
    } else if (code == 407 && (phrase == null || phrase.equals("Proxy Authentication Required"))) {
      return HttpStatus.PROXY_AUTHENTICATION_REQUIRED;
    } else if (code == 408 && (phrase == null || phrase.equals("Request Timeout"))) {
      return HttpStatus.REQUEST_TIMEOUT;
    } else if (code == 409 && (phrase == null || phrase.equals("Conflict"))) {
      return HttpStatus.CONFLICT;
    } else if (code == 410 && (phrase == null || phrase.equals("Gone"))) {
      return HttpStatus.GONE;
    } else if (code == 411 && (phrase == null || phrase.equals("Length Required"))) {
      return HttpStatus.LENGTH_REQUIRED;
    } else if (code == 412 && (phrase == null || phrase.equals("Precondition Failed"))) {
      return HttpStatus.PRECONDITION_FAILED;
    } else if (code == 413 && (phrase == null || phrase.equals("Payload Too Large"))) {
      return HttpStatus.PAYLOAD_TOO_LARGE;
    } else if (code == 414 && (phrase == null || phrase.equals("URI Too Long"))) {
      return HttpStatus.URI_TOO_LONG;
    } else if (code == 415 && (phrase == null || phrase.equals("Unsupported Media Type"))) {
      return HttpStatus.UNSUPPORTED_MEDIA_TYPE;
    } else if (code == 416 && (phrase == null || phrase.equals("Range Not Satisfiable"))) {
      return HttpStatus.RANGE_NOT_SATISFIABLE;
    } else if (code == 417 && (phrase == null || phrase.equals("Expectation Failed"))) {
      return HttpStatus.EXPECTATION_FAILED;
    } else if (code == 426 && (phrase == null || phrase.equals("Upgrade Required"))) {
      return HttpStatus.UPGRADE_REQUIRED;
    } else if (code == 500 && (phrase == null || phrase.equals("Internal Server Error"))) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (code == 501 && (phrase == null || phrase.equals("Not Implemented"))) {
      return HttpStatus.NOT_IMPLEMENTED;
    } else if (code == 502 && (phrase == null || phrase.equals("Bad Gateway"))) {
      return HttpStatus.BAD_GATEWAY;
    } else if (code == 503 && (phrase == null || phrase.equals("Service Unavailable"))) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    } else if (code == 504 && (phrase == null || phrase.equals("Gateway Timeout"))) {
      return HttpStatus.GATEWAY_TIMEOUT;
    } else if (code == 505 && (phrase == null || phrase.equals("HTTP Version Not Supported"))) {
      return HttpStatus.HTTP_VERSION_NOT_SUPPORTED;
    } else {
      return new HttpStatus(code, phrase);
    }
  }

  public static HttpStatus parseHttp(String string) {
    return Http.standardParser().parseStatusString(string);
  }

}
