// Copyright 2015-2023 Nstream, inc.
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

import org.junit.jupiter.api.Test;

public class HttpStatusTests {

  @Test
  public void parseStatuses() {
    assertParses(HttpStatus.of(100, "Continue"), "100 Continue");
    assertParses(HttpStatus.of(101, "Switching Protocols"), "101 Switching Protocols");
    assertParses(HttpStatus.of(200, "OK"), "200 OK");
    assertParses(HttpStatus.of(201, "Created"), "201 Created");
    assertParses(HttpStatus.of(202, "Accepted"), "202 Accepted");
    assertParses(HttpStatus.of(203, "Non-Authoritative Information"), "203 Non-Authoritative Information");
    assertParses(HttpStatus.of(204, "No Content"), "204 No Content");
    assertParses(HttpStatus.of(205, "Reset Content"), "205 Reset Content");
    assertParses(HttpStatus.of(206, "Partial Content"), "206 Partial Content");
    assertParses(HttpStatus.of(300, "Multiple Choices"), "300 Multiple Choices");
    assertParses(HttpStatus.of(301, "Moved Permanently"), "301 Moved Permanently");
    assertParses(HttpStatus.of(302, "Found"), "302 Found");
    assertParses(HttpStatus.of(303, "See Other"), "303 See Other");
    assertParses(HttpStatus.of(304, "Not Modified"), "304 Not Modified");
    assertParses(HttpStatus.of(305, "Use Proxy"), "305 Use Proxy");
    assertParses(HttpStatus.of(307, "Temporary Redirect"), "307 Temporary Redirect");
    assertParses(HttpStatus.of(400, "Bad Request"), "400 Bad Request");
    assertParses(HttpStatus.of(401, "Unauthorized"), "401 Unauthorized");
    assertParses(HttpStatus.of(402, "Payment Required"), "402 Payment Required");
    assertParses(HttpStatus.of(403, "Forbidden"), "403 Forbidden");
    assertParses(HttpStatus.of(404, "Not Found"), "404 Not Found");
    assertParses(HttpStatus.of(405, "Method Not Allowed"), "405 Method Not Allowed");
    assertParses(HttpStatus.of(406, "Not Acceptable"), "406 Not Acceptable");
    assertParses(HttpStatus.of(407, "Proxy Authentication Required"), "407 Proxy Authentication Required");
    assertParses(HttpStatus.of(408, "Request Timeout"), "408 Request Timeout");
    assertParses(HttpStatus.of(409, "Conflict"), "409 Conflict");
    assertParses(HttpStatus.of(410, "Gone"), "410 Gone");
    assertParses(HttpStatus.of(411, "Length Required"), "411 Length Required");
    assertParses(HttpStatus.of(412, "Precondition Failed"), "412 Precondition Failed");
    assertParses(HttpStatus.of(413, "Payload Too Large"), "413 Payload Too Large");
    assertParses(HttpStatus.of(414, "URI Too Long"), "414 URI Too Long");
    assertParses(HttpStatus.of(415, "Unsupported Media Type"), "415 Unsupported Media Type");
    assertParses(HttpStatus.of(416, "Range Not Satisfiable"), "416 Range Not Satisfiable");
    assertParses(HttpStatus.of(417, "Expectation Failed"), "417 Expectation Failed");
    assertParses(HttpStatus.of(426, "Upgrade Required"), "426 Upgrade Required");
    assertParses(HttpStatus.of(500, "Internal Server Error"), "500 Internal Server Error");
    assertParses(HttpStatus.of(501, "Not Implemented"), "501 Not Implemented");
    assertParses(HttpStatus.of(502, "Bad Gateway"), "502 Bad Gateway");
    assertParses(HttpStatus.of(503, "Service Unavailable"), "503 Service Unavailable");
    assertParses(HttpStatus.of(504, "Gateway Timeout"), "504 Gateway Timeout");
    assertParses(HttpStatus.of(505, "HTTP Version Not Supported"), "505 HTTP Version Not Supported");
  }

  @Test
  public void writeStatuses() {
    assertWrites("100 Continue", HttpStatus.of(100, "Continue"));
    assertWrites("101 Switching Protocols", HttpStatus.of(101, "Switching Protocols"));
    assertWrites("200 OK", HttpStatus.of(200, "OK"));
    assertWrites("201 Created", HttpStatus.of(201, "Created"));
    assertWrites("202 Accepted", HttpStatus.of(202, "Accepted"));
    assertWrites("203 Non-Authoritative Information", HttpStatus.of(203, "Non-Authoritative Information"));
    assertWrites("204 No Content", HttpStatus.of(204, "No Content"));
    assertWrites("205 Reset Content", HttpStatus.of(205, "Reset Content"));
    assertWrites("206 Partial Content", HttpStatus.of(206, "Partial Content"));
    assertWrites("300 Multiple Choices", HttpStatus.of(300, "Multiple Choices"));
    assertWrites("301 Moved Permanently", HttpStatus.of(301, "Moved Permanently"));
    assertWrites("302 Found", HttpStatus.of(302, "Found"));
    assertWrites("303 See Other", HttpStatus.of(303, "See Other"));
    assertWrites("304 Not Modified", HttpStatus.of(304, "Not Modified"));
    assertWrites("305 Use Proxy", HttpStatus.of(305, "Use Proxy"));
    assertWrites("307 Temporary Redirect", HttpStatus.of(307, "Temporary Redirect"));
    assertWrites("400 Bad Request", HttpStatus.of(400, "Bad Request"));
    assertWrites("401 Unauthorized", HttpStatus.of(401, "Unauthorized"));
    assertWrites("402 Payment Required", HttpStatus.of(402, "Payment Required"));
    assertWrites("403 Forbidden", HttpStatus.of(403, "Forbidden"));
    assertWrites("404 Not Found", HttpStatus.of(404, "Not Found"));
    assertWrites("405 Method Not Allowed", HttpStatus.of(405, "Method Not Allowed"));
    assertWrites("406 Not Acceptable", HttpStatus.of(406, "Not Acceptable"));
    assertWrites("407 Proxy Authentication Required", HttpStatus.of(407, "Proxy Authentication Required"));
    assertWrites("408 Request Timeout", HttpStatus.of(408, "Request Timeout"));
    assertWrites("409 Conflict", HttpStatus.of(409, "Conflict"));
    assertWrites("410 Gone", HttpStatus.of(410, "Gone"));
    assertWrites("411 Length Required", HttpStatus.of(411, "Length Required"));
    assertWrites("412 Precondition Failed", HttpStatus.of(412, "Precondition Failed"));
    assertWrites("413 Payload Too Large", HttpStatus.of(413, "Payload Too Large"));
    assertWrites("414 URI Too Long", HttpStatus.of(414, "URI Too Long"));
    assertWrites("415 Unsupported Media Type", HttpStatus.of(415, "Unsupported Media Type"));
    assertWrites("416 Range Not Satisfiable", HttpStatus.of(416, "Range Not Satisfiable"));
    assertWrites("417 Expectation Failed", HttpStatus.of(417, "Expectation Failed"));
    assertWrites("426 Upgrade Required", HttpStatus.of(426, "Upgrade Required"));
    assertWrites("500 Internal Server Error", HttpStatus.of(500, "Internal Server Error"));
    assertWrites("501 Not Implemented", HttpStatus.of(501, "Not Implemented"));
    assertWrites("502 Bad Gateway", HttpStatus.of(502, "Bad Gateway"));
    assertWrites("503 Service Unavailable", HttpStatus.of(503, "Service Unavailable"));
    assertWrites("504 Gateway Timeout", HttpStatus.of(504, "Gateway Timeout"));
    assertWrites("505 HTTP Version Not Supported", HttpStatus.of(505, "HTTP Version Not Supported"));
  }

  @Test
  public void writeStatusesByCode() {
    assertWrites("100 Continue", HttpStatus.of(100));
    assertWrites("101 Switching Protocols", HttpStatus.of(101));
    assertWrites("200 OK", HttpStatus.of(200));
    assertWrites("201 Created", HttpStatus.of(201));
    assertWrites("202 Accepted", HttpStatus.of(202));
    assertWrites("203 Non-Authoritative Information", HttpStatus.of(203));
    assertWrites("204 No Content", HttpStatus.of(204));
    assertWrites("205 Reset Content", HttpStatus.of(205));
    assertWrites("206 Partial Content", HttpStatus.of(206));
    assertWrites("300 Multiple Choices", HttpStatus.of(300));
    assertWrites("301 Moved Permanently", HttpStatus.of(301));
    assertWrites("302 Found", HttpStatus.of(302));
    assertWrites("303 See Other", HttpStatus.of(303));
    assertWrites("304 Not Modified", HttpStatus.of(304));
    assertWrites("305 Use Proxy", HttpStatus.of(305));
    assertWrites("307 Temporary Redirect", HttpStatus.of(307));
    assertWrites("400 Bad Request", HttpStatus.of(400));
    assertWrites("401 Unauthorized", HttpStatus.of(401));
    assertWrites("402 Payment Required", HttpStatus.of(402));
    assertWrites("403 Forbidden", HttpStatus.of(403));
    assertWrites("404 Not Found", HttpStatus.of(404));
    assertWrites("405 Method Not Allowed", HttpStatus.of(405));
    assertWrites("406 Not Acceptable", HttpStatus.of(406));
    assertWrites("407 Proxy Authentication Required", HttpStatus.of(407));
    assertWrites("408 Request Timeout", HttpStatus.of(408));
    assertWrites("409 Conflict", HttpStatus.of(409));
    assertWrites("410 Gone", HttpStatus.of(410));
    assertWrites("411 Length Required", HttpStatus.of(411));
    assertWrites("412 Precondition Failed", HttpStatus.of(412));
    assertWrites("413 Payload Too Large", HttpStatus.of(413));
    assertWrites("414 URI Too Long", HttpStatus.of(414));
    assertWrites("415 Unsupported Media Type", HttpStatus.of(415));
    assertWrites("416 Range Not Satisfiable", HttpStatus.of(416));
    assertWrites("417 Expectation Failed", HttpStatus.of(417));
    assertWrites("426 Upgrade Required", HttpStatus.of(426));
    assertWrites("500 Internal Server Error", HttpStatus.of(500));
    assertWrites("501 Not Implemented", HttpStatus.of(501));
    assertWrites("502 Bad Gateway", HttpStatus.of(502));
    assertWrites("503 Service Unavailable", HttpStatus.of(503));
    assertWrites("504 Gateway Timeout", HttpStatus.of(504));
    assertWrites("505 HTTP Version Not Supported", HttpStatus.of(505));
  }

  @Test
  public void writeStatusConstants() {
    assertWrites("100 Continue", HttpStatus.CONTINUE);
    assertWrites("101 Switching Protocols", HttpStatus.SWITCHING_PROTOCOLS);
    assertWrites("200 OK", HttpStatus.OK);
    assertWrites("201 Created", HttpStatus.CREATED);
    assertWrites("202 Accepted", HttpStatus.ACCEPTED);
    assertWrites("203 Non-Authoritative Information", HttpStatus.NON_AUTHORITATIVE_INFORMATION);
    assertWrites("204 No Content", HttpStatus.NO_CONTENT);
    assertWrites("205 Reset Content", HttpStatus.RESET_CONTENT);
    assertWrites("206 Partial Content", HttpStatus.PARTIAL_CONTENT);
    assertWrites("300 Multiple Choices", HttpStatus.MULTIPLE_CHOICES);
    assertWrites("301 Moved Permanently", HttpStatus.MOVED_PERMANENTLY);
    assertWrites("302 Found", HttpStatus.FOUND);
    assertWrites("303 See Other", HttpStatus.SEE_OTHER);
    assertWrites("304 Not Modified", HttpStatus.NOT_MODIFIED);
    assertWrites("305 Use Proxy", HttpStatus.USE_PROXY);
    assertWrites("307 Temporary Redirect", HttpStatus.TEMPORARY_REDIRECT);
    assertWrites("400 Bad Request", HttpStatus.BAD_REQUEST);
    assertWrites("401 Unauthorized", HttpStatus.UNAUTHORIZED);
    assertWrites("402 Payment Required", HttpStatus.PAYMENT_REQUIRED);
    assertWrites("403 Forbidden", HttpStatus.FORBIDDEN);
    assertWrites("404 Not Found", HttpStatus.NOT_FOUND);
    assertWrites("405 Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED);
    assertWrites("406 Not Acceptable", HttpStatus.NOT_ACCEPTABLE);
    assertWrites("407 Proxy Authentication Required", HttpStatus.PROXY_AUTHENTICATION_REQUIRED);
    assertWrites("408 Request Timeout", HttpStatus.REQUEST_TIMEOUT);
    assertWrites("409 Conflict", HttpStatus.CONFLICT);
    assertWrites("410 Gone", HttpStatus.GONE);
    assertWrites("411 Length Required", HttpStatus.LENGTH_REQUIRED);
    assertWrites("412 Precondition Failed", HttpStatus.PRECONDITION_FAILED);
    assertWrites("413 Payload Too Large", HttpStatus.PAYLOAD_TOO_LARGE);
    assertWrites("414 URI Too Long", HttpStatus.URI_TOO_LONG);
    assertWrites("415 Unsupported Media Type", HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    assertWrites("416 Range Not Satisfiable", HttpStatus.RANGE_NOT_SATISFIABLE);
    assertWrites("417 Expectation Failed", HttpStatus.EXPECTATION_FAILED);
    assertWrites("426 Upgrade Required", HttpStatus.UPGRADE_REQUIRED);
    assertWrites("500 Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
    assertWrites("501 Not Implemented", HttpStatus.NOT_IMPLEMENTED);
    assertWrites("502 Bad Gateway", HttpStatus.BAD_GATEWAY);
    assertWrites("503 Service Unavailable", HttpStatus.SERVICE_UNAVAILABLE);
    assertWrites("504 Gateway Timeout", HttpStatus.GATEWAY_TIMEOUT);
    assertWrites("505 HTTP Version Not Supported", HttpStatus.HTTP_VERSION_NOT_SUPPORTED);
  }

  public static void assertParses(HttpStatus expected, String string) {
    HttpAssertions.assertParses(HttpStatus.parse(), expected, string);
  }

  public static void assertWrites(String expected, HttpStatus status) {
    HttpAssertions.assertWrites(expected, status::write);
  }

}
