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

package swim.api.warp;

import swim.api.Downlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidReceive;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillReceive;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.structure.Value;
import swim.uri.Uri;

public interface WarpDownlink extends Downlink, WarpLink {
  WarpDownlink hostUri(Uri hostUri);

  WarpDownlink hostUri(String hostUri);

  WarpDownlink nodeUri(Uri nodeUri);

  WarpDownlink nodeUri(String nodeUri);

  WarpDownlink laneUri(Uri laneUri);

  WarpDownlink laneUri(String laneUri);

  float prio();

  WarpDownlink prio(float prio);

  float rate();

  WarpDownlink rate(float rate);

  Value body();

  WarpDownlink body(Value body);

  boolean keepLinked();

  WarpDownlink keepLinked(boolean keepLinked);

  boolean keepSynced();

  WarpDownlink keepSynced(boolean keepSynced);

  @Override
  WarpDownlink observe(Object observer);

  @Override
  WarpDownlink unobserve(Object observer);

  WarpDownlink willReceive(WillReceive willReceive);

  WarpDownlink didReceive(DidReceive didReceive);

  WarpDownlink willCommand(WillCommand willCommand);

  WarpDownlink willLink(WillLink willLink);

  WarpDownlink didLink(DidLink didLink);

  WarpDownlink willSync(WillSync willSync);

  WarpDownlink didSync(DidSync didSync);

  WarpDownlink willUnlink(WillUnlink willUnlink);

  WarpDownlink didUnlink(DidUnlink didUnlink);

  @Override
  WarpDownlink didConnect(DidConnect didConnect);

  @Override
  WarpDownlink didDisconnect(DidDisconnect didDisconnect);

  @Override
  WarpDownlink didClose(DidClose didClose);

  @Override
  WarpDownlink didFail(DidFail didFail);

  @Override
  WarpDownlink open();

  void command(float prio, Value body);

  void command(Value body);
}
