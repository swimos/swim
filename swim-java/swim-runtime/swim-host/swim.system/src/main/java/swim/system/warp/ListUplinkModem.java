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

package swim.system.warp;

import java.util.concurrent.ConcurrentLinkedQueue;
import swim.structure.Value;
import swim.system.UplinkAddress;
import swim.system.WarpBinding;

public abstract class ListUplinkModem extends WarpUplinkModem {

  final ConcurrentLinkedQueue<ListLinkDelta> downQueue;

  public ListUplinkModem(WarpBinding linkBinding, UplinkAddress uplinkAddress) {
    super(linkBinding, uplinkAddress);
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
    this.queueDown(delta);
    do {
      final int oldStatus = WarpUplinkModem.STATUS.get(this);
      final int newStatus = oldStatus | WarpUplinkModem.FEEDING_DOWN;
      if (oldStatus != newStatus) {
        if (WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.linkBinding.feedDown();
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  @Override
  protected Value nextDownQueue() {
    final ListLinkDelta delta = this.downQueue.poll();
    return delta != null ? delta.toValue() : null;
  }

}
