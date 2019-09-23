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

package swim.dataflow.graph.timestamps;

import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class WithTimestamp<T> {

  private final T data;
  private final long timestamp;

  public WithTimestamp(final T item, final long ts) {
    data = item;
    timestamp = ts;
  }

  public T getData() {
    return data;
  }

  public long getTimestamp() {
    return timestamp;
  }

  @Override
  public boolean equals(final Object obj) {
    if (this == obj) {
      return true;
    } else if (!(obj instanceof WithTimestamp)) {
      return false;
    } else {
      final WithTimestamp<?> other = (WithTimestamp<?>) obj;
      return data.equals(other.data) && timestamp == other.timestamp;
    }
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(WithTimestamp.class);
    }
    return Murmur3.mash(Murmur3.mix(data.hashCode(), Murmur3.mix(Murmur3.hash(timestamp), hashSeed)));
  }

  private static int hashSeed;

  @Override
  public String toString() {
    return String.format("WithTimestamp[item=%s, timestamp=%d]", data, timestamp);
  }

  public static <T> Form<WithTimestamp<T>> form(final Form<T> form) {
    return new WithTimestampForm<>(form);
  }

  private static final class WithTimestampForm<T> extends Form<WithTimestamp<T>> {

    private final Form<T> form;

    WithTimestampForm(final Form<T> form) {
      this.form = form;
    }

    @Override
    public String tag() {
      return "withTimestamp";
    }

    @Override
    public Class<?> type() {
      return WithTimestamp.class;
    }

    @Override
    public Item mold(final WithTimestamp<T> rec) {
      if (rec != null) {
        return Record.create(1).attr(tag(), Record.create(2)
            .item(form.mold(rec.data)).item(rec.timestamp));
      } else {
        return Item.absent();
      }
    }

    @Override
    public WithTimestamp<T> cast(final Item item) {
      final Value header = item.toValue().header(tag());
      if (header.isDefined()) {
        final T data = form.cast(header.getItem(0));
        final long ts = header.getItem(1).longValue();
        return new WithTimestamp<>(data, ts);
      } else {
        return null;
      }
    }
  }
}
