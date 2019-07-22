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

import swim.api.Uplink;
import swim.api.function.DidClose;
import swim.api.warp.function.OnCommandMessage;
import swim.api.warp.function.OnEventMessage;
import swim.api.warp.function.OnLinkRequest;
import swim.api.warp.function.OnLinkedResponse;
import swim.api.warp.function.OnSyncRequest;
import swim.api.warp.function.OnSyncedResponse;
import swim.api.warp.function.OnUnlinkRequest;
import swim.api.warp.function.OnUnlinkedResponse;
import swim.structure.Value;

public interface WarpUplink extends Uplink, WarpLink {
  float prio();

  float rate();

  Value body();

  @Override
  WarpUplink observe(Object observer);

  @Override
  WarpUplink unobserve(Object observer);

  WarpUplink onEvent(OnEventMessage onEvent);

  WarpUplink onCommand(OnCommandMessage onCommand);

  WarpUplink onLink(OnLinkRequest onLink);

  WarpUplink onLinked(OnLinkedResponse onLinked);

  WarpUplink onSync(OnSyncRequest onSync);

  WarpUplink onSynced(OnSyncedResponse onSynced);

  WarpUplink onUnlink(OnUnlinkRequest onUnlink);

  WarpUplink onUnlinked(OnUnlinkedResponse onUnlinked);

  WarpUplink didClose(DidClose didClose);
}
