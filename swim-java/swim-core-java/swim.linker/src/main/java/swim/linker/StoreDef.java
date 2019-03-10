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

package swim.linker;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Value;
import swim.util.Murmur3;

public final class StoreDef implements Debug {
  final String path;
  final Value settings;

  public StoreDef(String path) {
    this(path, Value.empty());
  }

  public StoreDef(String path, Value settings) {
    this.path = path;
    this.settings = settings;
  }

  public String path() {
    return this.path;
  }

  public StoreDef path(String path) {
    return new StoreDef(path, this.settings);
  }

  public Value settings() {
    return this.settings;
  }

  public StoreDef settings(Value settings) {
    return new StoreDef(this.path, settings);
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof StoreDef) {
      final StoreDef that = (StoreDef) other;
      return this.path.equals(that.path) && this.settings.equals(that.settings);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(StoreDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.path)), this.settings.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write("StoreDef").write('(')
        .debug(this.path).write(", ").debug(this.settings).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static Form<StoreDef> form;

  @Kind
  public static Form<StoreDef> form() {
    if (form == null) {
      form = new StoreForm();
    }
    return form;
  }
}

final class StoreForm extends Form<StoreDef> {
  @Override
  public String tag() {
    return "store";
  }

  @Override
  public Class<?> type() {
    return StoreDef.class;
  }

  @Override
  public Item mold(StoreDef storeDef) {
    if (storeDef != null) {
      return storeDef.settings;
    } else {
      return Item.extant();
    }
  }

  @Override
  public StoreDef cast(Item item) {
    final Value value = item.toValue();
    if (value.getAttr(tag()).isDefined()) {
      final String path = value.get("path").stringValue(null);
      return new StoreDef(path, value);
    }
    return null;
  }
}
