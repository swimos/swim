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

package swim.runtime.uplink;

import java.util.concurrent.ConcurrentLinkedQueue;
import swim.runtime.LinkBinding;
import swim.runtime.link.ListLinkDelta;
import swim.structure.Value;

public abstract class ListUplinkModem extends UplinkModem {
  final ConcurrentLinkedQueue<ListLinkDelta> downQueue;

  public ListUplinkModem(LinkBinding linkBinding) {
    super(linkBinding);
    this.downQueue = new ConcurrentLinkedQueue<ListLinkDelta>();
  }

  @Override
  protected boolean downQueueIsEmpty() {
    return this.downQueue.isEmpty();
  }

  public void queueDown(ListLinkDelta delta) {
    this.downQueue.add(delta);
  }

  public void sendDown(ListLinkDelta delta) {
    queueDown(delta);
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus | FEEDING_DOWN;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      this.linkBinding.feedDown();
    }
  }

  @Override
  protected Value nextDownQueue() {
    final ListLinkDelta delta = this.downQueue.poll();
    return delta != null ? delta.toValue() : null;
  }
}