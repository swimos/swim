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

import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.collections.HashTrieSet;
import swim.runtime.LinkBinding;
import swim.structure.Record;
import swim.structure.Value;

public abstract class PartialUplinkModem extends UplinkModem {
  final ConcurrentLinkedQueue<Value> downQueue;

  volatile Iterator<Map.Entry<Value, Value>> syncQueue;

  volatile HashTrieSet<Value> keyQueue;

  volatile Value lastKey;

  public PartialUplinkModem(LinkBinding linkBinding) {
    super(linkBinding);
    this.downQueue = new ConcurrentLinkedQueue<Value>();
    this.keyQueue = HashTrieSet.empty();
  }

  @Override
  protected boolean downQueueIsEmpty() {
    return this.downQueue.isEmpty() && this.syncQueue == null;
  }

  @Override
  protected void queueDown(Value body) {
    this.downQueue.add(body);
  }

  public void syncDown(Iterator<Map.Entry<Value, Value>> syncQueue) {
    this.syncQueue = syncQueue;
  }

  public void cueDownKey(Value key) {
    HashTrieSet<Value> oldKeyQueue;
    HashTrieSet<Value> newKeyQueue;
    do {
      oldKeyQueue = this.keyQueue;
      newKeyQueue = oldKeyQueue.added(key);
    } while (oldKeyQueue != newKeyQueue && !KEY_QUEUE.compareAndSet(this, oldKeyQueue, newKeyQueue));
    if (oldKeyQueue != newKeyQueue) {
      cueDown();
    }
  }

  protected abstract Value nextDownKey(Value key);

  @Override
  protected Value nextDownQueue() {
    final Iterator<Map.Entry<Value, Value>> syncQueue = this.syncQueue;
    if (syncQueue != null) {
      if (syncQueue.hasNext()) {
        final Map.Entry<Value, Value> entry = syncQueue.next();
        return Record.of().attr("update", Record.of().slot("key", entry.getKey())).concat(entry.getValue());
      } else {
        this.syncQueue = null;
        return null;
      }
    }
    return this.downQueue.poll();
  }

  @Override
  protected Value nextDownCue() {
    HashTrieSet<Value> oldKeyQueue;
    HashTrieSet<Value> newKeyQueue;
    Value key;
    do {
      oldKeyQueue = this.keyQueue;
      key = oldKeyQueue.next(this.lastKey);
      newKeyQueue = oldKeyQueue.removed(key);
    } while (oldKeyQueue != newKeyQueue && !KEY_QUEUE.compareAndSet(this, oldKeyQueue, newKeyQueue));
    if (key != null) {
      this.lastKey = key;
      if (!newKeyQueue.isEmpty()) {
        int oldStatus;
        int newStatus;
        do {
          oldStatus = status;
          newStatus = oldStatus | CUED_DOWN;
        } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
      }
      return nextDownKey(key);
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<PartialUplinkModem, HashTrieSet<Value>> KEY_QUEUE =
      AtomicReferenceFieldUpdater.newUpdater(PartialUplinkModem.class, (Class<HashTrieSet<Value>>) (Class<?>) HashTrieSet.class, "keyQueue");
}
