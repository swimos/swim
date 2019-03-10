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

package swim.loader;

import java.util.Iterator;
import java.util.ServiceLoader;
import swim.api.storage.Storage;

public final class StorageLoader {
  private StorageLoader() {
    // nop
  }

  public static Storage loadStorage() {
    final ServiceLoader<Storage> storageLoader = ServiceLoader.load(Storage.class);
    final Iterator<Storage> storages = storageLoader.iterator();
    Storage storage;
    if (storages.hasNext()) {
      storage = storages.next();
      while (storages.hasNext()) {
        // TODO: configurable storage injection
        storage = storage.injectStorage(storages.next());
      }
    } else {
      storage = null;
    }
    return storage;
  }
}
