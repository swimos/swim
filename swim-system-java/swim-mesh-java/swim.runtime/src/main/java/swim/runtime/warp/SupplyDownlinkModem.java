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

package swim.runtime.warp;

import java.util.concurrent.ConcurrentLinkedQueue;
import swim.concurrent.Cont;
import swim.runtime.Push;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public abstract class SupplyDownlinkModem<View extends WarpDownlinkView> extends WarpDownlinkModel<View> {
  final ConcurrentLinkedQueue<Push<CommandMessage>> upQueue;

  public SupplyDownlinkModem(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                             float prio, float rate, Value body) {
    super(meshUri, hostUri, nodeUri, laneUri, prio, rate, body);
    this.upQueue = new ConcurrentLinkedQueue<Push<CommandMessage>>();
  }

  @Override
  protected boolean upQueueIsEmpty() {
    return this.upQueue.isEmpty();
  }

  @Override
  protected void queueUp(Value body, Cont<CommandMessage> cont) {
    final Uri hostUri = hostUri();
    final Uri nodeUri = nodeUri();
    final Uri laneUri = laneUri();
    final float prio = prio();
    final CommandMessage message = new CommandMessage(nodeUri, laneUri, body);
    this.upQueue.add(new Push<CommandMessage>(Uri.empty(), hostUri, nodeUri, laneUri,
                                              prio, null, message, cont));
  }

  @Override
  protected Push<CommandMessage> nextUpQueue() {
    return this.upQueue.poll();
  }
}
