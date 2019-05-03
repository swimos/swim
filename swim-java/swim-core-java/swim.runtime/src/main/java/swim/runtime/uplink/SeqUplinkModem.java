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
import swim.collections.HashTrieMap;
import swim.runtime.LinkBinding;
import swim.structure.Record;
import swim.structure.Value;

public abstract class SeqUplinkModem extends UplinkModem {
  final ConcurrentLinkedQueue<Value> downQueue;

  protected volatile Iterator<Map.Entry<Value, Value>> syncQueue;

  protected volatile HashTrieMap<Value, ListOperation> keyQueue;

  volatile Value lastKey;
  volatile int lastSyncIndex;

  public SeqUplinkModem(LinkBinding linkBinding) {
    super(linkBinding);
    this.downQueue = new ConcurrentLinkedQueue<Value>();
    this.keyQueue = HashTrieMap.empty();
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

  public void cueDownKey(Value key, ListOperation listOperation) {
    HashTrieMap<Value, ListOperation> oldKeyQueue;
    HashTrieMap<Value, ListOperation> newKeyQueue;
    do {
      oldKeyQueue = this.keyQueue;
      newKeyQueue = oldKeyQueue.updated(key, listOperation);
    } while (oldKeyQueue != newKeyQueue && !KEY_QUEUE.compareAndSet(this, oldKeyQueue, newKeyQueue));
    if (oldKeyQueue != newKeyQueue) {
      cueDown();
    }
  }

  protected abstract Value nextDownKey(Value key, ListOperation listOperation);

  @Override
  protected Value nextDownQueue() {
    final Iterator<Map.Entry<Value, Value>> syncQueue = this.syncQueue;
    if (syncQueue != null) {
      if (syncQueue.hasNext()) {
        final Map.Entry<Value, Value> entry = syncQueue.next();
        final Record header = Record.of().attr("update",
              Record.of().slot("key", Record.fromObject(entry.getKey())).slot("index", lastSyncIndex))
              .concat(entry.getValue());
        lastSyncIndex += 1;
        return header;
      } else {
        this.syncQueue = null;
        lastSyncIndex = 0;
        return null;
      }
    }
    return this.downQueue.poll();
  }

  @Override
  protected Value nextDownCue() {
    HashTrieMap<Value, ListOperation> oldKeyQueue;
    HashTrieMap<Value, ListOperation> newKeyQueue;
    Value key;
    ListOperation listOperation;
    do {
      oldKeyQueue = this.keyQueue;
      key = oldKeyQueue.nextKey(this.lastKey);
      listOperation = oldKeyQueue.get(key);
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
      return nextDownKey(key, listOperation);
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<SeqUplinkModem, HashTrieMap<Value, ListOperation>> KEY_QUEUE =
      AtomicReferenceFieldUpdater.newUpdater(SeqUplinkModem.class, (Class<HashTrieMap<Value, ListOperation>>) (Class<?>) HashTrieMap.class, "keyQueue");
}
