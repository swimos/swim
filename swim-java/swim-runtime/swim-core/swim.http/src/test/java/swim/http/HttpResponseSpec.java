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

import org.testng.annotations.Test;
import swim.http.header.ConnectionHeader;
import swim.http.header.ContentLengthHeader;
import swim.http.header.RawHeader;
import swim.http.header.SecWebSocketAcceptHeader;
import swim.http.header.SecWebSocketProtocolHeader;
import swim.http.header.UpgradeHeader;
import static swim.http.HttpAssertions.assertWrites;

public class HttpResponseSpec {

  @Test
  public void parseResponsesWithNoHeaders() {
    assertParses("HTTP/1.0 200 OK\r\n"
               + "\r\n",
                 HttpResponse.create(HttpVersion.HTTP_1_0, HttpStatus.OK));
  }

  @Test
  public void parseResponsesWithASingleHeader() {
    assertParses("HTTP/1.1 200 OK\r\n"
               + "Key: Value\r\n"
               + "\r\n",
                 HttpResponse.create(HttpStatus.OK, RawHeader.create("Key", "Value")));
    assertParses("HTTP/1.1 200 OK\r\n"
               + "Content-Length: 0\r\n"
               + "\r\n",
                 HttpResponse.create(HttpStatus.OK, ContentLengthHeader.create(0)));
  }

  @Test
  public void parseResponsesWithMultipleHeaders() {
    assertParses("HTTP/1.1 101 Switching Protocols\r\n"
               + "Upgrade: websocket\r\n"
               + "Connection: Upgrade\r\n"
               + "Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n"
               + "Sec-WebSocket-Protocol: chat\r\n"
               + "\r\n",
                 HttpResponse.create(HttpStatus.SWITCHING_PROTOCOLS,
                                     UpgradeHeader.create("websocket"),
                                     ConnectionHeader.create("Upgrade"),
                                     SecWebSocketAcceptHeader.create("s3pPLMBiTxaQ9kYGzzhZRbK+xOo="),
                                     SecWebSocketProtocolHeader.create("chat")));
  }

  @Test
  public void writeResponsesWithNoHeaders() {
    assertWrites(HttpResponse.create(HttpVersion.HTTP_1_0, HttpStatus.OK),
                 "HTTP/1.0 200 OK\r\n"
               + "\r\n");
  }

  @Test
  public void writeResponsesWithASingleHeader() {
    assertWrites(HttpResponse.create(HttpStatus.OK, RawHeader.create("Foo", "Bar")),
                 "HTTP/1.1 200 OK\r\n"
               + "Foo: Bar\r\n"
               + "\r\n");
    assertWrites(HttpResponse.create(HttpStatus.OK, ContentLengthHeader.create(0)),
                 "HTTP/1.1 200 OK\r\n"
               + "Content-Length: 0\r\n"
               + "\r\n");
  }

  @Test
  public void writeResponsesWithMultipleHeaders() {
    assertWrites(HttpResponse.create(HttpStatus.SWITCHING_PROTOCOLS,
                                     UpgradeHeader.create("websocket"),
                                     ConnectionHeader.create("Upgrade"),
                                     SecWebSocketAcceptHeader.create("s3pPLMBiTxaQ9kYGzzhZRbK+xOo="),
                                     SecWebSocketProtocolHeader.create("chat")),
                 "HTTP/1.1 101 Switching Protocols\r\n"
               + "Upgrade: websocket\r\n"
               + "Connection: Upgrade\r\n"
               + "Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n"
               + "Sec-WebSocket-Protocol: chat\r\n"
               + "\r\n");
  }

  public static <T> void assertParses(String string, HttpResponse<T> response) {
    HttpAssertions.assertParses(Http.standardParser().<T>responseParser(), string, response);
  }

}
