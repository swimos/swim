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

package swim.structure;

import swim.codec.Output;
import swim.structure.operator.InvokeOperator;
import swim.structure.selector.ChildrenSelector;
import swim.structure.selector.DescendantsSelector;
import swim.structure.selector.FilterSelector;
import swim.structure.selector.GetAttrSelector;
import swim.structure.selector.GetItemSelector;
import swim.structure.selector.GetSelector;
import swim.structure.selector.IdentitySelector;
import swim.structure.selector.KeysSelector;
import swim.structure.selector.LiteralSelector;
import swim.structure.selector.ValuesSelector;

/**
 * An {@link Expression} that returns references to {@code Items} when it is
 * {@link #evaluate evaluated}.  Because most application-level {@code Items}
 * are {@link Record Records}, a way to only extract certain parts of {@code
 * Records} is often required.  Technically, this can be accomplished without
 * {@code Selectors} to some extent because the {@code Record} class implements
 * {@link java.util.List java.util.List&lt;Item&gt;} and (implicitly) {@link
 * java.util.Map java.util.Map&lt;Value,Value&gt;}; however, {@code Selectors}
 * additionally expose functional patterns that enhance composability, providing
 * a foundation on top of which expression languages can be built.
 */
public abstract class Selector extends Expression {
  @Override
  public boolean isConstant() {
    return false;
  }

  /**
   * Returns the {@code Selector} that this {@code Selector} uses to match
   * sub-selections.
   */
  public abstract Selector then();

  /**
   * Evaluates {@link Selectee#selected callback.selected} against the
   * {@code Items} that match this {@code Selector's} selection criteria.  That
   * is, it pushes such {@code Items} to {@code interpreter}, then invokes
   * {@code callback} against it.  To support chained {@code Selectors}, this is
   * a recursive procedure that invokes {@code forSelected} through
   * {@code this.then} wherever it exists (which it always does outside of
   * {@link IdentitySelector}); we define "subselection" to be such an
   * invocation.
   *
   * @return the result of executing {@code callback} from the context of the
   * last {@code Selector} in the chain formed by {@code Selector then} fields.
   */
  public abstract <T> T forSelected(Interpreter interpreter, Selectee<T> callback);

  public abstract Item mapSelected(Interpreter interpreter, Selectee<Item> transform);

  /**
   * Evaluates this {@code Selector} against some {@link Interpreter}.  This is
   * accomplished by creating a new {@link SelecteeBuilder} and populating
   * its internal {@link Record} with (recursive) calls to {@link #forSelected}.
   */
  @Override
  public final Item evaluate(Interpreter interpreter) {
    final Record selected = Record.create();
    final Selectee<Object> callback = new SelecteeBuilder(selected);
    forSelected(interpreter, callback);
    return selected.isEmpty() ? Item.absent() : selected.flattened();
  }

  /**
   * The means to chain {@code Selectors}.  By intention, this is NOT a strict
   * functional composition: for two {@code Selectors} {@code s1} and {@code
   * s2}, {@code s1.andThen(s2)} DOES NOT NECESSARILY return a new {@code
   * Selector} {@code s3} such that {@code s3.evaluate(args)} is equivalent to
   * {@code s2.evaluate(s1.evaluate(args))}.
   * <p>
   * The reason for this is that for {@code Selectors} like {@link
   * ChildrenSelector} that yield (logical) collections, we wish to invoke the
   * next {@code Selector}, say a {@link GetSelector}, against every result.
   * Under strict functional rules,
   * {@code ChildrenSelector.andThen(someGetSelector).evaluate(args)} would
   * instead return at most one defined value regardless of the number of
   * children.
   */
  public abstract Selector andThen(Selector then);

  /**
   * An abstraction over {@link #andThen} where {@code then} is a {@link
   * GetSelector}.
   *
   * @param key the {@code key} field in the composing {@code GetSelector}.
   */
  @Override
  public Selector get(Value key) {
    return andThen(new GetSelector(key, Selector.identity()));
  }

  /**
   * An abstraction over {@link #andThen} where {@code then} is a {@link
   * GetSelector}.
   *
   * @param key the {@code key} field in the composing {@code GetSelector}.
   */
  @Override
  public Selector get(String key) {
    return get(Text.from(key));
  }

  /**
   * An abstraction over {@link #andThen} where {@code then} is a {@link
   * GetAttrSelector}.
   *
   * @param key the {@code key} field in the composing {@code GetAttrSelector}.
   */
  @Override
  public Selector getAttr(Text key) {
    return andThen(new GetAttrSelector(key, Selector.identity()));
  }

  /**
   * An abstraction over {@link #andThen} where {@code then} is a {@link
   * GetAttrSelector}.
   *
   * @param key the {@code key} field in the composing {@code GetAttrSelector}.
   */
  @Override
  public Selector getAttr(String key) {
    return getAttr(Text.from(key));
  }

  /**
   * An abstraction over {@link #andThen} where {@code then} is a {@link
   * GetItemSelector}.
   *
   * @param index the {@code index} field in the composing {@code
   *              GetItemSelector}.
   */
  public Selector getItem(Num index) {
    return andThen(new GetItemSelector(index, Selector.identity()));
  }

  /**
   * An abstraction over {@link #andThen} where {@code then} is a {@link
   * GetItemSelector}.
   *
   * @param index the {@code index} field in the composing {@code
   *              GetItemSelector}.
   */
  @Override
  public Selector getItem(int index) {
    return getItem(Num.from(index));
  }

  /**
   * An abstraction over {@link #andThen} where {@code then} is the {@link
   * KeysSelector}.
   */
  public Selector keys() {
    return andThen(Selector.identity().keys());
  }

  /**
   * An abstraction over {@link #andThen} where {@code then} is the {@link
   * ValuesSelector}.
   */
  public Selector values() {
    return andThen(Selector.identity().values());
  }

  /**
   * An abstraction over {@link #andThen} where {@code then} is the {@link
   * ChildrenSelector}.
   */
  public Selector children() {
    return andThen(Selector.identity().children());
  }

  /**
   * An abstraction over {@link #andThen} where {@code then} is the {@link
   * DescendantsSelector}.
   */
  public Selector descendants() {
    return andThen(Selector.identity().descendants());
  }

  /**
   * Returns a new {@link FilterSelector} with {@code this} as the {@code
   * predicate}.
   */
  @Override
  public FilterSelector filter() {
    return new FilterSelector(this, Selector.identity());
  }

  /**
   * An abstraction over {@link #andThen} where {@code then} is a {@link
   * FilterSelector}.
   */
  @Override
  public Selector filter(Item predicate) {
    return andThen(predicate.filter());
  }

  /**
   * Creates, but does not evaluate, an {@link InvokeOperator} where this {@code
   * Selector} evaluates to the operator.
   */
  @Override
  public Operator invoke(Value args) {
    return new InvokeOperator(this, args);
  }

  @Override
  public int precedence() {
    return 11;
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Selector").write('.').write("identity").write('(').write(')');
    debugThen(output);
  }

  public abstract void debugThen(Output<?> output);

  @Override
  public int compareTo(Item other) {
    if (other instanceof Selector) {
      return compareTo((Selector) other);
    }
    return Integer.compare(typeOrder(), other.typeOrder());
  }

  protected abstract int compareTo(Selector that);

  public static Selector identity() {
    return IdentitySelector.identity();
  }

  /**
   * Lifts {@code item} into a {@link LiteralSelector} if it is not already a
   * {@code Selector}.
   */
  public static Selector literal(Item item) {
    if (item instanceof Selector) {
      return (Selector) item;
    }
    return new LiteralSelector(item, Selector.identity());
  }
}

/**
 * {@link Selectee} implementation that accumulates {@link Item Items} in a
 * mutable {@link Record}.
 */
final class SelecteeBuilder implements Selectee<Object> {
  final Record selected;

  SelecteeBuilder(Record selected) {
    this.selected = selected;
  }

  /**
   * Adds the top of the {@code interpreter}'s scope stack to the {@code
   * selected} record.  Always returns {@code null} because {@code
   * SelecteeBuilder} never terminates early; it accumulates all visited items
   * into an internal, mutable {@code Record}.
   */
  @Override
  public Object selected(Interpreter interpreter) {
    final Item scope = interpreter.peekScope();
    if (scope != null) {
      this.selected.add(scope);
    }
    return null;
  }
}
