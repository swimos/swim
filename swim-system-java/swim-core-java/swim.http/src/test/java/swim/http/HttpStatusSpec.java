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

import org.testng.annotations.Test;
import static swim.http.HttpAssertions.assertWrites;

public class HttpStatusSpec {
  public void assertParses(String string, HttpStatus status) {
    HttpAssertions.assertParses(Http.standardParser().statusParser(), string, status);
  }

  @Test
  public void parseStatuses() {
    assertParses("100 Continue", HttpStatus.from(100, "Continue"));
    assertParses("101 Switching Protocols", HttpStatus.from(101, "Switching Protocols"));
    assertParses("200 OK", HttpStatus.from(200, "OK"));
    assertParses("201 Created", HttpStatus.from(201, "Created"));
    assertParses("202 Accepted", HttpStatus.from(202, "Accepted"));
    assertParses("203 Non-Authoritative Information", HttpStatus.from(203, "Non-Authoritative Information"));
    assertParses("204 No Content", HttpStatus.from(204, "No Content"));
    assertParses("205 Reset Content", HttpStatus.from(205, "Reset Content"));
    assertParses("206 Partial Content", HttpStatus.from(206, "Partial Content"));
    assertParses("300 Multiple Choices", HttpStatus.from(300, "Multiple Choices"));
    assertParses("301 Moved Permanently", HttpStatus.from(301, "Moved Permanently"));
    assertParses("302 Found", HttpStatus.from(302, "Found"));
    assertParses("303 See Other", HttpStatus.from(303, "See Other"));
    assertParses("304 Not Modified", HttpStatus.from(304, "Not Modified"));
    assertParses("305 Use Proxy", HttpStatus.from(305, "Use Proxy"));
    assertParses("307 Temporary Redirect", HttpStatus.from(307, "Temporary Redirect"));
    assertParses("400 Bad Request", HttpStatus.from(400, "Bad Request"));
    assertParses("401 Unauthorized", HttpStatus.from(401, "Unauthorized"));
    assertParses("402 Payment Required", HttpStatus.from(402, "Payment Required"));
    assertParses("403 Forbidden", HttpStatus.from(403, "Forbidden"));
    assertParses("404 Not Found", HttpStatus.from(404, "Not Found"));
    assertParses("405 Method Not Allowed", HttpStatus.from(405, "Method Not Allowed"));
    assertParses("406 Not Acceptable", HttpStatus.from(406, "Not Acceptable"));
    assertParses("407 Proxy Authentication Required", HttpStatus.from(407, "Proxy Authentication Required"));
    assertParses("408 Request Timeout", HttpStatus.from(408, "Request Timeout"));
    assertParses("409 Conflict", HttpStatus.from(409, "Conflict"));
    assertParses("410 Gone", HttpStatus.from(410, "Gone"));
    assertParses("411 Length Required", HttpStatus.from(411, "Length Required"));
    assertParses("412 Precondition Failed", HttpStatus.from(412, "Precondition Failed"));
    assertParses("413 Payload Too Large", HttpStatus.from(413, "Payload Too Large"));
    assertParses("414 URI Too Long", HttpStatus.from(414, "URI Too Long"));
    assertParses("415 Unsupported Media Type", HttpStatus.from(415, "Unsupported Media Type"));
    assertParses("416 Range Not Satisfiable", HttpStatus.from(416, "Range Not Satisfiable"));
    assertParses("417 Expectation Failed", HttpStatus.from(417, "Expectation Failed"));
    assertParses("426 Upgrade Required", HttpStatus.from(426, "Upgrade Required"));
    assertParses("500 Internal Server Error", HttpStatus.from(500, "Internal Server Error"));
    assertParses("501 Not Implemented", HttpStatus.from(501, "Not Implemented"));
    assertParses("502 Bad Gateway", HttpStatus.from(502, "Bad Gateway"));
    assertParses("503 Service Unavailable", HttpStatus.from(503, "Service Unavailable"));
    assertParses("504 Gateway Timeout", HttpStatus.from(504, "Gateway Timeout"));
    assertParses("505 HTTP Version Not Supported", HttpStatus.from(505, "HTTP Version Not Supported"));
  }

  @Test
  public void writeStatuses() {
    assertWrites(HttpStatus.from(100, "Continue"), "100 Continue");
    assertWrites(HttpStatus.from(101, "Switching Protocols"), "101 Switching Protocols");
    assertWrites(HttpStatus.from(200, "OK"), "200 OK");
    assertWrites(HttpStatus.from(201, "Created"), "201 Created");
    assertWrites(HttpStatus.from(202, "Accepted"), "202 Accepted");
    assertWrites(HttpStatus.from(203, "Non-Authoritative Information"), "203 Non-Authoritative Information");
    assertWrites(HttpStatus.from(204, "No Content"), "204 No Content");
    assertWrites(HttpStatus.from(205, "Reset Content"), "205 Reset Content");
    assertWrites(HttpStatus.from(206, "Partial Content"), "206 Partial Content");
    assertWrites(HttpStatus.from(300, "Multiple Choices"), "300 Multiple Choices");
    assertWrites(HttpStatus.from(301, "Moved Permanently"), "301 Moved Permanently");
    assertWrites(HttpStatus.from(302, "Found"), "302 Found");
    assertWrites(HttpStatus.from(303, "See Other"), "303 See Other");
    assertWrites(HttpStatus.from(304, "Not Modified"), "304 Not Modified");
    assertWrites(HttpStatus.from(305, "Use Proxy"), "305 Use Proxy");
    assertWrites(HttpStatus.from(307, "Temporary Redirect"), "307 Temporary Redirect");
    assertWrites(HttpStatus.from(400, "Bad Request"), "400 Bad Request");
    assertWrites(HttpStatus.from(401, "Unauthorized"), "401 Unauthorized");
    assertWrites(HttpStatus.from(402, "Payment Required"), "402 Payment Required");
    assertWrites(HttpStatus.from(403, "Forbidden"), "403 Forbidden");
    assertWrites(HttpStatus.from(404, "Not Found"), "404 Not Found");
    assertWrites(HttpStatus.from(405, "Method Not Allowed"), "405 Method Not Allowed");
    assertWrites(HttpStatus.from(406, "Not Acceptable"), "406 Not Acceptable");
    assertWrites(HttpStatus.from(407, "Proxy Authentication Required"), "407 Proxy Authentication Required");
    assertWrites(HttpStatus.from(408, "Request Timeout"), "408 Request Timeout");
    assertWrites(HttpStatus.from(409, "Conflict"), "409 Conflict");
    assertWrites(HttpStatus.from(410, "Gone"), "410 Gone");
    assertWrites(HttpStatus.from(411, "Length Required"), "411 Length Required");
    assertWrites(HttpStatus.from(412, "Precondition Failed"), "412 Precondition Failed");
    assertWrites(HttpStatus.from(413, "Payload Too Large"), "413 Payload Too Large");
    assertWrites(HttpStatus.from(414, "URI Too Long"), "414 URI Too Long");
    assertWrites(HttpStatus.from(415, "Unsupported Media Type"), "415 Unsupported Media Type");
    assertWrites(HttpStatus.from(416, "Range Not Satisfiable"), "416 Range Not Satisfiable");
    assertWrites(HttpStatus.from(417, "Expectation Failed"), "417 Expectation Failed");
    assertWrites(HttpStatus.from(426, "Upgrade Required"), "426 Upgrade Required");
    assertWrites(HttpStatus.from(500, "Internal Server Error"), "500 Internal Server Error");
    assertWrites(HttpStatus.from(501, "Not Implemented"), "501 Not Implemented");
    assertWrites(HttpStatus.from(502, "Bad Gateway"), "502 Bad Gateway");
    assertWrites(HttpStatus.from(503, "Service Unavailable"), "503 Service Unavailable");
    assertWrites(HttpStatus.from(504, "Gateway Timeout"), "504 Gateway Timeout");
    assertWrites(HttpStatus.from(505, "HTTP Version Not Supported"), "505 HTTP Version Not Supported");
  }

  @Test
  public void writeStatusesByCode() {
    assertWrites(HttpStatus.from(100), "100 Continue");
    assertWrites(HttpStatus.from(101), "101 Switching Protocols");
    assertWrites(HttpStatus.from(200), "200 OK");
    assertWrites(HttpStatus.from(201), "201 Created");
    assertWrites(HttpStatus.from(202), "202 Accepted");
    assertWrites(HttpStatus.from(203), "203 Non-Authoritative Information");
    assertWrites(HttpStatus.from(204), "204 No Content");
    assertWrites(HttpStatus.from(205), "205 Reset Content");
    assertWrites(HttpStatus.from(206), "206 Partial Content");
    assertWrites(HttpStatus.from(300), "300 Multiple Choices");
    assertWrites(HttpStatus.from(301), "301 Moved Permanently");
    assertWrites(HttpStatus.from(302), "302 Found");
    assertWrites(HttpStatus.from(303), "303 See Other");
    assertWrites(HttpStatus.from(304), "304 Not Modified");
    assertWrites(HttpStatus.from(305), "305 Use Proxy");
    assertWrites(HttpStatus.from(307), "307 Temporary Redirect");
    assertWrites(HttpStatus.from(400), "400 Bad Request");
    assertWrites(HttpStatus.from(401), "401 Unauthorized");
    assertWrites(HttpStatus.from(402), "402 Payment Required");
    assertWrites(HttpStatus.from(403), "403 Forbidden");
    assertWrites(HttpStatus.from(404), "404 Not Found");
    assertWrites(HttpStatus.from(405), "405 Method Not Allowed");
    assertWrites(HttpStatus.from(406), "406 Not Acceptable");
    assertWrites(HttpStatus.from(407), "407 Proxy Authentication Required");
    assertWrites(HttpStatus.from(408), "408 Request Timeout");
    assertWrites(HttpStatus.from(409), "409 Conflict");
    assertWrites(HttpStatus.from(410), "410 Gone");
    assertWrites(HttpStatus.from(411), "411 Length Required");
    assertWrites(HttpStatus.from(412), "412 Precondition Failed");
    assertWrites(HttpStatus.from(413), "413 Payload Too Large");
    assertWrites(HttpStatus.from(414), "414 URI Too Long");
    assertWrites(HttpStatus.from(415), "415 Unsupported Media Type");
    assertWrites(HttpStatus.from(416), "416 Range Not Satisfiable");
    assertWrites(HttpStatus.from(417), "417 Expectation Failed");
    assertWrites(HttpStatus.from(426), "426 Upgrade Required");
    assertWrites(HttpStatus.from(500), "500 Internal Server Error");
    assertWrites(HttpStatus.from(501), "501 Not Implemented");
    assertWrites(HttpStatus.from(502), "502 Bad Gateway");
    assertWrites(HttpStatus.from(503), "503 Service Unavailable");
    assertWrites(HttpStatus.from(504), "504 Gateway Timeout");
    assertWrites(HttpStatus.from(505), "505 HTTP Version Not Supported");
  }

  @Test
  public void writeStatusConstants() {
    assertWrites(HttpStatus.CONTINUE, "100 Continue");
    assertWrites(HttpStatus.SWITCHING_PROTOCOLS, "101 Switching Protocols");
    assertWrites(HttpStatus.OK, "200 OK");
    assertWrites(HttpStatus.CREATED, "201 Created");
    assertWrites(HttpStatus.ACCEPTED, "202 Accepted");
    assertWrites(HttpStatus.NON_AUTHORITATIVE_INFORMATION, "203 Non-Authoritative Information");
    assertWrites(HttpStatus.NO_CONTENT, "204 No Content");
    assertWrites(HttpStatus.RESET_CONTENT, "205 Reset Content");
    assertWrites(HttpStatus.PARTIAL_CONTENT, "206 Partial Content");
    assertWrites(HttpStatus.MULTIPLE_CHOICES, "300 Multiple Choices");
    assertWrites(HttpStatus.MOVED_PERMANENTLY, "301 Moved Permanently");
    assertWrites(HttpStatus.FOUND, "302 Found");
    assertWrites(HttpStatus.SEE_OTHER, "303 See Other");
    assertWrites(HttpStatus.NOT_MODIFIED, "304 Not Modified");
    assertWrites(HttpStatus.USE_PROXY, "305 Use Proxy");
    assertWrites(HttpStatus.TEMPORARY_REDIRECT, "307 Temporary Redirect");
    assertWrites(HttpStatus.BAD_REQUEST, "400 Bad Request");
    assertWrites(HttpStatus.UNAUTHORIZED, "401 Unauthorized");
    assertWrites(HttpStatus.PAYMENT_REQUIRED, "402 Payment Required");
    assertWrites(HttpStatus.FORBIDDEN, "403 Forbidden");
    assertWrites(HttpStatus.NOT_FOUND, "404 Not Found");
    assertWrites(HttpStatus.METHOD_NOT_ALLOWED, "405 Method Not Allowed");
    assertWrites(HttpStatus.NOT_ACCEPTABLE, "406 Not Acceptable");
    assertWrites(HttpStatus.PROXY_AUTHENTICATION_REQUIRED, "407 Proxy Authentication Required");
    assertWrites(HttpStatus.REQUEST_TIMEOUT, "408 Request Timeout");
    assertWrites(HttpStatus.CONFLICT, "409 Conflict");
    assertWrites(HttpStatus.GONE, "410 Gone");
    assertWrites(HttpStatus.LENGTH_REQUIRED, "411 Length Required");
    assertWrites(HttpStatus.PRECONDITION_FAILED, "412 Precondition Failed");
    assertWrites(HttpStatus.PAYLOAD_TOO_LARGE, "413 Payload Too Large");
    assertWrites(HttpStatus.URI_TOO_LONG, "414 URI Too Long");
    assertWrites(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "415 Unsupported Media Type");
    assertWrites(HttpStatus.RANGE_NOT_SATISFIABLE, "416 Range Not Satisfiable");
    assertWrites(HttpStatus.EXPECTATION_FAILED, "417 Expectation Failed");
    assertWrites(HttpStatus.UPGRADE_REQUIRED, "426 Upgrade Required");
    assertWrites(HttpStatus.INTERNAL_SERVER_ERROR, "500 Internal Server Error");
    assertWrites(HttpStatus.NOT_IMPLEMENTED, "501 Not Implemented");
    assertWrites(HttpStatus.BAD_GATEWAY, "502 Bad Gateway");
    assertWrites(HttpStatus.SERVICE_UNAVAILABLE, "503 Service Unavailable");
    assertWrites(HttpStatus.GATEWAY_TIMEOUT, "504 Gateway Timeout");
    assertWrites(HttpStatus.HTTP_VERSION_NOT_SUPPORTED, "505 HTTP Version Not Supported");
  }
}
