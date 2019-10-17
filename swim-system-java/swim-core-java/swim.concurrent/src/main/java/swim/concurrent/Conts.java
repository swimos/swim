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

package swim.concurrent;

/**
 * Factory functions for {@link Cont}inuation combinators.
 */
public final class Conts {
  private Conts() {
  }

  private static Cont<Object> ignore;

  /**
   * Returns a {@code Runnable} that, when executed, invokes the given {@code
   * cont}inuation with the provided constant {@code value}.
   */
  public static <T> Runnable async(Cont<T> cont, T value) {
    return new ConstantCont<Object, T>(cont, value);
  }

  /**
   * Returns a {@code Cont}inuation that, when completed successfully,
   * completes the given {@code cont}inuation with the provided constant {@code
   * value}; and when failed with an error, fails the given {@code cont}inuation
   * with the error.
   */
  public static <X, T> Cont<X> constant(Cont<T> cont, T value) {
    return new ConstantCont<X, T>(cont, value);
  }

  /**
   * Returns a {@code Cont} continuation that, when completed successfully,
   * does nothing; and when failed with an exception, throws the exception.
   */
  @SuppressWarnings("unchecked")
  public static <T> Cont<T> ignore() {
    if (ignore == null) {
      ignore = new IgnoreCont<Object>();
    }
    return (Cont<T>) ignore;
  }

  /**
   * Returns {@code true} if {@code throwable} is a recoverable exception;
   * returns {@code false} if {@code throwable} cannot be recovered from.
   */
  public static boolean isNonFatal(Throwable throwable) {
    return !(throwable instanceof InterruptedException
          || throwable instanceof LinkageError
          || throwable instanceof ThreadDeath
          || throwable instanceof VirtualMachineError && !(throwable instanceof StackOverflowError));
  }
}

final class ConstantCont<X, T> implements Cont<X>, Runnable {
  private final Cont<T> cont;
  private final T value;

  ConstantCont(Cont<T> cont, T value) {
    this.cont = cont;
    this.value = value;
  }

  @Override
  public void run() {
    try {
      this.cont.bind(this.value);
    } catch (Throwable error) {
      this.cont.trap(error);
    }
  }

  @Override
  public void bind(X object) {
    try {
      this.cont.bind(this.value);
    } catch (Throwable error) {
      this.cont.trap(error);
    }
  }

  @Override
  public void trap(Throwable error) {
    this.cont.trap(error);
  }
}

final class IgnoreCont<T> implements Cont<T> {
  @Override
  public void bind(T value) {
    // nop
  }

  @Override
  public void trap(Throwable error) {
    if (error instanceof Error) {
      throw (Error) error;
    } else if (error instanceof RuntimeException) {
      throw (RuntimeException) error;
    } else {
      throw new ContException(error);
    }
  }
}
