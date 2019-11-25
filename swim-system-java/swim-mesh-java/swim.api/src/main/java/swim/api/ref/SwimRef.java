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

package swim.api.ref;

import swim.api.downlink.DownlinkFactory;
import swim.concurrent.Cont;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public interface SwimRef extends DownlinkFactory {
  HostRef hostRef(Uri hostUri);

  HostRef hostRef(String hostUri);

  NodeRef nodeRef(Uri hostUri, Uri nodeUri);

  NodeRef nodeRef(String hostUri, String nodeUri);

  NodeRef nodeRef(Uri nodeUri);

  NodeRef nodeRef(String nodeUri);

  LaneRef laneRef(Uri hostUri, Uri nodeUri, Uri laneUri);

  LaneRef laneRef(String hostUri, String nodeUri, String laneUri);

  LaneRef laneRef(Uri nodeUri, Uri laneUri);

  LaneRef laneRef(String nodeUri, String laneUri);

  void command(Uri hostUri, Uri nodeUri, Uri laneUri, float prio, Value body, Cont<CommandMessage> cont);

  void command(String hostUri, String nodeUri, String laneUri, float prio, Value body, Cont<CommandMessage> cont);

  void command(Uri hostUri, Uri nodeUri, Uri laneUri, Value body, Cont<CommandMessage> cont);

  void command(String hostUri, String nodeUri, String laneUri, Value body, Cont<CommandMessage> cont);

  void command(Uri nodeUri, Uri laneUri, float prio, Value body, Cont<CommandMessage> cont);

  void command(String nodeUri, String laneUri, float prio, Value body, Cont<CommandMessage> cont);

  void command(Uri nodeUri, Uri laneUri, Value body, Cont<CommandMessage> cont);

  void command(String nodeUri, String laneUri, Value body, Cont<CommandMessage> cont);

  void command(Uri hostUri, Uri nodeUri, Uri laneUri, float prio, Value body);

  void command(String hostUri, String nodeUri, String laneUri, float prio, Value body);

  void command(Uri hostUri, Uri nodeUri, Uri laneUri, Value body);

  void command(String hostUri, String nodeUri, String laneUri, Value body);

  void command(Uri nodeUri, Uri laneUri, float prio, Value body);

  void command(String nodeUri, String laneUri, float prio, Value body);

  void command(Uri nodeUri, Uri laneUri, Value body);

  void command(String nodeUri, String laneUri, Value body);

  void close();
}
