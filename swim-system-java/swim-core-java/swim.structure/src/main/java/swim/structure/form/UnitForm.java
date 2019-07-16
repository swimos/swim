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

package swim.structure.form;

import swim.structure.Form;
import swim.structure.Item;

public final class UnitForm<T> extends Form<T> {
  final T unit;
  final Form<T> form;

  public UnitForm(T unit, Form<T> form) {
    this.unit = unit;
    this.form = form;
  }

  @Override
  public String tag() {
    return this.form.tag();
  }

  @Override
  public Form<T> tag(String tag) {
    return new UnitForm<T>(this.unit, this.form.tag(tag));
  }

  @Override
  public T unit() {
    return this.unit;
  }

  @Override
  public Form<T> unit(T unit) {
    if (unit != null) {
      return new UnitForm<T>(unit, this.form);
    } else {
      return this.form;
    }
  }

  @Override
  public Class<?> type() {
    return this.form.type();
  }

  @Override
  public Item mold(T object, Item item) {
    return this.form.mold(object, item);
  }

  @Override
  public Item mold(T object) {
    return this.form.mold(object);
  }

  @Override
  public T cast(Item item, T object) {
    return this.form.cast(item, object);
  }

  @Override
  public T cast(Item item) {
    return this.form.cast(item);
  }
}
