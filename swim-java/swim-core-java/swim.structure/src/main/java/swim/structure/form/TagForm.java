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

import swim.structure.Attr;
import swim.structure.Form;
import swim.structure.Item;

public final class TagForm<T> extends Form<T> {
  final String tag;
  final Form<T> form;

  public TagForm(String tag, Form<T> form) {
    this.tag = tag;
    this.form = form;
  }

  @Override
  public String tag() {
    return this.tag;
  }

  @Override
  public Form<T> tag(String tag) {
    if (tag != null) {
      return new TagForm<T>(tag, this.form);
    } else {
      return this.form;
    }
  }

  @Override
  public T unit() {
    return this.form.unit();
  }

  @Override
  public Form<T> unit(T unit) {
    return new TagForm<T>(this.tag, this.form.unit(unit));
  }

  @Override
  public Class<?> type() {
    return this.form.type();
  }

  @Override
  public Item mold(T object, Item item) {
    item = this.form.mold(object, item);
    if (!item.header(this.tag).isDefined()) {
      item = item.prepended(Attr.of(this.tag));
    }
    return item;
  }

  @Override
  public Item mold(T object) {
    Item item = this.form.mold(object);
    if (!item.header(this.tag).isDefined()) {
      item = item.prepended(Attr.of(this.tag));
    }
    return item;
  }

  @Override
  public T cast(Item item, T object) {
    if (item.header(this.tag).isDefined()) {
      return this.form.cast(item, object);
    } else if (item.keyEquals(this.tag)) {
      return this.form.cast(item.toValue(), object);
    }
    return null;
  }

  @Override
  public T cast(Item item) {
    if (item.header(this.tag).isDefined()) {
      return this.form.cast(item);
    } else if (item.keyEquals(this.tag)) {
      return this.form.cast(item.toValue());
    }
    return null;
  }
}
