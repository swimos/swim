// Copyright 2015-2022 Swim.inc
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
import swim.http.HttpAssertions;

public class HttpResponseTests {

  @Test
  public void parseResponsesWithNoHeaders() {
    assertParses(HttpResponse.create(HttpVersion.HTTP_1_0, HttpStatus.OK),
                 "HTTP/1.0 200 OK\r\n"
               + "\r\n");
  }

  @Test
  public void parseResponsesWithASingleHeader() {
    assertParses(HttpResponse.create(HttpStatus.OK, HttpHeader.of("Key", "Value")),
                 "HTTP/1.1 200 OK\r\n"
               + "Key: Value\r\n"
               + "\r\n");
    assertParses(HttpResponse.create(HttpStatus.OK, HttpHeader.of("Content-Length", "0")),
                 "HTTP/1.1 200 OK\r\n"
               + "Content-Length: 0\r\n"
               + "\r\n");
  }

  @Test
  public void parseResponsesWithMultipleHeaders() {
    assertParses(HttpResponse.create(HttpStatus.SWITCHING_PROTOCOLS,
                                     HttpHeader.of("Upgrade", "websocket"),
                                     HttpHeader.of("Connection", "Upgrade"),
                                     HttpHeader.of("Sec-WebSocket-Accept", "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="),
                                     HttpHeader.of("Sec-WebSocket-Protocol", "chat")),
                 "HTTP/1.1 101 Switching Protocols\r\n"
               + "Upgrade: websocket\r\n"
               + "Connection: Upgrade\r\n"
               + "Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n"
               + "Sec-WebSocket-Protocol: chat\r\n"
               + "\r\n");
  }

  @Test
  public void writeResponsesWithNoHeaders() {
    assertWrites("HTTP/1.0 200 OK\r\n"
               + "\r\n",
                 HttpResponse.create(HttpVersion.HTTP_1_0, HttpStatus.OK));
  }

  @Test
  public void writeResponsesWithASingleHeader() {
    assertWrites("HTTP/1.1 200 OK\r\n"
               + "Foo: Bar\r\n"
               + "\r\n",
                 HttpResponse.create(HttpStatus.OK, HttpHeader.of("Foo", "Bar")));
    assertWrites("HTTP/1.1 200 OK\r\n"
               + "Content-Length: 0\r\n"
               + "\r\n",
                 HttpResponse.create(HttpStatus.OK, HttpHeader.of("Content-Length", "0")));
  }

  @Test
  public void writeResponsesWithMultipleHeaders() {
    assertWrites("HTTP/1.1 101 Switching Protocols\r\n"
               + "Upgrade: websocket\r\n"
               + "Connection: Upgrade\r\n"
               + "Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n"
               + "Sec-WebSocket-Protocol: chat\r\n"
               + "\r\n",
                 HttpResponse.create(HttpStatus.SWITCHING_PROTOCOLS,
                                     HttpHeader.of("Upgrade", "websocket"),
                                     HttpHeader.of("Connection", "Upgrade"),
                                     HttpHeader.of("Sec-WebSocket-Accept", "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="),
                                     HttpHeader.of("Sec-WebSocket-Protocol", "chat")));
  }

  public static <T> void assertParses(HttpResponse<T> expected, String string) {
    HttpAssertions.assertParses(HttpResponse.parse(), expected, string);
  }

  public static <T> void assertWrites(String expected, HttpResponse<T> response) {
    HttpAssertions.assertWrites(expected, response::write);
  }

}
