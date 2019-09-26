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

import swim.collections.FingerTrieSeq;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

/**
 * Form for {@link FingerTrieSeq} collections.
 * @param <T> The type of the elements.
 */
public class FingerTrieSeqForm<T> extends Form<FingerTrieSeq<T>> {

  private final Form<T> form;

  public FingerTrieSeqForm(final Form<T> form) {
    this.form = form;
  }

  @Override
  public Class<?> type() {
    return FingerTrieSeq.class;
  }

  @Override
  public Item mold(final FingerTrieSeq<T> seq, Item item) {
    if (seq != null) {
      for (final T elem : seq) {
        item = item.appended(this.form.mold(elem));
      }
      return item;
    } else {
      return Item.extant();
    }
  }

  @Override
  public Item mold(final FingerTrieSeq<T> seq) {
    if (seq != null) {
      final Record record = Record.create();
      for (final T elem : seq) {
        record.add(this.form.mold(elem));
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public FingerTrieSeq<T> cast(final Item item) {
    final Value value = item.toValue();
    final int n = value.length();
    if (n > 0) {
      FingerTrieSeq<T> seq = FingerTrieSeq.empty();
      for (final Item child : value) {
        final T elem = form.cast(child);
        if (elem != null) {
          seq = seq.appended(elem);
        }
      }
      return seq;
    } else if (value.isDefined()) {
      final T elem = this.form.cast(value);
      if (elem != null) {
        return FingerTrieSeq.<T>empty().appended(elem);
      }
    }
    return null;
  }
}
