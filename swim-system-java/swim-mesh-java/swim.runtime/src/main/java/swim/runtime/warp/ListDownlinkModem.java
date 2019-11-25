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
import swim.runtime.Push;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public abstract class ListDownlinkModem<View extends WarpDownlinkView> extends WarpDownlinkModel<View> {
  final ConcurrentLinkedQueue<ListLinkDelta> upQueue;

  public ListDownlinkModem(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                           float prio, float rate, Value body) {
    super(meshUri, hostUri, nodeUri, laneUri, prio, rate, body);
    this.upQueue = new ConcurrentLinkedQueue<ListLinkDelta>();
  }

  @Override
  protected boolean upQueueIsEmpty() {
    return this.upQueue.isEmpty();
  }

  public void queueUp(ListLinkDelta delta) {
    this.upQueue.add(delta);
  }

  public void pushUp(ListLinkDelta delta) {
    queueUp(delta);
    do {
      final int oldStatus = this.status;
      final int newStatus = oldStatus | FEEDING_UP;
      if (oldStatus != newStatus) {
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.linkContext.feedUp();
          break;
        }
      } else {
        break;
      }
    } while (true);
  }


  @Override
  protected Push<CommandMessage> nextUpQueue() {
    final ListLinkDelta delta = this.upQueue.poll();
    if (delta != null) {
      final Uri hostUri = hostUri();
      final Uri nodeUri = nodeUri();
      final Uri laneUri = laneUri();
      final float prio = prio();
      final Value body = delta.toValue();
      final CommandMessage message = new CommandMessage(nodeUri, laneUri, body);
      return new Push<CommandMessage>(Uri.empty(), hostUri, nodeUri, laneUri,
                                      prio, null, message, null);
    } else {
      return null;
    }
  }
}
