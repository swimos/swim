// Copyright 2015-2022 Swim.inc
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

package swim.store.db;

import swim.concurrent.Stage;
import swim.db.FileStore;
import swim.db.StoreContext;
import swim.db.StoreSettings;
import swim.kernel.KernelContext;
import swim.kernel.KernelProxy;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Item;
import swim.structure.Value;
import swim.system.StoreAddress;

public class DbStoreKernel extends KernelProxy {

  final double kernelPriority;

  public DbStoreKernel(double kernelPriority) {
    this.kernelPriority = kernelPriority;
  }

  public DbStoreKernel() {
    this(DbStoreKernel.KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  @Override
  public StoreDef defineStore(Item storeConfig) {
    final StoreDef storeDef = this.defineDbStore(storeConfig);
    return storeDef != null ? storeDef : super.defineStore(storeConfig);
  }

  public DbStoreDef defineDbStore(Item storeConfig) {
    final Value value = storeConfig.toValue();
    final Value header = value.getAttr("store");
    if (header.isDefined()) {
      final String storeProvider = header.get("provider").stringValue(null);
      if (storeProvider == null || DbStoreKernel.class.getName().equals(storeProvider)) {
        final String storeName = storeConfig.key().stringValue(null);
        final String path = value.get("path").stringValue(null);
        final StoreSettings settings = StoreSettings.form().cast(value);
        if (path != null && settings != null) {
          return new DbStoreDef(storeName, path, settings);
        }
      }
    }
    return null;
  }

  @Override
  public StoreBinding createStore(StoreDef storeDef, ClassLoader classLoader) {
    if (storeDef instanceof DbStoreDef) {
      return this.createDbStore((DbStoreDef) storeDef);
    } else {
      return super.createStore(storeDef, classLoader);
    }
  }

  public DbStore createDbStore(DbStoreDef storeDef) {
    final String storeName = storeDef.storeName;
    final String storePath = storeDef.path;
    final StoreSettings storeSettings = storeDef.settings;
    final StoreContext storeContext = new StoreContext(storeSettings);
    final StoreAddress storeAddress = new StoreAddress(storeName);

    final KernelContext kernel = this.kernelWrapper().unwrapKernel(KernelContext.class);
    final Stage stage = kernel.createStage(storeAddress);
    final FileStore store = new FileStore(storeContext, storePath, stage);
    store.open();
    store.openDatabase();
    return new DbStore(store, Value.absent());
  }

  private static final double KERNEL_PRIORITY = -0.75;

  public static DbStoreKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || DbStoreKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(DbStoreKernel.KERNEL_PRIORITY);
      return new DbStoreKernel(kernelPriority);
    }
    return null;
  }

}
