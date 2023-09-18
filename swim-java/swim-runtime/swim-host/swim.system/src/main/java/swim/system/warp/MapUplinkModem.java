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

import java.util.Iterator;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.collections.HashTrieSet;
import swim.structure.Value;
import swim.system.UplinkAddress;
import swim.system.WarpBinding;

public abstract class MapUplinkModem extends WarpUplinkModem {

  final ConcurrentLinkedQueue<Value> downQueue;
  volatile Iterator<Value> syncQueue;
  volatile HashTrieSet<Value> keyQueue;
  volatile Value lastKey;

  public MapUplinkModem(WarpBinding linkBinding, UplinkAddress uplinkAddress) {
    super(linkBinding, uplinkAddress);
    this.downQueue = new ConcurrentLinkedQueue<Value>();
    this.syncQueue = null;
    this.keyQueue = HashTrieSet.empty();
    this.lastKey = null;
  }

  @Override
  protected boolean downQueueIsEmpty() {
    return this.downQueue.isEmpty() && this.syncQueue == null;
  }

  @Override
  protected void queueDown(Value body) {
    this.downQueue.add(body);
  }

  public void syncDown(Iterator<Value> syncQueue) {
    this.syncQueue = syncQueue;
  }

  public void cueDownKey(Value key) {
    do {
      final HashTrieSet<Value> oldKeyQueue = MapUplinkModem.KEY_QUEUE.get(this);
      final HashTrieSet<Value> newKeyQueue = oldKeyQueue.added(key);
      if (oldKeyQueue != newKeyQueue) {
        if (MapUplinkModem.KEY_QUEUE.compareAndSet(this, oldKeyQueue, newKeyQueue)) {
          this.cueDown();
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  protected abstract Value nextDownKey(Value key);

  @Override
  protected Value nextDownQueue() {
    final Iterator<Value> syncQueue = this.syncQueue;
    if (syncQueue != null) {
      if (syncQueue.hasNext()) {
        final Value key = syncQueue.next();
        return this.nextDownKey(key);
      } else {
        this.syncQueue = null;
        return null;
      }
    }
    return this.downQueue.poll();
  }

  @Override
  protected Value nextDownCue() {
    do {
      final HashTrieSet<Value> oldKeyQueue = MapUplinkModem.KEY_QUEUE.get(this);
      Value key = oldKeyQueue.next(this.lastKey);
      if (key == null) {
        key = oldKeyQueue.head();
      }
      final HashTrieSet<Value> newKeyQueue = oldKeyQueue.removed(key);
      if (MapUplinkModem.KEY_QUEUE.compareAndSet(this, oldKeyQueue, newKeyQueue)) {
        if (key != null) {
          this.lastKey = key;
          if (!newKeyQueue.isEmpty()) {
            do {
              final int oldStatus = WarpUplinkModem.STATUS.get(this);
              final int newStatus = oldStatus | WarpUplinkModem.CUED_DOWN;
              if (WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
                break;
              }
            } while (true);
          }
          return this.nextDownKey(key);
        } else {
          return null;
        }
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<MapUplinkModem, HashTrieSet<Value>> KEY_QUEUE =
      AtomicReferenceFieldUpdater.newUpdater(MapUplinkModem.class, (Class<HashTrieSet<Value>>) (Class<?>) HashTrieSet.class, "keyQueue");

}
