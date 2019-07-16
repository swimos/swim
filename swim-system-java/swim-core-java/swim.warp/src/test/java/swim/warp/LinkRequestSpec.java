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

public class LinkRequestSpec {
  @Test
  public void parseLinkWithNamedHeaders() {
    assertParses("@link(node: node_uri, lane: lane_uri, prio: 0.5, rate: 1.0)",
                 new LinkRequest("node_uri", "lane_uri", 0.5f, 1.0f));
  }

  @Test
  public void parseLinkWithPositionalHeaders() {
    assertParses("@link(node_uri, lane_uri)",
                 new LinkRequest("node_uri", "lane_uri", 0.0f, 0.0f));
  }

  @Test
  public void parseLinkWithBody() {
    assertParses("@link(node_uri, lane_uri)@test",
                 new LinkRequest("node_uri", "lane_uri", 0.0f, 0.0f, Record.of(Attr.of("test"))));
  }

  @Test
  public void writeLink() {
    assertWrites(new LinkRequest("node_uri", "lane_uri", 0.0f, 0.0f),
                 "@link(node:node_uri,lane:lane_uri)");
  }

  @Test
  public void writeLinkWithPrio() {
    assertWrites(new LinkRequest("node_uri", "lane_uri", 0.5f, 0.0f),
                 "@link(node:node_uri,lane:lane_uri,prio:0.5)");
  }

  @Test
  public void writeLinkWithRate() {
    assertWrites(new LinkRequest("node_uri", "lane_uri", 0.0f, 1.0f),
                 "@link(node:node_uri,lane:lane_uri,rate:1)");
  }

  @Test
  public void writeLinkWithPrioAndRate() {
    assertWrites(new LinkRequest("node_uri", "lane_uri", 0.5f, 1.0f),
                 "@link(node:node_uri,lane:lane_uri,prio:0.5,rate:1)");
  }

  @Test
  public void writeLinkWithBody() {
    assertWrites(new LinkRequest("node_uri", "lane_uri", 0.0f, 0.0f, Record.of(Attr.of("test"))),
                 "@link(node:node_uri,lane:lane_uri)@test");
  }
}
