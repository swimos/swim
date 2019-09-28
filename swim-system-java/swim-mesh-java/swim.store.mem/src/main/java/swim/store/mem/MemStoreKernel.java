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

package swim.store.mem;

import swim.kernel.KernelProxy;
import swim.runtime.CellAddress;
import swim.runtime.EdgeAddress;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Value;

public class MemStoreKernel extends KernelProxy {
  final double kernelPriority;

  public MemStoreKernel(double kernelPriority) {
    this.kernelPriority = kernelPriority;
  }

  public MemStoreKernel() {
    this(KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  @Override
  public StoreBinding createStore(StoreDef storeDef, ClassLoader classLoader) {
    StoreBinding store = super.createStore(storeDef, classLoader);
    if (store == null) {
      store = new MemStore();
    }
    return store;
  }

  @Override
  public StoreBinding createStore(CellAddress cellAddress) {
    StoreBinding store = super.createStore(cellAddress);
    if (store == null && cellAddress instanceof EdgeAddress) {
      // Provide default mem store to edge cells.
      store = new MemStore();
    }
    return store;
  }

  private static final double KERNEL_PRIORITY = -1.0;

  public static MemStoreKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || MemStoreKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new MemStoreKernel(kernelPriority);
    }
    return null;
  }
}
