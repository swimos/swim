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

package swim.http.header;

import org.testng.annotations.Test;
import swim.http.ContentCoding;
import swim.http.Http;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import static swim.http.HttpAssertions.assertWrites;

public class AcceptEncodingHeaderSpec {

  @Test
  public void parseAcceptEncodingHeaders() {
    assertParses("Accept-Encoding: *", AcceptEncodingHeader.create(ContentCoding.star()));
    assertParses("Accept-Encoding: identity", AcceptEncodingHeader.create(ContentCoding.identity()));
    assertParses("Accept-Encoding: identity;q=0", AcceptEncodingHeader.create(ContentCoding.create("identity", 0f)));
    assertParses("Accept-Encoding: identity; q=0", AcceptEncodingHeader.create(ContentCoding.create("identity", 0f)));
    assertParses("Accept-Encoding: identity ; q=0", AcceptEncodingHeader.create(ContentCoding.create("identity", 0f)));
    assertParses("Accept-Encoding: gzip; q=1", AcceptEncodingHeader.create(ContentCoding.create("gzip", 1f)));
    assertParses("Accept-Encoding: gzip; q=1.0", AcceptEncodingHeader.create(ContentCoding.create("gzip", 1f)));
    assertParses("Accept-Encoding: gzip; q=1.00", AcceptEncodingHeader.create(ContentCoding.create("gzip", 1f)));
    assertParses("Accept-Encoding: gzip; q=1.000", AcceptEncodingHeader.create(ContentCoding.create("gzip", 1f)));
    assertParses("Accept-Encoding: gzip; q=0.005", AcceptEncodingHeader.create(ContentCoding.create("gzip", 0.005f)));
    assertParses("Accept-Encoding: gzip,deflate,identity",
                 AcceptEncodingHeader.create(ContentCoding.create("gzip"),
                                             ContentCoding.create("deflate"),
                                             ContentCoding.identity()));
    assertParses("Accept-Encoding: gzip, deflate ,identity",
                 AcceptEncodingHeader.create(ContentCoding.create("gzip"),
                                             ContentCoding.create("deflate"),
                                             ContentCoding.identity()));
    assertParses("Accept-Encoding: gzip; q=1, deflate; q=0.5, identity; q=0",
                 AcceptEncodingHeader.create(ContentCoding.create("gzip", 1f),
                                             ContentCoding.create("deflate", 0.5f),
                                             ContentCoding.create("identity", 0f)));
  }

  @Test
  public void writeAcceptEncodingHeaders() {
    assertWrites(AcceptEncodingHeader.create(ContentCoding.star()), "Accept-Encoding: *");
    assertWrites(AcceptEncodingHeader.create(ContentCoding.identity()), "Accept-Encoding: identity");
    assertWrites(AcceptEncodingHeader.create(ContentCoding.create("identity", 0f)), "Accept-Encoding: identity; q=0");
    assertWrites(AcceptEncodingHeader.create(ContentCoding.create("gzip", 0.005f)), "Accept-Encoding: gzip; q=0.005");
    assertWrites(AcceptEncodingHeader.create(ContentCoding.create("gzip"),
                                             ContentCoding.create("deflate"),
                                             ContentCoding.identity()),
                 "Accept-Encoding: gzip, deflate, identity");
    assertWrites(AcceptEncodingHeader.create(ContentCoding.create("gzip", 1f),
                                             ContentCoding.create("deflate", 0.5f),
                                             ContentCoding.create("identity", 0f)),
                 "Accept-Encoding: gzip, deflate; q=0.5, identity; q=0");
  }

  public static void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

}
