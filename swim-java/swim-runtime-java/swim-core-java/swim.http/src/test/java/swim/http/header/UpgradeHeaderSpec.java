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

package swim.http.header;

import org.testng.annotations.Test;
import swim.http.Http;
import swim.http.HttpAssertions;
import swim.http.HttpHeader;
import static swim.http.HttpAssertions.assertWrites;

public class UpgradeHeaderSpec {

  @Test
  public void parseUpgradeHeaders() {
    assertParses("Upgrade: websocket", UpgradeHeader.create("websocket"));
    assertParses("Upgrade: h2c, SHTTP/1.3, IRC/6.9, RTA/x11",
                 UpgradeHeader.create("h2c", "SHTTP/1.3", "IRC/6.9", "RTA/x11"));
  }

  @Test
  public void writeUpgradeHeaders() {
    assertWrites(UpgradeHeader.create("websocket"), "Upgrade: websocket");
    assertWrites(UpgradeHeader.create("h2c", "SHTTP/1.3", "IRC/6.9", "RTA/x11"),
                 "Upgrade: h2c, SHTTP/1.3, IRC/6.9, RTA/x11");
  }

  public static void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

}
