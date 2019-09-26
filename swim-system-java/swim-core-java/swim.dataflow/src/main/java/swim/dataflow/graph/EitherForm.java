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

import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Either;

public class EitherForm<S, T> extends Form<Either<S, T>> {

  private final Form<S> leftForm;
  private final Form<T> rightForm;

  public EitherForm(final Form<S> leftForm, final Form<T> rightForm) {
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
      return Either.left(leftVal);
    } else {
      final Value right = asValue.header("right");
      if (right.isDefined()) {
        final T rightVal = rightForm.cast(right.getItem(0));
        return Either.right(rightVal);
      } else {
        return null;
      }
    }
  }
}
