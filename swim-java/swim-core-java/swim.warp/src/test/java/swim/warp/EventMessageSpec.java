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

package swim.warp;

import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Record;
import static swim.warp.Assertions.assertParses;
import static swim.warp.Assertions.assertWrites;

public class EventMessageSpec {
  @Test
  public void parseEventWithNamedHeaders() {
    assertParses("@event(node: node_uri, lane: lane_uri)",
                 new EventMessage("node_uri", "lane_uri"));
  }

  @Test
  public void parseEventWithPositionalHeaders() {
    assertParses("@event(node_uri, lane_uri)",
                 new EventMessage("node_uri", "lane_uri"));
  }

  @Test
  public void parseEventWithBody() {
    assertParses("@event(node_uri, lane_uri)@test",
                 new EventMessage("node_uri", "lane_uri", Record.of(Attr.of("test"))));
  }

  @Test
  public void writeEvent() {
    assertWrites(new EventMessage("node/uri", "lane_uri"),
                 "@event(node:\"node/uri\",lane:lane_uri)");
  }

  @Test
  public void writeEventWithBody() {
    assertWrites(new EventMessage("node/uri", "lane_uri", Record.of(Attr.of("test"))),
                 "@event(node:\"node/uri\",lane:lane_uri)@test");
  }
}
