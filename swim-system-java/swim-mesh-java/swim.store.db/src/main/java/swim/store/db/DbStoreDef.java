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

package swim.store.db;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.db.StoreSettings;
import swim.store.StoreDef;
import swim.util.Murmur3;

public class DbStoreDef implements StoreDef, Debug {
  protected final String storeName;
  protected final String path;
  protected final StoreSettings settings;

  public DbStoreDef(String storeName, String path, StoreSettings settings) {
    this.storeName = storeName;
    this.path = path;
    this.settings = settings;
  }

  @Override
  public final String storeName() {
    return this.storeName;
  }

  public DbStoreDef storeName(String storeName) {
    return copy(storeName, this.path, this.settings);
  }

  public final String path() {
    return this.path;
  }

  public DbStoreDef path(String path) {
    return copy(this.storeName, path, this.settings);
  }

  public final StoreSettings settings() {
    return this.settings;
  }

  public DbStoreDef settings(StoreSettings settings) {
    return copy(this.storeName, this.path, settings);
  }

  protected DbStoreDef copy(String storeName, String path, StoreSettings settings) {
    return new DbStoreDef(storeName, path, settings);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof DbStoreDef) {
      final DbStoreDef that = (DbStoreDef) other;
      return (this.storeName == null ? that.storeName == null : this.storeName.equals(that.storeName))
          && this.path.equals(that.path) && this.settings.equals(that.settings);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(DbStoreDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.storeName)), this.path.hashCode()), this.settings.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write("DbStoreDef").write('(')
        .debug(this.storeName).write(", ").debug(this.path).write(", ")
        .debug(this.settings).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;
}
