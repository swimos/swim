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

public class MaxForwardsSpec {
  public void assertParses(String string, HttpHeader header) {
    HttpAssertions.assertParses(Http.standardParser().headerParser(), string, header);
  }

  @Test
  public void parseMaxForwardsHeaders() {
    assertParses("Max-Forwards: 0", MaxForwards.from(0));
    assertParses("Max-Forwards: 1", MaxForwards.from(1));
    assertParses("Max-Forwards: 15", MaxForwards.from(15));
  }

  @Test
  public void writeMaxForwardsHeaders() {
    assertWrites(MaxForwards.from(0), "Max-Forwards: 0");
    assertWrites(MaxForwards.from(1), "Max-Forwards: 1");
    assertWrites(MaxForwards.from(15), "Max-Forwards: 15");
  }
}
