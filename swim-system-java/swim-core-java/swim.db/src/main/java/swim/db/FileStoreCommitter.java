// Copyright 2015-2021 Swim inc.
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

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.concurrent.AbstractTask;
import swim.concurrent.Cont;

final class FileStoreCommitter extends AbstractTask {

  final FileStore store;
  volatile Commit commit;

  FileStoreCommitter(FileStore store) {
    this.store = store;
  }

  void commitAsync(Commit commit) {
    if ((this.store.status & FileStore.OPENED) == 0) {
      try {
        this.store.open();
      } catch (InterruptedException cause) {
        throw new StoreException(cause);
      }
    }
    do {
      final Commit oldCommit = this.commit;
      final Commit newCommit = oldCommit != null ? oldCommit.merged(commit) : commit;
      if (FileStoreCommitter.COMMIT.compareAndSet(this, oldCommit, newCommit)) {
        if (oldCommit == null) {
          do {
            final int oldStatus = this.store.status;
            final int newStatus = oldStatus | FileStore.COMMITTING;
            if (FileStore.STATUS.compareAndSet(this.store, oldStatus, newStatus)) {
              break;
            }
          } while (true);
          this.cue();
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
    Commit committing = FileStoreCommitter.COMMIT.getAndSet(this, null);
    try {
      database = store.openDatabase();
      if (committing == null) {
        return;
      }
      committing = database.databaseWillCommit(committing);
      if (committing.isShifted()) {
        store.shiftZone();
      }
      final FileZone zone = store.zone;
      final Chunk chunk = zone.commitAndWriteChunk(committing);
      database.databaseDidCommit(chunk);
      if (chunk != null) {
        chunk.soften();
      }
      committing.bind(chunk);
    } catch (InterruptedException cause) {
      try {
        database.databaseCommitDidFail(cause);
      } finally {
        committing.trap(cause);
      }
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        try {
          database.databaseCommitDidFail(cause);
        } finally {
          committing.trap(cause);
        }
      } else {
        throw cause;
      }
    } finally {
      do {
        final int oldStatus = this.store.status;
        final int newStatus = oldStatus & ~FileStore.COMMITTING;
        if (FileStore.STATUS.compareAndSet(store, oldStatus, newStatus)) {
          break;
        }
      } while (true);
    }
  }

  static final AtomicReferenceFieldUpdater<FileStoreCommitter, Commit> COMMIT =
      AtomicReferenceFieldUpdater.newUpdater(FileStoreCommitter.class, Commit.class, "commit");

}
