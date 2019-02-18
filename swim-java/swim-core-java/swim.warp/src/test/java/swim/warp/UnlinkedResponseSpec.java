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

public class UnlinkedResponseSpec {
  @Test
  public void parseUnlinkedWithNamedHeaders() {
    assertParses("@unlinked(node: node_uri, lane: lane_uri)",
                 new UnlinkedResponse("node_uri", "lane_uri"));
  }

  @Test
  public void parseUnlinkedWithPositionalHeaders() {
    assertParses("@unlinked(node_uri, lane_uri)",
                 new UnlinkedResponse("node_uri", "lane_uri"));
  }

  @Test
  public void parseUnlinkedWithBody() {
    assertParses("@unlinked(node_uri, lane_uri)@test",
                 new UnlinkedResponse("node_uri", "lane_uri", Record.of(Attr.of("test"))));
  }

  @Test
  public void writeUnlinked() {
    assertWrites(new UnlinkedResponse("node_uri", "lane_uri"),
                 "@unlinked(node:node_uri,lane:lane_uri)");
  }

  @Test
  public void writeUnlinkedWithBody() {
    assertWrites(new UnlinkedResponse("node_uri", "lane_uri", Record.of(Attr.of("test"))),
                 "@unlinked(node:node_uri,lane:lane_uri)@test");
  }
}
