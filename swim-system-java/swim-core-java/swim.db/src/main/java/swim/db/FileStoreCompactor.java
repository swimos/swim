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

package swim.db;

import java.io.File;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.concurrent.AbstractTask;
import swim.concurrent.Conts;

final class FileStoreCompactor extends AbstractTask {
  final FileStore store;
  volatile Compact compact;

  FileStoreCompactor(FileStore store) {
    this.store = store;
  }

  void compactAsync(Compact compact) {
    if ((this.store.status & FileStore.OPENED) == 0) {
      try {
        this.store.open();
      } catch (InterruptedException cause) {
        throw new StoreException(cause);
      }
    }
    do {
      final Compact oldCompact = this.compact;
      final Compact newCompact = oldCompact != null ? oldCompact.merged(compact) : compact;
      if (COMPACT.compareAndSet(this, oldCompact, newCompact)) {
        if (oldCompact == null) {
          do {
            final int oldStatus = this.store.status;
            final int newStatus = oldStatus | FileStore.COMPACTING;
            if (FileStore.STATUS.compareAndSet(this.store, oldStatus, newStatus)) {
              break;
            }
          } while (true);
          cue();
        }
        break;
      }
    } while (true);
  }

  @Override
  public boolean taskWillBlock() {
    return true;
  }

  @Override
  public void runTask() {
    final FileStore store = this.store;
    Database database = null;
    try {
      database = store.openDatabase();
      Compact compact = COMPACT.getAndSet(this, null);
      if (compact == null) {
        return;
      }

      compact = database.databaseWillCompact(compact);
      if (!compact.isShifted() && store.zoneFiles().size() == 1) {
        compact = compact.isShifted(true); // Always shift if single zone.
      }
      database.commit(compact.commit()); // Shift zone and commit before compacting.
      if (compact.isShifted()) {
        compact = compact.isShifted(false); // Don't shift zone during subsequent commits.
      }

      final int post = store.zone.id;
      final TreeMap<Integer, File> zoneFiles = store.zoneFiles();
      if (zoneFiles.containsKey(post)) {
        zoneFiles.remove(post);

        if (!zoneFiles.isEmpty() && zoneFiles.firstKey() < post) {
          Database.POST.set(database, post); // Set evacuation goal post.

          database.evacuate(post);
          database.commit(compact.commit());

          final int deleteDelay = compact.deleteDelay;
          if (deleteDelay > 0) {
            Thread.sleep((long) deleteDelay);
          }

          while (!zoneFiles.isEmpty()) {
            final int oldestZone = zoneFiles.firstKey();
            if (oldestZone >= post) {
              break; // Make sure not to delete live zones.
            }
            final boolean deleted = zoneFiles.get(oldestZone).delete();
            zoneFiles.remove(oldestZone);
            store.closeZone(oldestZone);
            if (deleted) {
              store.context.databaseDidDeleteZone(store, database, oldestZone);
            }
          }
        }
      }
      database.databaseDidCompact(compact);
      compact.bind(store);
    } catch (InterruptedException cause) {
      try {
        if (database != null) {
          database.databaseCompactDidFail(cause);
        }
      } finally {
        compact.trap(cause);
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        try {
          if (database != null) {
            database.databaseCompactDidFail(cause);
          }
        } finally {
          compact.trap(cause);
        }
      } else {
        throw cause;
      }
    } finally {
      do {
        final int oldStatus = this.store.status;
        final int newStatus = oldStatus & ~FileStore.COMPACTING;
        if (FileStore.STATUS.compareAndSet(store, oldStatus, newStatus)) {
          break;
        }
      } while (true);
    }
  }

  static final AtomicReferenceFieldUpdater<FileStoreCompactor, Compact> COMPACT =
      AtomicReferenceFieldUpdater.newUpdater(FileStoreCompactor.class, Compact.class, "compact");
}
