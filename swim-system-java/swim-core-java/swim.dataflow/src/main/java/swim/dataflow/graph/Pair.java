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

package swim.dataflow.graph;

import java.util.ArrayList;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

/**
 * A simple generic pair type.
 *
 * @param <S> The left type.
 * @param <T> The right type.
 */
public class Pair<S, T> {

  /**
   * The left value.
   */
  private final S first;

  /**
   * The right value.
   */
  private final T second;

  public Pair(final S fst, final T snd) {
    Require.that(fst != null && snd != null, "Both components must be non-null.");
    first = fst;
    second = snd;
  }

  public final S getFirst() {
    return first;
  }

  public final T getSecond() {
    return second;
  }

  /**
   * Create an instance.
   *
   * @param first  The left hand value.
   * @param second The right hand value.
   * @param <S>    The first type.
   * @param <T>    The seond type.
   * @return The pair.
   */
  public static <S, T> Pair<S, T> pair(final S first, final T second) {
    return new Pair<>(first, second);
  }

  @Override
  public boolean equals(final Object obj) {
    if (this == obj) {
      return true;
    } else if (!(obj instanceof Pair<?, ?>)) {
      return false;
    } else {
      final Pair<?, ?> other = (Pair<?, ?>) obj;
      return first.equals(other.first) && second.equals(other.second);
    }
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Pair.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed, first.hashCode()), second.hashCode()));
  }

  @Override
  public String toString() {
    return String.format("(%s, %s)", first, second);
  }

  private static int hashSeed;

  /**
   * Create a form for a pair type.
   *
   * @param left  The form for the left hand type.
   * @param right The form for the right hand type.
   * @param <S>   The left hand type.
   * @param <T>   The right hand type.
   * @return The pair form.
   */
  public static <S, T> Form<Pair<S, T>> form(final Form<S> left, final Form<T> right) {
    return new PairForm<>(left, right);
  }

  private static final class PairForm<S, T> extends Form<Pair<S, T>> {

    private final Form<S> left;
    private final Form<T> right;

    PairForm(final Form<S> l, final Form<T> r) {
      left = l;
      right = r;
    }

    @Override
    public Class<?> type() {
      return Pair.class;
    }

    @Override
    public Item mold(final Pair<S, T> object) {
      if (object != null) {
        return Record.of(left.mold(object.getFirst()), right.mold(object.getSecond()));
      } else {
        return Item.extant();
      }
    }

    @Override
    public Pair<S, T> cast(final Item item) {
      final Value val = item.toValue();
      final ArrayList<Item> children = new ArrayList<>(2);
      for (final Item child : val) {
        children.add(child);
      }
      if (children.size() == 2) {
        return new Pair<>(left.cast(children.get(0)), right.cast(children.get(1)));
      } else {
        return null;
      }
    }
  }


}
