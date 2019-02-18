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

package swim.structure.selector;

import swim.codec.Output;
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Selectee;
import swim.structure.Selector;
import swim.util.Murmur3;

/**
 * A {@link Selector} that, when {@link #evaluate evaluated}, yields each {@code
 * Item} in {@code interpreter} such that {@code evaluating} {@code predicate}
 * against this {@code Item} would select at least one defined result.  This is
 * fundamentally different from returning the result itself; for
 * example,
 * <p>
 * {@code FilterSelector(predicate=GetSelector(key="a")).evaluate(Record(Slot("a",5))}
 * <p>
 * yields the {@code Record} itself, NOT just {@code 5}.
 * <p>
 * To accomplish this, {@code FilterSelector} itself implements {@link Selectee
 * Selectee&lt;Item&gt;.selected} by always returning {@link
 * swim.structure.Extant} which, crucially, is never null. {@link #forSelected
 * forSelected} still takes the form "if (condition) then subselect"; here,
 * "condition" is true only if {@code predicate.forSelected(interpreter,this)}
 * is not null.  Thus, the responsibility to ensure that {@code this.selected}
 * is invoked only if {@code predicate} would select something in {@code
 * Interpreter} is in {@code predicate.forSelected}--exactly as it should be.
 */
public final class FilterSelector extends Selector implements Selectee<Item> {
  final Selector predicate;
  final Selector then;

  public FilterSelector(Selector predicate, Selector then) {
    this.predicate = predicate;
    this.then = then;
  }

  public Selector predicate() {
    return this.predicate;
  }

  @Override
  public Selector then() {
    return this.then;
  }

  @Override
  public <T> T forSelected(Interpreter interpreter, Selectee<T> callback) {
    T selected = null;
    interpreter.willSelect(this);
    if (interpreter.scopeDepth() != 0) {
      // If the filter matches the selection scope:
      if (filterSelected(interpreter)) {
        // Then subselect the selection scope.
        selected = this.then.forSelected(interpreter, callback);
      }
    }
    interpreter.didSelect(this, selected);
    return selected;
  }

  @Override
  public Item mapSelected(Interpreter interpreter, Selectee<Item> transform) {
    final Item result;
    interpreter.willTransform(this);
    if (interpreter.scopeDepth() != 0) {
      // If the filter matches the selection scope:
      if (filterSelected(interpreter)) {
        // Then transform the selection scope.
        result = this.then.mapSelected(interpreter, transform);
      } else {
        result = interpreter.peekScope().toValue();
      }
    } else {
      result = Item.absent();
    }
    interpreter.didTransform(this, result);
    return result;
  }

  @Override
  public Item substitute(Interpreter interpreter) {
    Item predicate = this.predicate.substitute(interpreter);
    if (!(predicate instanceof Selector)) {
      predicate = this.predicate;
    }
    Item then = this.then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this.then;
    }
    return new FilterSelector((Selector) predicate, (Selector) then);
  }

  protected boolean filterSelected(Interpreter interpreter) {
    return this.predicate.forSelected(interpreter, this) != null;
  }

  /**
   * Always returns {@link swim.structure.Extant}, which, crucially, is never
   * null.  See {@link FilterSelector} for an explanation.
   */
  @Override
  public Item selected(Interpreter interpreter) {
    return Item.extant();
  }

  @Override
  public Selector andThen(Selector then) {
    return new FilterSelector(this.predicate, this.then.andThen(then));
  }

  @Override
  public FilterSelector filter() {
    return this;
  }

  @Override
  public int typeOrder() {
    return 19;
  }

  @Override
  protected int compareTo(Selector that) {
    if (that instanceof FilterSelector) {
      return compareTo((FilterSelector) that);
    }
    return Integer.compare(typeOrder(), that.typeOrder());
  }

  int compareTo(FilterSelector that) {
    int order = this.predicate.compareTo(that.predicate);
    if (order == 0) {
      order = this.then.compareTo(that.then);
    }
    return order;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof FilterSelector) {
      final FilterSelector that = (FilterSelector) other;
      return this.predicate.equals(that.predicate) && this.then.equals(that.then);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(FilterSelector.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.predicate.hashCode()), this.then.hashCode()));
  }

  @Override
  public void debugThen(Output<?> output) {
    output = output.write('.').write("filter").write('(').debug(this.predicate).write(')');
    this.then.debugThen(output);
  }

  private static int hashSeed;
}
