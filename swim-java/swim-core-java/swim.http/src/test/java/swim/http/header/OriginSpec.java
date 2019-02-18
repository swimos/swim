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

package swim.http.header;

import org.testng.annotations.Test;
import swim.codec.ParserException;
import swim.http.Http;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import static org.testng.Assert.ThrowingRunnable;
import static org.testng.Assert.assertThrows;
import static swim.http.HttpAssertions.assertWrites;

public class OriginSpec {
  public void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

  public static void assertParseFails(final String string) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        HttpHeader.parseHttp(string);
      }
    });
  }

  @Test
  public void parseOriginHeaders() {
    assertParses("Origin: http://www.example.com",
                 Origin.from("http://www.example.com"));
    assertParses("Origin: https://www.example.com:443",
                 Origin.from("https://www.example.com:443"));
    assertParses("Origin: http://example1.com http://example2.com",
                 Origin.from("http://example1.com", "http://example2.com"));
    assertParses("Origin: http://example1.com:8080 http://example2.com:8081",
                 Origin.from("http://example1.com:8080", "http://example2.com:8081"));
    assertParses("Origin: null", Origin.empty());
  }

  @Test
  public void writeOriginHeaders() {
    assertWrites(Origin.from("http://www.example.com"),
                 "Origin: http://www.example.com");
    assertWrites(Origin.from("https://www.example.com:443"),
                 "Origin: https://www.example.com:443");
    assertWrites(Origin.from("http://example1.com", "http://example2.com"),
                 "Origin: http://example1.com http://example2.com");
    assertWrites(Origin.from("http://example1.com:8080", "http://example2.com:8081"),
                 "Origin: http://example1.com:8080 http://example2.com:8081");
    assertWrites(Origin.empty(), "Origin: null");
  }

  @Test
  public void writeOriginHeadersOmittingPath() {
    assertWrites(Origin.from("http://www.example.com/"),
                 "Origin: http://www.example.com");
  }

  @Test
  public void parseOriginHeadersWithTrailingNullFails() {
    assertParseFails("Origin: http://www.example.com null");
  }

  @Test
  public void parseOriginHeadersWithNoSchemeFails() {
    assertParseFails("Origin: www.example.com");
    assertParseFails("Origin: www.example.com:80");
  }

  @Test
  public void parseOriginHeadersWithPathsFails() {
    assertParseFails("Origin: http://www.example.com/");
  }
}
