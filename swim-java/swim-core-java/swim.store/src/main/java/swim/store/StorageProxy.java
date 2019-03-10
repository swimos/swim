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

package swim.store;

import swim.api.storage.Storage;

public abstract class StorageProxy implements StorageBinding, StorageContext {
  protected StorageContext storageContext;

  @Override
  public final StorageContext storageContext() {
    return this.storageContext;
  }

  @Override
  public void setStorageContext(StorageContext storageContext) {
    this.storageContext = storageContext;
  }

  @Override
  public abstract double storagePriority();

  @Override
  public Storage injectStorage(Storage storage) {
    if (storagePriority() < storage.storagePriority()) {
      if (storage instanceof StorageBinding) {
        ((StorageBinding) storage).setStorageContext(this);
        return storage;
      }
    } else {
      if (storage instanceof StorageContext) {
        setStorageContext((StorageContext) storage);
        return this;
      }
    }
    throw new IllegalArgumentException(storage.toString());
  }

  @Override
  public StoreBinding createStore() {
    return this.storageContext.createStore();
  }
}
