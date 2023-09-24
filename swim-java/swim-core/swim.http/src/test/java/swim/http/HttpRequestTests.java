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

public class HttpRequestTests {

  @Test
  public void parseRequestsWithNoHeaders() {
    assertParses(HttpRequest.of(HttpMethod.GET, "/", HttpVersion.HTTP_1_0),
                 "GET / HTTP/1.0\r\n"
               + "\r\n");
  }

  @Test
  public void parseRequestsWithASingleHeader() {
    assertParses(HttpRequest.of(HttpMethod.HEAD, "/path", HttpHeader.of("Key", "Value")),
                 "HEAD /path HTTP/1.1\r\n"
               + "Key: Value\r\n"
               + "\r\n");
    assertParses(HttpRequest.of(HttpMethod.HEAD, "/path", HttpHeader.of("Host", "example.com")),
                 "HEAD /path HTTP/1.1\r\n"
               + "Host: example.com\r\n"
               + "\r\n");
  }

  @Test
  public void parseRequestsWithMultipleHeaders() {
    assertParses(HttpRequest.of(HttpMethod.GET, "/chat",
                                HttpHeader.of("Host", "example.com"),
                                HttpHeader.of("Upgrade", "websocket"),
                                HttpHeader.of("Connection", "Upgrade"),
                                HttpHeader.of("Sec-WebSocket-Key", "dGhlIHNhbXBsZSBub25jZQ=="),
                                HttpHeader.of("Origin", "http://example.com"),
                                HttpHeader.of("Sec-WebSocket-Protocol", "chat, superchat"),
                                HttpHeader.of("Sec-WebSocket-Version", "13")),
                 "GET /chat HTTP/1.1\r\n"
               + "Host: example.com\r\n"
               + "Upgrade: websocket\r\n"
               + "Connection: Upgrade\r\n"
               + "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n"
               + "Origin: http://example.com\r\n"
               + "Sec-WebSocket-Protocol: chat, superchat\r\n"
               + "Sec-WebSocket-Version: 13\r\n"
               + "\r\n");
  }

  @Test
  public void writeRequestsWithNoHeaders() {
    assertWrites("GET / HTTP/1.0\r\n"
               + "\r\n",
                 HttpRequest.of(HttpMethod.GET, "/", HttpVersion.HTTP_1_0));
  }

  @Test
  public void writeRequestsWithASingleHeader() {
    assertWrites("HEAD /path HTTP/1.1\r\n"
               + "Key: Value\r\n"
               + "\r\n",
                 HttpRequest.of(HttpMethod.HEAD, "/path", HttpHeader.of("Key", "Value")));
    assertWrites("HEAD /path HTTP/1.1\r\n"
               + "Host: example.com\r\n"
               + "\r\n",
                 HttpRequest.of(HttpMethod.HEAD, "/path", HttpHeader.of("Host", "example.com")));
  }

  @Test
  public void writeRequestsWithMultipleHeaders() {
    assertWrites("GET /chat HTTP/1.1\r\n"
               + "Host: example.com\r\n"
               + "Upgrade: websocket\r\n"
               + "Connection: Upgrade\r\n"
               + "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n"
               + "Origin: http://example.com\r\n"
               + "Sec-WebSocket-Protocol: chat, superchat\r\n"
               + "Sec-WebSocket-Version: 13\r\n"
               + "\r\n",
                 HttpRequest.of(HttpMethod.GET, "/chat",
                                HttpHeader.of("Host", "example.com"),
                                HttpHeader.of("Upgrade", "websocket"),
                                HttpHeader.of("Connection", "Upgrade"),
                                HttpHeader.of("Sec-WebSocket-Key", "dGhlIHNhbXBsZSBub25jZQ=="),
                                HttpHeader.of("Origin", "http://example.com"),
                                HttpHeader.of("Sec-WebSocket-Protocol", "chat, superchat"),
                                HttpHeader.of("Sec-WebSocket-Version", "13")));
  }

  public static <T> void assertParses(HttpRequest<T> expected, String string) {
    HttpAssertions.assertParses(HttpRequest.parse(), expected, string);
  }

  public static <T> void assertWrites(String expected, HttpRequest<T> request) {
    HttpAssertions.assertWrites(expected, request::write);
  }

}
