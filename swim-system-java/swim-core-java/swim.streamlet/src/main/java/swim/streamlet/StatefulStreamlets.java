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

package swim.streamlet;

import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import swim.streaming.persistence.MapPersister;
import swim.streaming.persistence.ValuePersister;
import swim.util.Deferred;

/**
 * Utility methods to create common stateful streamlets.
 */
public final class StatefulStreamlets {

  private StatefulStreamlets() {
  }

  /**
   * Create a streamlet that performs a fold over it's inputs.
   *
   * @param initial The initial value of the state.
   * @param foldOp  The fold operation.
   * @param <In>    The input type.
   * @param <State> The state/output type.
   * @return The streamlet.
   */
  public static <In, State> TransientStatefulStreamlet<In, State> fold(final State initial,
                                                                       final BiFunction<State, In, State> foldOp) {
    return new TransientStatefulStreamlet<>(Deferred.value(initial), (s, x) -> {
      final State prev = s.get();
      return x.andThen(in -> foldOp.apply(prev, in));
    });
  }

  /**
   * Create a streamlet that performs a fold over it's inputs.
   *
   * @param foldOp  The fold operation.
   * @param <In>    The input type.
   * @param <State> The state/output type.
   * @return The streamlet.
   */
  public static <In, State> StatefulStreamlet<In, State> foldPersistent(final ValuePersister<State> persister,
                                                                        final BiFunction<State, In, State> foldOp) {
    return new StatefulStreamlet<>(persister, foldOp);
  }

  /**
   * Create a streamlet that performs a fold over the values for each key of its inputs.
   *
   * @param initial The initial value of the state.
   * @param foldOp  The fold operation.
   * @param <Key>   The type of the keys.
   * @param <In>    The input type.
   * @param <State> The state/output type.
   * @return The streamlet.
   */
  public static <Key, In, State> TransientStatefulMapStreamlet<Key, In, State> foldMap(final State initial,
                                                                                       final BiFunction<State, In, State> foldOp) {
    return new TransientStatefulMapStreamlet<>(Deferred.value(initial), (s, x) -> {
      final State prev = s.get();
      return x.andThen(in -> foldOp.apply(prev, in));
    });
  }

  /**
   * Create a streamlet that performs a fold over the values for each key of its inputs.
   *
   * @param persister Persister for the map state.
   * @param foldOp    The fold operation.
   * @param <Key>     The type of the keys.
   * @param <In>      The input type.
   * @param <State>   The state/output type.
   * @return The streamlet.
   */
  public static <Key, In, State> StatefulMapStreamlet<Key, In, State> foldMapPersistent(final MapPersister<Key, State> persister,
                                                                                        final BiFunction<State, In, State> foldOp) {
    return new StatefulMapStreamlet<>(persister, foldOp);
  }

  /**
   * Create a streamlet that reduces its inputs with a binary operator.
   *
   * @param op  The operator.
   * @param <T> The type of the inputs.
   * @return The streamlet.
   */
  public static <T> TransientStatefulStreamlet<T, T> reduce(final BinaryOperator<T> op) {
    return new TransientStatefulStreamlet<>(Deferred.value(null), (s, x) -> {
      final T prev = s.get();
      return x.andThen(in -> prev == null ? in : op.apply(prev, in));
    });
  }

  /**
   * Create a streamlet that reduces its inputs with a binary operator.
   *
   * @param op  The operator.
   * @param <T> The type of the inputs.
   * @return The streamlet.
   */
  public static <T> StatefulStreamlet<T, T> reduce(final ValuePersister<T> persister,
                                                   final BinaryOperator<T> op) {
    return new StatefulStreamlet<>(persister, (s, x) -> s == null ? x : op.apply(s, x));
  }

  /**
   * Create a streamlet that reduces its inputs, for each key, with a binary operator.
   *
   * @param op    The operator.
   * @param <Key> The type of the keys.
   * @param <T>   The type of the inputs.
   * @return The streamlet.
   */
  public static <Key, T> TransientStatefulMapStreamlet<Key, T, T> reduceMap(final BinaryOperator<T> op) {
    return new TransientStatefulMapStreamlet<>(Deferred.value(null), (s, x) -> {
      final T prev = s.get();
      return x.andThen(in -> prev == null ? in : op.apply(prev, in));
    });
  }

  /**
   * Create a streamlet that reduces its inputs, for each key, with a binary operator.
   *
   * @param op    The operator.
   * @param <Key> The type of the keys.
   * @param <T>   The type of the inputs.
   * @return The streamlet.
   */
  public static <Key, T> StatefulMapStreamlet<Key, T, T> reduceMap(
      final MapPersister<Key, T> persister,
      final BinaryOperator<T> op) {
    return new StatefulMapStreamlet<>(persister, (s, x) -> s == null ? x : op.apply(s, x));
  }

  /**
   * Create a streamlet that performs a fold over it's inputs. The fold operation can be modified by the value of an
   * auxiliary input channel.
   *
   * @param initial  The initial value of the state.
   * @param foldOp   The fold operation.
   * @param initMode The initial value of the mode.
   * @param <In>     The input type.
   * @param <State>  The state/output type.
   * @param <Mode>   The type of the control input.
   * @return The streamlet.
   */
  public static <In, State, Mode> TransientModalStatefulStreamlet<In, Mode, State> modalFold(
      final Mode initMode,
      final State initial,
      final Function<Mode, BiFunction<State, In, State>> foldOp) {
    return new TransientModalStatefulStreamlet<>(initMode, Deferred.value(initial), (Mode m) -> {
      final BiFunction<State, In, State> op = foldOp.apply(m);
      return (Deferred<State> s, Deferred<In> x) -> {
        final State prev = s.get();
        return x.andThen(in -> op.apply(prev, in));
      };
    });
  }

  /**
   * Create a streamlet that performs a fold over it's inputs. The fold operation can be modified by the value of an
   * auxiliary input channel.
   *
   * @param modePersister  Persistence for the mode value.
   * @param foldOp         The fold operation.
   * @param statePersister Persistence for the state value.
   * @param <In>           The input type.
   * @param <State>        The state/output type.
   * @param <Mode>         The type of the control input.
   * @return The streamlet.
   */
  public static <In, State, Mode> ModalStatefulStreamlet<In, Mode, State> modalFold(
      final ValuePersister<Mode> modePersister,
      final ValuePersister<State> statePersister,
      final Function<Mode, BiFunction<State, In, State>> foldOp) {
    return new ModalStatefulStreamlet<>(modePersister, statePersister, foldOp);
  }

  /**
   * Create a streamlet that reduces its inputs with a binary operator. The operator can be modified by the value of an
   * auxiliary input channel.
   *
   * @param reduceOp The operator.
   * @param initMode The initial value of the mode.
   * @param <T>      The type of the inputs.
   * @param <Mode>   The type of the control input.
   * @return The streamlet.
   */
  public static <T, Mode> TransientModalStatefulStreamlet<T, Mode, T> modalReduce(
      final Mode initMode,
      final Function<Mode, BinaryOperator<T>> reduceOp) {
    return new TransientModalStatefulStreamlet<>(initMode, Deferred.value(null), (Mode m) -> {
      final BinaryOperator<T> op = reduceOp.apply(m);
      return (Deferred<T> s, Deferred<T> x) -> {
        final T prev = s.get();
        return x.andThen(in -> prev == null ? in : op.apply(prev, in));
      };
    });
  }

  /**
   * Create a streamlet that reduces its inputs with a binary operator. The operator can be modified by the value of an
   * auxiliary input channel.
   *
   * @param reduceOp       The operator.
   * @param modePersister  Persistence for the mode value.
   * @param statePersister Persistence for the state value.
   * @param <T>            The type of the inputs.
   * @param <Mode>         The type of the control input.
   * @return The streamlet.
   */
  public static <T, Mode> ModalStatefulStreamlet<T, Mode, T> modalReduce(
      final ValuePersister<Mode> modePersister,
      final ValuePersister<T> statePersister,
      final Function<Mode, BinaryOperator<T>> reduceOp) {
    return new ModalStatefulStreamlet<>(modePersister, statePersister,
        m -> (s, t) -> s == null ? t : reduceOp.apply(m).apply(s, t));
  }

  /**
   * Create a streamlet that performs a fold over the values for each key of its inputs. The fold operation can be
   * modified by the value of an auxiliary input channel.
   *
   * @param initial  The initial value of the state.
   * @param initMode The initial value of the mode.
   * @param foldOp   The fold operation.
   * @param <Key>    The type of the keys.
   * @param <Val>    The input value type.
   * @param <State>  The state/output type.
   * @param <Mode>   The type of the control input.
   * @return The streamlet.
   */
  public static <Key, Val, State, Mode> TransientModalStatefulMapStreamlet<Key, Val, Mode, State> modalFoldMap(
      final Mode initMode,
      final State initial,
      final Function<Mode, BiFunction<State, Val, State>> foldOp) {
    return new TransientModalStatefulMapStreamlet<>(initMode, Deferred.value(initial), (Mode m) -> {
      final BiFunction<State, Val, State> op = foldOp.apply(m);
      return (Deferred<State> s, Deferred<Val> x) -> {
        final State prev = s.get();
        return x.andThen(in -> op.apply(prev, in));
      };
    });
  }

  /**
   * Create a streamlet that performs a fold over the values for each key of its inputs. The fold operation can be
   * modified by the value of an auxiliary input channel.
   *
   * @param modePersister  Persistence for the mode value.
   * @param statePersister Persistence for the state value.
   * @param foldOp         The fold operation.
   * @param <Key>          The type of the keys.
   * @param <Val>          The input value type.
   * @param <State>        The state/output type.
   * @param <Mode>         The type of the control input.
   * @return The streamlet.
   */
  public static <Key, Val, State, Mode> ModalStatefulMapStreamlet<Key, Val, Mode, State> modalFoldMap(
      final ValuePersister<Mode> modePersister,
      final MapPersister<Key, State> statePersister,
      final Function<Mode, BiFunction<State, Val, State>> foldOp) {
    return new ModalStatefulMapStreamlet<>(modePersister, statePersister, foldOp);
  }

  /**
   * Create a streamlet that reduces its inputs, for each key, with a binary operator. The operator can be modified by
   * the value of an auxiliary input channel.
   *
   * @param reduceOp The operator.
   * @param initMode The initial value of the mode.
   * @param <Key>    The type of the keys.
   * @param <Val>    The input value type.
   * @return The streamlet.
   */
  public static <Key, Val, Mode> TransientModalStatefulMapStreamlet<Key, Val, Mode, Val> modalReduceMap(
      final Mode initMode,
      final Function<Mode, BinaryOperator<Val>> reduceOp) {
    return new TransientModalStatefulMapStreamlet<>(initMode, Deferred.value(null), (Mode m) -> {
      final BinaryOperator<Val> op = reduceOp.apply(m);
      return (Deferred<Val> s, Deferred<Val> x) -> {
        final Val prev = s.get();
        return x.andThen(in -> prev == null ? in : op.apply(prev, in));
      };
    });
  }

  /**
   * Create a streamlet that reduces its inputs, for each key, with a binary operator. The operator can be modified by
   * the value of an auxiliary input channel.
   *
   * @param reduceOp       The operator.
   * @param modePersister  Persistence for the mode value.
   * @param statePersister Persistence for the state value.
   * @param <Key>          The type of the keys.
   * @param <Val>          The input value type.
   * @return The streamlet.
   */
  public static <Key, Val, Mode> ModalStatefulMapStreamlet<Key, Val, Mode, Val> modalReduceMap(
      final ValuePersister<Mode> modePersister,
      final MapPersister<Key, Val> statePersister,
      final Function<Mode, BinaryOperator<Val>> reduceOp) {
    return new ModalStatefulMapStreamlet<>(modePersister, statePersister,
        m -> (s, t) -> s == null ? t : reduceOp.apply(m).apply(s, t));
  }

}
