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

package swim.dataflow.connector;

import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import swim.dataflow.graph.persistence.MapPersister;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.util.Deferred;

/**
 * Utility methods to create common stateful conduits.
 */
public final class StatefulConduits {

  private StatefulConduits() {
  }

  /**
   * Create a conduit that performs a fold over it's inputs.
   *
   * @param initial The initial value of the state.
   * @param foldOp  The fold operation.
   * @param <In>    The input type.
   * @param <State> The state/output type.
   * @return The conduit.
   */
  public static <In, State> TransientStatefulConduit<In, State> fold(final State initial,
                                                                     final BiFunction<State, In, State> foldOp) {
    return new TransientStatefulConduit<>(Deferred.value(initial), (s, x) -> {
      final State prev = s.get();
      return x.andThen(in -> foldOp.apply(prev, in));
    });
  }

  /**
   * Create a conduit that performs a fold over it's inputs.
   *
   * @param foldOp  The fold operation.
   * @param <In>    The input type.
   * @param <State> The state/output type.
   * @return The conduit.
   */
  public static <In, State> StatefulConduit<In, State> foldPersistent(final ValuePersister<State> persister,
                                                                      final BiFunction<State, In, State> foldOp) {
    return new StatefulConduit<>(persister, foldOp);
  }

  /**
   * Create a conduit that performs a fold over the values for each key of its inputs.
   *
   * @param initial The initial value of the state.
   * @param foldOp  The fold operation.
   * @param <Key>   The type of the keys.
   * @param <In>    The input type.
   * @param <State> The state/output type.
   * @return The conduit.
   */
  public static <Key, In, State> TransientStatefulMapConduit<Key, In, State> foldMap(final State initial,
                                                                                     final BiFunction<State, In, State> foldOp) {
    return new TransientStatefulMapConduit<>(Deferred.value(initial), (s, x) -> {
      final State prev = s.get();
      return x.andThen(in -> foldOp.apply(prev, in));
    });
  }

  /**
   * Create a conduit that performs a fold over the values for each key of its inputs.
   *
   * @param persister Persister for the map state.
   * @param foldOp    The fold operation.
   * @param <Key>     The type of the keys.
   * @param <In>      The input type.
   * @param <State>   The state/output type.
   * @return The conduit.
   */
  public static <Key, In, State> StatefulMapConduit<Key, In, State> foldMapPersistent(final MapPersister<Key, State> persister,
                                                                                      final BiFunction<State, In, State> foldOp) {
    return new StatefulMapConduit<>(persister, foldOp);
  }

  /**
   * Create a conduit that reduces its inputs with a binary operator.
   *
   * @param op  The operator.
   * @param <T> The type of the inputs.
   * @return The conduit.
   */
  public static <T> TransientStatefulConduit<T, T> reduce(final BinaryOperator<T> op) {
    return new TransientStatefulConduit<>(Deferred.value(null), (s, x) -> {
      final T prev = s.get();
      return x.andThen(in -> prev == null ? in : op.apply(prev, in));
    });
  }

  /**
   * Create a conduit that reduces its inputs with a binary operator.
   *
   * @param op  The operator.
   * @param <T> The type of the inputs.
   * @return The conduit.
   */
  public static <T> StatefulConduit<T, T> reduce(final ValuePersister<T> persister,
                                                 final BinaryOperator<T> op) {
    return new StatefulConduit<>(persister, (s, x) -> s == null ? x : op.apply(s, x));
  }

  /**
   * Create a conduit that reduces its inputs, for each key, with a binary operator.
   *
   * @param op    The operator.
   * @param <Key> The type of the keys.
   * @param <T>   The type of the inputs.
   * @return The conduit.
   */
  public static <Key, T> TransientStatefulMapConduit<Key, T, T> reduceMap(final BinaryOperator<T> op) {
    return new TransientStatefulMapConduit<>(Deferred.value(null), (s, x) -> {
      final T prev = s.get();
      return x.andThen(in -> prev == null ? in : op.apply(prev, in));
    });
  }

  /**
   * Create a conduit that reduces its inputs, for each key, with a binary operator.
   *
   * @param op    The operator.
   * @param <Key> The type of the keys.
   * @param <T>   The type of the inputs.
   * @return The conduit.
   */
  public static <Key, T> StatefulMapConduit<Key, T, T> reduceMap(
      final MapPersister<Key, T> persister,
      final BinaryOperator<T> op) {
    return new StatefulMapConduit<>(persister, (s, x) -> s == null ? x : op.apply(s, x));
  }

  /**
   * Create a conduit that performs a fold over it's inputs. The fold operation can be modified by the value of an
   * auxiliary input channel.
   *
   * @param initial  The initial value of the state.
   * @param foldOp   The fold operation.
   * @param initMode The initial value of the mode.
   * @param <In>     The input type.
   * @param <State>  The state/output type.
   * @param <Mode>   The type of the control input.
   * @return The conduit.
   */
  public static <In, State, Mode> TransientModalStatefulConduit<In, Mode, State> modalFold(
      final Mode initMode,
      final State initial,
      final Function<Mode, BiFunction<State, In, State>> foldOp) {
    return new TransientModalStatefulConduit<>(initMode, Deferred.value(initial), (Mode m) -> {
      final BiFunction<State, In, State> op = foldOp.apply(m);
      return (Deferred<State> s, Deferred<In> x) -> {
        final State prev = s.get();
        return x.andThen(in -> op.apply(prev, in));
      };
    });
  }

  /**
   * Create a conduit that performs a fold over it's inputs. The fold operation can be modified by the value of an
   * auxiliary input channel.
   *
   * @param modePersister  Persistence for the mode value.
   * @param foldOp         The fold operation.
   * @param statePersister Persistence for the state value.
   * @param <In>           The input type.
   * @param <State>        The state/output type.
   * @param <Mode>         The type of the control input.
   * @return The conduit.
   */
  public static <In, State, Mode> ModalStatefulConduit<In, Mode, State> modalFold(
      final ValuePersister<Mode> modePersister,
      final ValuePersister<State> statePersister,
      final Function<Mode, BiFunction<State, In, State>> foldOp) {
    return new ModalStatefulConduit<>(modePersister, statePersister, foldOp);
  }

  /**
   * Create a conduit that reduces its inputs with a binary operator. The operator can be modified by the value of an
   * auxiliary input channel.
   *
   * @param reduceOp The operator.
   * @param initMode The initial value of the mode.
   * @param <T>      The type of the inputs.
   * @param <Mode>   The type of the control input.
   * @return The conduit.
   */
  public static <T, Mode> TransientModalStatefulConduit<T, Mode, T> modalReduce(
      final Mode initMode,
      final Function<Mode, BinaryOperator<T>> reduceOp) {
    return new TransientModalStatefulConduit<>(initMode, Deferred.value(null), (Mode m) -> {
      final BinaryOperator<T> op = reduceOp.apply(m);
      return (Deferred<T> s, Deferred<T> x) -> {
        final T prev = s.get();
        return x.andThen(in -> prev == null ? in : op.apply(prev, in));
      };
    });
  }

  /**
   * Create a conduit that reduces its inputs with a binary operator. The operator can be modified by the value of an
   * auxiliary input channel.
   *
   * @param reduceOp       The operator.
   * @param modePersister  Persistence for the mode value.
   * @param statePersister Persistence for the state value.
   * @param <T>            The type of the inputs.
   * @param <Mode>         The type of the control input.
   * @return The conduit.
   */
  public static <T, Mode> ModalStatefulConduit<T, Mode, T> modalReduce(
      final ValuePersister<Mode> modePersister,
      final ValuePersister<T> statePersister,
      final Function<Mode, BinaryOperator<T>> reduceOp) {
    return new ModalStatefulConduit<>(modePersister, statePersister,
        m -> (s, t) -> s == null ? t : reduceOp.apply(m).apply(s, t));
  }

  /**
   * Create a conduit that performs a fold over the values for each key of its inputs. The fold operation can be
   * modified by the value of an auxiliary input channel.
   *
   * @param initial  The initial value of the state.
   * @param initMode The initial value of the mode.
   * @param foldOp   The fold operation.
   * @param <Key>    The type of the keys.
   * @param <Val>    The input value type.
   * @param <State>  The state/output type.
   * @param <Mode>   The type of the control input.
   * @return The conduit.
   */
  public static <Key, Val, State, Mode> TransientModalStatefulMapConduit<Key, Val, Mode, State> modalFoldMap(
      final Mode initMode,
      final State initial,
      final Function<Mode, BiFunction<State, Val, State>> foldOp) {
    return new TransientModalStatefulMapConduit<>(initMode, Deferred.value(initial), (Mode m) -> {
      final BiFunction<State, Val, State> op = foldOp.apply(m);
      return (Deferred<State> s, Deferred<Val> x) -> {
        final State prev = s.get();
        return x.andThen(in -> op.apply(prev, in));
      };
    });
  }

  /**
   * Create a conduit that performs a fold over the values for each key of its inputs. The fold operation can be
   * modified by the value of an auxiliary input channel.
   *
   * @param modePersister  Persistence for the mode value.
   * @param statePersister Persistence for the state value.
   * @param foldOp         The fold operation.
   * @param <Key>          The type of the keys.
   * @param <Val>          The input value type.
   * @param <State>        The state/output type.
   * @param <Mode>         The type of the control input.
   * @return The conduit.
   */
  public static <Key, Val, State, Mode> ModalStatefulMapConduit<Key, Val, Mode, State> modalFoldMap(
      final ValuePersister<Mode> modePersister,
      final MapPersister<Key, State> statePersister,
      final Function<Mode, BiFunction<State, Val, State>> foldOp) {
    return new ModalStatefulMapConduit<>(modePersister, statePersister, foldOp);
  }

  /**
   * Create a conduit that reduces its inputs, for each key, with a binary operator. The operator can be modified by
   * the value of an auxiliary input channel.
   *
   * @param reduceOp The operator.
   * @param initMode The initial value of the mode.
   * @param <Key>    The type of the keys.
   * @param <Val>    The input value type.
   * @return The conduit.
   */
  public static <Key, Val, Mode> TransientModalStatefulMapConduit<Key, Val, Mode, Val> modalReduceMap(
      final Mode initMode,
      final Function<Mode, BinaryOperator<Val>> reduceOp) {
    return new TransientModalStatefulMapConduit<>(initMode, Deferred.value(null), (Mode m) -> {
      final BinaryOperator<Val> op = reduceOp.apply(m);
      return (Deferred<Val> s, Deferred<Val> x) -> {
        final Val prev = s.get();
        return x.andThen(in -> prev == null ? in : op.apply(prev, in));
      };
    });
  }

  /**
   * Create a conduit that reduces its inputs, for each key, with a binary operator. The operator can be modified by
   * the value of an auxiliary input channel.
   *
   * @param reduceOp       The operator.
   * @param modePersister  Persistence for the mode value.
   * @param statePersister Persistence for the state value.
   * @param <Key>          The type of the keys.
   * @param <Val>          The input value type.
   * @return The conduit.
   */
  public static <Key, Val, Mode> ModalStatefulMapConduit<Key, Val, Mode, Val> modalReduceMap(
      final ValuePersister<Mode> modePersister,
      final MapPersister<Key, Val> statePersister,
      final Function<Mode, BinaryOperator<Val>> reduceOp) {
    return new ModalStatefulMapConduit<>(modePersister, statePersister,
        m -> (s, t) -> s == null ? t : reduceOp.apply(m).apply(s, t));
  }

}
