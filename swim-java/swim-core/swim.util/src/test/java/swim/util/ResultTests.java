// Copyright 2015-2022 Swim.inc
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

package swim.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ResultTests {

  @Test
  public void emptySameAsNull() {
    assertSame(Result.empty(), Result.ok(null));
  }

  @Test
  public void emptyIsOk() {
    final Result<String> result = Result.empty();
    assertTrue(result.isOk());
  }

  @Test
  public void okIsOk() {
    final Result<String> result = Result.ok("foo");
    assertTrue(result.isOk());
  }

  @Test
  public void errorIsNotOk() {
    final Result<String> result = Result.error(new RuntimeException());
    assertFalse(result.isOk());
  }

  @Test
  public void emptyIsNotError() {
    final Result<String> result = Result.empty();
    assertFalse(result.isError());
  }

  @Test
  public void okIsNotError() {
    final Result<String> result = Result.ok("foo");
    assertFalse(result.isError());
  }

  @Test
  public void errorIsError() {
    final Result<String> result = Result.error(new RuntimeException());
    assertTrue(result.isError());
  }

  @Test
  public void emptyGetReturnsNull() {
    final Result<String> result = Result.empty();
    assertNull(result.get());
  }

  @Test
  public void okGetReturnsValue() {
    final Result<String> result = Result.ok("foo");
    assertEquals("foo", result.get());
  }

  @Test
  public void errorGetThrows() {
    final Result<String> result = Result.error(new RuntimeException());
    assertThrows(IllegalStateException.class, () -> result.get());
  }

  @Test
  public void emptyGetErrorThrows() {
    final Result<String> result = Result.empty();
    assertThrows(IllegalStateException.class, () -> result.getError());
  }

  @Test
  public void okGetErrorThrows() {
    final Result<String> result = Result.ok("foo");
    assertThrows(IllegalStateException.class, () -> result.getError());
  }

  @Test
  public void errorGetErrorReturnsError() {
    final RuntimeException exception = new RuntimeException();
    final Result<String> result = Result.error(exception);
    assertSame(exception, result.getError());
  }

  @Test
  public void okGetOrReturnsValue() {
    final Result<String> result = Result.ok("foo");
    assertEquals("foo", result.getOr("bar"));
  }

  @Test
  public void errorGetOrReturnsOther() {
    final Result<String> result = Result.error(new RuntimeException());
    assertEquals("bar", result.getOr("bar"));
  }

  @Test
  public void okGetOrElseReturnsValue() {
    final Result<String> result = Result.ok("foo");
    assertEquals("foo", result.getOrElse(() -> "bar"));
  }

  @Test
  public void errorGetOrElseReturnsOther() {
    final Result<String> result = Result.error(new RuntimeException());
    assertEquals("bar", result.getOrElse(() -> "bar"));
  }

  @Test
  public void emptyContainsNullIsTrue() {
    final Result<String> result = Result.empty();
    assertTrue(result.contains(null));
  }

  @Test
  public void emptyContainsOtherValueIsFalse() {
    final Result<String> result = Result.empty();
    assertFalse(result.contains("foo"));
  }

  @Test
  public void okContainsValueIsTrue() {
    final Result<String> result = Result.ok("foo");
    assertTrue(result.contains("foo"));
  }

  @Test
  public void okContainOtherValueIsFalse() {
    final Result<String> result = Result.ok("foo");
    assertFalse(result.contains("bar"));
  }

  @Test
  public void okContainsNullIsFalse() {
    final Result<String> result = Result.ok("foo");
    assertFalse(result.contains(null));
  }

  @Test
  public void errorContainsErrorIsFalse() {
    final RuntimeException exception = new RuntimeException();
    final Result<String> result = Result.error(exception);
    assertFalse(result.contains(exception));
  }

  @Test
  public void errorContainValueIsFalse() {
    final Result<String> result = Result.error(new RuntimeException());
    assertFalse(result.contains("foo"));
  }

  @Test
  public void errorContainsNullIsFalse() {
    final Result<String> result = Result.error(new RuntimeException());
    assertFalse(result.contains(null));
  }

  @Test
  public void okMapToOk() {
    final Result<Integer> result = Result.ok(1);
    assertEquals(Result.ok("1"), result.map(value -> value.toString()));
  }

  @Test
  public void okMapNonFatalThrowsToError() {
    final RuntimeException exception = new RuntimeException();
    final Result<Integer> result = Result.ok(1);
    assertEquals(Result.error(exception), result.map(value -> {
      throw exception;
    }));
  }

  @Test
  public void okMapFatalThrowsPropagate() {
    final UnknownError exception = new UnknownError() { };
    final Result<Integer> result = Result.ok(1);
    assertThrows(exception.getClass(), () -> result.map(value -> {
      throw exception;
    }));
  }

  @Test
  public void errorMapToSelf() {
    final Result<Integer> result = Result.error(new RuntimeException());
    assertSame(result, result.map(value -> value.toString()));
  }

  @Test
  public void okFlatMapToOk() {
    final Result<Integer> result = Result.ok(1);
    final Result<String> ok = Result.ok("1");
    assertEquals(ok, result.flatMap(value -> ok));
  }

  @Test
  public void okFlatMapToError() {
    final Result<Integer> result = Result.ok(1);
    final Result<String> error = Result.error(new RuntimeException());
    assertEquals(error, result.flatMap(value -> error));
  }

  @Test
  public void okFlatMapNonFatalThrowsToError() {
    final RuntimeException error = new RuntimeException();
    final Result<Integer> result = Result.ok(1);
    assertEquals(Result.error(error), result.flatMap(value -> {
      throw error;
    }));
  }

  @Test
  public void okFlatMapFatalThrowsPropagate() {
    final UnknownError error = new UnknownError() { };
    final Result<Integer> result = Result.ok(1);
    assertThrows(error.getClass(), () -> result.flatMap(value -> {
      throw error;
    }));
  }

  @Test
  public void errorFlatMapToSelf() {
    final Result<Integer> result = Result.error(new RuntimeException());
    assertSame(result, result.flatMap(value -> Result.ok(value.toString())));
  }

  @Test
  public void okMapErrorToSelf() {
    final Result<String> result = Result.ok("foo");
    assertSame(result, result.mapError(error -> error));
  }

  @Test
  public void errorMapErrorToError() {
    final RuntimeException error = new RuntimeException();
    final Result<String> result = Result.error(error);
    final RuntimeException newError = new RuntimeException(error);
    assertEquals(Result.error(newError), result.mapError(oldError -> newError));
  }

  @Test
  public void errorMapErrorNonFatalThrowsToError() {
    final RuntimeException error = new RuntimeException();
    final Result<Integer> result = Result.error(new RuntimeException());
    assertEquals(Result.error(error), result.mapError(value -> {
      throw error;
    }));
  }

  @Test
  public void errorMapErrorFatalThrowsPropagate() {
    final UnknownError error = new UnknownError() { };
    final Result<Integer> result = Result.error(new RuntimeException());
    assertThrows(error.getClass(), () -> result.mapError(value -> {
      throw error;
    }));
  }

  @Test
  public void okRecoverToSelf() {
    final Result<String> result = Result.ok("foo");
    assertSame(result, result.recover(error -> "bar"));
  }

  @Test
  public void errorRecoverToOk() {
    final Result<String> result = Result.error(new RuntimeException());
    assertEquals(Result.ok("foo"), result.recover(error -> "foo"));
  }

  @Test
  public void errorRecoverNonFatalThrowsToError() {
    final RuntimeException error = new RuntimeException();
    final Result<Integer> result = Result.error(new RuntimeException());
    assertEquals(Result.error(error), result.recover(value -> {
      throw error;
    }));
  }

  @Test
  public void errorRecoverFatalThrowsPropagate() {
    final UnknownError error = new UnknownError() { };
    final Result<Integer> result = Result.error(new RuntimeException());
    assertThrows(error.getClass(), () -> result.recover(value -> {
      throw error;
    }));
  }

  @Test
  public void okRecoverWithToSelf() {
    final Result<String> result = Result.ok("foo");
    assertSame(result, result.recoverWith(error -> Result.ok("bar")));
  }

  @Test
  public void errorRecoverWithOk() {
    final Result<String> result = Result.error(new RuntimeException());
    final Result<String> ok = Result.ok("foo");
    assertSame(ok, result.recoverWith(error -> ok));
  }

  @Test
  public void errorRecoverWithError() {
    final Result<String> result = Result.error(new RuntimeException());
    final Result<String> error = Result.error(new RuntimeException());
    assertSame(error, result.recoverWith(e -> error));
  }

  @Test
  public void errorRecoverWithNonFatalThrowsToError() {
    final RuntimeException error = new RuntimeException();
    final Result<Integer> result = Result.error(new RuntimeException());
    assertEquals(Result.error(error), result.recoverWith(value -> {
      throw error;
    }));
  }

  @Test
  public void errorRecoverWithFatalThrowsPropagate() {
    final UnknownError error = new UnknownError() { };
    final Result<Integer> result = Result.error(new RuntimeException());
    assertThrows(error.getClass(), () -> result.recoverWith(value -> {
      throw error;
    }));
  }

  @Test
  public void okOrOkReturnsSelf() {
    final Result<String> result = Result.ok("foo");
    assertSame(result, result.or(Result.ok("bar")));
  }

  @Test
  public void okOrErrorReturnsSelf() {
    final Result<String> result = Result.ok("foo");
    assertSame(result, result.or(Result.error(new RuntimeException())));
  }

  @Test
  public void errorOrOkReturnsOk() {
    final Result<String> result = Result.error(new RuntimeException());
    final Result<String> ok = Result.ok("bar");
    assertSame(ok, result.or(ok));
  }

  @Test
  public void errorOrErrorReturnsFaulre() {
    final Result<String> result = Result.error(new RuntimeException());
    final Result<String> error = Result.error(new RuntimeException());
    assertSame(error, result.or(error));
  }

  @Test
  public void okOrElseOkReturnsSelf() {
    final Result<String> result = Result.ok("foo");
    assertSame(result, result.orElse(() -> Result.ok("bar")));
  }

  @Test
  public void okOrElseErrorReturnsSelf() {
    final Result<String> result = Result.ok("foo");
    assertSame(result, result.orElse(() -> Result.error(new RuntimeException())));
  }

  @Test
  public void errorOrElseOkReturnsOk() {
    final Result<String> result = Result.error(new RuntimeException());
    final Result<String> ok = Result.ok("bar");
    assertSame(ok, result.orElse(() -> ok));
  }

  @Test
  public void errorOrElseErrorReturnsFaulre() {
    final Result<String> result = Result.error(new RuntimeException());
    final Result<String> error = Result.error(new RuntimeException());
    assertSame(error, result.orElse(() -> error));
  }

  @Test
  public void errorOrElseNonFatalThrowsReturnsError() {
    final RuntimeException error = new RuntimeException();
    final Result<Integer> result = Result.error(new RuntimeException());
    assertEquals(Result.error(error), result.orElse(() -> {
      throw error;
    }));
  }

  @Test
  public void errorOrElseFatalThrowsPropagate() {
    final UnknownError error = new UnknownError() { };
    final Result<Integer> result = Result.error(new RuntimeException());
    assertThrows(error.getClass(), () -> result.orElse(() -> {
      throw error;
    }));
  }

  @Test
  public void okAsErrorIsError() {
    final Result<String> result = Result.ok("foo");
    assertInstanceOf(IllegalStateException.class, result.asError().getError());
  }

  @Test
  public void errorAsErrorIsSelf() {
    final Result<String> result = Result.error(new RuntimeException());
    assertSame(result, result.asError());
  }

  @Test
  public void resultOfOk() {
    assertEquals(Result.ok("foo"), Result.of(() -> "foo"));
  }

  @Test
  public void resultOfError() {
    final RuntimeException error = new RuntimeException();
    assertEquals(Result.error(error), Result.of(() -> {
      throw error;
    }));
  }

}
