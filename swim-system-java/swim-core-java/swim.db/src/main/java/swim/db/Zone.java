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

import swim.concurrent.Cont;
import swim.concurrent.Sync;

public abstract class Zone {
  public abstract int id();

  public abstract Germ germ();

  public abstract StoreSettings settings();

  public abstract long size();

  public abstract void openAsync(Cont<Zone> future);

  public abstract Zone open() throws InterruptedException;

  public abstract void close() throws InterruptedException;

  public abstract void openDatabaseAsync(Cont<Database> future);

  public Database openDatabase() throws InterruptedException {
    final Sync<Database> syncDatabase = new Sync<Database>();
    openDatabaseAsync(syncDatabase);
    return syncDatabase.await(settings().databaseOpenTimeout);
  }

  public abstract Chunk commitAndWriteChunk(Commit commit);
}
