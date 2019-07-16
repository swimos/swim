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
import swim.http.Http;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import static swim.http.HttpAssertions.assertWrites;

public class HostSpec {
  public void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

  @Test
  public void parseHostHeaders() {
    assertParses("Host: example.com", Host.from("example.com"));
    assertParses("Host: example.com:80", Host.from("example.com", 80));
    assertParses("Host: 127.0.0.1", Host.from("127.0.0.1"));
    assertParses("Host: 127.0.0.1:8080", Host.from("127.0.0.1", 8080));
  }

  @Test
  public void writeHostHeaders() {
    assertWrites(Host.from("example.com"), "Host: example.com");
    assertWrites(Host.from("example.com", 80), "Host: example.com:80");
    assertWrites(Host.from("127.0.0.1"), "Host: 127.0.0.1");
    assertWrites(Host.from("127.0.0.1", 8080), "Host: 127.0.0.1:8080");
  }
}
