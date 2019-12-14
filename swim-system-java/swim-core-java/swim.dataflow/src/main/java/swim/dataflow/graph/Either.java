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

import java.util.Optional;
import java.util.function.Function;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;

/**
 * Java representation of the co-product of two types.
 *
 * @param <L> The left hand type.
 * @param <R> The right hand type.
 */
public interface Either<L, R> {

  /**
   * @return Whether this is a left value.
   */
  boolean isLeft();

  /**
   * @return Whether this is a right value.
   */
  boolean isRight();

  /**
   * Distinguish between left and right values.
   *
   * @param leftFun  Function to apply to left values.
   * @param rightFun Function to apply to right values.
   * @param <U>      Result type.
   * @return The result value.
   */
  <U> U match(Function<L, U> leftFun, Function<R, U> rightFun);

  /**
   * @return A defined optional value if and only if this is a left value.
   */
  Optional<L> left();

  /**
   * @return A defined optional value if and only if this is a right value.
   */
  Optional<R> right();

  /**
   * @return A left value or a {@link IllegalArgumentException} if this is a right value.
   */
  L getLeft();

  /**
   * @return A right value or a {@link IllegalArgumentException} if this is a left value.
   */
  R getRight();

  /**
   * Create a left value.
   *
   * @param val The value.
   * @param <S> The left type.
   * @param <T> The right type.
   * @return The left value.
   */
  static <S, T> Either<S, T> left(final S val) {
    return new Left<>(val);
  }

  /**
   * Create a right value.
   *
   * @param val The value.
   * @param <S> The left type.
   * @param <T> The right type.
   * @return The left value.
   */
  static <S, T> Either<S, T> right(final T val) {
    return new Right<>(val);
  }

  /**
   * Create a {@link Form} for an {@link Either} value.
   *
   * @param leftForm  The form of the left type.
   * @param rightForm The form of the right type.
   * @param <S>       The left type.
   * @param <T>       The right type.
   * @return The form.
   */
  @Kind
  static <S, T> Form<Either<S, T>> form(final Form<S> leftForm, final Form<T> rightForm) {
    return new EitherForm<>(leftForm, rightForm);
  }

}

class EitherForm<S, T> extends Form<Either<S, T>> {

  private final Form<S> leftForm;
  private final Form<T> rightForm;

  EitherForm(final Form<S> leftForm, final Form<T> rightForm) {
    this.leftForm = leftForm;
    this.rightForm = rightForm;
  }

  @Override
  public Class<?> type() {
    return Either.class;
  }

  @Override
  public Item mold(final Either<S, T> object) {
    if (object != null) {
      return object.match(left -> Record.create(1).attr("left", Record.create(1).item(leftForm.mold(left))),
          right -> Record.create(1).attr("right", Record.create(1).item(rightForm.mold(right))));
    } else {
      return Item.absent();
    }
  }

  @Override
  public Either<S, T> cast(final Item item) {
    final Value asValue = item.toValue();
    final Value left = asValue.header("left");
    if (left.isDefined()) {
      final S leftVal = leftForm.cast(left.getItem(0));
      return new Left<>(leftVal);
    } else {
      final Value right = asValue.header("right");
      if (right.isDefined()) {
        final T rightVal = rightForm.cast(right.getItem(0));
        return new Right<>(rightVal);
      } else {
        return null;
      }
    }
  }
}

/**
 * Type of left values.
 *
 * @param <L> The left type.
 * @param <R> The right type.
 */
class Left<L, R> implements Either<L, R> {

  private final L value;

  Left(final L val) {
    Require.that(val != null, "Value must be non-null.");
    value = val;
  }

  @Override
  public boolean isLeft() {
    return true;
  }

  @Override
  public boolean isRight() {
    return false;
  }

  @Override
  public <U> U match(final Function<L, U> leftFun, final Function<R, U> rightFun) {
    return leftFun.apply(value);
  }

  @Override
  public Optional<L> left() {
    return Optional.of(value);
  }

  @Override
  public Optional<R> right() {
    return Optional.empty();
  }

  @Override
  public L getLeft() {
    return value;
  }

  @Override
  public R getRight() {
    throw new IllegalArgumentException("Get right called on left value.");
  }

  @Override
  public boolean equals(final Object obj) {
    if (this == obj) {
      return true;
    } else if (obj instanceof Left) {
      final Left<?, ?> other = (Left<?, ?>) obj;
      return value.equals(other.value);
    } else {
      return false;
    }
  }

  @Override
  public int hashCode() {
    return value.hashCode();
  }

}

/**
 * Type of right values.
 *
 * @param <L> The left type.
 * @param <R> The right type.
 */
class Right<L, R> implements Either<L, R> {

  private final R value;

  Right(final R val) {
    Require.that(val != null, "Value must be non-null.");
    value = val;
  }

  @Override
  public boolean isLeft() {
    return false;
  }

  @Override
  public boolean isRight() {
    return true;
  }

  @Override
  public <U> U match(final Function<L, U> leftFun, final Function<R, U> rightFun) {
    return rightFun.apply(value);
  }

  @Override
  public Optional<L> left() {
    return Optional.empty();
  }

  @Override
  public Optional<R> right() {
    return Optional.of(value);
  }

  @Override
  public L getLeft() {
    throw new IllegalArgumentException("Get left called on right value.");
  }

  @Override
  public R getRight() {
    return value;
  }

  @Override
  public boolean equals(final Object obj) {
    if (this == obj) {
      return true;
    } else if (obj instanceof Right) {
      final Right<?, ?> other = (Right<?, ?>) obj;
      return value.equals(other.value);
    } else {
      return false;
    }
  }

  @Override
  public int hashCode() {
    return value.hashCode();
  }
}
