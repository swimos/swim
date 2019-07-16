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
import swim.http.header.Connection;
import swim.http.header.ContentLength;
import swim.http.header.RawHeader;
import swim.http.header.SecWebSocketAccept;
import swim.http.header.SecWebSocketProtocol;
import swim.http.header.Upgrade;
import static swim.http.HttpAssertions.assertWrites;

public class HttpResponseSpec {
  public static <T> void assertParses(String string, HttpResponse<T> response) {
    HttpAssertions.assertParses(Http.standardParser().<T>responseParser(), string, response);
  }

  @Test
  public void parseResponsesWithNoHeaders() {
    assertParses("HTTP/1.0 200 OK\r\n"
               + "\r\n",
                 HttpResponse.from(HttpVersion.HTTP_1_0, HttpStatus.OK));
  }

  @Test
  public void parseResponsesWithASingleHeader() {
    assertParses("HTTP/1.1 200 OK\r\n"
               + "Key: Value\r\n"
               + "\r\n",
                 HttpResponse.from(HttpStatus.OK, RawHeader.from("Key", "Value")));
    assertParses("HTTP/1.1 200 OK\r\n"
               + "Content-Length: 0\r\n"
               + "\r\n",
                 HttpResponse.from(HttpStatus.OK, ContentLength.from(0)));
  }

  @Test
  public void parseResponsesWithMultipleHeaders() {
    assertParses("HTTP/1.1 101 Switching Protocols\r\n"
               + "Upgrade: websocket\r\n"
               + "Connection: Upgrade\r\n"
               + "Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n"
               + "Sec-WebSocket-Protocol: chat\r\n"
               + "\r\n",
                 HttpResponse.from(HttpStatus.SWITCHING_PROTOCOLS,
                                    Upgrade.from("websocket"),
                                    Connection.from("Upgrade"),
                                    SecWebSocketAccept.from("s3pPLMBiTxaQ9kYGzzhZRbK+xOo="),
                                    SecWebSocketProtocol.from("chat")));
  }

  @Test
  public void writeResponsesWithNoHeaders() {
    assertWrites(HttpResponse.from(HttpVersion.HTTP_1_0, HttpStatus.OK),
                 "HTTP/1.0 200 OK\r\n"
               + "\r\n");
  }

  @Test
  public void writeResponsesWithASingleHeader() {
    assertWrites(HttpResponse.from(HttpStatus.OK, RawHeader.from("Foo", "Bar")),
                 "HTTP/1.1 200 OK\r\n"
               + "Foo: Bar\r\n"
               + "\r\n");
    assertWrites(HttpResponse.from(HttpStatus.OK, ContentLength.from(0)),
                 "HTTP/1.1 200 OK\r\n"
               + "Content-Length: 0\r\n"
               + "\r\n");
  }

  @Test
  public void writeResponsesWithMultipleHeaders() {
    assertWrites(HttpResponse.from(HttpStatus.SWITCHING_PROTOCOLS,
                                   Upgrade.from("websocket"),
                                   Connection.from("Upgrade"),
                                   SecWebSocketAccept.from("s3pPLMBiTxaQ9kYGzzhZRbK+xOo="),
                                   SecWebSocketProtocol.from("chat")),
                 "HTTP/1.1 101 Switching Protocols\r\n"
               + "Upgrade: websocket\r\n"
               + "Connection: Upgrade\r\n"
               + "Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n"
               + "Sec-WebSocket-Protocol: chat\r\n"
               + "\r\n");
  }
}
