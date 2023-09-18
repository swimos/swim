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

package swim.system;

import swim.api.Lane;
import swim.api.agent.AgentContext;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;
import swim.warp.CommandMessage;

public interface LaneBinding extends TierBinding, CellBinding, Log {

  NodeBinding node();

  LaneBinding laneWrapper();

  LaneContext laneContext();

  void setLaneContext(LaneContext laneContext);

  <T> T unwrapLane(Class<T> laneClass);

  <T> T bottomLane(Class<T> laneClass);

  LaneAddress cellAddress();

  Uri meshUri();

  Value partKey();

  Uri hostUri();

  Uri nodeUri();

  Uri laneUri();

  String laneType();

  Schedule schedule();

  Stage stage();

  StoreBinding store();

  Lane getLaneView(AgentContext agentContext);

  void openLaneView(Lane lane);

  void closeLaneView(Lane lane);

  void openMetaLane(LaneBinding lane, NodeBinding metaLane);

  boolean isLinked();

  FingerTrieSeq<LinkContext> uplinks();

  LinkContext getUplink(Value linkKey);

  void closeUplink(Value linkKey);

  void pushUpCommand(Push<CommandMessage> push);

  void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink);

  void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink);

  void reportDown(Metric metric);

}
