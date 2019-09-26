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

package swim.runtime;

import swim.api.auth.Identity;
import swim.structure.Value;
import swim.uri.Uri;

public interface LaneContext extends TierContext, CellContext {
  NodeBinding node();

  LaneBinding laneWrapper();

  <T> T unwrapLane(Class<T> laneClass);

  @Override
  LaneAddress cellAddress();

  @Override
  String edgeName();

  @Override
  Uri meshUri();

  Value partKey();

  Uri hostUri();

  Uri nodeUri();

  Uri laneUri();

  Identity identity();

  void openMetaLane(LaneBinding lane, NodeBinding metaLane);

  void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink);
}
